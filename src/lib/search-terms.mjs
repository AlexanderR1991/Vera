// Match complete words or consecutive words in a phrase. Preserve the query's
// spelling so readers can see which words led to a suggestion.
const words = text => text.match(/[\p{L}\p{N}][\p{L}\p{M}\p{N}]*/gu) ?? [];
function key(word, lang) {
  let value = word.toLowerCase().normalize("NFC");
  if (lang === "de") value = value.replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss");
  return value.normalize("NFD").replace(/\p{M}/gu, "");
}

const ignored = {
  de: "ab aber alle allem allen aller alles als am an andere auch auf aus bei beim bin bis bist brauche braucht brauchen das dass dein deine dem den der des deshalb die dies diese doch durch erklären erklärt ein eine einem einen einer eines etwas entsteht entstehen er es für gegen geht gibt gilt gelten habe haben hängen hat gewünscht helfen hier ich im in ist kann kein keine können man mein meine mich mir mit muss nach neue nicht noch nun nur ob oder ohne reicht reichen sein seine sich sind so soll sollte sollten sonst sowie über um und uns unser unter verfügbare verbirgt vom von vor warum was weder weil weiter weiterhin welche welchem welchen welcher welches wem wenn wer werden wie wir wird wo worüber zu zum zur zusammen".split(" "),
  en: "a about also am an and another any are as at be because been being both but by can could did do does each enough even available for from get had has have he help hides him how i if in into is it its may me mean might more my new no not of on only or our ourselves she should so some still than that the their them then there these they this those to under us very wanted was we were what when where which who whom whose why will with without would yet you your".split(" ")
};
const stop = Object.fromEntries(Object.entries(ignored).map(([lang, list]) => [lang, new Set(list.map(word => key(word, lang)))]));

export function contentWords(text, lang) {
  return words(text).filter(word => !stop[lang].has(key(word, lang)));
}

export function queryMatcher(query, lang) {
  const original = typeof query === "string" ? words(query.slice(0, 12000)) : [];
  const tokens = original.map(word => key(word, lang));
  const first = new Map();
  for (const [index, token] of tokens.entries()) if (!first.has(token)) first.set(token, index);

  return candidates => {
    const found = new Map();
    for (const candidate of candidates) {
      const phrase = words(candidate).map(word => key(word, lang));
      if (!phrase.length || !first.has(phrase[0])) continue;
      let index = first.get(phrase[0]);
      if (phrase.length > 1) {
        index = tokens.findIndex((_, start) => phrase.every((word, offset) => tokens[start + offset] === word));
        if (index < 0) continue;
      }
      // “What does this mean?” is a common question about words. The statistic
      // is discoverable by “mean” alone or by an explicit phrase in a sentence.
      if (lang === "en" && candidate === "mean" && tokens.length > 1) continue;
      found.set(phrase.join(" "), original.slice(index, index + phrase.length).join(" "));
    }
    return [...found.values()];
  };
}
