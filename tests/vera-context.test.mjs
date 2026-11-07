import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

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
  copy("src/lib/vera-context.mjs");
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

  const german = run();
  const english = run("en");
  assert.equal(german, run("de"));
  for (const [output, path] of [[german, paths[2]], [english, paths[3]]]) {
    assert.ok(output.startsWith(`Vera · Git ${revision}\n`));
    assert.ok(output.includes(`${repository}/blob/${revision}/${path}`));
    assert.ok(output.endsWith(`${git("show", `HEAD:${path}`).trim()}\n`));
    assert.doesNotMatch(output, /private draft/);
  }
  assert.match(german, /Fürsorglich widersprechen/);
  assert.match(english, /Disagree with care/);
  assert.doesNotMatch(german, /Disagree with care/);
  assert.doesNotMatch(english, /Fürsorglich widersprechen/);
});

test("Vera rejects an unsupported language without exporting context", () => {
  const result = spawnSync(process.execPath, [fileURLToPath(script), "fr"], { encoding: "utf8" });
  assert.equal(result.status, 2);
  assert.equal(result.stdout, "");
  assert.match(result.stderr, /Usage:/);
});
