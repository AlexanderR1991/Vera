import assert from "node:assert/strict";
import { readFile, rm } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { budget, settings, conditions, validateCases, validateReferences, createPlan, assertPlanUnchanged, loadRunCases, shuffledSchedule, runEvaluation, responseAttempt, reviewMaterials, scoreRatings, createRunWriter, sha256 } from "../evals/evaluation.mjs";
import { parseArguments } from "../evals/cli.mjs";
import { readOllamaIdentity, compareIdentitySnapshots } from "../evals/model-identity.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const dev = JSON.parse(await readFile(new URL("../evals/cases/dev.v1.json", import.meta.url)));
const reference = JSON.parse(await readFile(new URL("../evals/references/dev.v1.json", import.meta.url)));
const makePlan = () => ({ schema_version: 1, protocol: "P-02-transfer-exploratory-v1", split: "dev", seed: 42, model: { requested: "mock" },
  prompts: { T0: "NEUTRAL", T1: "NEUTRAL\nCHECKLIST", T2: "NEUTRAL\nVERA_CONTEXT" }, settings: { ...settings, seed: 42 }, budget: { ...budget },
  schedule: shuffledSchedule(4, 42), review_rules: { primary: ["status_correct", "evidence_correct", "reason_correct"] }, limitations: ["Synthetic contract test only"] });
const reply = () => ({ message: { role: "assistant", content: "A synthetic test answer." }, usage: { inputTokens: 20, outputTokens: 5 }, finishReason: "stop", model: { model: "mock" } });
const adapter = overrides => ({ identity: { model: "mock" }, generate: async () => reply(), ...overrides });
const ratingFields = ["status_correct", "evidence_correct", "reason_correct", "followup_correct", "fabricated_decisive_source", "ignored_refusal", "usurped_decision"];

test("Case inputs reject reference fields; DEV references remain a separate validated package", () => {
  assert.equal(validateCases(dev), dev);
  assert.equal(validateReferences(reference, dev), reference);
  const leaked = structuredClone(dev);
  leaked.cases[0].initial_status = "confirmed";
  assert.throws(() => validateCases(leaked), /reference answers/);
  const quota = structuredClone(dev);
  quota.cases[0].followup_type = "refusal";
  assert.throws(() => validateCases(quota), /quotas/);
});

test("T0/T1/T2 use identical cases and settings with fresh two-turn sessions and no reference leakage", async () => {
  const plan = makePlan(), requests = [];
  const result = await runEvaluation({ plan, pack: dev, adapter: adapter({ generate: async request => { requests.push(structuredClone(request)); return reply(); } }) });
  assert.equal(result.runs.length, 12);
  assert.equal(requests.length, 26); // Two DEV preflight answers, then 12 independent pairs.
  assert.equal(result.status, "completed_unscored");
  for (const [index, request] of requests.entries()) {
    assert.deepEqual(request.options, plan.settings);
    assert.equal(request.tools, undefined);
    assert.equal(request.messages.length, index % 2 === 0 ? 2 : 4);
    assert.equal(request.messages[0].role, "system");
    if (index % 2 === 1) assert.equal(request.messages[3].role, "user");
    assert.ok(!JSON.stringify(request).includes(reference.cases[0].followup_expectation));
  }
  for (const item of dev.cases) for (const condition of conditions) {
    const run = result.runs.find(r => r.case_id === item.id && r.condition === condition);
    assert.ok(run);
    assert.equal(run.responses[0].request.messages.at(-1).content.includes(item.followup), false);
    assert.equal(run.responses[1].request.messages.at(-1).content, item.followup);
    assert.equal(run.responses[0].complete_input_verified, false);
  }
  assert.equal(result.efficacy_claim, false);
});

test("Budget failures preserve raw available inference metadata and reject incomplete alternate-adapter replies", async () => {
  const input = { messages: [{ role: "user", content: "Test" }], options: settings };
  const raw = { ...reply(), finishReason: "length" };
  const failed = await responseAttempt({ ...input, adapter: adapter({ generate: async () => { throw Object.assign(new Error("truncated"), { inference: raw }); } }) });
  assert.equal(failed.status, "failed");
  assert.deepEqual(failed.response, raw);
  assert.equal((await responseAttempt({ ...input, adapter: adapter({ generate: async () => raw }) })).error.code, "incomplete_response");
  assert.equal((await responseAttempt({ ...input, adapter: adapter({ generate: async () => ({ ...reply(), usage: null }) }) })).error.code, "token_budget_unverified");
  assert.equal((await responseAttempt({ ...input, adapter: adapter({ generate: async () => ({ ...reply(), usage: { inputTokens: budget.inputTokens + 1, outputTokens: 5 } }) }) })).error.code, "token_budget_exceeded");
});

test("Holdout requires exact input counting; a provider count cannot certify absence of truncation", async () => {
  const input = { messages: [{ role: "user", content: "Test" }], options: settings, requireInputCounter: true };
  let generated = 0;
  const model = adapter({ generate: async () => { generated++; return reply(); } });
  assert.equal((await responseAttempt({ ...input, adapter: model })).error.code, "input_counter_missing");
  assert.equal(generated, 0);
  model.countInputTokens = async () => ({ exact: true, inputTokens: 21 });
  assert.equal((await responseAttempt({ ...input, adapter: model })).error.code, "input_count_mismatch");
  model.countInputTokens = async () => ({ exact: true, inputTokens: 20 });
  assert.equal((await responseAttempt({ ...input, adapter: model })).complete_input_verified, true);
  model.countInputTokens = async () => ({ exact: true, inputTokens: 16385 });
  const before = generated;
  assert.equal((await responseAttempt({ ...input, adapter: model })).error.code, "input_token_budget_exceeded");
  assert.equal(generated, before);
});

test("Deadline and operator cancellation stop a response without fabricating an answer", async () => {
  const input = { messages: [{ role: "user", content: "Test" }], options: settings };
  let signal;
  const never = adapter({ generate: async request => { signal = request.signal; return new Promise(() => {}); } });
  assert.equal((await responseAttempt({ ...input, adapter: never, timeoutMs: 5 })).error.code, "deadline_exceeded");
  assert.equal(signal.aborted, true);
  const controller = new AbortController();
  const pending = responseAttempt({ ...input, adapter: never, signal: controller.signal });
  controller.abort();
  assert.equal((await pending).error.code, "interrupted");
  assert.equal(signal.aborted, true);
});

test("Pending external cases stay gated and frozen plans detect implementation/budget changes", async () => {
  const pending = await createPlan({ root, split: "holdout" });
  assert.equal(pending.status, "pending_external_cases");
  await assert.rejects(loadRunCases(pending, root), /pending_external_cases/);
  const plan = await createPlan({ root });
  await assertPlanUnchanged(plan, root);
  const changed = structuredClone(plan);
  changed.implementation_sha256 = {};
  await assert.rejects(assertPlanUnchanged(changed, root), /Implementation changed/);
  const changedBudget = structuredClone(plan);
  changedBudget.budget.outputTokens++;
  await assert.rejects(assertPlanUnchanged(changedBudget, root), /budget/);
  assert.deepEqual(shuffledSchedule(4, 42), shuffledSchedule(4, 42));
  assert.notDeepEqual(shuffledSchedule(4, 42), shuffledSchedule(4, 43));
});

test("Blinded packets use a private random key; absent ratings produce no pilot conclusion", async () => {
  const result = await runEvaluation({ plan: makePlan(), pack: dev, adapter: adapter() });
  const first = reviewMaterials(result), second = reviewMaterials(result);
  assert.notEqual(first.packet.items[0].review_id, second.packet.items[0].review_id);
  assert.equal(first.packet.items.some(item => "condition" in item || "system" in item || "private_salt" in item), false);
  const report = scoreRatings({ result, reference, ratings: first.ratings, reviewKey: first.key });
  assert.equal(report.status, "unscored_or_disputed");
  assert.equal(report.paired_count_differences, null);
  assert.equal(report.conclusion, "no_pilot_decision_incomplete_or_dev");
  assert.throws(() => scoreRatings({ result, reference, ratings: first.ratings, reviewKey: second.key }), /private review key/);
});

test("Even complete mock DEV ratings cannot establish an independent pilot result", async () => {
  const result = await runEvaluation({ plan: makePlan(), pack: dev, adapter: adapter() });
  const material = reviewMaterials(result);
  for (const row of material.ratings.ratings) {
    for (const field of ratingFields) row[field] = !["fabricated_decisive_source", "ignored_refusal", "usurped_decision"].includes(field);
    row.rationale = "Synthetic scoring test; no real human assessment.";
  }
  const report = scoreRatings({ result, reference, ratings: material.ratings, reviewKey: material.key });
  assert.equal(report.status, "human_ratings_summarized");
  assert.equal(report.conclusion, "no_pilot_decision_incomplete_or_dev");
  assert.equal(report.efficacy_claim, false);
  assert.equal(report.deployment_authorized, false);
  assert.equal(report.complete_input_verified, false);
});

test("Progress is retained per completed pair and interrupted runs stay incomplete", async t => {
  const directory = path.join(root, "work/evals", `test-progress-${randomBytes(6).toString("hex")}`);
  t.after(() => rm(directory, { recursive: true, force: true }));
  const plan = makePlan(), writer = await createRunWriter(root, directory, plan);
  const controller = new AbortController();
  const result = await runEvaluation({ plan, pack: dev, adapter: adapter(), signal: controller.signal,
    onProgress: async progress => { await writer.checkpoint(progress); if (progress.runs.length === 1) controller.abort(); } });
  await writer.finish(result);
  const progress = (await readFile(path.join(directory, "progress.jsonl"), "utf8")).trim().split("\n").map(JSON.parse);
  assert.equal(progress.length, 2);
  assert.equal(progress[0].event, "preflight_completed");
  assert.equal(progress[1].event, "pair_completed");
  assert.equal(result.status, "interrupted_unscored");
  assert.equal(JSON.parse(await readFile(path.join(directory, "run.json"), "utf8")).runs.length, 1);
});

test("Ollama identity snapshots compare actual endpoint digests and detect drift/mismatch", async () => {
  const digest = "a".repeat(64);
  const fetcher = async url => { assert.equal(url, "http://127.0.0.1:11434/api/tags"); return new Response(JSON.stringify({ models: [{ name: "mock:latest", digest }] })); };
  const before = await readOllamaIdentity({ model: "mock", expectedDigest: digest, fetcher });
  assert.equal(before.expected_digest_matched, true);
  assert.equal(compareIdentitySnapshots(before, { ...before }).stable, true);
  assert.equal(compareIdentitySnapshots(before, { ...before, artifact_digest: "b".repeat(64) }).stable, false);
  await assert.rejects(readOllamaIdentity({ model: "mock", expectedDigest: "b".repeat(64), fetcher }), /differs/);
  assert.equal(before.weights_independently_authenticated, false);
});

test("CLI rejects implicit inference, duplicate switches and missing option values", () => {
  assert.equal(parseArguments(["plan"]).command, "plan");
  assert.throws(() => parseArguments(["run", "model", "mock"]), /node evals/);
  assert.throws(() => parseArguments(["run", "--plan-file"]), /incomplete/);
  assert.throws(() => parseArguments(["plan", "--seed", "1", "--seed", "2"]), /duplicate/);
});
