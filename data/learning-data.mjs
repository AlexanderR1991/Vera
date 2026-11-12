import { createHash } from "node:crypto";

export const learningSchemaVersion = 1;
export const learningSplits = ["train", "validation", "test"];
export const sha256 = value => createHash("sha256").update(value).digest("hex");
export function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
}
const fail = message => { throw new Error(`Learning data: ${message}`); };
const object = (value, label) => { if (!value || typeof value !== "object" || Array.isArray(value)) fail(`${label} must be an object`); };
const keys = (value, allowed, label) => { object(value, label); for (const key of Object.keys(value)) if (!allowed.includes(key)) fail(`${label}: unknown field ${key}`); };
const text = (value, label, max = 20000) => { if (typeof value !== "string" || !value.trim() || value.length > max) fail(`${label} must be nonempty text (max ${max})`); };
const id = (value, label) => { if (typeof value !== "string" || !/^[A-Za-z0-9][A-Za-z0-9._:-]{1,99}$/.test(value)) fail(`${label} must be a stable ID`); };
const oneOf = (value, values, label) => { if (!values.includes(value)) fail(`${label} must be one of ${values.join(", ")}`); };
const list = (value, label, max = 100) => { if (!Array.isArray(value) || value.length > max) fail(`${label} must be an array (max ${max})`); };
const strings = (value, label) => { list(value, label); for (const item of value) text(item, label); };
function sourceLocation(value, fixture) {
  text(value, "source.url");
  if (fixture && value.startsWith("urn:vera:fixture:")) return value;
  let url;
  try { url = new URL(value); } catch { fail("source.url must be HTTPS"); }
  if (url.protocol !== "https:" || url.username || url.password) fail("source.url must be HTTPS without credentials");
  url.hash = "";
  return url.href;
}
const normalized = value => value.normalize("NFKC").trim().replace(/\s+/gu, " ").toLowerCase();
const sourceKey = example => `${example.source.id}@${example.source.revision}#${example.source.locator}`;

// This checks declarations and internal consistency. A JSON field cannot authenticate
// a reviewer, establish copyright permission, or independently verify source truth.
export function validateCorpus(corpus) {
  keys(corpus, ["schema_version", "kind", "purpose", "examples"], "corpus");
  if (corpus.schema_version !== learningSchemaVersion || corpus.kind !== "vera_learning_corpus") fail("unsupported corpus schema");
  oneOf(corpus.purpose, ["training", "development_fixture"], "purpose");
  list(corpus.examples, "examples", 10000);
  const fixture = corpus.purpose === "development_fixture";
  const examples = new Map();
  const sourceVersions = new Map();
  const groups = new Map();
  const inputs = new Map();
  for (const example of corpus.examples) {
    keys(example, ["id", "family_id", "split", "claim_kind", "scope", "source", "provenance", "usage", "review", "task", "target", "counterexamples", "limitations", "correction"], "example");
    id(example.id, "example.id");
    if (examples.has(example.id)) fail(`duplicate example ID ${example.id}`);
    examples.set(example.id, example);
    id(example.family_id, `${example.id}.family_id`);
    oneOf(example.split, [...learningSplits, "quarantine"], `${example.id}.split`);
    oneOf(example.claim_kind, ["empirical", "formal", "normative", "interpretive", "metaphor", "unclassified"], `${example.id}.claim_kind`);
    text(example.scope, `${example.id}.scope`);
    keys(example.source, ["id", "revision", "url", "locator", "excerpt", "content_sha256"], `${example.id}.source`);
    id(example.source.id, "source.id");
    text(example.source.revision, "source.revision", 200);
    if (/^(main|master|head|latest)$/i.test(example.source.revision)) fail("source.revision must be immutable, not a moving branch");
    const location = sourceLocation(example.source.url, fixture);
    text(example.source.locator, "source.locator", 500);
    text(example.source.excerpt, "source.excerpt");
    if (example.source.content_sha256 !== sha256(example.source.excerpt)) fail(`${example.id} source excerpt checksum mismatch`);
    const key = sourceKey(example);
    if (sourceVersions.has(key) && sourceVersions.get(key) !== example.source.content_sha256) fail(`${key} has conflicting source content; use a distinct source ID for a different excerpt`);
    sourceVersions.set(key, example.source.content_sha256);
    keys(example.provenance, ["origin", "description", "generator"], "provenance");
    oneOf(example.provenance.origin, ["human_curated", "ai_draft", "synthetic"], "provenance.origin");
    text(example.provenance.description, "provenance.description");
    if (["ai_draft", "synthetic"].includes(example.provenance.origin)) text(example.provenance.generator, "provenance.generator", 500);
    if (fixture && example.provenance.origin !== "synthetic") fail("development fixtures must be explicitly synthetic");
    keys(example.usage, ["license", "reference", "training_permission", "permission_reference", "privacy"], "usage");
    text(example.usage.license, "usage.license", 500);
    text(example.usage.reference, "usage.reference");
    oneOf(example.usage.training_permission, ["granted", "denied", "unknown", "fixture_only"], "usage.training_permission");
    oneOf(example.usage.privacy, ["public_nonpersonal", "synthetic_nonpersonal", "restricted"], "usage.privacy");
    if (example.usage.training_permission === "granted") text(example.usage.permission_reference, "usage.permission_reference");
    keys(example.review, ["status", "reviewed_by", "reference"], "review");
    oneOf(example.review.status, ["accepted", "unreviewed", "rejected", "fixture_only"], "review.status");
    strings(example.review.reviewed_by, "review.reviewed_by");
    if (example.review.status === "accepted") {
      if (!example.review.reviewed_by.length) fail(`${example.id} accepted review requires a named accountable human reviewer`);
      text(example.review.reference, "review.reference");
    }
    keys(example.task, ["kind", "prompt", "context"], "task");
    oneOf(example.task.kind, ["source_assessment", "correction_response", "instruction"], "task.kind");
    text(example.task.prompt, "task.prompt");
    text(example.task.context, "task.context");
    text(example.target, "target");
    strings(example.counterexamples, "counterexamples");
    strings(example.limitations, "limitations");
    if (!example.limitations.length) fail(`${example.id} must state its limits`);
    keys(example.correction, ["supersedes", "rationale"], "correction");
    strings(example.correction.supersedes, "correction.supersedes");
    if (new Set(example.correction.supersedes).size !== example.correction.supersedes.length) fail("duplicate correction references");
    if (example.correction.supersedes.length) text(example.correction.rationale, "correction.rationale");
    if (fixture) {
      if (example.review.status !== "fixture_only" || example.usage.training_permission !== "fixture_only" || example.usage.privacy !== "synthetic_nonpersonal") fail("fixture must not pretend to have human review or real training permission");
    } else if (example.review.status === "fixture_only" || example.usage.training_permission === "fixture_only") fail("fixture-only records cannot enter the real corpus");
    const eligible = example.review.status === "accepted" && example.usage.training_permission === "granted" && example.usage.privacy !== "restricted";
    if (!fixture && !eligible && example.split !== "quarantine") fail(`${example.id}: unreviewed, unpermitted or restricted records belong in quarantine`);
    if (example.split === "quarantine") continue;
    // Every source and case family stays in one partition, even across revisions.
    // Exact normalized input checks catch duplicates disguised by new IDs.
    for (const group of [`family:${example.family_id}`, `source:${example.source.id}`, `url:${location}`, `excerpt:${example.source.content_sha256}`]) {
      const prior = groups.get(group);
      if (prior && prior !== example.split) fail(`split leakage: ${group} appears in ${prior} and ${example.split}`);
      groups.set(group, example.split);
    }
    const inputKey = sha256(normalized(`${example.task.prompt}\n${example.task.context}`));
    const priorInput = inputs.get(inputKey);
    if (priorInput && priorInput !== example.split) fail(`split leakage: duplicate input in ${priorInput} and ${example.split}`);
    inputs.set(inputKey, example.split);
  }
  for (const example of examples.values()) {
    for (const previousId of example.correction.supersedes) {
      const previous = examples.get(previousId);
      if (!previous || previousId === example.id) fail(`${example.id} has invalid correction reference ${previousId}`);
      if (previous.family_id !== example.family_id) fail("correction lineage must retain its case family");
      if (previous.split !== "quarantine" && example.split !== "quarantine" && previous.split !== example.split) fail("correction lineage cannot cross splits");
    }
  }
  const visiting = new Set();
  const visited = new Set();
  function visit(example) {
    if (visiting.has(example.id)) fail("correction lineage contains a cycle");
    if (visited.has(example.id)) return;
    visiting.add(example.id);
    for (const previousId of example.correction.supersedes) visit(examples.get(previousId));
    visiting.delete(example.id);
    visited.add(example.id);
  }
  for (const example of examples.values()) visit(example);
  return corpus;
}

export function buildSupervisedExport(corpus, { allowDevFixtures = false } = {}) {
  validateCorpus(corpus);
  const fixture = corpus.purpose === "development_fixture";
  if (fixture && !allowDevFixtures) fail("development fixtures require --allow-dev-fixtures and cannot establish training readiness");
  const candidates = corpus.examples.filter(e => learningSplits.includes(e.split) &&
    (fixture || (e.review.status === "accepted" && e.usage.training_permission === "granted" && e.usage.privacy !== "restricted")));
  // Only an exportable replacement can retire an earlier target. An accepted
  // but unpermitted/quarantined correction must not silently remove usable data.
  // Follow lineage only through exportable intermediates. A quarantined draft's
  // own supersedes links cannot retire otherwise usable older targets.
  const byId = new Map(corpus.examples.map(e => [e.id, e]));
  const candidateIds = new Set(candidates.map(e => e.id));
  const superseded = new Set();
  function retireAncestors(example) {
    for (const previousId of example.correction.supersedes) {
      if (superseded.has(previousId)) continue;
      superseded.add(previousId);
      if (candidateIds.has(previousId)) retireAncestors(byId.get(previousId));
    }
  }
  for (const example of candidates) retireAncestors(example);
  const eligible = candidates.filter(e => !superseded.has(e.id)).sort((a, b) => a.id.localeCompare(b.id, "en"));
  const files = {};
  const splits = {};
  for (const split of learningSplits) {
    const rows = eligible.filter(e => e.split === split);
    const content = rows.map(e => canonicalJson({ id: e.id, messages: [{ role: "user", content: `${e.task.prompt}\n\nContext:\n${e.task.context}` }, { role: "assistant", content: e.target }] })).join("\n") + (rows.length ? "\n" : "");
    const name = `${split}.jsonl`;
    files[name] = content;
    splits[split] = { file: name, examples: rows.length, ids: rows.map(e => e.id), sha256: sha256(content) };
  }
  const manifest = {
    schema_version: 1, kind: "vera_supervised_export", purpose: corpus.purpose,
    development_fixture: fixture, corpus_sha256: sha256(canonicalJson(corpus)),
    training_performed: false, counts: { total: corpus.examples.length, exported: eligible.length, quarantine: corpus.examples.filter(e => e.split === "quarantine").length, superseded: superseded.size },
    split_policy: "No source ID, source URL, exact source excerpt SHA-256, case family or exact normalized input may cross train/validation/test.",
    declarations_are_not_authentication: true,
    sources: eligible.map(e => ({ example_id: e.id, family_id: e.family_id, source: e.source, provenance: e.provenance, usage: e.usage, review: e.review, claim_kind: e.claim_kind, scope: e.scope, correction: e.correction, counterexamples: e.counterexamples, limitations: e.limitations })),
    splits
  };
  files["manifest.json"] = `${canonicalJson(manifest)}\n`;
  return { files, manifest };
}
