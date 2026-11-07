// Universal questions are unreviewed editorial synthesis, not a verified truth graph.
// Human-reviewed findings remain a separate object from questions and lexical scan hints.
export const supportedQuestionTypes=new Set(["empirical","methodological","normative","mixed","formal","interpretative"]);
export const supportedRelationTypes=new Set(["related_to","depends_on","alternative_framing","subquestion_of"]);
export const supportedThemes=new Set(["knowledge","experience","relations","power","agency","systems","uncertainty"]);
const validId=x=>typeof x==="string"&&/^U-[0-9]{3,}$/.test(x);
const bilingual=x=>x&&typeof x==="object"&&["de","en"].every(lang=>typeof x[lang]==="string"&&x[lang].trim().length>0);
const unique=a=>new Set(a).size===a.length;
const strings=a=>Array.isArray(a)&&a.every(v=>typeof v==="string"&&v.trim());

export function questionsForRoute(catalogue,route,limit=3){
 return catalogue.questions.filter(q=>q.return_routes.includes(route)).slice(0,limit);
}
export function findingsForRoute(catalogue,ledger,route){
 const allowed=new Set(catalogue.questions.filter(q=>q.return_routes.includes(route)).map(q=>q.id));
 return ledger.findings.filter(f=>f.status==="reviewed"&&allowed.has(f.question_id)&&f.return_routes.includes(route));
}
export function findingsForQuestion(ledger,id){
 return ledger.findings.filter(f=>f.status==="reviewed"&&f.question_id===id);
}
export function validateUniversal(catalogue,ledger,topicIds,routeIds,sourcePaths,atlasIds=[]){
 const errors=[];
 const check=(ok,msg)=>{if(!ok)errors.push(msg);};
 check(catalogue?.schema_version===1,"Catalog schema_version must be 1");
 check(ledger?.schema_version===1,"Findings schema_version must be 1");
 check(/^[a-f0-9]{40}$/.test(catalogue?.source_revision??""),"Catalog requires a traceable source revision");
 check(catalogue?.status==="unreviewed_editorial_cross_domain_synthesis","Catalog must not claim external review");
 check(bilingual(catalogue?.scope)&&bilingual(catalogue?.method),"Scope and method must be bilingual");
 check(Array.isArray(catalogue?.questions),"Questions must be an array");
 check(Array.isArray(catalogue?.relations),"Relations must be an array");
 check(Array.isArray(ledger?.findings),"Findings must be an array");
 if(!Array.isArray(catalogue?.questions)||!Array.isArray(catalogue?.relations)||!Array.isArray(ledger?.findings))return errors;
 const questions=new Map(), ids=[];
 for(const q of catalogue.questions){
   const id=q?.id;
   check(validId(id),"Bad universal question ID: "+id);
   check(!questions.has(id),"Duplicate question ID: "+id);
   questions.set(id,q);ids.push(id);
   check(q.version===1&&q.origin==="editorial_synthesis"&&q.review_status==="unreviewed","Invalid question provenance/status: "+id);
   check(q.answer_status==="open","Catalog answer status must remain open; findings are separate: "+id);
   check(bilingual(q.question)&&bilingual(q.why)&&bilingual(q.challenge),"Question, reason and challenge must be bilingual: "+id);
   check(supportedQuestionTypes.has(q.question_type)&&supportedThemes.has(q.theme),"Unknown type or theme: "+id);
   check(strings(q.topics)&&q.topics.length>=2&&unique(q.topics)&&q.topics.every(t=>topicIds.has(t)),"Question must link distinct known topics: "+id);
   check(strings(q.source_paths)&&q.source_paths.length>=2&&unique(q.source_paths)&&q.source_paths.every(p=>/^docs\/[A-Za-z0-9äöüÄÖÜß._/-]+\.md$/.test(p)&&sourcePaths.has(p)),"Question sources must exist and be distinct public documents: "+id);
   check(strings(q.return_routes)&&q.return_routes.length>=2&&unique(q.return_routes)&&q.return_routes.every(p=>routeIds.has(p)&&!["impressum","datenschutz"].includes(p)),"Invalid answer return destinations: "+id);
   check(strings(q.related_atlas_ids)&&unique(q.related_atlas_ids)&&q.related_atlas_ids.every(id=>atlasIds.includes(id)),"Invalid existing atlas link: "+id);
   check(strings(q.lexical_signals)&&q.lexical_signals.length>=2&&unique(q.lexical_signals),"Signals must be distinct strings: "+id);
 }
 check(ids.length>0,"Empty universal question corpus");
 const edgeKeys=new Set(),dependency=new Map();
 for(const r of catalogue.relations){
   const edgeKey=r?.from+"|"+r?.to+"|"+r?.type;
   check(!edgeKeys.has(edgeKey),"Duplicate universal relation: "+edgeKey);edgeKeys.add(edgeKey);
   check(questions.has(r.from)&&questions.has(r.to)&&r.from!==r.to,"Invalid relation endpoints: "+edgeKey);
   check(supportedRelationTypes.has(r.type)&&bilingual(r.reason),"Invalid relation type/reason: "+edgeKey);
   if(["depends_on","subquestion_of"].includes(r.type)){const edges=dependency.get(r.from)||[];edges.push(r.to);dependency.set(r.from,edges);}
 }
 const visiting=new Set(),visited=new Set();
 function walk(id){
   if(visiting.has(id)){errors.push("Cycle in dependency relation at "+id);return;}
   if(visited.has(id))return;
   visiting.add(id);
   for(const next of dependency.get(id)||[])walk(next);
   visiting.delete(id);visited.add(id);
 }
 for(const id of questions.keys())walk(id);
 const findingIds=new Set();
 for(const f of ledger.findings){
   check(typeof f.id==="string"&&/^UF-[0-9]{3,}$/.test(f.id)&&!findingIds.has(f.id),"Invalid or duplicate finding ID: "+f.id);
   findingIds.add(f.id);
   const q=questions.get(f.question_id);
   check(!!q,"Finding references unknown question: "+f.id);
   check(f.status==="reviewed"&&Number.isInteger(f.version)&&f.version>=1,"Only reviewed versioned findings may be published: "+f.id);
   check(bilingual(f.answer)&&bilingual(f.scope)&&bilingual(f.dissent)&&bilingual(f.revision_condition),"Finding must include bilingual answer, scope, dissent and revision trigger: "+f.id);
   check(supportedQuestionTypes.has(f.claim_type),"Finding must identify its claim type: "+f.id);
   check(typeof f.reviewer==="string"&&f.reviewer.trim().length>2&&f.reviewer!=="AI","Finding requires an accountable human reviewer: "+f.id);
   check(/^20\d\d-\d\d-\d\d$/.test(f.reviewed_at??""),"Finding needs a review date: "+f.id);
   check(/^[a-f0-9]{40}$/.test(f.source_commit??""),"Finding requires an immutable source commit: "+f.id);
   check(/^https:\/\/github\.com\/[A-Za-z0-9-]+\/[A-Za-z0-9_.-]+\/pull\/\d+$/.test(f.review_url??""),"Finding requires a traceable PR review: "+f.id);
   check(strings(f.evidence_paths)&&f.evidence_paths.length>0&&unique(f.evidence_paths)&&f.evidence_paths.every(p=>sourcePaths.has(p)),"Finding evidence references unavailable public documents: "+f.id);
   check(strings(f.return_routes)&&f.return_routes.length>0&&unique(f.return_routes)&&f.return_routes.every(r=>q?.return_routes.includes(r)),"Finding may return only to its question's listed routes: "+f.id);
 }
 if(!ledger.findings.length)check(ledger.status==="no_independently_reviewed_findings","Empty findings must be described as no independently reviewed findings");
 return errors;
}
