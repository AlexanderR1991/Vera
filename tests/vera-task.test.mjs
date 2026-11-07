import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";

const contextScript = "scripts/vera-context.mjs";
const taskScript = "scripts/vera-task.mjs";
const correction = "docs/selbstkorrektur.md";
const method = "docs/methode.md";

function fixture(t, files) {
  const root = mkdtempSync(join(tmpdir(), "vera-task-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const git = (...args) => execFileSync("git", ["-C", root, ...args], { encoding: "utf8" });
  const write = (path, text) => {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), text);
  };
  const runtimeFiles = [
    contextScript, taskScript, "docs/vera.md", "public/project.json",
    "public/prompts/erkenntnisprompt-v1.de.txt", "public/prompts/erkenntnisprompt-v1.en.txt"
  ];
  const sharedContextModule = "src/lib/vera-context.mjs";
  if (existsSync(new URL(`../${sharedContextModule}`, import.meta.url))) {
    runtimeFiles.push(sharedContextModule);
  }
  for (const path of runtimeFiles) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    copyFileSync(new URL(`../${path}`, import.meta.url), join(root, path));
  }
  for (const [path, content] of Object.entries(files)) write(path, content);
  git("init", "-q");
  git("add", ".");
  git("-c", "user.name=Vera Test", "-c", "user.email=vera@example.invalid",
    "-c", "commit.gpgsign=false", "commit", "-qm", "Create test snapshot");
  const options = { cwd: tmpdir(), encoding: "utf8" };
  return {
    git,
    write,
    revision: git("rev-parse", "HEAD").trim(),
    context: (language) => execFileSync(process.execPath, [join(root, contextScript), language], options),
    run: (...args) => spawnSync(process.execPath, [join(root, taskScript), ...args], options)
  };
}

function assertFailure(result, code) {
  assert.ifError(result.error);
  assert.equal(result.status, code, result.stderr);
  assert.equal(result.stdout, "");
  assert.ok(result.stderr.trim());
}

test("Vera adds only the requested committed excerpts to the matching language context", (t) => {
  const checkout = fixture(t, {
    [correction]: "OMITTED BEFORE\nPrüfe die Gründe.\nHalte Dissens fest.\nOMITTED AFTER\n",
    [method]: "A second source.\nOMITTED SECOND\n"
  });
  checkout.write(correction, "STAGED PRIVATE DRAFT\n");
  checkout.git("add", correction);
  checkout.write(correction, "UNSTAGED PRIVATE DRAFT\n");

  for (const [language, heading] of [["de", "Projektbelege"], ["en", "Project sources"]]) {
    const result = checkout.run(language, `${correction}:2-3`, `${method}:1-1`);
    assert.ifError(result.error);
    assert.equal(result.status, 0, result.stderr);
    const context = checkout.context(language);
    assert.ok(result.stdout.startsWith(context));
    const evidence = result.stdout.slice(context.length);
    assert.ok(evidence.includes(`## ${heading}`));
    const rootUrl = `https://github.com/AlexanderR1991/Wirklich/blob/${checkout.revision}`;
    assert.ok(evidence.includes(`${rootUrl}/${correction}#L2-L3`));
    assert.ok(evidence.includes(`${rootUrl}/${method}#L1-L1`));
    assert.ok(evidence.includes("> Prüfe die Gründe.\n> Halte Dissens fest."));
    assert.ok(evidence.includes("> A second source."));
    assert.doesNotMatch(evidence, /OMITTED|PRIVATE DRAFT/);
  }
});

test("Vera rejects invalid, uncommitted or out-of-range sources without exporting partial context", (t) => {
  const checkout = fixture(t, { [correction]: "One\nTwo\nThree\nFour\nFive\nSix\n" });
  checkout.write("docs/fehlt.md", "UNTRACKED PRIVATE DRAFT\n");

  for (const invalid of ["docs/fehlt.md:1-1", `${correction}:1-7`]) {
    assertFailure(checkout.run("de", `${correction}:1-1`, invalid), 1);
  }
  for (const invalid of ["docs/../docs/vera.md:1-1", `${contextScript}:1-1`]) {
    assertFailure(checkout.run("de", `${correction}:1-1`, invalid), 2);
  }
  const sixExcerpts = [1, 2, 3, 4, 5, 6].map((line) => `${correction}:${line}-${line}`);
  assertFailure(checkout.run("en", ...sixExcerpts), 2);
});

test("Vera enforces the combined 12 KiB source budget in bytes", (t) => {
  const text = `${Array(40).fill("ä".repeat(80)).join("\n")}\n`;
  const checkout = fixture(t, { [correction]: text, [method]: text });
  const oneSource = checkout.run("de", `${correction}:1-40`);
  assert.equal(oneSource.status, 0, oneSource.stderr);
  assertFailure(checkout.run("de", `${correction}:1-40`, `${method}:1-40`), 1);
});
