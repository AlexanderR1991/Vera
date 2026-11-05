// This module structures a user's notes. It neither evaluates truth nor calls AI.
export const inquirySchema = 1;
export const maxFieldLength = 12000;
export const inquiryTypes = ["empirical", "formal", "normative", "interpretive", "metaphor"];
export const inquiryFields = ["question", "claim", "scope", "support", "objection", "revision", "action"];
const text = value => typeof value === "string" ? value.trim() : "";

export function createInquiry(values = {}, lang = "de") {
  if (!["de", "en"].includes(lang)) throw new Error("Unsupported language");
  if (!inquiryTypes.includes(values.type || "empirical")) throw new Error("Unknown claim type");
  const note = {schema_version: inquirySchema, kind: "inquiry_note", lang, type: values.type || "empirical"};
  for (const key of inquiryFields) {
    if (values[key] != null && typeof values[key] !== "string") throw new Error("Invalid field: " + key);
    const value = text(values[key]);
    if (value.length > maxFieldLength) throw new Error("Field too long: " + key);
    note[key] = value;
  }
  return note;
}

export function parseInquiry(raw) {
  if (typeof raw !== "string" || raw.length > 256 * 1024) throw new Error("Invalid or oversized file");
  const data = JSON.parse(raw);
  if (!data || Array.isArray(data) || data.schema_version !== inquirySchema || data.kind !== "inquiry_note") throw new Error("Unsupported inquiry format");
  if (!["de", "en"].includes(data.lang)) throw new Error("Unsupported language");
  if (!inquiryTypes.includes(data.type)) throw new Error("Unknown claim type");
  if (!inquiryFields.every(key => typeof data[key] === "string")) throw new Error("Missing inquiry fields");
  // Whitelist fields; imported properties never become executable markup or code.
  return createInquiry(data, data.lang);
}

export function missingInquiryFields(note) {
  return inquiryFields.filter(key => !text(note[key]));
}

const labels = {
  de: {question:"Frage", claim:"Vorläufige Aussage", scope:"Begriffe, Geltungsbereich und Voraussetzungen", support:"Belege oder Gründe und deren Grenzen", objection:"Stärkster Einwand und andere Erklärung", revision:"Was würde meine Position ändern?", action:"Nächster Schritt, Betroffene und Abbruchbedingung"},
  en: {question:"Question", claim:"Provisional claim", scope:"Terms, scope and premises", support:"Evidence or reasons and their limits", objection:"Strongest objection and alternative explanation", revision:"What would change my position?", action:"Next step, affected people and stopping condition"}
};
const typeLabels = {
  de:["Empirische Aussage", "Formale Aussage", "Normatives Urteil", "Interpretation / Erfahrung", "Metapher"],
  en:["Empirical claim", "Formal claim", "Normative judgment", "Interpretation / experience", "Metaphor"]
};
export function inquiryMarkdown(note) {
  const clean = createInquiry(note, note.lang);
  const en = clean.lang === "en";
  const header = en ? "# WIRKLICH · Inquiry worksheet" : "# WIRKLICH · Prüfblatt";
  const status = en ? "Unreviewed personal draft. Completeness does not establish truth, expert review or agreement." : "Ungeprüfter eigener Entwurf. Vollständigkeit belegt weder Wahrheit noch Fachprüfung oder Zustimmung.";
  const type = typeLabels[clean.lang][inquiryTypes.indexOf(clean.type)];
  return [header, status, `${en ? "Claim type" : "Aussageart"}: ${type}`, ...inquiryFields.map(key => `## ${labels[clean.lang][key]}\n\n${clean[key] || (en ? "[Open]" : "[Offen]")}`)].join("\n\n") + "\n";
}

export function summarizeProject(registry, topics, discovery, criticism) {
  const claims = registry.claims;
  const stream = data => ({items: Array.isArray(data.items) ? data.items.length : 0, updated_at: data.updated_at || null});
  return {
    claims: claims.length,
    reviewed: claims.filter(claim => claim.review_status === "reviewed" && claim.human_review).length,
    topics: topics.length,
    drafts: topics.filter(topic => topic.state === "draft").length,
    proposals: topics.filter(topic => topic.state === "proposed").length,
    open: topics.filter(topic => topic.state === "open").length,
    discovery: stream(discovery),
    criticism: stream(criticism)
  };
}
