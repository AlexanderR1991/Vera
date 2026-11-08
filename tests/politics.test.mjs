import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const read = async path => JSON.parse(await readFile(new URL(path,import.meta.url),"utf8"));
test("political cases are bilingual, sourced and explicitly bounded",async()=>{
 const policy=await read("../src/lib/policy-copy.json");
 for(const lang of ["de","en"]){
  const part=policy[lang];
  assert.equal(part.systemCases.length,5);
  assert.equal(part.hypotheses.find(h=>h.code==="P-F")?.code,"P-F");
  for(const item of part.systemCases){
   assert.ok(item.title&&item.text&&item.counter&&item.limit&&item.source);
   assert.equal(new URL(item.url).protocol,"https:");
  }
 }
});
test("political questions, public hypothesis and links remain editorial and unreviewed",async()=>{
 const claims=await read("../public/knowledge/claims.json");
 const atlas=await read("../public/knowledge/questions.json");
 const everyday=await read("../public/knowledge/everyday-questions.json");
 const claim=claims.claims.find(c=>c.id==="P-001");
 assert.ok(claim);
 assert.equal(claim.type,"empirical");
 assert.equal(claim.maturity.level,0);
 assert.equal(claim.review_status,"unreviewed");
 assert.equal(claim.human_review,null);
 assert.equal(claim.consensus.status,"not_assessed");
 const question=atlas.questions.find(q=>q.id==="Q-007");
 assert.ok(question);
 assert.deepEqual(question.claim_ids,["P-001"]);
 assert.deepEqual(question.topics,["politik","wirtschaft"]);
 assert.equal(question.review_status,"unreviewed");
 for(const id of ["verteilung","mehrheit","machtkontrolle","steuern","ki-arbeit","generationen"]){
  const entry=everyday.questions.find(q=>q.id===id);
  assert.ok(entry,"Missing forum question: "+id);
  assert.equal(entry.related_page,"politik-die-dem-menschen-dient");
  for(const field of ["topic","question","answer","challenge"])
   for(const lang of ["de","en"])assert.ok(entry[field][lang]);
 }
});
