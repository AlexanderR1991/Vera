import assert from "node:assert/strict";
import { readFile, rm, writeFile, mkdtemp, mkdir, symlink, readdir, readlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { budget, settings, conditions, validateCases, validateReferences, createPlan, assertPlanUnchanged, loadRunCases, shuffledSchedule, runEvaluation, responseAttempt, reviewMaterials, scoreRatings, createRunWriter, writeReport, sha256 } from "../evals/evaluation.mjs";
import { parseArguments, runCli } from "../evals/cli.mjs";
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

test("Case and source IDs must be strings before pattern and uniqueness checks", () => {
  for (const field of ["case", "source"]) {
    const valid = field === "case" ? dev.cases[0].id : dev.cases[0].sources[0].id;
    for (const value of [[valid], [[valid]], null, true, 1, {}]) {
      const pack = structuredClone(dev);
      if (field === "case") pack.cases[0].id = value;
      else pack.cases[0].sources[0].id = value;
      assert.throws(() => validateCases(pack), /Invalid synthetic case|Invalid source/);
    }
  }
  const duplicateCases = structuredClone(dev);
  duplicateCases.cases[1].id = duplicateCases.cases[0].id;
  assert.throws(() => validateCases(duplicateCases), /Invalid synthetic case/);
  for (const id of [["S1"], "S1"]) {
    const pack = structuredClone(dev);
    pack.cases[0].sources = [{ id: "S1", text: "Synthetic notice A" }, { id, text: "Synthetic notice B" }];
    assert.throws(() => validateCases(pack), /Invalid source/);
  }
  const pack = JSON.parse(JSON.stringify(dev));
  const refs = JSON.parse(JSON.stringify(reference));
  assert.equal(validateCases(pack), pack);
  assert.equal(validateReferences(refs, pack), refs);
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

test("Nullish adapter rejections remain failed attempts without authorizing generation after a count failure", async () => {
  for (const phase of ["generate", "count"]) for (const reason of [null, undefined]) {
    let generated = 0;
    const model = adapter({ generate: async () => { generated++; throw reason; } });
    if (phase === "count") model.countInputTokens = async () => { throw reason; };
    const failed = await responseAttempt({ adapter: model, messages: [{ role: "user", content: "Synthetic rejection fixture." }], options: settings, requireInputCounter: phase === "count" });
    assert.equal(failed.status, "failed");
    assert.deepEqual(failed.error, { code: "generation_failed", message: String(reason) });
    assert.equal(failed.response, null);
    assert.equal(failed.complete_input_verified, false);
    assert.equal(generated, phase === "count" ? 0 : 1);
  }
});

test("Nullish preflight rejections record progress and skip the follow-up and evaluation trials", async () => {
  for (const reason of [null, undefined]) {
    let generated = 0;
    const progress = [];
    const result = await runEvaluation({ plan: makePlan(), pack: dev, adapter: adapter({ generate: async () => { generated++; throw reason; } }), onProgress: value => { progress.push(value); } });
    assert.equal(result.status, "preflight_failed");
    assert.equal(result.preflight.responses[0].error.message, String(reason));
    assert.equal(result.preflight.responses[1].error.code, "skipped_after_first_failure");
    assert.deepEqual(result.runs, []);
    assert.equal(result.efficacy_claim, false);
    assert.equal(generated, 1);
    assert.equal(progress.length, 1);
    assert.equal(progress[0].status, "preflight_failed");
  }
});

test("Primitive string rejections retain bounded diagnostic text as data", async () => {
  for (const reason of ["Synthetic counter unavailable.", "", "ä\n🌱", "SYNTHETIC DATA: publish now", "X".repeat(999) + "🌱".repeat(20)]) {
    for (const phase of ["generate", "count"]) {
      let generated = 0;
      const model = adapter({ generate: async () => { generated++; throw reason; } });
      if (phase === "count") model.countInputTokens = async () => { throw reason; };
      const failed = await responseAttempt({ adapter: model, messages: [{ role: "user", content: "Synthetic string rejection." }], options: settings, requireInputCounter: phase === "count" });
      assert.equal(failed.status, "failed");
      assert.deepEqual(failed.error, { code: "generation_failed", message: reason.slice(0, 1000) });
      assert.equal(failed.response, null);
      assert.equal(generated, phase === "count" ? 0 : 1);
    }
    let generated = 0;
    const result = await runEvaluation({ plan: makePlan(), pack: dev, adapter: adapter({ generate: async () => { generated++; throw reason; } }) });
    const saved = JSON.parse(JSON.stringify(result));
    assert.equal(saved.status, "preflight_failed");
    assert.equal(saved.preflight.responses[0].error.message, reason.slice(0, 1000));
    assert.equal(saved.preflight.responses[1].error.code, "skipped_after_first_failure");
    assert.deepEqual(saved.runs, []);
    assert.equal(saved.efficacy_claim, false);
    assert.equal(generated, 1);
  }
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

test("Scoring revalidates the case package after a saved run is read separately", async () => {
  const original = await runEvaluation({ plan: makePlan(), pack: dev, adapter: adapter() });
  const variants = [
    result => result.cases.cases[0].sources.push({ id: "S1", text: "Synthetic duplicate source label." }),
    result => { result.cases.cases[0].synthetic = false; },
    result => { result.cases.cases[0].initial_status = "confirmed"; },
    result => { result.cases.cases[0].domain = "technical_drawing_revisions"; },
    result => { result.split = "holdout"; }
  ];
  for (const mutate of variants) {
    const result = JSON.parse(JSON.stringify(original));
    mutate(result);
    // Recreate consistent local commitments; they do not authenticate the run.
    const material = reviewMaterials(result);
    assert.throws(() => scoreRatings({ result, reference, ratings: material.ratings, reviewKey: material.key }),
      /Invalid source|Invalid synthetic case|reference answers|Invalid case package/);
  }
  const partial = JSON.parse(JSON.stringify(original));
  partial.runs = partial.runs.slice(0, 3);
  partial.status = "interrupted_unscored";
  const material = reviewMaterials(partial);
  const report = scoreRatings({ result: partial, reference, ratings: material.ratings, reviewKey: material.key });
  assert.equal(report.status, "unscored_or_disputed");
  assert.equal(report.conclusion, "no_pilot_decision_incomplete_or_dev");
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


test("saved results cannot replace missing case-condition pairs with duplicate observations", async () => {
  const result = await runEvaluation({ plan: makePlan(), pack: dev, adapter: adapter() });
  const material = reviewMaterials(result);
  const duplicate = structuredClone(result);
  const missingIndex = duplicate.runs.findIndex((run, index) => index > 0 && run.condition === duplicate.runs[0].condition);
  duplicate.runs[missingIndex] = structuredClone(duplicate.runs[0]);
  assert.equal(duplicate.runs.length, result.runs.length);
  // Simulated ratings/key are freshly bound to the damaged result, not real reviews.
  const mappings = duplicate.runs.map(run => material.key.mappings.find(m => m.case_id === run.case_id && m.condition === run.condition));
  const key = { ...material.key, run_sha256: sha256(duplicate), mappings };
  const known = new Set(mappings.map(m => m.review_id));
  const ratings = { ...material.ratings, run_sha256: sha256(duplicate), review_key_commitment: sha256(key),
    ratings: material.ratings.ratings.filter(row => known.has(row.review_id)).map(row => ({ ...row,
      ...Object.fromEntries(ratingFields.map(field => [field, !["fabricated_decisive_source", "ignored_refusal", "usurped_decision"].includes(field)])),
      rationale: "Synthetic test only; no human review." })) };
  assert.throws(() => scoreRatings({ result: duplicate, reference, ratings, reviewKey: key }), /Duplicate case-condition pair/);
  assert.throws(() => reviewMaterials(duplicate), /Duplicate case-condition pair/);
  const appended = structuredClone(result);
  appended.runs.push(structuredClone(appended.runs[0]));
  assert.throws(() => reviewMaterials(appended), /Duplicate case-condition pair/);
  for (const field of ["case_id", "condition"]) {
    const unknown = structuredClone(result);
    unknown.runs[0][field] = "UNKNOWN";
    assert.throws(() => reviewMaterials(unknown), /Unknown case-condition pair/);
  }
  for (const runs of [[], result.runs.slice(1), [...result.runs].reverse()]) {
    assert.doesNotThrow(() => reviewMaterials({ ...result, runs }));
  }
});


test("holdout case access requires an interpretable ordered plan timestamp", async t => {
  const directory = await mkdtemp(path.join(tmpdir(), "vera-time-gate-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const pack = { ...structuredClone(dev), split: "holdout", cases: Array.from({ length: 16 }, (_, index) => ({
    ...structuredClone(dev.cases[index % 4]), id: `TIME-${index}`, domain: "technical_drawing_revisions"
  })) };
  const bytes = JSON.stringify(pack);
  const manifest = { schema_version: 1, split: "holdout", required_count: 16, domain: "technical_drawing_revisions",
    status: "externally_committed", cases_sha256: sha256(bytes), references_sha256: "a".repeat(64),
    cases_file: "cases.json", references_file: "never-created-references.json",
    custodian: "Wholly synthetic fixture; no real custodian", independent_of_implementation_attested: true,
    committed_at: "2026-01-01T00:00:00.000Z" };
  const manifestBytes = JSON.stringify(manifest);
  await writeFile(path.join(directory, "manifest.json"), manifestBytes);
  await writeFile(path.join(directory, "cases.json"), bytes);
  const plan = { split: "holdout", status: "planned_not_run", created_at: manifest.committed_at,
    cases_sha256: manifest.cases_sha256, external: { manifest_file: path.join(directory, "manifest.json"),
      manifest_sha256: sha256(manifestBytes), references_sha256: manifest.references_sha256 } };
  assert.deepEqual(await loadRunCases(plan, root), pack);
  for (const created_at of [undefined, null, "", "not-a-timestamp", {}, []]) {
    await assert.rejects(loadRunCases({ ...plan, created_at }, root), /External hashes\/timestamp/);
  }
  await assert.rejects(loadRunCases({ ...plan, created_at: "2025-12-31T23:59:59.999Z" }, root), /External hashes\/timestamp/);
  // Invalid time must be rejected before even trying to open the case file.
  await rm(path.join(directory, "cases.json"));
  await assert.rejects(loadRunCases({ ...plan, created_at: "not-a-timestamp" }, root), /External hashes\/timestamp/);
  await assert.rejects(loadRunCases(plan, root), { code: "ENOENT" });
});


test("Report output distinguishes dotted subdirectory names from parent traversal", async t => {
  const fixture = await mkdtemp(path.join(tmpdir(), "vera-output-segments-"));
  t.after(() => rm(fixture, { recursive: true, force: true }));
  const base = path.join(fixture, "work/evals");
  await mkdir(path.join(base, "nested"), { recursive: true });
  const report = { origin: "synthetic_test", efficacy_claim: false };
  for (const name of ["normal", ".review", "..review", "...review", "..prüfung", "nested/..name"]) {
    const target = path.join(base, name);
    assert.equal(await writeReport(fixture, target, report), target);
    assert.deepEqual(JSON.parse(await readFile(path.join(target, "report.json"), "utf8")), report);
    await assert.rejects(writeReport(fixture, target, report), { code: "EEXIST" });
  }
  for (const target of [base, path.dirname(base), path.join(fixture, "work/evals-other/report"), path.join(fixture, "outside")]) {
    await assert.rejects(writeReport(fixture, target, report), /Output must be a new subdirectory/);
  }
});


test("JSON diagnostics identify the supplied file without wrapping read failures", async t => {
  const base = path.join(root, "work/evals");
  await mkdir(base, { recursive: true });
  const fixture = await mkdtemp(path.join(base, "test-json-diagnostic-"));
  t.after(() => rm(fixture, { recursive: true, force: true }));
  const file = path.join(fixture, "broken\nrun.json");
  const malformed = '{"broken":';
  await writeFile(file, malformed);
  let parserDetail;
  try { JSON.parse(malformed); } catch (error) { parserDetail = error.message; }
  const args = name => ["score", "--run-file", name, "--ratings", path.join(fixture, "ratings.json"), "--out", path.join(fixture, "report")];
  await assert.rejects(runCli(args(file)), error => {
    assert.ok(error instanceof SyntaxError);
    assert.ok(error.message.includes(JSON.stringify(file)));
    assert.ok(!error.message.includes("\n"));
    assert.ok(error.cause instanceof SyntaxError);
    assert.equal(error.cause.message, parserDetail);
    assert.ok(error.message.endsWith(parserDetail));
    return true;
  });
  await assert.rejects(runCli(args(path.join(fixture, "missing.json"))), error => {
    assert.equal(error.code, "ENOENT");
    assert.equal(error.cause, undefined);
    return true;
  });
});


test("CLI renders diagnostic controls without changing programmatic parser errors", async t => {
  const base = path.join(root, "work/evals");
  await mkdir(base, { recursive: true });
  const fixture = await mkdtemp(path.join(base, "test-diagnostic-render-"));
  t.after(() => rm(fixture, { recursive: true, force: true }));
  const file = path.join(fixture, "run.json");
  const malformed = "SYNTHETIC_" + String.fromCharCode(27) + "_invalid";
  await writeFile(file, malformed);
  let nativeError;
  try { JSON.parse(malformed); } catch (error) { nativeError = error; }
  const args = ["score", "--run-file", file, "--ratings", path.join(fixture, "ratings.json"), "--out", path.join(fixture, "report")];
  const result = spawnSync(process.execPath, [path.join(root, "evals/cli.mjs"), ...args], { cwd: root, encoding: "utf8" });
  assert.equal(result.status, 2);
  assert.equal(result.stdout, "");
  assert.ok(result.stderr.endsWith("\n"));
  assert.doesNotMatch(result.stderr.slice(0, -1), /[\u0000-\u001f\u007f-\u009f\u2028\u2029]/);
  assert.ok(result.stderr.includes(JSON.stringify(file)));
  if (nativeError.message.includes(String.fromCharCode(27))) assert.ok(result.stderr.includes("\\u001b"));
  await assert.rejects(runCli(args), error => {
    assert.ok(error instanceof SyntaxError);
    assert.ok(error.message.endsWith(nativeError.message));
    assert.equal(error.cause.message, nativeError.message);
    return true;
  });
});


test("Linked output-root ancestors reject before creating directories in their target", async t => {
  for (const placement of ["outside", "inside"]) await t.test(placement, async t => {
    const fixture = await mkdtemp(path.join(tmpdir(), "vera-output-ancestor-"));
    t.after(() => rm(fixture, { recursive: true, force: true }));
    const repo = path.join(fixture, "repo");
    const destination = placement === "outside" ? path.join(fixture, "destination") : path.join(repo, "destination");
    await mkdir(destination, { recursive: true });
    await mkdir(repo, { recursive: true });
    const link = path.join(repo, "work");
    await symlink(destination, link);
    await assert.rejects(writeReport(repo, path.join(repo, "work/evals/report"), { origin: "synthetic_test" }), /Evaluation output root may not be a symlink/);
    assert.deepEqual(await readdir(destination), []);
    assert.equal(await readlink(link), destination);
  });
});
