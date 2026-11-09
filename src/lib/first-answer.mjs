import everyday from "../../public/knowledge/everyday-questions.json" with { type: "json" };
import project from "../../public/project.json" with { type: "json" };
import { ENTITY_QUERIES } from "./vera-entity-catalog.mjs";
import { hardCaseAnswers } from "./hard-case-answers.mjs";
import { queryVera, resolveEntityQuery } from "./vera-entity.mjs";
import { contentWords } from "./search-terms.mjs";

const base = new URL(project.website).pathname;

// These are complete, alternative wordings, never keywords that trigger personal advice.
const aliases = {
  liebe: [["Muss ich aus Liebe bleiben?", "Muss ich bei jemandem bleiben, den ich liebe?"], ["Does loving someone mean I have to stay?", "Do I have to stay because I love them?"]],
  arbeit: [["Bin ich weniger wert, wenn ich weniger schaffe?"], ["Am I worth less if I get less done?"]],
  entscheidung: [["Was, wenn ich die falsche Entscheidung treffe?", "Ich habe Angst, mich falsch zu entscheiden.", "Wie gehe ich mit der Angst vor einer falschen Entscheidung um?"], ["What if I make the wrong decision?", "I'm afraid of making the wrong decision."]],
  wahrheit: [["Soll ich die Wahrheit sagen, auch wenn sie wehtut?"], ["Should I tell the truth even if it hurts?"]],
  gerechtigkeit: [["Sind gleiche Regeln für alle fair?"], ["Is it fair to have the same rules for everyone?"]],
  mehrheit: [["Darf die Mehrheit alles entscheiden?"], ["Can the majority decide everything?"]]
};

// Short conversation starters grounded in the two exercises linked below.
const conversations = [
  {
    path: "schnittmengen/#vermittlung",
    de: {
      question: "Was hilft, wenn wir über Politik streiten?",
      aliases: ["Bei uns gibt es immer Streit über Politik", "Bei uns endet jede Diskussion über Politik im Streit"],
      cues: [/^(?:politik|politisch(?:e|er|en|es|em)?)$/u, /^(?:streit|streiten|streite|streitet|streitgespräch|zoff)$/u],
      wording: /^(?:wir|mein (?:vater|bruder|partner) und ich|meine (?:mutter|schwester|partnerin) und ich) streiten(?: uns)?(?: ständig| dauernd| immer wieder| immer| oft)? (?:über|wegen) politik$/u,
      answer: "Du könntest mit einer Frage anfangen, auf die dein Gegenüber auch mit Nein antworten darf. Nimm einen konkreten Vorschlag, bei dem ihr euch uneinig seid. Frag zum Beispiel „Was müsste sich ändern, damit du darüber mit mir sprechen möchtest?“ Dann hör erst einmal zu. Jemand kann dir zuhören und den Vorschlag weiterhin ablehnen.",
      followUp: "Über welchen konkreten Vorschlag habt ihr euch zuletzt gestritten?"
    },
    en: {
      question: "What helps when we argue about politics?",
      aliases: ["Every political discussion ends in an argument", "Politics always turns into an argument"],
      cues: [/^(?:politics|political)$/u, /^(?:argue|argues|arguing|arguments?|fight|fights|fighting|disagreements?)$/u],
      wording: /^(?:we|my (?:dad|father|mum|mom|mother|brother|sister|partner) and i) (?:keep (?:arguing|fighting)|(?:always |often )?(?:argue|fight)) (?:about|over) politics$/u,
      answer: "Start with a question the other person can say no to. Pick one proposal you disagree about and ask, “What would need to change for you to want to talk about this with me?” Then give them time to answer. Someone can be willing to listen and still disagree with the proposal.",
      followUp: "What was the last specific proposal you disagreed about?"
    }
  },
  {
    path: "schnittmengen/#sprachprobe",
    de: {
      question: "Wie teilen wir die Miete fair?",
      cues: [/^miete$/u, /^(?:teilen|aufteilen|aufteilung|halbieren|aufgeteilt|getrennt)$/u],
      aliases: ["Wir streiten über die Miete", "Wie können wir die Miete gerecht aufteilen?", "Sollen wir die Miete halbieren?"],
      answer: "Meint ihr mit fair, dass ihr gleich viele Euro zahlt oder denselben Anteil eures Einkommens? Bei 900 € Miete und einem doppelt so hohen Einkommen wären das einmal 450 € pro Person und einmal 600 € und 300 €. An den Beträgen könnt ihr leichter sehen, was jeder meint.",
      followUp: "Welche Aufteilung könntest du mittragen, wenn ihr die Einkommen tauschen würdet?"
    },
    en: {
      question: "How can we split the rent fairly?",
      cues: [/^rent$/u, /^(?:split|splitting|divide|dividing|share|sharing)$/u],
      aliases: ["We argue about the rent", "Should we split the rent in half?", "What's a fair way to split the rent?"],
      answer: "Does fair mean paying the same amount, or the same share of your income? With €900 rent and one income twice the other, that works out to €450 each, or €600 and €300. Concrete amounts make it easier to see what each of you means.",
      followUp: "Which split could you accept if your incomes were the other way round?"
    }
  }
];

const normalize = text => text.normalize("NFKC").toLowerCase().replace(/ß/gu, "ss").replace(/[’']/gu, "")
  .replace(/[^\p{L}\p{M}\p{N}]+/gu, " ").trim();

function entries(lang) {
  const home = base + lang + "/";
  const records = everyday.questions.map(entry => ({
    question: entry.question[lang], answer: entry.answer[lang], followUp: entry.challenge[lang],
    href: home + "forum/#alltag-" + entry.id,
    aliases: aliases[entry.id]?.[lang === "en" ? 1 : 0] ?? []
  }));
  for (const entry of conversations) records.push({ ...entry[lang], href: home + entry.path });
  return records.map(entry => ({
    ...entry, forms: [entry.question, ...entry.aliases].map(normalize)
  }));
}

const catalog = { de: entries("de"), en: entries("en") };

// A quoted example is not a disclosure. Apostrophes inside words are ordinary spelling.
const quotation = /["„“”«»‹›‚]|(?:^|[^\p{L}])['‘’]|['‘’](?!\p{L})/u;
// Nearby first-person concerns can withhold an exercise without classifying the situation.
const privacyConcern = {
  de: /(?:^| )ich (?:habe angst|fürchte|befürchte) dass (?:er|sie|jemand|mein partner|meine partnerin) (?:hier |heimlich )?mitliest(?: |$)/u,
  en: /(?:^| )(?:im|i am) (?:afraid|worried) (?:that )?(?:he|she|they|someone|my partner) (?:can|could|might) (?:read|see) (?:this|(?:our|my) (?:messages|chat|screen))(?: |$)/u
};

function hardCaseReply(input, query, lang) {
  for (const entry of hardCaseAnswers) {
    const { question, aliases, answer } = entry[lang];
    for (const form of [question, ...aliases].map(normalize)) {
      if (!(" " + query + " ").includes(" " + form + " ")) continue;
      // Only a complete statement can yield the answer, alone or alongside a known exercise.
      // If the context changes its meaning, also withhold any invitation to joint mediation.
      if (quotation.test(input)) return { kind: "unknown" };
      const parts = input.split(/[?？]/u);
      const isStatement = parts.some((part, index) => {
        const words = " " + normalize(part) + " ";
        return words.includes(" " + form + " ") && (index === parts.length - 1 || !words.endsWith(" " + form + " "));
      });
      if (!isStatement) return { kind: "unknown" };
      if (query !== form) {
        let other;
        if (query.startsWith(form + " ")) other = query.slice(form.length + 1).replace(/^(?:und|aber|and|but) /u, "");
        if (query.endsWith(" " + form)) other = query.slice(0, -form.length - 1).replace(/ (?:und|aber|and|but)$/u, "");
        if (!other || !catalog[lang].some(item => item.cues && (item.forms.includes(other) || item.wording?.test(other)))) {
          return { kind: "unknown" };
        }
      }
      return { kind: "answer", question, answer, followUp: "", href: base + lang + "/schnittmengen/#" + entry.id };
    }
  }
}

function entityAnswer(id, lang) {
  const entry = ENTITY_QUERIES.find(item => item.id === id)[lang];
  const { status } = queryVera(id, project);
  const labels = lang === "de"
    ? { open: "Diese Frage ist offen.", challenged: "Der dokumentierte Stand widerspricht der Aussage", conflict: "Die Belege widersprechen sich bei der Aussage" }
    : { open: "This question is open.", challenged: "The project record contradicts the claim", conflict: "The evidence conflicts on the claim" };
  const answer = status === "supported" ? (entry.answer ?? entry.claim)
    : status === "open" ? labels.open + " " + entry.limit : labels[status] + (lang === "de" ? " „" + entry.claim + "“" : " “" + entry.claim + "”");
  return { kind: "answer", question: entry.question, answer, followUp: entry.next,
    href: base + lang + "/#" + (lang === "de" ? "vera-fragen" : "ask-vera") };
}

export function firstAnswer(input, lang = "de") {
  if (typeof input !== "string" || !input.trim()) return { kind: "empty" };
  if (!Object.hasOwn(catalog, lang) || input.length > 1000) return { kind: "unknown" };
  // An exact self-model query preserves the model's evidence status, including an open finding.
  const ids = resolveEntityQuery(input, lang);
  if (ids.length === 1) return entityAnswer(ids[0], lang);

  const query = normalize(input);
  if (!query) return { kind: "unknown" };
  const boundary = hardCaseReply(input, query, lang);
  if (boundary) return boundary;
  if (privacyConcern[lang].test(query)) return { kind: "unknown" };
  const exact = catalog[lang].find(entry => entry.forms.includes(query) || entry.wording?.test(query));
  if (exact) {
    const { question, answer, followUp, href } = exact;
    return { kind: "answer", question, answer, followUp, href };
  }

  // Partial wording can only offer a question to choose. Never infer the person's situation from it.
  const words = new Set(contentWords(query, lang));
  const tokens = query.split(" ");
  const pause = lang === "de" ? /^(?:nicht|nie|kein\p{L}*|droh\p{L}*|bedroh\p{L}*|gedroht|gewalt\p{L}*|zwang|geschlagen)$/u
    : /^(?:not|never|dont|doesnt|threat\p{L}*|violence|violent|coerc\p{L}*|hit|abuse|abusive)$/u;
  const choices = catalog[lang].filter(entry => {
    if (entry.cues) {
      return !tokens.some(word => pause.test(word)) &&
        entry.cues.every(cue => tokens.some(word => cue.test(word)));
    }
    return entry.forms.some(form => {
      if ((" " + query + " ").includes(" " + form + " ")) return true;
      const terms = new Set(contentWords(form, lang));
      const shared = [...terms].filter(term => words.has(term)).length;
      return shared >= 2 && shared >= 0.75 * terms.size && shared >= 0.6 * words.size;
    });
  }).slice(0, 3).map(({ question, href }) => ({ question, href }));
  return choices.length ? { kind: "choices", choices } : { kind: "unknown" };
}
