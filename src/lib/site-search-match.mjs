// Deterministic lexical ranking. Matches indicate word overlap, not semantic
// agreement, truth, quality of evidence or human endorsement.
const stop = new Set(("der die das den dem des ein eine einer einem eines einen und oder aber " +
  "mit für auf im in am von vom zu zum zur bei als so ist sind war werden wird " +
  "ich du wir ihr sie er es was wie wer wo wenn warum welche welcher welches " +
  "kann können sollte soll muss man mir mich uns sich meine meine dein ihre " +
  "the a an and or but with for to of in on at by is are was were it its " +
  "i you he she we they what why where which who when how should would could").split(/\s+/));

export function normalizeSearch(value) {
  return String(value ?? "").toLocaleLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .normalize("NFD").replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ").trim().replace(/\s+/g, " ");
}

export function prepareSearchEntries(entries) {
  return entries.map(entry => ({
    ...entry,
    _title: normalizeSearch(entry.title),
    _description: normalizeSearch(entry.description),
    _search: normalizeSearch(entry.search)
  }));
}

export function searchEntries(entries, query, limit=8) {
  const phrase = normalizeSearch(String(query ?? "").slice(0, 120));
  if (phrase.length < 2) return [];
  const tokens = [...new Set(phrase.split(" ").filter(token => token.length >= 2 && !stop.has(token)))].slice(0, 12);
  if (!tokens.length) return [];
  return entries.map((entry, index) => {
    const title = entry._title ?? normalizeSearch(entry.title);
    const desc = entry._description ?? normalizeSearch(entry.description);
    const content = entry._search ?? normalizeSearch(entry.search);
    let score = 0;
    for (const token of tokens) {
      if (title.includes(token)) score += title.split(" ").includes(token) ? 24 : 16;
      else if (desc.includes(token)) score += 8;
      else if (content.includes(token)) score += 3;
      else return null;
    }
    if (title === phrase) score += 65;
    else if (title.startsWith(phrase)) score += 30;
    else if (title.includes(phrase)) score += 14;
    if (entry.type === "page") score += 2;
    return {entry, index, score};
  }).filter(Boolean)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, Math.max(0, limit)).map(hit => hit.entry);
}
