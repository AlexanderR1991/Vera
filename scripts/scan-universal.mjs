// Reproducible lexical coverage scan of published, public text sources.
// NOT a semantic AI run or an automatic generator of verified answers.
import {readFile,readdir,mkdir,writeFile} from "node:fs/promises";
import path from "node:path";
import {createHash} from "node:crypto";
import {fileURLToPath} from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=relative=>readFile(path.join(root,relative),"utf8");
const isFile=e=>e.isFile();
async function selectedSources(){
  // Recursively include public authorial docs, excluding archived book material
  // and separate translation copies that must not count as independent sources.
  async function walkDocs(relative){
    const entries=await readdir(path.join(root,relative),{withFileTypes:true});
    const result=[];
    for(const e of entries){
      if(e.isDirectory()&& !["archiv","en"].includes(e.name)){
        result.push(...await walkDocs(relative+"/"+e.name));
      } else if(isFile(e)&&e.name.endsWith(".md")) result.push(relative+"/"+e.name);
    }
    return result;
  }
  const docs=await walkDocs("docs");
  // Bilingual translations and the archived book are excluded to avoid double-counting evidence.
  const components=(await readdir(path.join(root,"src/components"),{withFileTypes:true})).filter(e=>isFile(e)&&e.name.endsWith(".astro")).map(e=>"src/components/"+e.name);
  const copies=(await readdir(path.join(root,"src/lib"),{withFileTypes:true})).filter(e=>isFile(e)&&/-copy\.json$/.test(e.name)).map(e=>"src/lib/"+e.name);
  const staticPages=(await readdir(root,{withFileTypes:true})).filter(e=>isFile(e)&&e.name.endsWith(".html")).map(e=>e.name);
  return [...new Set(["README.md",...docs,...components,...copies,...staticPages,
    "public/knowledge/claims.json","public/knowledge/questions.json","public/knowledge/everyday-questions.json",
    "public/knowledge/esoterik-tree.json","public/ai/philosophy-engine.v0.json",
    "public/protocol/self-correction.v1.json"])].sort();
}
const normalize=text=>text.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"");
export async function buildUniversalScan(){
 const catalog=JSON.parse(await read("public/knowledge/universal-questions.v1.json"));
 const names=await selectedSources();
 const corpus=await Promise.all(names.map(async file=>{
   const content=await read(file);
   return {path:file,content:normalize(content),
     sha256:createHash("sha256").update(content).digest("hex"),bytes:Buffer.byteLength(content,"utf8")};
 }));
 const questions=catalog.questions.map(q=>{
   const signals=q.lexical_signals.map(normalize);
   const matches=corpus.map(item=>{
     const matched=signals.filter(signal=>item.content.includes(signal));
     return {path:item.path,signals:matched};
   }).filter(x=>x.signals.length>=2);
   return {id:q.id,kind:"lexical_hint_only",total_matching_files:matches.length,
     sample_files:matches.slice(0,12),source_paths:q.source_paths,
     note:"Co-occurring strings do not establish a semantic relationship or a correct answer."};
 });
 // Suggested links are a REVIEW QUEUE ONLY: lexical overlap is not a verified relation.
 const related=[];
 for(let a=0;a<questions.length;a++)for(let b=a+1;b<questions.length;b++){
   const A=questions[a],B=questions[b];
   const aFiles=new Set(A.sample_files.map(x=>x.path));
   const both=B.sample_files.filter(x=>aFiles.has(x.path)).map(x=>x.path);
   if(both.length>=2)related.push({from:A.id,to:B.id,shared_sample_files:both.slice(0,5),status:"needs_human_triage"});
 }
 related.sort((a,b)=>b.shared_sample_files.length-a.shared_sample_files.length||a.from.localeCompare(b.from)||a.to.localeCompare(b.to));
 return {
   schema_version:1,source_revision:catalog.source_revision,catalogue_version:"v1",status:"automatic_lexical_scan_unreviewed",
   excludes:["docs/en translations (not independent evidence)","docs/archiv historical texts (not current project position)","private data and unpublished conversations","binary assets","source-code implementation as independent philosophical evidence"],
   limitations:"Covers selected current public document and page sources, including all top-level docs/*.md; no language model or semantic proof is invoked. Keyword co-occurrence can generate false positives and miss real relations.",
   corpus:{file_count:corpus.length,total_bytes:corpus.reduce((s,x)=>s+x.bytes,0),
     files:corpus.map(({path,sha256,bytes})=>({path,sha256,bytes}))},
   questions,
   possible_cross_links:related.slice(0,30),
   next_step:"Human editors inspect complete passages and propose changed IDs, reasons and domain routes via pull requests. No automatic issue posting or answer publication."
 };
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===path.resolve(process.argv[1])){
 const data=await buildUniversalScan();
 if(process.argv.includes("--write")){
   const dest=path.join(root,"public/research/universal-scan.v1.json");
   await mkdir(path.dirname(dest),{recursive:true});await writeFile(dest,JSON.stringify(data,null,2)+"\n","utf8");
 }
 console.log("Universal lexical scan: "+data.corpus.file_count+" public text sources / "+
   data.corpus.total_bytes+" bytes / "+data.questions.length+" question lenses / "+
   data.possible_cross_links.length+" suggested links. Unreviewed; no autonomous AI or answers.");
 if(!process.argv.includes("--write"))console.log(JSON.stringify({corpus:data.corpus.file_count,lenses:data.questions.length,links:data.possible_cross_links.length},null,2));
}
