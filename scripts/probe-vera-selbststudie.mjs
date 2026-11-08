// Run from the repository root: node scripts/probe-vera-selbststudie.mjs
import { assessSelfModel } from "./vera-self-model.mjs";

// External reference states (build, deployment, live revision). Deployment requires a build.
const referenceStates = ["000", "001", "100", "101", "110", "111"];
const claims = ["buildPassed", "deploymentSucceeded", "liveRevisionMatches"];
const scope = {
  revision: "1".repeat(40),
  runAttempt: "1/1",
  observedAt: "2026-11-08T00:00:00Z"
};

function assess(evidence) {
  return assessSelfModel({ ...scope, evidence }).assessments.deployedAndLive.status;
}

function tally(counts, status, expected) {
  if (status === "open" || status === "conflict") counts[status]++;
  else if (status === expected) counts.correct++;
  else if (status === "confirmed" || status === "refuted") counts.incorrect++;
  else throw new Error("Unexpected model status: " + status);
}

const counts = {};
for (const condition of ["complete", "omitOne", "invertOne"]) {
  counts[condition] = { correct: 0, incorrect: 0, open: 0, conflict: 0 };
}
let example;
for (const state of referenceStates) {
  // The comparison always uses the original state, including after an input error.
  const expected = state[1] === "1" && state[2] === "1" ? "confirmed" : "refuted";
  const evidence = claims.map((claim, i) => ({
    claim, value: state[i] === "1", source: "synthetic fixture"
  }));
  tally(counts.complete, assess(evidence), expected);

  for (let field = 0; field < claims.length; field++) {
    const omitted = evidence.filter((_, i) => i !== field);
    tally(counts.omitOne, assess(omitted), expected);

    const inverted = evidence.map((record, i) =>
      i === field ? { ...record, value: !record.value } : record);
    const actual = assess(inverted);
    tally(counts.invertOne, actual, expected);
    if (state === "110" && claims[field] === "liveRevisionMatches") {
      example = { reference: state, reported: inverted.map(r => Number(r.value)).join(""), expected, actual };
    }
  }
}
console.log(JSON.stringify({ referenceStates, claims, counts, example }, null, 2));
