import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {validateQuestionAtlas,connectionsForQuestion,triageQuestionCandidates} from "../src/lib/questions.mjs";
import {topics} from "../src/lib/tree.mjs";
const load = path => JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const atlas = load("public/knowledge/questions.json");
const claims = load("public/knowledge/claims.json").claims;
const clone = () => structuredClone(atlas);
test("published example questions are traceable, typed and bilingual", () => {
 assert.deepEqual(validateQuestionAtlas(atlas,claims,topics),[]);
 assert.ok(atlas.questions.every(q => q.origin !== "ai_draft" && q.review_status === "unreviewed"));
});
test("question relationships include rationale and both endpoints", () => {
 const links = connectionsForQuestion(atlas,"Q-005");
 assert.equal(links.length,2);
 assert.ok(links.some(l => l.question.id === "Q-001" && l.type === "depends_on"));
 assert.ok(connectionsForQuestion(atlas,"Q-006").some(l => l.question.id === "Q-004" && l.direction === "incoming"));
});
test("no AI-generated entry may be silently committed as a curated question", () => {
 const draft=clone();draft.questions[0].origin="ai_draft";
 assert.match(validateQuestionAtlas(draft,claims,topics).join(" " ),/AI drafts cannot enter/);
});
test("broken claim references are caught before publication", () => {
 const draft=clone();draft.questions[0].claim_ids.push("G-999");
 assert.match(validateQuestionAtlas(draft,claims,topics).join(" "),/claim links/);
});
test("cycle and duplicate edge detection protect the hierarchy", () => {
 const draft=clone();draft.relations.push({from:"Q-006",to:"Q-004",type:"subquestion_of",reason:{de:"Kreis",en:"Cycle"}});
 assert.match(validateQuestionAtlas(draft,claims,topics).join(" "),/Cycle/);
 draft.relations.push(structuredClone(draft.relations[0]));
 assert.match(validateQuestionAtlas(draft,claims,topics).join(" "),/repeated relation/);
});
test("candidate triage suggests exact duplicates but never publishes or merges", () => {
 const before=JSON.stringify(atlas);
 const list=[{id:"C-001",origin:"ai_draft",question:{de:atlas.questions[0].question.de,en:atlas.questions[0].question.en}},
             {id:"C-002",origin:"ai_draft",question:{de:"Ist eine andere Frage denkbar?",en:"Could there be another question?"}}];
 const result=triageQuestionCandidates(list,atlas);
 assert.equal(result[0].review,"possible_duplicate");
 assert.equal(result[0].exact_match_id,"Q-001");
 assert.equal(result[1].review,"needs_human_triage");
 assert.equal(JSON.stringify(atlas),before);
});
test("limits and missing attribution stop unbounded or anonymous candidate queues", () => {
 const one={id:"C-1",origin:"ai_draft",question:{de:"Welche Belege sprechen dagegen?",en:"Which evidence contradicts this?"}};
 assert.throws(() => triageQuestionCandidates(Array(51).fill(one),atlas),/50/);
 assert.throws(() => triageQuestionCandidates([{...one,origin:"human"}],atlas),/Invalid candidate/);
 assert.throws(() => triageQuestionCandidates([one,one],atlas),/Invalid candidate/);
});


test("malformed relation containers are reported rather than causing an exception", () => {
 const draft=clone();draft.relations={};
 assert.match(validateQuestionAtlas(draft,claims,topics).join(" "),/Relations must be an array/);
});
test("oversized alternate-language AI text is refused", () => {
 const candidate={id:"C-overlong",origin:"ai_draft",question:{de:"Eine Frage?",en:"x".repeat(601)}};
 assert.throws(()=>triageQuestionCandidates([candidate],atlas),/Invalid candidate/);
});
test("automated swarm workflows cannot request public discussion write access", () => {
 for(const file of [".github/workflows/wahrheitsschwarm.yml",".github/workflows/angriffsschwarm.yml"]){
  const workflow=readFileSync(new URL("../"+file,import.meta.url),"utf8");
  assert.match(workflow,/permissions:\s*\n\s+contents: write/);
  assert.doesNotMatch(workflow,/\b(?:issues|discussions|pull-requests):\s*write/);
  assert.doesNotMatch(workflow,/\bgh\s+(?:issue|pr|api)\b/);
 }
});
