import test from "node:test";
import assert from "node:assert/strict";
import {createParticipationQueue} from "../src/lib/participation-queue.mjs";

test("exact replays keep one receipt while identical texts with different IDs stay separate", () => {
  const queue = createParticipationQueue();
  const input = {id: "first", text: "  Zustimmung.\n"};
  const receipt = queue.submit(input);
  assert.equal(receipt.status, "pending");
  assert.equal(receipt.text, input.text);
  assert.deepEqual(queue.submit(input), receipt);
  assert.equal(queue.submit({...input, id: "second"}).id, "second");
  assert.throws(() => queue.submit({...input, text: "Another contribution"}), /Conflicting/);
  assert.throws(() => queue.submit({...input, lane: "unknown"}), /configured review lane/);

  assert.equal(queue.next().id, "first");
  assert.equal(queue.submit(input).status, "reviewing");
  assert.equal(queue.next().id, "second");
  assert.equal(queue.next(), null);
});

test("a rare language gets its next turn even behind 10,000 similar submissions", () => {
  const queue = createParticipationQueue({lanes: ["de", "pl"]});
  for (let index = 0; index < 10_000; index++) {
    queue.submit({id: `support-${index}`, lane: "de", text: "Alle können teilnehmen."});
  }
  queue.submit({id: "objection", lane: "pl", text: "Nie mogę wziąć udziału bez telefonu."});

  assert.equal(queue.next().id, "support-0");
  assert.equal(queue.next().id, "objection");
  const reviewed = queue.complete("objection", {outcome: "objection", reason: "Access requirement disputed"});
  assert.equal(reviewed.status, "completed");
  assert.deepEqual(reviewed.history, [{type: "completed", outcome: "objection", reason: "Access requirement disputed"}]);

  // When the Polish lane is empty, German submissions can use each remaining turn.
  for (let index = 1; index < 10_000; index++) {
    assert.equal(queue.next().id, `support-${index}`);
  }
  assert.equal(queue.next(), null);
});

test("an appeal requeues the original at the back of its lane and preserves review history", () => {
  const queue = createParticipationQueue();
  queue.submit({id: "a", text: "I have a specific objection."});
  queue.submit({id: "b", text: "Another contribution"});
  assert.throws(() => queue.appeal("a", "Reason"), /must be completed/);
  assert.throws(() => queue.complete("a", {outcome: "grouped", reason: "Reason"}), /must be reviewing/);

  assert.equal(queue.next().id, "a");
  assert.throws(() => queue.complete("a", {outcome: "grouped", reason: " "}), /needs an outcome and a reason/);
  const originalReview = queue.complete("a", {outcome: "grouped", reason: "Looks like an existing entry"});
  originalReview.history[0].reason = "Changed by caller";
  assert.equal(queue.appeal("a", "The scope is different").status, "pending");
  assert.throws(() => queue.appeal("a", "Duplicate appeal"), /must be completed/);
  assert.equal(queue.next().id, "b");
  assert.equal(queue.next().id, "a");
  queue.complete("a", {outcome: "unresolved", reason: "Scope needs clarification"});

  assert.deepEqual(queue.get("a"), {
    id: "a", lane: "default", text: "I have a specific objection.", status: "completed",
    history: [
      {type: "completed", outcome: "grouped", reason: "Looks like an existing entry"},
      {type: "appealed", reason: "The scope is different"},
      {type: "completed", outcome: "unresolved", reason: "Scope needs clarification"}
    ]
  });
  assert.equal(queue.get("unknown"), null);
});
