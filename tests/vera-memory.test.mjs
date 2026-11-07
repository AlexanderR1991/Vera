import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
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
