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

test("the sibling conflict has a prepared conversation starter, with no match from partial wording", () => {
  for (const [lang, query, question, differentContext] of [
    ["de", "Meine Schwester sagt, ich melde mich immer nur, wenn ich etwas brauche. Ich finde das unfair.",
      "An welchen Moment hast du dabei gedacht?", "Meine Schwester sagt, ich melde mich nur, wenn ich etwas brauche. Sie droht mir deswegen."],
    ["en", "My sister says I only get in touch when I need something. I think that's unfair.",
      "Was there a particular time you were thinking of?", "My sister says I only get in touch when I need something. She threatened me over it."]
  ]) {
    const reply = firstAnswer(query, lang);
    assert.equal(reply.kind, "answer");
    assert.ok(reply.answer.includes(question));
    assert.ok(reply.followUp.length > 0);
    assert.equal(reply.href, `/Vera/${lang}/schnittmengen/#fragen`);
    assert.deepEqual(firstAnswer(differentContext, lang), { kind: "unknown" });
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

test("the question about moral good reaches the exercise without catching unrelated uses of good", () => {
  for (const [lang, question, unrelated] of [
    ["de", "Was ist gut?", "Was ist gut für meinen Garten?"],
    ["en", "What is good?", "What is good for my garden?"]
  ]) {
    const result = firstAnswer(question, lang);
    assert.equal(result.kind, "answer");
    assert.equal(result.href, `/Vera/${lang}/kollektive-moral/#was-ist-gut`);
    assert.deepEqual(firstAnswer(unrelated, lang), { kind: "unknown" });
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

test("a listening complaint opens the voluntary invitation only for a known whole wording", () => {
  for (const [lang, query, threat] of [
    ["de", "Die hört mir sowieso nie zu.", "Die hört mir sowieso nie zu. Ich habe Angst vor ihr."],
    ["en", "She never listens to me anyway.", "She never listens to me anyway. She threatened me."]
  ]) {
    const answer = firstAnswer(query, lang);
    assert.equal(answer.href, "/Vera/" + lang + "/schnittmengen/#zuhoeren");
    assert.equal(firstAnswer(answer.question, lang).href, answer.href);
    assert.equal(firstAnswer(threat, lang).kind, "unknown");
  }
});

test("a possible privacy concern takes priority over mixed-sentence care options", () => {
  assert.deepEqual(firstAnswer("Ich hasse jemanden. Ich habe Angst, dass er mitliest."), { kind: "unknown" });
  assert.deepEqual(firstAnswer("I hate someone. I'm afraid he might read this.", "en"), { kind: "unknown" });
});
