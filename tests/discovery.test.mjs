import test from "node:test";
import assert from "node:assert/strict";
import {discover, patternsForTopic} from "../src/lib/discovery.mjs";
import {connections, findConnections} from "../src/lib/navigator.mjs";
import {topics} from "../src/lib/tree.mjs";

test("topic titles, questions and everyday terms identify the words that matched", () => {
  for (const [query, lang, id, word] of [
    ["Wie teilen wir die Miete?", "de", "konflikte", "Miete"],
    ["What if we split the RENT?", "en", "konflikte", "RENT"],
    ["Ku\u0308nstliche Intelligenz", "de", "technik", "Ku\u0308nstliche Intelligenz"],
    ["Kuenstliche Intelligenz", "de", "technik", "Kuenstliche Intelligenz"],
    ["Was hat Mathe damit zu tun?", "de", "mathematik", "Mathe"],
    ["Can artificial intelligence help?", "en", "technik", "artificial intelligence"],
    ["KI", "de", "technik", "KI"], ["AI", "en", "technik", "AI"]
  ]) {
    const hit = discover(query, lang).topics.find(entry => entry.topic.id === id);
    assert.ok(hit?.terms.includes(word), query);
  }
});

test("unrelated words, fragments and grammatical filler do not force an association", () => {
  for (const [query, lang] of [
    ["und oder was ist das", "de"], ["can it be that it is", "en"],
    ["der Zeitgeist und die Zeitung", "de"], ["the meaning of meantime", "en"],
    ["a carefree caretaker timed the play", "en"], ["unfaire Arbeitszeitung", "de"],
    ["Kartoffelschälmaschine", "de"], [null, "en"], ["", "de"]
  ]) assert.deepEqual(discover(query, lang), {topics: [], patterns: []}, query);
  assert.ok(!findConnections("What does this word mean?", "en").some(card => card.id === "distribution"));
});

test("unrelated senses and generic words in a card title do not suggest a pattern", () => {
  for (const [query, lang] of [
    ["Wie kann ich fünf Kilo abnehmen?", "de"],
    ["Was verbirgt sich dort?", "de"],
    ["Was reicht?", "de"],
    ["What hides in the forest?", "en"],
    ["Who wanted that?", "en"]
  ]) assert.deepEqual(discover(query, lang).patterns, [], query);
  assert.equal(discover("Soll ich ihr alles abnehmen?").patterns[0].connection.id, "help");
});

test("a topic match alone creates no pattern match, even on a shared atlas field", () => {
  for (const [query, lang] of [["Klima", "de"], ["climate", "en"]]) {
    const hits = discover(query, lang);
    assert.deepEqual(hits.topics.map(hit => hit.topic.id), ["umwelt"]);
    assert.deepEqual(hits.patterns, []);
  }
  assert.deepEqual(patternsForTopic("umwelt"), []);
  assert.deepEqual(patternsForTopic("outside-the-tree"), []);
});

test("direct pattern hits retain their draft cards and original query terms", () => {
  for (const [word, lang, id] of [
    ["Unterstützung", "de", "help"], ["Fuersorge", "de", "help"],
    ["Aufgaben", "de", "capacity"], ["tasks", "en", "capacity"],
    ["Mittelwerte", "de", "distribution"], ["arithmetic mean", "en", "distribution"],
    ["Observation", "en", "interpretation"]
  ]) {
    const {patterns} = discover(word, lang);
    assert.equal(patterns[0].connection, connections.find(card => card.id === id));
    assert.ok(patterns[0].terms.includes(word));
    assert.equal(patterns[0].connection.reviewStatus, "draft");
  }
});

test("paired cues add a pattern without a keyword and take precedence over a separate lexical hit", () => {
  const query = "Zusammen reicht es. Bekommt deshalb jeder genug? Und was ist mit Pflege?";
  const hits = discover(query).patterns;
  assert.deepEqual(hits.map(entry => entry.connection.id), ["distribution", "help"]);
  assert.deepEqual(hits[0].terms, []);
  assert.deepEqual(hits[0].cues, ["Zusammen reicht es", "jeder genug"]);
  assert.deepEqual(hits[1].terms, ["Pflege"]);
});

test("a card matching both a term and a pair appears only once", () => {
  const hits = discover("On average, does each person get enough?", "en").patterns;
  assert.deepEqual(hits.map(hit => hit.connection.id), ["distribution"]);
  assert.deepEqual(hits[0].terms, ["average"]);
  assert.deepEqual(hits[0].cues, ["On average", "each person get enough"]);
});

test("reverse traversal exactly mirrors each published card membership", () => {
  for (const topic of topics) {
    assert.deepEqual(patternsForTopic(topic.id), connections.filter(card => card.topics.includes(topic.id)));
  }
});
