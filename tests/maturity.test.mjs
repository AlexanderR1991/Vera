import test from "node:test";
import {maturityErrors} from "../src/lib/maturity.mjs";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {validateRegister} from "../scripts/validate-claims.mjs";
import {claimReviewFingerprint} from "../src/lib/claims.mjs";

const original=JSON.parse(await readFile(new URL("../public/knowledge/claims.json",import.meta.url),"utf8"));
const example=id=>{
 const data=structuredClone(original);
 const claim=data.claims.find(c=>c.id===id);
 assert.ok(claim,"fixture exists");
 return {data,claim};
};
const review=claim=>{
 claim.review_status="reviewed";
 claim.human_review={
  reviewer:"Synthetic editorial reviewer",
  date:"2026-11-06",
  method:{de:"Nur Test, keine tatsächliche Prüfung",en:"Test fixture only, no actual review"},
  decision:{de:"Nur Testentscheidung",en:"Synthetic decision only"},
  claim_version:claim.version,
  content_sha256:claimReviewFingerprint(claim)
 };
};
const independent=(reviewer,url)=>({
 reviewer,date:"2026-11-06",url,
 scope:{de:"Nur synthetischer Test",en:"Synthetic test only"},
 conflicts:{de:"Nur synthetisch; keine behauptete Unabhängigkeit",en:"Synthetic only; no asserted independence"}
});

test("public examples are R0 without invented consensus or independent reviews",()=>{
 assert.deepEqual(validateRegister(original),[]);
 for(const c of original.claims){
  assert.equal(c.maturity.level,0);
  assert.equal(c.consensus.status,"not_assessed");
  assert.deepEqual(c.consensus.records,[]);
  assert.deepEqual(c.maturity.independent_checks,[]);
 }
});

test("no R1 without an accountable, fingerprint-bound human review",()=>{
 const {data,claim}=example("KI-001");claim.maturity.level=1;
 assert.ok(validateRegister(data).some(e=>e.includes("R1+ requires")));
 review(claim);
 assert.deepEqual(validateRegister(data),[]);
 claim.maturity.rationale.en="Changed after review";
 assert.ok(validateRegister(data).some(e=>e.includes("fingerprint")));
});

test("an empirical claim cannot reach R2 using provenance or an untested hypothesis",()=>{
 const {data,claim}=example("KI-001");claim.maturity.level=2;review(claim);
 assert.ok(validateRegister(data).some(e=>e.includes("empirical R2+")));
 claim.epistemic_status="source_supported";
 claim.sources[0].role="evidence"; // synthetic test data; not public evidence
 review(claim);
 assert.deepEqual(validateRegister(data),[]);
});

test("R3 needs an independently documented check, not an AI count",()=>{
 const {data,claim}=example("G-005");claim.maturity.level=3;review(claim);
 assert.ok(validateRegister(data).some(e=>e.includes("R3+ requires")));
 claim.maturity.independent_checks.push(independent("Synthetic independent A","https://example.org/review-a"));
 review(claim);
 assert.deepEqual(validateRegister(data),[]);
 claim.maturity.independent_checks[0].reviewer=claim.human_review.reviewer;
 assert.ok(validateRegister(data).some(e=>e.includes("duplicates the main reviewer")));
});

test("R4 requires different checks and a response to the strongest objections",()=>{
 const {data,claim}=example("G-005");claim.maturity.level=4;
 claim.maturity.independent_checks.push(independent("Synthetic A","https://example.org/a"));
 review(claim);
 assert.ok(validateRegister(data).some(e=>e.includes("R4 requires at least two")));
 claim.maturity.independent_checks.push(independent("Synthetic B","https://example.org/b"));
 review(claim);
 assert.ok(validateRegister(data).some(e=>e.includes("R4 requires bilingual treatment")));
 claim.maturity.adversarial_resolution={de:"Nur Test",en:"Synthetic fixture only"};
 review(claim);
 assert.deepEqual(validateRegister(data),[]);
 claim.maturity.independent_checks[1].reviewer="Synthetic A";
 assert.ok(validateRegister(data).some(e=>e.includes("independent reviewers must be distinct")));
});

test("documented consensus is traceable and independent of maturity",()=>{
 const {data,claim}=example("H-001");
 claim.consensus.status="documented_agreement";
 assert.ok(validateRegister(data).some(e=>e.includes("needs traceable positions")));
 claim.consensus.records.push({
  stance:"agree",url:"https://example.org/synthetic-position",
  context:{de:"Künstliche Testposition",en:"Synthetic test position"}
 });
 assert.deepEqual(validateRegister(data),[]);
 assert.equal(claim.maturity.level,0);
 claim.consensus.status="mixed";
 assert.ok(validateRegister(data).some(e=>e.includes("mixed consensus requires")));
 claim.consensus.records.push({
  stance:"disagree",url:"https://example.org/synthetic-objection",
  context:{de:"Künstlicher Einwand",en:"Synthetic objection"}
 });
 assert.deepEqual(validateRegister(data),[]);
});

test("a withdrawn claim cannot keep a high maturity grade",()=>{
 const {data,claim}=example("G-005");
 claim.review_status="withdrawn";claim.maturity.level=2;
 review(claim);claim.review_status="withdrawn";
 assert.ok(validateRegister(data).some(e=>e.includes("withdrawn claims must have R0")));
 claim.maturity.level=0;claim.review_status="unreviewed";claim.human_review=null;
 assert.deepEqual(validateRegister(data),[]);
});

test("abstraction never upgrades maturity",()=>{
 const {data,claim}=example("KI-001");
 claim.abstraction_level="principle";
 assert.equal(claim.maturity.level,0);
 assert.deepEqual(validateRegister(data),[]);
 claim.abstraction_level="supreme_truth";
 assert.ok(validateRegister(data).some(e=>e.includes("invalid abstraction level")));
});


test("independent review dates must exist without narrowing the year range",()=>{
 for(const [level,slot]of [[3,0],[4,0],[4,1]]){
  const make=date=>{
   const {data,claim}=example("G-005");claim.maturity.level=level;
   claim.maturity.independent_checks=Array.from({length:level===3?1:2},(_,i)=>independent("Synthetic independent "+i,"https://example.invalid/review-"+i));
   claim.maturity.independent_checks[slot].date=date;
   if(level===4)claim.maturity.adversarial_resolution={de:"Nur Test",en:"Synthetic fixture only"};
   review(claim);return {data,claim};
  };
  for(const date of ["2026-02-29","2026-02-30","2026-02-31","2026-04-31","2026-06-31","2026-09-31","2026-11-31","1900-02-29","2100-02-29","2026-13-01","2026-00-01"]){
   const {data,claim}=make(date),before=structuredClone(data);
   assert.ok(maturityErrors(claim).includes("invalid independent review record"),date);
   assert.ok(validateRegister(data).some(error=>error.includes("invalid independent review record")),date);
   assert.deepEqual(data,before);
  }
  for(const date of ["2026-02-28","2026-04-30","2026-11-30","1900-02-28","2000-02-29","2024-02-29","2400-02-29","0000-02-29","9999-12-31"]){
   const {data,claim}=make(date);
   assert.deepEqual(maturityErrors(claim),[],date);assert.deepEqual(validateRegister(data),[],date);
  }
 }
});


test("missing independent review slots return diagnostics without aborting other checks",()=>{
 for(const level of [0,3,4])for(const kind of ["hole","undefined","null","json"]){
  const {data,claim}=example("G-005");claim.maturity.level=level;
  claim.maturity.independent_checks=[independent("Synthetic A","https://example.invalid/a"),independent("Synthetic A","https://example.invalid/a"),null];
  if(kind==="hole"||kind==="json")delete claim.maturity.independent_checks[2];
  if(kind==="undefined")claim.maturity.independent_checks[2]=undefined;
  if(kind==="json")claim.maturity.independent_checks=JSON.parse(JSON.stringify(claim.maturity.independent_checks));
  // Missing R4 objection response is deliberate: collect later diagnostics too.
  if(level>0)review(claim);
  const before=structuredClone(data);
  for(const validate of [()=>maturityErrors(claim),()=>validateRegister(data)]){
   let errors;assert.doesNotThrow(()=>{errors=validate();});
   assert.ok(errors.some(error=>error.includes("invalid independent review record")));
   assert.ok(errors.some(error=>error.includes("independent reviewers must be distinct")));
   if(level===4)assert.ok(errors.some(error=>error.includes("R4 requires bilingual treatment")));
  }
  assert.deepEqual(data,before);
 }
});


test("review and consensus URL fields require strings without changing HTTPS string admission",()=>{
 const url="https://example.invalid/synthetic-review";
 for(const field of ["independent","consensus"]){
  for(const value of [[url],[[url]],[url,null],[],{},null,42,true]){
   const {data,claim}=example("G-005");
   if(field==="independent"){
    claim.maturity.level=3;
    claim.maturity.independent_checks=[independent("Synthetic independent",value)];
    review(claim);
   }else{
    claim.consensus.status="documented_agreement";
    claim.consensus.records=[{stance:"agree",url:value,context:{de:"Nur Test",en:"Synthetic only"}}];
   }
   const before=structuredClone(data);
   const expected=field==="independent"?"invalid independent review record":"invalid documented position";
   assert.ok(maturityErrors(claim).includes(expected));
   assert.ok(validateRegister(data).some(error=>error.includes(expected)));
   assert.deepEqual(data,before);
  }
  for(const value of [url,url+"#scope","HTTPS://EXAMPLE.INVALID/Prüfung?q=1"]){
   const {data,claim}=example("G-005");
   if(field==="independent"){
    claim.maturity.level=3;
    claim.maturity.independent_checks=[independent("Synthetic independent",value)];review(claim);
   }else{
    claim.consensus.status="documented_agreement";
    claim.consensus.records=[{stance:"agree",url:value,context:{de:"Nur Test",en:"Synthetic only"}}];
   }
   assert.deepEqual(maturityErrors(claim),[]);
   assert.deepEqual(validateRegister(data),[]);
  }
 }
});
