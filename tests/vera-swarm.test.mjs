import assert from "node:assert/strict";
import { execFile, execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { promisify } from "node:util";

const execute = promisify(execFile);
const entitySource = "src/lib/vera-entity.mjs";
const script = "scripts/vera-swarm.mjs";

function checkout(t) {
  const root = mkdtempSync(join(tmpdir(), "vera-swarm-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const paths = [script, "scripts/vera-task.mjs", "scripts/vera-context.mjs",
    "scripts/vera-memory.mjs", "src/lib/vera-context.mjs", "docs/vera-memory.v1.json",
    "docs/vera.md", "docs/selbstkorrektur.md", "public/project.json",
    "public/prompts/erkenntnisprompt-v1.de.txt", "public/prompts/erkenntnisprompt-v1.en.txt",
    entitySource, "src/components/VeraEntity.astro",
    "src/lib/erkenntnis.mjs", "src/components/VeraErkenntnis.astro"];
  for (const path of paths) {
    const destination = join(root, path);
    mkdirSync(dirname(destination), { recursive: true });
    copyFileSync(new URL("../" + path, import.meta.url), destination);
  }
  const git = (...args) => execFileSync("git", ["-C", root, ...args], { encoding: "utf8" });
  git("init", "-q");
  git("add", ".");
  git("-c", "user.name=Vera Test", "-c", "user.email=vera@example.invalid",
    "-c", "commit.gpgsign=false", "commit", "-qm", "Create source snapshot");
  return { root, revision: git("rev-parse", "HEAD").trim() };
}

test("Vera exports pinned briefs and preserves objections and failed roles with a mock Ollama endpoint", async (t) => {
  const { root, revision } = checkout(t);
  writeFileSync(join(root, entitySource), "UNCOMMITTED PRIVATE MARKER\n");
  const requests = [];
  const source = entitySource + ":1-52";
  const server = createServer(async (request, response) => {
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    requests.push({ url: request.url, body });
    const role = body.messages[0].content;
    const math = role.includes("Check invariants");
    const engineering = role.includes("Check provenance");
    if (body.model === "partial" && engineering) {
      response.writeHead(503).end();
      return;
    }
    const draft = {
      source: body.model === "partial" && math ? "private.txt:1-5" : source,
      kind: "code-observation",
      finding: "A candidate finding.",
      objection: math ? "This case challenges the common premise." : "A different objection.",
      test: "Try the example with and without the proposed change.",
      proposal: "Check the finding before making an edit.",
      uncertainty: "The behavior has not been tested by the model."
    };
    response.end(JSON.stringify({ done: true, message: { content: JSON.stringify(draft) } }));
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  t.after(() => server.close());

  const env = { ...process.env, VERA_OLLAMA_PORT: String(server.address().port) };
  const run = (...args) => execute(process.execPath, [join(root, script), ...args], { env, timeout: 10_000 });
  const brief = JSON.parse((await run("de", "entity")).stdout);
  assert.equal(brief.status, "briefs-only");
  assert.equal(brief.revision, revision);
  assert.equal(brief.roles.length, 3);
  assert.match(brief.input.context, /export function queryVera/);
  assert.match(brief.input.context, /selected\.querySelector\("summary"\)\?\.focus/);
  assert.doesNotMatch(brief.input.context, /UNCOMMITTED PRIVATE MARKER/);
  assert.equal(requests.length, 0);
  const insight = JSON.parse((await run("en", "insight")).stdout);
  assert.match(insight.input.context, /export function assessErkenntnis/);
  assert.match(insight.input.context, /observations\.pop/);

  const complete = JSON.parse((await run("de", "entity", "complete")).stdout);
  assert.equal(complete.status, "unreviewed-ai-drafts");
  assert.equal(complete.revision, revision);
  assert.deepEqual(complete.roles.map(role => role.role), ["philosophy", "mathematics", "engineering"]);
  assert.equal(complete.roles[1].objection, "This case challenges the common premise.");
  assert.equal(complete.roles[1].source, brief.sources[source]);
  assert.equal(requests.length, 3);
  assert.equal(new Set(requests.map(({ body }) => body.messages[0].content)).size, 3);
  for (const { url, body } of requests) {
    assert.equal(url, "/api/chat");
    assert.deepEqual(body.messages.map(message => message.role), ["system", "user"]);
    assert.deepEqual(JSON.parse(body.messages[1].content), brief.input);
    assert.equal(body.tools, undefined);
  }

  await assert.rejects(run("de", "entity", "partial"), error => {
    assert.equal(error.code, 1);
    const partial = JSON.parse(error.stdout);
    assert.equal(partial.status, "partial");
    assert.deepEqual(partial.roles.map(role => role.status), ["unreviewed-ai-draft", "invalid", "unavailable"]);
    assert.equal(partial.roles[0].source, brief.sources[source]);
    return true;
  });
});

test("Vera selects an allowlisted review target and proposes a check after separate drafts", async (t) => {
  const { root, revision } = checkout(t);
  const requests = [];
  const source = "scripts/vera-swarm.mjs:5-43";
  const server = createServer(async (request, response) => {
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    requests.push(body);
    const [system, user] = body.messages;
    let draft;
    if (system.content.startsWith("Choose one bounded")) {
      draft = { target: body.model === "bad-target" ? "private.txt" : "swarm", reason: "Inspect target selection." };
    } else if (system.content.startsWith("Under META-01 propose")) {
      draft = { role: body.model === "bad-check" ? "invented" : "engineering", reason: "This check can falsify the finding." };
    } else {
      draft = {
        source: JSON.parse(user.content).sourceSelectors.includes(source) ? source : "private.txt",
        kind: "hypothesis",
        finding: "The catalogue may admit an unknown target.",
        objection: system.content.includes("Check invariants") ? "The allowlist already constrains it." : "The premise needs a test.",
        test: "Return a target outside the catalogue.",
        proposal: "Reject it before sending any source excerpts.",
        uncertainty: "The model did not run the check."
      };
    }
    response.end(JSON.stringify({ done: true, message: { content: JSON.stringify(draft) } }));
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  t.after(() => server.close());

  const env = { ...process.env, VERA_OLLAMA_PORT: String(server.address().port) };
  const run = (...args) => execute(process.execPath, [join(root, script), "de", "auto", ...args], { env, timeout: 10_000 });
  const brief = JSON.parse((await run()).stdout);
  assert.equal(brief.status, "selection-brief-only");
  assert.equal(requests.length, 0);

  const report = JSON.parse((await run("valid")).stdout);
  assert.equal(report.target, "swarm");
  assert.equal(report.revision, revision);
  assert.equal(report.humanDecision, "pending");
  assert.equal(report.selection.status, "unreviewed-ai-draft");
  assert.equal(report.nextCheck.role, "engineering");
  assert.equal(report.nextCheck.test, report.roles[2].test);
  assert.equal(report.nextCheck.source, report.sources[source]);
  assert.equal(report.roles[1].objection, "The allowlist already constrains it.");
  assert.equal(requests.length, 5);
  assert.deepEqual(JSON.parse(requests[0].messages[1].content), brief.brief.input);
  for (const body of requests.slice(1, 4)) {
    assert.deepEqual(body.messages.map(message => message.role), ["system", "user"]);
    assert.equal(body.tools, undefined);
    assert.equal(body.messages[1].content, requests[1].messages[1].content);
  }
  assert.doesNotMatch(JSON.parse(requests[1].messages[1].content).context, /Vera · Git/);
  assert.deepEqual(JSON.parse(requests[4].messages[1].content), report.roles);

  await assert.rejects(run("bad-target"), error => {
    assert.equal(error.code, 1);
    assert.equal(JSON.parse(error.stdout).status, "selection-failed");
    return true;
  });
  assert.equal(requests.length, 6);

  await assert.rejects(run("bad-check"), error => {
    assert.equal(error.code, 1);
    const failed = JSON.parse(error.stdout);
    assert.equal(failed.status, "partial");
    assert.equal(failed.nextCheck.status, "invalid");
    assert.equal(failed.roles.length, 3);
    assert.equal(failed.humanDecision, "pending");
    return true;
  });
});
