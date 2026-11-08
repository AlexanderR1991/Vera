import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import project from "../public/project.json" with { type: "json" };
import { ENTITY_QUERIES } from "../src/lib/vera-entity-catalog.mjs";
import { assessEvidence, queryVera, resolveEntityQuery } from "../src/lib/vera-entity.mjs";
import { assessLifeDrive } from "../src/lib/vera-life-drive.mjs";

const support = { polarity: "supports" };
const challenge = { polarity: "challenges" };

test("the evidence pair distinguishes all four states and preserves conflicts", () => {
  const cases = [
    [[], false, false, "open"],
    [[support], true, false, "supported"],
    [[challenge], false, true, "challenged"],
    [[support, challenge], true, true, "conflict"]
  ];
  for (const [evidence, support, challenge, status] of cases) {
    assert.deepEqual(assessEvidence(evidence), { support, challenge, status });
    assert.deepEqual(assessEvidence([...evidence, ...evidence].reverse()), { support, challenge, status });
  }
  for (const malformed of [null, {}, [null], [{ polarity: "unknown" }], [support, challenge, {}]]) {
    assert.throws(() => assessEvidence(malformed), TypeError);
  }
});

test("question matching normalizes spelling format without guessing or discarding negation", () => {
  const catalog = [
    { id: "first", de: { question: "Wer bist du?", aliases: ["Vera"] } },
    { id: "second", de: { question: "Was kannst du?", aliases: ["Vera"] } }
  ];
  assert.deepEqual(resolveEntityQuery("  ＷＥＲ  BIST DU？ ", "de", catalog), ["first"]);
  assert.deepEqual(resolveEntityQuery("second", "de", catalog), ["second"]);
  assert.deepEqual(resolveEntityQuery("vera", "de", catalog), ["first", "second"]);
  assert.deepEqual(resolveEntityQuery("Wer bist du nicht?", "de", catalog), []);
  assert.deepEqual(resolveEntityQuery("Wer bist du? Was kannst du?", "de", catalog), []);
});

test("both languages resolve each listed question and each source exists in the repository", () => {
  const ids = ENTITY_QUERIES.map(({ id }) => id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ["identity", "engine", "life-drive", "decisions", "release", "consciousness", "goal"]) {
    assert.ok(ids.includes(id), `missing query ${id}`);
  }
  for (const { id, de, en, evidence } of ENTITY_QUERIES) {
    for (const [lang, copy] of [["de", de], ["en", en]]) {
      for (const key of ["question", "claim", "scope", "limit", "next"]) {
        assert.ok(copy[key]?.trim(), `missing ${id}/${lang}/${key}`);
      }
      assert.deepEqual(resolveEntityQuery(copy.question, lang), [id]);
    }
    for (const { path } of evidence) {
      assert.match(path, /^[\w.-]+(?:\/[\w.-]+)*(?:#[\p{L}\p{N}_-]+)?$/u);
      assert.ok(!path.split("#", 1)[0].split("/").includes(".."));
      assert.ok(existsSync(new URL(`../${path}`, import.meta.url)), `missing source ${path}`);
    }
  }
});

test("the life drive keeps failures distinct from unknowns and honors stop in every case", () => {
  const cases = [
    [null, null, "verify", "access"],
    [null, true, "verify", "access"],
    [null, false, "propose", "correction"],
    [true, null, "verify", "correction"],
    [true, true, "observe", null],
    [true, false, "propose", "correction"],
    [false, null, "propose", "access"],
    [false, true, "propose", "access"],
    [false, false, "propose", "access"]
  ];
  for (const [access, correction, action, condition] of cases) {
    assert.deepEqual(assessLifeDrive({ access, correction }), { action, condition });
    assert.deepEqual(assessLifeDrive({ access, correction, stopped: true }), { action: "pause", condition: null });
  }
  for (const badInput of [{ access: "yes" }, { correction: 0 }, { stopped: "false" }]) {
    assert.throws(() => assessLifeDrive(badInput), TypeError);
  }
});

test("an unknown query differs from a recognized question with no evidence", () => {
  assert.equal(queryVera("unknown-query", project), null);
  const result = queryVera("consciousness", project);
  assert.equal(result.status, "open");
  assert.deepEqual(result.evidence, []);
});

test("the release claim follows the exact boolean in the versioned project record", () => {
  const release = ENTITY_QUERIES.find(({ id }) => id === "release");
  const { field } = release.evidence.find(({ path }) => path === "public/project.json");
  assert.equal(queryVera("release", { ai_ambition: { [field]: false } }).status, "challenged");
  assert.equal(queryVera("release", {}).status, "open");
  assert.equal(queryVera("release", { ai_ambition: { [field]: "false" } }).status, "open");
  assert.equal(queryVera("release", { ai_ambition: { [field]: true } }).status, "supported");
});

test("the terminal entry exposes the engine and the same bounded result", () => {
  const script = fileURLToPath(new URL("../scripts/vera-entity.mjs", import.meta.url));
  const run = (...args) => spawnSync(process.execPath, [script, ...args], { encoding: "utf8" });
  const result = run("de", "Hast du ein Bewusstsein?");
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.id, "consciousness");
  assert.equal(report.engine.name, "WIRKLICH");
  assert.equal(report.engine.rule, "META-01");
  assert.equal(report.status, queryVera("consciousness", project).status);
  assert.deepEqual(report.evidence, []);
  for (const [lang, question] of [["de", "Was ist Leben?"], ["en", "What is life?"]]) {
    const life = run(lang, question);
    assert.equal(life.status, 0, life.stderr);
    const answer = JSON.parse(life.stdout);
    assert.equal(answer.id, "life-drive");
    assert.equal(answer.type, "operational");
    assert.equal(answer.status, "supported");
  }
  const unknown = run("en", "What did you dream?");
  assert.equal(unknown.status, 2);
  assert.equal(JSON.parse(unknown.stdout).status, "unknown-query");
});
