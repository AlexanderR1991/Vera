import { createEntityRecord, addEntityDraft, inspectEntityRecord, entityLimits } from "../src/lib/entity-core.mjs";
import { runtimeSchemaVersion } from "./contract.mjs";
import { runInquiry } from "./inquiry.mjs";

// Opt-in, in-memory bridge from an inference draft to ENT-00. No persistence,
// publication, human authentication, source-truth verification or status upgrades.
// Supplied runtime provenance is checked for consistency, not authenticated.
// ENT-00 trims surrounding whitespace; the complete original draft is retained.
function boundQuestion(question, messages) {
  const lastUser = Array.isArray(messages) ? messages.findLast(message => message?.role === "user")?.content : undefined;
  if (lastUser !== undefined && question !== undefined && question !== lastUser) throw new Error("Recorded inquiry question differs from the last user message.");
  return { question: question ?? lastUser, binding: lastUser === undefined ? "operator_supplied_unverified" : "exact_last_user_message" };
}

export function createInquiryDraftRecord({ id, question, draft, at, lang = "de", claim_type = "unclassified", scope = "" } = {}) {
  if (draft?.schemaVersion !== runtimeSchemaVersion || draft.status !== "unreviewed-ai-draft" ||
      typeof draft.content !== "string" || !draft.content.trim() || !Array.isArray(draft.sources) || !Array.isArray(draft.trace)) {
    throw new Error("Expected a complete unreviewed runtime draft.");
  }
  if (draft.content.length > entityLimits.text || (typeof draft.message?.content === "string" && draft.message.content.length > entityLimits.text)) {
    throw new Error(`Answer exceeds ENT-00's ${entityLimits.text}-character text limit; nothing was truncated or recorded.`);
  }
  const binding = boundQuestion(question, draft.messages);
  const searched = draft.trace.filter(event => event.kind === "project-search");
  const retrieved = searched.flatMap(event => {
    if (event.revision !== draft.revision || !Array.isArray(event.passages)) throw new Error("Inconsistent retrieved-source provenance.");
    return event.passages;
  });
  if (draft.sources.length > 3 || retrieved.length !== draft.sources.length || draft.sources.some((source, index) =>
    typeof source?.url !== "string" || typeof source.excerpt !== "string" || !source.excerpt.trim() ||
    source.excerpt.length > entityLimits.text || source.url !== retrieved[index]?.url || source.excerpt !== retrieved[index]?.excerpt)) {
    throw new Error("Source hints must match the passages actually recorded in the project-search trace.");
  }
  let record = createEntityRecord({ id, lang, question: binding.question, statement: draft.content, claim_type, scope });
  record = addEntityDraft(record, { id: "AI-ANSWER", kind: "perspective", origin: "ai_draft", text: draft.content, at, based_on_version: 1 });
  for (const [index, source] of draft.sources.entries()) {
    record = addEntityDraft(record, { id: `AI-SOURCE-${index + 1}`, kind: "evidence_hint", origin: "ai_draft", text: source.excerpt,
      source_url: source.url, at, based_on_version: 1 });
  }
  return {
    schemaVersion: 1, kind: "recorded_inquiry_draft", status: "unreviewed-ai-draft", record, summary: inspectEntityRecord(record),
    provenance: { git_revision: draft.revision ?? null, model: structuredClone(draft.model ?? null), question_binding: binding.binding,
      authenticated: false, source_truth_verified: false },
    draft: structuredClone(draft), authority: { publish: false, humanDecision: false, updateWeights: false }
  };
}

export async function runRecordedInquiry({ id, question, at, lang = "de", claim_type = "unclassified", scope = "", inquiry } = {}) {
  const binding = boundQuestion(question, inquiry?.messages);
  if (binding.binding !== "exact_last_user_message") throw new Error("A recorded inference requires a user message to bind the question.");
  const draft = await runInquiry(inquiry);
  return createInquiryDraftRecord({ id, question: binding.question, at, lang, claim_type, scope, draft });
}
