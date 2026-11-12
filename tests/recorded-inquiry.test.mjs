import assert from "node:assert/strict";
import { test } from "node:test";
import { createInquiryDraftRecord, runRecordedInquiry } from "../runtime/recorded-inquiry.mjs";
import { runInquiry } from "../runtime/inquiry.mjs";
import { addEntityDraft, inspectEntityRecord, recordEntityDecision } from "../src/lib/entity-core.mjs";

const at = "2026-11-12T12:00:00Z";
const revision = "a".repeat(40);
const question = "What supports this claim?";
const messages = [{ role: "user", content: question }];
const model = { provider: "test-only", model: "synthetic-model", digestVerified: false };
const reply = content => ({ message: { role: "assistant", content }, model, usage: { inputTokens: 5, outputTokens: 2 } });

test("opt-in inference records AI draft and only retrieved source hints while retaining original provenance", async () => {
  let calls = 0;
  const source = { url: `https://github.com/example/project/blob/${revision}/docs/source.md#L1`, excerpt: "A retrieved passage; its truth remains unverified." };
  const wrapper = await runRecordedInquiry({ id: "REC-001", question, at, inquiry: { revision, messages,
    searchProject: () => [source], adapter: { generate: async () => ++calls === 1 ? {
      message: { role: "assistant", content: "", tool_calls: [{ function: { name: "search_project", arguments: { gap: "A source is needed.", term: "claim" } } }] }, model
    } : reply("An unreviewed answer. A model-mentioned https://example.invalid/invented citation is not a retrieved hint.") }
  } });
  assert.equal(calls, 2);
  assert.deepEqual(wrapper.record.events.map(event => [event.kind, event.origin]), [["perspective", "ai_draft"], ["evidence_hint", "ai_draft"]]);
  assert.equal(wrapper.record.events[1].source_url, source.url);
  assert.equal(wrapper.record.events[1].text, source.excerpt);
  assert.equal(wrapper.provenance.git_revision, revision);
  assert.deepEqual(wrapper.provenance.model, model);
  assert.equal(wrapper.provenance.question_binding, "exact_last_user_message");
  assert.equal(wrapper.provenance.authenticated, false);
  assert.equal(wrapper.provenance.source_truth_verified, false);
  assert.equal(wrapper.draft.trace[1].kind, "project-search");
  assert.equal(wrapper.draft.messages.at(-1).content, wrapper.draft.content);
  assert.deepEqual(messages, [{ role: "user", content: question }]);
  assert.deepEqual(wrapper.authority, { publish: false, humanDecision: false, updateWeights: false });
  assert.equal(wrapper.summary.review_state, "unreviewed_draft");
  assert.equal(wrapper.summary.last_decision, null);
  assert.equal(wrapper.summary.human_consensus, "not_assessed");
  const disputed = addEntityDraft(wrapper.record, { id: "OBJ-001", kind: "objection", origin: "human_submission", text: "The source may be wrong.", at, based_on_version: 1 });
  assert.deepEqual(inspectEntityRecord(disputed).open_objection_ids, ["OBJ-001"]);
  assert.throws(() => recordEntityDecision(disputed, { id: "DEC-001", at, based_on_version: 1, outcome: "retain", reviewer: "A model", rationale: "No independent authorization." }), /trusted human-review/);
});

test("record conversion rejects overlong answers, forged source hints and mismatched questions without truncation", async () => {
  const draft = await runInquiry({ revision, messages, adapter: { generate: async () => reply("  Original draft.  ") } });
  const original = structuredClone(draft);
  const wrapper = createInquiryDraftRecord({ id: "REC-002", at, draft });
  assert.deepEqual(wrapper.draft, original);
  wrapper.draft.message.content = "Changed wrapper copy";
  assert.deepEqual(draft, original);
  const long = structuredClone(draft);
  long.content = "x".repeat(2001);
  long.message.content = long.content;
  assert.throws(() => createInquiryDraftRecord({ id: "REC-003", at, draft: long }), /2000-character/);
  assert.equal(long.content.length, 2001);
  const forged = structuredClone(draft);
  forged.sources.push({ url: "https://example.invalid/unretrieved", excerpt: "Not returned by a search." });
  assert.throws(() => createInquiryDraftRecord({ id: "REC-004", at, draft: forged }), /project-search trace/);
  assert.throws(() => createInquiryDraftRecord({ id: "REC-005", at, question: "A different question", draft }), /differs/);
  let generated = false;
  await assert.rejects(runRecordedInquiry({ id: "REC-006", at, question: "A different question", inquiry: { messages, adapter: { generate: async () => { generated = true; return reply("Never generated"); } } } }), /differs/);
  assert.equal(generated, false);
});
