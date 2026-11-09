function requireId(value) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new TypeError('Claim and rule IDs must be non-empty strings');
  }
  return value;
}

function normalizeRule({ id, premises, conclusion }) {
  return {
    id: requireId(id),
    premises: [...new Set(premises.map(requireId))].sort(),
    conclusion: requireId(conclusion),
  };
}

function index(map, key, value) {
  if (!map.has(key)) map.set(key, new Set());
  map.get(key).add(value);
}

function unindex(map, key, value) {
  const values = map.get(key);
  values.delete(value);
  if (!values.size) map.delete(key);
}

function sameRule(a, b) {
  return a.conclusion === b.conclusion && a.premises.length === b.premises.length
    && a.premises.every((premise, i) => premise === b.premises[i]);
}

// A local least fixed point over explicitly supplied, positive rules.
export function createCorrectionWave({ facts = [], rules = [] } = {}) {
  const base = new Set();
  const rulesById = new Map();
  const byPremise = new Map();
  const byConclusion = new Map();
  const derived = new Set();

  function addRule(rule) {
    rulesById.set(rule.id, rule);
    index(byConclusion, rule.conclusion, rule);
    for (const premise of rule.premises) index(byPremise, premise, rule);
  }

  function removeRule(rule) {
    rulesById.delete(rule.id);
    unindex(byConclusion, rule.conclusion, rule);
    for (const premise of rule.premises) unindex(byPremise, premise, rule);
  }

  function directSupport(claim) {
    const rules = [...(byConclusion.get(claim) ?? [])]
      .filter((rule) => rule.premises.every((premise) => derived.has(premise)))
      .sort((a, b) => a.id < b.id ? -1 : Number(a.id > b.id));
    return { fact: base.has(claim), rules };
  }

  function recompute(affected) {
    const missing = new Map();
    const agenda = [];

    function derive(claim) {
      if (derived.has(claim)) return;
      derived.add(claim);
      agenda.push(claim);
    }

    for (const claim of affected) derived.delete(claim);
    for (const claim of affected) {
      if (base.has(claim)) derive(claim);
      for (const rule of byConclusion.get(claim) ?? []) {
        // Local premises count only when processed by this wave. Boundary facts
        // outside the wave retain their prior value.
        const count = rule.premises.filter((premise) =>
          affected.has(premise) || !derived.has(premise)).length;
        if (count === 0) derive(claim);
        else missing.set(rule, count);
      }
    }
    for (const claim of agenda) {
      for (const rule of byPremise.get(claim) ?? []) {
        if (!missing.has(rule)) continue;
        const count = missing.get(rule) - 1;
        missing.set(rule, count);
        if (count === 0) derive(rule.conclusion);
      }
    }
  }

  function revise(patch = {}) {
    const supportedFields = ['addFacts', 'removeFacts', 'addRules', 'removeRules'];
    for (const key of Object.keys(patch)) {
      if (!supportedFields.includes(key)) throw new Error(`Unknown revision field: ${key}`);
    }
    const { addFacts = [], removeFacts = [], addRules = [], removeRules = [] } = patch;
    const addedFacts = new Set(addFacts.map(requireId));
    const removedFacts = new Set(removeFacts.map(requireId));
    const removedRules = new Set(removeRules.map(requireId));
    const addedRules = new Map();

    for (const claim of addedFacts) {
      if (removedFacts.has(claim)) throw new Error(`Conflicting fact update: ${claim}`);
    }
    for (const input of addRules) {
      const rule = normalizeRule(input);
      if (addedRules.has(rule.id)) throw new Error(`Duplicate rule ID: ${rule.id}`);
      addedRules.set(rule.id, rule);
    }

    const changedRules = [];
    const addedEdges = new Map();
    const affected = new Set();
    for (const id of new Set([...removedRules, ...addedRules.keys()])) {
      const before = rulesById.get(id);
      const after = addedRules.get(id);
      if (before && after) {
        if (sameRule(before, after)) continue;
        if (!removedRules.has(id)) throw new Error(`Remove rule before replacing it: ${id}`);
      }
      if (!before && !after) continue;
      changedRules.push({ before, after });
      if (before) affected.add(before.conclusion);
      if (after) {
        affected.add(after.conclusion);
        for (const premise of after.premises) index(addedEdges, premise, after);
      }
    }
    for (const claim of addedFacts) if (!base.has(claim)) affected.add(claim);
    for (const claim of removedFacts) if (base.has(claim)) affected.add(claim);

    // Iterating a Set visits new additions. Traversing both versions catches
    // descendants of deleted edges as well as newly introduced dependencies.
    for (const claim of affected) {
      for (const rule of byPremise.get(claim) ?? []) affected.add(rule.conclusion);
      for (const rule of addedEdges.get(claim) ?? []) affected.add(rule.conclusion);
    }

    const priorDerived = new Set([...affected].filter((claim) => derived.has(claim)));
    const priorSupport = new Map([...affected].map((claim) =>
      [claim, JSON.stringify(directSupport(claim))]));

    for (const claim of removedFacts) base.delete(claim);
    for (const claim of addedFacts) base.add(claim);
    for (const { before, after } of changedRules) {
      if (before) removeRule(before);
      if (after) addRule(after);
    }
    recompute(affected);

    const checked = [...affected].sort();
    return {
      affected: checked,
      gained: checked.filter((claim) => !priorDerived.has(claim) && derived.has(claim)),
      lost: checked.filter((claim) => priorDerived.has(claim) && !derived.has(claim)),
      explanationsChanged: checked.filter((claim) =>
        priorSupport.get(claim) !== JSON.stringify(directSupport(claim))),
    };
  }

  revise({ addFacts: facts, addRules: rules });
  return {
    has: (claim) => derived.has(claim),
    explain: (claim) => structuredClone(directSupport(claim)),
    revise,
  };
}
