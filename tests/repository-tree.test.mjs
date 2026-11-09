import {strict as assert} from "node:assert";
import {execFileSync} from "node:child_process";
import {mkdtempSync, mkdirSync, rmSync, writeFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {test} from "node:test";
import {normalizeRepositoryTree, publicRepositoryTree, repositoryEntryUrl} from "../src/lib/repository-tree.mjs";
import {loadRepositorySnapshot} from "../src/lib/repository-tree-snapshot.mjs";

const sha = "a".repeat(40);
const repo = "https://github.com/AlexanderR1991/Vera";
const directory = {path: "docs", type: "tree"};
const file = {path: "docs/Über & #1?.md", type: "blob"};
const gitlink = {path: "submodule", type: "commit"};
const payload = {sha, tree: [directory, file, gitlink], truncated: false};

test("normalizes the complete GitHub tree without retaining unrelated metadata", () => {
  assert.deepEqual(normalizeRepositoryTree({...payload, tree: [
    {...directory, mode: "040000"}, {...file, size: 42}, gitlink
  ]}), {sha, entries: [directory, file, gitlink]});
});

test("rejects partial, malformed, duplicate, and disconnected repository trees", () => {
  for (const candidate of [
    null,
    {...payload, truncated: true},
    {...payload, sha: "not-a-git-sha"},
    {...payload, tree: null},
    {...payload, tree: [{path: "/docs", type: "tree"}]},
    {...payload, tree: [{path: "../docs", type: "tree"}]},
    {...payload, tree: [{path: "docs", type: "directory"}]},
    {...payload, tree: [directory, directory]},
    {...payload, tree: [file]},
    {...payload, tree: [{...directory, type: "blob"}, file]}
  ]) {
    assert.throws(() => normalizeRepositoryTree(candidate), /repository tree/i);
  }
});

test("opens directories and files on GitHub and encodes each pathname segment", () => {
  assert.equal(repositoryEntryUrl(repo, "main", {path: "", type: "tree"}), repo + "/tree/main");
  assert.equal(repositoryEntryUrl(repo, "main", directory), repo + "/tree/main/docs");
  assert.equal(repositoryEntryUrl(repo, "main", gitlink), repo + "/tree/main/submodule");
  assert.equal(repositoryEntryUrl(repo, sha, file), repo + "/blob/" + sha + "/docs/%C3%9Cber%20%26%20%231%3F.md");
});

test("keeps repository-only archive paths out of the public explorer", () => {
  const archive = {path: "docs/archiv", type: "tree"};
  const archivedBook = {path: "docs/archiv/die-richtung-2.0-lesefassung.txt", type: "blob"};
  const tree = {sha, entries: [directory, file, archive, archivedBook]};
  assert.deepEqual(publicRepositoryTree(tree), {sha, entries: [directory, file, archive]});
});

test("build snapshot tracks the committed tree and preserves filename whitespace", t => {
  const cwd = mkdtempSync(join(tmpdir(), "vera-repository-tree-"));
  t.after(() => rmSync(cwd, {recursive: true, force: true}));
  const git = (...args) => execFileSync("git", args, {cwd, encoding: "utf8", stdio: "pipe"}).trimEnd();
  git("init", "--quiet");
  assert.deepEqual(loadRepositorySnapshot(cwd), {sha: null, commit: null, entries: []});
  mkdirSync(join(cwd, "docs"));
  const path = "docs/Über & Entwurf.md";
  writeFileSync(join(cwd, path), "tracked");
  git("add", "docs");
  git("-c", "user.name=Vera", "-c", "user.email=vera@example.invalid", "-c", "commit.gpgsign=false", "commit", "-qm", "Tree test");
  writeFileSync(join(cwd, "local-only.md"), "untracked");
  assert.deepEqual(loadRepositorySnapshot(cwd), {
    sha: git("rev-parse", "HEAD^{tree}"),
    commit: git("rev-parse", "HEAD"),
    entries: [directory, {path, type: "blob"}]
  });
});
