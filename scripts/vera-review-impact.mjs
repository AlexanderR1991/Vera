import {execFileSync} from "node:child_process";
import {validateRegister} from "./validate-claims.mjs";
import {claimReviewFingerprint} from "../src/lib/claims.mjs";
import {questionReviewImpact, validateQuestionAtlas} from "../src/lib/questions.mjs";

// Inspect immutable objects in the working directory's repository, including
// when called from a subdirectory. A missing local object must fail offline.
function git(...args) {
  return execFileSync("git", ["--no-replace-objects", ...args], {
    encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024,
    env: {...process.env, GIT_NO_LAZY_FETCH: "1", GIT_ALLOW_PROTOCOL: ""}
  });
}

function snapshot(ref) {
  const revision = git("rev-parse", "--verify", "--end-of-options", ref + "^{commit}").trim();
  const read = name => JSON.parse(git("cat-file", "blob", revision + ":public/knowledge/" + name + ".json"));
  const register = read("claims");
  const atlas = read("questions");
  const errors = validateRegister(register);
  if (!errors.length) errors.push(...validateQuestionAtlas(atlas, register.claims));
  if (errors.length) throw new Error(revision + ": " + errors.join(", "));
  return {revision, atlas, claims: new Map(register.claims.map(c => [c.id, c]))};
}

const exceptional = new Set(["disputed", "withdrawn"]);
function changesTo(before, after) {
  if (!before) return ["added"];
  if (!after) return ["removed"];
  const changes = [];
  if (claimReviewFingerprint(before) !== claimReviewFingerprint(after)) changes.push("content");
  if (before.review_status !== after.review_status &&
      (exceptional.has(before.review_status) || exceptional.has(after.review_status))) changes.push("status");
  return changes;
}

function compare(before, after) {
  const changed_claims = [];
  const byQuestion = new Map();
  const ids = new Set([...before.claims.keys(), ...after.claims.keys()]);
  for (const id of [...ids].sort()) {
    const changes = changesTo(before.claims.get(id), after.claims.get(id));
    if (!changes.length) continue;
    changed_claims.push({id, changes});
    const paths = atlas => new Map(questionReviewImpact(atlas, id).map(q => [q.id, q.path]));
    const oldPaths = paths(before.atlas);
    const newPaths = paths(after.atlas);
    for (const question of new Set([...oldPaths.keys(), ...newPaths.keys()])) {
      if (!byQuestion.has(question)) byQuestion.set(question, []);
      byQuestion.get(question).push({
        claim_id: id, before: oldPaths.get(question) ?? null, after: newPaths.get(question) ?? null
      });
    }
  }
  return {
    status: "advisory", revisions: {before: before.revision, after: after.revision},
    changed_claims, questions: [...byQuestion.keys()].sort().map(id => ({id, reasons: byQuestion.get(id)}))
  };
}

const refs = process.argv.slice(2);
if (refs.length !== 2 || refs.some(ref => !ref)) {
  console.error("Usage: node scripts/vera-review-impact.mjs <before-ref> <after-ref>");
  process.exitCode = 2;
} else {
  try {
    const before = snapshot(refs[0]);
    const after = snapshot(refs[1]);
    console.log(JSON.stringify(compare(before, after), null, 2));
  } catch (error) {
    console.error("Review impact unavailable. " + error.message);
    process.exitCode = 1;
  }
}
