export const artSubmission = "https://github.com/AlexanderR1991/Vera/issues/new?template=kunst.yml";

export const artInquiry = {
  de: {
    steps: [
      "Begegne dem Werk. Halte Quelle, Fassung und die genaue Stelle fest, die du gesehen, gelesen oder gehört hast.",
      "Beschreibe ein Detail. Schreibe dein persönliches Erleben getrennt davon auf.",
      "Formuliere eine Kernfrage oder Lesart in einem Satz. Welche Gegenlesart nimmt dasselbe Detail ernst?",
      "Schlage vor, was Vera anders machen könnte. Benenne einen Fall, an dem der Vorschlag scheitern kann.",
      "Halte Einwände und Ergebnis fest. Eine menschliche Prüfung entscheidet über die Übernahme in den Projektstand."
    ],
    fields: {
      encounter: "Dein erster Blick",
      observation: "Was am Werk auffällt",
      reading: "Ein möglicher Kern",
      counterreading: "Eine Gegenlesart",
      transfer: "Was Vera daraus lernen könnte",
      test: "Woran wir es prüfen"
    },
    proposal: "Werk, Urheberschaft, Fassung und Fundstelle",
    experience: "Persönliches Erleben",
    rights: "Rechte und genauer Umfang der Nutzung",
    draft: "Redaktioneller Entwurf. Einwände und Prüfung vor der Übernahme dokumentieren."
  },
  en: {
    steps: [
      "Encounter the work. Record the source, version and exact part you saw, read or heard.",
      "Describe a detail. Record your personal experience separately.",
      "State a core question or reading in one sentence. What other reading takes the same detail seriously?",
      "Suggest what Vera could do differently. Name a case where that proposal could fail.",
      "Record objections and the outcome. Human review decides whether the project adopts the proposal."
    ],
    fields: {
      encounter: "Your first look",
      observation: "What stands out in the work",
      reading: "One possible core reading",
      counterreading: "A counterreading",
      transfer: "What Vera could learn",
      test: "How we would test it"
    },
    proposal: "Work, creator, version and exact source",
    experience: "Personal experience",
    rights: "Rights and exact scope of use",
    draft: "Editorial draft. Record objections and the review before adoption."
  }
};

export function artWorksheet(lang, work) {
  const copy = artInquiry[lang];
  const detail = work
    ? [work.id + " · " + work.title[lang], work.credit[lang], ...work.sources.map(source => source.label[lang] + " — " + source.url)]
    : [copy.proposal + " …"];
  const fields = Object.entries(copy.fields).map(([key, label]) =>
    label + " — " + (work?.[key][lang] ?? "…")
  );
  return [
    "Liber Artis · WIRKLICH / META-01",
    copy.draft,
    "",
    ...copy.steps.map((step, index) => (index + 1) + ". " + step),
    "",
    ...detail,
    copy.experience + " …",
    ...fields,
    copy.rights + " — " + (work?.image?.credit ?? "…"),
    "",
    artSubmission
  ].join("\n");
}
