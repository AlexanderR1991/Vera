import project from "../../public/project.json" with {type: "json"};

// This module structures a user's notes. It neither evaluates truth nor calls AI.
export const inquirySchema = 2;
export const maxInquiryFileSize = 1024 * 1024;
export const maxFieldLength = 12000;
export const inquiryTypes = ["unclassified", "empirical", "formal", "normative", "interpretive", "metaphor"];
export const inquiryFields = ["question", "claim", "scope", "support", "positions", "objection", "revision", "action"];
const legacyFields = inquiryFields.filter(key => key !== "positions");
const text = value => typeof value === "string" ? value.trim() : "";

export function createInquiry(values = {}, lang = "de") {
  if (!["de", "en"].includes(lang)) throw new Error("Unsupported language");
  if (!inquiryTypes.includes(values.type || "unclassified")) throw new Error("Unknown claim type");
  const note = {schema_version: inquirySchema, kind: "inquiry_note", lang, type: values.type || "unclassified"};
  for (const key of inquiryFields) {
    if (values[key] != null && typeof values[key] !== "string") throw new Error("Invalid field: " + key);
    const value = text(values[key]);
    if (value.length > maxFieldLength) throw new Error("Field too long: " + key);
    note[key] = value;
  }
  return note;
}

export function parseInquiry(raw) {
  if (typeof raw !== "string" || raw.length > maxInquiryFileSize) throw new Error("Invalid or oversized file");
  const data = JSON.parse(raw);
  if (!data || Array.isArray(data) || ![1, inquirySchema].includes(data.schema_version) || data.kind !== "inquiry_note") throw new Error("Unsupported inquiry format");
  if (!["de", "en"].includes(data.lang)) throw new Error("Unsupported language");
  if (!inquiryTypes.includes(data.type)) throw new Error("Unknown claim type");
  const fields = data.schema_version === 1 ? legacyFields : inquiryFields;
  if (!fields.every(key => typeof data[key] === "string")) throw new Error("Missing inquiry fields");
  // Whitelist fields; imported properties never become executable markup or code.
  return createInquiry({...data, positions: data.schema_version === 1 ? "" : data.positions}, data.lang);
}

export function missingInquiryFields(note) {
  return inquiryFields.filter(key => !text(note[key]));
}

const labels = {
  de: {question:"Frage", claim:"Vorläufige Aussage", scope:"Begriffe, Geltungsbereich und Voraussetzungen", support:"Belege oder Gründe und deren Grenzen", positions:"Zustimmung, Dissens und fehlende Perspektiven", objection:"Stärkster Einwand und andere Erklärung", revision:"Was würde meine Position ändern?", action:"Nächster Schritt, Betroffene und Abbruchbedingung"},
  en: {question:"Question", claim:"Provisional claim", scope:"Terms, scope and premises", support:"Evidence or reasons and their limits", positions:"Agreement, disagreement and missing perspectives", objection:"Strongest objection and alternative explanation", revision:"What would change my position?", action:"Next step, affected people and stopping condition"}
};
const typeLabels = {
  de:["Noch nicht eingeordnet", "Empirische Aussage", "Formale Aussage", "Normatives Urteil", "Interpretation / Erfahrung", "Metapher"],
  en:["Not classified yet", "Empirical claim", "Formal claim", "Normative judgment", "Interpretation / experience", "Metaphor"]
};
export function inquiryMarkdown(note) {
  const clean = createInquiry(note, note.lang);
  const en = clean.lang === "en";
  const header = en ? `# ${project.english_name} · Inquiry worksheet` : `# ${project.name} · Prüfblatt`;
  const status = en ? "Unreviewed personal draft. Completeness does not establish truth, expert review or agreement." : "Ungeprüfter eigener Entwurf. Vollständigkeit belegt weder Wahrheit noch Fachprüfung oder Zustimmung.";
  const type = typeLabels[clean.lang][inquiryTypes.indexOf(clean.type)];
  return [header, status, `${en ? "Claim type" : "Aussageart"}: ${type}`, ...inquiryFields.map(key => `## ${labels[clean.lang][key]}\n\n${clean[key] || (en ? "[Open]" : "[Offen]")}`)].join("\n\n") + "\n";
}
