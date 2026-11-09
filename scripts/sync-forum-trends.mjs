import {mkdir, rename, rm, writeFile} from "node:fs/promises";
import {dirname} from "node:path";
import {fileURLToPath, pathToFileURL} from "node:url";
import project from "../public/project.json" with {type:"json"};
import {getForumPlaces} from "../src/lib/forum-places.mjs";

const repositoryPath = "/repos" + new URL(project.repository).pathname;
const label = "pinnwand";
const activityWindow = 72 * 60 * 60 * 1000;
const snapshotPath = fileURLToPath(new URL("../src/generated/forum-trends.json", import.meta.url));

function forumScopes() {
  const tags = new Map();
  const registeredIssues = new Map();
  for (const place of getForumPlaces()) {
    const placeTag = `[FORUM-${place.id}]`;
    tags.set(placeTag, {placeId: place.id, sectionId: ""});
    for (const section of place.sections) {
      const scope = {placeId: place.id, sectionId: section.id};
      const tag = section.everydayId ? `[ALLTAG-${section.everydayId}]` : `[FORUM-${place.id}/${section.id}]`;
      tags.set(tag, scope);
      // Keep the subject's own place when the general claims register also links the same issue.
      if (section.thread && (place.id !== "aussagen" || !registeredIssues.has(section.thread))) {
        registeredIssues.set(section.thread, scope);
      }
    }
  }
  return {tags, registeredIssues};
}

function scopeOf(issue, {tags, registeredIssues}) {
  if (registeredIssues.has(issue.number)) return registeredIssues.get(issue.number);
  const prefix = issue.title?.match(/^(?:\[(?:FORUM|ALLTAG)-[^\]\s]+\]\s*)+/)?.[0] ?? "";
  const scopes = [...new Set(prefix.match(/\[[^\]]+\]/g))].map(tag => tags.get(tag));
  const first = scopes[0];
  if (!first || scopes.some(scope => scope?.placeId !== first.placeId)) return undefined;
  const sections = scopes.filter(scope => scope.sectionId);
  if (sections.length <= 1) return sections[0] ?? first;
}

export async function collectForumTrends({token, now = new Date(), fetcher = fetch,
  apiUrl = "https://api.github.com"} = {}) {
  if (!token) throw new Error("A read-only GitHub token is required to refresh forum trends.");
  const generatedAt = now.toISOString();
  const cutoff = now.getTime() - activityWindow;
  const snapshot = {version: 1, generatedAt, trends: []};

  async function get(endpoint, parameters = {}) {
    const url = new URL(repositoryPath + endpoint, apiUrl);
    url.search = new URLSearchParams(parameters).toString();
    const response = await fetcher(url, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2026-03-10"
      },
      redirect: "error",
      signal: AbortSignal.timeout(12_000)
    });
    if (!response.ok) throw new Error(`GitHub forum refresh failed (${response.status}) at ${endpoint || "repository"}.`);
    return {data: await response.json(), link: response.headers.get("link") ?? ""};
  }

  async function pages(endpoint, parameters, maxPages) {
    const items = [];
    for (let page = 1; page <= maxPages; page++) {
      const {data, link} = await get(endpoint, {...parameters, per_page: "100", page: String(page)});
      if (!Array.isArray(data)) throw new Error(`Unexpected GitHub forum response at ${endpoint}.`);
      items.push(...data);
      if (!/;\s*rel="next"/.test(link)) return items;
    }
    throw new Error(`GitHub forum refresh exceeded its page limit at ${endpoint}.`);
  }

  const {data: repository} = await get("");
  if (repository.private !== false || repository.visibility !== "public") return snapshot;
  const scopes = forumScopes();
  const issues = await pages("/issues", {state: "open", labels: label}, 5);
  const candidates = new Map();
  for (const issue of issues) {
    if (issue.state !== "open" || issue.locked !== false || issue.pull_request ||
        !Number.isSafeInteger(issue.number) || issue.number < 1 ||
        !issue.labels?.some(entry => entry.name.toLowerCase() === label)) continue;
    const scope = scopeOf(issue, scopes);
    if (scope) {
      const issueUrl = new URL(`${repositoryPath}/issues/${issue.number}`, apiUrl).href.toLowerCase();
      candidates.set(issueUrl, {...scope, issueNumber: issue.number, users: new Set(), lastActivity: cutoff});
    }
  }
  if (!candidates.size) return snapshot;

  const comments = await pages("/issues/comments", {since: new Date(cutoff).toISOString()}, 10);
  for (const comment of comments) {
    const candidate = candidates.get(comment.issue_url?.toLowerCase());
    const user = comment.user;
    const created = Date.parse(comment.created_at);
    if (!candidate || user?.type !== "User" || !Number.isSafeInteger(user.id) || user.id < 1 ||
        !user.login || /\[bot\]$/i.test(user.login) || comment.performed_via_github_app ||
        !(created > cutoff && created <= now.getTime())) continue;
    candidate.users.add(user.id);
    candidate.lastActivity = Math.max(candidate.lastActivity, created);
  }

  const ranked = [...candidates.values()].filter(candidate => candidate.users.size >= 2)
    .sort((a, b) => b.users.size - a.users.size || b.lastActivity - a.lastActivity || a.issueNumber - b.issueNumber);
  const seenPlaces = new Set();
  for (const {placeId, sectionId, issueNumber, users, lastActivity} of ranked) {
    if (seenPlaces.has(placeId)) continue;
    seenPlaces.add(placeId);
    snapshot.trends.push({placeId, sectionId, issueNumber, participants: users.size,
      lastActivityAt: new Date(lastActivity).toISOString()});
  }
  return snapshot;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const temporaryPath = `${snapshotPath}.${process.pid}.tmp`;
  try {
    const snapshot = await collectForumTrends({token: process.env.GH_TOKEN || process.env.GITHUB_TOKEN});
    await mkdir(dirname(snapshotPath), {recursive: true});
    await writeFile(temporaryPath, JSON.stringify(snapshot, null, 2) + "\n", "utf8");
    await rename(temporaryPath, snapshotPath);
    console.log(`Forum trends refreshed: ${snapshot.trends.length} active topic squares.`);
  } catch (error) {
    await rm(snapshotPath, {force: true});
    throw error;
  } finally {
    await rm(temporaryPath, {force: true});
  }
}
