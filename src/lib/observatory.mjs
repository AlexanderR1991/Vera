import {execFileSync} from "node:child_process";
import {reviewMatchesClaim} from "./claims.mjs";

const sources = [
  "public/knowledge/claims.json",
  "public/research/stream.json",
  "public/research/angriffe.json"
];

function registerCounts(data) {
  if (data?.schema_version !== 1 || !Array.isArray(data.claims)) {
    return {claims: null, reviewed: null};
  }
  const rows = data.claims;
  const reviewFieldsPresent = rows.every(row => row && Number.isInteger(row.version) &&
    typeof row.review_status === "string" && Object.hasOwn(row, "human_review"));
  return {
    claims: rows.length,
    reviewed: reviewFieldsPresent
      ? rows.filter(row => row.review_status === "reviewed" && reviewMatchesClaim(row)).length
      : null
  };
}

function streamCount(data) {
  return data?.schema === 1 && Array.isArray(data.items) ? data.items.length : null;
}

export function getObservatory(cwd = process.cwd()) {
  const git = (args, input) => execFileSync("git", args, {
    cwd, input, encoding: "utf8", maxBuffer: 64 * 1024 * 1024
  }).trimEnd();
  if (git(["rev-parse", "--is-shallow-repository"]) === "true") {
    throw new Error("Project observatory requires full Git history. Run git fetch --unshallow or use actions/checkout with fetch-depth: 0.");
  }

  // %ct is the committer timestamp. Choose the final mainline revision in Git
  // order for each UTC date; merged side-branch commits do not add extra days.
  const log = git(["log", "--first-parent", "--reverse", "--no-show-signature", "--format=%H %ct", "HEAD"]);
  const byDate = new Map();
  let head;
  for (const line of log.split("\n")) {
    const [revision, seconds] = line.split(" ");
    const date = new Date(Number(seconds) * 1000).toISOString().slice(0, 10);
    const revisions = (byDate.get(date)?.revisions ?? 0) + 1;
    byDate.set(date, {date, revision, revisions});
    head = revision;
  }
  const days = [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
  const objects = days.flatMap(day => sources.map(path => day.revision + ":" + path));

  // Resolve all day/file pairs together. Parse each distinct blob only once,
  // and retain just its counts even when a series spans many unchanged days.
  const ids = git(["cat-file", "--batch-check=%(objectname) %(objecttype)"], objects.join("\n") + "\n").split("\n");
  const measured = new Map();
  function measure(index, count) {
    const [id, type] = ids[index].split(" ");
    if (type === "missing") return count(null);
    if (type !== "blob") throw new Error("Expected a JSON file at " + objects[index]);
    const key = sources[index % sources.length] + ":" + id;
    if (!measured.has(key)) {
      const content = git(["cat-file", "blob", id]);
      try {
        measured.set(key, count(JSON.parse(content)));
      } catch (error) {
        throw new Error("Cannot measure " + objects[index], {cause: error});
      }
    }
    return measured.get(key);
  }
  for (const [i, day] of days.entries()) {
    const offset = i * sources.length;
    Object.assign(day, measure(offset, registerCounts), {
      discovery: measure(offset + 1, streamCount),
      criticism: measure(offset + 2, streamCount)
    });
  }
  return {schema_version: 1, head, days};
}
