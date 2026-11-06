import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {validateRegister} from "../scripts/validate-claims.mjs";
import {claimReviewFingerprint} from "../src/lib/claims.mjs";
const original=JSON.parse(await readFile(new URL("../public/knowledge/claims.json",import.meta.url),"utf8"));
test("the register corpus satisfies its structural contract",()=>{
 assert.deepEqual(validateRegister(original),[]);
});
test("a normative principle cannot be promoted into formal proof",()=>{
 const data=structuredClone(original);data.claims[0].epistemic_status="formal_proof";
 assert.ok(validateRegister(data).some(x=>x.includes("formal proof requires a formal claim")));
});
test("reviewed labels cannot be added without an accountable review",()=>{
 const data=structuredClone(original);data.claims[0].review_status="reviewed";data.claims[0].human_review=null;
 assert.ok(validateRegister(data).some(x=>x.includes("requires an accountable human review")));
});
test("provenance alone cannot support an empirical result",()=>{
 const data=structuredClone(original);data.claims[2].epistemic_status="source_supported";
 assert.ok(validateRegister(data).some(x=>x.includes("require an evidence source")));
});
test("stable identifiers, translations and revision records cannot silently disappear",()=>{
 const data=structuredClone(original);data.claims[1].id=data.claims[0].id;
 delete data.claims[2].revision_condition.en;data.claims[0].version++;
 const errors=validateRegister(data);
 assert.ok(errors.some(x=>x.includes("duplicate identifier")));
 assert.ok(errors.some(x=>x.includes("missing bilingual revision_condition")));
 assert.ok(errors.some(x=>x.includes("preserve each version")));
});

// Fictional fixtures only: no test review is written to the public corpus.
function reviewedFixture(){
 const data=structuredClone(original),claim=data.claims[2];
 claim.review_status="reviewed";
 claim.human_review={
  reviewer:"Synthetic test reviewer (not an actual review)",
  date:"2026-11-06",
  method:{de:"Synthetischer Test",en:"Synthetic test"},
  decision:{de:"Testentscheidung",en:"Test decision"},
  claim_version:claim.version,
  content_sha256:claimReviewFingerprint(claim)
 };
 return data;
}

test("a review explicitly bound to the unchanged version and contents is accepted",()=>{
 assert.deepEqual(validateRegister(reviewedFixture()),[]);
});

test("the same review cannot silently cover changed claims, translations, sources or qualifications",()=>{
 const mutations=[
  c=>{c.statement.de="KI-Gegenkritik ist jeder menschlichen Prüfung immer überlegen.";},
  c=>{c.statement.en="AI countercritique is always superior to human review.";},
  c=>{c.scope.de="Gilt uneingeschränkt.";},
  c=>{c.rationale.en="A different reason.";},
  c=>{c.sources[0].role="evidence";},
  c=>{c.sources[0].url="https://example.org/another-source";},
  c=>{c.counterarguments.pop();},
  c=>{c.uncertainty.en="No uncertainty.";},
  c=>{c.revision_condition.de="Keine Änderung möglich.";},
  c=>{c.evidence_note.en="Proven effective.";},
  c=>{c.epistemic_status="source_supported";c.sources[0].role="evidence";},
  c=>{c.proof={de:"Andere Annahmen",en:"Different premises"};},
  c=>{c.ai_assistance.model="different-model";},
  c=>{c.history[0].change.en="A rewritten history.";},
  c=>{c.id="KI-002";}
 ];
 for(const mutate of mutations){
  const data=reviewedFixture();mutate(data.claims[2]);
  assert.ok(validateRegister(data).some(x=>x.includes("current claim version and content fingerprint")),String(mutate));
 }
});

test("incrementing the version or retagging an old review does not renew it",()=>{
 const data=reviewedFixture(),claim=data.claims[2];
 claim.version++;
 claim.updated_at="2026-11-06";
 claim.history.push({version:claim.version,date:claim.updated_at,change:{de:"Neue Fassung",en:"New version"}});
 assert.ok(validateRegister(data).some(x=>x.includes("current claim version and content fingerprint")));
 claim.human_review.claim_version=claim.version;
 assert.ok(validateRegister(data).some(x=>x.includes("current claim version and content fingerprint")));
 claim.human_review=null;claim.review_status="unreviewed";
 assert.deepEqual(validateRegister(data),[]);
});

test("missing review bindings and stale reviews in other workflow states are rejected",()=>{
 for(const field of ["claim_version","content_sha256"]){
  const data=reviewedFixture();delete data.claims[2].human_review[field];
  assert.ok(validateRegister(data).some(x=>x.includes("current claim version and content fingerprint")));
 }
 for(const state of ["in_review","disputed","withdrawn"]){
  const data=reviewedFixture(),claim=data.claims[2];claim.review_status=state;
  assert.deepEqual(validateRegister(data),[]);
  claim.statement.en="Changed content under another status.";
  assert.ok(validateRegister(data).some(x=>x.includes("current claim version and content fingerprint")));
 }
});

test("fingerprints ignore object key order but preserve array order",()=>{
 const claim=reviewedFixture().claims[2];
 const reorder=value=>Array.isArray(value)?value.map(reorder):value&&typeof value==="object"?Object.fromEntries(Object.entries(value).reverse().map(([k,v])=>[k,reorder(v)])):value;
 assert.equal(claimReviewFingerprint(claim),claimReviewFingerprint(reorder(claim)));
 const reversed=structuredClone(claim);reversed.counterarguments.reverse();
 assert.notEqual(claimReviewFingerprint(claim),claimReviewFingerprint(reversed));
});
