import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const protocol=JSON.parse(readFileSync(new URL("../public/protocol/forward-inquiry.v0.json",import.meta.url),"utf8"));
const engine=JSON.parse(readFileSync(new URL("../public/ai/philosophy-engine.v0.json",import.meta.url),"utf8"));
const validBi=x=>x && ["de","en"].every(k=>typeof x[k]==="string" && x[k].trim().length>8);

test("FWD-01 is a human-accountable draft, not an autonomous learning system",()=>{
 assert.equal(protocol.id,"FWD-01");
 assert.equal(protocol.schema_version,1);
 assert.equal(protocol.status,"proposed_not_implemented");
 assert.equal(protocol.rules.human_editor_required,true);
 assert.equal(protocol.rules.no_agent_activation,true);
 assert.equal(protocol.rules.no_automatic_optimization,true);
 assert.equal(protocol.rules.no_numeric_universal_progress_score,true);
 assert.equal(protocol.rules.allow_pause_and_rollback,true);
 assert.ok(validBi(protocol.guiding_question));
 assert.ok(validBi(protocol.forward_definition));
 assert.ok(validBi(protocol.limitations));
 assert.ok(protocol.source.endsWith("/docs/vorwaertsgerichtete-entitaet.md"));
});

test("FWD-01 cycle is bilingual, ordered and covers reversal and disagreement",()=>{
 assert.equal(protocol.cycle.length,6);
 assert.deepEqual(protocol.cycle.map(s=>s.id),[
  "open_horizon","record_current","seek_objection","compare_directions","human_decision","record_and_reopen"
 ]);
 for(const step of protocol.cycle){
  assert.ok(validBi(step.title),"missing title for "+step.id);
  assert.ok(validBi(step),"missing description for "+step.id);
 }
 for(const decision of ["withdraw","pause","open"]){
  assert.ok(protocol.decisions.includes(decision));
 }
 assert.equal(protocol.comparison_criteria.length,4);
 for(const criterion of protocol.comparison_criteria){
  assert.ok(validBi(criterion),"criterion not bilingual: "+criterion.id);
 }
});

test("FWD-01 is exercised by an adversarial AI test, not treated as verified",()=>{
 assert.equal(engine.forward_inquiry.id,"FWD-01");
 assert.equal(engine.forward_inquiry.autonomous_learning_enabled,false);
 assert.equal(engine.forward_inquiry.human_review_required,true);
 assert.equal(engine.forward_inquiry.protocol,"protocol/forward-inquiry.v0.json");
 assert.ok(engine.principles.some(p=>p.id==="AI-P08"&&validBi(p.title)&&validBi(p.test_question)));
 const c=engine.cases.find(c=>c.id==="AI-T06");
 assert.ok(c);
 assert.ok(c.principles.includes("AI-P08"));
 assert.ok(validBi(c.scenario)&&validBi(c.inspect)&&validBi(c.failure));
});
