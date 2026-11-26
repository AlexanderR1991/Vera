import { execFileSync } from "node:child_process";

const revisionPattern = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/;

/** Read only committed project prose. A Git revision does not verify publication or truth. */
export function createGitProjectSource({ root, language = "de", revision } = {}) {
  if (typeof root !== "string" || !root || !["de", "en"].includes(language)) throw new Error("Expected a checkout root and de/en language.");
  const git = (...args) => execFileSync("git", ["--no-replace-objects", "-C", root, ...args], {
    encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: 5000
  });
  const pinned = revision ?? git("rev-parse", "--verify", "HEAD^{commit}").trim();
  if (typeof pinned !== "string" || !revisionPattern.test(pinned)) throw new Error("Expected a full Git commit revision.");
  if (git("cat-file", "-t", pinned).trim() !== "commit" ||
      git("rev-parse", "--verify", `${pinned}^{commit}`).trim() !== pinned) throw new Error("Expected a full Git commit revision.");
  const { repository } = JSON.parse(git("show", `${pinned}:public/project.json`));
  if (typeof repository !== "string" || !/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository) ||
      repository.split("/").some(segment => segment === "." || segment === "..")) {
    throw new Error("Expected the public project repository URL.");
  }
  return {
    revision: pinned,
    repository,
    search(term) {
      if (typeof term !== "string" || !term.trim() || term.length > 80 || /[\u0000-\u001f\u007f]/.test(term)) {
        throw new Error("Expected one short literal project search term.");
      }
      const paths = language === "en" ? [":(glob)docs/en/**/*.md"]
        : [":(glob)docs/**/*.md", ":(exclude,glob)docs/en/**", ":(exclude,glob)docs/archiv/**"];
      let output;
      try {
        output = git("grep", "--no-color", "--no-column", "-F", "-i", "-I", "-n", "-z", "-m", "1", "-e", term, pinned, "--", ...paths);
      } catch (error) {
        if (error.status === 1 && !error.stderr) return [];
        throw error;
      }
      const passages = [];
      // -z separates source and line with NUL; only the excerpt ends at LF.
      for (const [, source, line, excerpt] of output.matchAll(/([^\0]+)\0(\d+)\0([^\n]*)(?:\n|$)/g)) {
        const path = source.slice(pinned.length + 1);
        const encodedPath = path.split("/").map(encodeURIComponent).join("/");
        passages.push({ url: `${repository}/blob/${pinned}/${encodedPath}#L${line}`, excerpt: excerpt.slice(0, 400) });
        if (passages.length === 3) break;
      }
      return passages;
    }
  };
}
