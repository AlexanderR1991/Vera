// This contract describes inference, not training or authority to act.
export const runtimeSchemaVersion = 1;

export function validateMessages(messages) {
  if (!Array.isArray(messages) || !messages.length || messages.some(message =>
    !message || !["system", "user", "assistant", "tool"].includes(message.role) ||
    typeof message.content !== "string" ||
    (message.tool_calls !== undefined && !Array.isArray(message.tool_calls)))) {
    throw new Error("Expected nonempty chat messages with a role and text content.");
  }
}

export function validateOptions(options) {
  const allowed = new Set(["num_ctx", "num_predict", "temperature", "seed", "top_p", "top_k", "repeat_penalty"]);
  if (!options || typeof options !== "object" || Array.isArray(options) ||
      Object.entries(options).some(([key, value]) => !allowed.has(key) || typeof value !== "number" || !Number.isFinite(value))) {
    throw new Error("Unsupported inference options. Use finite numeric generation settings.");
  }
  for (const key of ["num_ctx", "num_predict", "top_k"]) {
    if (options[key] !== undefined && (!Number.isSafeInteger(options[key]) || options[key] < 1)) {
      throw new Error(`${key} must be a positive integer.`);
    }
  }
  if (options.seed !== undefined && !Number.isSafeInteger(options.seed)) throw new Error("seed must be an integer.");
  if (options.temperature !== undefined && options.temperature < 0) throw new Error("temperature must be nonnegative.");
  if (options.top_p !== undefined && (options.top_p < 0 || options.top_p > 1)) throw new Error("top_p must be between 0 and 1.");
  if (options.repeat_penalty !== undefined && options.repeat_penalty < 0) throw new Error("repeat_penalty must be nonnegative.");
}

export function positiveInteger(value, name) {
  if (!Number.isSafeInteger(value) || value < 1) throw new Error(`${name} must be a positive integer.`);
  return value;
}

export function tokenCount(value) {
  return Number.isSafeInteger(value) && value >= 0 ? value : null;
}
