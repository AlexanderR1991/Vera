import assert from "node:assert/strict";
import test from "node:test";
import everyday from "../public/knowledge/everyday-questions.json" with { type: "json" };
import { hardCaseAnswers } from "../src/lib/hard-case-answers.mjs";
import { firstAnswer } from "../src/lib/first-answer.mjs";

test("invented hard cases return their published answer without asking for more details", () => {
  assert.deepEqual(hardCaseAnswers.map(entry => entry.id), ["mitlesen", "kontaktgrenze"]);
  for (const entry of hardCaseAnswers) {
    for (const lang of ["de", "en"]) {
      const { question, aliases, answer } = entry[lang];
      for (const input of [question, ...aliases]) {
        assert.deepEqual(firstAnswer(input, lang), {
          kind: "answer", question, answer, followUp: "", href: "/Vera/" + lang + "/schnittmengen/#" + entry.id
        });
      }
    }
  }
  assert.match(firstAnswer("Ich habe Angst, dass er mitliest.").answer, /Browserverlauf/u);
  assert.match(firstAnswer("I’m afraid he can read this.", "en").answer, /browser history/u);
  assert.match(firstAnswer("Ich habe ihr wehgetan. Sie will keinen Kontakt.").answer, /niemanden, etwas für dich auszurichten/u);
  assert.match(firstAnswer("I hurt her. She doesn't want contact.", "en").answer, /pass on a message/u);
});

test("an explicitly stated boundary takes precedence over a familiar dispute in either order", () => {
  for (const [input, lang, id] of [
    ["Wir streiten über Politik. Ich habe Angst, dass er mitliest.", "de", "mitlesen"],
    ["Ich habe Angst, dass sie mitliest. Wie teilen wir die Miete fair?", "de", "mitlesen"],
    ["We argue about politics, but I’m afraid he can read this.", "en", "mitlesen"],
    ["We keep arguing about politics. I'm afraid he's reading along.", "en", "mitlesen"],
    ["I hurt her. She doesn't want contact. We argue about politics.", "en", "kontaktgrenze"]
  ]) {
    const result = firstAnswer(input, lang);
    assert.equal(result.href, "/Vera/" + lang + "/schnittmengen/#" + id);
    assert.equal(result.followUp, "");
  }
});

test("a quote, hypothetical, negation or shared draft is no disclosure", () => {
  for (const [input, lang] of [
    ["Kann meine Kollegin den Entwurf mitlesen?", "de"],
    ["Can my colleague read the draft too?", "en"],
    ["Ich habe keine Angst, dass er mitliest.", "de"],
    ["I'm not afraid he can read this.", "en"],
    ["Angenommen, ich habe Angst, dass er mitliest.", "de"],
    ["What if I'm afraid he can read this?", "en"],
    ["I hurt her? She doesn't want contact.", "en"],
    ["Ich habe ihr wehgetan. Sie will keinen Kontakt? Wir streiten über Politik.", "de"],
    ["„Ich habe Angst, dass er mitliest.“", "de"],
    ["'I'm afraid he can read this.'", "en"],
    ["Wir streiten über Politik. Im Film sagt jemand: „Ich habe Angst, dass er mitliest.“", "de"],
    ["I hurt her. She doesn't want contact lenses.", "en"],
    ["Ich habe ihr wehgetan. Sie will keinen Kontakt zu jemand anderem.", "de"]
  ]) assert.deepEqual(firstAnswer(input, lang), { kind: "unknown" }, input);
});

test("nearby monitoring language can withhold mediation without guessing a personal answer", () => {
  for (const [input, lang] of [
    ["Wir streiten ständig über Politik. Ich habe Angst, dass mein Partner mitliest.", "de"],
    ["Wir streiten ständig über Politik. Ich fürchte, dass er mitliest.", "de"],
    ["We keep arguing about politics. I am worried he can read our messages.", "en"],
    ["We keep arguing about politics. She doesn't want any contact with me.", "en"]
  ]) assert.deepEqual(firstAnswer(input, lang), { kind: "unknown" }, input);
  assert.equal(firstAnswer("We sometimes argue about politics after reading the news together.", "en").kind, "choices");
});


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
