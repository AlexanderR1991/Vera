// A synthetic composition of existing Vera kernels; no model, storage or network.
// See docs/vera-mathematisch.md. Inputs describe a fixture, not a person's mind.
import { bridgeSnapshot } from "./intersubjective.mjs";
import { assessEvidence } from "./vera-entity.mjs";
import { assessScopedAgreement, provenanceAudit, traceRevisionImpact } from "./philosophical-motor.mjs";

const filled = value => typeof value === "string" && value.trim().length > 0;
const object = value => value !== null && typeof value === "object" && !Array.isArray(value);
const claimTypes = ["empirical", "formal", "normative", "interpretive", "metaphor"];
const accessKeys = ["entry", "source", "objection"];

// The exact wording participates in identity, even if someone forgets to bump v.
// This is a comparison key, not a signature or proof of authorship/consent.
export function encounterKey(snapshot) {
  if (!object(snapshot) || !["id", "version", "wording"].every(key => filled(snapshot[key]))) {
    throw new TypeError("A snapshot needs a nonempty id, version and wording.");
  }
  if (snapshot.type !== undefined && !claimTypes.includes(snapshot.type)) throw new TypeError("Unknown claim type.");
  return JSON.stringify([snapshot.id, snapshot.version, snapshot.wording, snapshot.type ?? null]);
}

export function inspectEncounter(input) {
  if (!object(input) || input.kind !== "synthetic") {
    throw new TypeError("Only explicitly synthetic encounter fixtures are supported.");
  }
  if (!["active", "paused", "stopped"].includes(input.participation)) {
    throw new TypeError("Participation must be active, paused or stopped.");
  }
  const report = {
    schema_version: 1, kind: "synthetic_encounter_report", status: input.participation,
    access: null, understanding: null, evidence: null, agreement: null, review_queue: null,
    mental_state_inferred: false, public_score_allowed: false, publication_allowed: false
  };
  // Pause/stop prevents further evaluation; it is not a recommendation to continue.
  if (input.participation !== "active") return report;
  if (!filled(input.question)) throw new TypeError("Name the question.");
  const claimKey = encounterKey(input.claim);
  const proposalKey = encounterKey(input.proposal);
  if (!claimTypes.includes(input.claim.type)) throw new TypeError("Unknown claim type.");
  if (!object(input.access) || !accessKeys.every(key => ["yes", "no", "unknown"].includes(input.access[key]))) {
    throw new TypeError("Entry, source and objection access each need yes, no or unknown.");
  }
  report.access = Object.fromEntries(accessKeys.map(key => [key, input.access[key]]));
  report.understanding = input.bridge == null ? null : bridgeSnapshot(input.bridge);

  if (!Array.isArray(input.evidence)) throw new TypeError("Expected evidence records.");
  const records = new Map();
  for (const record of input.evidence) {
    if (!object(record) || !["id", "claim_key", "source_id"].every(key => filled(record[key])) ||
        !["supports", "challenges"].includes(record.polarity) ||
        !["editorial", "ai"].includes(record.origin) ||
        !(record.dependency_group_id === null || filled(record.dependency_group_id))) {
      throw new TypeError("Evidence needs identity, target, polarity and declared provenance.");
    }
    const normalized = Object.fromEntries(["id", "claim_key", "source_id", "polarity", "origin", "dependency_group_id"]
      .map(key => [key, record[key]]));
    if (records.has(record.id) && JSON.stringify(records.get(record.id)) !== JSON.stringify(normalized)) {
      throw new TypeError("An evidence ID cannot identify two different records.");
    }
    records.set(record.id, normalized);
  }
  const ordered = [...records.values()].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  const current = ordered.filter(record => record.claim_key === claimKey);
  report.evidence = {
    claim_key: claimKey, claim_type: input.claim.type,
    assessment: assessEvidence(current), provenance: provenanceAudit(current),
    active_ids: current.map(record => record.id),
    unmatched_ids: ordered.filter(record => record.claim_key !== claimKey).map(record => record.id)
  };

  if (!object(input.agreement) || !Array.isArray(input.agreement.responses) ||
      !input.agreement.responses.every(response => object(response) && filled(response.proposal_key))) {
    throw new TypeError("Expected version-bound agreement responses.");
  }
  const agreement = assessScopedAgreement({
    version: proposalKey, parties: input.agreement.parties,
    rights: input.agreement.rights, feasibility: input.agreement.feasibility,
    responses: input.agreement.responses.map(response => ({
      party: response.party, stance: response.stance, version: response.proposal_key
    }))
  });
  if (agreement === "invalid_input") throw new TypeError("Invalid scoped agreement.");
  report.agreement = { proposal_key: proposalKey, status: agreement };
  if (input.revision == null) report.review_queue = [];
  else {
    if (!object(input.revision) || input.revision.changed_id !== input.claim.id) {
      throw new TypeError("Revision must identify the current claim.");
    }
    report.review_queue = traceRevisionImpact(input.revision.graph, input.revision.changed_id);
  }
  return report;
}
