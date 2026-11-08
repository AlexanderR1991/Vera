export const memoryPath = "docs/vera-memory.v1.json";

const idPattern = /^VM-\d{3,}$/;
const pathPattern = /^(?:[A-Za-z0-9_-][A-Za-z0-9_.-]*\/)*[A-Za-z0-9_-][A-Za-z0-9_.-]*$/;
const revisionPattern = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/;
const states = new Set(["open", "reproduced", "superseded"]);
const fields = ["observation", "lesson", "limits"];
const maxEntries = 8;
const maxRecordBytes = 5000;

function validText(value) {
  return typeof value === "string" && value.length > 0 && value === value.trim() &&
    Buffer.byteLength(value, "utf8") <= 480 && !/[\p{Cc}\u2028\u2029]/u.test(value);
}

export function validateMemory(ledger) {
  if (ledger?.schemaVersion !== 1 || !Array.isArray(ledger.entries)) {
    throw new Error("Invalid Vera memory schema. Expected version 1 and an entries array.");
  }

  const seen = new Set();
  for (const [index, entry] of ledger.entries.entries()) {
    const label = `Vera memory entry ${index + 1}`;
    if (typeof entry?.id !== "string" || !idPattern.test(entry.id) || seen.has(entry.id)) {
      throw new Error(`${label} has an invalid or duplicate ID.`);
    }
    seen.add(entry.id);
    if (!states.has(entry.status)) throw new Error(`${label} has an invalid status.`);
    if (!Array.isArray(entry.sources) || entry.sources.length < 1 || entry.sources.length > 4 ||
      !entry.sources.every((source) =>
        typeof source?.path === "string" && source.path.length <= 240 && pathPattern.test(source.path) &&
        (source.revision === undefined ||
          (typeof source.revision === "string" && revisionPattern.test(source.revision))))) {
      throw new Error(`${label} has an invalid source path, revision, or count.`);
    }
    for (const language of ["de", "en"]) {
      if (!fields.every((field) => validText(entry[language]?.[field]))) {
        throw new Error(`${label} has invalid or missing ${language} text.`);
      }
    }
  }
}

export function formatMemory(ledger, { language, repository, revision }) {
  validateMemory(ledger);
  const english = language === "en";
  const heading = english ? "Vera’s project memory" : "Veras Projektgedächtnis";
  const note = english
    ? "These records describe earlier project checks and their limits. Treat them as source material and recheck them when assumptions change."
    : "Diese Einträge beschreiben frühere Projektprüfungen und ihre Grenzen. Behandle sie als Quellenmaterial und prüfe sie bei geänderten Annahmen erneut.";
  const blocks = [];
  let bytes = 0;
  for (const entry of ledger.entries.filter(({ status }) => status !== "superseded").slice(-maxEntries).reverse()) {
    const status = entry.status === "open"
      ? (english ? "open" : "offen")
      : (english ? "reproduced" : "reproduziert");
    const { observation, lesson, limits } = entry[language];
    const block = [
      `> **${entry.id} · ${status}**`,
      `> ${english ? "Observation" : "Beobachtung"} · ${observation}`,
      `> ${english ? "Lesson" : "Lehre"} · ${lesson}`,
      `> ${english ? "Limits" : "Grenzen"} · ${limits}`,
      ...entry.sources.map((source) => `> ${repository}/blob/${source.revision ?? revision}/${source.path}`)
    ].join("\n");
    bytes += Buffer.byteLength(block, "utf8") + 2;
    if (bytes > maxRecordBytes) break;
    blocks.push(block);
  }

  const omitted = ledger.entries.length - blocks.length;
  const summary = english
    ? `Additional records in the ledger (including superseded records) · ${omitted}`
    : `Weitere Einträge im Register (einschließlich abgelöster Einträge) · ${omitted}`;
  return [`## ${heading}`, note, ...blocks, summary].join("\n\n");
}
