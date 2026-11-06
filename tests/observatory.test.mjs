import assert from "node:assert/strict";
import {execFileSync} from "node:child_process";
import {mkdtempSync, mkdirSync, rmSync, writeFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {dirname, join} from "node:path";
import {pathToFileURL} from "node:url";
import test from "node:test";
import {claimReviewFingerprint} from "../src/lib/claims.mjs";
import {getObservatory} from "../src/lib/observatory.mjs";

test("daily observations use only committed, first-parent UTC snapshots", t => {
  const temp = mkdtempSync(join(tmpdir(), "observatory-"));
  t.after(() => rmSync(temp, {recursive: true, force: true}));
  const cwd = join(temp, "repo");
  mkdirSync(cwd);
  const git = (args, date) => execFileSync("git", args, {
    cwd, encoding: "utf8", env: date ? {...process.env, GIT_COMMITTER_DATE: date, GIT_AUTHOR_DATE: date} : process.env
  }).trim();
  git(["init", "--quiet", "-b", "main"]);
  git(["config", "user.name", "Fixture"]);
  git(["config", "user.email", "fixture@example.test"]);
  git(["config", "commit.gpgsign", "false"]);
  function write(path, data) {
    mkdirSync(dirname(join(cwd, path)), {recursive: true});
    writeFileSync(join(cwd, path), JSON.stringify(data));
  }
  function commit(date) {
    git(["add", "."]);
    git(["commit", "--quiet", "--allow-empty", "-m", "fixture"], date);
    return git(["rev-parse", "HEAD"]);
  }
  const first = commit("2026-01-01T23:00:00Z");

  // This is still January 1 in UTC. The second snapshot must win that day.
  const registry = "public/knowledge/claims.json";
  const stream = "public/research/stream.json";
  write(stream, {schema: 1, items: []});
  const dayOne = commit("2026-01-02T00:30:00+01:00");
  const claim = {version: 1, statement: "a", review_status: "reviewed"};
  claim.human_review = {
    reviewer: "Fixture", date: "2026-01-02", method: {de: "A", en: "A"},
    decision: {de: "B", en: "B"}, claim_version: 1, content_sha256: claimReviewFingerprint(claim)
  };
  write(registry, {schema_version: 1, claims: [claim]});
  write(stream, {schema: 1, items: [{}, {}]});
  const dayTwo = commit("2026-01-02T09:00:00Z");

  git(["switch", "--quiet", "-c", "side", first]);
  write("side.json", {});
  commit("2026-01-03T09:00:00Z");
  git(["switch", "--quiet", "main"]);
  git(["merge", "--quiet", "--no-ff", "-m", "fixture merge", "side"], "2026-01-04T09:00:00Z");
  claim.statement = "changed since review";
  write(registry, {schema_version: 1, claims: [claim]});
  rmSync(join(cwd, stream));
  write("public/research/angriffe.json", {schema: 1, items: []});
  const dayFour = commit("2026-01-04T10:00:00Z");
  write(registry, {schema_version: 1, claims: [{version: 1}]});
  const dayFive = commit("2026-01-05T09:00:00Z");
  write(registry, {schema_version: 1, claims: []}); // Uncommitted edit.

  assert.deepEqual(getObservatory(cwd), {
    schema_version: 1, head: dayFive, days: [
      {date: "2026-01-01", revision: dayOne, revisions: 2, claims: null, reviewed: null, discovery: 0, criticism: null},
      {date: "2026-01-02", revision: dayTwo, revisions: 1, claims: 1, reviewed: 1, discovery: 2, criticism: null},
      {date: "2026-01-04", revision: dayFour, revisions: 2, claims: 1, reviewed: 0, discovery: null, criticism: 0},
      {date: "2026-01-05", revision: dayFive, revisions: 1, claims: 1, reviewed: null, discovery: null, criticism: 0}
    ]
  });
  const shallow = join(temp, "shallow");
  git(["clone", "--quiet", "--depth", "1", pathToFileURL(cwd).href, shallow]);
  assert.throws(() => getObservatory(shallow), /fetch-depth: 0/);
});

test("editorial milestones have bilingual text and distinct, chronological source events", async () => {
  const {default: milestones} = await import("../src/lib/observatory-events.json", {with: {type: "json"}});
  assert.ok(milestones.length > 0);
  const seen = new Set();
  let previous = "";
  for (const {at, kind, number, de, en} of milestones) {
    assert.match(at, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
    assert.equal(new Date(at).toISOString(), at.replace("Z", ".000Z"));
    assert.ok(at >= previous);
    assert.ok(["issue", "merge"].includes(kind));
    assert.ok(Number.isInteger(number) && number > 0);
    assert.ok(de.trim() && en.trim());
    assert.ok(!seen.has(kind + number));
    seen.add(kind + number);
    previous = at;
  }
});
