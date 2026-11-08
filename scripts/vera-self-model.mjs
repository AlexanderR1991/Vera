import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const observedClaims = ["buildPassed", "deploymentSucceeded", "liveRevisionMatches"];
const claims = [...observedClaims, "deployedAndLive"];
const truthValues = [false, true];

const worlds = truthValues.flatMap(buildPassed =>
  truthValues.filter(deploymentSucceeded => !deploymentSucceeded || buildPassed)
    .flatMap(deploymentSucceeded => truthValues.map(liveRevisionMatches => ({
      buildPassed,
      deploymentSucceeded,
      liveRevisionMatches,
      deployedAndLive: deploymentSucceeded && liveRevisionMatches
    })))
);

function compatibleWorlds(evidence) {
  return worlds.filter(world => evidence.every(({ claim, value }) => world[claim] === value));
}

function explainConflict(evidence) {
  // An inclusion-minimal witness needs at most one record per distinct literal.
  const literals = new Map();
  for (const record of evidence) {
    const key = `${record.claim}:${record.value}`;
    if (!literals.has(key)) literals.set(key, record);
  }

  let core = [...literals.values()];
  for (const record of core) {
    const withoutRecord = core.filter(other => other !== record);
    if (!compatibleWorlds(withoutRecord).length) core = withoutRecord;
  }
  return core;
}

function validTimestamp(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value)) return false;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.toISOString().replace(".000Z", "Z") === value;
}

export function assessSelfModel(input) {
  const { revision, runAttempt, observedAt, evidence } = input ?? {};
  if (typeof revision !== "string" || !/^[0-9a-f]{40}$/.test(revision)) {
    throw new Error("revision must be a full lowercase GitHub commit SHA");
  }
  if (typeof runAttempt !== "string" || !/^[1-9]\d*\/[1-9]\d*$/.test(runAttempt)) {
    throw new Error("runAttempt must have the form RUN_ID/ATTEMPT");
  }
  if (!validTimestamp(observedAt)) {
    throw new Error("observedAt must have the form YYYY-MM-DDTHH:mm:ssZ");
  }
  if (!Array.isArray(evidence)) throw new Error("evidence must be an array");

  const records = Array.from(evidence, (record, index) => {
    const { claim, value, source } = record ?? {};
    if (!observedClaims.includes(claim) || typeof value !== "boolean" ||
        typeof source !== "string" || !source.trim()) {
      throw new Error(`evidence[${index}] must contain an observable claim, a boolean and a source`);
    }
    return { claim, value, source };
  });

  const candidates = compatibleWorlds(records);
  const assessments = Object.fromEntries(claims.map(claim => {
    if (!candidates.length) return [claim, { status: "conflict" }];

    const supports = candidates.find(world => world[claim]);
    const refutes = candidates.find(world => !world[claim]);
    const status = supports && refutes ? "open" : supports ? "confirmed" : "refuted";
    const witnesses = status === "open" ? { supports: { ...supports }, refutes: { ...refutes } } : {};
    return [claim, { status, ...witnesses }];
  }));

  return {
    model: "vera-pages-self-model.v1",
    revision,
    runAttempt,
    observedAt,
    evidence: records,
    compatibleWorldCount: candidates.length,
    assessments,
    conflict: candidates.length ? [] : explainConflict(records)
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const usage = "Usage: node scripts/vera-self-model.mjs < evidence.json";
  if (args.length === 1 && args[0] === "--help") {
    console.log(usage);
  } else if (args.length) {
    console.error(usage);
    process.exitCode = 2;
  } else {
    try {
      const result = assessSelfModel(JSON.parse(readFileSync(0, "utf8")));
      console.log(JSON.stringify(result, null, 2));
      if (!result.compatibleWorldCount) process.exitCode = 1;
    } catch (error) {
      console.error(`Vera self-model: ${error.message}`);
      process.exitCode = 2;
    }
  }
}
