import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { execFileSync, spawnSync } from "node:child_process";
import { inspectEncounter, encounterKey } from "../src/lib/vera-encounter.mjs";

const fixture = () => JSON.parse(readFileSync(new URL("../docs/examples/vera-encounter.json", import.meta.url), "utf8"));
const agree = input => {
  input.agreement.responses.forEach(response => { response.stance = "yes"; });
  return input;
};

test("one encounter can retain exact restatement, disagreement and supporting evidence", () => {
  const report = inspectEncounter(fixture());
  assert.deepEqual(report.understanding, { fromBtoA: 1, fromAtoB: 1, agreement: 0, mutualFloor: 1 });
  assert.equal(report.agreement.status, "documented_dissent");
  assert.equal(report.evidence.assessment.status, "supported");
  assert.equal(report.mental_state_inferred, false);
  assert.equal(report.publication_allowed, false);
  assert.equal(report.public_score_allowed, false);
});

test("a hundred copies cannot outvote one counterrecord or become independent evidence", () => {
  const input = fixture();
  const first = input.evidence[0];
  input.evidence.push(...Array.from({ length: 100 }, (_, i) => ({ ...first, id: "copy-" + i, source_id: "copy-source-" + i })));
  let report = inspectEncounter(input);
  assert.equal(report.evidence.assessment.status, "supported");
  assert.equal(report.evidence.provenance.declared_dependency_groups, 1);
  assert.equal(report.evidence.provenance.independence_verified, false);
  input.evidence.push({ ...first, id: "counter", source_id: "visit", dependency_group_id: "visit", polarity: "challenges" });
  report = inspectEncounter(input);
  assert.equal(report.evidence.assessment.status, "conflict");
  assert.equal(report.evidence.provenance.declared_dependency_groups, 2);
  const reversed = structuredClone(input);
  reversed.evidence.reverse();
  assert.deepEqual(inspectEncounter(reversed), report);
});

test("agreement, reproduction and access cannot alter the evidence projection", () => {
  const input = fixture();
  const original = inspectEncounter(input).evidence;
  agree(input);
  input.bridge.aEstimatesB = [0, 0];
  input.access.objection = "no";
  const changed = inspectEncounter(input);
  assert.deepEqual(changed.evidence, original);
  assert.equal(changed.access.objection, "no");
  assert.equal(changed.agreement.status, "agreement_on_exact_version");
  assert.equal(changed.understanding.fromAtoB, 0);
});

test("unknown access and missing restatements remain unknown", () => {
  const input = fixture();
  input.bridge = null;
  input.access.source = "unknown";
  input.evidence = [];
  const report = inspectEncounter(input);
  assert.equal(report.understanding, null);
  assert.equal(report.access.source, "unknown");
  assert.equal(report.evidence.assessment.status, "open");
});

test("a revision, wording change or change of claim type requires reassigned evidence", () => {
  for (const [key, value] of [["version", "2"], ["wording", "Access remains unclear."], ["type", "normative"]]) {
    const input = fixture();
    input.claim[key] = value;
    let report = inspectEncounter(input);
    assert.equal(report.evidence.assessment.status, "open");
    assert.deepEqual(report.evidence.unmatched_ids, ["notice"]);
    input.evidence[0].claim_key = encounterKey(input.claim);
    report = inspectEncounter(input);
    assert.equal(report.evidence.assessment.status, "supported");
  }
});

test("old agreement cannot survive changed wording even with an unchanged version number", () => {
  const input = agree(fixture());
  assert.equal(inspectEncounter(input).agreement.status, "agreement_on_exact_version");
  input.proposal.wording = "Book the room for a year.";
  assert.equal(inspectEncounter(input).agreement.status, "proposed_or_open");
  input.agreement.responses[0].proposal_key = encounterKey(input.proposal);
  assert.equal(inspectEncounter(input).agreement.status, "proposed_or_open");
  input.agreement.responses[1].proposal_key = encounterKey(input.proposal);
  assert.equal(inspectEncounter(input).agreement.status, "agreement_on_exact_version");
});

test("missing replies, uncertain feasibility and failed rights remain distinct", () => {
  const input = agree(fixture());
  input.agreement.responses.pop();
  assert.equal(inspectEncounter(input).agreement.status, "proposed_or_open");
  input.agreement.feasibility = "unknown";
  assert.equal(inspectEncounter(input).agreement.status, "open");
  input.agreement.rights = "fail";
  assert.equal(inspectEncounter(input).agreement.status, "blocked");
});

test("revision queue follows only dependencies, terminates on cycles and preserves dissent", () => {
  const input = fixture();
  input.revision = {
    changed_id: input.claim.id,
    graph: {
      nodes: ["room-access", "visit", "invite", "analogy"],
      edges: [
        { from: "room-access", to: "visit", type: "depends_on" },
        { from: "visit", to: "invite", type: "depends_on" },
        { from: "invite", to: "room-access", type: "depends_on" },
        { from: "room-access", to: "analogy", type: "analogous_to" }
      ]
    }
  };
  const report = inspectEncounter(input);
  assert.deepEqual(report.review_queue, ["invite", "visit"]);
  assert.equal(report.agreement.status, "documented_dissent");
  assert.equal(report.evidence.assessment.status, "supported");
  assert.deepEqual(input.revision.graph.nodes, ["room-access", "visit", "invite", "analogy"]);
});

test("pause and stop short-circuit evaluation without reading optional content", () => {
  for (const participation of ["paused", "stopped"]) {
    const input = { kind: "synthetic", participation, get claim() { throw new Error("Must not inspect this"); } };
    const report = inspectEncounter(input);
    assert.equal(report.status, participation);
    for (const field of ["access", "understanding", "evidence", "agreement", "review_queue"]) assert.equal(report[field], null);
  }
});

test("identical records are idempotent while conflicting reuse of an ID is rejected", () => {
  const input = fixture();
  const original = inspectEncounter(input);
  input.evidence.push({ ...input.evidence[0] });
  assert.deepEqual(inspectEncounter(input), original);
  input.evidence[1].polarity = "challenges";
  assert.throws(() => inspectEncounter(input), /two different records/);
});

test("invalid input cannot become an apparently valid report", () => {
  const mutations = [
    x => { x.kind = "real"; },
    x => { x.participation = "yes"; },
    x => { x.question = ""; },
    x => { x.claim.type = "truth"; },
    x => { x.claim.version = ""; },
    x => { delete x.access.objection; },
    x => { x.access.entry = true; },
    x => { x.bridge.a = [5, 0]; },
    x => { x.evidence[0].polarity = "yes"; },
    x => { x.evidence[0].source_id = ""; },
    x => { delete x.evidence[0].dependency_group_id; },
    x => { x.agreement.responses[0].proposal_key = null; },
    x => { x.agreement.responses[0].party = "absent-person"; },
    x => { x.agreement.parties = []; },
    x => { x.revision = { changed_id: "different-claim" }; },
    x => { x.revision = { changed_id: x.claim.id, graph: { nodes: [x.claim.id], edges: [{ from: x.claim.id, to: "missing", type: "depends_on" }] } }; }
  ];
  for (const mutate of mutations) {
    const input = fixture();
    mutate(input);
    assert.throws(() => inspectEncounter(input));
  }
});

test("evaluation leaves the input unchanged and keys avoid delimiter collisions", () => {
  const input = fixture();
  const original = structuredClone(input);
  inspectEncounter(input);
  assert.deepEqual(input, original);
  assert.notEqual(encounterKey({ id: "a|b", version: "c", wording: "d" }),
    encounterKey({ id: "a", version: "b|c", wording: "d" }));
});

test("the demo runs outside the repository directory and both languages share results", () => {
  const script = new URL("../scripts/vera-begegnung.mjs", import.meta.url);
  const scriptPath = fileURLToPath(script);
  const read = lang => JSON.parse(execFileSync(process.execPath, [scriptPath, lang], { cwd: tmpdir(), encoding: "utf8" }));
  const de = read("de"), en = read("en");
  assert.equal(de.stages.length, 8);
  assert.deepEqual(de.stages.map(x => x.report), en.stages.map(x => x.report));
  assert.equal(de.stages.find(x => x.id === "revision").report.evidence.assessment.status, "open");
  assert.deepEqual(de.stages.find(x => x.id === "revision").report.review_queue, ["invitation", "visit-plan"]);
  assert.equal(de.stages.find(x => x.id === "changed-invitation").report.agreement.status, "proposed_or_open");
  assert.equal(spawnSync(process.execPath, [scriptPath, "xx"]).status, 2);
});
