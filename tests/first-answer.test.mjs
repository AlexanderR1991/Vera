import assert from "node:assert/strict";
import test from "node:test";
import everyday from "../public/knowledge/everyday-questions.json" with { type: "json" };
import { firstAnswer } from "../src/lib/first-answer.mjs";

test("every published everyday question returns its actual editorial answer, challenge and local source", () => {
  for (const entry of everyday.questions) {
    for (const lang of ["de", "en"]) {
      const result = firstAnswer("  " + entry.question[lang].toUpperCase() + "  ", lang);
      assert.deepEqual(result, { kind: "answer", question: entry.question[lang], answer: entry.answer[lang],
        followUp: entry.challenge[lang], href: "/Vera/" + lang + "/forum/#alltag-" + entry.id });
    }
  }
});

test("a concrete ordinary dispute produces a usable opening or a worked example in either language", () => {
  for (const [query, lang, expected] of [
    ["Wir streiten ständig über Politik.", "de", "damit du darüber mit mir sprechen möchtest"],
    ["Bei uns endet jede Diskussion über Politik im Streit.", "de", "damit du darüber mit mir sprechen möchtest"],
    ["Mein Vater und ich streiten uns dauernd über Politik.", "de", "damit du darüber mit mir sprechen möchtest"],
    ["We keep arguing about politics.", "en", "to want to talk about this with me"],
    ["Wie können wir die Miete gerecht aufteilen?", "de", "450 €"],
    ["Should we split the rent in half?", "en", "€450"]
  ]) {
    const result = firstAnswer(query, lang);
    assert.equal(result.kind, "answer");
    assert.ok(result.answer.includes(expected));
    assert.match(result.href, /schnittmengen\/#(sprachprobe|vermittlung)$/u);
  }
});

test("either person can find the exit rule from the homepage before starting mediation", () => {
  for (const [lang, question, rule] of [
    ["de", "Müssen sich beide einig sein, dass einer gehen darf?", "endet die gemeinsame Runde sofort"],
    ["en", "Can I end the conversation even if we still disagree?", "the shared round ends immediately"]
  ]) {
    const result = firstAnswer(question, lang);
    assert.equal(result.kind, "answer");
    assert.ok(result.answer.includes(rule));
    assert.equal(result.href, "/Vera/" + lang + "/schnittmengen/#vermittlung");
  }
});

test("whole paraphrases yield the editorial source and self descriptions retain their evidence status", () => {
  assert.match(firstAnswer("Ich habe Angst, mich falsch zu entscheiden.").href, /alltag-entscheidung$/u);
  assert.match(firstAnswer("What if I make the wrong decision?", "en").href, /alltag-entscheidung$/u);
  assert.match(firstAnswer("Wer bist du?").href, /vera-fragen$/u);
  assert.match(firstAnswer("Who are you?", "en").answer, /I am Vera/u);
  assert.match(firstAnswer("Are you conscious?", "en").answer, /open/u);
  assert.match(firstAnswer("Gibt es schon ein Vera-Modell?").answer, /widerspricht/u);
});

test("a mixed question offers both sources, never a guessed answer", () => {
  const result = firstAnswer("Muss ich aus Liebe bleiben? Oder was, wenn ich die falsche Entscheidung treffe?");
  assert.equal(result.kind, "choices");
  assert.deepEqual(result.choices.map(choice => choice.href), ["/Vera/de/forum/#alltag-liebe", "/Vera/de/forum/#alltag-entscheidung"]);
  for (const choice of result.choices) assert.equal(firstAnswer(choice.question).href, choice.href);
});

test("unlisted descriptions can select a grounded exercise before receiving its answer", () => {
  for (const [query, lang, anchor] of [
    ["Jedes Mal, wenn mein Bruder und ich über Politik reden, gibt es Streit.", "de", "vermittlung"],
    ["Kannst du uns beim Streit über Politik helfen?", "de", "vermittlung"],
    ["Every family dinner ends in arguments about politics. How do we get out of this?", "en", "vermittlung"],
    ["Meine Partnerin verdient doppelt so viel wie ich. Wie teilen wir unsere Miete?", "de", "sprachprobe"],
    ["Our salaries are very different. How should the two of us split rent?", "en", "sprachprobe"]
  ]) {
    const result = firstAnswer(query, lang);
    assert.equal(result.kind, "choices");
    assert.equal(result.choices.length, 1);
    const [choice] = result.choices;
    assert.ok(choice.href.endsWith("#" + anchor));
    assert.equal(firstAnswer(choice.question, lang).kind, "answer");
  }
});

test("empty, unrelated and incidental words do not trigger personal advice", () => {
  for (const value of [" ", null, undefined]) assert.deepEqual(firstAnswer(value), { kind: "empty" });
  for (const [query, lang] of [["Wer spielt morgen Fußball?", "de"], ["Wrong number?", "en"],
    ["Ich liebe Eis. Wie lange muss es im Gefrierfach bleiben?", "de"],
    ["I love my cat. Why does she stay outdoors?", "en"],
    ["Wir streiten ständig über Politik. Er hat mir gedroht.", "de"],
    ["Wie hoch ist die Miete in Berlin?", "de"], ["Politik", "de"], ["Liebe", "de"]]) {
    assert.equal(firstAnswer(query, lang).kind, "unknown");
  }
  assert.notEqual(firstAnswer("Wir streiten nicht über Politik.").kind, "answer");
});
