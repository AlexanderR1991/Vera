import {connections, connectionTermMatches} from "./navigator.mjs";
import {topics} from "./tree.mjs";
import {contentWords, queryMatcher} from "./search-terms.mjs";
import {detectPatternCues} from "./pattern-cues.mjs";

// Everyday entry terms for the editorial topics. These are search terms only;
// the card's explicit topic references decide which paths can be traversed.
const aliases = {
  philosophie: {de: ["Wahrheit", "Philosophieren", "Sinn des Lebens"], en: ["truth", "knowledge", "meaning of life"]},
  mathematik: {de: ["Mathe", "Rechnen", "Statistik"], en: ["maths", "math", "statistics"]},
  natur: {de: ["Universum", "Weltall"], en: ["universe", "space"]},
  umwelt: {de: ["Umwelt", "Klimawandel"], en: ["environment", "climate change"]},
  biologie: {de: ["Biologie", "Zellen"], en: ["biology", "cell"]},
  psychologie: {de: ["Gefühl", "Gefühle"], en: ["emotion", "emotions"]},
  liebe: {de: ["Beziehung", "Beziehungen", "Partnerschaft"], en: ["relationship", "relationships", "partnership"]},
  ernaehrung: {de: ["Essen", "Lebensmittel"], en: ["food", "diet"]},
  gesundheit: {de: ["Pflege", "Pflegen"], en: ["caregiving", "long-term care"]},
  politik: {de: ["Gesetz", "Demokratie"], en: ["government", "democracy"]},
  militaer: {de: ["Krieg"], en: ["war"]},
  religion: {de: ["Glaube"], en: ["faith", "belief"]},
  kunst: {de: ["Musik", "Malerei"], en: ["music", "painting"]},
  esoterik: {de: ["Symbole"], en: ["symbol", "esoteric"]},
  konflikte: {de: ["Konflikt", "Streit", "streiten", "Konsens"], en: ["conflict", "argument", "dispute", "consensus"]},
  wirtschaft: {de: ["Beruf", "Geld", "Budget"], en: ["job", "money", "budget"]},
  technik: {de: ["künstliche Intelligenz", "Technologie"], en: ["artificial intelligence", "tech"]},
  geschichte: {de: ["Vergangenheit"], en: ["past"]},
  bildung: {de: ["Schule", "Unterricht"], en: ["school", "teaching"]},
  ethik: {de: ["Moral", "Gerechtigkeit"], en: ["morality", "justice"]}
};

export function patternsForTopic(topicId) {
  return connections.filter(connection => connection.topics.includes(topicId));
}

export function discover(query, lang = "de") {
  const locale = lang === "en" ? "en" : "de";
  const match = queryMatcher(query, locale);
  const topicHits = topics.map(topic => {
    const primary = match([...contentWords(topic.name[locale], locale), ...(aliases[topic.id]?.[locale] ?? [])]);
    const terms = [...new Set([...primary, ...match(contentWords(topic.question[locale], locale))])];
    return {topic, terms, primary: primary.length};
  }).filter(hit => hit.terms.length)
    .sort((a, b) => b.primary - a.primary || b.terms.length - a.terms.length)
    .map(({topic, terms}) => ({topic, terms}));

  const lexical = connectionTermMatches(match, locale);
  const pairs = detectPatternCues(query, locale);
  const paired = pairs.map(({id, cues}) => {
    const connection = connections.find(card => card.id === id);
    const terms = lexical.find(hit => hit.connection === connection)?.terms ?? [];
    return {connection, terms, cues};
  }).filter(hit => hit.connection);
  return {
    topics: topicHits,
    patterns: [...paired, ...lexical.filter(hit => !paired.some(pair => pair.connection === hit.connection))]
  };
}
