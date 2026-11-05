import {access,readFile} from "node:fs/promises";
import {join} from "node:path";
import {fields,topics,topicStates,selfReviews} from "../src/lib/tree.mjs";
const out=join(process.cwd(),"dist"),slugs=["index","kunst-und-erkenntnis","mission","baum-des-wissens","aussagen","fragen-und-ki-prompt","forschungsstrom","atlas","bibliothek","lesestueck-wahrheit","manifest","pruefstand","methode","mitwirken","erkenntnishorizont","warum-liebe-wirkt","politik-die-dem-menschen-dient","bruecken-zwischen-den-religionen","militaer-und-verantwortung","ernaehrung-und-verantwortung","angriffsschwarm"],errors=[];
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

// Liber Custodiae: bilingual route, legal boundaries, counterpositions, research and discovery.
for(const lang of ["de","en"]){
 const chapter=await readFile(join(out,lang,"militaer-und-verantwortung","index.html"),"utf8");
 for(const token of ["mil-hero","mil-principles","mil-exam","mil-sources","m-a","m-d","un.org/en/about-us/un-charter/full-text","icrc.org"]){
  if(!chapter.includes(token))errors.push("Military chapter "+lang+" lacks "+token);
 }
 for(const slug of ["index","atlas","bibliothek","pruefstand"]){
  const html=await readFile(join(out,lang,...(slug==="index"?[]:[slug]),"index.html"),"utf8");
  if(!html.includes("military-teaser")||!html.includes("/"+lang+"/militaer-und-verantwortung/"))errors.push("Missing military discovery "+lang+"/"+slug);
 }
}
if(errors.length){console.error(errors.join("\\n"));process.exit(1);}

// Public adversarial review log in both languages.
for(const lang of ["de","en"]){
 const p=await readFile(join(out,lang,"angriffsschwarm","index.html"),"utf8");
 for(const v of ["attack-live","angriffe.json","issues/new?template=angriff.yml"]){
  if(!p.includes(v))errors.push("Adversarial page "+lang+" lacks "+v);
 }
}
if(errors.length){console.error(errors.join("\\n"));process.exit(1);}


// Liber Alimenti: bilingual nutrition, sources, countermodels and editorial discovery.
for(const lang of ["de","en"]){
 const chapter=await readFile(join(out,lang,"ernaehrung-und-verantwortung","index.html"),"utf8");
 for(const token of ["nut-hero","nut-grid","nut-exam","nut-sources","e-a","e-d","who.int/news-room/fact-sheets/detail/healthy-diet","dge.de/"]){
  if(!chapter.includes(token))errors.push("Nutrition chapter "+lang+" lacks "+token);
 }
 for(const slug of ["index","atlas","bibliothek","pruefstand"]){
  const html=await readFile(join(out,lang,...(slug==="index"?[]:[slug]),"index.html"),"utf8");
  if(!html.includes("nutrition-teaser")||!html.includes("/"+lang+"/ernaehrung-und-verantwortung/"))
   errors.push("Nutrition discovery missing from "+lang+"/"+slug);
 }
}
if(errors.length){console.error(errors.join("\n"));process.exit(1);}

// Mission routes and the register must remain discoverable in both languages.
const registry=JSON.parse(await readFile("public/knowledge/claims.json","utf8"));
const exported=JSON.parse(await readFile(join(out,"knowledge/claims.json"),"utf8"));
if(JSON.stringify(registry)!==JSON.stringify(exported))errors.push("Register export differs from the rendered source");
const sitemap=await readFile(join(out,"sitemap.xml"),"utf8");
for(const lang of ["de","en"]){
 const home=await readFile(join(out,lang,"index.html"),"utf8");
 const mission=await readFile(join(out,lang,"mission/index.html"),"utf8");
 const register=await readFile(join(out,lang,"aussagen/index.html"),"utf8");
 for(const slug of ["mission","aussagen","fragen-und-ki-prompt"]){
  const route="/grundtext-des-wirklichen/"+lang+"/"+slug+"/";
  if(!home.includes(route)||!sitemap.includes(route))errors.push("Undiscoverable route "+route);
 }
 for(const c of registry.claims){
  if(!register.includes('id="'+c.id+'"')||!register.includes(c.statement[lang]))errors.push("Missing rendered claim "+lang+"/"+c.id);
 }
 for(const id of ["forschung","bauplan","erkenntnis","entscheidungen","ki","versorgung","stand"]){
  if(!mission.includes('id="'+id+'"'))errors.push("Missing mission anchor "+lang+"/"+id);
 }
 for(const [page,html] of [["home",home],["mission",mission],["register",register]]){
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  if(new Set(ids).size!==ids.length)errors.push("Duplicate anchor on "+lang+"/"+page);
  if(!html.includes('<h1'))errors.push("Missing main heading on "+lang+"/"+page);
 }
}
if(errors.length){console.error(errors.join("\n"));process.exit(1);}
// The tree must preserve multiple memberships and distinguish live drafts,
// linked proposals and undeveloped fields in the initial server-rendered HTML.
const fieldIDs=new Set(fields.map(f=>f.id)),topicIDs=new Set();
for(const topic of topics){
 if(topicIDs.has(topic.id))errors.push("Duplicate tree topic "+topic.id);
 topicIDs.add(topic.id);
 if(!topic.fields.length||!topic.fields.every(id=>fieldIDs.has(id)))errors.push("Unknown tree field on "+topic.id);
 if(!Object.hasOwn(topicStates,topic.state))errors.push("Unknown tree state on "+topic.id);
 if(topic.state==="draft"&&(!topic.slug||topic.url))errors.push("Draft topic needs a local chapter: "+topic.id);
 if(topic.state==="proposed"&&(!/^https:\/\/github\.com\/AlexanderR1991\/grundtext-des-wirklichen\/pull\/\d+$/.test(topic.url)||topic.slug))errors.push("Proposal needs its actual PR: "+topic.id);
 if(topic.state==="open"&&(topic.slug||topic.url))errors.push("Undeveloped topic must not imply a chapter: "+topic.id);
 for(const lang of ["de","en"]){
  if(!topic.name[lang]?.trim()||!topic.question[lang]?.trim())errors.push("Missing topic translation "+topic.id+"/"+lang);
 }
}
for(const lang of ["de","en"]){
 const tree=await readFile(join(out,lang,"baum-des-wissens/index.html"),"utf8");
 for(const topic of topics){
  const row=tree.match(new RegExp('<tr[^>]*id="ast-'+topic.id+'"[^>]*>'))?.[0];
  if(!row||/\shidden(?:[\s=>])/.test(row)||!row.includes('data-state="'+topic.state+'"'))errors.push("Topic unavailable without JS "+topic.id+"/"+lang);
  if(topic.state==="draft"){
   try{await access(join(out,lang,topic.slug,"index.html"));}catch{errors.push("Tree draft destination missing "+topic.slug);}
  }
  if(topic.state==="proposed"&&!tree.includes(topic.url))errors.push("Missing PR destination "+topic.id);
 }
 for(const review of selfReviews){if(!tree.includes(review.url))errors.push("Missing public self-review "+review.id);}
 const ids=[...tree.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 if(new Set(ids).size!==ids.length)errors.push("Duplicate tree anchor "+lang);
 if(!sitemap.includes('/'+lang+'/baum-des-wissens/'))errors.push("Tree absent from sitemap "+lang);
 for(const slug of ["index","atlas","bibliothek","methode","pruefstand","mitwirken"]){
  const html=await readFile(join(out,lang,...(slug==="index"?[]:[slug]),"index.html"),"utf8");
  if(!html.includes('class="tree-bridge container"'))errors.push("Missing tree entry "+lang+"/"+slug);
 }
 for(const slug of ["manifest","pruefstand"]){
  const html=await readFile(join(out,lang,slug,"index.html"),"utf8");
  if(!html.includes(lang==="de"?"Auch dauerhafte Unterstützung ist wertvoll.":"Lasting support is valuable too."))errors.push("Care clarification missing "+lang+"/"+slug);
  if(lang==="de"&&html.includes("bessere Menschen"))errors.push("Old human-ranking wording remains "+slug);
 }
}
if(errors.length){console.error(errors.join("\n"));process.exit(1);}
console.log(`Verified ${slugs.length*2} localized pages, mission navigation, register export, tree memberships, proposal status, no-JS content and thesis consistency.`);

// Workshop: both interactive routes, usable static content and discovery paths.
for (const lang of ["de", "en"]) {
 const route = `/grundtext-des-wirklichen/${lang}/esoterik-und-mathematik/`;
 const html = await readFile(join(out, lang, "esoterik-und-mathematik/index.html"), "utf8");
 for (const token of ['data-symbol-lab', 'data-worksheet', 'data-statistics', '<noscript>', 'data-binary-word', 'data-download="json"', 'data-download="txt"', 'rel="canonical"', 'hreflang="de"', 'hreflang="en"']) {
  if (!html.includes(token)) errors.push(`Workshop ${lang} lacks ${token}`);
 }
 if ((html.match(/data-state="\d+"/g) || []).length !== 64) errors.push(`Workshop ${lang} must show 64 patterns`);
 if ((html.match(/data-line="\d+"/g) || []).length !== 6) errors.push(`Workshop ${lang} must have six line controls`);
 if (!html.includes(`<html lang="${lang}"`) || html.includes('<title>undefined')) errors.push(`Workshop ${lang} metadata invalid`);
 for (const slug of ["index", "atlas", "bibliothek", "pruefstand", "methode", "erkenntnishorizont"]) {
  const page = await readFile(join(out, lang, ...(slug === 'index' ? [] : [slug]), 'index.html'), 'utf8');
  if (!page.includes(route)) errors.push(`Workshop not discoverable from ${lang}/${slug}`);
 }
 const sitemap = await readFile(join(out, 'sitemap.xml'), 'utf8');
 if (!sitemap.includes(route)) errors.push(`Workshop ${lang} missing from sitemap`);
}
if(errors.length){console.error(errors.join("\n"));process.exit(1);}
console.log('Verified symbol/mathematics workshop: bilingual routes, 64 states, six controls, exports and discovery.');
