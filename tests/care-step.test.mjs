import test from "node:test";
import assert from "node:assert/strict";
import { assessCareStep, createCareStep, updateCareStep } from "../src/lib/care-step.mjs";

const wording = "May I listen for a minute and tell you what I heard?";
const start = (people = ["A", "B"]) => createCareStep(people, wording);
const reply = (state, person, value) => updateCareStep(state, { type: "reply", person, value });
const effect = (state, person, value) => updateCareStep(state, { type: "effect", person, value });
const tried = state => updateCareStep(state, { type: "tried" });
const status = state => assessCareStep(state).status;
const ready = (people = ["A", "B"]) => people.reduce((s, p) => reply(s, p, "try"), start(people));

test("an unrepresented or silent participant cannot be counted as willing or helped", () => {
  for (const people of [[], ["A", "A"], ["A", ""], ["A", null]]) assert.throws(() => start(people));
  assert.throws(() => createCareStep(["A"], "  "));
  const initial = start();
  const one = reply(initial, "A", "try");
  assert.equal(status(one), "waiting");
  assert.equal(initial.replies.A, "pending");
  assert.throws(() => reply(one, "moderator", "try"));
  assert.throws(() => tried(one));
  assert.throws(() => effect(one, "A", "helped"));
  const both = reply(one, "B", "try");
  assert.equal(status(both), "ready");
  assert.throws(() => effect(both, "B", "helped"));
  assert.deepEqual(tried(both).effects, { A: "pending", B: "pending" });
});

test("a correction blocks the same wording and a new invitation needs wholly new answers", () => {
  const corrected = reply(ready(), "B", "correct");
  assert.equal(status(corrected), "revise");
  assert.throws(() => tried(corrected));
  assert.throws(() => reply(corrected, "B", "try"));
  assert.equal(updateCareStep(corrected, { type: "rewrite", wording: " " + wording }), corrected);
  const fresh = updateCareStep(corrected, { type: "rewrite", wording: "Would a written note suit you?" });
  assert.deepEqual(fresh.replies, { A: "pending", B: "pending" });
  assert.equal(status(fresh), "waiting");
  const after = reply(effect(tried(ready()), "A", "helped"), "B", "correct");
  assert.equal(status(after), "revise");
  const next = updateCareStep(after, { type: "rewrite", wording: "Shall we pause?" });
  assert.equal(next.tried, false);
  assert.equal(next.effects.A, "pending");
});

test("a refusal or report of pressure ends the invitation at any stage", () => {
  for (const [value, expected] of [["decline", "stopped"], ["unsafe", "unsafe"]]) {
    for (const phase of [start(), ready(), tried(ready()), effect(tried(ready()), "B", "helped")]) {
      const stopped = reply(phase, "B", value);
      assert.equal(status(stopped), expected);
      assert.throws(() => tried(stopped));
      assert.throws(() => updateCareStep(stopped, { type: "rewrite", wording: "One more try?" }));
      assert.throws(() => reply(stopped, "B", "try"));
      assert.throws(() => reply(stopped, "B", "correct"));
      assert.equal(status(reply(stopped, "A", "decline")), expected);
    }
  }
  assert.equal(status(reply(reply(ready(), "A", "decline"), "B", "unsafe")), "unsafe");
});

test("even unanimous permission can end with different or missing individual effects", () => {
  const partial = effect(tried(ready()), "A", "helped");
  assert.equal(status(partial), "trying");
  assert.equal(partial.effects.B, "pending");
  const mixed = effect(partial, "B", "unchanged");
  assert.equal(status(mixed), "reported");
  assert.deepEqual(mixed.effects, { A: "helped", B: "unchanged" });
  assert.equal(status(effect(mixed, "A", "worse")), "review");
  assert.equal(status(reply(mixed, "A", "decline")), "stopped");
});

test("one person's reported harm cannot be offset, even if everyone else reports help", () => {
  const people = Array.from({ length: 100 }, (_, i) => String(i));
  const initial = tried(ready(people));
  function collect(order) {
    return order.reduce((state, p) => effect(state, p, p === "0" ? "worse" : "helped"), initial);
  }
  const harmed = collect(people);
  assert.deepEqual(harmed, collect([...people].reverse()));
  assert.equal(status(harmed), "review");
  assert.equal(harmed.effects["99"], "helped");
  assert.throws(() => tried(harmed));
  assert.throws(() => effect(harmed, "0", "helped"));
  assert.throws(() => updateCareStep(harmed, { type: "rewrite", wording: "Try it again?" }));
  const stopped = reply(initial, "0", "decline");
  assert.equal(status(effect(stopped, "99", "helped")), "stopped");
});
