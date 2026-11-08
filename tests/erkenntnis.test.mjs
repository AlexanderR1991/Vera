import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { assessErkenntnis, tests } from "../src/lib/erkenntnis.mjs";

const observation = (test, value) => ({ test, value });

test("Vera chooses the smallest worst-case group and adapts to either result", () => {
  const initial = assessErkenntnis([]);
  assert.deepEqual(initial.possible, ["unbuilt", "built", "published", "visible"]);
  assert.deepEqual(initial.comparison.map(({ worst }) => worst), [3, 2, 3]);
  assert.equal(initial.next.test, "publication");
  assert.equal(assessErkenntnis([observation("publication", true)]).next.test, "live");
  assert.equal(assessErkenntnis([observation("publication", false)]).next.test, "build");
});

test("conflict preserves opposing observations and reversal restores possibilities", () => {
  const inputs = [observation("publication", false), observation("live", true)];
  assert.equal(assessErkenntnis(inputs).status, "conflict");
  assert.equal(assessErkenntnis(inputs).next, null);
  assert.deepEqual(assessErkenntnis(inputs.slice(0, 1)).possible, ["unbuilt", "built"]);
  assert.equal(assessErkenntnis([observation("build", true), observation("build", false)]).status, "conflict");
  assert.throws(() => assessErkenntnis([observation("live", "true")]), /boolean/);
});

test("all 64 observation sets agree with the truth table and each chosen test guarantees progress", () => {
  const table = ["000", "100", "110", "111"];
  const literals = tests.flatMap(name => [observation(name, false), observation(name, true)]);
  for (let mask = 0; mask < 2 ** literals.length; mask++) {
    const input = literals.filter((_, index) => mask & (1 << index));
    const expected = table.filter(row => input.every(({ test, value }) => Number(row[tests.indexOf(test)]) === Number(value)));
    const report = assessErkenntnis(input);
    assert.equal(report.possible.length, expected.length);
    assert.equal(report.status, expected.length === 0 ? "conflict" : expected.length === 1 ? "resolved" : "open");
    if (expected.length <= 1) {
      assert.equal(report.next, null);
      continue;
    }
    assert.ok(report.next.worst < expected.length);
    assert.equal(report.next.worst, Math.min(...report.comparison.map(({ worst }) => worst)));
    for (const value of [false, true]) {
      const next = assessErkenntnis([...input, observation(report.next.test, value)]);
      assert.ok(next.possible.length > 0 && next.possible.length <= report.next.worst);
    }
  }
});

test("terminal entry returns a report, a conflict or an input error", () => {
  const path = fileURLToPath(new URL("../scripts/vera-erkenntnis.mjs", import.meta.url));
  const run = (...args) => spawnSync(process.execPath, [path, ...args], { encoding: "utf8" });
  const result = run("publication=no");
  assert.equal(result.status, 0);
  assert.equal(JSON.parse(result.stdout).next.test, "build");
  const conflict = run("publication=no", "live=yes");
  assert.equal(conflict.status, 1);
  assert.equal(JSON.parse(conflict.stdout).status, "conflict");
  assert.equal(run("build=unknown").status, 2);
});
