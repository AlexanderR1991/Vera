// Each entry identifies a particular passage or report. A reading can suggest
// a question to ask a participant. It cannot supply their answer.
export const worldviewSources = [
  {
    label: {de: "Jüdischer Tanach", en: "Jewish Tanakh"},
    reference: "Isaiah 58:7 · Revised JPS (2023)",
    annotations: {shareFood: "text"},
    url: "https://www.sefaria.org/Isaiah.58.7?lang=bi&with=Translations",
    reading: {
      de: "Auf die Frage, welches Fasten Gott gefällt, nennt der Text das Teilen des eigenen Brotes mit Hungrigen.",
      en: "Asked what kind of fast pleases God, the text names sharing one’s own bread with hungry people."
    },
    kind: "text"
  },
  {
    label: {de: "Christliches Matthäusevangelium", en: "Christian Gospel of Matthew"},
    reference: "Matthew 25:35–40 · NABRE (USCCB)",
    annotations: {shareFood: "text"},
    url: "https://bible.usccb.org/bible/matthew/25",
    reading: {
      de: "In der Rede über das Gericht erkennt der König die Hilfe für seine geringsten Geschwister als Hilfe für sich selbst an. Als Beispiel nennt er das Speisen von Hungrigen.",
      en: "In the account of the judgment, the king receives care for the least of his brothers as care for himself. Feeding the hungry is one example."
    },
    kind: "text"
  },
  {
    label: {de: "Koran", en: "Qur’an"},
    reference: "Al-Insān 76:8–9 · Sahih International",
    annotations: {shareFood: "text", expectNoThanks: "text"},
    url: "https://legacy.quran.com/76/1-9",
    reading: {
      de: "Die Verse beschreiben Menschen, die Bedürftige, Waisen und Gefangene um Gottes willen speisen. Sie erwarten dafür weder Gegenleistung noch Dank.",
      en: "The verses describe people who feed those in need, orphans and captives for God’s sake. They seek neither repayment nor thanks."
    },
    kind: "text"
  },
  {
    label: {de: "Buddhistischer Pāli-Kanon", en: "Buddhist Pāli canon"},
    reference: "Itivuttaka 26 · Dānasutta · Bhikkhu Sujato",
    annotations: {shareFood: "text"},
    url: "https://suttacentral.net/iti26/en/sujato",
    reading: {
      de: "Die Lehrrede veranschaulicht den Wert des Gebens am letzten Bissen, den man noch teilen könnte, wenn jemand da ist, der ihn annimmt.",
      en: "The discourse illustrates the value of giving through a last mouthful that one could still share if someone were there to receive it."
    },
    kind: "text"
  },
  {
    label: {de: "Sikhi und die Gemeinschaftsküche", en: "Sikhi and the community kitchen"},
    reference: "Sikh Rehat Maryada · XII, XXI (a–b) · SGPC, p. 49",
    annotations: {shareFood: "text"},
    url: "https://sgpc.net/wp-content/uploads/2025/06/Sikh-Rehat-Maryada-English-n.pdf",
    reading: {
      de: "Der Verhaltenskodex beschreibt die Gemeinschaftsküche als Ort freiwilligen Dienstes. Beim gemeinsamen Essen darf die Sitzordnung niemanden wegen Herkunft, Hautfarbe, Kaste oder Religion ausgrenzen.",
      en: "The code describes the community kitchen as a place to practise voluntary service. Seating at meals must be free from discrimination by origin, colour, caste or religion."
    },
    kind: "text"
  },
  {
    label: {de: "Hinduistische Upaniṣad", en: "Hindu Upaniṣad"},
    reference: "Taittirīya Upaniṣad 3.10 · Sri Aurobindo, CWSA 18, pp. 230–231",
    annotations: {shareFood: "text"},
    url: "https://upanishads.org.in/u/taittiriya/p/3.10",
    reading: {
      de: "Die Passage fordert dazu auf, Menschen an der eigenen Tür aufzunehmen. Sie schildert, wie einem fremden Gast Essen angeboten wird.",
      en: "The passage calls on the householder to welcome those who come to the door. It describes offering a stranger food."
    },
    kind: "text"
  },
  {
    label: {de: "Moderner Humanismus", en: "Modern humanism"},
    reference: "Humanists International · Declaration of Modern Humanism (2022), §1",
    annotations: {shareFood: "application", requiresDivineGround: "contrary"},
    url: "https://humanists.international/policy/declaration-of-modern-humanism/",
    reading: {
      de: "Die Erklärung begründet Fürsorge mit der Fähigkeit, Leid und Wohlergehen zu erfahren. Moral könne ihren Ursprung ganz im Menschen haben. Eine Mahlzeit anzubieten ist unsere Anwendung auf den Fall.",
      en: "The declaration grounds care in the capacity to suffer and flourish. In its account, morality can be grounded entirely in humanity. Offering a meal is our application to this case."
    },
    kind: "application"
  },
  {
    label: {de: "Ngāi Tahu in Aotearoa", en: "Ngāi Tahu in Aotearoa"},
    reference: "Te Rūnanga o Ngāi Tahu · Group Annual Report 2021–2022, p. 31",
    annotations: {shareFood: "practice"},
    url: "https://ngaitahu.iwi.nz/assets/Documents/Te-Runanga-o-Ngai-Tahu-Annual-Report-2022.pdf",
    reading: {
      de: "Te Rūnanga o Ngāi Tahu berichtet, wie lokale Räte und Gesundheits- und Sozialdienste während der Pandemie 4.174 Lebensmittelpakete verteilten. Jedes enthielt Essen für vier Tage.",
      en: "Te Rūnanga o Ngāi Tahu reports that local councils and health and social service providers distributed 4,174 food parcels during the pandemic. Each contained four days’ food."
    },
    kind: "practice"
  }
];

export const readingQuestions = [
  {id: "shareFood", de: "Essen mit anderen Menschen teilen", en: "Sharing food with others"},
  {id: "expectNoThanks", de: "Die Gebenden erwarten ausdrücklich keinen Dank", en: "Those who give explicitly seek no thanks"},
  {id: "requiresDivineGround", de: "Fürsorge braucht zwingend eine göttliche Begründung", en: "Care for others requires a divine justification"}
];

// Classification concerns this proposition and this reading of the source.
// In particular, a religious reason for giving does not entail its necessity.
export function groupSourceReadings(questionId, sources = worldviewSources) {
  const groups = {text: [], application: [], practice: [], contrary: [], open: []};
  for (const source of sources) {
    const reading = source.annotations?.[questionId] ?? "open";
    groups[reading].push(source);
  }
  return groups;
}
