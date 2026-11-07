import {readFile,readdir} from "node:fs/promises";
import {fileURLToPath} from "node:url";
import path from "node:path";
import {topics} from "../src/lib/tree.mjs";
import {validateUniversal} from "../src/lib/universal-questions.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=async file=>JSON.parse(await readFile(path.join(root,file),"utf8"));
export async function checkUniversal(){
 const [catalogue,ledger,atlas,translation]=await Promise.all([
  read("public/knowledge/universal-questions.v1.json"),read("public/knowledge/universal-findings.v1.json"),
  read("public/knowledge/questions.json"),read("public/i18n/review-register.v1.json")]);
 const docFiles=(await readdir(path.join(root,"docs"))).filter(x=>x.endsWith(".md")).map(x=>"docs/"+x);
 const errors=validateUniversal(catalogue,ledger,
  new Set(topics.map(t=>t.id)),new Set(Object.keys(translation.website.pages)),
  new Set(docFiles),atlas.questions.map(q=>q.id));
 try{
  const scan=await read("public/research/universal-scan.v1.json");
  if(scan.status!=="automatic_lexical_scan_unreviewed")errors.push("Scan must remain marked as an unreviewed lexical report");
  if(scan.source_revision!==catalogue.source_revision)errors.push("Scan/catalogue source revisions differ");
  if(scan.questions?.length!==catalogue.questions.length)errors.push("Scan must report all catalogued lenses");
  if(scan.corpus?.file_count<docFiles.length)errors.push("Scan has not covered all top-level public docs");
  const scanDocs=new Set(scan.corpus.files.map(f=>f.path));
  for(const file of docFiles)if(!scanDocs.has(file))errors.push("Missing source in scan: "+file);
 }catch(e){errors.push("Missing or unreadable generated public scan: "+String(e));}
 return errors;
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===path.resolve(process.argv[1])){
 const errors=await checkUniversal();
 if(errors.length){console.error("Universal questions validation failed:\n"+errors.join("\n"));process.exitCode=1;}
 else console.log("Universal questions: bilingual metadata, sources, routes, relations, revision and full top-level docs coverage validated. No evidence or truth certified.");
}
