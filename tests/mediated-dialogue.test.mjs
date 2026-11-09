import test from "node:test";
import assert from "node:assert/strict";
import { createDialogue, updateDialogue, assessDialogue } from "../src/lib/mediated-dialogue.mjs";

function framed() {
  return updateDialogue(createDialogue(), {
    type: "frame", owner: "B", proposal: "Trial the car-free square for three months.",
    condition: "Residents can amend the plan before the council votes."
  });
}

function answer(state, actor, phase, kind, value) {
  return updateDialogue(state, { type: "answer", actor, phase, kind, value });
}

function observe(state, actor) {
  return updateDialogue(state, { type: "observe", actor });
}

test("willingness to listen can open while the proposal is still rejected", () => {
  let state = answer(framed(), "B", "today", "listen", "no");
  state = answer(state, "B", "today", "support", "no");
  for (const actor of ["A", "B"]) state = answer(state, actor, "ifChanged", "listen", "yes");
  state = answer(state, "A", "ifChanged", "support", "yes");
  state = answer(state, "B", "ifChanged", "support", "no");
  assert.deepEqual(assessDialogue(state), {
    status: "active", listeningBridge: true, supportBridge: false, afterChange: "unobserved"
  });
});

test("a newly possible bridge requires a recorded baseline objection and two conditional yeses", () => {
  for (const before of ["open", "abstain", "yes", "no"]) {
    for (const afterA of ["open", "abstain", "yes", "no"]) {
      for (const afterB of ["open", "abstain", "yes", "no"]) {
        let state = answer(framed(), "B", "today", "support", before);
        state = answer(state, "A", "ifChanged", "support", afterA);
        state = answer(state, "B", "ifChanged", "support", afterB);
        assert.equal(assessDialogue(state).supportBridge, before === "no" && afterA === "yes" && afterB === "yes");
      }
    }
  }
});

test("two predictions and two reports of implementation still require two fresh votes", () => {
  let state = answer(framed(), "B", "today", "support", "no");
  for (const actor of ["A", "B"]) state = answer(state, actor, "ifChanged", "support", "yes");
  state = observe(state, "A");
  state = observe(state, "A");
  assert.equal(state.observed, false);
  assert.throws(() => answer(state, "A", "afterChange", "support", "yes"));
  assert.throws(() => answer(state, "B", "today", "support", "yes"));
  state = observe(state, "B");
  assert.equal(assessDialogue(state).afterChange, "open");
  state = answer(state, "A", "afterChange", "support", "yes");
  assert.equal(assessDialogue(state).afterChange, "open");
  state = answer(state, "B", "afterChange", "support", "no");
  assert.equal(assessDialogue(state).supportBridge, true);
  assert.equal(assessDialogue(state).afterChange, "objected");
  state = answer(state, "B", "afterChange", "support", "yes");
  assert.equal(assessDialogue(state).afterChange, "agreed");
  state = answer(state, "A", "afterChange", "support", "abstain");
  assert.equal(assessDialogue(state).afterChange, "abstained");
  state = answer(state, "B", "afterChange", "support", "no");
  for (const otherAnswer of ["open", "no", "abstain", "yes"]) {
    const round = answer(state, "A", "afterChange", "support", otherAnswer);
    assert.equal(assessDialogue(round).afterChange, "objected");
    assert.equal(round.responses.afterChange.support.A, otherAnswer);
  }
});

test("withdrawing either implementation report clears all later answers", () => {
  let state = answer(framed(), "A", "today", "listen", "no");
  state = observe(observe(state, "A"), "B");
  state = answer(state, "B", "afterChange", "listen", "yes");
  state = answer(state, "B", "afterChange", "support", "yes");
  const reopened = updateDialogue(state, { type: "unobserve", actor: "A" });
  assert.deepEqual(reopened.responses.afterChange, createDialogue().responses.afterChange);
  assert.equal(state.responses.afterChange.support.B, "yes");
  assert.equal(reopened.responses.today.listen.A, "no");
  assert.deepEqual(reopened.observations, { A: false, B: false });
  assert.equal(assessDialogue(reopened).afterChange, "unobserved");
});

test("changing the proposal, condition or speaker invalidates every answer", () => {
  let state = answer(framed(), "B", "ifChanged", "support", "no");
  state = observe(observe(state, "A"), "B");
  state = answer(state, "A", "afterChange", "listen", "yes");
  assert.equal(updateDialogue(state, { type: "frame", condition: state.condition }), state);
  for (const field of [{ proposal: "Different proposal" }, { condition: "Different condition" }, { owner: "A" }]) {
    const revised = updateDialogue(state, { type: "frame", ...field });
    assert.deepEqual(revised.responses, createDialogue().responses);
    assert.equal(revised.observed, false);
    assert.equal(assessDialogue(revised).afterChange, "unobserved");
  }
  const rewritten = updateDialogue(state, { type: "frame", condition: "Someone else's wording" });
  assert.equal(rewritten.owner, null);
  assert.equal(assessDialogue(rewritten).status, "unframed");
});

test("a participant can stop at any point, clearing texts, observations and answers", () => {
  for (const actor of ["A", "B"]) {
    const stopped = updateDialogue(observe(framed(), "B"), { type: "stop", actor });
    assert.deepEqual(stopped, { ...createDialogue(), stopped: true });
    assert.equal(assessDialogue(stopped).status, "stopped");
    assert.throws(() => answer(stopped, actor, "today", "support", "yes"));
    assert.throws(() => updateDialogue(stopped, { type: "frame", proposal: "Reopen" }));
  }
});

test("a blank frame, AI roles, unrecognised votes and cross-case paths cannot create assent", () => {
  const start = createDialogue();
  assert.equal(assessDialogue(start).status, "unframed");
  assert.throws(() => observe(start, "B"));
  for (const field of [{ owner: null }, { proposal: " " }, { condition: "" }]) {
    const partial = updateDialogue(framed(), { type: "frame", ...field });
    assert.throws(() => answer(partial, "B", "today", "listen", "yes"));
  }
  for (const actor of ["assistantA", "assistantB", "mediator", "unknown"]) {
    assert.throws(() => observe(framed(), actor));
    assert.throws(() => answer(framed(), actor, "today", "listen", "yes"));
    assert.throws(() => updateDialogue(start, { type: "frame", owner: actor }));
  }
  assert.throws(() => answer(framed(), "B", "ifChanged", "supportsTruth", "yes"));
  assert.throws(() => answer(framed(), "B", "ifChanged", "support", "probable"));
  assert.throws(() => updateDialogue(framed(), { type: "importAgreement", actor: "A", sourceCase: "other" }));
});
