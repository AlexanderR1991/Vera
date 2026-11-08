import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { memoryPath } from "../scripts/vera-memory.mjs";

const script = new URL("../scripts/vera-context.mjs", import.meta.url);

test("Vera exports the selected language from HEAD even with staged and unstaged edits", (t) => {
  const root = mkdtempSync(join(tmpdir(), "vera-context-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const git = (...args) => execFileSync("git", ["-C", root, ...args], { encoding: "utf8" });
  const copy = (path) => {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    copyFileSync(new URL(`../${path}`, import.meta.url), join(root, path));
  };
  const paths = ["docs/vera.md", "public/project.json",
    "public/prompts/erkenntnisprompt-v1.de.txt", "public/prompts/erkenntnisprompt-v1.en.txt"];
  paths.forEach(copy);
  copy("scripts/vera-context.mjs");
  copy("scripts/vera-memory.mjs");
  copy("src/lib/vera-context.mjs");
  const entry = {
    id: "VM-001",
    status: "open",
    sources: [{ path: paths[0] }],
    de: { observation: "Eine gespeicherte Beobachtung.", lesson: "Eine Lehre.", limits: "Offene Grenzen." },
    en: { observation: "A recorded observation.", lesson: "A lesson.", limits: "Open limits." }
  };
  writeFileSync(join(root, memoryPath), JSON.stringify({ schemaVersion: 1, entries: [entry] }));
  const command = join(root, "scripts/vera-context.mjs");
  const run = (...args) => execFileSync(process.execPath, [command, ...args], { cwd: tmpdir(), encoding: "utf8" });
  git("init", "-q");
  git("add", ".");
  git("-c", "user.name=Vera Test", "-c", "user.email=vera@example.invalid",
    "-c", "commit.gpgsign=false", "commit", "-qm", "Create test snapshot");
  const revision = git("rev-parse", "HEAD").trim();
  const repository = JSON.parse(readFileSync(join(root, "public/project.json"), "utf8")).repository;

  writeFileSync(join(root, paths[0]), "staged private draft");
  git("add", paths[0]);
  writeFileSync(join(root, paths[2]), "unstaged private draft");
  writeFileSync(join(root, memoryPath), "staged private draft memory");
  git("add", memoryPath);
  writeFileSync(join(root, memoryPath), "unstaged private draft memory");

  const german = run();
  const english = run("en");
  assert.equal(german, run("de"));
  for (const [output, path] of [[german, paths[2]], [english, paths[3]]]) {
    assert.ok(output.startsWith(`Vera · Git ${revision}\n`));
    assert.ok(output.includes(`${repository}/blob/${revision}/${path}`));
    assert.ok(output.includes(`${repository}/blob/${revision}/${memoryPath}`));
    assert.ok(output.endsWith(`${git("show", `HEAD:${path}`).trim()}\n`));
    assert.doesNotMatch(output, /private draft/);
  }
  assert.match(german, /Fürsorglich widersprechen/);
  assert.match(english, /Disagree with care/);
  assert.ok(german.includes(entry.de.observation));
  assert.ok(english.includes(entry.en.observation));
  assert.ok(!german.includes(entry.en.observation));
  assert.ok(!english.includes(entry.de.observation));
  assert.doesNotMatch(german, /Disagree with care/);
  assert.doesNotMatch(english, /Fürsorglich widersprechen/);
  assert.match(german, /Neugier auf das, was die Antwort ändern kann/);
  assert.match(english, /Be curious about what could change the answer/);

  writeFileSync(join(root, memoryPath), JSON.stringify({ schemaVersion: 2, entries: [entry] }));
  git("-c", "user.name=Vera Test", "-c", "user.email=vera@example.invalid",
    "-c", "commit.gpgsign=false", "commit", "-qm", "Store an unsupported memory fixture", "--", memoryPath);
  const invalid = spawnSync(process.execPath, [command, "de"], { encoding: "utf8" });
  assert.equal(invalid.status, 1);
  assert.equal(invalid.stdout, "");
  assert.match(invalid.stderr, /Invalid Vera memory schema/);
});

test("Vera rejects an unsupported language without exporting context", () => {
  const result = spawnSync(process.execPath, [fileURLToPath(script), "fr"], { encoding: "utf8" });
  assert.equal(result.status, 2);
  assert.equal(result.stdout, "");
  assert.match(result.stderr, /Usage:/);
});
