// Compare loopback Ollama /api/tags snapshots. This verifies the server's claims,
// not the provenance or physical integrity of its installed weight files.
const digest = value => typeof value === "string" && /^(?:sha256:)?[a-f0-9]{64}$/.test(value)
  ? value.replace(/^sha256:/, "") : null;

export async function readOllamaIdentity({ model, expectedDigest = null, port = 11434, fetcher = globalThis.fetch } = {}) {
  if (typeof model !== "string" || !model.trim() || !Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Expected local model and Ollama port");
  if (expectedDigest !== null && !digest(expectedDigest)) throw new Error("Expected immutable SHA-256 model digest");
  const response = await fetcher(`http://127.0.0.1:${port}/api/tags`, { signal: AbortSignal.timeout(5000), redirect: "error" });
  if (!response.ok) throw new Error(`Ollama identity endpoint returned HTTP ${response.status}`);
  const chunks = [];
  let size = 0;
  for await (const chunk of response.body) {
    size += chunk.byteLength;
    if (size > 1024 * 1024) { await response.body.cancel?.().catch(() => {}); throw new Error("Ollama identity response exceeds limit"); }
    chunks.push(Buffer.from(chunk));
  }
  const payload = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  const name = model.includes(":") ? model : `${model}:latest`;
  const matches = payload.models?.filter(item => [item.name, item.model].includes(model) || [item.name, item.model].includes(name));
  if (!Array.isArray(matches) || matches.length !== 1 || !digest(matches[0].digest)) throw new Error("Local model is absent or has ambiguous/missing digest metadata");
  const actual = digest(matches[0].digest);
  if (expectedDigest !== null && actual !== digest(expectedDigest)) throw new Error("Local model digest differs from frozen plan");
  return { requested: model, reported_name: matches[0].name ?? matches[0].model, artifact_digest: actual,
    expected_digest_matched: expectedDigest !== null, checked_at: new Date().toISOString(), source: "loopback_api_tags", weights_independently_authenticated: false };
}

export function compareIdentitySnapshots(before, after) {
  return { before, after, stable: before?.requested === after?.requested && !!before?.artifact_digest && before.artifact_digest === after?.artifact_digest };
}
