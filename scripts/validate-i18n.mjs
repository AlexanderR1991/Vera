import {readFile,readdir,access} from "node:fs/promises";
import {pathToFileURL} from "node:url";
import {ui,navigation} from "../src/lib/ui.mjs";

const source = relative => new URL("../"+relative,import.meta.url);
const read = relative => readFile(source(relative),"utf8");
const readJSON = async relative => JSON.parse(await read(relative));
const has = (object,key) => Object.prototype.hasOwnProperty.call(object,key);
const filled = value => typeof value==="string" ? value.trim().length>0 :
  Array.isArray(value) ? value.length>0 : value!==null && typeof value==="object" ? Object.keys(value).length>0 : value!==undefined && value!==null;
const kind = value => Array.isArray(value)?"array":value===null?"null":typeof value;

export function checkLanguagePairs(value,origin="root"){
 const errors=[];
 function walk(node,path){
  if(Array.isArray(node)){node.forEach((entry,index)=>walk(entry,path+"["+index+"]"));return;}
  if(!node||typeof node!=="object")return;
  const de=has(node,"de"),en=has(node,"en");
  if(de!==en)errors.push(path+": de/en counterpart is missing");
  if(de&&en){
   if(!filled(node.de)||!filled(node.en))errors.push(path+": one language is blank");
   if(kind(node.de)!==kind(node.en))errors.push(path+": de/en have incompatible value types");
  }
  for(const [key,entry] of Object.entries(node))walk(entry,path+"."+key);
 }
 walk(value,origin);
 return errors;
}

export function checkReviewEntry(item,path){
 const errors=[];
 const statuses=["draft","partial","unassessed","shared_bilingual","reviewed"];
 if(!item||typeof item!=="object")return [path+": invalid review entry"];
 if(!statuses.includes(item.status))errors.push(path+": unsupported review status");
 if(item.status==="reviewed"){
  if(!filled(item.reviewer)||!/^20\d\d-\d\d-\d\d$/.test(item.reviewed_at||""))errors.push(path+": human reviewer and date required");
  if(!/^[a-f0-9]{40}$/.test(item.source_commit||""))errors.push(path+": immutable source commit required");
  if(!/^https:\/\/github\.com\//.test(item.review_url||""))errors.push(path+": documented GitHub review URL required");
 }else if(item.reviewer||item.reviewed_at||item.source_commit||item.review_url){
  errors.push(path+": review metadata may not masquerade as approval");
 }
 return errors;
}

export async function checkInternationalization(){
 const errors=[];
 const deFiles=(await readdir(source("src/pages/de"))).filter(x=>x.endsWith(".astro")).sort();
 const enFiles=(await readdir(source("src/pages/en"))).filter(x=>x.endsWith(".astro")).sort();
 if(JSON.stringify(deFiles)!==JSON.stringify(enFiles))errors.push("Localized Astro routes differ between DE and EN");
 const routeFile=await read("src/lib/paths.mjs");
 const match=routeFile.match(/export const slugs=(\[[^;]+\]);/);
 if(!match)errors.push("Cannot inspect legacy localized slugs");
 const legacy=match?JSON.parse(match[1]):[];
 const routes=new Set([...deFiles.filter(x=>x!=="[slug].astro").map(x=>x.replace(/\.astro$/,"")),...legacy]);
 const ledger=await readJSON("public/i18n/review-register.v1.json");
 if(ledger.schema_version!==1||ledger.source_language!=="de"||ledger.target_language!=="en")errors.push("Review register metadata is invalid");
 const listed=Object.keys(ledger.website?.pages||{}).sort();
 if(JSON.stringify(listed)!==JSON.stringify([...routes].sort()))errors.push("Review register does not match all published localized page families");
 for(const [slug,entry] of Object.entries(ledger.website?.pages||{}))errors.push(...checkReviewEntry(entry,"website."+slug));
 for(const slug of legacy){
  if(!(await exists("src/i18n/"+({
   atlas:"atlas",bibliothek:"library","lesestueck-wahrheit":"reading",
   manifest:"manifest",pruefstand:"proof",methode:"method",mitwirken:"contribute"
  })[slug]+".en.json")))errors.push("Translation dictionary missing for "+slug);
 }
 if(!(await exists("src/i18n/home.en.json"))||!(await exists("src/i18n/shared.en.json")))errors.push("Shared/initial translation dictionaries missing");
 if(!(await exists("src/pages/[lang]/spiel/[...karte].astro")))errors.push("Shared bilingual game route missing");
 if(JSON.stringify(Object.keys(ui.de.titles).sort())!==JSON.stringify(Object.keys(ui.en.titles).sort()))errors.push("Navigation title keys differ");
 for(const locale of ["de","en"]){
  for(const [slug,title] of Object.entries(ui[locale].titles)){
   if(!filled(title))errors.push("Missing "+locale+" navigation title for "+slug);
  }
  for(const [slug,index] of navigation){
   if(!filled(ui[locale].nav[index]))errors.push("Missing "+locale+" navigation item for "+slug);
  }
 }
 const jsonFiles=[
  "public/project.json","public/knowledge/claims.json",
  "public/knowledge/questions.json","public/knowledge/everyday-questions.json",
  "public/knowledge/universal-questions.v1.json","public/knowledge/universal-findings.v1.json",
  "public/knowledge/esoterik-tree.json","public/knowledge/art-works.v1.json",
  "public/ai/philosophy-engine.v0.json","public/protocol/self-correction.v1.json",
  "src/lib/mission-copy.json","src/lib/horizon-copy.json","src/lib/love-copy.json",
  "src/lib/policy-copy.json","src/lib/common-ground-copy.json"
 ];
 for(const file of jsonFiles){
  const json=await readJSON(file);
  errors.push(...checkLanguagePairs(json,file));
 }
 const docNames=(await readdir(source("docs"))).filter(x=>x.endsWith(".md")).sort();
 const entries=ledger.documents||{};
 if(JSON.stringify(Object.keys(entries).sort())!==JSON.stringify(docNames))errors.push("Review register does not inventory every top-level philosophical document");
 for(const [name,entry] of Object.entries(entries)){
  errors.push(...checkReviewEntry(entry,"docs/"+name));
  if(!["core","support"].includes(entry.priority))errors.push("Missing documentation priority: "+name);
  if(["draft","reviewed"].includes(entry.status)&&!entry.target)errors.push("Document translation target missing: "+name);
  if(entry.target&&!entry.target.startsWith("docs/"))errors.push("Invalid translation target: "+name);
  if(entry.target&&!(await exists(entry.target)))errors.push("Translation document does not exist: "+entry.target);
 }
 if(!(await exists("docs/en/README.md"))||!(await exists("docs/i18n-glossary.md")))errors.push("International documentation entry/glossary missing");
 return errors;
}
async function exists(relative){try{await access(source(relative));return true;}catch{return false;}}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const errors=await checkInternationalization();
 if(errors.length){console.error("Internationalization validation failed:\n"+errors.join("\n"));process.exitCode=1;}
 else console.log("DE/EN structural parity, published data pairs and translation review ledger validated. No semantic translation approval implied.");
}
