import test from "node:test";
import assert from "node:assert/strict";
import { assessMirror, createMirror, updateMirror } from "../src/lib/reciprocal-mirror.mjs";

function turn(state, type, actor, text) {
  return updateMirror(state, { type, actor, text });
}

function together(state = createMirror()) {
  return turn(turn(state, "ready", "A"), "ready", "B");
}

function reflectedBoth() {
  let state = together();
  state = turn(state, "original", "A", "I want quiet on Sunday mornings.");
  state = turn(state, "original", "B", "I want the workshop open all weekend.");
  state = turn(state, "reflect", "A", "You want to use the workshop on both days.");
  return turn(state, "reflect", "B", "You want the workshop closed all Sunday.");
}

test("both speakers can recognise each other's account while their own positions still differ", () => {
  let state = reflectedBoth();
  assert.deepEqual(assessMirror(state).pairs, { A: "needs_review", B: "needs_review" });
  state = turn(state, "confirm", "B");
  state = turn(state, "request", "A", "Only the morning matters to me.");
  assert.deepEqual(assessMirror(state).pairs, { A: "changes_requested", B: "confirmed" });
  assert.equal(assessMirror(state).bothConfirmed, false);
  assert.throws(() => turn(state, "confirm", "A"));
  state = turn(state, "reflect", "B", "A quiet Sunday morning matters to you.");
  assert.equal(state.pairs.A.correction, "Only the morning matters to me.");
  assert.deepEqual(assessMirror(state).pairs, { A: "needs_review", B: "confirmed" });
  state = turn(state, "confirm", "A");
  assert.equal(assessMirror(state).bothConfirmed, true);
  assert.equal(state.pairs.A.original, "I want quiet on Sunday mornings.");
  assert.equal(state.pairs.B.original, "I want the workshop open all weekend.");
  assert.equal(state.pairs.A.correction, "");
  assert.equal(assessMirror(turn(state, "reopen", "B")).bothConfirmed, false);
});

test("only the opposite turn writes the reflection and only the original speaker can approve it", () => {
  for (const [speaker, listener] of [["A", "B"], ["B", "A"]]) {
    const stated = turn(together(), "original", speaker, "My view.");
    assert.throws(() => turn(stated, "reflect", speaker, "My own restatement."));
    const reflected = turn(stated, "reflect", listener, "Your point.");
    assert.throws(() => turn(reflected, "confirm", listener));
    assert.throws(() => turn(reflected, "request", listener, "Please change it."));
    assert.equal(assessMirror(turn(reflected, "confirm", speaker)).pairs[speaker], "confirmed");
    assert.equal(assessMirror(reflected).pairs[speaker], "needs_review");
  }
});

test("a request can stand without a reason and requires fresh wording or explicit withdrawal", () => {
  const request = turn(reflectedBoth(), "request", "A");
  const rejected = request.pairs.A.reflection;
  assert.equal(request.pairs.A.correction, "");
  const revision = turn(request, "reflect", "B", "Perhaps you mean the morning?");
  assert.equal(assessMirror(revision).pairs.A, "needs_review");
  for (const wording of [rejected, " " + rejected + " "]) {
    const reverted = turn(revision, "reflect", "B", wording);
    assert.equal(assessMirror(reverted).pairs.A, "changes_requested");
    assert.throws(() => turn(reverted, "confirm", "A"));
  }
  const withdrawn = turn(request, "reopen", "A");
  assert.equal(assessMirror(withdrawn).pairs.A, "needs_review");
  assert.equal(assessMirror(turn(withdrawn, "confirm", "A")).pairs.A, "confirmed");
});

test("rewording invalidates only the affected pair; unchanged text preserves both reviews", () => {
  const confirmed = turn(turn(reflectedBoth(), "confirm", "A"), "confirm", "B");
  for (const [speaker, listener] of [["A", "B"], ["B", "A"]]) {
    const pair = confirmed.pairs[speaker];
    assert.equal(turn(confirmed, "original", speaker, pair.original), confirmed);
    assert.equal(turn(confirmed, "reflect", listener, pair.reflection), confirmed);
    const revised = turn(confirmed, "reflect", listener, "A slightly different reading.");
    assert.equal(assessMirror(revised).pairs[speaker], "needs_review");
    assert.equal(revised.pairs[listener], confirmed.pairs[listener]);

    const requested = turn(revised, "request", speaker, "Something was missed.");
    const replaced = turn(requested, "original", speaker, "My view has changed.");
    assert.deepEqual(replaced.pairs[speaker], {
      ...createMirror().pairs[speaker], original: "My view has changed."
    });
    assert.equal(assessMirror(replaced).pairs[speaker], "needs_reflection");
    assert.equal(replaced.pairs[listener], confirmed.pairs[listener]);
    assert.equal(assessMirror(confirmed).bothConfirmed, true);
  }
});

test("blank fields, silence and unrecognised turns never produce confirmation", () => {
  let state = together();
  for (const actor of [undefined, null, "moderator", "both", "__proto__"]) {
    for (const type of ["ready", "original", "reflect", "request", "confirm", "reopen"]) {
      assert.throws(() => turn(state, type, actor, "test"), TypeError);
    }
  }
  for (const text of [null, 3, {}]) {
    assert.throws(() => turn(state, "original", "B", text), TypeError);
    assert.throws(() => turn(reflectedBoth(), "reflect", "B", text), TypeError);
    assert.throws(() => turn(reflectedBoth(), "request", "B", text), TypeError);
  }
  assert.throws(() => turn(state, "accept_for_both", "A"), TypeError);
  state = turn(state, "original", "A", "  ");
  assert.equal(assessMirror(state).pairs.A, "needs_original");
  assert.throws(() => turn(state, "reflect", "B", "Something."));
  state = turn(turn(reflectedBoth(), "confirm", "A"), "reflect", "B", "\n  ");
  assert.equal(assessMirror(state).pairs.A, "needs_reflection");
  assert.throws(() => turn(state, "confirm", "A"));
  assert.throws(() => turn(state, "request", "A"));
  assert.equal(assessMirror(state).bothConfirmed, false);
});

test("each start or resumption requires two choices and hides previous assessments while paused", () => {
  const confirmed = turn(turn(reflectedBoth(), "confirm", "B"), "confirm", "A");
  for (const gated of [createMirror(), turn(confirmed, "pause"), turn(confirmed, "uncertain")]) {
    for (const [first, second] of [["A", "B"], ["B", "A"]]) {
      const half = turn(gated, "ready", first);
      assert.equal(turn(half, "ready", first), half);
      for (const waiting of [gated, half]) {
        assert.deepEqual(assessMirror(waiting), {
          status: gated.session.participation, pairs: { A: "unassessed", B: "unassessed" }, bothConfirmed: false
        });
        for (const type of ["original", "reflect", "request", "confirm", "reopen"]) {
          assert.throws(() => turn(waiting, type, "A", "I want a change."));
        }
      }
      const resumed = turn(half, "ready", second);
      assert.equal(assessMirror(resumed).bothConfirmed, gated.session.participation !== "waiting");
    }
  }
});

test("stopping even from a pause clears original, restatement, correction and review for both roles", () => {
  const withRequest = turn(turn(reflectedBoth(), "confirm", "B"), "request", "A", "A private correction.");
  for (const before of [createMirror(), withRequest, turn(withRequest, "pause")]) {
    const stopped = turn(before, "stop");
    assert.deepEqual(stopped.pairs, createMirror().pairs);
    assert.deepEqual(stopped.session.ready, { A: false, B: false });
    assert.equal(assessMirror(stopped).status, "stopped");
    for (const type of ["ready", "pause", "uncertain", "original", "reflect", "confirm", "request", "reopen"]) {
      assert.throws(() => turn(stopped, type, "B", "I want to continue."));
    }
  }
});
