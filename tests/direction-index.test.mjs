import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const data=JSON.parse(readFileSync(new URL("../public/knowledge/direction-index.v0.json",import.meta.url),"utf8"));
test("direction index is explicitly nonoperational",()=>{
 assert.equal(data.status,"proposal_only");
 assert.equal(data.published_scores_allowed,false);
 assert.deepEqual([data.scale.minimum,data.scale.neutral,data.scale.maximum],[-1,0,1]);
 assert.equal(data.scale.not_a_probability,true);
 assert.equal(data.governance.automatic_publication,false);
});
test("all example questions remain unscored",()=>{
 assert.ok(data.samples.length>=2);
 for(const item of data.samples){
  assert.equal(item.score,null);
  assert.equal(item.status,"not_scored");
  assert.ok(item.claim.de&&item.claim.en&&item.reason.de&&item.reason.en);
 }
});
test("release gates and protection are documented in both languages",()=>{
 assert.ok(data.release_gates.length>=7);
 for(const item of [...data.process,...data.release_gates])assert.ok(item.de?.trim()&&item.en?.trim());
 assert.ok(data.prohibited_uses.includes("ranking_people"));
 assert.equal(data.governance.minority_objections_preserved,true);
});