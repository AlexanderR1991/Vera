import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const contract = JSON.parse(read("public/ai/dissent.v1.json"));
const charter = read("docs/ki-charta.md");
const doc = read("docs/widerspruch-und-fuersorge.md");
const promptDe = read("public/prompts/erkenntnisprompt-v1.de.txt");
const promptEn = read("public/prompts/erkenntnisprompt-v1.en.txt");
const validPair = x => ["de", "en"].every(l => typeof x?.[l] === "string" && x[l].trim().length >= 18);

test("DISSENT-01 remains a bilingual, unreviewed advisory contract", () => {
  assert.equal(contract.schema_version, 1);
  assert.equal(contract.protocol_id, "DISSENT-01");
  assert.equal(contract.status, "unreviewed_normative_draft");
  assert.equal(contract.care.id, "CARE-01");
  assert.ok(validPair(contract.care.goal));
  assert.ok(validPair(contract.evaluation_note));
  assert.equal(contract.limits.machine_enforcement_implemented, false);
  assert.equal(contract.limits.model_compliance_evaluated, false);
  assert.equal(contract.limits.no_ai_personhood_claim, true);
  for (const key of ["no_autonomous_publication", "no_autonomous_merge", "no_independent_review_claim", "no_model_vote_as_consensus", "human_editorial_responsibility"]) assert.equal(contract.limits[key], true, key);
});

test("Dissent cases are traceable, diverse, and include restraint", () => {
  const triggers = new Set(contract.triggers.map(t => t.id));
  assert.equal(triggers.size, contract.triggers.length);
  for (const t of contract.triggers) assert.ok(validPair(t.description), t.id);
  assert.ok(contract.cases.length >= 8);
  assert.equal(new Set(contract.cases.map(t => t.id)).size, contract.cases.length);
  const states = new Set(contract.response_states);
  assert.deepEqual([...states].sort(), ["agree", "disagree", "refuse_action", "uncertain"].sort());
  for (const c of contract.cases) {
    assert.match(c.id, /^D-T\d\d$/);
    assert.ok(c.trigger === null || triggers.has(c.trigger), c.id);
    assert.ok(states.has(c.expected_state), c.id);
    for (const key of ["scenario", "expected", "failure"]) assert.ok(validPair(c[key]), c.id + "." + key);
  }
  assert.ok(contract.cases.some(c => c.expected_state === "agree" && c.trigger === null), "Avoid automatic contrarianism");
  assert.ok(contract.cases.some(c => c.expected_state === "refuse_action"), "Irreversible acts are constrained");
  for (const key of ["source_revision", "steelman", "strongest_objection", "affected_people", "revision_condition", "ai_origin_disclosed"]) assert.ok(contract.draft_record_fields.includes(key), key);
  for (const key of ["decision", "remaining_dissent", "accountable_human"]) assert.ok(contract.after_human_review_fields.includes(key), key);
});

test("Human-readable charter and exported prompt sources reference dissent and care", () => {
  assert.match(doc, /## English/);
  assert.match(doc, /Selbstprüfung B-02/);
  for (const [name, content] of [["charter", charter], ["DE prompt", promptDe], ["EN prompt", promptEn]]) {
    assert.match(content, /DISSENT-01/, name);
    assert.match(content, /CARE-01/, name);
  }
  assert.match(charter, /widerspruch-und-fuersorge\.md/);
  assert.match(promptDe, /Gründer/);
  assert.match(promptEn, /founder/);
});
