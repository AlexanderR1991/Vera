// ENT-00: a small, deterministic inquiry ledger. No model calls or truth scoring.
// Public publishing and human-review authentication belong to a trusted host, not this library.
export const entitySchemaVersion = 1;
export const entityClaimTypes = ["unclassified", "empirical", "formal", "normative", "interpretive", "metaphor"];
export const entityDraftKinds = ["perspective", "evidence_hint", "objection", "revision_proposal"];
export const entityDraftOrigins = ["human_submission", "editorial_draft", "ai_draft"];
export const entityDecisions = ["retain", "narrow", "revise", "withdraw", "leave_open"];
export const entityLimits = {text: 2000, events: 200};
const validId = value => typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9._:-]{1,79}$/.test(value);
const words = (value, max = entityLimits.text) => typeof value === "string" && !!value.trim() && value.trim().length <= max;
const timestamp = value => typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) && !Number.isNaN(Date.parse(value));
const url = value => { if (!value) return true; try { return new URL(value).protocol === "https:"; } catch { return false; } };
const clean = value => value.trim();
const reject = message => { throw new Error("ENT-00: " + message); };

export function createEntityRecord({id, lang = "de", question, statement, claim_type = "unclassified", scope = ""} = {}) {
  if (!validId(id)) reject("invalid record id");
  if (!["de", "en"].includes(lang)) reject("invalid language");
  if (!words(question) || !words(statement) || (scope && !words(scope))) reject("invalid question, statement or scope");
  if (!entityClaimTypes.includes(claim_type)) reject("unknown claim type");
  return {
    schema_version: entitySchemaVersion, kind: "entity_inquiry", id, lang,
    question: clean(question), scope: scope ? clean(scope) : "", claim_type,
    current_version: 1,
    versions: [{version: 1, statement: clean(statement), change: "initial_draft"}],
    events: []
  };
}

function assertRecord(record) {
  if (record?.schema_version !== entitySchemaVersion || record?.kind !== "entity_inquiry" || !validId(record.id)) reject("invalid record");
  if (!Array.isArray(record.versions) || !record.versions.length || !Array.isArray(record.events) || record.events.length > entityLimits.events) reject("invalid history");
  if (!Number.isSafeInteger(record.current_version) || record.current_version !== record.versions.at(-1)?.version) reject("invalid version");
  if (record.versions.some((v, i) => v.version !== i + 1 || !words(v.statement))) reject("invalid statement history");
}

function assertNewEvent(record, id, at, basedOnVersion) {
  assertRecord(record);
  if (!validId(id) || record.events.some(e => e.id === id)) reject("duplicate or invalid event id");
  if (!timestamp(at)) reject("invalid UTC timestamp");
  if (basedOnVersion !== record.current_version) reject("stale version: refresh before proposing a change");
  if (record.events.length >= entityLimits.events) reject("event limit reached");
}

export function addEntityDraft(record, {id, kind, origin, text, at, based_on_version, source_url = "", domain = ""} = {}) {
  assertNewEvent(record, id, at, based_on_version);
  if (!entityDraftKinds.includes(kind) || !entityDraftOrigins.includes(origin)) reject("unknown draft kind or origin");
  if (!words(text) || !url(source_url) || (domain && !words(domain, 80))) reject("invalid draft text, source or domain");
  // Whitelist fields; an imported draft cannot smuggle consensus, reviews or status upgrades.
  const event = {
    id, kind, origin, text: clean(text), at, based_on_version,
    source_url: source_url || "", domain: domain ? clean(domain) : ""
  };
  return {...record, versions: record.versions.map(v => ({...v})), events: [...record.events.map(e => ({...e})), event]};
}

export function recordEntityDecision(record, {
  id, at, based_on_version, outcome, reviewer, rationale, new_statement = ""
} = {}, verifyHumanReview) {
  assertNewEvent(record, id, at, based_on_version);
  // FAIL CLOSED: calling this function without an external, trusted authorization check is impossible.
  // A string such as "human_review" inside the submitted JSON is not an authentication mechanism.
  if (typeof verifyHumanReview !== "function" || verifyHumanReview({id, reviewer, at, based_on_version, outcome, rationale}) !== true) reject("trusted human-review authorization required");
  if (!entityDecisions.includes(outcome) || !words(reviewer, 200) || !words(rationale)) reject("invalid human decision");
  if (["narrow", "revise"].includes(outcome)) {
    if (!words(new_statement) || clean(new_statement) === record.versions.at(-1).statement) reject("revision requires changed wording");
  } else if (new_statement) reject("new wording is only allowed for narrow or revise");
  const event = {id, kind: "human_decision", at, based_on_version, reviewer: clean(reviewer), rationale: clean(rationale), outcome, new_statement: new_statement ? clean(new_statement) : ""};
  const versions = record.versions.map(v => ({...v}));
  if (["narrow", "revise", "withdraw"].includes(outcome)) {
    versions.push({version: record.current_version + 1, statement: new_statement ? clean(new_statement) : versions.at(-1).statement, change: outcome});
  }
  return {...record, current_version: versions.at(-1).version, versions, events: [...record.events.map(e => ({...e})), event]};
}

export function inspectEntityRecord(record) {
  assertRecord(record);
  const draftKinds = Object.fromEntries(entityDraftKinds.map(kind => [kind, record.events.filter(e => e.kind === kind).length]));
  const lastDecision = [...record.events].reverse().find(e => e.kind === "human_decision") || null;
  return {
    id: record.id,
    current_version: record.current_version,
    current_statement: record.versions.at(-1).statement,
    draft_counts: draftKinds,
    last_decision: lastDecision ? {outcome: lastDecision.outcome, at: lastDecision.at, based_on_version: lastDecision.based_on_version} : null,
    review_state: lastDecision ? "human_decision_recorded" : "unreviewed_draft",
    human_consensus: "not_assessed",
    direction_index: null,
    public_score_allowed: false
  };
}
