import {readFile,mkdir,writeFile,copyFile} from "node:fs/promises";
import path from "node:path";
const root=process.cwd();
const base="/grundtext-des-wirklichen/";
const names=["index","atlas","bibliothek","lesestueck-wahrheit","manifest","pruefstand","methode","mitwirken"];
const mapping={index:"home",atlas:"atlas",bibliothek:"library","lesestueck-wahrheit":"reading",manifest:"manifest",pruefstand:"proof",methode:"method",mitwirken:"contribute"};
const allowed=new Set(["VERITAS","HUMANITAS","I · PRINCIPIUM","QUESTIO PRIMA","LIBER MUNDI / I","BIBLIOTHECA / II","LIBER PRIMUS","VERITAS ET QUAESTIO","I / IV","II / IV","III / IV","IV / IV"]);
const get=f=>readFile(path.join(root,f),"utf8");
const dictionaries={};
for(const name of ["shared","home","atlas","library","reading","manifest","proof","method","contribute"]){
  dictionaries[name]=JSON.parse(await get("src/i18n/"+name+".en.json"));
}
const convertLinks=(text,lang)=>text.replace(/\bhref="(index|atlas|bibliothek|lesestueck-wahrheit|manifest|pruefstand|methode|mitwirken)\.html(#[^"]*)?"/g,(_,slug,hash="")=>
  'href="'+base+lang+"/"+(slug==="index"?"":slug+"/")+hash+'"');
function translate(html,kind){
 const dictionary={...dictionaries.shared,...dictionaries.home,...dictionaries[kind]};
 const missing=new Set();
 let result=html.replace(/>([^<>]+)</g,(match,node)=>{
   const key=node.trim();
   if(!key)return match;
   if(Object.hasOwn(dictionary,key)){
     const offset=node.indexOf(key);
     return ">"+node.slice(0,offset)+dictionary[key]+node.slice(offset+key.length)+"<";
   }
   if(/[A-Za-zÄÖÜäöüß]/.test(key)&&!allowed.has(key))missing.add(key);
   return match;
 });
 if(missing.size)throw Error(kind+" contains untranslated text: "+[...missing].join(" | "));
 for(const [a,b] of [
   ["Sechs miteinander verbundene Erkenntnisfelder","Six connected fields of inquiry"],
   ["Thematische Filter","Topic filters"],["Thesen filtern","Filter theses"],
   ["Zum Beispiel: Zelle, Freiheit, Bewusstsein …","For example: cells, freedom, consciousness…"],
   ["z. B. These 08 oder Lesestück 01","e.g., Thesis 08 or Essay 01"],
   ["Welche Aussage möchtest du prüfen? Was spricht dafür oder dagegen?","Which claim would you like to examine? What speaks for or against it?"]
 ])result=result.replaceAll(a,b);
 if(kind==="atlas"){
   const terms={
    wirklichkeit:"reality observation causality mathematics philosophy of science",
    leben:"life cells evolution homeostasis emergence",
    bewusstsein:"consciousness perception self-model attention phenomenology",
    mensch:"humanity instinct body attachment learning emotion behavior self-regulation",
    gesellschaft:"society cooperation power culture conflict",
    handeln:"action ethics responsibility dignity freedom correction care"
   };
   result=result.replace(/(<article class="atlas-card"[^>]*id="([^"]+)"[^>]*?)data-search="[^"]*"/g,(_,p,id)=>p+'data-search="'+(terms[id]||"")+'"');
 }
 return result;
}
for(const name of names){
 const html=await get(name+".html");
 const begin='<main id="inhalt">',start=html.indexOf(begin),end=html.indexOf("</main>",start);
 if(start<0||end<0)throw Error("Missing main in "+name);
 const body=html.slice(start+begin.length,end);
 const de=convertLinks(body.replaceAll("VOLUME 0.2","VOLUME 0.3").replaceAll("ARBEITSFASSUNG 0.2","ARBEITSFASSUNG 0.3"),"de");
 const en=convertLinks(translate(body,mapping[name]),"en");
 for(const [lang,text] of [["de",de],["en",en]]){
   const file=path.join(root,"src/generated/pages",lang,name+".html");
   await mkdir(path.dirname(file),{recursive:true});await writeFile(file,text,"utf8");
 }
}
await mkdir("public/assets",{recursive:true});
await copyFile("assets/signet.svg","public/assets/signet.svg");
await writeFile("public/assets/style.css",(await get("assets/style.css"))+"\n"+(await get("src/styles/i18n.css")),"utf8");
await copyFile("src/client/site.js","public/assets/site.js");
await writeFile("public/.nojekyll","","utf8");
for(const name of names.filter(n=>n!=="index")){
 const route="./de/"+name+"/";
 const html='<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url='+route+'"><title>Weiterleitung / Redirect</title></head><body><a href="'+route+'">Deutsch</a> · <a href="./en/'+name+'/">English</a><script>location.replace('+JSON.stringify(route)+'+location.hash)</script></body></html>';
 await writeFile("public/"+name+".html",html,"utf8");
}
console.log("Prepared 16 translated page bodies, assets and seven legacy redirects.");
