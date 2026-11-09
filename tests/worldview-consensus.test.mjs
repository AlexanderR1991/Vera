import test from "node:test";
import assert from "node:assert/strict";
import { evaluateWorldviewOptions } from "../src/lib/worldview-consensus.mjs";

test("agreement on a meal coexists with an objection to requiring prayer", () => {
  const rows = evaluateWorldviewOptions(["a", "b"], [
    { id: "offer-meal-v1", responses: { b: "agree", a: "agree" } },
    { id: "require-prayer-v1", responses: { a: "agree", b: "object" } },
    { id: "offer-meal-v2", responses: {} }
  ]);
  assert.deepEqual(rows, [
    { id: "offer-meal-v1", state: "shared", agree: ["a", "b"], object: [], pass: [], pending: [] },
    { id: "require-prayer-v1", state: "object", agree: ["a"], object: ["b"], pass: [], pending: [] },
    { id: "offer-meal-v2", state: "open", agree: [], object: [], pass: [], pending: ["a", "b"] }
  ]);
});

test("a source, a pass and a missing answer cannot supply an agreement", () => {
  const [row] = evaluateWorldviewOptions(["a", "b", "c", "d"], [{
    id: "meal", sources: ["example text"], responses: { a: "agree", b: "pass", c: "pending" }
  }]);
  assert.deepEqual(row, { id: "meal", state: "open", agree: ["a"], object: [], pass: ["b"], pending: ["c", "d"] });
});

test("pairwise overlap need not give a shared action for the full group", () => {
  const people = ["a", "b", "c"];
  const options = [
    { id: "ab", responses: { a: "agree", b: "agree", c: "object" } },
    { id: "bc", responses: { a: "object", b: "agree", c: "agree" } },
    { id: "ac", responses: { a: "agree", b: "object", c: "agree" } }
  ];
  const rows = evaluateWorldviewOptions(people, options);
  assert.deepEqual(rows.map(row => row.agree), [["a", "b"], ["b", "c"], ["a", "c"]]);
  assert.ok(rows.every(row => row.state === "object"));
});

test("empty scopes cannot produce a shared action", () => {
  assert.deepEqual(evaluateWorldviewOptions(["a"], []), []);
  assert.equal(evaluateWorldviewOptions([], [{ id: "x", responses: {} }])[0].state, "open");
});

test("participant IDs are data even when they name inherited object properties", () => {
  const people = ["toString", "__proto__"];
  const responses = { ["__proto__"]: "agree" };
  const [row] = evaluateWorldviewOptions(people, [{ id: "x", responses }]);
  assert.deepEqual(row.pending, ["toString"]);
  assert.deepEqual(row.agree, ["__proto__"]);
  assert.equal(row.state, "open");
});

test("invalid inputs cannot drop parties, merge options or invent responses", () => {
  const option = { id: "x", responses: {} };
  const invalid = [
    [null, []], [[], null], [["a", "a"], []], [[" "], []], [[1], []],
    [["a"], [option, option]], [[], [{ id: "", responses: {} }]], [[], [{}]], [[], [null]],
    [["a"], [{ id: "x" }]], [["a"], [{ id: "x", responses: [] }]],
    [["a"], [{ id: "x", responses: { b: "agree" } }]],
    [["a"], [{ id: "x", responses: Object.create({ a: "agree" }) }]]
  ];
  for (const [people, options] of invalid) {
    assert.throws(() => evaluateWorldviewOptions(people, options), TypeError);
  }
  for (const value of ["unknown", "constructor", true, undefined, null]) {
    assert.throws(() => evaluateWorldviewOptions(["a"], [{ id: "x", responses: { a: value } }]), TypeError);
  }
});
