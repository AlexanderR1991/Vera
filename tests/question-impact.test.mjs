import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {traceRevisionImpact} from "../src/lib/philosophical-motor.mjs";
import {questionReviewImpact} from "../src/lib/questions.mjs";

const atlas = JSON.parse(readFileSync(new URL("../public/knowledge/questions.json", import.meta.url), "utf8"));

test("G-005 reaches two distinct questions and preserves the published register", () => {
 const before = structuredClone(atlas);
 assert.deepEqual(questionReviewImpact(atlas, "G-005"), [
  {id: "Q-001", path: ["G-005", "Q-001"]},
  {id: "Q-005", path: ["G-005", "Q-005"]}
 ]);
 assert.deepEqual(questionReviewImpact(atlas, "absent"), []);
 assert.deepEqual(questionReviewImpact(atlas, "Q-001"), []);
 assert.deepEqual(atlas, before);
});

test("only explicit dependencies propagate and equal-length witnesses survive input reordering", () => {
 const graph = {
  questions: ["A", "B", "C", "D", "E", "F", "G", "H"].map(id => ({id, claim_ids: id === "A" ? ["K"] : []})),
  relations: [
   {from: "C", to: "A", type: "depends_on"}, {from: "B", to: "A", type: "depends_on"},
   {from: "D", to: "C", type: "depends_on"}, {from: "D", to: "B", type: "depends_on"},
   {from: "E", to: "D", type: "related_to"}, {from: "F", to: "D", type: "possible_duplicate"},
   {from: "G", to: "D", type: "subquestion_of"}, {from: "H", to: "D", type: "alternative_framing"}
  ]
 };
 const expected = [
  {id: "A", path: ["K", "A"]}, {id: "B", path: ["K", "A", "B"]},
  {id: "C", path: ["K", "A", "C"]}, {id: "D", path: ["K", "A", "B", "D"]}
 ];
 assert.deepEqual(questionReviewImpact(graph, "K"), expected);
 graph.questions.reverse();
 graph.relations.reverse();
 assert.deepEqual(questionReviewImpact(graph, "K"), expected);
});

test("all 512 three-question graphs and seed sets agree with enumeration of simple paths", () => {
 const ids = ["A", "B", "C"];
 const possible = ids.flatMap(from => ids.filter(to => from !== to).map(to => ({from, to, type: "depends_on"})));
 for (let edgeMask = 0; edgeMask < 2 ** possible.length; edgeMask++) {
  const relations = possible.filter((_, i) => edgeMask & (1 << i));
  for (let seedMask = 0; seedMask < 2 ** ids.length; seedMask++) {
   const questions = ids.map((id, i) => ({id, claim_ids: seedMask & (1 << i) ? ["K"] : []}));
   // Independent oracle: enumerate every simple path backwards from its target.
   function pathsTo(id, suffix = []) {
    if (suffix.includes(id)) return [];
    const tail = [id, ...suffix];
    const direct = questions.find(q => q.id === id).claim_ids.includes("K") ? [["K", ...tail]] : [];
    return direct.concat(relations.filter(r => r.from === id).flatMap(r => pathsTo(r.to, tail)));
   }
   const expected = ids.flatMap(id => {
    const paths = pathsTo(id).sort((a, b) => a.length - b.length || a.join().localeCompare(b.join()));
    return paths.length ? [{id, path: paths[0]}] : [];
   });
   const actual = questionReviewImpact({questions, relations}, "K").sort((a, b) => a.id.localeCompare(b.id));
   assert.deepEqual(actual, expected, `edgeMask=${edgeMask} seedMask=${seedMask}`);
  }
 }
});

test("public atlas reachability agrees with M-03 after explicit edge conversion", () => {
 const claimIds = [...new Set(atlas.questions.flatMap(q => q.claim_ids))];
 const nodes = [...claimIds, ...atlas.questions.map(q => q.id)];
 const edges = [
  ...atlas.questions.flatMap(q => q.claim_ids.map(from => ({from, to: q.id, type: "depends_on"}))),
  ...atlas.relations.filter(r => r.type === "depends_on").map(r => ({from: r.to, to: r.from, type: r.type}))
 ];
 for (const id of claimIds) {
  const ids = questionReviewImpact(atlas, id).map(row => row.id).sort();
  assert.deepEqual(ids, traceRevisionImpact({nodes, edges}, id));
 }
});
