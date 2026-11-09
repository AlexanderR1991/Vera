import catalogue from "../../public/research/mediation-cases.v1.json" with { type: "json" };

// Only editorial, synthetic cases are available to the review.
export const lessons = catalogue.cases;

// Load only recognised check IDs, even when a browser entry was edited manually.
export function rememberedChecks(value) {
  try {
    const ids = JSON.parse(value);
    return Array.isArray(ids) ? lessons.map(lesson => lesson.id).filter(id => ids.includes(id)) : [];
  } catch {
    return [];
  }
}

export function reviewDraft(id, lang) {
  const lesson = lessons.find(item => item.id === id);
  if (!lesson || !["de", "en"].includes(lang)) return "";
  const [question, example, expected] = lesson[lang];
  const labels = lang === "de"
    ? ["Vera · Entwurf zur Methodenprüfung", "Erfundener Testfall", "Erwartetes Ergebnis", "Neue Gegenprobe (selbst ergänzen)", "Welcher andere erfundene Fall zeigt eine Lücke? Was müsste Vera darin anders anzeigen?"]
    : ["Vera · Method review draft", "Invented test case", "Expected result", "New counterexample (add your own)", "What other invented case reveals a gap? What should Vera show there?"];
  return [labels[0], question, labels[1] + "\n" + example, labels[2] + "\n" + expected, labels[3] + "\n" + labels[4]].join("\n\n");
}
