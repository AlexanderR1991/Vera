import assert from "node:assert/strict";
import test from "node:test";
import catalogue from "../public/research/mediation-cases.v1.json" with { type: "json" };
import { assessDialogue, createDialogue, updateDialogue } from "../src/lib/mediated-dialogue.mjs";
import { lessons, rememberedChecks, reviewDraft } from "../src/lib/mediation-lessons.mjs";

const eventFields = {
  frame: ["type", "proposal", "condition", "owner"],
  answer: ["type", "actor", "phase", "kind", "value"],
  observe: ["type", "actor"],
  unobserve: ["type", "actor"],
  stop: ["type", "actor"]
};

test("the bilingual exercise and its tests use the same versioned catalogue", () => {
  assert.equal(catalogue.version, 1);
  assert.deepEqual(lessons, catalogue.cases);
  const ids = lessons.map(lesson => lesson.id);
  assert.equal(ids.length, new Set(ids).size);
  for (const id of ["listen", "conditional", "recheck"]) assert.ok(ids.includes(id));
});

for (const lesson of lessons) {
  test(`synthetic mediation case: ${lesson.id}`, () => {
    assert.deepEqual(Object.keys(lesson).sort(), ["de", "en", "events", "expected", "id"]);
    assert.match(lesson.id, /^[a-z][a-z0-9-]*$/);
    for (const lang of ["de", "en"]) {
      assert.ok(Array.isArray(lesson[lang]));
      assert.equal(lesson[lang].length, 3, "Each case needs a question, story and expected outcome.");
      for (const line of lesson[lang]) assert.ok(typeof line === "string" && line.trim());
    }
    assert.ok(Array.isArray(lesson.events));
    assert.equal(lesson.events[0]?.type, "frame", "Start with the invented proposal and condition.");
    assert.ok(lesson.events[0].proposal.trim() && lesson.events[0].condition.trim());
    assert.ok(["A", "B"].includes(lesson.events[0].owner));
    for (const event of lesson.events) {
      assert.ok(Object.hasOwn(eventFields, event.type), "Use a supported model event.");
      for (const field of Object.keys(event)) assert.ok(eventFields[event.type].includes(field), field);
    }

    // Replay the production transitions, including the two reports before a fresh ballot.
    const finalState = lesson.events.reduce(updateDialogue, createDialogue());
    assert.deepEqual(assessDialogue(finalState), lesson.expected);
  });
}

test("local preferences keep each recognised check ID once and discard private fields", () => {
  const secret = "Invented private text, unsuitable for a public draft";
  const foreign = JSON.stringify(["recheck", { id: "listen", condition: secret }, secret, "listen", "recheck"]);
  assert.deepEqual(rememberedChecks(foreign), ["listen", "recheck"]);
  for (const value of [null, "{", "null", JSON.stringify(secret), JSON.stringify({ condition: secret })]) {
    assert.deepEqual(rememberedChecks(value), []);
  }
});

test("review drafts contain only fixed public copy for a recognised case and language", () => {
  const secret = "A private participant sentence";
  assert.equal(reviewDraft(secret, "de"), "");
  assert.equal(reviewDraft({ id: "listen", condition: secret }, "en"), "");
  assert.equal(reviewDraft("listen", secret), "");
  for (const lesson of lessons) {
    for (const lang of ["de", "en"]) {
      const draft = reviewDraft(lesson.id, lang);
      for (const line of lesson[lang]) assert.ok(draft.includes(line));
      assert.equal(reviewDraft(lesson.id, lang, { proposal: secret }), draft);
      assert.ok(!draft.includes(secret));
    }
  }
});
