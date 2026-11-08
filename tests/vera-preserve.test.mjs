import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const script = fileURLToPath(new URL("../scripts/vera-preserve.mjs", import.meta.url));

function temporaryDirectory(t) {
  const directory = mkdtempSync(join(tmpdir(), "vera-preserve-test-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  return directory;
}

function git(cwd, ...args) {
  return execFileSync("git", args, { cwd, encoding: "utf8" });
}

function fixture(t) {
  const directory = temporaryDirectory(t);
  const tracked = join(directory, "tracked.txt");
  git(directory, "init", "-q");
  for (const text of ["first revision\n", "second revision\n"]) {
    writeFileSync(tracked, text);
    git(directory, "add", "tracked.txt");
    git(directory, "-c", "user.name=Vera Test", "-c", "user.email=vera@example.invalid",
      "-c", "commit.gpgsign=false", "commit", "-qm", "Create test snapshot");
  }
  return { directory, tracked, revision: git(directory, "rev-parse", "HEAD").trim() };
}

function run(cwd, command) {
  return spawnSync(process.execPath, [script, command], {
    cwd,
    encoding: "utf8",
    env: { ...process.env, GIT_ALLOW_PROTOCOL: "file" }
  });
}

function successfulOutput(result) {
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

function assertFailure(result) {
  assert.ifError(result.error);
  assert.notEqual(result.status, null, result.signal);
  assert.notEqual(result.status, 0);
  assert.equal(result.stdout, "");
  assert.ok(result.stderr.trim());
}

test("Vera inspects the current checkout and notices untracked files even when Git hides them", (t) => {
  const { directory, revision } = fixture(t);
  assert.deepEqual(successfulOutput(run(directory, "inspect")), { revision, shallow: false, dirty: false });

  git(directory, "config", "status.showUntrackedFiles", "no");
  writeFileSync(join(directory, "untracked.txt"), "private draft\n");
  assert.deepEqual(successfulOutput(run(directory, "inspect")), { revision, shallow: false, dirty: true });
});

test("Vera restores the committed revision offline and leaves the source checkout intact", (t) => {
  const { directory, tracked, revision } = fixture(t);
  const untracked = join(directory, "draft.txt");
  writeFileSync(tracked, "staged draft\n");
  git(directory, "add", "tracked.txt");
  writeFileSync(tracked, "unstaged draft\n");
  writeFileSync(untracked, "untracked draft\n");
  const originalRefs = git(directory, "show-ref", "--head");
  const originalStatus = git(directory, "status", "--porcelain=v1", "--untracked-files=all");
  const result = run(directory, "drill");

  assert.deepEqual(successfulOutput(result), {
    revision, shallow: false, dirty: true, restoredRevision: revision, scope: "HEAD"
  });
  assert.equal(git(directory, "show-ref", "--head"), originalRefs);
  assert.equal(git(directory, "status", "--porcelain=v1", "--untracked-files=all"), originalStatus);
  assert.equal(git(directory, "show", ":tracked.txt"), "staged draft\n");
  assert.equal(readFileSync(tracked, "utf8"), "unstaged draft\n");
  assert.equal(readFileSync(untracked, "utf8"), "untracked draft\n");
});

test("Vera inspects a shallow checkout and declines to certify its recovery", (t) => {
  const { directory, revision } = fixture(t);
  const shallow = temporaryDirectory(t);
  git(shallow, "clone", "-q", "--depth=1", pathToFileURL(directory).href, ".");

  assert.deepEqual(successfulOutput(run(shallow, "inspect")), { revision, shallow: true, dirty: false });
  assertFailure(run(shallow, "drill"));
});

test("Vera fails the recovery drill when a reachable ancestor is missing", (t) => {
  const { directory, tracked, revision } = fixture(t);
  const ancestor = git(directory, "rev-parse", "HEAD^").trim();
  const object = join(directory, ".git", "objects", ancestor.slice(0, 2), ancestor.slice(2));
  const originalRefs = git(directory, "show-ref", "--head");
  rmSync(object);

  assert.deepEqual(successfulOutput(run(directory, "inspect")), { revision, shallow: false, dirty: false });
  assertFailure(run(directory, "drill"));
  assert.equal(git(directory, "show-ref", "--head"), originalRefs);
  assert.equal(readFileSync(tracked, "utf8"), "second revision\n");
  assert.equal(existsSync(object), false);
});

test("Vera reports when the current directory has no Git repository", (t) => {
  assertFailure(run(temporaryDirectory(t), "inspect"));
});
