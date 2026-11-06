// Two independent phrases can suggest an editorial card. They do not establish
// that the premises hold, that the author agrees, or that the phrases are causal.
function phrase(expression) {
  const words = expression.source.replaceAll(" ", "\\s+");
  const wordChar = "[\\p{L}\\p{M}\\p{N}_]";
  return new RegExp(`(?<!${wordChar})(?:${words})(?!${wordChar})`, "iu");
}

const rules = {
  de: {
    capacity: [
      phrase(/zur (?:gleichen|selben) Zeit|Termine überschneiden sich|parallel stattfinden/),
      phrase(/nur an einem Ort|nicht an zwei Orten|nur (?:eins|einen|eine|eines) davon|nur nacheinander/)
    ],
    interpretation: [
      phrase(/(?:er|sie) schweigt|meldet sich nicht|sagt kein Wort|sagt nichts|schaut weg/),
      phrase(/muss (?:er|sie) (?:sauer|wütend|beleidigt) sein|(?:ist|war) (?:er|sie) (?:sauer|wütend) auf mich|mag mich nicht|will mich meiden/)
    ],
    distribution: [
      phrase(/(?:zusammen|insgesamt|zusammengerechnet) reicht (?:es|das)|insgesamt genug|zusammen haben wir genug|im Schnitt/),
      phrase(/(?:jeder|jede|jede Person|alle) genug|(?:alle|beide) gleich viel|einzelne leer aus/)
    ],
    help: [
      phrase(/für (?:sie|ihn|dich) entscheiden|ich übernehme das|das für (?:sie|ihn|dich) erledigen|soll ich das übernehmen/),
      phrase(/selbst entscheiden|selber machen|selbst machen|was (?:er|sie) möchte|ob (?:er|sie) das will/)
    ]
  },
  en: {
    capacity: [
      phrase(/at the same time|appointments overlap|meetings overlap|scheduled simultaneously/),
      phrase(/only (?:be in|in) one place|(?:cannot|can['’]t) be in two places|one at a time|can only attend one/)
    ],
    interpretation: [
      phrase(/(?:he|she) is silent|stayed silent|went quiet|looked away|didn['’]t say a word/),
      phrase(/must be (?:angry|upset|mad)|(?:angry|mad) at me|(?:doesn['’]t|does not) like me|trying to avoid me/)
    ],
    distribution: [
      phrase(/enough in total|enough altogether|enough to go around|on average/),
      phrase(/(?:everyone|each person) (?:has|gets) enough|(?:everyone|each person|each) get enough|anyone go without|everyone gets the same amount/)
    ],
    help: [
      phrase(/decide for (?:her|him|them|you)|do (?:it|this) for (?:her|him|them|you)|take (?:it|this) off (?:her|his|their|your) hands/),
      phrase(/(?:decide|choose) for (?:herself|himself|themselves|yourself)|do it (?:herself|himself|themselves|yourself)|what (?:he wants|she wants|they want)|ask (?:her|him|them) first/)
    ]
  }
};

export function detectPatternCues(query, lang = "de") {
  if (typeof query !== "string") return [];
  const paragraphs = query.slice(0, 6000).split(/\n\s*\n/u);
  const matches = [];
  for (const [id, pair] of Object.entries(rules[lang === "en" ? "en" : "de"])) {
    for (const paragraph of paragraphs) {
      const cues = pair.map(expression => expression.exec(paragraph)?.[0]);
      if (cues.every(Boolean)) {
        matches.push({id, cues});
        break;
      }
    }
  }
  return matches;
}
