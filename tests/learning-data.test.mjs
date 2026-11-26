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

test("moving source revision labels remain rejected with surrounding whitespace without rewriting revisions", () => {
  for (const label of ["main", "MASTER", "HeAd", "latest"]) {
    for (const revision of [label, ` ${label} `, `\t${label}\t`, `\n${label}\r\n`, `\u00a0${label}\u00a0`]) {
      const input = structuredClone(fixtures);
      input.examples[0].source.revision = revision;
      const before = structuredClone(input);
      assert.throws(() => validateCorpus(input), /moving branch/);
      assert.throws(() => buildSupervisedExport(input, { allowDevFixtures: true }), /moving branch/);
      assert.deepEqual(input, before);
    }
  }
  for (const revision of ["synthetic-v1", "main-v1", "latest-release", " fixed-v1 "]) {
    const input = structuredClone(fixtures);
    input.examples[0].source.revision = revision;
    const before = structuredClone(input);
    const exported = buildSupervisedExport(input, { allowDevFixtures: true });
    assert.equal(exported.manifest.sources.find(item => item.example_id === input.examples[0].id).source.revision, revision);
    assert.deepEqual(input, before);
  }
});

test("learning CLI rejects malformed UTF-8 without replacing bytes and keeps genuine replacement characters", () => {
  temporary(directory => {
    const input = structuredClone(fixtures);
    input.examples[0].scope = "Synthetic BYTE_SITE text only.";
    const bytes = Buffer.from(JSON.stringify(input));
    const site = bytes.indexOf("BYTE_SITE");
    assert.ok(site >= 0);
    const insert = value => Buffer.concat([bytes.subarray(0, site), value, bytes.subarray(site + 9)]);
    const valid = insert(Buffer.from("\ufffd"));
    for (const [name, data, accepted] of [["replacement", valid, true], ["invalid", insert(Buffer.from([0xff])), false], ["bom", Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), valid]), false]]) {
      const file = join(directory, `${name}.json`);
      writeFileSync(file, data);
      for (const command of ["validate", "export"]) {
        const output = join(directory, `${name}-${command}`);
        const result = run("data/cli.mjs", [command, "--input", file, ...(command === "export" ? ["--out", output, "--allow-dev-fixtures"] : [])]);
        assert.equal(result.status, accepted ? 0 : 2, result.stderr);
        assert.deepEqual(readFileSync(file), data);
        if (command === "export") {
          if (accepted) assert.equal(JSON.parse(readFileSync(join(output, "manifest.json"), "utf8")).sources[0].scope, "Synthetic \ufffd text only.");
          else assert.throws(() => readFileSync(join(output, "manifest.json")), { code: "ENOENT" });
        }
      }
    }
  });
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


test("rendered user messages cannot leak across field boundaries or splits", () => {
  const delimiter = "\n\nContext:\n";
  const make = (number, split, prompt, context) => {
    const item = structuredClone(fixtures.examples[0]);
    item.id = `RENDER-${number}`;
    item.family_id = `RENDER-FAMILY-${number}`;
    item.split = split;
    item.source.id = `RENDER-SOURCE-${number}`;
    item.source.url = `urn:vera:fixture:render-${number}`;
    item.source.excerpt += ` Render fixture ${number}.`;
    item.source.content_sha256 = sha256(item.source.excerpt);
    item.task = { ...item.task, prompt, context };
    return item;
  };
  const pack = examples => ({ ...fixtures, examples });
  for (const left of ["train", "validation", "test"]) {
    for (const right of ["train", "validation", "test"]) {
      const a = make(1, left, "Question", "Middle" + delimiter + "Tail");
      const b = make(2, right, "Question" + delimiter + "Middle", "Tail");
      const exportedInput = item => JSON.parse(buildSupervisedExport(pack([item]), { allowDevFixtures: true }).files[`${item.split}.jsonl`]).messages[0].content;
      assert.equal(exportedInput(a), exportedInput(b));
      for (const ordered of [[a, b], [b, a]]) {
        if (left === right) assert.doesNotThrow(() => validateCorpus(pack(ordered)));
        else assert.throws(() => validateCorpus(pack(ordered)), /split leakage/);
      }
    }
  }
  // Retain the old conservative field-pair guard as well as the rendered guard.
  const a = make(1, "train", "Question", "Middle\nTail");
  const b = make(2, "test", "Question\nMiddle", "Tail");
  assert.throws(() => validateCorpus(pack([a, b])), /split leakage/);
  b.task.prompt = "Different question";
  assert.doesNotThrow(() => validateCorpus(pack([a, b])));
});


test("source identity preserves revision and locator boundaries without inventing conflicts", () => {
  const make = number => {
    const item = structuredClone(fixtures.examples[0]);
    item.id = `SOURCE-KEY-${number}`;
    item.family_id = `SOURCE-KEY-FAMILY-${number}`;
    item.split = "train";
    item.source.id = "SOURCE-KEY-SHARED";
    item.source.excerpt += ` Wholly synthetic excerpt ${number}.`;
    item.source.content_sha256 = sha256(item.source.excerpt);
    return item;
  };
  const a = make(1), b = make(2);
  a.source.revision = "fixture-v1#Annex";
  a.source.locator = "p1";
  b.source.revision = "fixture-v1";
  b.source.locator = "Annex#p1";
  const pack = examples => ({ ...fixtures, examples });
  for (const ordered of [[a, b], [b, a]]) {
    assert.doesNotThrow(() => validateCorpus(pack(ordered)));
    assert.equal(buildSupervisedExport(pack(ordered), { allowDevFixtures: true }).manifest.counts.exported, 2);
  }
  b.source.revision = a.source.revision;
  b.source.locator = a.source.locator;
  for (const ordered of [[a, b], [b, a]]) {
    assert.throws(() => validateCorpus(pack(ordered)), /conflicting source content/);
  }
  b.source.excerpt = a.source.excerpt;
  b.source.content_sha256 = a.source.content_sha256;
  assert.doesNotThrow(() => validateCorpus(pack([a, b])));
  b.split = "test";
  assert.throws(() => validateCorpus(pack([a, b])), /split leakage/);
});


test("valid correction chains at the corpus limit do not depend on input order", () => {
  const chain = Array.from({ length: 10000 }, (_, index) => {
    const item = structuredClone(fixtures.examples[0]);
    item.id = `DEPTH-${index}`;
    item.family_id = "DEPTH-FAMILY";
    item.split = "train";
    item.target = `Wholly synthetic target ${index}.`;
    item.correction = { supersedes: index ? [`DEPTH-${index - 1}`] : [], rationale: index ? "Synthetic correction edge." : "" };
    return item;
  });
  const run = examples => buildSupervisedExport({ ...fixtures, examples }, { allowDevFixtures: true });
  const forward = run(chain), reverse = run([...chain].reverse());
  for (const result of [forward, reverse]) {
    assert.deepEqual(result.manifest.splits.train.ids, ["DEPTH-9999"]);
    assert.equal(result.manifest.counts.superseded, 9999);
  }
  assert.equal(forward.files["train.jsonl"], reverse.files["train.jsonl"]);
  // The corpus hash intentionally binds the supplied array order.
  assert.notEqual(forward.manifest.corpus_sha256, reverse.manifest.corpus_sha256);
  chain[0].correction = { supersedes: ["DEPTH-9999"], rationale: "Deliberate synthetic cycle." };
  assert.throws(() => validateCorpus({ ...fixtures, examples: chain }), /contains a cycle/);
});


test("export metadata is isolated from its input and other exports without freezing the result", () => {
  const input = structuredClone(fixtures);
  const initialInput = structuredClone(input);
  const first = buildSupervisedExport(input, { allowDevFixtures: true });
  const second = buildSupervisedExport(input, { allowDevFixtures: true });
  const snapshot = structuredClone(first.manifest);
  assert.deepEqual(input, initialInput);
  assert.deepEqual(first.manifest, JSON.parse(first.files["manifest.json"]));
  input.examples[0].source.locator += " Caller input edit.";
  input.examples[0].review.reviewed_by.push("Synthetic note, no real reviewer.");
  input.examples[0].limitations.push("Caller input note.");
  assert.deepEqual(first.manifest, snapshot);
  assert.deepEqual(second.manifest, snapshot);
  const afterInputEdit = structuredClone(input);
  first.manifest.sources[0].source.locator += " Own result edit.";
  first.manifest.sources[0].review.reviewed_by.push("Synthetic result note.");
  first.manifest.sources[0].correction.supersedes.push("OWN-RESULT-EDIT");
  first.manifest.sources[0].counterexamples.push("Own counterexample note.");
  assert.deepEqual(input, afterInputEdit);
  assert.deepEqual(second.manifest, snapshot);
  // Deliberate edits to an owned manifest do not rewrite the original file bytes.
  assert.notDeepEqual(first.manifest, JSON.parse(first.files["manifest.json"]));
  assert.deepEqual(JSON.parse(first.files["manifest.json"]), snapshot);
});

test("source excerpts reject unpaired UTF-16 surrogates before checksum acceptance", () => {
  temporary(directory => {
    for (const [name, excerpt, accepted] of [
      ["high", "x\ud800y", false], ["other-high", "x\ud801y", false],
      ["low", "x\udc00y", false], ["reverse", "x\udc00\ud800y", false],
      ["replacement", "x\ufffdy", true], ["pair", "x\ud83d\ude00y", true], ["ascii", "xy", true]
    ]) {
      const input = structuredClone(fixtures);
      input.examples[0].source.excerpt = excerpt;
      input.examples[0].source.content_sha256 = sha256(excerpt);
      const before = structuredClone(input);
      if (accepted) assert.equal(validateCorpus(input), input);
      else assert.throws(() => validateCorpus(input), /source.excerpt must be well-formed Unicode/);
      assert.deepEqual(input, before);
      const path = join(directory, `${name}.json`);
      writeFileSync(path, JSON.stringify(input)); // Valid UTF-8 JSON can contain escaped lone surrogates.
      const bytes = readFileSync(path);
      for (const command of ["validate", "export"]) {
        const output = join(directory, `${name}-${command}`);
        const result = run("data/cli.mjs", [command, "--input", path, ...(command === "export" ? ["--out", output, "--allow-dev-fixtures"] : [])]);
        assert.equal(result.status, accepted ? 0 : 2, result.stderr);
        assert.deepEqual(readFileSync(path), bytes);
        if (!accepted && command === "export") assert.throws(() => readFileSync(join(output, "manifest.json")), { code: "ENOENT" });
      }
    }
  });
});
