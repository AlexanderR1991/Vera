import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const policy=JSON.parse(read("public/protocol/speech-and-safety.v0.json"));

test("REDE-01 is a human-reviewed proposal, not a running censorship or archiving service",()=>{
 assert.equal(policy.principle_id,"REDE-01");
 assert.equal(policy.status,"editorial_normative_draft");
 assert.equal(policy.safeguards.automatic_publication,false);
 assert.equal(policy.safeguards.automatic_final_moderation,false);
 assert.equal(policy.safeguards.public_immutable_archive_of_all_speech,false);
 assert.equal(policy.safeguards.staffed_private_reporting_channel_available,false);
 assert.equal(policy.safeguards.independent_appeal_available,false);
});

test("speech visibility options are explicit and distinct from truth grades",()=>{
 assert.deepEqual(policy.categories.map(x=>x.id),["A","B","C","D"]);
 assert.deepEqual(policy.categories.map(x=>x.action),[
  "keep_public","contextualize","restrict_pending_review","stop_public_distribution"
 ]);
 for(const category of policy.categories){
  assert.ok(category.de&&category.en);
  if(["C","D"].includes(category.id))assert.equal(category.human_review_required,true);
 }
 assert.ok(policy.non_restriction_reasons.includes("mere_offense"));
 assert.ok(policy.non_restriction_reasons.includes("criticism_of_project"));
 assert.ok(policy.non_restriction_reasons.includes("report_count_alone"));
 assert.ok(policy.assessment_fields.includes("least_restrictive_effective_option"));
 assert.ok(policy.assessment_fields.includes("human_decider"));
 assert.ok(policy.assessment_fields.includes("review_or_appeal_route"));
});

test("case examples preserve critical speech while accounting for plausible harm",()=>{
 const examples=new Map(policy.scenario_examples.map(x=>[x.id,x]));
 assert.ok(examples.size>=5);
 assert.equal(examples.get("S1").expected_action,"keep_public");
 assert.equal(examples.get("S2").expected_action,"keep_public");
 assert.equal(examples.get("S5").expected_action,"stop_public_distribution");
 for(const e of examples.values()){
  assert.ok(e.de&&e.en);
  assert.equal(e.context_dependent,true);
  assert.ok(policy.categories.some(c=>c.action===e.expected_action));
 }
});

test("public explanation may not expose private data or recreate unsafe content",()=>{
 assert.ok(policy.no_public_raw_archive_for.includes("private_personal_data"));
 assert.ok(policy.audit_record_fields.includes("reason_summary_without_harmful_quote"));
 assert.ok(policy.audit_record_fields.includes("deletion_or_retention_basis"));
 const doc=read("docs/redefreiheit-und-schutz.md");
 const conduct=read("CODE_OF_CONDUCT.md");
 const site=read("src/components/Forum.astro");
 const agent=read("AGENTS.md");
 for(const value of [doc,conduct,site,agent])assert.match(value,/REDE-01/);
 assert.match(site,/id="rede-01"/);
 assert.match(doc,/## English/);
});
