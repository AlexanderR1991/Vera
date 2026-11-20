import test from "node:test";
import assert from "node:assert/strict";
import {createCorrectionWave} from "../src/lib/correction-wave.mjs";

const rule = (id, premises, conclusion) => ({id, premises, conclusion});

test("sparse ID arrays cannot introduce a missing fact or prerequisite", () => {
  for (const invalid of [Array(1), [undefined], [null], [""], "first", new Set(["first"])]) {
    assert.throws(() => createCorrectionWave({facts: invalid}), TypeError);
    assert.throws(() => createCorrectionWave({rules: [rule("r", invalid, "x")]}), TypeError);
  }
  assert.throws(() => createCorrectionWave({facts: Array(1), rules: [rule("r", Array(1), "x")]}), TypeError);
  const mixed = ["first", "second"];
  delete mixed[1];
  assert.throws(() => createCorrectionWave({facts: mixed}), TypeError);
  assert.throws(() => createCorrectionWave({facts: ["first"], rules: [rule("r", mixed, "x")]}), TypeError);
});

test("invalid ID slots reject an entire revision before changing facts or explanations", () => {
  const original = rule("basis", ["first"], "result");
  for (const field of ["addFacts", "removeFacts", "removeRules", "premises"]) {
    const graph = createCorrectionWave({facts: ["first"], rules: [original]});
    const ids = ["first", "second", "result", "other", undefined];
    const snapshot = () => ids.map(id => ({id, has: graph.has(id), support: graph.explain(id)}));
    const before = snapshot();
    const patch = {addFacts: ["second"], removeFacts: ["first"],
      addRules: [rule("next", ["second"], "other")]};
    if (field === "premises") patch.addRules[0].premises = Array(1);
    else patch[field] = Array(1);
    assert.throws(() => graph.revise(patch), TypeError, field);
    assert.deepEqual(snapshot(), before, field);
    assert.deepEqual(graph.revise({}).affected, []);
  }
});

test("an explicitly empty prerequisite list still differs from a missing slot", () => {
  const graph = createCorrectionWave({rules: [rule("unconditional", [], "given") ]});
  assert.equal(graph.has("given"), true);
  assert.equal(graph.has(undefined), false);
  graph.revise({addFacts: ["second", "first"],
    addRules: [rule("ordered", ["second", "first", "first"], "result")]});
  assert.deepEqual(graph.explain("result").rules, [rule("ordered", ["first", "second"], "result")]);
});

test("a single checked counterexample withdraws its dependents and preserves independent grounds", () => {
  const alternative = rule("alternative", ["independent"], "still-supported");
  const graph = createCorrectionWave({
    facts: ["universal-access", "independent", "unrelated"],
    rules: [
      rule("assume-access", ["universal-access"], "first-conclusion"),
      rule("downstream", ["first-conclusion"], "transitive-conclusion"),
      rule("by-access", ["universal-access"], "still-supported"),
      alternative,
      rule("retain", ["still-supported"], "retained-conclusion"),
      rule("require-access", ["universal-access", "independent"], "joint-conclusion")
    ]
  });

  const change = graph.revise({removeFacts: ["universal-access"], addFacts: ["not-universal-access"]});

  assert.deepEqual(change.affected, ["first-conclusion", "joint-conclusion", "not-universal-access",
    "retained-conclusion", "still-supported", "transitive-conclusion", "universal-access"]);
  assert.deepEqual(change.gained, ["not-universal-access"]);
  assert.deepEqual(change.lost, ["first-conclusion", "joint-conclusion", "transitive-conclusion", "universal-access"]);
  assert.ok(change.explanationsChanged.includes("still-supported"));
  assert.equal(graph.has("retained-conclusion"), true);
  assert.equal(graph.has("unrelated"), true);
  assert.deepEqual(graph.explain("still-supported"), {fact: false, rules: [alternative]});
});

test("replacing a rule traces the old and new heads and recomputes both branches", () => {
  const replacement = rule("routing", ["new-condition"], "new-branch");
  const graph = createCorrectionWave({
    facts: ["old-condition", "new-condition"],
    rules: [
      rule("routing", ["old-condition"], "old-branch"),
      rule("old-branch-child", ["old-branch"], "old-child"),
      rule("new-branch-child", ["new-branch"], "new-child")
    ]
  });

  const change = graph.revise({removeRules: ["routing"], addRules: [replacement]});

  assert.deepEqual(change.affected, ["new-branch", "new-child", "old-branch", "old-child"]);
  assert.deepEqual(change.gained, ["new-branch", "new-child"]);
  assert.deepEqual(change.lost, ["old-branch", "old-child"]);
  assert.deepEqual(graph.explain("new-branch"), {fact: false, rules: [replacement]});
});

test("replacing a grounded rule under the same ID updates the explanation without changing its conclusion", () => {
  const replacement = rule("source", ["second"], "result");
  const graph = createCorrectionWave({
    facts: ["first", "second"],
    rules: [rule("source", ["first"], "result")]
  });

  const change = graph.revise({removeRules: ["source"], addRules: [replacement]});

  assert.deepEqual(change.gained, []);
  assert.deepEqual(change.lost, []);
  assert.deepEqual(change.explanationsChanged, ["result"]);
  assert.deepEqual(graph.explain("result"), {fact: false, rules: [replacement]});
});

test("a cycle becomes grounded from outside and retracts when that ground is withdrawn", () => {
  const graph = createCorrectionWave({
    facts: [],
    rules: [rule("from-b", ["b"], "a"), rule("from-a", ["a"], "b"), rule("child", ["b"], "c")]
  });

  assert.equal(graph.has("a"), false);
  assert.equal(graph.has("b"), false);
  assert.equal(graph.has("c"), false);
  assert.deepEqual(graph.revise({addFacts: ["a"]}).gained, ["a", "b", "c"]);
  assert.deepEqual(graph.revise({removeFacts: ["a"]}).lost, ["a", "b", "c"]);
  assert.deepEqual(graph.explain("b"), {fact: false, rules: []});
});

test("an invalid rule replacement leaves the previous closure intact", () => {
  const original = rule("basis", ["first"], "result");
  const graph = createCorrectionWave({facts: ["first"], rules: [original]});

  assert.throws(() => graph.revise({
    removeFacts: ["first"],
    addFacts: ["second"],
    addRules: [rule("basis", ["second"], "result")]
  }));
  assert.throws(() => graph.revise({removeFact: ["first"]}), /Unknown revision field/);

  assert.equal(graph.has("first"), true);
  assert.equal(graph.has("second"), false);
  assert.equal(graph.has("result"), true);
  assert.deepEqual(graph.explain("result"), {fact: false, rules: [original]});
});

function fullClosure(facts, rules) {
  const derived = new Set(facts);
  let previousSize;
  do {
    previousSize = derived.size;
    for (const {premises, conclusion} of rules) {
      if (premises.every(premise => derived.has(premise))) derived.add(conclusion);
    }
  } while (derived.size !== previousSize);
  return derived;
}

test("incremental closures match full recomputation across fact and rule changes", () => {
  const claims = ["a", "b", "c", "d", "e", "f"];
  const facts = new Set(["a"]);
  const rules = new Map();
  const graph = createCorrectionWave({facts: [...facts], rules: []});
  const updates = [
    {addRules: [rule("a-to-b", ["a"], "b"), rule("joint", ["b", "c"], "d")]},
    {addFacts: ["c"], addRules: [rule("cycle", ["d"], "a")]},
    {removeFacts: ["a"]},
    {addRules: [rule("alternative", ["c"], "b"), rule("chain", ["d"], "e")]},
    {removeRules: ["a-to-b", "chain"], addRules: [rule("chain", ["d"], "f")]},
    {removeFacts: ["c"], addFacts: ["a"]},
    {removeRules: ["cycle", "joint"], addFacts: ["e"]}
  ];

  for (const update of updates) {
    const before = fullClosure(facts, [...rules.values()]);
    for (const fact of update.removeFacts ?? []) facts.delete(fact);
    for (const fact of update.addFacts ?? []) facts.add(fact);
    for (const id of update.removeRules ?? []) rules.delete(id);
    for (const entry of update.addRules ?? []) rules.set(entry.id, entry);
    const after = fullClosure(facts, [...rules.values()]);
    const change = graph.revise(update);

    assert.deepEqual(claims.filter(claim => graph.has(claim)), claims.filter(claim => after.has(claim)));
    assert.deepEqual(change.gained, claims.filter(claim => !before.has(claim) && after.has(claim)));
    assert.deepEqual(change.lost, claims.filter(claim => before.has(claim) && !after.has(claim)));
  }
});

test("different arrival orders converge to the same closure and explanations", () => {
  const updates = [
    {addFacts: ["found", "reviewed"]},
    {addRules: [rule("basis", ["found", "reviewed"], "result")]},
    {addRules: [rule("follow-up", ["result"], "child"), rule("alternate", ["reviewed"], "child")]}
  ];
  const run = events => {
    const graph = createCorrectionWave({facts: [], rules: []});
    for (const event of events) graph.revise(event);
    return ["found", "reviewed", "result", "child"].map(claim => [graph.has(claim), graph.explain(claim)]);
  };

  const forward = run(updates);
  assert.ok(forward.every(([derived]) => derived));
  assert.deepEqual(run([...updates].reverse()), forward);
});
