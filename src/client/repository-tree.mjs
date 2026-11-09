import {normalizeRepositoryTree, publicRepositoryTree, repositoryEntryUrl} from "../lib/repository-tree.mjs";
import {createRepositoryGraph} from "./repository-tree-graph.mjs";

const root = {path: "", type: "tree"};
const leafName = path => path.slice(path.lastIndexOf("/") + 1);
const parentPath = path => path.slice(0, Math.max(0, path.lastIndexOf("/")));

export function mountRepositoryTree(page) {
  const repository = page.dataset.repository;
  const copy = JSON.parse(page.dataset.copy);
  const lang = document.documentElement.lang;
  let snapshot = JSON.parse(page.dataset.snapshot);
  let ref = snapshot.commit ?? "main";
  let selected = "";
  let directories;
  let children;
  let refreshing = false;
  let hasLiveTree = false;

  const status = page.querySelector("[data-tree-status]");
  const refresh = page.querySelector("[data-tree-refresh]");
  const map = page.querySelector("[data-tree-map]");
  const heading = page.querySelector("[data-tree-heading]");
  const github = page.querySelector("[data-tree-github]");
  const trail = page.querySelector("[data-tree-trail]");
  const tiles = page.querySelector("[data-tree-tiles]");
  const graph = createRepositoryGraph(page.querySelector("[data-tree-graph]"), {
    onSelect: path => showFolder(path),
    rootLabel: "Vera",
    folderLabel: copy.folder
  });

  function indexTree() {
    directories = new Set([""]);
    children = new Map();
    for (const entry of snapshot.entries) {
      if (entry.type === "tree") directories.add(entry.path);
      const parent = parentPath(entry.path);
      if (!children.has(parent)) children.set(parent, []);
      children.get(parent).push(entry);
    }
    for (const entries of children.values()) {
      entries.sort((a, b) => Number(b.type === "tree") - Number(a.type === "tree")
        || leafName(a.path).localeCompare(leafName(b.path), lang));
    }
  }

  function entryLink(entry, label) {
    const link = document.createElement("a");
    link.href = repositoryEntryUrl(repository, ref, entry);
    link.textContent = label;
    if (entry.type === "tree") link.dataset.folder = entry.path;
    return link;
  }

  function renderTrail() {
    const parts = selected ? selected.split("/") : [];
    const crumbs = ["", ...parts.map((_, index) => parts.slice(0, index + 1).join("/"))];
    trail.replaceChildren(...crumbs.map(path => {
      const label = path ? leafName(path) : "Vera";
      if (path !== selected) return entryLink({path, type: "tree"}, label + " /");
      const current = document.createElement("span");
      current.textContent = label;
      current.setAttribute("aria-current", "location");
      return current;
    }));
    trail.hidden = crumbs.length === 1;
  }

  function renderTiles() {
    const items = (children.get(selected) ?? []).map(entry => {
      const item = document.createElement("li");
      const link = entryLink(entry, "");
      link.className = "repo-tile";
      link.dataset.entryType = entry.type;
      const kind = document.createElement("span");
      kind.className = "repo-tile-kind";
      kind.textContent = entry.type === "tree" ? copy.folder : entry.type === "commit" ? copy.submodule : copy.file;
      const name = document.createElement("strong");
      name.textContent = leafName(entry.path);
      link.append(kind, name);
      item.append(link);
      return item;
    });
    if (!items.length) {
      const item = document.createElement("li");
      item.textContent = snapshot.sha ? copy.empty : copy.waiting;
      items.push(item);
    }
    tiles.replaceChildren(...items);
  }

  function showFolder(path, focus = false) {
    while (!directories.has(path)) path = parentPath(path);
    selected = path;
    heading.textContent = copy.contents + " " + (path || "Vera");
    github.href = repositoryEntryUrl(repository, ref, {...root, path});
    renderTrail();
    renderTiles();
    if (snapshot.sha) {
      map.hidden = false;
      graph.render(snapshot.entries, selected);
    }
    if (focus) heading.focus();
  }

  function setStatus(state, text) {
    status.dataset.state = state;
    status.textContent = text;
  }

  async function fetchTree() {
    if (refreshing) return;
    refreshing = true;
    refresh.disabled = true;
    setStatus("checking", copy.checking);
    const request = new AbortController();
    const timeout = setTimeout(() => request.abort(), 12000);
    try {
      const name = new URL(repository).pathname.replace(/^\/+|\/+$/g, "");
      const response = await fetch("https://api.github.com/repos/" + name + "/git/trees/main?recursive=1", {
        credentials: "omit",
        referrerPolicy: "no-referrer",
        cache: "no-cache",
        signal: request.signal
      });
      if (!response.ok) throw new Error("GitHub tree request failed");
      const next = publicRepositoryTree(normalizeRepositoryTree(await response.json()));
      if (snapshot.sha !== next.sha) {
        snapshot = next;
        ref = "main";
        indexTree();
        const active = document.activeElement;
        showFolder(selected, tiles.contains(active) || trail.contains(active));
      }
      hasLiveTree = true;
      setStatus("live", copy.live + " · main");
    } catch {
      const fallback = hasLiveTree ? copy.previous : snapshot.commit ? copy.build + " · " + snapshot.commit.slice(0, 7) : "";
      setStatus("fallback", [copy.unavailable, fallback].filter(Boolean).join(" "));
    } finally {
      clearTimeout(timeout);
      refreshing = false;
      refresh.disabled = false;
    }
  }

  page.addEventListener("click", event => {
    const folder = event.target.closest("a[data-folder]");
    if (!folder || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    showFolder(folder.dataset.folder, true);
  });
  refresh.addEventListener("click", fetchTree);
  const zoom = {in: graph.zoomIn, out: graph.zoomOut, reset: graph.reset};
  for (const button of page.querySelectorAll("[data-tree-zoom]")) {
    button.addEventListener("click", () => zoom[button.dataset.treeZoom]());
  }
  indexTree();
  showFolder("");
  refresh.hidden = false;
  fetchTree();
}
