import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve, join, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { validateCorpus, buildSupervisedExport, sha256, canonicalJson } from "../data/learning-data.mjs";
import { buildTrainingPlan } from "../training/plan.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const fixtures = JSON.parse(readFileSync(new URL("../data/dev-fixtures.v1.json", import.meta.url), "utf8"));
const realCorpus = JSON.parse(readFileSync(new URL("../data/corpus.v1.json", import.meta.url), "utf8"));
const config = JSON.parse(readFileSync(new URL("../training/config.v1.json", import.meta.url), "utf8"));
// Test-only declarations simulate reviewed records. They are never written to
// the real corpus and are not evidence of actual permissions or human review.
function example(number, split = "train") {
  const item = structuredClone(fixtures.examples[0]);
  item.id = `TEST-${number}`;
  item.family_id = `TEST-FAMILY-${number}`;
  item.split = split;
  item.source.id = `TEST-SOURCE-${number}`;
  item.source.url = `https://example.invalid/test-only/${number}`;
  item.source.excerpt += ` Test-only source ${number}.`;
  item.source.content_sha256 = sha256(item.source.excerpt);
  item.task.prompt += ` Test-only case ${number}.`;
  item.review = { status: "accepted", reviewed_by: ["TEST-ONLY simulated reviewer"], reference: "Test fixture, not a real human review" };
  item.usage.training_permission = "granted";
  item.usage.permission_reference = "TEST-ONLY simulated permission";
  return item;
}
const corpus = examples => ({ schema_version: 1, kind: "vera_learning_corpus", purpose: "training", examples });
function run(script, args = []) { return spawnSync(process.execPath, [join(root, script), ...args], { cwd: root, encoding: "utf8" }); }
function temporary(action) {
  const base = resolve(tmpdir());
  const path = mkdtempSync(join(base, "vera-learning-"));
  try { return action(path); }
  finally { assert.ok(resolve(path).startsWith(base + sep) && path.includes("vera-learning-")); rmSync(path, { recursive: true, force: true }); }
}

test("real corpus starts empty; no implicit collection or fabricated training readiness", () => {
  validateCorpus(realCorpus);
  assert.equal(realCorpus.purpose, "training");
  assert.deepEqual(realCorpus.examples, []);
  const exported = buildSupervisedExport(realCorpus);
  assert.equal(exported.manifest.counts.exported, 0);
  assert.equal(exported.files["train.jsonl"], "");
  const plan = buildTrainingPlan(config, realCorpus);
  assert.equal(plan.training_performed, false);
  assert.equal(plan.status, "blocked");
  for (const code of ["data_train", "data_validation", "data_test", "base_model", "tokenizer", "compute", "independent_evaluation", "trainer_not_implemented"]) assert.ok(plan.missing.some(item => item.code === code), code);
});

test("source integrity, immutable revision and strict field boundaries are checked", () => {
  for (const mutate of [
    e => { e.source.excerpt = "changed"; },
    e => { e.source.revision = "main"; },
    e => { e.source.url = "http://example.invalid/source"; },
    e => { e.source.private_note = "unexpected field"; },
    e => { e.limitations = []; },
    e => { delete e.usage.permission_reference; },
    e => { e.review.reviewed_by = []; }
  ]) { const e = example(1); mutate(e); assert.throws(() => validateCorpus(corpus([e]))); }
  assert.throws(() => validateCorpus(corpus([example(1), example(1)])), /duplicate example ID/);
});

test("unreviewed AI drafts and missing use permission are quarantined and excluded", () => {
  const ai = example(1, "quarantine");
  ai.provenance.origin = "ai_draft";
  ai.review = { status: "unreviewed", reviewed_by: [] };
  ai.usage.training_permission = "unknown";
  delete ai.usage.permission_reference;
  validateCorpus(corpus([ai]));
  assert.equal(buildSupervisedExport(corpus([ai])).manifest.counts.exported, 0);
  ai.split = "train";
  assert.throws(() => validateCorpus(corpus([ai])), /quarantine/);
  for (const field of ["permission", "privacy"]) {
    const e = example(2);
    if (field === "permission") e.usage.training_permission = "denied";
    else e.usage.privacy = "restricted";
    assert.throws(() => validateCorpus(corpus([e])), /quarantine/);
  }
});

test("source ID across revisions, URL, family, excerpt and duplicate input cannot leak between splits", () => {
  const a = example(1);
  for (const kind of ["source", "url", "family", "excerpt", "input"]) {
    const b = example(2, "test");
    if (kind === "source") { b.source.id = a.source.id; b.source.revision = "synthetic-v2"; }
    if (kind === "url") b.source.url = `${a.source.url}#different-locator`;
    if (kind === "family") b.family_id = a.family_id;
    if (kind === "excerpt") { b.source.excerpt = a.source.excerpt; b.source.content_sha256 = a.source.content_sha256; }
    if (kind === "input") { b.task = { ...a.task, prompt: `  ${a.task.prompt.toUpperCase()}  ` }; }
    assert.throws(() => validateCorpus(corpus([a, b])), /split leakage/, kind);
  }
});

test("accepted corrections retire old targets; drafts do not; invalid lineage is rejected", () => {
  const original = example(1);
  const revision = example(2);
  revision.family_id = original.family_id;
  revision.target = "A corrected TEST-ONLY answer.";
  revision.correction = { supersedes: [original.id], rationale: "Test-only correction" };
  const exported = buildSupervisedExport(corpus([original, revision]));
  assert.deepEqual(exported.manifest.splits.train.ids, [revision.id]);
  const draft = structuredClone(revision);
  draft.split = "quarantine";
  draft.review = { status: "unreviewed", reviewed_by: [] };
  assert.deepEqual(buildSupervisedExport(corpus([original, draft])).manifest.splits.train.ids, [original.id]);
  const unpermitted = structuredClone(revision);
  unpermitted.split = "quarantine";
  unpermitted.usage.training_permission = "denied";
  const stillUsable = buildSupervisedExport(corpus([original, unpermitted]));
  assert.deepEqual(stillUsable.manifest.splits.train.ids, [original.id]);
  assert.equal(stillUsable.manifest.counts.superseded, 0);
  const latest = example(3);
  latest.family_id = original.family_id;
  latest.correction = { supersedes: [unpermitted.id], rationale: "Test-only accepted replacement after the quarantined draft" };
  assert.deepEqual(buildSupervisedExport(corpus([original, unpermitted, latest])).manifest.splits.train.ids, [original.id, latest.id]);
  revision.correction.supersedes = ["MISSING-ID"];
  assert.throws(() => validateCorpus(corpus([original, revision])), /invalid correction reference/);
  revision.correction.supersedes = [original.id];
  original.correction = { supersedes: [revision.id], rationale: "Test-only cycle" };
  assert.throws(() => validateCorpus(corpus([original, revision])), /cycle/);
});

test("retirement cannot traverse quarantined correction links; explicit reviewed replacements still work", () => {
  const original = example(1);
  const draft = example(2, "quarantine");
  draft.family_id = original.family_id;
  draft.review = { status: "unreviewed", reviewed_by: [] };
  draft.correction = { supersedes: [original.id], rationale: "Unreviewed test-only lineage claim" };
  const latest = example(3);
  latest.family_id = original.family_id;
  latest.correction = { supersedes: [draft.id], rationale: "Reviewed replacement of the draft only" };
  const guarded = buildSupervisedExport(corpus([original, draft, latest]));
  assert.deepEqual(guarded.manifest.splits.train.ids, [original.id, latest.id]);
  assert.equal(guarded.manifest.counts.superseded, 1);
  latest.correction = { supersedes: [original.id, draft.id], rationale: "Reviewed explicit replacement of both earlier targets" };
  assert.deepEqual(buildSupervisedExport(corpus([original, draft, latest])).manifest.splits.train.ids, [latest.id]);
  const acceptedIntermediate = example(2);
  acceptedIntermediate.family_id = original.family_id;
  acceptedIntermediate.correction = { supersedes: [original.id], rationale: "Reviewed and exportable intermediate correction" };
  latest.correction = { supersedes: [acceptedIntermediate.id], rationale: "Reviewed replacement of an exportable correction" };
  assert.deepEqual(buildSupervisedExport(corpus([original, acceptedIntermediate, latest])).manifest.splits.train.ids, [latest.id]);
});

test("export is byte reproducible and carries auditable source, review and split manifests", () => {
  const examples = [example(3, "test"), example(1), example(2, "validation")];
  const a = buildSupervisedExport(corpus(examples));
  const b = buildSupervisedExport(JSON.parse(JSON.stringify(corpus(examples))));
  assert.deepEqual(a.files, b.files);
  for (const [split, info] of Object.entries(a.manifest.splits)) {
    assert.equal(sha256(a.files[info.file]), info.sha256);
    const rows = a.files[info.file].trim().split("\n").map(JSON.parse);
    assert.deepEqual(rows.map(r => r.id), info.ids);
    assert.deepEqual(rows[0].messages.map(m => m.role), ["user", "assistant"]);
    assert.equal(rows.length, 1, split);
  }
  assert.equal(a.manifest.sources.length, 3);
  assert.equal(a.manifest.training_performed, false);
  assert.equal(canonicalJson({ b: 1, a: 2 }), canonicalJson({ a: 2, b: 1 }));
});

test("development fixtures require explicit export opt-in and never become real data", () => {
  validateCorpus(fixtures);
  assert.throws(() => buildSupervisedExport(fixtures), /allow-dev-fixtures/);
  const exported = buildSupervisedExport(fixtures, { allowDevFixtures: true });
  assert.equal(exported.manifest.development_fixture, true);
  assert.equal(exported.manifest.counts.exported, 3);
  const disguised = structuredClone(fixtures);
  disguised.purpose = "training";
  for (const item of disguised.examples) item.source.url = `https://example.invalid/development-fixture/${item.id}`;
  assert.throws(() => validateCorpus(disguised), /fixture-only/);
  assert.ok(buildTrainingPlan(config, fixtures).missing.some(item => item.code === "development_fixtures_only"));
});

test("CLI validates and exports without overwriting; bad inputs fail explicitly", () => temporary(path => {
  assert.equal(run("data/cli.mjs", ["validate"]).status, 0);
  const fixturePath = join(root, "data/dev-fixtures.v1.json");
  const output = join(path, "export");
  const args = ["export", "--input", fixturePath, "--out", output, "--allow-dev-fixtures"];
  const success = run("data/cli.mjs", args);
  assert.equal(success.status, 0, success.stderr);
  const manifest = JSON.parse(readFileSync(join(output, "manifest.json"), "utf8"));
  assert.equal(manifest.counts.exported, 3);
  assert.equal(run("data/cli.mjs", args).status, 2);
  assert.equal(run("data/cli.mjs", ["export", "--out", join(path, "no-opt-in"), "--input", fixturePath]).status, 2);
  const bad = join(path, "bad.json");
  writeFileSync(bad, "{}");
  assert.equal(run("data/cli.mjs", ["validate", "--input", bad]).status, 2);
  assert.equal(run("data/cli.mjs", ["validate", "--unknown"]).status, 2);
}));

test("training CLI reports missing prerequisites; a plan cannot fabricate a training run", () => {
  const result = run("training/plan.mjs");
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.training_performed, false);
  assert.equal(report.trainer_implemented, false);
  assert.equal(run("training/plan.mjs", ["--require-ready"]).status, 1);
  const bad = structuredClone(config);
  bad.hyperparameters.learning_rate = -1;
  assert.throws(() => buildTrainingPlan(bad, realCorpus), /hyperparameters/);
  const complete = structuredClone(config);
  const dataset = corpus([example(1), example(2, "validation"), example(3, "test")]);
  complete.base_model = { id: "test-only-model", revision: "a".repeat(40), license_review_reference: "Test-only reference" };
  complete.tokenizer = { id: "test-only-tokenizer", revision: "b".repeat(40) };
  complete.compute = { device: "test-only-device", precision: "bfloat16", memory_budget_gib: 24, budget_reference: "Test-only budget" };
  complete.evaluation.baseline_report = "test-only-baseline.json";
  complete.evaluation.independent_review_reference = "Test-only review declaration";
  complete.data.export_manifest_sha256 = sha256(buildSupervisedExport(dataset).files["manifest.json"]);
  const blocked = buildTrainingPlan(complete, dataset);
  assert.deepEqual(blocked.missing.map(item => item.code), ["trainer_not_implemented"]);
  assert.equal(blocked.training_performed, false);
  for (const movingRevision of ["main", "release-v1", "stable", "abc123"]) {
    const moving = structuredClone(complete);
    moving.base_model.revision = movingRevision;
    moving.tokenizer.revision = movingRevision;
    const report = buildTrainingPlan(moving, dataset);
    assert.ok(report.missing.some(item => item.code === "base_model_revision"), movingRevision);
    assert.ok(report.missing.some(item => item.code === "tokenizer"), movingRevision);
  }
  for (const immutableRevision of ["c".repeat(40), "d".repeat(64), `sha256:${"e".repeat(64)}`]) {
    const pinned = structuredClone(complete);
    pinned.base_model.revision = immutableRevision;
    pinned.tokenizer.revision = immutableRevision;
    assert.deepEqual(buildTrainingPlan(pinned, dataset).missing.map(item => item.code), ["trainer_not_implemented"]);
  }
});
