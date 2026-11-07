import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createEntityRecord, addEntityDraft, recordEntityDecision, inspectEntityRecord, entityDraftKinds} from "../src/lib/entity-core.mjs";

const at = "2026-11-07T20:00:00Z";
const seed = () => createEntityRecord({id: "ENT-DEMO-001", question: "Ist Selbstkorrektur immer Fortschritt?", statement: "Selbstkorrektur verbessert immer das Urteil.", claim_type: "normative", scope: "Ein synthetisches Gedankenbeispiel"});
const objection = {id: "E-001", kind: "objection", origin: "ai_draft", text: "Ein Fehler könnte durch eine neue falsche Behauptung ersetzt werden.", at, based_on_version: 1};

test("an inquiry is a traceable, unreviewed draft without a score or fabricated consensus", () => {
  const record = seed();
  const snapshot = inspectEntityRecord(record);
  assert.equal(record.current_version, 1);
  assert.equal(snapshot.review_state, "unreviewed_draft");
  assert.equal(snapshot.direction_index, null);
  assert.equal(snapshot.human_consensus, "not_assessed");
  assert.equal(snapshot.public_score_allowed, false);
  assert.deepEqual(Object.keys(snapshot.draft_counts), entityDraftKinds);
});

test("an objection is append-only, not a vote or automatic revision", () => {
  const record = seed();
  const changed = addEntityDraft(record, objection);
  assert.equal(record.events.length, 0);
  assert.equal(changed.events.length, 1);
  assert.equal(changed.versions.length, 1);
  assert.equal(inspectEntityRecord(changed).draft_counts.objection, 1);
  assert.equal(inspectEntityRecord(changed).review_state, "unreviewed_draft");
  assert.throws(() => addEntityDraft(changed, objection), /duplicate/);
  assert.throws(() => addEntityDraft(changed, {...objection, id: "E-002", based_on_version: 2}), /stale/);
});

test("AI-draft cannot impersonate a human decision or assign reviews, scores and status", () => {
  const record = seed();
  assert.throws(() => addEntityDraft(record, {...objection, id: "E-002", kind: "human_decision"}), /unknown draft/);
  const changed = addEntityDraft(record, {...objection, id: "E-003", human_review: {reviewer: "AI"}, public_score_allowed: true, maturity: 4, consensus: "yes"});
  assert.equal(changed.events[0].human_review, undefined);
  assert.equal(changed.events[0].maturity, undefined);
  assert.equal(changed.events[0].consensus, undefined);
  assert.equal(inspectEntityRecord(changed).public_score_allowed, false);
  assert.throws(() => recordEntityDecision(record, {id: "E-099", at, based_on_version: 1, outcome: "revise", reviewer: "A model", rationale: "Models agree", new_statement: "A new claim"}), /trusted human-review/);
  assert.throws(() => recordEntityDecision(record, {id: "E-099", at, based_on_version: 1, outcome: "revise", reviewer: "A model", rationale: "Models agree", new_statement: "A new claim"}, () => false), /trusted human-review/);
});

test("externally authorized decisions preserve exact previous revisions and reject stale reviews", () => {
  const previous = addEntityDraft(seed(), objection);
  // A trusted integration must verify identity and decision authorization; this stub ONLY exercises the pure function.
  const authorize = () => true;
  const newStatement = "Korrektur kann das Urteil verbessern, muss aber erneut geprüft werden.";
  const result = recordEntityDecision(previous, {id: "H-001", at, based_on_version: 1, outcome: "narrow", reviewer: "Synthetic test reviewer", rationale: "The counterexample defeats the universal quantifier.", new_statement: newStatement}, authorize);
  assert.equal(result.versions.length, 2);
  assert.equal(result.versions[0].statement, previous.versions[0].statement);
  assert.equal(result.versions[1].statement, newStatement);
  assert.equal(previous.current_version, 1);
  assert.equal(inspectEntityRecord(result).last_decision.outcome, "narrow");
  assert.equal(inspectEntityRecord(result).public_score_allowed, false);
  assert.throws(() => recordEntityDecision(result, {id: "H-002", at, based_on_version: 1, outcome: "retain", reviewer: "Test", rationale: "Stale review"}, authorize), /stale/);
  assert.throws(() => recordEntityDecision(result, {id: "H-003", at, based_on_version: 2, outcome: "revise", reviewer: "Test", rationale: "Same wording", new_statement: newStatement}, authorize), /changed wording/);
});

test("withdrawal and open disagreement are preserved without auto-awarding maturity", () => {
  const authorize = () => true;
  const open = recordEntityDecision(seed(), {id: "H-001", at, based_on_version: 1, outcome: "leave_open", reviewer: "Synthetic test reviewer", rationale: "Incompatible values remain."}, authorize);
  assert.equal(open.current_version, 1);
  assert.equal(inspectEntityRecord(open).last_decision.outcome, "leave_open");
  const withdrawn = recordEntityDecision(open, {id: "H-002", at, based_on_version: 1, outcome: "withdraw", reviewer: "Synthetic test reviewer", rationale: "Unfounded claim."}, authorize);
  assert.equal(withdrawn.current_version, 2);
  assert.equal(withdrawn.versions[1].change, "withdraw");
  assert.equal(inspectEntityRecord(withdrawn).human_consensus, "not_assessed");
});

test("invalid inputs and source URLs fail closed", () => {
  assert.throws(() => createEntityRecord({id: "__", question: "Question", statement: "Claim"}), /invalid record/);
  assert.throws(() => createEntityRecord({id: "ID-1", question: "Question", statement: "Claim", claim_type: "proof"}), /unknown claim/);
  assert.throws(() => addEntityDraft(seed(), {...objection, source_url: "javascript:alert(1)"}), /invalid draft/);
  assert.throws(() => addEntityDraft(seed(), {...objection, at: "yesterday"}), /invalid UTC/);
  assert.throws(() => addEntityDraft(seed(), {...objection, text: "a".repeat(2001)}), /invalid draft/);
});

test("the bilingual public contract and synthetic fixture stay consistent", () => {
  const protocol = JSON.parse(readFileSync(new URL("../public/protocol/entity-loop.v0.json", import.meta.url), "utf8"));
  const demo = JSON.parse(readFileSync(new URL("../public/knowledge/entity-demo.v0.json", import.meta.url), "utf8"));
  assert.equal(protocol.schema_version, 1);
  assert.equal(protocol.status, "experimental_proposal");
  assert.equal(protocol.runtime_enabled, false);
  assert.deepEqual(protocol.draft_kinds, entityDraftKinds);
  assert.equal(protocol.direction_index.public_score_allowed, false);
  assert.equal(demo.status, "synthetic_editorial_example");
  for (const lang of ["de", "en"]) {
    let record = createEntityRecord({...demo.initial[lang], id: demo.id, lang});
    for (const e of demo.events[lang]) record = addEntityDraft(record, e);
    const result = inspectEntityRecord(record);
    assert.equal(result.review_state, "unreviewed_draft");
    assert.ok(result.draft_counts.objection > 0);
    assert.ok(result.draft_counts.revision_proposal > 0);
    assert.equal(result.direction_index, null);
  }
});
