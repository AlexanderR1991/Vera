import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { once } from "node:events";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { createOllamaAdapter } from "../runtime/ollama.mjs";
import { runInquiry } from "../runtime/inquiry.mjs";
import { createGitProjectSource } from "../runtime/project-source.mjs";

const messages = [{ role: "user", content: "Check this source." }];
const searchCall = { function: { name: "search_project", arguments: { gap: "The source is missing.", term: "META-01" } } };

async function serve(t, responder) {
  const server = createServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    responder(JSON.parse(Buffer.concat(chunks)), res);
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => { server.closeAllConnections(); server.close(); });
  return server.address().port;
}

test("Inference records effective options and measured usage without claiming a verified model digest", async t => {
  let received;
  const port = await serve(t, (body, res) => {
    received = body;
    res.end(JSON.stringify({ model: "example:tag", done: true, done_reason: "stop",
      prompt_eval_count: 19, eval_count: 4, message: { role: "assistant", content: "A draft." } }));
  });
  const adapter = createOllamaAdapter({ model: "example:tag", modelDigest: "a".repeat(64), port,
    options: { num_ctx: 8192, temperature: 0.5 }, timeoutMs: 1000 });
  const result = await adapter.generate({ messages, options: { num_ctx: 16896, num_predict: 512, temperature: 0, seed: 42 } });
  assert.equal(received.stream, false);
  assert.deepEqual(received.options, { num_ctx: 16896, temperature: 0, num_predict: 512, seed: 42 });
  assert.deepEqual(result.usage, { inputTokens: 19, outputTokens: 4 });
  assert.equal(result.model.digestVerified, false);
  assert.equal(result.model.reported, "example:tag");
  assert.equal(result.finishReason, "stop");
  assert.equal(result.message.content, "A draft.");
});

test("Inference rejects truncation, excess output and byte overflow and exposes available failure metadata", async t => {
  let requestCount = 0;
  const port = await serve(t, (_body, res) => {
    requestCount++;
    res.end(JSON.stringify({ done: true, done_reason: requestCount === 1 ? "length" : "stop",
      eval_count: 10, message: { content: "Partial answer" } }));
  });
  const adapter = createOllamaAdapter({ model: "example", port });
  await assert.rejects(adapter.generate({ messages }), error => {
    assert.equal(error.inference.finishReason, "length");
    assert.equal(error.inference.usage.inputTokens, null);
    assert.equal(error.inference.usage.outputTokens, 10);
    return /no complete/.test(error.message);
  });
  await assert.rejects(adapter.generate({ messages, options: { num_predict: 2 } }), /output token budget/);
  await assert.rejects(createOllamaAdapter({ model: "example", port, maxResponseBytes: 10 }).generate({ messages }), /response byte budget/);
  const bounded = createOllamaAdapter({ model: "example", port, maxInputBytes: 10 });
  await assert.rejects(bounded.generate({ messages }), /input byte budget/);
  assert.equal(requestCount, 3);
});

test("Inference respects operator cancellation and refuses invalid generation options", async t => {
  const port = await serve(t, () => {});
  const adapter = createOllamaAdapter({ model: "example", port, timeoutMs: 30 });
  await assert.rejects(adapter.generate({ messages }), { name: "AbortError" });
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(adapter.generate({ messages, signal: controller.signal }), { name: "AbortError" });
  await assert.rejects(adapter.generate({ messages, options: { num_ctx: -1 } }), /positive integer/);
  await assert.rejects(adapter.generate({ messages, options: { arbitrary_setting: 1 } }), /Unsupported/);
});

test("Inquiry records one bounded search, preserves caller state and returns only an unreviewed draft", async () => {
  const original = structuredClone(messages);
  let generations = 0;
  const requests = [];
  const adapter = { generate: async request => {
    requests.push(structuredClone(request));
    return { message: ++generations === 1 ? { content: "", tool_calls: [searchCall] } : { content: "A sourced draft.\n" },
      model: { model: "mock", digestVerified: false }, usage: { inputTokens: 4, outputTokens: 2 } };
  } };
  const draft = await runInquiry({ adapter, messages, revision: "b".repeat(40),
    searchProject: term => [{ url: "https://example.invalid/committed-source", excerpt: term }] });
  assert.deepEqual(messages, original);
  assert.equal(generations, 2);
  assert.equal(requests[0].tools[0].function.name, "search_project");
  assert.equal(requests[1].tools, undefined);
  assert.equal(requests[1].messages.at(-1).role, "tool");
  assert.equal(draft.status, "unreviewed-ai-draft");
  assert.equal(draft.content, "A sourced draft.");
  assert.deepEqual(draft.trace.map(event => event.kind), ["generation", "project-search", "generation"]);
  assert.deepEqual(draft.authority, { publish: false, humanDecision: false, updateWeights: false });
});

test("Inquiry fails closed on disabled, arbitrary or repeated tools and preserves the failure trace", async () => {
  const adapterFor = replies => ({ generate: async () => ({ message: replies.shift() }) });
  await assert.rejects(runInquiry({ messages, adapter: adapterFor([{ tool_calls: [searchCall] }]) }), /disabled/);
  let searches = 0;
  const searchProject = () => { searches++; return []; };
  await assert.rejects(runInquiry({ messages, searchProject,
    adapter: adapterFor([{ tool_calls: [{ function: { name: "publish", arguments: {} } }] }]) }), /invalid project search/);
  assert.equal(searches, 0);
  await assert.rejects(runInquiry({ messages, searchProject,
    adapter: adapterFor([{ tool_calls: [searchCall] }, { content: "Published", tool_calls: [searchCall] }]) }), error => {
    assert.equal(error.trace.length, 3);
    return /no complete/.test(error.message);
  });
  assert.equal(searches, 1);
});

test("Project source pins committed prose and excludes later working-tree text", t => {
  const root = mkdtempSync(join(tmpdir(), "vera-source-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, "public"));
  mkdirSync(join(root, "docs"));
  writeFileSync(join(root, "public/project.json"), JSON.stringify({ repository: "https://github.com/example/vera" }));
  writeFileSync(join(root, "docs/source.md"), "Committed needle.\n");
  const git = (...args) => execFileSync("git", ["-C", root, ...args], { encoding: "utf8", stdio: "pipe" });
  git("init", "-q");
  git("add", ".");
  git("-c", "user.name=Vera Test", "-c", "user.email=vera@example.invalid", "-c", "commit.gpgsign=false", "commit", "-qm", "source fixture");
  const source = createGitProjectSource({ root, language: "de" });
  writeFileSync(join(root, "docs/source.md"), "Uncommitted private marker.\n");
  const passages = source.search("needle");
  assert.equal(passages.length, 1);
  assert.equal(passages[0].excerpt, "Committed needle.");
  assert.ok(passages[0].url.endsWith(`/blob/${source.revision}/docs/source.md#L1`));
  assert.deepEqual(source.search("private marker"), []);
  assert.throws(() => source.search("bad\nterm"), /literal project search term/);
});
