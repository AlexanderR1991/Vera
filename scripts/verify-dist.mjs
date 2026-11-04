import {access,readFile} from "node:fs/promises";
import {join} from "node:path";
const out=join(process.cwd(),"dist"),slugs=["index","atlas","bibliothek","lesestueck-wahrheit","manifest","pruefstand","methode","mitwirken"],errors=[];
for(const lang of ["de","en"]){
 for(const slug of slugs){
  const file=join(out,lang,...(slug==="index"?[]:[slug]),"index.html");
  let html;try{html=await readFile(file,"utf8");}catch{errors.push("Missing "+file);continue;}
  if(!html.includes('<html lang="'+lang+'"'))errors.push("Wrong language in "+file);
  if(!html.includes('hreflang="de"')||!html.includes('hreflang="en"'))errors.push("Missing alternate languages in "+file);
  if(!html.includes('rel="canonical"'))errors.push("Missing canonical "+file);
  if(!html.includes('/grundtext-des-wirklichen/de/')||!html.includes('/grundtext-des-wirklichen/en/'))errors.push("Wrong locale URLs "+file);
  if(!html.includes("assets/style.css"))errors.push("Missing CSS reference "+file);
 }
}
for(const file of ["index.html","atlas.html","methode.html","assets/style.css","assets/site.js","assets/signet.svg","sitemap.xml"]){
 try{await access(join(out,file));}catch{errors.push("Missing built file "+file);}
}
try{
 const en=await readFile(join(out,"en/manifest/index.html"),"utf8");
 const de=await readFile(join(out,"de/manifest/index.html"),"utf8");
 if(!en.includes("Reality is under no obligation")||!de.includes("Die Wirklichkeit ist nicht verpflichtet"))errors.push("Critical thesis mismatch");
}catch{errors.push("Missing thesis pages");}
if(errors.length){console.error(errors.join("\n"));process.exit(1);}
console.log("Verified 16 localized pages, canonical/hreflang, legacy redirect assets and key translations.");
