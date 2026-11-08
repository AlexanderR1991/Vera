import assert from "node:assert/strict";
import test from "node:test";
import { demoMetaphor, learnMetaphor, ruleIds } from "../src/lib/metapher.mjs";

test("three contrasting observations correct the rule, and removing the imagery preserves its predictions", () => {
  const report = demoMetaphor();
  assert.deepEqual(report.history.map(step => step.eliminated), [["any-route"], ["two-routes"], ["disjoint-pair"]]);
  assert.deepEqual(report.finalCandidates, ["single-failure"]);
  assert.deepEqual(report.correct, { total: 6, before: 4, after: 6, twoRoutes: 4, literalRule: 6 });
  assert.deepEqual(report.consensus.before, { agreed: 2, correct: 2, wrong: 0, open: 4 });
  assert.deepEqual(report.consensus.after, { agreed: 6, correct: 6, wrong: 0, open: 0 });
  assert.equal(report.unchangedWithoutImage, true);
  assert.equal(report.boundary.singleFailurePrediction, true);
  assert.equal(report.boundary.survivesCoupledFailure, false);
});

test("all 256 possible families of routes over three components agree with explicit fault injection", () => {
  const parts = ["x", "y", "z"];
  const paths = Array.from({ length: 8 }, (_, mask) => parts.filter((_, i) => mask & (1 << i)));
  const cases = Array.from({ length: 256 }, (_, mask) => ({
    id: String(mask), routes: paths.filter((_, i) => mask & (1 << i))
  }));
  const { predictions } = learnMetaphor(demoMetaphor().observations, cases);
  for (const [i, { routes }] of cases.entries()) {
    const expected = routes.length > 0 && parts.every(failed =>
      routes.some(path => !path.includes(failed)));
    assert.equal(predictions[i].prediction, expected, JSON.stringify(routes));
  }
});

test("missing information, disagreement and conflicting observations stay distinct", () => {
  const sample = { id: "new", routes: [["a"]] };
  const unknown = { ...sample, observed: null };
  const open = learnMetaphor([unknown], [sample]);
  assert.deepEqual(open.candidates, ruleIds);
  assert.equal(open.predictions[0].prediction, null);
  assert.equal(open.predictions[0].status, "undetermined");
  const conflict = learnMetaphor([{ ...sample, observed: true }, { ...sample, observed: false }], [sample]);
  assert.deepEqual(conflict.candidates, []);
  assert.equal(conflict.predictions[0].status, "no-compatible-rule");
  assert.equal(conflict.predictions[0].workingPrediction, null);
  assert.throws(() => learnMetaphor([{ ...sample, observed: "yes" }], []), TypeError);
  assert.throws(() => learnMetaphor([], [{ ...sample, routes: [["a", "a"]] }]), TypeError);
});
