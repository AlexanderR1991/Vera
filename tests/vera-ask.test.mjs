import assert from "node:assert/strict";
import { execFile, execFileSync } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { test } from "node:test";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const run = promisify(execFile);
const ask = fileURLToPath(new URL("../scripts/vera-ask.mjs", import.meta.url));
const exportContext = fileURLToPath(new URL("../scripts/vera-context.mjs", import.meta.url));
const root = fileURLToPath(new URL("../", import.meta.url));

async function serve(t, respond) {
  const server = createServer(respond);
  t.after(() => server.close());
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  return {
    cwd: tmpdir(),
    env: { ...process.env, VERA_OLLAMA_PORT: String(server.address().port) },
    timeout: 5000
  };
}

test("Vera sends the committed context and question separately to a local model", async (t) => {
  const received = [];
  const options = await serve(t, async (req, res) => {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    received.push({ method: req.method, url: req.url, payload: JSON.parse(Buffer.concat(chunks)) });
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: { role: "assistant", content: "Model response." }, done: true }));
  });

  for (const [language, question, label] of [
    ["de", "Was würde deine Meinung ändern?", "KI-Entwurf"],
    ["en", "What would change your mind?", "AI draft"]
  ]) {
    const context = execFileSync(process.execPath, [exportContext, language], { encoding: "utf8" });
    const model = "test-model";
    const { stdout, stderr } = await run(process.execPath, [ask, language, model, question], options);
    assert.equal(stdout, "Model response.\n");
    assert.equal(stderr, `${label} · ${context.split("\n", 1)[0]} · "test-model"\n`);
    const { method, url, payload } = received.at(-1);
    assert.equal(method, "POST");
    assert.equal(url, "/api/chat");
    assert.equal(payload.model, model);
    assert.equal(payload.stream, false);
    assert.equal(payload.messages.length, 2);
    assert.equal(payload.messages[0].role, "system");
    assert.ok(payload.messages[0].content.startsWith(context));
    assert.deepEqual(payload.messages[1], { role: "user", content: question });
    assert.deepEqual(payload.tools.map((tool) => tool.function.name), ["search_project"]);
  }
  assert.equal(received.length, 2);
});

function searchCall(term) {
  return { function: { name: "search_project", arguments: { gap: "Die Definition fehlt.", term } } };
}

test("Vera performs a model-initiated search and returns the actual committed passage", async (t) => {
  const requests = [];
  const term = "gegenseitiges Wiedergeben mit Korrekturmöglichkeit";
  const options = await serve(t, async (req, res) => {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const payload = JSON.parse(Buffer.concat(chunks));
    requests.push(payload);
    const message = requests.length === 1
      ? { content: "", tool_calls: [searchCall(term)] }
      : { content: JSON.parse(payload.messages.at(-1).content).passages[0]?.excerpt ?? "Offen." };
    res.end(JSON.stringify({ message, done: true }));
  });

  const { stdout, stderr } = await run(process.execPath, [ask, "de", "test-model", "Was prüft M-02?"], options);
  const revision = execFileSync("git", ["-C", root, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  const path = "docs/mathematik-des-dazwischen.md";
  const lines = execFileSync("git", ["-C", root, "show", `${revision}:${path}`], { encoding: "utf8" }).split("\n");
  const lineIndex = lines.findIndex((line) => line.toLowerCase().includes(term.toLowerCase()));
  assert.ok(lineIndex >= 0);
  assert.equal(requests.length, 2);
  assert.ok(!JSON.stringify(requests[0]).includes(lines[lineIndex]));
  assert.equal(requests[1].tools, undefined);
  const source = requests[1].messages.at(-1);
  assert.equal(source.role, "tool");
  const { passages } = JSON.parse(source.content);
  assert.equal(passages.length, 1);
  assert.ok(passages[0].url.endsWith(`/blob/${revision}/${path}#L${lineIndex + 1}`));
  assert.equal(passages[0].excerpt, lines[lineIndex]);
  assert.equal(stdout, `${lines[lineIndex]}\n`);
  assert.ok(stderr.includes(passages[0].url));
});

test("Vera can start with open questions and reports an empty search without invented sources", async (t) => {
  const requests = [];
  const options = await serve(t, async (req, res) => {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    requests.push(JSON.parse(Buffer.concat(chunks)));
    const message = requests.length === 1
      ? { content: "", tool_calls: [searchCall("--vera-test-missing-d74fa1")] }
      : { content: "The question remains open." };
    res.end(JSON.stringify({ message, done: true }));
  });

  const { stdout, stderr } = await run(process.execPath, [ask, "en", "test-model", "--explore"], options);
  assert.equal(requests.length, 2);
  assert.match(requests[0].messages[1].content, /^U-001 How do we know when a belief needs revision\?$/m);
  assert.deepEqual(JSON.parse(requests[1].messages.at(-1).content), { passages: [] });
  assert.equal(stdout, "The question remains open.\n");
  assert.match(stderr, /No matching project passages/);
  assert.doesNotMatch(stderr, /https?:/);
});

test("Vera rejects multiple tool requests without a follow-up", async (t) => {
  let calls = 0;
  const options = await serve(t, (req, res) => {
    req.resume();
    calls += 1;
    res.end(JSON.stringify({ message: { tool_calls: [searchCall("test"), searchCall("test")] }, done: true }));
  });

  await assert.rejects(run(process.execPath, [ask, "de", "test-model", "Was ist offen?"], options), {
    code: 1,
    stdout: "",
    stderr: "Vera: Expected at most one project search.\n"
  });
  assert.equal(calls, 1);
});

test("Vera fails without printing an answer if the endpoint redirects or returns an incomplete reply", async (t) => {
  let calls = 0;
  const options = await serve(t, (req, res) => {
    req.resume();
    calls += 1;
    if (calls === 1) {
      res.writeHead(307, { Location: "/redirect-target" });
      res.end();
    } else {
      res.end(JSON.stringify({ message: { content: "Partial" }, done: false }));
    }
  });
  const args = [ask, "de", "test-model", "Meine Frage"];

  await assert.rejects(run(process.execPath, args, options), (error) => {
    assert.equal(error.code, 1);
    assert.equal(error.stdout, "");
    assert.match(error.stderr, /HTTP 307/);
    return true;
  });
  assert.equal(calls, 1);

  await assert.rejects(run(process.execPath, args, options), (error) => {
    assert.equal(error.code, 1);
    assert.equal(error.stdout, "");
    assert.match(error.stderr, /no complete text answer/);
    return true;
  });
});

test("Vera rejects invalid input without printing an answer", async () => {
  await assert.rejects(run(process.execPath, [ask, "de", "test-model", " "]), (error) => {
    assert.equal(error.code, 2);
    assert.equal(error.stdout, "");
    assert.match(error.stderr, /Usage:/);
    return true;
  });
});
