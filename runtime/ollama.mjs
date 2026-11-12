import { request } from "node:http";
import { positiveInteger, runtimeSchemaVersion, tokenCount, validateMessages, validateOptions } from "./contract.mjs";

/** A loopback-only adapter. An optional digest is recorded, never claimed verified. */
export function createOllamaAdapter({ model, modelDigest = null, port = 11434,
  options = { num_ctx: 8192 }, timeoutMs = 300_000,
  maxInputBytes = 1024 * 1024, maxResponseBytes = 4 * 1024 * 1024 } = {}) {
  if (typeof model !== "string" || !model.trim() || model !== model.trim()) throw new Error("Expected a local model name.");
  if (modelDigest !== null && (typeof modelDigest !== "string" || !/^(?:sha256:)?[a-f0-9]{64}$/i.test(modelDigest))) {
    throw new Error("Expected a SHA-256 model digest or null.");
  }
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid Ollama port.");
  for (const [name, value] of Object.entries({ timeoutMs, maxInputBytes, maxResponseBytes })) positiveInteger(value, name);
  validateOptions(options);
  const defaults = { ...options };
  const identity = Object.freeze({ provider: "ollama", model, modelDigest, digestVerified: false });

  return {
    identity,
    async generate({ messages, tools, options: overrides = {}, signal } = {}) {
      validateMessages(messages);
      const settings = { ...defaults, ...overrides };
      validateOptions(settings);
      if (tools !== undefined && (!Array.isArray(tools) || tools.some(tool =>
        tool?.type !== "function" || typeof tool.function?.name !== "string" || !tool.function.name.trim()))) {
        throw new Error("Expected function tool definitions.");
      }
      const body = JSON.stringify({ model, messages, tools, stream: false, options: settings });
      if (Buffer.byteLength(body, "utf8") > maxInputBytes) throw new Error("Inference request exceeds the input byte budget.");
      const started = performance.now();
      const deadline = AbortSignal.timeout(timeoutMs);
      const requestSignal = signal ? AbortSignal.any([signal, deadline]) : deadline;
      const response = await new Promise((resolve, reject) => {
        const req = request({ hostname: "127.0.0.1", port, path: "/api/chat", method: "POST",
          agent: false, signal: requestSignal, headers: { "Content-Type": "application/json" } }, resolve);
        req.on("error", reject);
        req.end(body);
      });
      if (response.statusCode !== 200) {
        response.resume();
        throw new Error(`Ollama returned HTTP ${response.statusCode}. Check the server and the installed model name.`);
      }
      const chunks = [];
      let bytes = 0;
      for await (const chunk of response) {
        bytes += chunk.length;
        if (bytes > maxResponseBytes) {
          response.destroy();
          throw new Error("Ollama response exceeds the response byte budget.");
        }
        chunks.push(chunk);
      }
      const result = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      const record = {
        schemaVersion: runtimeSchemaVersion,
        message: result?.message,
        model: { ...identity, reported: typeof result?.model === "string" ? result.model : null },
        options: settings,
        usage: { inputTokens: tokenCount(result?.prompt_eval_count), outputTokens: tokenCount(result?.eval_count) },
        finishReason: result?.done_reason ?? null,
        durationMs: Math.round(performance.now() - started)
      };
      if (result?.done !== true || result.done_reason === "length" || !result.message || typeof result.message !== "object") {
        throw Object.assign(new Error("Ollama returned no complete text answer."), { inference: record });
      }
      if (settings.num_predict !== undefined && record.usage.outputTokens !== null && record.usage.outputTokens > settings.num_predict) {
        throw Object.assign(new Error("Ollama exceeded the output token budget."), { inference: record });
      }
      return record;
    }
  };
}
