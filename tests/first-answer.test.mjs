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

test("whole paraphrases yield the editorial source and self descriptions retain their evidence status", () => {
  assert.match(firstAnswer("Ich habe Angst, mich falsch zu entscheiden.").href, /alltag-entscheidung$/u);
  assert.match(firstAnswer("What if I make the wrong decision?", "en").href, /alltag-entscheidung$/u);
  assert.match(firstAnswer("Wer bist du?").href, /vera-fragen$/u);
  assert.match(firstAnswer("Who are you?", "en").answer, /I am Vera/u);
  assert.match(firstAnswer("Are you conscious?", "en").answer, /open/u);
  assert.match(firstAnswer("Gibt es schon ein Vera-Modell?").answer, /widerspricht/u);
});

test("hatred alone keeps the same response while explicit threats get role-specific protection", () => {
  for (const [lang, feeling, stronger, threatened, aboutToHurt, protect, keepAway] of [
    ["de", "Ich hasse jemanden.", "ICH HASSE JEMANDEN UNENDLICH!", "Jemand droht mir, mich zu schlagen.",
      "Ich gehe jetzt rüber und schlage ihn.", /sicheren Ort/u, /bleib ihr fern/u],
    ["en", "I hate someone.", "I HATE SOMEONE SO MUCH!", "Someone is threatening to hit me.",
      "I'm going to hit her now.", /safe place/u, /stay away/u]
  ]) {
    const listening = firstAnswer(feeling, lang);
    assert.ok(listening.href.endsWith("#hass"));
    assert.deepEqual(firstAnswer(stronger, lang), listening);
    for (const [query, id, action] of [[threatened, "bedroht", protect], [aboutToHurt, "gewalt-stoppen", keepAway]]) {
      const reply = firstAnswer(query, lang);
      assert.equal(reply.href, "/Vera/" + lang + "/schnittmengen/#" + id);
      assert.match(reply.answer, action);
      assert.equal(reply.followUp, "");
    }
  }
});

test("incidental or negated wording cannot select a care scenario for the visitor", () => {
  for (const [query, lang] of [
    ["Ich hasse diesen Drucker.", "de"], ["I hate this printer.", "en"],
    ["Niemand droht mir, mich zu schlagen.", "de"], ["Nobody is threatening to hit me.", "en"]
  ]) {
    assert.deepEqual(firstAnswer(query, lang), { kind: "unknown" });
  }
});

test("an extra sentence can change the situation, including who is at risk", () => {
  for (const [query, lang] of [
    ["Ich hasse jemanden. Er sagt, er schlägt mich heute Abend.", "de"],
    ["Someone is threatening to hit me. I hate someone.", "en"]
  ]) {
    const result = firstAnswer(query, lang);
    assert.equal(result.kind, "choices");
    assert.deepEqual(result.choices.map(c => c.href.split("#")[1]), ["bedroht", "gewalt-stoppen", "hass"]);
    for (const choice of result.choices) assert.equal(firstAnswer(choice.question, lang).href, choice.href);
  }
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
