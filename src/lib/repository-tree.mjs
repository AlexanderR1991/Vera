const objectId = /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/i;
const entryTypes = new Set(["tree", "blob", "commit"]);

export function normalizeRepositoryTree(payload) {
  if (payload?.truncated === true) throw new Error("GitHub returned a partial repository tree.");
  if (typeof payload?.sha !== "string" || !objectId.test(payload.sha) ||
      payload.truncated !== false || !Array.isArray(payload.tree)) {
    throw new Error("Invalid repository tree.");
  }

  const typesByPath = new Map();
  const entries = payload.tree.map(entry => {
    const {path, type} = entry ?? {};
    if (typeof path !== "string" || path.includes("\0") ||
        path.split("/").some(segment => !segment || segment === "." || segment === "..") ||
        !entryTypes.has(type) || typesByPath.has(path)) {
      throw new Error("Invalid repository tree entry.");
    }
    typesByPath.set(path, type);
    return {path, type};
  });

  for (const {path} of entries) {
    const separator = path.lastIndexOf("/");
    if (separator !== -1 && typesByPath.get(path.slice(0, separator)) !== "tree") {
      throw new Error("Repository tree entry has no parent directory.");
    }
  }
  return {sha: payload.sha, entries};
}

export function repositoryEntryUrl(repository, ref, {path, type}) {
  const view = type === "blob" ? "blob" : "tree";
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  return `${repository}/${view}/${encodeURIComponent(ref)}${path ? "/" + encodedPath : ""}`;
}

// Keep the same archive and domain boundaries as the Pages validator.
export function publicRepositoryTree(tree) {
  const entries = tree.entries.filter(({path}) => !/die[-_ ]richtung(?![a-z])|wirklich[.]org/i.test(path));
  return {...tree, entries};
}
