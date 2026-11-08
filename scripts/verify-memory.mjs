import { execFileSync } from "node:child_process";
import { memoryPath, validateMemory } from "./vera-memory.mjs";

function git(...args) {
  return execFileSync("git", ["--no-replace-objects", ...args], {
    encoding: "utf8", stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, GIT_NO_LAZY_FETCH: "1", GIT_ALLOW_PROTOCOL: "file" }
  }).trimEnd();
}

try {
  const head = git("rev-parse", "--verify", "HEAD^{commit}");
  const ledger = JSON.parse(git("show", `${head}:${memoryPath}`));
  validateMemory(ledger);
  let checked = 0;
  for (const { id, sources } of ledger.entries) {
    for (const { path, revision = head } of sources) {
      try {
        if (revision !== head) git("merge-base", "--is-ancestor", revision, head);
        const record = git("ls-tree", "--full-tree", revision, "--", path);
        if (!/^100(?:644|755) blob /.test(record)) throw new Error("Expected a regular file");
        git("cat-file", "-e", `${revision}:${path}`);
      } catch {
        throw new Error(`${id}: cannot verify ${revision}:${path} in the history of ${head}. Use a full checkout and check the reference.`);
      }
      checked++;
    }
  }
  console.log(`Verified ${checked} source references in ${ledger.entries.length} memory records at ${head}.`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
