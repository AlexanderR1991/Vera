import test from "node:test";
import assert from "node:assert/strict";
import {execFileSync, spawnSync} from "node:child_process";
import {mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {fileURLToPath} from "node:url";
import {claimReviewFingerprint} from "../src/lib/claims.mjs";

const script = fileURLToPath(new URL("../scripts/vera-review-impact.mjs", import.meta.url));
const read = name => JSON.parse(readFileSync(new URL("../public/knowledge/" + name + ".json", import.meta.url)));

function repo(t) {
  const cwd = mkdtempSync(join(tmpdir(), "vera-impact-"));
  t.after(() => rmSync(cwd, {recursive: true, force: true}));
  const dir = join(cwd, "public/knowledge");
  mkdirSync(dir, {recursive: true});
  const git = (...args) => execFileSync("git", ["-c", "user.name=Test", "-c", "user.email=test@example.invalid",
    "-c", "core.hooksPath=/dev/null", "-c", "commit.gpgsign=false", ...args], {cwd, encoding: "utf8"});
  git("init", "-q");
  const register = read("claims"), atlas = read("questions");
  function commit() {
    writeFileSync(join(dir, "claims.json"), JSON.stringify(register));
    writeFileSync(join(dir, "questions.json"), JSON.stringify(atlas));
    git("add", ".");
    git("commit", "-qm", "Fixture revision");
    return git("rev-parse", "HEAD").trim();
  }
  const run = (...refs) => spawnSync(process.execPath, [script, ...refs], {cwd: dir, encoding: "utf8"});
  function report(...refs) {
    const result = run(...refs);
    assert.equal(result.status, 0, result.stderr);
    return JSON.parse(result.stdout);
  }
  return {register, atlas, dir, git, commit, run, report};
}

test("two committed atlases retain lost routes, separate gains and deduplicate questions across claims", t => {
  const {register, atlas, dir, commit, report} = repo(t);
  const question = (i, ...claim_ids) => ({...atlas.questions[i - 1], claim_ids});
  const depends = (from, to) => ({type: "depends_on", from, to, reason: {de: "Test", en: "Test"}});
  atlas.questions = [question(1, "G-005"), question(2, "H-001"), question(3, "H-001"),
    question(4, "KI-001"), question(5, "P-001")];
  atlas.relations = [depends("Q-002", "Q-001"), depends("Q-004", "Q-002")];
  const before = commit();
  const g = register.claims.find(c => c.id === "G-005");
  g.scope.de += " Test.";
  register.claims.find(c => c.id === "KI-001").review_status = "disputed";
  register.claims.find(c => c.id === "P-001").id = "N-001";
  atlas.questions[0].claim_ids = ["H-001"];
  atlas.questions[3].claim_ids.push("G-005");
  atlas.questions[4].claim_ids = ["N-001"];
  // Only in the new graph does Q-003 depend on Q-002. Only in the old graph
  // can the changed G-005 reach Q-002. Stitching both would invent Q-003.
  atlas.relations = [depends("Q-003", "Q-002")];
  const after = commit();
  writeFileSync(join(dir, "questions.json"), "uncommitted invalid content");
  const result = report("HEAD^", "HEAD");
  assert.deepEqual(result.revisions, {before, after});
  assert.equal(result.status, "advisory");
  assert.deepEqual(result.changed_claims, [
    {id: "G-005", changes: ["content"]}, {id: "KI-001", changes: ["status"]},
    {id: "N-001", changes: ["added"]}, {id: "P-001", changes: ["removed"]}
  ]);
  assert.deepEqual(result.questions.map(q => q.id), ["Q-001", "Q-002", "Q-004", "Q-005"]);
  assert.deepEqual(result.questions[1].reasons, [{claim_id: "G-005", before: ["G-005", "Q-001", "Q-002"], after: null}]);
  assert.deepEqual(result.questions[2].reasons, [
    {claim_id: "G-005", before: ["G-005", "Q-001", "Q-002", "Q-004"], after: ["G-005", "Q-004"]},
    {claim_id: "KI-001", before: ["KI-001", "Q-004"], after: ["KI-001", "Q-004"]}
  ]);
  assert.deepEqual(result.questions[3].reasons, [
    {claim_id: "N-001", before: null, after: ["N-001", "Q-005"]},
    {claim_id: "P-001", before: ["P-001", "Q-005"], after: null}
  ]);
});

test("review metadata alone is quiet, changes into and out of exceptional states trigger review", t => {
  const {register, commit, report} = repo(t);
  const c = register.claims.find(c => c.id === "G-005");
  const original = commit();
  c.review_status = "reviewed";
  c.human_review = {reviewer: "Test", date: "2026-11-08", method: {de: "Test", en: "Test"},
    decision: {de: "Test", en: "Test"}, claim_version: c.version, content_sha256: claimReviewFingerprint(c)};
  const reviewed = commit();
  for (const ref of [original, reviewed]) {
    assert.deepEqual(report(original, ref), {status: "advisory", revisions: {before: original, after: ref}, changed_claims: [], questions: []});
  }
  c.review_status = "withdrawn";
  const withdrawn = commit();
  for (const refs of [[reviewed, withdrawn], [withdrawn, reviewed]]) {
    assert.deepEqual(report(...refs).changed_claims, [{id: "G-005", changes: ["status"]}]);
  }
});

test("missing refs, missing committed files and invalid registers fail without partial output", t => {
  const {atlas, git, commit, run} = repo(t);
  const valid = commit();
  atlas.questions[0].claim_ids = ["Z-999"];
  const invalid = commit();
  git("rm", "public/knowledge/questions.json");
  git("commit", "-qm", "Missing atlas");
  for (const args of [[valid, invalid], [valid, "HEAD"], [valid, "not-a-ref"], ["--help"], [valid, "--all"]]) {
    const result = run(...args);
    assert.notEqual(result.status, 0);
    assert.equal(result.stdout, "");
  }
});
