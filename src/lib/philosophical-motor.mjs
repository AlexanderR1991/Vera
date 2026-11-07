// WIRKLICH M-03 prototype. Pure, deterministic, OFFLINE, and strictly synthetic.
// This module cannot review evidence, validate rights, certify truth, or publish scores.
// See docs/philosophischer-motor-mathematik.md. No personal profiles are evaluated.

const filled = value => typeof value === "string" && value.trim().length > 0;
const finite = value => typeof value === "number" && Number.isFinite(value);
const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

export function validateSyntheticScenario(input) {
  const errors = [];
  if (!input || typeof input !== "object" || input.kind !== "synthetic") {
    return ["Only explicitly synthetic cases are supported"];
  }
  const c = input.context || {};
  for (const field of ["action", "baseline", "population", "horizon"]) {
    if (!filled(c[field])) errors.push("Missing context." + field);
  }
  if (!Array.isArray(input.dimensions) || input.dimensions.length === 0) {
    errors.push("At least one dimension is required");
  }
  const dimensions = Array.isArray(input.dimensions) ? input.dimensions : [];
  const ids = new Set();
  for (const dim of dimensions) {
    if (!filled(dim?.id) || ids.has(dim.id)) {
      errors.push("Dimension IDs must be unique and nonempty");
      continue;
    }
    ids.add(dim.id);
    if (dim.effects === null) continue; // Missing data must remain missing.
    if (!Array.isArray(dim.effects) || dim.effects.length !== 3 ||
        !dim.effects.every(x => finite(x) && x >= -1 && x <= 1) ||
        !(dim.effects[0] <= dim.effects[1] && dim.effects[1] <= dim.effects[2])) {
      errors.push("Invalid effect interval for " + dim.id);
    }
  }
  if (!Array.isArray(input.value_profiles) || input.value_profiles.length < 2) {
    errors.push("At least two explicitly different value profiles are required");
  }
  const profileIds = new Set();
  for (const profile of (Array.isArray(input.value_profiles) ? input.value_profiles : [])) {
    if (!filled(profile?.id) || profileIds.has(profile.id)) {
      errors.push("Value profile IDs must be unique and nonempty");
    } else profileIds.add(profile.id);
    const weights = profile?.weights;
    if (!weights || typeof weights !== "object" || Array.isArray(weights) ||
        Object.keys(weights).length !== ids.size ||
        Object.keys(weights).some(key => !ids.has(key)) ||
        [...ids].some(id => !hasOwn(weights, id) || !finite(weights[id]) || weights[id] < 0) ||
        Math.abs(Object.values(weights).reduce((sum, w) => sum + (finite(w) ? w : 0), 0) - 1) > 1e-9) {
      errors.push("Invalid normalized, explicit weights for " + (profile?.id || "unknown"));
    }
  }
  if (!Array.isArray(input.safeguards) || input.safeguards.length === 0 ||
      input.safeguards.some(x => !filled(x?.id) || !["pass", "fail", "unknown"].includes(x.status))) {
    errors.push("Safeguards must explicitly be pass, fail, or unknown");
  }
  return errors;
}

/**
 * Interval arithmetic for a conditional multi-criteria toy model.
 * Effects are pre-specified normalized assumptions, NOT empirical estimates.
 * Weight vectors are normative assumptions, NOT observed ethical truth.
 * R0-R4, consensus, evidence quality, and human approval are never computed.
 */
export function examineDirection(input) {
  const abstain = (status, details = {}) => ({
    status, direction: "undetermined", profile_results: [],
    safeguard_status: "not_assessed", public_score_allowed: false, ...details
  });
  if (input?.kind !== "synthetic") return abstain("not_scored");
  const errors = validateSyntheticScenario(input);
  if (errors.length) return abstain("invalid_input", { errors });
  const statuses = input.safeguards.map(s => s.status);
  const safeguardStatus = statuses.includes("fail") ? "blocked" :
    statuses.includes("unknown") ? "pending" : "declared_pass";
  const missing_dimensions = input.dimensions.filter(d => d.effects === null).map(d => d.id);
  if (missing_dimensions.length) {
    return abstain("missing_data", {
      safeguard_status: safeguardStatus, missing_dimensions
    });
  }
  const profile_results = input.value_profiles.map(profile => {
    const result = [0, 0, 0];
    for (const dimension of input.dimensions) {
      const weight = profile.weights[dimension.id];
      dimension.effects.forEach((value, i) => { result[i] += weight * value; });
    }
    return { id: profile.id, lower: result[0], estimate: result[1], upper: result[2] };
  });
  const allPositive = profile_results.every(p => p.lower > 0);
  const allNegative = profile_results.every(p => p.upper < 0);
  const signsDiverge = profile_results.some(p => p.estimate > 0) &&
                       profile_results.some(p => p.estimate < 0);
  const direction = allPositive ? "positive_across_profiles" :
    allNegative ? "negative_across_profiles" :
    signsDiverge ? "profile_sensitive" : "undetermined";
  return {
    status: "illustrative_only", direction,
    safeguard_status: safeguardStatus, profile_results,
    public_score_allowed: false
  };
}

/**
 * Edges: from=premise, to=dependent, type="depends_on".
 * Returns a review QUEUE, never a truth/status change. Cycles are tolerated.
 */
export function traceRevisionImpact(graph, changedId) {
  const nodes = graph?.nodes;
  const edges = graph?.edges;
  if (!Array.isArray(nodes) || !Array.isArray(edges) ||
      !nodes.every(filled) || new Set(nodes).size !== nodes.length ||
      !nodes.includes(changedId)) throw new TypeError("Invalid graph or changed claim");
  for (const edge of edges) {
    if (!["depends_on", "supports", "attacks", "analogous_to"].includes(edge?.type) ||
        !nodes.includes(edge.from) || !nodes.includes(edge.to)) {
      throw new TypeError("Invalid typed graph edge");
    }
  }
  const seen = new Set([changedId]);
  const queue = [changedId];
  while (queue.length) {
    const current = queue.shift();
    for (const edge of edges) {
      if (edge.type === "depends_on" && edge.from === current && !seen.has(edge.to)) {
        seen.add(edge.to);
        queue.push(edge.to);
      }
    }
  }
  return [...seen].filter(id => id !== changedId).sort();
}

/** IDs support an audit, but never establish actual source independence. */
export function provenanceAudit(records) {
  if (!Array.isArray(records)) throw new TypeError("Expected evidence records");
  const sources = new Set();
  const families = new Set();
  let ungrouped = 0, agent_contributions = 0;
  for (const record of records) {
    if (!filled(record?.source_id)) throw new TypeError("Missing source ID");
    sources.add(record.source_id);
    if (filled(record.dependency_group_id)) families.add(record.dependency_group_id);
    else ungrouped++;
    if (record.origin === "ai") agent_contributions++;
  }
  return {
    records: records.length, distinct_source_ids: sources.size,
    declared_dependency_groups: families.size, ungrouped_records: ungrouped,
    agent_contributions, independence_verified: false
  };
}

/**
 * A bounded agreement about one exact version, not a proof of the proposition.
 * Feasibility and rights are externally assessed inputs, not algorithmic findings.
 */
export function assessScopedAgreement(input) {
  const allowedStances = ["yes", "no", "abstain", "pending"];
  if (!filled(input?.version) || !Array.isArray(input.parties) ||
      !input.parties.length || !input.parties.every(filled) ||
      new Set(input.parties).size !== input.parties.length ||
      !Array.isArray(input.responses) ||
      !["pass", "fail", "unknown"].includes(input.rights) ||
      !["yes", "no", "unknown"].includes(input.feasibility)) return "invalid_input";
  const perParty = new Map();
  for (const response of input.responses) {
    if (!input.parties.includes(response.party) || perParty.has(response.party) ||
        !allowedStances.includes(response.stance) || !filled(response.version)) {
      return "invalid_input";
    }
    perParty.set(response.party, response);
  }
  if (input.rights === "fail") return "blocked";
  if (input.feasibility === "no") return "infeasible";
  if (input.rights === "unknown" || input.feasibility === "unknown") return "open";
  const answers = input.parties.map(party => {
    const record = perParty.get(party);
    return record?.version === input.version ? record.stance : "pending";
  });
  if (answers.includes("no")) return "documented_dissent";
  if (answers.every(answer => answer === "yes")) return "agreement_on_exact_version";
  return "proposed_or_open";
}

/**
 * Read-only adapter for the CURRENT public claims registry.
 * Review level and consensus are copied, never inferred or promoted.
 * Sources and AI roles do not create numerical trust, votes or moral scores.
 */
export function describePublishedClaim(claim) {
  const closed = (status) => ({status, direction: null, public_score_allowed: false});
  if (!claim || !filled(claim.id) || !filled(claim.type) ||
      !Number.isInteger(claim.version) || claim.version < 1 ||
      !Number.isInteger(claim.maturity?.level) ||
      claim.maturity.level < 0 || claim.maturity.level > 4 ||
      !filled(claim.consensus?.status) ||
      !Array.isArray(claim.sources)) return closed("invalid_claim");
  return {
    ...closed("read_only_record"),
    id: claim.id,
    version: claim.version,
    claim_type: claim.type,
    abstraction_level: claim.abstraction_level ?? null,
    epistemic_status: claim.epistemic_status ?? null,
    review_status: claim.review_status ?? null,
    maturity_level: claim.maturity.level,
    consensus_status: claim.consensus.status,
    source_records: claim.sources.length
  };
}
