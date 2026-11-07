import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const engine=JSON.parse(readFileSync(new URL("../public/ai/philosophy-engine.v0.json",import.meta.url),"utf8"));
const valid=x=>x&&["de","en"].every(k=>typeof x[k]==="string"&&x[k].trim().length>8);
test("AI engine remains an unreviewed normative draft",()=>{
 assert.equal(engine.schema_version,1);
 assert.equal(engine.status,"editorial_draft");
 assert.ok(valid(engine.purpose));
 assert.ok(valid(engine.evaluation_note));
});
test("Bilingual, unique, testable principles",()=>{
 assert.ok(engine.principles.length>=5);
 assert.equal(new Set(engine.principles.map(p=>p.id)).size,engine.principles.length);
 for(const p of engine.principles){assert.match(p.id,/^AI-P\d\d$/);assert.equal(p.claim_type,"normative_proposal");assert.ok(valid(p.title)&&valid(p.test_question));}
});
test("Challenge cases cite real principles and failures",()=>{
 const ids=new Set(engine.principles.map(p=>p.id));
 assert.ok(engine.cases.length>=4);
 assert.equal(new Set(engine.cases.map(c=>c.id)).size,engine.cases.length);
 for(const c of engine.cases){
  assert.match(c.id,/^AI-T\d\d$/);
  assert.ok(c.principles.length&&c.principles.every(id=>ids.has(id)));
  assert.ok(valid(c.scenario)&&valid(c.inspect)&&valid(c.failure));
 }
});
