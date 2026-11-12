import { runtimeSchemaVersion, validateMessages } from "./contract.mjs";

export const projectSearchName = "search_project";
export const projectSearchTool = {
  type: "function",
  function: {
    name: projectSearchName,
    description: "Find passages in the committed project documentation for one consequential gap.",
    parameters: { type: "object", properties: {
      gap: { type: "string", description: "The missing information and why it matters." },
      term: { type: "string", description: "One short literal search term or phrase in the session language." }
    }, required: ["gap", "term"] }
  }
};

/** At most two generations and one read-only project search. Never executes arbitrary tools. */
export async function runInquiry({ adapter, messages, searchProject, options, signal, revision = null, onSearch } = {}) {
  if (typeof adapter?.generate !== "function") throw new Error("Expected an inference adapter.");
  validateMessages(messages);
  if (searchProject !== undefined && typeof searchProject !== "function") throw new Error("Expected a project search function.");
  const conversation = structuredClone(messages);
  const trace = [];
  const sources = [];
  const generate = async tools => {
    const result = await adapter.generate({ messages: conversation, tools, options, signal });
    trace.push({ kind: "generation", model: result.model, options: result.options,
      usage: result.usage, finishReason: result.finishReason, durationMs: result.durationMs });
    return result;
  };
  try {
    let result = await generate(searchProject ? [projectSearchTool] : undefined);
    let reply = result.message;
    const calls = reply?.tool_calls ?? [];
    if (!Array.isArray(calls) || calls.length > 1) throw new Error("Expected at most one project search.");
    if (calls.length) {
      if (!searchProject) throw new Error("Project search is disabled for this run.");
      const call = calls[0]?.function;
      const gap = typeof call?.arguments?.gap === "string" ? call.arguments.gap.trim() : "";
      const term = typeof call?.arguments?.term === "string" ? call.arguments.term.trim() : "";
      if (call?.name !== projectSearchName || !gap || gap.length > 350 || !term || term.length > 80 || /[\u0000-\u001f\u007f]/.test(term)) {
        throw new Error("Ollama returned an invalid project search.");
      }
      const passages = await searchProject(term);
      if (!Array.isArray(passages) || passages.length > 3 || passages.some(p =>
        typeof p?.url !== "string" || typeof p.excerpt !== "string" || p.excerpt.length > 400)) {
        throw new Error("Project search returned invalid passages.");
      }
      sources.push(...passages);
      const search = { kind: "project-search", revision, gap, term, passages };
      trace.push(search);
      if (onSearch) await onSearch(search);
      conversation.push({ role: "assistant", content: reply.content ?? "", tool_calls: calls },
        { role: "tool", tool_name: projectSearchName, content: JSON.stringify({ passages }) });
      result = await generate();
      reply = result.message;
    }
    const remainingCalls = reply?.tool_calls ?? [];
    if (!Array.isArray(remainingCalls) || remainingCalls.length || typeof reply?.content !== "string" || !reply.content.trim()) {
      throw new Error("Ollama returned no complete text answer.");
    }
    conversation.push({ role: "assistant", content: reply.content });
    return { schemaVersion: runtimeSchemaVersion, status: "unreviewed-ai-draft", revision,
      content: reply.content.trimEnd(), message: reply, messages: conversation, model: result.model,
      sources, trace, usage: result.usage, authority: { publish: false, humanDecision: false, updateWeights: false } };
  } catch (error) {
    if (error.inference) trace.push({ kind: "generation-failure", ...error.inference });
    error.trace = trace;
    throw error;
  }
}
