import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {execFileSync} from "node:child_process";
import {fileURLToPath} from "node:url";
import {analyzeRepositoryQuorum} from "../src/lib/repository-quorum.mjs";

const populationCount = mask => {
  let count = 0;
  for (; mask; mask &= mask - 1) count++;
  return count;
};
const subsets = (n, size) => Array.from({length: 2 ** n}, (_, mask) => mask)
  .filter(mask => populationCount(mask) === size);

test("thresholds match exhaustive participant sets, not a vote or truth decision", () => {
  for (let n = 1; n <= 6; n++) for (let q = 1; q <= n; q++) {
    const quorums = subsets(n, q);
    const minimumIntersection = Math.min(...quorums.flatMap(a => quorums.map(b => populationCount(a & b))));
    for (let f = 0; f < n; f++) {
      const faultySets = subsets(n, f);
      const result = analyzeRepositoryQuorum({n, f, q});
      const minimumNonfaulty = Math.min(...faultySets.map(faulty =>
        Math.min(...quorums.flatMap(a => quorums.map(b => populationCount(a & b & ~faulty))))));
      assert.equal(result.faultyAloneCannotApprove, !faultySets.some(faulty => quorums.some(a => (a & faulty) === a)), `${n}/${f}/${q}: unilateral approval`);
      assert.equal(result.othersCanApproveWithoutFaulty, faultySets.every(faulty => quorums.some(a => (a & faulty) === 0)), `${n}/${f}/${q}: availability`);
      assert.equal(result.minimumQuorumIntersection, minimumIntersection);
      assert.equal(result.minimumNonfaultyIntersection, minimumNonfaulty);
      assert.equal(result.quorumsMustShareNonfaulty, minimumNonfaulty > 0);
      assert.equal(result.scope, "threshold_analysis_only");
    }
  }
});

test("two of three permits conflicting groups that share only a faulty participant", () => {
  const result = analyzeRepositoryQuorum({n: 3, f: 1, q: 2});
  const a = new Set(["A", "X"]), b = new Set(["B", "X"]);
  const intersection = [...a].filter(person => b.has(person));
  assert.deepEqual(intersection, ["X"]);
  assert.ok(result.faultyAloneCannotApprove && result.othersCanApproveWithoutFaulty);
  assert.equal(result.quorumsMustShareNonfaulty, false);
  assert.equal(result.minimumNonfaultyIntersection, 0);
  assert.equal(analyzeRepositoryQuorum({n: 4, f: 1, q: 3}).minimumNonfaultyIntersection, 1);
});

test("machine-readable examples agree with the executable set model", () => {
  const protocol = JSON.parse(readFileSync(new URL("../public/protocol/repository-conflicts.v0.json", import.meta.url), "utf8"));
  for (const example of protocol.quorum_model.examples) {
    const actual = analyzeRepositoryQuorum(example);
    assert.equal(actual.faultyAloneCannotApprove, example.faulty_alone_cannot_approve);
    assert.equal(actual.othersCanApproveWithoutFaulty, example.others_can_approve_without_faulty);
    assert.equal(actual.quorumsMustShareNonfaulty, example.quorums_share_nonfaulty);
  }
});

test("counts reject invalid inputs and preserve strict bounds at safe integer limits", () => {
  for (const input of [null, [], undefined, {}, {n: "3", f: 1, q: 2}, {n: 3, f: NaN, q: 2}, {n: Infinity, f: 0, q: 1}, {n: 3, f: 0.5, q: 2}, {n: Number.MAX_SAFE_INTEGER + 1, f: 0, q: 1}]) {
    assert.throws(() => analyzeRepositoryQuorum(input), TypeError);
  }
  for (const input of [{n: 0, f: 0, q: 1}, {n: 3, f: -1, q: 2}, {n: 3, f: 3, q: 2}, {n: 3, f: 1, q: 0}, {n: 3, f: 1, q: 4}]) {
    assert.throws(() => analyzeRepositoryQuorum(input), RangeError);
  }
  const n = Number.MAX_SAFE_INTEGER;
  const result = analyzeRepositoryQuorum({n, f: n - 1, q: n});
  assert.equal(result.quorumsMustShareNonfaulty, true);
  assert.equal(result.minimumNonfaultyIntersection, 1);
  assert.equal(result.othersCanApproveWithoutFaulty, false);
});

test("countercheck runs in both languages from outside the repository", () => {
  const script = new URL("../scripts/probe-repository-quorum.mjs", import.meta.url);
  for (const language of ["de", "en"]) {
    const output = execFileSync(process.execPath, [fileURLToPath(script), language], {encoding: "utf8", cwd: new URL("../../", import.meta.url)});
    assert.match(output, /n=3, f=1, q=2/);
    assert.match(output, /n=4, f=1, q=3/);
    assert.match(output, /\{A,X\}.*\{B,X\}/);
    assert.match(output, language === "de" ? /kein vollständiges Konsensprotokoll/ : /not constitute a complete consensus protocol/);
  }
});
