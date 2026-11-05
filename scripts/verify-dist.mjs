import {access,readFile} from "node:fs/promises";
import {join} from "node:path";
const out=join(process.cwd(),"dist"),slugs=["index","atlas","bibliothek","lesestueck-wahrheit","manifest","pruefstand","methode","mitwirken","erkenntnishorizont","warum-liebe-wirkt","politik-die-dem-menschen-dient","bruecken-zwischen-den-religionen"],errors=[];
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
console.log("Verified 22 localized pages, canonical/hreflang, legacy redirect assets and key translations.");

for(const lang of ["de","en"]){
 const chapter=await readFile(join(out,lang,"erkenntnishorizont","index.html"),"utf8");
 if(!chapter.includes("horizon-diagram")||!chapter.includes("x₄")){console.error("Missing accessible horizon illustration for "+lang);process.exit(1);}
}

// Research chapter integrity checks: both languages, claims, sources,
// opposing perspectives and links in the shared editorial navigation.
for(const lang of ["de","en"]){
 const chapter=await readFile(join(out,lang,"warum-liebe-wirkt","index.html"),"utf8");
 for(const token of ["love-figure","love-hypothesis-grid","love-counter__grid","10.1371/journal.pmed.1000316","10.1177/1088868314544222"]){
   if(!chapter.includes(token))errors.push("Love chapter "+lang+" lacks "+token);
 }
 const portal=await readFile(join(out,lang,"index.html"),"utf8");
 const library=await readFile(join(out,lang,"bibliothek","index.html"),"utf8");
 if(!portal.includes("/"+lang+"/warum-liebe-wirkt/"))errors.push("Missing home teaser for "+lang);
 if(!library.includes("/"+lang+"/warum-liebe-wirkt/"))errors.push("Missing library teaser for "+lang);
}
if(errors.length){console.error(errors.join("\n"));process.exit(1);}


// Liber Civitatis: evidence, counter-arguments, civic hypotheses,
// reciprocal routes and editorial discovery links in both languages.
for(const lang of ["de","en"]){
 const chapter=await readFile(join(out,lang,"politik-die-dem-menschen-dient","index.html"),"utf8");
 for(const token of ["civitas-figure","civitas-rights","civitas-tradeoffs","civitas-hypothesis-grid",
    "civitas-counter__grid","oecd.org/en/topics/ai-principles.html","gesetze-im-internet.de"]){
   if(!chapter.includes(token))errors.push("Civic chapter "+lang+" lacks "+token);
 }
 for(const [slug,required] of [["index","civitas-teaser"],["bibliothek","civitas-teaser"],
    ["atlas","civitas-teaser"],["pruefstand","civitas-teaser"]]){
   const location=join(out,lang,...(slug==="index"?[]:[slug]),"index.html");
   const html=await readFile(location,"utf8");
   if(!html.includes("/"+lang+"/politik-die-dem-menschen-dient/")||!html.includes(required))
     errors.push("Missing political chapter discovery from "+lang+"/"+slug);
 }
}
if(errors.length){console.error(errors.join("\n"));process.exit(1);}

for(const lang of ["de","en"]){
 const chapter=await readFile(join(out,lang,"bruecken-zwischen-den-religionen","index.html"),"utf8");
 for(const token of ["theology-hero","theology-principles","theology-boundary"]){
  if(!chapter.includes(token))errors.push("Theology "+lang+" missing "+token);
 }
 if(!chapter.includes(lang==="de"?"WIR BAUEN BRÜCKEN":"WE BUILD BRIDGES"))
  errors.push("Theology manifesto missing for "+lang);
 for(const slug of ["index","atlas","bibliothek","pruefstand"]){
  const html=await readFile(join(out,lang,...(slug==="index"?[]:[slug]),"index.html"),"utf8");
  if(!html.includes("theology-teaser")||!html.includes("/"+lang+"/bruecken-zwischen-den-religionen/"))
    errors.push("Theology teaser missing from "+lang+"/"+slug);
 }
}
if(errors.length){console.error(errors.join("\n"));process.exit(1);}
