// A descriptive, reviewable maturity level is NOT a probability of truth.
// Shared by the register UI and build-time structural validation.
export const maturityLabels={
 de:["Ungeprüfter Stand","Prüfbar formuliert","Begründet geprüft","Unabhängig gegenprüft","Robust gegenkritisiert"],
 en:["Unreviewed","Testably formulated","Reasoned review","Independently challenged","Robust under criticism"]
};
export const abstractionLabels={
 de:{case:"Einzelfall",pattern:"Muster",disciplinary:"Fachbezogene Aussage",principle:"Allgemeines Prinzip"},
 en:{case:"Individual case",pattern:"Pattern",disciplinary:"Disciplinary claim",principle:"General principle"}
};
export const consensusLabels={
 de:{not_assessed:"Konsens nicht erhoben",documented_agreement:"Zustimmung dokumentiert",documented_dissent:"Dissens dokumentiert",mixed:"Zustimmung und Dissens dokumentiert"},
 en:{not_assessed:"Consensus not assessed",documented_agreement:"Agreement documented",documented_dissent:"Dissent documented",mixed:"Agreement and dissent documented"}
};
const present=v=>typeof v==="string"&&v.trim().length>0;
const bilingual=v=>v&&present(v.de)&&present(v.en);
const date=v=>typeof v==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(Date.parse(v));
const https=v=>{try{return new URL(v).protocol==="https:";}catch{return false;}};

// These are minimum *structural* gates, NOT automatic source evaluation.
// No AI, majority vote or count of checks establishes truth.
export function maturityErrors(claim){
 const errors=[];
 const level=claim.maturity?.level;
 if(!Object.hasOwn(abstractionLabels.de,claim.abstraction_level))errors.push("invalid abstraction level");
 if(!Number.isInteger(level)||level<0||level>4)errors.push("invalid maturity level R0–R4");
 if(!bilingual(claim.maturity?.rationale))errors.push("missing bilingual maturity rationale");
 const checks=claim.maturity?.independent_checks;
 if(!Array.isArray(checks))errors.push("independent checks must be an array");
 else{
  const seen=new Set();
  for(const check of checks){
   if(!present(check?.reviewer)||!date(check.date)||!https(check.url)||!bilingual(check.scope)||!bilingual(check.conflicts))errors.push("invalid independent review record");
   if(seen.has(check.reviewer))errors.push("independent reviewers must be distinct");
   seen.add(check.reviewer);
   if(check.reviewer===claim.human_review?.reviewer)errors.push("independent reviewer duplicates the main reviewer");
  }
 }
 if(level>=1&&(claim.review_status!=="reviewed"||!claim.human_review))errors.push("R1+ requires a documented accountable human review");
 if(level>=2&&claim.type==="empirical"&&claim.epistemic_status!=="source_supported")errors.push("empirical R2+ requires documented supporting evidence");
 if(level>=2&&claim.type==="formal"&&claim.epistemic_status!=="formal_proof")errors.push("formal R2+ requires premises and proof");
 if(level>=3&&(!Array.isArray(checks)||checks.length<1))errors.push("R3+ requires a traceable independent review");
 if(level===4&&(!Array.isArray(checks)||checks.length<2))errors.push("R4 requires at least two distinct independent checks");
 if(level===4&&!bilingual(claim.maturity?.adversarial_resolution))errors.push("R4 requires bilingual treatment of the strongest objections");
 if(claim.review_status==="withdrawn"&&level>0)errors.push("withdrawn claims must have R0 maturity");
 const consensus=claim.consensus;
 if(!consensus||!Object.hasOwn(consensusLabels.de,consensus.status)||!bilingual(consensus.note))errors.push("invalid consensus assessment");
 if(!Array.isArray(consensus?.records))errors.push("consensus records must be an array");
 else {
  for(const record of consensus.records){
   if(!["agree","disagree","conditional"].includes(record?.stance)||!https(record.url)||!bilingual(record.context))errors.push("invalid documented position");
  }
  if(consensus.status==="not_assessed"&&consensus.records.length>0)errors.push("unassessed consensus must not contain positions");
  if(consensus.status!=="not_assessed"&&consensus.records.length===0)errors.push("documented consensus/dissent needs traceable positions");
  const stances=new Set(consensus.records.map(r=>r?.stance));
  if(consensus.status==="documented_agreement"&&!stances.has("agree"))errors.push("agreement needs an agreeing position");
  if(consensus.status==="documented_dissent"&&!stances.has("disagree"))errors.push("dissent needs a dissenting position");
  if(consensus.status==="mixed"&&!(stances.has("agree")&&stances.has("disagree")))errors.push("mixed consensus requires agreement and dissent");
 }
 return errors;
}
