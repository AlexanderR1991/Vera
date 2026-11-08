import assert from "node:assert/strict";
import { test } from "node:test";
import {
  addEntityDraft, createEntityRecord, entityDecisions, inspectEntityRecord, recordEntityDecision
} from "../src/lib/entity-core.mjs";

// Independent reference: look backwards through the inputs for each individual objection.
// The reference never reads the ledger's events or its reported open IDs.
function expectedOpenIds(history) {
  return history.filter(step => step.kind === "objection").map(step => step.id).filter(id => {
    const latest = history.findLast(step => step.objection_ids?.includes(id));
    return !latest || latest.outcome === "leave_open";
  });
}

test("every synthetic history of up to four steps preserves the status of each objection", t => {
  const at = "2026-11-08T00:00:00Z";
  const counts = [0, 0, 0, 0, 0];
  const start = createEntityRecord({id: "CASE-1", question: "Who is still waiting?", statement: "First wording."});

  function visit(record, history) {
    const depth = history.length;
    counts[depth]++;
    assert.deepEqual(inspectEntityRecord(record).open_objection_ids, expectedOpenIds(history),
      JSON.stringify(history));
    if (depth === counts.length - 1) return;

    const event = {id: `E-${depth + 1}`, at, based_on_version: record.current_version};
    for (const kind of ["objection", "perspective"]) {
      const step = {...event, kind, origin: "human_submission", text: "Synthetic input."};
      visit(addEntityDraft(record, step), [...history, step]);
    }

    // Include the empty set, individual IDs and joint decisions on multiple objections.
    let subsets = [[]];
    for (const step of history.filter(step => step.kind === "objection")) {
      subsets = subsets.concat(subsets.map(ids => [...ids, step.id]));
    }
    for (const objection_ids of subsets) {
      for (const outcome of entityDecisions) {
        const step = {...event, outcome, objection_ids, reviewer: "Test fixture", rationale: "Synthetic decision."};
        if (outcome === "narrow" || outcome === "revise") step.new_statement = `Wording after ${event.id}.`;
        // Only this synthetic fixture supplies authorization. No live reviewer participates.
        visit(recordEntityDecision(record, step, () => true), [...history, step]);
      }
    }
  }

  visit(start, []);
  // With k prior objections there are two drafts plus five decisions for each of 2^k subsets.
  assert.deepEqual(counts, [1, 7, 54, 478, 5066]);
  t.diagnostic(`Histories checked by length (0–4): ${counts.join(", ")}.`);
});
