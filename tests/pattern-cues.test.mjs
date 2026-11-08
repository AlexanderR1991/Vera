import test from "node:test";
import assert from "node:assert/strict";
import {detectPatternCues} from "../src/lib/pattern-cues.mjs";
import {connections} from "../src/lib/navigator.mjs";

const examples = [
  ["de", "capacity", "Zwei Termine zur gleichen Zeit. Ich kann nur an einem Ort sein.", ["zur gleichen Zeit", "nur an einem Ort"]],
  ["de", "interpretation", "Sie schweigt. Also muss sie sauer sein?", ["Sie schweigt", "muss sie sauer sein"]],
  ["de", "distribution", "Zusammen reicht es. Bekommt deshalb jeder genug?", ["Zusammen reicht es", "jeder genug"]],
  ["de", "help", "Soll ich das übernehmen? Sie möchte es lieber selber machen.", ["Soll ich das übernehmen", "selber machen"]],
  ["de", "shared-dependency", "Zwei Formulare brauchen dieselbe Anmeldung.", ["Zwei Formulare", "dieselbe Anmeldung"]],
  ["en", "capacity", "I can only attend one. The meetings overlap.", ["meetings overlap", "can only attend one"]],
  ["en", "interpretation", "He looked away. He must be upset, right?", ["looked away", "must be upset"]],
  ["en", "distribution", "Does everyone get enough if there is enough in total?", ["enough in total", "everyone get enough"]],
  ["en", "help", "Should I do this for them? I could ask them first.", ["do this for them", "ask them first"]],
  ["en", "shared-dependency", "Two routes require the same server.", ["Two routes", "the same server"]]
];

test("each editorial card has two distinct, verbatim cues in each language", () => {
  for (const [lang, id, query, cues] of examples) {
    assert.deepEqual(detectPatternCues(query, lang), [{id, cues}]);
    for (const cue of cues) assert.deepEqual(detectPatternCues(cue, lang), []);
  }
  for (const lang of ["de", "en"]) {
    assert.deepEqual(examples.filter(row => row[0] === lang).map(row => row[1]).sort(),
      connections.map(card => card.id).sort());
  }
});

test("cue order, punctuation and spacing do not change the suggested card", () => {
  assert.deepEqual(detectPatternCues("Haben alle gleich viel? Im   Schnitt reicht es ja."), [
    {id: "distribution", cues: ["Im   Schnitt", "alle gleich viel"]}
  ]);
  assert.deepEqual(detectPatternCues("Can’t be in two places. Both are at the same time.", "en"), [
    {id: "capacity", cues: ["at the same time", "Can’t be in two places"]}
  ]);
});

test("ordinary words, near-substrings and unrelated paragraphs yield no structural suggestion", () => {
  for (const input of [null, 42, "", "Ich frage wegen meiner Gesundheit.", "Woran liegt mein Husten?",
    "Freizeit und Zeit haben unterschiedliche Bedeutungen.", "Sie schweigt. Muss sie krank sein?",
    "Zusammen reicht es. Hat jeder genugtuende Gründe?", "Im Schnittpunkt findet jeder genug Platz.",
    "Sie sagt nichts.\n\nEine andere Geschichte: Er mag mich nicht."]) {
    assert.deepEqual(detectPatternCues(input, "de"), []);
  }
  assert.deepEqual(detectPatternCues("Age and illness: does everyone get enough sleep?", "en"), []);
});

test("a rejected interpretation remains only a pair of textual cues", () => {
  assert.deepEqual(detectPatternCues("He stayed silent. That doesn't mean he must be angry.", "en"), [
    {id: "interpretation", cues: ["stayed silent", "must be angry"]}
  ]);
});
