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
    assert.equal(payload.tools, undefined);
  }
  assert.equal(received.length, 2);
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
