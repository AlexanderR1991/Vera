import {execFileSync} from "node:child_process";
import {normalizeRepositoryTree} from "./repository-tree.mjs";

export function loadRepositorySnapshot(cwd = process.cwd()) {
  const git = (...args) => execFileSync("git", ["--no-replace-objects", ...args], {
    cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024
  });
  let commit;
  try {
    commit = git("rev-parse", "--verify", "--quiet", "HEAD^{commit}").trimEnd();
  } catch (error) {
    // An exported source archive or empty checkout can still load the live tree.
    if (error.code === "ENOENT" || error.status === 1 || error.status === 128) {
      return {sha: null, commit: null, entries: []};
    }
    throw error;
  }

  const sha = git("rev-parse", "--verify", commit + "^{tree}").trimEnd();
  const records = git("ls-tree", "-rtz", sha).split("\0");
  records.pop();
  const tree = records.map(record => {
    // Separate metadata from the NUL-delimited pathname without splitting filename whitespace.
    const separator = record.indexOf("\t");
    const [, type] = record.slice(0, separator).split(" ");
    return {path: record.slice(separator + 1), type};
  });
  return {...normalizeRepositoryTree({sha, tree, truncated: false}), commit};
}
