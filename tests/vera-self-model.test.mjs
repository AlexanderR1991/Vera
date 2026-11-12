import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { assessSelfModel } from "../scripts/vera-self-model.mjs";

const scope = {
  revision: "1111111111111111111111111111111111111111",
  runAttempt: "123456789/1",
  observedAt: "2026-11-07T23:46:35Z"
};
const facts = ["buildPassed", "deploymentSucceeded", "liveRevisionMatches"];
const claims = [...facts, "deployedAndLive"];
const observation = (claim, value) => ({ claim, value, source: `Fixture for ${claim}=${value}` });
const assess = (evidence) => assessSelfModel({ ...scope, evidence });

test("a green build cannot identify the live revision; a successful deploy certifies a satisfied build dependency", () => {
  const build = assess([observation("buildPassed", true)]);
  assert.equal(build.assessments.buildPassed.status, "confirmed");
  assert.equal(build.assessments.deploymentSucceeded.status, "open");
  assert.equal(build.assessments.liveRevisionMatches.status, "open");

  const deploy = assess([observation("deploymentSucceeded", true)]);
  assert.equal(deploy.assessments.buildPassed.status, "confirmed");
  assert.equal(deploy.assessments.deployedAndLive.status, "open");

  const replaced = assess([...deploy.evidence, observation("liveRevisionMatches", false)]);
  assert.equal(replaced.assessments.deploymentSucceeded.status, "confirmed");
  assert.equal(replaced.assessments.deployedAndLive.status, "refuted");
});

test("every evidence subset has valid witnesses and consistent extensions preserve settled results", () => {
  const literals = facts.flatMap(claim => [observation(claim, false), observation(claim, true)]);
  const cases = Array.from({ length: 2 ** literals.length }, (_, mask) => {
    const evidence = literals.filter((_, i) => mask & (1 << i));
    return { mask, evidence, result: assess(evidence) };
  });
  const admissibleTriples = ["000", "001", "100", "101", "110", "111"];

  for (const { mask, evidence, result } of cases) {
    const expectedWorlds = admissibleTriples.filter(triple =>
      evidence.every(({ claim, value }) => Number(triple[facts.indexOf(claim)]) === Number(value))
    );
    assert.equal(result.compatibleWorldCount, expectedWorlds.length, `Evidence mask ${mask}`);
    if (result.compatibleWorldCount === 0) {
      assert.deepEqual(Object.values(result.assessments).map(entry => entry.status), Array(4).fill("conflict"));
      assert.ok(result.conflict.every(record => evidence.some(item => item.source === record.source)));
      assert.equal(assess(result.conflict).compatibleWorldCount, 0);
      for (const item of result.conflict) {
        assert.ok(assess(result.conflict.filter(record => record !== item)).compatibleWorldCount > 0);
      }
      continue;
    }

    for (const claim of claims) {
      const { status, supports, refutes } = result.assessments[claim];
      const values = new Set(expectedWorlds.map(triple =>
        claim === "deployedAndLive" ? triple.endsWith("11") : triple[facts.indexOf(claim)] === "1"
      ));
      assert.equal(status, values.size === 2 ? "open" : values.has(true) ? "confirmed" : "refuted");
      if (status === "open") {
        assert.equal(supports[claim], true);
        assert.equal(refutes[claim], false);
        for (const world of [supports, refutes]) {
          assert.ok(!world.deploymentSucceeded || world.buildPassed);
          assert.equal(world.deployedAndLive, world.deploymentSucceeded && world.liveRevisionMatches);
          assert.ok(evidence.every(record => world[record.claim] === record.value));
        }
      } else {
        for (const next of cases) {
          if ((next.mask & mask) === mask && next.result.compatibleWorldCount > 0) {
            assert.equal(next.result.assessments[claim].status, status);
          }
        }
      }
    }
  }
});

test("scope and source validation reject malformed observations", () => {
  assert.throws(() => assessSelfModel({ ...scope, revision: "1111111", evidence: [] }), /revision/);
  assert.throws(() => assessSelfModel({ ...scope, runAttempt: "123456789", evidence: [] }), /runAttempt/);
  assert.throws(() => assessSelfModel({ ...scope, observedAt: "2026-02-30T12:00:00Z", evidence: [] }), /observedAt/);
  assert.throws(() => assess([observation("deployedAndLive", true)]), /evidence/);
  assert.throws(() => assess([observation("buildPassed", "true")]), /evidence/);
  assert.throws(() => assess([{ claim: "buildPassed", value: true, source: " " }]), /evidence/);
});

test("the documented CLI example, a conflicting extension and an invalid input produce distinct outcomes", () => {
  const script = fileURLToPath(new URL("../scripts/vera-self-model.mjs", import.meta.url));
  const doc = readFileSync(new URL("../docs/vera-selbstmodell.md", import.meta.url), "utf8");
  const example = doc.match(/<<'JSON'\r?\n([\s\S]+?)\r?\nJSON/)[1];
  const run = input => spawnSync(process.execPath, [script], { input, encoding: "utf8" });

  const open = run(example);
  assert.equal(open.status, 0, open.stderr);
  assert.equal(JSON.parse(open.stdout).assessments.liveRevisionMatches.status, "open");

  const extended = JSON.parse(example);
  extended.evidence.push(observation("buildPassed", false));
  const conflict = run(JSON.stringify(extended));
  assert.equal(conflict.status, 1, conflict.stderr);
  assert.equal(JSON.parse(conflict.stdout).conflict.length, 2);

  const invalid = run("{");
  assert.equal(invalid.status, 2);
  assert.equal(invalid.stdout, "");
  assert.match(invalid.stderr, /Vera self-model/);
});
