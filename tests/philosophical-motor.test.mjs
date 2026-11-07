import test from "node:test";
import assert from "node:assert/strict";
import fixtures from "../public/research/philosophical-motor-examples.v0.json" with {type:"json"};
import published from "../public/knowledge/claims.json" with {type:"json"};
import {validateSyntheticScenario,examineDirection,traceRevisionImpact,provenanceAudit,assessScopedAgreement,describePublishedClaim} from "../src/lib/philosophical-motor.mjs";

const [plurality,rights,missing] = fixtures.cases;

test("only labeled synthetic cases are ever scored",()=>{
  assert.equal(examineDirection({...plurality,kind:"real"}).status,"not_scored");
  assert.equal(examineDirection(null).public_score_allowed,false);
  for(const sample of fixtures.cases) assert.deepEqual(validateSyntheticScenario(sample),[]);
});

test("weighted interval mathematics preserves opposite viewpoints",()=>{
  const result=examineDirection(plurality);
  assert.equal(result.status,"illustrative_only");
  assert.equal(result.direction,"profile_sensitive");
  assert.equal(result.safeguard_status,"declared_pass");
  assert.equal(result.public_score_allowed,false);
  const [first,second]=result.profile_results;
  assert.ok(Math.abs(first.estimate-0.2)<1e-12);
  assert.ok(Math.abs(second.estimate-(-0.1))<1e-12);
  assert.ok(Math.abs(first.lower-0.08)<1e-12);
  assert.ok(second.lower<0 && second.upper>0);
  assert.ok(result.profile_results.every(p=>p.lower<=p.estimate&&p.estimate<=p.upper));
});

test("rights safeguards are noncompensatory and cannot be bought by a score",()=>{
  const result=examineDirection(rights);
  assert.equal(result.direction,"positive_across_profiles");
  assert.equal(result.safeguard_status,"blocked");
  assert.equal(result.public_score_allowed,false);
});

test("absent evidence does not silently turn into numerical zero",()=>{
  const result=examineDirection(missing);
  assert.equal(result.status,"missing_data");
  assert.deepEqual(result.missing_dimensions,["harm"]);
  assert.deepEqual(result.profile_results,[]);
});

test("a weight error or an invalid interval fails closed",()=>{
  const bad=structuredClone(plurality);
  bad.value_profiles[0].weights.care=0.9;
  assert.equal(examineDirection(bad).status,"invalid_input");
  const inverted=structuredClone(plurality);
  inverted.dimensions[0].effects=[0.6,0.2,0.3];
  assert.equal(examineDirection(inverted).status,"invalid_input");
});

test("a claim revision queues dependents, not unrelated claims or truth updates",()=>{
  const graph={nodes:["A","B","C","D"],edges:[
    {from:"A",to:"B",type:"depends_on"},
    {from:"B",to:"C",type:"depends_on"},
    {from:"C",to:"A",type:"depends_on"},
    {from:"A",to:"D",type:"analogous_to"}
  ]};
  assert.deepEqual(traceRevisionImpact(graph,"A"),["B","C"]);
});

test("100 echoed model opinions do not become 100 independent sources",()=>{
  const records=Array.from({length:100},(_,i)=>({source_id:"STUDY-01",dependency_group_id:"family-1",origin:"ai",role:i}));
  const audit=provenanceAudit(records);
  assert.equal(audit.records,100);
  assert.equal(audit.distinct_source_ids,1);
  assert.equal(audit.declared_dependency_groups,1);
  assert.equal(audit.independence_verified,false);
});

test("a consent applies only to the exact version and all named parties",()=>{
  const proposal={version:"v2",parties:["A","B"],rights:"pass",feasibility:"yes",responses:[
    {party:"A",stance:"yes",version:"v2"},
    {party:"B",stance:"yes",version:"v1"}
  ]};
  assert.equal(assessScopedAgreement(proposal),"proposed_or_open");
  assert.equal(assessScopedAgreement({...proposal,responses:proposal.responses.map(r=>({...r,version:"v2"}))}),"agreement_on_exact_version");
  assert.equal(assessScopedAgreement({...proposal,rights:"fail"}),"blocked");
  assert.equal(assessScopedAgreement({...proposal,feasibility:"no"}),"infeasible");
});

test("same median estimates do not imply robust positive orientation",()=>{
  const hypothetical=structuredClone(plurality);
  hypothetical.dimensions[0].effects=[-1,0.2,1];
  const result=examineDirection(hypothetical);
  assert.notEqual(result.direction,"positive_across_profiles");
});

test("public claim records are read without rating, fictitious consensus or R promotion",()=>{
  assert.ok(published.claims.length>=3);
  for(const claim of published.claims){
    const item=describePublishedClaim(claim);
    assert.equal(item.status,"read_only_record");
    assert.equal(item.maturity_level,claim.maturity.level);
    assert.equal(item.consensus_status,claim.consensus.status);
    assert.equal(item.version,claim.version);
    assert.equal(item.source_records,claim.sources.length);
    assert.equal(item.direction,null);
    assert.equal(item.public_score_allowed,false);
  }
  assert.equal(describePublishedClaim({id:"fake"}).status,"invalid_claim");
});
