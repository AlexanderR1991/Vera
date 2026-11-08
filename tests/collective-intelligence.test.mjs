import test from "node:test";
import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";
const m=JSON.parse(readFileSync(new URL("../public/protocol/collective-intelligence.v0.json",import.meta.url)));
const bi=x=>x&&["de","en"].every(lang=>typeof x[lang]==="string"&&x[lang].trim().length>10);
test("CI-0.1 is a hypothesis, not a truth or moral score",()=>{
 assert.equal(m.version,"CI-0.1");assert.equal(m.status,"unvalidated_architecture_hypothesis");
 assert.ok(bi(m.hypothesis)&&bi(m.limits));assert.equal(m.atlas_fields.length,6);
 assert.equal(m.related_draft.status,"open_unvalidated");
});
test("six stages have distinct IDs and falsifiable counterquestions",()=>{
 assert.equal(m.stages.length,6);assert.equal(new Set(m.stages.map(s=>s.id)).size,6);
 for(const s of m.stages){assert.match(s.id,/^CI-0[1-6]$/);assert.ok(bi(s));assert.ok(bi(s.risk));assert.ok(["pilot","human_review","planned"].includes(s.status));}
 assert.ok(m.guards.length>=5&&m.guards.every(bi));
 assert.ok(m.tests.length>=4&&m.tests.every(bi));
});
test("public routes and bilingual grounding exist",()=>{
 for(const p of ["docs/kollektive-intelligenz.md","docs/en/kollektive-intelligenz.md","src/pages/de/kollektive-intelligenz.astro","src/pages/en/kollektive-intelligenz.astro"]){
  assert.ok(existsSync(new URL("../"+p,import.meta.url)),p);
 }
});
