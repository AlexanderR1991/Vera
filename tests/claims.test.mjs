import {spawnSync} from "node:child_process";
import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {validateRegister} from "../scripts/validate-claims.mjs";
import {claimReviewFingerprint,hasHumanReviewRecord,reviewMatchesClaim} from "../src/lib/claims.mjs";
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


test("human-review records require existing calendar dates without inventing a new year policy",()=>{
 for(const date of ["2026-02-29","2026-02-30","2026-02-31","2026-04-31","2026-06-31","2026-09-31","2026-11-31","1900-02-29","2100-02-29","2026-13-01","2026-00-01"]){
  const data=reviewedFixture(),claim=data.claims[2];claim.human_review.date=date;
  assert.equal(hasHumanReviewRecord(claim.human_review),false,date);
  assert.equal(reviewMatchesClaim(claim),false,date);
  assert.ok(validateRegister(data).some(error=>error.includes("human review")),date);
 }
 for(const date of ["2026-02-28","2026-04-30","2026-11-30","1900-02-28","2000-02-29","2024-02-29","2400-02-29","0000-02-29","9999-12-31"]){
  const data=reviewedFixture(),claim=data.claims[2];claim.human_review.date=date;
  assert.equal(hasHumanReviewRecord(claim.human_review),true,date);
  assert.equal(reviewMatchesClaim(claim),true,date);
  assert.deepEqual(validateRegister(data),[],date);
 }
});


test("register and revision dates must exist even when update and history agree",()=>{
 const fixtures={
  register:(data,date)=>{data.updated_at=date;},
  latest:(data,date)=>{const claim=data.claims[0];claim.updated_at=date;claim.history.at(-1).date=date;},
  earlier:(data,date)=>{const claim=data.claims[0];assert.ok(claim.history.length>1);claim.history[0].date=date;}
 };
 const expected={register:"register title or date",latest:"invalid version or date",earlier:"invalid revision history"};
 for(const [name,mutate]of Object.entries(fixtures)){
  for(const date of ["2026-02-29","2026-02-30","2026-04-31","2026-06-31","2026-09-31","2026-11-31","1900-02-29","2100-02-29","2026-13-01"]){
   const data=structuredClone(original);mutate(data,date);
   assert.ok(validateRegister(data).some(error=>error.includes(expected[name])),name+" "+date);
  }
  for(const date of ["2026-02-28","2026-04-30","2026-11-30","2000-02-29","2024-02-29","2400-02-29","0000-02-29","9999-12-31"]){
   const data=structuredClone(original);mutate(data,date);
   assert.deepEqual(validateRegister(data),[],name+" "+date);
  }
 }
});


test("missing revision slots produce explicit errors without rewriting the history",()=>{
 assert.equal(original.claims[0].history.length,3);
 for(const kind of ["hole","undefined","null","json"])for(let mask=1;mask<8;mask++){
  let data=structuredClone(original);
  const history=data.claims[0].history;
  for(let i=0;i<3;i++)if(mask&(1<<i)){
   if(kind==="hole"||kind==="json")delete history[i];
   else history[i]=kind==="null"?null:undefined;
  }
  if(kind==="json")data=JSON.parse(JSON.stringify(data));
  const before=structuredClone(data);
  let errors;
  assert.doesNotThrow(()=>{errors=validateRegister(data);},kind+" "+mask);
  assert.ok(errors.some(error=>error.includes("invalid revision history")),kind+" "+mask);
  assert.deepEqual(data,before,kind+" "+mask);
 }
});


test("counterargument slots must contain bilingual text even in sparse arrays",()=>{
 const valid={de:"Synthetischer Einwand",en:"Synthetic objection"};
 for(const kind of ["hole","undefined","null","json"])for(let length=1;length<=4;length++)for(let mask=1;mask<(1<<length);mask++){
  const data=structuredClone(original);
  let entries=Array.from({length},()=>structuredClone(valid));
  for(let i=0;i<length;i++)if(mask&(1<<i)){
   if(kind==="hole"||kind==="json")delete entries[i];else entries[i]=kind==="null"?null:undefined;
  }
  if(kind==="json")entries=JSON.parse(JSON.stringify(entries));
  data.claims[0].counterarguments=entries;
  const before=structuredClone(data);
  assert.ok(validateRegister(data).some(error=>error.includes("missing bilingual counterarguments")),kind+" "+length+" "+mask);
  assert.deepEqual(data,before);
 }
 for(let length=1;length<=4;length++){
  const data=structuredClone(original);data.claims[0].counterarguments=Array.from({length},()=>structuredClone(valid));
  assert.deepEqual(validateRegister(data),[]);
 }
});


test("register search preserves canonical spellings across host locales",async()=>{
 const component=await readFile(new URL("../src/components/ClaimRegister.astro",import.meta.url),"utf8");
 const match=component.match(/const normalize=\(s:string\)=>([^\n;]+);/);
 assert.ok(match,"read the actual register search normalizer");
 const code=`const normalize=s=>(${match[1]});
 const words=["Ìrrtum","Írrtum","Îrrtum","Ïrrtum","Ĩrrtum","Īrrtum","İrrtum","Änderung","Évidence"];
 for(const word of words){
  if(normalize(word.normalize("NFC"))!==normalize(word.normalize("NFD")))throw Error("canonical mismatch: "+word);
 }
 console.log(JSON.stringify({locale:Intl.DateTimeFormat().resolvedOptions().locale}));`;
 for(const [locale,expected]of [["en_US.UTF-8","en-US"],["de_DE.UTF-8","de-DE"],["tr_TR.UTF-8","tr-TR"]]){
  const child=spawnSync(process.execPath,["-e",code],{encoding:"utf8",env:{...process.env,LANG:locale,LC_ALL:locale}});
  assert.equal(child.status,0,locale+": "+child.stderr);
  assert.equal(JSON.parse(child.stdout).locale,expected);
 }
});
