import { ENTITY_QUERIES } from "./vera-entity-catalog.mjs";

const verdicts = [
  ["open", "challenged"],
  ["supported", "conflict"]
];

export function assessEvidence(evidence) {
  if (!Array.isArray(evidence)) throw new TypeError("Expected an array of evidence records");
  let support = false;
  let challenge = false;
  for (const record of evidence) {
    switch (record?.polarity) {
      case "supports": support = true; break;
      case "challenges": challenge = true; break;
      default: throw new TypeError("Evidence needs a known polarity");
    }
  }
  return { support, challenge, status: verdicts[Number(support)][Number(challenge)] };
}

function normalize(input) {
  return input.normalize("NFKC").toLowerCase().replace(/\s+/gu, " ").trim().replace(/[?!.]+$/u, "").trimEnd();
}

export function resolveEntityQuery(input, lang, catalog = ENTITY_QUERIES) {
  if (typeof input !== "string" || !["de", "en"].includes(lang)) return [];
  const key = normalize(input);
  if (!key) return [];
  return catalog.filter(query => {
    const { question, aliases } = query[lang];
    return [query.id, question, ...aliases].some(candidate => normalize(candidate) === key);
  }).map(query => query.id);
}

export function queryVera(id, project) {
  const query = ENTITY_QUERIES.find(entry => entry.id === id);
  if (!query) return null;

  const evidence = [];
  for (const record of query.evidence) {
    if (record.field === undefined) {
      evidence.push(record);
      continue;
    }
    const observed = project?.ai_ambition?.[record.field];
    if (typeof observed === "boolean") {
      evidence.push({ ...record, polarity: observed ? "supports" : "challenges" });
    }
  }
  return { id, type: query.type, evidence, ...assessEvidence(evidence) };
}
