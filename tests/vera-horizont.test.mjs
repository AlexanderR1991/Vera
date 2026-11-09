import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { assessVeraHorizon } from "../src/lib/vera-horizont.mjs";

const script = fileURLToPath(new URL("../scripts/vera-horizont.mjs", import.meta.url));

function check(overrides = {}) {
  return {
    id: "accessible-appeal",
    actor: "visitor using a keyboard",
    capability: "contest",
    scenario: "hypothetical moderation appeal",
    start: "notice",
    targets: ["review recorded"],
    edges: [],
    ...overrides
  };
}

function edge(from, to, status = "verified") {
  return status === "verified"
    ? { from, to, status, evidence: `fixture:${from}->${to}` }
    : { from, to, status };
}

test("an evidenced route wins over a shorter unverified route and reports its evidence", () => {
  const possible = edge("notice", "review recorded", "unknown");
  const first = edge("notice", "appeal received");
  const second = edge("appeal received", "review recorded");
  const result = assessVeraHorizon({ checks: [check({ edges: [possible, first, second] })] });

  assert.equal(result.status, "verified");
  assert.deepEqual(result.checks[0].path, {
    nodes: ["notice", "appeal received", "review recorded"],
    edges: [first, second]
  });
});

test("loss of one actor's sole appeal blocks the scenario even if another actor retains access", () => {
  const available = check({ edges: [edge("notice", "review recorded")] });
  const gap = check({
    id: "appeal-without-account",
    actor: "visitor without an account",
    edges: [edge("notice", "review recorded", "unavailable")]
  });
  const result = assessVeraHorizon({ checks: [available, gap] });

  assert.equal(result.status, "blocked");
  assert.deepEqual(result.checks.map(({ status }) => status), ["verified", "blocked"]);
  assert.equal(result.checks[1].path, null);
});

test("cycles and an unavailable direct edge do not hide a possible route or reverse edge direction", () => {
  const cycle = [edge("notice", "appeal received"), edge("appeal received", "notice")];
  const closed = edge("notice", "review recorded", "unavailable");
  const possible = edge("appeal received", "review recorded", "unknown");
  const reversed = edge("review recorded", "appeal received");
  const unresolved = check({ edges: [...cycle, closed, possible] });
  const blocked = check({ id: "reverse-only", edges: [...cycle, closed, reversed] });

  const result = assessVeraHorizon({ checks: [unresolved] });
  assert.equal(result.status, "unverified");
  assert.deepEqual(result.checks[0].path.edges, [cycle[0], possible]);
  assert.equal(assessVeraHorizon({ checks: [unresolved, blocked] }).status, "blocked");
});

test("an actor already at a target has a zero-step route", () => {
  const result = assessVeraHorizon({ checks: [check({ targets: ["notice", "review recorded"] })] });

  assert.equal(result.status, "verified");
  assert.deepEqual(result.checks[0].path, { nodes: ["notice"], edges: [] });
});

test("invalid or incomplete graphs fail explicitly", () => {
  for (const [input, message] of [
    [{ checks: [] }, /checks must be a nonempty array/],
    [{ checks: [check({ id: " " })] }, /id must be a nonempty string/],
    [{ checks: [check(), check()] }, /id must be unique/],
    [{ checks: [check({ targets: [] })] }, /targets must be a nonempty array/],
    [{ checks: [check({ edges: null })] }, /edges must be an array/],
    [{ checks: [check({ edges: [edge("notice", "review recorded", "maybe")] })] }, /status is invalid/],
    [{ checks: [check({ edges: [{ from: "notice", to: "review recorded", status: "verified" }] })] },
      /evidence must be a nonempty reference/]
  ]) {
    assert.throws(() => assessVeraHorizon(input), message);
  }
});

test("the CLI distinguishes verified, unverified, blocked and invalid inputs", (t) => {
  const temporary = mkdtempSync(join(tmpdir(), "vera-horizont-test-"));
  t.after(() => rmSync(temporary, { recursive: true, force: true }));
  const scenario = join(temporary, "scenario.json");
  const run = (...args) => spawnSync(process.execPath, [script, ...args], { encoding: "utf8" });

  for (const [edgeStatus, expectedStatus, exitCode] of [
    ["verified", "verified", 0],
    ["unknown", "unverified", 1],
    ["unavailable", "blocked", 1]
  ]) {
    writeFileSync(scenario, JSON.stringify({ checks: [check({ edges: [edge("notice", "review recorded", edgeStatus)] })] }));
    const result = run(scenario);
    assert.equal(result.status, exitCode, result.stderr);
    assert.equal(JSON.parse(result.stdout).status, expectedStatus);
  }

  writeFileSync(scenario, "{");
  const malformed = run(scenario);
  assert.equal(malformed.status, 2);
  assert.match(malformed.stderr, /must contain valid JSON/);
  assert.equal(run().status, 2);
});
