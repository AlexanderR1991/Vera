import test from "node:test";
import assert from "node:assert/strict";
import {readFile,readdir} from "node:fs/promises";
import {topics} from "../src/lib/tree.mjs";
import {validateUniversal,questionsForRoute,findingsForRoute,findingsForQuestion} from "../src/lib/universal-questions.mjs";
const read=async path=>JSON.parse(await readFile(new URL("../"+path,import.meta.url),"utf8"));
const catalogue=await read("public/knowledge/universal-questions.v1.json");
const findings=await read("public/knowledge/universal-findings.v1.json");
const atlas=await read("public/knowledge/questions.json");
const ledger=await read("public/i18n/review-register.v1.json");
const files=(await readdir(new URL("../docs/",import.meta.url))).filter(x=>x.endsWith(".md")).map(x=>"docs/"+x);
const args=[new Set(topics.map(t=>t.id)),new Set(Object.keys(ledger.website.pages)),new Set(files),atlas.questions.map(q=>q.id)];
test("The published cross-domain catalogue has valid traceable questions and no false findings",()=>{
 assert.equal(validateUniversal(catalogue,findings,...args).length,0);
 assert.equal(catalogue.questions.length,16);
 assert.equal(findings.findings.length,0);
});
test("Every domain only sees questions mapped to that route",()=>{
 for(const route of args[1]){
  const items=questionsForRoute(catalogue,route);
  assert.ok(items.length<=3);
  assert.ok(items.every(q=>q.return_routes.includes(route)));
 }
 assert.ok(questionsForRoute(catalogue,"die-bruecke").some(q=>q.id==="U-003"));
});
test("A finding must not be projected without review and matching destination",()=>{
 const bad={...findings,findings:[{id:"UF-001",question_id:"U-003",status:"ai_draft",return_routes:["die-bruecke"]}]};
 assert.deepEqual(findingsForRoute(catalogue,bad,"die-bruecke"),[]);
 assert.ok(validateUniversal(catalogue,bad,...args).length>0);
 assert.deepEqual(findingsForQuestion(findings,"U-003"),[]);
});
test("Rejection of fabricated source, changed status, duplicate ID and fake backport",()=>{
 const copy=structuredClone(catalogue);
 copy.questions[0].source_paths.push("docs/not-a-real-source.md");
 copy.questions[1].id=copy.questions[0].id;
 copy.questions[2].review_status="reviewed";
 assert.ok(validateUniversal(copy,findings,...args).length>=3);
});
test("Cycles in dependency relationships are rejected",()=>{
 const copy=structuredClone(catalogue);
 copy.relations.push({from:"U-007",to:"U-001",type:"depends_on",reason:{de:"Test-Gegenkante",en:"Test counteredge"}});
 assert.ok(validateUniversal(copy,findings,...args).some(x=>x.includes("Cycle")));
});
test("Review metadata is necessary even if an answer is plausible",()=>{
 const answer={schema_version:1,findings:[{
 id:"UF-001",question_id:"U-003",version:1,status:"reviewed",claim_type:"empirical",
 answer:{de:"Hypothese",en:"Hypothesis"},scope:{de:"Bedingt",en:"Conditional"},
 dissent:{de:"Ungeklärt",en:"Unresolved"},revision_condition:{de:"Gegenbeleg",en:"Counterevidence"},
 reviewer:"AI",reviewed_at:"2026-11-07",source_commit:"x",review_url:"https://invalid.test",
 evidence_paths:["docs/schnittmengen.md"],return_routes:["die-bruecke"]
 }]};
 assert.ok(validateUniversal(catalogue,answer,...args).length>=3);
});
