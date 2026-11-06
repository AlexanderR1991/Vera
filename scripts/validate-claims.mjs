import {readFile} from "node:fs/promises";
import {pathToFileURL} from "node:url";
import {hasHumanReviewRecord,reviewMatchesClaim} from "../src/lib/claims.mjs";

const types=new Set(["empirical","formal","normative","interpretive","metaphor"]);
const states=new Set(["unreviewed","in_review","reviewed","disputed","withdrawn"]);
const support=new Set(["value_commitment","conceptual_model","open_hypothesis","source_supported","formal_proof"]);
const date=s=>typeof s==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s));
const present=s=>typeof s==="string"&&s.trim().length>0;
const bilingual=o=>o&&present(o.de)&&present(o.en);

// Structural checks prevent missing provenance and unsupported review labels.
// They cannot establish truth, source quality or authenticity of a human review.
export function validateRegister(data){
 const errors=[],ids=new Set();
 if(data?.schema_version!==1)errors.push("Unsupported register schema");
 if(!bilingual(data?.title)||!date(data?.updated_at))errors.push("Missing register title or date");
 if(!Array.isArray(data?.claims)||data.claims.length===0)return [...errors,"Claims must be a nonempty array"];
 for(const c of data.claims){
  if(!c||typeof c!=="object"){errors.push("Invalid claim object");continue;}
  const tag=c.id||"<missing id>";
  const fail=message=>errors.push(`${tag}: ${message}`);
  if(!/^[A-Z]+-\d{3}$/.test(c.id)||ids.has(c.id))fail("missing, invalid or duplicate identifier");
  ids.add(c.id);
  if(!Number.isInteger(c.version)||c.version<1||!date(c.updated_at))fail("invalid version or date");
  if(!types.has(c.type)||!states.has(c.review_status)||!support.has(c.epistemic_status))fail("unknown type, support or review status");
  if(c.epistemic_status==="formal_proof"&&c.type!=="formal")fail("formal proof requires a formal claim");
  if(c.epistemic_status==="value_commitment"&&c.type!=="normative")fail("value commitment requires a normative claim");
  if(c.type==="normative"&&c.epistemic_status!=="value_commitment")fail("normative claims require value justification, not proof promotion");
  if(c.type==="metaphor"&&c.epistemic_status!=="conceptual_model")fail("metaphors cannot acquire empirical proof status");
  for(const field of ["statement","scope","rationale","revision_condition","evidence_note","uncertainty"]){if(!bilingual(c[field]))fail(`missing bilingual ${field}`);}
  if(!Array.isArray(c.counterarguments)||!c.counterarguments.length||!c.counterarguments.every(bilingual))fail("missing bilingual counterarguments");
  if(!Array.isArray(c.sources))fail("sources must be an array");
  else for(const s of c.sources){
   let validURL=false;try{validURL=new URL(s.url).protocol==="https:";}catch{}
   if(!validURL||!bilingual(s.label)||!["provenance","evidence","counterevidence"].includes(s.role))fail("invalid source or source role");
  }
  if(c.epistemic_status==="source_supported"&&!(Array.isArray(c.sources)&&c.sources.some(s=>s?.role==="evidence")))fail("source-supported claims require an evidence source");
  if(c.epistemic_status==="formal_proof"&&!bilingual(c.proof))fail("formal proof requires explicit premises and derivation");
  const review=c.human_review;
  if(review!==null&&!hasHumanReviewRecord(review))fail("invalid human review record");
  if(review&&!reviewMatchesClaim(c))fail("human review must match the current claim version and content fingerprint");
  if(c.review_status==="reviewed"&&!review)fail("reviewed status requires an accountable human review record");
  if(c.review_status==="unreviewed"&&review)fail("unreviewed status conflicts with human review record");
  if(!c.ai_assistance||typeof c.ai_assistance.used!=="boolean"||!bilingual(c.ai_assistance.task)||!(c.ai_assistance.model===null||present(c.ai_assistance.model)))fail("incomplete AI provenance");
  if(!Array.isArray(c.history)||c.history.length!==c.version)fail("history must preserve each version");
  else {
   c.history.forEach((h,i)=>{if(h.version!==i+1||!date(h.date)||!bilingual(h.change))fail("invalid revision history");});
   if(c.history.at(-1)?.date!==c.updated_at)fail("latest revision date differs from update date");
  }
 }
 return errors;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const data=JSON.parse(await readFile(new URL("../public/knowledge/claims.json",import.meta.url),"utf8"));
 const errors=validateRegister(data);
 if(errors.length){console.error(errors.join("\n"));process.exitCode=1;}
 else console.log(`Validated ${data.claims.length} claim records: bilingual fields, provenance, review requirements and revision history. This is not a truth check.`);
}
