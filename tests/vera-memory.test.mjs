import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { formatMemory, memoryPath, validateMemory } from "../scripts/vera-memory.mjs";

const repository = "https://github.com/example/Vera";
const revision = "a".repeat(40);
const previousRevision = "b".repeat(40);
const options = { language: "en", repository, revision };

function record(number, status = "open") {
  return {
    id: `VM-${String(number).padStart(3, "0")}`,
    status,
    sources: [{ path: "docs/vera.md" }, { path: "docs/grundtext.md", revision: previousRevision }],
    de: { observation: "Beobachtung", lesson: "Lehre", limits: "Grenzen" },
    en: { observation: "Observation", lesson: "Lesson", limits: "Limits" }
  };
}

test("Vera validates the project memory ledger and its current source paths", () => {
  const ledger = JSON.parse(readFileSync(new URL(`../${memoryPath}`, import.meta.url), "utf8"));
  validateMemory(ledger);
  for (const entry of ledger.entries) {
    for (const { path, revision } of entry.sources) {
      if (revision === undefined) assert.ok(existsSync(new URL(`../${path}`, import.meta.url)), path);
    }
  }
});

test("Vera rejects invalid IDs, statuses, sources and bilingual records", () => {
  const entry = record(1);
  const invalidEntries = [
    [entry, entry],
    [{ ...entry, status: "approved" }],
    [{ ...entry, sources: [{ path: "../outside.md" }] }],
    [{ ...entry, sources: [{ path: "docs/vera.md", revision: "main" }] }],
    [{ ...entry, en: { ...entry.en, limits: "" } }],
    [{ ...entry, en: { ...entry.en, lesson: "Lesson\n# Injected heading" } }],
    [{ ...entry, en: { ...entry.en, lesson: "ä".repeat(241) } }]
  ];
  for (const entries of invalidEntries) {
    assert.throws(() => validateMemory({ schemaVersion: 1, entries }), /Vera memory entry/);
  }
  assert.throws(() => validateMemory({ schemaVersion: 2, entries: [entry] }), /schema/);
});

test("Vera projects the newest active records with immutable source URLs", () => {
  const entries = Array.from({ length: 10 }, (_, index) => record(index + 1));
  entries.push(record(11, "superseded"));
  entries.push(record(12, "reproduced"));
  const output = formatMemory({ schemaVersion: 1, entries }, options);
  assert.match(output, /VM-012 · reproduced/);
  assert.match(output, /VM-004 · open/);
  assert.doesNotMatch(output, /VM-00[1-3]|VM-011/);
  assert.ok(output.indexOf("VM-012") < output.indexOf("VM-010"));
  assert.ok(output.includes(`${repository}/blob/${revision}/docs/vera.md`));
  assert.ok(output.includes(`${repository}/blob/${previousRevision}/docs/grundtext.md`));
  assert.match(output, /superseded records\) · 4$/);
});

test("Vera bounds the volume of records added to a session", () => {
  const en = { observation: "x".repeat(480), lesson: "y".repeat(480), limits: "z".repeat(480) };
  const entries = Array.from({ length: 8 }, (_, index) => ({ ...record(index + 1), en }));
  const output = formatMemory({ schemaVersion: 1, entries }, options);
  assert.match(output, /VM-008/);
  assert.doesNotMatch(output, /VM-005/);
  assert.match(output, /superseded records\) · [5-7]$/);
});

test("the memory audit resolves the ledger and its sources at the cited commits", (t) => {
  const cwd = mkdtempSync(join(tmpdir(), "vera-memory-"));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  const git = (...args) => execFileSync("git", ["-C", cwd, ...args], { encoding: "utf8" }).trim();
  const commit = () => {
    git("add", "-A");
    git("-c", "user.name=Vera Test", "-c", "user.email=vera@example.invalid",
      "-c", "commit.gpgsign=false", "commit", "-qm", "Test snapshot");
  };
  const script = fileURLToPath(new URL("../scripts/verify-memory.mjs", import.meta.url));
  const audit = () => spawnSync(process.execPath, [script], { cwd, encoding: "utf8" });
  git("init", "-q");
  const source = join(cwd, "historical.md");
  writeFileSync(source, "Original observation");
  commit();
  const original = git("rev-parse", "HEAD");
  rmSync(source);
  mkdirSync(join(cwd, "docs"));
  const entry = record(1);
  entry.sources = [{ path: "historical.md", revision: original }];
  const saveLedger = () => writeFileSync(join(cwd, memoryPath), JSON.stringify({ schemaVersion: 1, entries: [entry] }));
  saveLedger();
  commit();
  assert.equal(audit().status, 0);

  entry.sources[0].path = "added-later.md";
  writeFileSync(join(cwd, "added-later.md"), "Only exists at a later revision");
  saveLedger();
  commit();
  const missing = audit();
  assert.equal(missing.status, 1);
  assert.ok(missing.stderr.includes(`VM-001: cannot verify ${original}:added-later.md`));

  // A local fix takes effect only once it is in the snapshot being audited.
  delete entry.sources[0].revision;
  saveLedger();
  assert.equal(audit().status, 1);
  commit();
  assert.equal(audit().status, 0);
});
