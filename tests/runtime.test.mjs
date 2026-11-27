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
import { runRecordedInquiry } from "../runtime/recorded-inquiry.mjs";
import { createGitProjectSource } from "../runtime/project-source.mjs";
import { validateMessages } from "../runtime/contract.mjs";

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

test("Message admission rejects sparse and empty arrays before any adapter call", async () => {
  for (let length = 0; length <= 3; length++) for (let mask = 0; mask < 2 ** length; mask++) {
    const input = new Array(length);
    for (let i = 0; i < length; i++) if (mask & (1 << i)) input[i] = Object.freeze({ role: "user", content: `Message ${i}.` });
    Object.freeze(input);
    const snapshot = structuredClone(input);
    let calls = 0;
    const adapter = { async generate() { calls++; return { finishReason: "stop", message: { content: "A draft." } }; } };
    if (length > 0 && mask === 2 ** length - 1) {
      assert.doesNotThrow(() => validateMessages(input));
      const draft = await runInquiry({ adapter, messages: input });
      assert.equal(draft.content, "A draft.");
      assert.equal(calls, 1);
      assert.deepEqual(draft.messages.slice(0, length), input);
    } else {
      assert.throws(() => validateMessages(input), /Expected nonempty chat messages/);
      await assert.rejects(runInquiry({ adapter, messages: input }), /Expected nonempty chat messages/);
      assert.equal(calls, 0);
    }
    assert.deepEqual(input, snapshot);
  }
});

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

test("Inference rejects sparse tool declarations before HTTP and preserves empty or omitted lists", async t => {
  const received = [];
  const port = await serve(t, (body, res) => {
    received.push(body);
    res.end(JSON.stringify({ done: true, done_reason: "stop", message: { content: "A draft." } }));
  });
  const adapter = createOllamaAdapter({ model: "synthetic", port });
  const cases = [];
  for (let length = 0; length <= 3; length++) for (let mask = 0; mask < 2 ** length; mask++) {
    const tools = new Array(length);
    for (let i = 0; i < length; i++) if (mask & (1 << i)) tools[i] = Object.freeze({
      type: "function", function: Object.freeze({ name: `synthetic_${i}` })
    });
    Object.freeze(tools);
    cases.push({ tools, valid: mask === 2 ** length - 1 });
  }
  cases.push({ tools: undefined, valid: true }, { tools: null, valid: false });
  for (const { tools, valid } of cases) {
    const before = received.length;
    const snapshot = structuredClone(tools);
    if (valid) {
      const record = await adapter.generate({ messages, tools });
      assert.equal(record.finishReason, "stop");
      assert.equal(received.length, before + 1);
      if (tools === undefined) assert.equal(Object.hasOwn(received.at(-1), "tools"), false);
      else assert.deepEqual(received.at(-1).tools, tools);
    } else {
      await assert.rejects(adapter.generate({ messages, tools }), /Expected function tool definitions/);
      assert.equal(received.length, before);
    }
    assert.deepEqual(tools, snapshot);
  }
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

test("Inquiry abort checkpoints prevent new steps and retain completed traces", async () => {
  for (const reason of [undefined, "Synthetic stop", null, 7]) {
    const controller = new AbortController();
    controller.abort(reason);
    let invoked = false;
    await assert.rejects(runInquiry({ messages, signal: controller.signal, adapter: { generate() { invoked = true; } } }), error => {
      assert.equal(error.name, "AbortError");
      assert.equal(error.cause, controller.signal.reason);
      assert.deepEqual(error.trace, []);
      return true;
    });
    assert.equal(invoked, false);
  }
  for (const boundary of ["text", "search", "callback"]) {
    const controller = new AbortController();
    let generations = 0, callbacks = 0;
    await assert.rejects(runInquiry({ messages, signal: controller.signal,
      adapter: { generate() {
        generations++;
        if (boundary === "text") controller.abort("Synthetic stop");
        return { finishReason: "stop", message: boundary === "text" ? { content: "Synthetic answer" } : { content: "", tool_calls: [searchCall] } };
      } },
      searchProject() { if (boundary === "search") controller.abort("Synthetic stop"); return []; },
      onSearch() { callbacks++; controller.abort("Synthetic stop"); }
    }), error => {
      assert.equal(error.name, "AbortError");
      assert.deepEqual(error.trace.map(item => item.kind), boundary === "text" ? ["generation"] : ["generation", "project-search"]);
      return true;
    });
    assert.equal(generations, 1);
    assert.equal(callbacks, boundary === "callback" ? 1 : 0);
  }
});

test("Recorded inquiry rechecks cancellation before converting a completed draft", async () => {
  const controller = new AbortController();
  await assert.rejects(runRecordedInquiry({ id: "ABORT-RECORD", at: "2026-11-24T00:00:00Z", inquiry: {
    messages, signal: controller.signal, adapter: { generate() {
      queueMicrotask(() => queueMicrotask(() => queueMicrotask(() => controller.abort("Synthetic conversion stop"))));
      return { finishReason: "stop", message: { role: "assistant", content: "Synthetic answer" } };
    } }
  } }), error => {
    assert.equal(error.name, "AbortError");
    assert.equal(error.cause, "Synthetic conversion stop");
    assert.deepEqual(error.trace.map(item => item.kind), ["generation"]);
    return true;
  });
});

test("Inference rejects error, truncated, missing and unknown completion reasons with metadata", async t => {
  for (const finishReason of ["error", "length", undefined, "provider_specific_unknown"]) {
    await t.test(String(finishReason), async t => {
      const port = await serve(t, (_body, res) => {
        res.end(JSON.stringify({ done: true, done_reason: finishReason,
          message: { role: "assistant", content: "An unfinished answer" }, prompt_eval_count: 8, eval_count: 4 }));
      });
      await assert.rejects(createOllamaAdapter({ model: "example", port }).generate({ messages }), error => {
        assert.equal(error.inference.finishReason, finishReason ?? null);
        assert.deepEqual(error.inference.usage, { inputTokens: 8, outputTokens: 4 });
        assert.equal(error.inference.message.content, "An unfinished answer");
        return /no complete/.test(error.message);
      });
    });
  }
});

test("Inquiry rejects incomplete alternate-adapter generations before any search or continuation", async () => {
  for (const finishReason of ["error", "length", undefined, "provider_specific_unknown"]) {
    for (const message of [{ content: "An unfinished answer" }, { content: "", tool_calls: [searchCall] }]) {
      let searches = 0, generations = 0;
      await assert.rejects(runInquiry({ messages,
        searchProject: () => { searches++; return []; },
        adapter: { generate: async () => {
          generations++;
          return { message, finishReason, usage: { inputTokens: 8, outputTokens: 4 } };
        } }
      }), error => {
        assert.equal(error.trace.length, 1);
        assert.equal(error.trace[0].finishReason, finishReason);
        assert.deepEqual(error.trace[0].usage, { inputTokens: 8, outputTokens: 4 });
        return /finishReason must be stop/.test(error.message);
      });
      assert.equal(generations, 1);
      assert.equal(searches, 0);
    }
  }
});

test("Inquiry rejects an incomplete answer after one completed project search and retains its trace", async () => {
  for (const finishReason of ["error", "length", undefined, "provider_specific_unknown"]) {
    let searches = 0, generations = 0;
    await assert.rejects(runInquiry({ messages,
      searchProject: () => { searches++; return [{ url: "https://example.invalid/source", excerpt: "A retrieved source." }]; },
      adapter: { generate: async () => ++generations === 1
        ? { message: { content: "", tool_calls: [searchCall] }, finishReason: "stop" }
        : { message: { content: "An unfinished answer" }, finishReason }
      }
    }), error => {
      assert.deepEqual(error.trace.map(event => event.kind), ["generation", "project-search", "generation"]);
      assert.equal(error.trace[0].finishReason, "stop");
      assert.equal(error.trace[2].finishReason, finishReason);
      assert.equal(error.trace[1].passages[0].excerpt, "A retrieved source.");
      return /finishReason must be stop/.test(error.message);
    });
    assert.equal(generations, 2);
    assert.equal(searches, 1);
  }
});

test("Inquiry records one bounded search, preserves caller state and returns only an unreviewed draft", async () => {
  const original = structuredClone(messages);
  let generations = 0;
  const requests = [];
  const adapter = { generate: async request => {
    requests.push(structuredClone(request));
    return { message: ++generations === 1 ? { content: "", tool_calls: [searchCall] } : { content: "A sourced draft.\n" },
      finishReason: "stop", model: { model: "mock", digestVerified: false }, usage: { inputTokens: 4, outputTokens: 2 } };
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

test("Inquiry rejects every sparse passage array before callbacks or continuation", async () => {
  for (let length = 0; length <= 3; length++) for (let mask = 0; mask < 2 ** length; mask++) {
    const passages = new Array(length);
    for (let i = 0; i < length; i++) if (mask & (1 << i)) passages[i] = Object.freeze({ url: `https://example.invalid/${i}`, excerpt: `Source ${i}.` });
    Object.freeze(passages);
    const snapshot = structuredClone(passages);
    let generations = 0, callbacks = 0;
    const operation = runInquiry({ messages, searchProject: () => passages,
      onSearch: () => { callbacks++; },
      adapter: { async generate() {
        return { finishReason: "stop", message: ++generations === 1 ? { content: "", tool_calls: [searchCall] } : { content: "A draft." } };
      } }
    });
    if (mask === 2 ** length - 1) {
      const draft = await operation;
      assert.deepEqual(draft.sources, passages);
      assert.equal(generations, 2);
      assert.equal(callbacks, 1);
    } else {
      await assert.rejects(operation, error => {
        assert.equal(error.message, "Project search returned invalid passages.");
        assert.deepEqual(error.trace.map(event => event.kind), ["generation"]);
        return true;
      });
      assert.equal(generations, 1);
      assert.equal(callbacks, 0);
    }
    assert.deepEqual(passages, snapshot);
  }
});

test("Inquiry fails closed on disabled, arbitrary or repeated tools and preserves the failure trace", async () => {
  const adapterFor = replies => ({ generate: async () => ({ message: replies.shift(), finishReason: "stop" }) });
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


test("Inquiry retains non-Error native cancellation reasons without mutating them", async () => {
  for (const recorded of [false, true]) {
    for (const reason of [null, "Synthetic stop", 7, { code: "synthetic-stop" }, Object.freeze({ code: "frozen-stop" })]) {
      const controller = new AbortController();
      const before = reason && typeof reason === "object" ? Reflect.ownKeys(reason) : null;
      let generations = 0, searches = 0;
      const inquiry = { messages, signal: controller.signal,
        searchProject: () => { searches++; return [{ url: "https://example.invalid/source", excerpt: "Synthetic source." }]; },
        adapter: { async generate({ signal }) {
          generations++;
          if (generations === 1) return { finishReason: "stop", message: { content: "", tool_calls: [searchCall] } };
          controller.abort(reason);
          signal.throwIfAborted();
        } }
      };
      const promise = recorded ? runRecordedInquiry({ id: "REJECTION-227", at: "2026-11-24T00:00:00Z", inquiry }) : runInquiry(inquiry);
      await assert.rejects(promise, error => {
        assert.equal(error.name, "Error");
        assert.equal(error.message, "Inquiry dependency rejected with a non-Error value.");
        assert.equal(error.cause, reason);
        assert.deepEqual(error.trace.map(event => event.kind), ["generation", "project-search"]);
        assert.equal(error.trace[1].passages[0].excerpt, "Synthetic source.");
        return true;
      });
      assert.equal(generations, 2);
      assert.equal(searches, 1);
      if (before) assert.deepEqual(Reflect.ownKeys(reason), before);
    }
  }
});


test("Project source preserves UTF-8 filenames and literal lines in citations", t => {
  const root = mkdtempSync(join(tmpdir(), "vera-paths-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, "public"));
  const repository = "https://github.com/example/vera";
  writeFileSync(join(root, "public/project.json"), JSON.stringify({ repository }));
  const names = ["ordinary.md", "space name.md", "hash#name.md", "query?name.md", "percent%name.md", "literal%20name.md", "tab\tname.md", "line\nname.md", "unicode-ä-字.md"];
  const batchNames = ["0\nfirst.md", "1-middle#?.md", "2-last%.md", "3-extra.md"];
  const batch = "Batch needle " + "x".repeat(450);
  for (const lang of ["de", "en"]) {
    const dir = join(root, "docs", ...(lang === "en" ? ["en"] : []));
    mkdirSync(dir, { recursive: true });
    names.forEach((name, i) => writeFileSync(join(dir, name), `Intro\nTarget-${i} literal  \n`));
    batchNames.forEach(name => writeFileSync(join(dir, name), batch + "\n"));
  }
  const git = (...args) => execFileSync("git", ["-C", root, ...args], { encoding: "utf8", stdio: "pipe" });
  git("init", "-q"); git("add", ".");
  git("-c", "user.name=Vera Test", "-c", "user.email=vera@example.invalid", "-c", "commit.gpgsign=false", "commit", "-qm", "UTF-8 path fixtures");
  for (const language of ["de", "en"]) {
    const source = createGitProjectSource({ root, language });
    const prefix = language === "en" ? "docs/en/" : "docs/";
    const expectedURL = (name, line) => `${repository}/blob/${source.revision}/${(prefix + name).split("/").map(encodeURIComponent).join("/")}#L${line}`;
    names.forEach((name, i) => assert.deepEqual(source.search(`Target-${i}`), [{ url: expectedURL(name, 2), excerpt: `Target-${i} literal  ` }]));
    assert.deepEqual(source.search("Batch needle"), batchNames.slice(0, 3).map(name => ({ url: expectedURL(name, 1), excerpt: batch.slice(0, 400) })));
  }
});


test("Project source isolates machine passages from local Git display settings", t => {
  const root = mkdtempSync(join(tmpdir(), "vera-grep-display-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, "public"));
  const repository = "https://github.com/example/vera";
  writeFileSync(join(root, "public/project.json"), JSON.stringify({ repository }));
  for (const directory of ["docs", "docs/en"]) {
    mkdirSync(join(root, directory), { recursive: true });
    for (const name of ["a.md", "b\nline.md"]) writeFileSync(join(root, directory, name), "Intro\nSynthetic needle evidence  \n");
  }
  const git = (...args) => execFileSync("git", ["-C", root, ...args], { encoding: "utf8", stdio: "pipe" });
  git("init", "-q"); git("add", ".");
  git("-c", "user.name=Vera Test", "-c", "user.email=vera@example.invalid", "-c", "commit.gpgsign=false", "commit", "-qm", "Display fixture");
  const variants = [{}, { "grep.column": "true" }, { "color.grep": "always" }, { "grep.heading": "true" },
    { "grep.break": "true" }, { "grep.fullName": "true" },
    { "grep.column": "true", "color.grep": "always", "grep.heading": "true", "grep.break": "true", "grep.fullName": "true" }];
  const keys = [...new Set(variants.flatMap(settings => Object.keys(settings)))];
  for (const settings of variants) {
    for (const key of keys) git("config", "--local", key, settings[key] ?? (key === "color.grep" ? "never" : "false"));
    const before = git("config", "--local", "--list");
    for (const language of ["de", "en"]) {
      const source = createGitProjectSource({ root, language });
      const directory = language === "en" ? "docs/en" : "docs";
      assert.deepEqual(source.search("needle"), ["a.md", "b\nline.md"].map(name => ({
        url: `${repository}/blob/${source.revision}/${directory}/${encodeURIComponent(name)}#L2`,
        excerpt: "Synthetic needle evidence  "
      })));
    }
    assert.equal(git("config", "--local", "--list"), before);
  }
});

test("Project source rejects repository dot segments without rewriting ordinary names", t => {
  const ordinary = ["https://github.com/SyntheticFixture/Vera", "https://github.com/SyntheticFixture/Vera.docs_v2-1", "https://github.com/SyntheticFIXTURE/VeRa"];
  const invalid = [];
  for (const owner of ["SyntheticFixture", ".", ".."]) for (const repo of ["Vera", ".", ".."]) {
    if (owner !== "SyntheticFixture" || repo !== "Vera") invalid.push(`https://github.com/${owner}/${repo}`);
  }
  for (const repository of [...ordinary, ...invalid]) {
    const root = mkdtempSync(join(tmpdir(), "vera-repository-url-"));
    t.after(() => rmSync(root, { recursive: true, force: true }));
    mkdirSync(join(root, "public")); mkdirSync(join(root, "docs/en"), { recursive: true });
    writeFileSync(join(root, "public/project.json"), JSON.stringify({ repository }));
    for (const path of ["docs/source.md", "docs/en/source.md"]) writeFileSync(join(root, path), "Committed needle.\n");
    const git = (...args) => execFileSync("git", ["-C", root, ...args], { encoding: "utf8", stdio: "pipe" });
    git("init", "-q"); git("add", ".");
    git("-c", "user.name=Vera Test", "-c", "user.email=vera@example.invalid", "-c", "commit.gpgsign=false", "commit", "-qm", "Repository URL fixture");
    for (const language of ["de", "en"]) {
      if (invalid.includes(repository)) {
        assert.throws(() => createGitProjectSource({ root, language }), /Expected the public project repository URL/);
      } else {
        const source = createGitProjectSource({ root, language });
        assert.equal(source.repository, repository);
        const url = `${repository}/blob/${source.revision}/docs/${language === "en" ? "en/" : ""}source.md#L1`;
        assert.deepEqual(source.search("needle"), [{ url, excerpt: "Committed needle." }]);
        assert.equal(new URL(url).href, url);
      }
    }
  }
});

test("Project source admits only full primitive actual commit IDs", t => {
  for (const format of ["sha1", "sha256"]) {
    const root = mkdtempSync(join(tmpdir(), "vera-commit-id-"));
    t.after(() => rmSync(root, { recursive: true, force: true }));
    mkdirSync(join(root, "public")); mkdirSync(join(root, "docs"));
    writeFileSync(join(root, "public/project.json"), JSON.stringify({ repository: "https://github.com/example/vera" }));
    writeFileSync(join(root, "docs/source.md"), "COMMITTED needle.\n");
    const git = (...args) => execFileSync("git", ["--no-replace-objects", "-C", root, ...args], { encoding: "utf8", stdio: "pipe" });
    git("init", "-q", `--object-format=${format}`); git("add", ".");
    git("-c", "user.name=Vera Test", "-c", "user.email=vera@example.invalid", "-c", "commit.gpgsign=false", "commit", "-qm", "Committed source fixture");
    const commit = git("rev-parse", "HEAD").trim();
    const tree = git("rev-parse", "HEAD^{tree}").trim();
    const blob = git("rev-parse", "HEAD:docs/source.md").trim();
    git("-c", "user.name=Vera Test", "-c", "user.email=vera@example.invalid", "-c", "tag.gpgsign=false", "tag", "-a", "fixture-tag", "-m", "Synthetic annotated tag");
    const tag = git("rev-parse", "fixture-tag").trim();
    writeFileSync(join(root, "docs/source.md"), "STAGED_UNCOMMITTED needle.\n"); git("add", "docs/source.md");
    const staged = git("write-tree").trim();
    for (const revision of [commit, undefined, null]) {
      const source = createGitProjectSource({ root, revision });
      assert.equal(source.revision, commit);
      assert.equal(typeof source.revision, "string");
      assert.equal(source.search("needle")[0].excerpt, "COMMITTED needle.");
    }
    let coerced = 0;
    const sentinel = { toString() { coerced++; return commit; } };
    for (const revision of [staged, tree, tag, blob, [commit], new String(commit), sentinel, ...(format === "sha256" ? [commit.slice(0, 40)] : [])]) {
      assert.throws(() => createGitProjectSource({ root, revision }), /Expected a full Git commit revision/);
    }
    assert.equal(coerced, 0);
    assert.equal(git("rev-parse", "HEAD").trim(), commit);
  }
});
