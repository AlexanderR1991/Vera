import {access,readFile,readdir} from "node:fs/promises";
import {join} from "node:path";
import {fields,topics,topicStates,selfReviews} from "../src/lib/tree.mjs";
const out=join(process.cwd(),"dist"),slugs=["index","projektobservatorium","kunst-und-erkenntnis","mission","regelkreis","ki-und-mensch","kollektive-moral","baum-des-wissens","aussagen","forum","fragen-und-ki-prompt","forschungsstrom","atlas","bibliothek","lesestueck-wahrheit","manifest","pruefstand","methode","mitwirken","erkenntnishorizont","warum-liebe-wirkt","politik-die-dem-menschen-dient","bruecken-zwischen-den-religionen","militaer-und-verantwortung","medizin","ernaehrung-und-verantwortung","angriffsschwarm"],errors=[];
for(const lang of ["de","en"]){
 for(const slug of slugs){
  const file=join(out,lang,...(slug==="index"?[]:[slug]),"index.html");
  let html;try{html=await readFile(file,"utf8");}catch{errors.push("Missing "+file);continue;}
  if(!html.includes('<html lang="'+lang+'"'))errors.push("Wrong language in "+file);
  if(!html.includes('hreflang="de"')||!html.includes('hreflang="en"'))errors.push("Missing alternate languages in "+file);
  if(!html.includes('rel="canonical"'))errors.push("Missing canonical "+file);
  if(!html.includes('/Wirklich/de/')||!html.includes('/Wirklich/en/'))errors.push("Wrong locale URLs "+file);
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
}
if(errors.length){console.error(errors.join("\n"));process.exit(1);}

for(const lang of ["de","en"]){
 const chapter=await readFile(join(out,lang,"bruecken-zwischen-den-religionen","index.html"),"utf8");
 for(const token of ["theology-hero","theology-principles","theology-boundary"]){
  if(!chapter.includes(token))errors.push("Theology "+lang+" missing "+token);
 }
 if(!chapter.includes(lang==="de"?"WIR BAUEN BRÜCKEN":"WE BUILD BRIDGES"))
  errors.push("Theology manifesto missing for "+lang);
}
if(errors.length){console.error(errors.join("\n"));process.exit(1);}

// Liber Custodiae: bilingual route, legal boundaries, counterpositions, research and discovery.
for(const lang of ["de","en"]){
 const chapter=await readFile(join(out,lang,"militaer-und-verantwortung","index.html"),"utf8");
 for(const token of ["mil-hero","mil-principles","mil-exam","mil-sources","m-a","m-d","un.org/en/about-us/un-charter/full-text","icrc.org"]){
  if(!chapter.includes(token))errors.push("Military chapter "+lang+" lacks "+token);
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
}
if(errors.length){console.error(errors.join("\n"));process.exit(1);}

// Mission routes and the register must remain discoverable in both languages.
const registry=JSON.parse(await readFile("public/knowledge/claims.json","utf8"));
const exported=JSON.parse(await readFile(join(out,"knowledge/claims.json"),"utf8"));
const forumThreads=JSON.parse(await readFile("public/knowledge/forum-threads.json","utf8"));
const forumById=new Map(forumThreads.threads.map(thread=>[thread.claim_id,thread.issue_number]));
if(JSON.stringify(registry)!==JSON.stringify(exported))errors.push("Register export differs from the rendered source");
const sitemap=await readFile(join(out,"sitemap.xml"),"utf8");
for(const lang of ["de","en"]){
 const home=await readFile(join(out,lang,"index.html"),"utf8");
 const mission=await readFile(join(out,lang,"mission/index.html"),"utf8");
 const homeMain=home.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] || "";
 for(const link of ["/"+lang+"/methode/#g-005","/"+lang+"/werkstatt/","/issues/new?template=frage.yml"]){
  if(!homeMain.includes(link))errors.push("Missing homepage entry point "+lang+" "+link);
 }
 const register=await readFile(join(out,lang,"aussagen/index.html"),"utf8");
 const forumPage=await readFile(join(out,lang,"forum/index.html"),"utf8");
 if(!home.includes("/Wirklich/"+lang+"/forum/")||!sitemap.includes("/Wirklich/"+lang+"/forum/"))errors.push("Forum route not discoverable "+lang);
 if(!forumPage.includes("/discussions"))errors.push("Forum missing discussions entry "+lang);
 for(const slug of ["werkstatt","aussagen","baum-des-wissens"]){
  const route="/Wirklich/"+lang+"/"+slug+"/";
  if(!home.includes(route)||!sitemap.includes(route))errors.push("Undiscoverable route "+route);
 }
 for(const c of registry.claims){
  if(!register.includes('id="'+c.id+'"')||!register.includes(c.statement[lang]))errors.push("Missing rendered claim "+lang+"/"+c.id);
  const url="/issues/"+forumById.get(c.id);
  if(!forumPage.includes(url)||!forumPage.includes(c.statement[lang])||!register.includes(url))errors.push("Missing linked claim forum "+lang+"/"+c.id);
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
 if(topic.state==="proposed"&&(!/^https:\/\/github\.com\/AlexanderR1991\/Wirklich\/pull\/\d+$/.test(topic.url)||topic.slug))errors.push("Proposal needs its actual PR: "+topic.id);
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
 const route = `/Wirklich/${lang}/esoterik-und-mathematik/`;
 const html = await readFile(join(out, lang, "esoterik-und-mathematik/index.html"), "utf8");
 for (const token of ['data-symbol-lab', 'data-worksheet', 'data-statistics', '<noscript>', 'data-binary-word', 'data-download="json"', 'data-download="txt"', 'rel="canonical"', 'hreflang="de"', 'hreflang="en"']) {
  if (!html.includes(token)) errors.push(`Workshop ${lang} lacks ${token}`);
 }
 if ((html.match(/data-state="\d+"/g) || []).length !== 64) errors.push(`Workshop ${lang} must show 64 patterns`);
 if ((html.match(/data-line="\d+"/g) || []).length !== 6) errors.push(`Workshop ${lang} must have six line controls`);
 if (!html.includes(`<html lang="${lang}"`) || html.includes('<title>undefined')) errors.push(`Workshop ${lang} metadata invalid`);
 const sitemap = await readFile(join(out, 'sitemap.xml'), 'utf8');
 if (!sitemap.includes(route)) errors.push(`Workshop ${lang} missing from sitemap`);
}
if(errors.length){console.error(errors.join("\n"));process.exit(1);}
console.log('Verified symbol/mathematics workshop: bilingual routes, 64 states, six controls, exports and discovery.');

// Release identity and the new routes must agree with the published source data.
const project=JSON.parse(await readFile("public/project.json","utf8"));
const {summarizeProject}=await import("../src/lib/project-status.mjs");
const discovery=JSON.parse(await readFile("public/research/stream.json","utf8"));
const criticism=JSON.parse(await readFile("public/research/angriffe.json","utf8"));
const stats=summarizeProject(registry,topics,discovery,criticism);
for(const lang of ["de","en"]){
 const name=lang==="de"?project.name:project.english_name;
 const home=await readFile(join(out,lang,"index.html"),"utf8");
 const heading=home.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1];
 if(heading?.replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim()!==(lang==="de"?"Was ist wirklich?":"What is real?"))errors.push("Missing guiding question on "+lang+" homepage");
 for(const entry of await readdir(join(out,lang),{withFileTypes:true})){
  const file=entry.isDirectory()?join(out,lang,entry.name,"index.html"):join(out,lang,entry.name);
  if(!entry.isDirectory()&&!entry.name.endsWith(".html"))continue;
  const html=await readFile(file,"utf8");
  const headerName=html.match(/class="brand__name"[^>]*>\s*([^<]*)/)?.[1].trim();
  if(!html.includes(`data-project-version="${project.version}"`)||!html.includes(` · ${name}</title>`)||headerName!==name)errors.push("Release identity mismatch "+file);
  if(html.includes("<title>undefined"))errors.push("Undefined page title "+file);
 }
 for(const slug of ["werkstatt","projektstatus"]){
  const file=join(out,lang,slug,"index.html"),html=await readFile(file,"utf8");
  if(!html.includes(`<html lang="${lang}"`)||!html.includes('rel="canonical"')||!html.includes('hreflang="en"')||!html.includes('hreflang="de"'))errors.push("Missing release page metadata "+file);
  if(!sitemap.includes('/'+lang+'/'+slug+'/'))errors.push("Release page missing from sitemap "+file);
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  if(new Set(ids).size!==ids.length)errors.push("Duplicate release page anchor "+file);
 }
 const worksheet=await readFile(join(out,lang,"werkstatt/index.html"),"utf8");
 for(const token of ['data-inquiry-workbench','data-export-json','data-export-text','data-import','data-local-save','<noscript>']){
  if(!worksheet.includes(token))errors.push("Missing workbench capability "+lang+"/"+token);
 }
 for(const field of ["question","claim","scope","support","objection","revision","action"]){
  if(!worksheet.includes(`name="${field}"`)||!worksheet.includes(`for="inquiry-${field}"`))errors.push("Missing accessible workbench field "+lang+"/"+field);
 }
 const status=await readFile(join(out,lang,"projektstatus/index.html"),"utf8");
 for(const key of ["claims","reviewed","drafts","open"]){
  if(!status.includes(`data-stat="${key}">${stats[key]}</dd>`))errors.push("Incorrect derived status count "+lang+"/"+key);
 }
}
if(errors.length){console.error(errors.join("\n"));process.exit(1);}
console.log(`Verified WIRKLICH ${project.version}: shared identity, accessible worksheet exports/import, bilingual release routes and data-derived status counts.`);

// Navigator: public draft data, static reading cards and versioned provenance.
const {connections}=await import("../src/lib/navigator.mjs");
const connectionExport=JSON.parse(await readFile(join(out,"knowledge/connections.json"),"utf8"));
if(connectionExport.schema_version!==1||connectionExport.status!=="editorial_drafts"||
   JSON.stringify(connectionExport.connections)!==JSON.stringify(connections))errors.push("Navigator export must match its editorial drafts");
for(const connection of connections){
 if(connection.reviewStatus!=="draft")errors.push("Navigator draft was promoted without review: "+connection.id);
 if(!connection.topics.every(id=>topicIDs.has(id)))errors.push("Unknown navigator topic: "+connection.id);
 for(const id of connection.topics){
  for(const lang of ["de","en"]){
   if(!connection.topicReasons[id]?.[lang]?.trim())errors.push("Missing reason for "+connection.id+"/"+id+"/"+lang);
  }
 }
 if(connection.sourceClaim){
  const source=registry.claims.find(claim=>claim.id===connection.sourceClaim.id);
  if(!source||source.version!==connection.sourceClaim.version)errors.push("Navigator source changed; reassess connection: "+connection.id);
 }
}
for(const lang of ["de","en"]){
 const route=`/Wirklich/${lang}/erkenntnisnavigator/`;
 const html=await readFile(join(out,lang,"erkenntnisnavigator/index.html"),"utf8");
 if(!sitemap.includes(route)||!html.includes(`rel="canonical" href="https://alexanderr1991.github.io${route}"`))errors.push("Navigator metadata missing: "+lang);
 for(const token of ["data-navigator","data-nav-question","data-nav-conditions","data-nav-export","data-nav-reset","<noscript>"]){
  if(!html.includes(token))errors.push("Navigator capability missing: "+lang+"/"+token);
 }
 for(const connection of connections){
  if(!html.includes(`id="verbindung-${connection.id}"`)||!html.includes(connection.title[lang]))errors.push("Navigator card unavailable without JS: "+lang+"/"+connection.id);
  for(const id of connection.topics){
   if(!html.includes(`href="#thema-${id}"`))errors.push("Missing topic path "+lang+"/"+connection.id+"/"+id);
  }
 }
 for(const topic of topics){
  if(!html.includes(`id="thema-${topic.id}"`))errors.push("Missing navigator topic target "+lang+"/"+topic.id);
 }
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
 if(new Set(ids).size!==ids.length)errors.push("Duplicate navigator anchor: "+lang);
 for(const slug of ["index","baum-des-wissens","aussagen","methode","werkstatt","projektstatus"]){
  const page=await readFile(join(out,lang,...(slug==="index"?[]:[slug]),"index.html"),"utf8");
  const main=page.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1]||"";
  if(!main.includes(route))errors.push("Missing contextual navigator link: "+lang+"/"+slug);
 }
}
if(errors.length){console.error(errors.join("\n"));process.exit(1);}
console.log("Verified bilingual navigator, readable draft cards, contextual entry points and version-bound source links.");


// Verify legal routes and the voluntary support section in both languages.
for(const lang of ["de","en"]){
  const footer = await readFile(join(out,lang,"index.html"),"utf8");
  for(const route of ["impressum","datenschutz"]){
    const link="/Wirklich/"+lang+"/"+route+"/";
    if(!footer.includes(link)||!sitemap.includes(link))errors.push("Missing legal route "+link);
    try { const html=await readFile(join(out,lang,route,"index.html"),"utf8");
      if(!html.includes("<h1")||!html.includes('rel="canonical"'))errors.push("Invalid legal page "+link);
    } catch { errors.push("Missing legal page "+link); }
  }
  const contribute = await readFile(join(out,lang,"mitwirken","index.html"),"utf8");
  const support = contribute.split('id="unterstuetzen"')[1]?.split("</section>")[0] || "";
  if(!footer.includes(`href="/Wirklich/${lang}/mitwirken/#unterstuetzen"`)) errors.push("Missing footer link to support for "+lang);
  if(!support.includes(">radke.a91@gmail.com<") || !support.includes('href="https://www.paypal.com/"')) errors.push("Missing PayPal recipient or link for "+lang);
  if(!support.includes(lang==="de" ? "keine Spendenquittung" : "no charitable donation receipt")) errors.push("Missing donation receipt disclosure for "+lang);
}
if(errors.length){console.error(errors.join("\n"));process.exit(1);}
console.log("Verified bilingual legal pages, support links, PayPal recipient and donation receipt disclosures.");


// The self-correction rule must be accessible, bilingual and included in exported rules.
const correctionProtocol=JSON.parse(await readFile("public/protocol/self-correction.v1.json","utf8"));
const projectMeta=JSON.parse(await readFile("public/project.json","utf8"));
if(projectMeta.guiding_principle?.id!==correctionProtocol.principle_id)errors.push("Correction rule and project profile disagree");
for(const lang of ["de","en"]){
 const home=await readFile(join(out,lang,"index.html"),"utf8");
 const correctionPage=await readFile(join(out,lang,"regelkreis/index.html"),"utf8");
 const pack=await readFile(join(out,"prompts","wirklich-regeln."+lang+".txt"),"utf8");
 if(!home.includes(correctionProtocol.motto[lang])||!home.includes("/"+lang+"/regelkreis/"))errors.push("Missing META-01 on home "+lang);
 if(!correctionPage.includes(correctionProtocol.motto[lang]))errors.push("Missing motto on correction page "+lang);
 for(const p of correctionProtocol.principles)if(!correctionPage.includes(p.id))errors.push("Missing correction principle "+lang+"/"+p.id);
 if(!pack.includes("META-01")||!pack.includes(correctionProtocol.motto[lang]))errors.push("Exported rules omit META-01 "+lang);
 if(!sitemap.includes("/"+lang+"/regelkreis/"))errors.push("Correction route absent from sitemap "+lang);
}
try{await access(join(out,"protocol/self-correction.v1.json"));}catch{errors.push("Missing public self-correction protocol");}
if(errors.length){console.error(errors.join("\n"));process.exit(1);}
console.log("Verified META-01 on home, correction page, rule exports and sitemap.");

// Check the public AI philosophy and voluntary chat rules without claiming ethical validity.
const aiDraft=JSON.parse(await readFile("public/ai/philosophy-engine.v0.json","utf8"));
if(aiDraft.status!=="editorial_draft")errors.push("AI philosophy must remain marked as a draft");
for(const lang of ["de","en"]){
 const page=await readFile(join(out,lang,"ki-und-mensch/index.html"),"utf8");
 const rules=await readFile(join(out,"prompts","wirklich-regeln."+lang+".txt"),"utf8");
 const title=lang==="de"?"Was MUSS KI für uns Menschen sein?":"What MUST AI be for human beings?";
 const marker=lang==="de"?"PHILOSOPHISCHER MOTOR DER KI":"HUMAN-ORIGIN PHILOSOPHICAL ENGINE FOR AI";
 if(!page.includes(title))errors.push("Missing AI purpose "+lang);
 for(const p of aiDraft.principles)if(!page.includes(p.id))errors.push("Missing AI principle "+lang+"/"+p.id);
 if(!rules.includes(marker)||!rules.includes("AI-P07"))errors.push("Missing AI charter in rule pack "+lang);
 if(!sitemap.includes("/"+lang+"/ki-und-mensch/"))errors.push("Missing AI sitemap entry "+lang);
}
try{await access(join(out,"ai/philosophy-engine.v0.json"));}catch{errors.push("Missing public AI JSON casebook");}
if(errors.length){console.error(errors.join("\n"));process.exit(1);}
console.log("Verified bilingual AI philosophy, challenge cases and optional rule-pack inclusion.");
