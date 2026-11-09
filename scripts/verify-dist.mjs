import {execFileSync} from "node:child_process";
import {access,readFile,readdir} from "node:fs/promises";
import {join} from "node:path";
import missionCopy from "../src/lib/mission-copy.json" with {type:"json"};
import {fields,topics,topicStates,selfReviews} from "../src/lib/tree.mjs";
const out=join(process.cwd(),"dist"),slugs=["index","projektobservatorium","die-bruecke","philosophischer-motor","grundfragen","kunst-und-erkenntnis","mission","kollektive-intelligenz","regelkreis","entitaet","ki-und-mensch","kollektive-moral","baum-des-wissens","esoterik-katalog","aussagen","forum","fragen-und-ki-prompt","forschungsstrom","atlas","bibliothek","lesestueck-wahrheit","manifest","pruefstand","methode","mitwirken","erkenntnishorizont","warum-liebe-wirkt","politik-die-dem-menschen-dient","bruecken-zwischen-den-religionen","militaer-und-verantwortung","medizin","ernaehrung-und-verantwortung","angriffsschwarm"],errors=[];
for(const lang of ["de","en"]){
 const invitation=lang==="de"?"Bitte hilf mir besser zu werden.":"Please help me get better.";
 const feedbackLink=`href="/Vera/${lang}/mitwirken/#rueckmeldung"`;
 for(const slug of slugs){
  const file=join(out,lang,...(slug==="index"?[]:[slug]),"index.html");
  let html;try{html=await readFile(file,"utf8");}catch{errors.push("Missing "+file);continue;}
  if(!html.includes('<html lang="'+lang+'"'))errors.push("Wrong language in "+file);
  if(!html.includes('hreflang="de"')||!html.includes('hreflang="en"'))errors.push("Missing alternate languages in "+file);
  if(!html.includes('rel="canonical"'))errors.push("Missing canonical "+file);
  if(!html.includes('/Vera/de/')||!html.includes('/Vera/en/'))errors.push("Wrong locale URLs "+file);
  if(!html.includes("assets/style.css"))errors.push("Missing CSS reference "+file);
  const footer=html.split('<footer class="footer">')[1]?.split("</footer>")[0] ?? "";
  if(!footer.includes(invitation)||!footer.includes(feedbackLink))errors.push("Missing feedback invitation in footer of "+file);
  const main=html.split("</main>")[0];
  if(slug==="index"&&(!main.includes(invitation)||!main.includes(feedbackLink)))errors.push("Missing feedback invitation on home "+lang);
  if(slug==="mitwirken"&&(!main.includes('id="rueckmeldung"')||!main.includes(invitation)||!main.includes('issues/new?template=rueckmeldung.yml"')))errors.push("Missing contribution entry point for feedback "+lang);
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
 if(!home.includes("/Vera/"+lang+"/forum/")||!sitemap.includes("/Vera/"+lang+"/forum/"))errors.push("Forum route not discoverable "+lang);
 if(!forumPage.includes("/discussions"))errors.push("Forum missing discussions entry "+lang);
 for(const slug of ["werkstatt","aussagen","baum-des-wissens"]){
  const route="/Vera/"+lang+"/"+slug+"/";
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
 if(topic.state==="proposed"&&(!/^https:\/\/github\.com\/AlexanderR1991\/Vera\/pull\/\d+$/.test(topic.url)||topic.slug))errors.push("Proposal needs its actual PR: "+topic.id);
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
 const route = `/Vera/${lang}/esoterik-und-mathematik/`;
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

const project=JSON.parse(await readFile("public/project.json","utf8"));

// The entity query stays readable without JS, including its philosophical engine.
const { ENTITY_QUERIES } = await import("../src/lib/vera-entity-catalog.mjs");
const { queryVera } = await import("../src/lib/vera-entity.mjs");
for (const [file, lang, id] of [
 ["index.html", "de", "vera-fragen"],
 ["de/index.html", "de", "vera-fragen"],
 ["en/index.html", "en", "ask-vera"]
]) {
 const html = await readFile(join(out, file), "utf8");
 const lab = html.match(/<section[^>]*data-entity-lab[^>]*>[\s\S]*?<\/section>/)?.[0] ?? "";
 for (const token of ['id="' + id + '"', "WIRKLICH", "META-01", "data-entity-form", "data-entity-feedback"]) {
  if (!lab.includes(token)) errors.push("Entity query missing " + token + " on " + file);
 }
 if (!html.includes('href="#' + id + '"')) errors.push("Entity query not linked from " + file);
 const header = html.match(/<header\b[^>]*>[\s\S]*?<\/header>/)?.[0] ?? "";
 if (!header.includes("WIRKLICH") || !header.includes('/' + lang + '/methode/#erkenntnismotor')) {
  errors.push("Philosophical engine missing from header on " + file);
 }
 for (const query of ENTITY_QUERIES) {
  const card = lab.match(new RegExp('<details[^>]*data-entity-question="' + query.id + '"[^>]*>[\\s\\S]*?<\\/details>'))?.[0] ?? "";
  const report = queryVera(query.id, project);
  if (!card.includes(query[lang].question) || !card.includes('data-entity-status="' + report.status + '"')) {
   errors.push("Missing or incorrect static entity answer for " + file + "/" + query.id);
  }
  if (query.id === "life-drive" && !card.includes("data-life-drive")) {
   errors.push("Missing life drive exercise on " + file);
  }
 }
}
if(errors.length){console.error(errors.join("\n"));process.exit(1);}
console.log("Verified entity queries, static verdicts and WIRKLICH links on all three home routes.");

// Release identity and the new routes must agree with the published source data.
const {summarizeProject}=await import("../src/lib/project-status.mjs");
const discovery=JSON.parse(await readFile("public/research/stream.json","utf8"));
const criticism=JSON.parse(await readFile("public/research/angriffe.json","utf8"));
const stats=summarizeProject(registry,topics,discovery,criticism);
for(const lang of ["de","en"]){
 const name=lang==="de"?project.name:project.english_name;
 const home=await readFile(join(out,lang,"index.html"),"utf8");
 const heading=home.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1];
 const {greeting,ambition,rules}=missionCopy[lang].opening;
 const [opening,hero,life]=home.match(
  /<section class="home-opening"[^>]*>([\s\S]*?)<\/section>\s*<section class="home-life"[^>]*>([\s\S]*?)<\/section>/
 )??["","",""];
 const rulesHref=`href="/Vera/${lang}/methode/#erkenntnismotor"`;
 const exerciseHref=`href="/Vera/${lang}/schnittmengen/#sprachprobe"`;
 const introOrder=["<circle ",greeting,ambition,rulesHref,rules].map(text=>hero.indexOf(text));
 if(heading?.trim()!==greeting||introOrder.some((position,index)=>position<0||(index>0&&position<=introOrder[index-1])))
   errors.push("Missing or out-of-order Vera introduction for "+lang);
 if(!hero.includes('stroke-dasharray="346 14"')||!hero.includes('transform="rotate(-38 100 100)"')||
    hero.includes('id="first-question"'))
   errors.push("Missing Vera circle or dedicated life section for "+lang);
 const sampleHref=`href="/Vera/${lang}/forum/#alltag-entscheidung"`;
 if(!opening.includes('id="first-question"')||!opening.includes('for="first-question"')||!opening.includes(sampleHref))
   errors.push("Missing first question field or its script-free sample on home "+lang);
 const exercise=await readFile(join(out,lang,"schnittmengen","index.html"),"utf8");
 if(!exercise.includes('id="sprachprobe"')||!home.includes(ambition))
   errors.push("Missing conversation exercise or open-source ambition for "+lang);
 const board=home.match(/<section class="industrial-board"[^>]*>([\s\S]*?)<\/section>/)?.[1]??"";
 if(!exercise.includes('id="vermittlung"')||!life.includes(`href="/Vera/${lang}/schnittmengen/#vermittlung"`))
   errors.push("Missing path from life section to the dialogue exercise for "+lang);
 const guide=await readFile(join(out,lang,"fragen-und-ki-prompt","index.html"),"utf8");
 if(!home.includes(`href="/Vera/${lang}/fragen-und-ki-prompt/#prompt"`)||
    !guide.includes('id="inquiry-prompt"')||!guide.includes("data-copy-inquiry")||
    !guide.includes('href="/Vera/prompts/wirklich-regeln.'+lang+'.txt"'))
   errors.push("Missing link to the chat guide, copy action or text-file fallback for "+lang);
 if(!board.includes("data-board-card")||!board.includes('data-board-art="table"')||!board.includes(exerciseHref)||
    !board.includes('data-board-art="graph"')||
    !board.includes('data-board-art="custodiae"')||!board.includes(`href="/Vera/${lang}/militaer-und-verantwortung/"`))
   errors.push("Missing mathematical or military pinboard illustration for "+lang);
 const insight=lang==="de"?"erkenntnis":"insight";
 if(!board.includes('href="#'+insight+'"')||!home.includes('id="'+insight+'"')||
    !home.includes('data-knowledge-result')||!home.includes('data-knowledge-controls hidden'))
   errors.push("Missing Vera insight entry or static report for "+lang);
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
console.log(`Verified ${project.name} ${project.version}: shared identity, accessible worksheet exports/import, bilingual release routes and data-derived status counts.`);

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
 const route=`/Vera/${lang}/erkenntnisnavigator/`;
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
    const link="/Vera/"+lang+"/"+route+"/";
    if(!footer.includes(link)||!sitemap.includes(link))errors.push("Missing legal route "+link);
    try { const html=await readFile(join(out,lang,route,"index.html"),"utf8");
      if(!html.includes("<h1")||!html.includes('rel="canonical"'))errors.push("Invalid legal page "+link);
    } catch { errors.push("Missing legal page "+link); }
  }
  const contribute = await readFile(join(out,lang,"mitwirken","index.html"),"utf8");
  const support = contribute.split('id="unterstuetzen"')[1]?.split("</section>")[0] || "";
  if(!footer.includes(`href="/Vera/${lang}/mitwirken/#unterstuetzen"`)) errors.push("Missing footer link to support for "+lang);
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
 const prompt=await readFile(join(out,"prompts",`erkenntnisprompt-v1.${lang}.txt`),"utf8");
 const invitation=lang==="de"?"Bitte hilf mir besser zu werden.":"Please help me get better.";
 if(!home.includes(correctionProtocol.motto[lang])||!home.includes("/"+lang+"/regelkreis/"))errors.push("Missing META-01 on home "+lang);
 if(!correctionPage.includes(correctionProtocol.motto[lang]))errors.push("Missing motto on correction page "+lang);
 const readerCheck=lang==="de"?"Verständlichkeit beim ersten Lesen erproben":"Try it with a first-time reader";
 if(!correctionPage.includes('id="leseprobe"')||!pack.includes(readerCheck))errors.push("Missing first-time reader check "+lang);
 const externalIdeas=lang==="de"?"Ideen anderer KI-Systeme prüfen":"Examining ideas from other AI systems";
 if(!correctionPage.includes('id="andere-ki"')||!pack.includes(externalIdeas))errors.push("Missing guidance on external AI ideas "+lang);
 for(const p of correctionProtocol.principles)if(!correctionPage.includes(p.id))errors.push("Missing correction principle "+lang+"/"+p.id);
 if(!pack.includes("META-01")||!pack.includes(correctionProtocol.motto[lang]))errors.push("Exported rules omit META-01 "+lang);
 if(!pack.includes(invitation)||!prompt.includes(invitation))errors.push("Exported rules or prompt omit feedback invitation "+lang);
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



// Esotericism: every published question is an editorial draft, bilingual and linked
// from the wider tree and the forum. The issue form invites human submissions only.
const esotericTree=JSON.parse(await readFile("public/knowledge/esoterik-tree.json","utf8"));
const esotericExport=JSON.parse(await readFile(join(out,"knowledge/esoterik-tree.json"),"utf8"));
if(JSON.stringify(esotericTree)!==JSON.stringify(esotericExport))errors.push("Esotericism public JSON differs from editorial input");
if(esotericTree.status!=="unreviewed_editorial_draft")errors.push("Esotericism catalogue cannot claim review");
for(const lang of ["de","en"]){
 const chapter=await readFile(join(out,lang,"esoterik-katalog/index.html"),"utf8");
 const treePage=await readFile(join(out,lang,"baum-des-wissens/index.html"),"utf8");
 const forumPage=await readFile(join(out,lang,"forum/index.html"),"utf8");
 const route="/Vera/"+lang+"/esoterik-katalog/";
 if(!sitemap.includes(route)||!treePage.includes(route)||!forumPage.includes(route))errors.push("Esotericism not discoverable in "+lang);
 for(const token of ["data-esoteric-catalog","data-esoteric-branch","data-esoteric-item","data-esoteric-query","esoterik-ast.yml"]){
  if(!chapter.includes(token))errors.push("Missing catalogue affordance "+lang+"/"+token);
 }
 for(const group of esotericTree.branches){
  const anchor="ast-"+group.id.toLowerCase();
  if(!chapter.includes('id="'+anchor+'"')||!treePage.includes("#"+anchor))errors.push("Main esoteric branch missing "+lang+"/"+group.id);
  for(const item of group.children){
   const leafAnchor="ast-"+item.id.toLowerCase().replace(".","-");
   if(!chapter.includes('id="'+leafAnchor+'"')||!chapter.includes(item.title[lang]))errors.push("Esoteric leaf missing "+lang+"/"+item.id);
  }
 }
}
if(errors.length){console.error(errors.join("\n"));process.exit(1);}
console.log("Verified 17 bilingual esoteric branches, static subbranches, source JSON, human issue submission and tree/forum discovery.");

// M-02: bilingual, explicitly provisional public research route.
for(const lang of ["de","en"]){
 const page=await readFile(join(out,lang,"die-bruecke","index.html"),"utf8");
 for(const term of ["data-bridge-demo","data-score","M-02","10.1007/s11229-024-04503-4"]){
  if(!page.includes(term))errors.push("Bridge mathematics page "+lang+" lacks "+term);
 }
}
if(errors.length){console.error(errors.join("\n"));process.exit(1);}

// Universal question loop: public corpus scan, bilingual, safely unreviewed catalogue.
const uqScan=JSON.parse(await readFile(join(out,"research/universal-scan.v1.json"),"utf8"));
const uqQuestions=JSON.parse(await readFile(join(out,"knowledge/universal-questions.v1.json"),"utf8"));
const uqFindings=JSON.parse(await readFile(join(out,"knowledge/universal-findings.v1.json"),"utf8"));
if(uqScan.status!=="automatic_lexical_scan_unreviewed"||uqScan.questions.length!==uqQuestions.questions.length)errors.push("Universal scan is not a complete unreviewed report");
if(uqFindings.findings.length!==0)console.log("Universal findings exist: review metadata must remain valid.");
for(const lang of ["de","en"]){
 const html=await readFile(join(out,lang,"grundfragen","index.html"),"utf8");
 const domain=await readFile(join(out,lang,"schnittmengen","index.html"),"utf8");
 for(const token of ["data-uq-controls","data-uq-card","grundfrage.yml","U-016","U-001"]){
  if(!html.includes(token))errors.push("Universal questions page "+lang+" lacks "+token);
 }
 if(!domain.includes("/"+lang+"/grundfragen/"))errors.push("Universal questions missing from domain backlink "+lang);
 if(!sitemap.includes("/"+lang+"/grundfragen/"))errors.push("Universal questions missing from sitemap "+lang);
}
if(errors.length){console.error(errors.join("\n"));process.exit(1);}
console.log("Verified bilingual universal question atlas, public scan, citation trace and domain backlinks.");

// Header and full search route stay bilingual and index the built site, not only headings.
for (const lang of ["de","en"]) {
  const home = await readFile(join(out,lang,"index.html"),"utf8");
  const page = await readFile(join(out,lang,"suche","index.html"),"utf8");
  const data = JSON.parse(await readFile(join(out,"search",lang+".json"),"utf8"));
  if (!home.includes('data-site-search') || !home.includes('/'+lang+'/suche/')) errors.push("Missing header search "+lang);
  if (!page.includes('data-search-page') || !page.includes('data-search-page-results')) errors.push("Missing search route "+lang);
  if (data.lang!==lang || data.entries.length<150 || !data.entries.some(item=>item.type==="page"&&item.search.length>400))
    errors.push("Missing or un-enriched search index "+lang);
}
if(errors.length){console.error(errors.join("\n"));process.exit(1);}
console.log("Verified bilingual header search, full results routes and published-content indexes.");
const veraRevision = process.env.GITHUB_SHA;
for (const lang of ["de", "en"]) {
 const file = `vera-context.${lang}.txt`;
 const page = await readFile(join(out, lang, "fragen-und-ki-prompt", "index.html"), "utf8");
 const home = await readFile(join(out, lang, "index.html"), "utf8");
 const guestFile = `prompts/guest-review.${lang}.txt`;
 const guestPath = new URL(guestFile, projectMeta.website).pathname;
 const guestEntry = new URL(`${lang}/fragen-und-ki-prompt/`, projectMeta.website).pathname + "#gastprobe";
 const reply = new URL(`${lang}/mitwirken/#entwurf`, projectMeta.website);
 const replyPage = await readFile(join(out, lang, "mitwirken", "index.html"), "utf8");
 const guestText = await readFile(join(out, guestFile), "utf8");
 if (!home.includes(`href="${guestEntry}"`) || !page.includes('id="gastprobe"') ||
     !page.includes(`href="${guestPath}"`) || !guestText.includes(reply.href) ||
     !replyPage.includes('id="entwurf"') || guestText !== await readFile(join("public", guestFile), "utf8")) {
  errors.push("Guest review entry, source text or feedback destination failed for " + lang);
 }
 const context = await readFile(join(out, "prompts", file), "utf8");
 const href = new URL(`prompts/${file}`, projectMeta.website).pathname;
 if (!page.includes('href="#vera"') || !page.includes('id="vera"') ||
     !page.includes(`href="${href}"`) || !page.includes(`href="${href}" download`)) {
  errors.push("Vera starter is missing a jump link, open link or download for " + lang);
 }
 if (/^[a-f0-9]{40}$/.test(veraRevision)) {
  const cli = execFileSync(process.execPath, ["scripts/vera-context.mjs", lang], {encoding: "utf8"});
  if (!context.startsWith(`Vera · Git ${veraRevision}\n`) || context !== cli) {
   errors.push("Vera website and CLI contexts differ at the build revision for " + lang);
  }
 } else {
  const preview = lang === "de" ? "Lokale Vorschau ohne bestätigten Git-Stand" : "Local preview without a verified Git revision";
  if (!context.startsWith(`Vera · ${preview}\n`)) errors.push("Vera context lacks a preview notice for " + lang);
 }
}
if (errors.length) {console.error(errors.join("\n")); process.exit(1);}
console.log("Verified both Vera entry points, downloads and build revision labels.");
// Liber Artis: the work is accessible before opening the interpretation.
const art = JSON.parse(await readFile(join(out, "knowledge/art-works.v1.json"), "utf8"));
for (const lang of ["de", "en"]) {
 const home = await readFile(join(out, lang, "index.html"), "utf8");
 const html = await readFile(join(out, lang, "kunst-und-erkenntnis/index.html"), "utf8");
 if (!home.includes(`href="/Vera/${lang}/kunst-und-erkenntnis/#sammlung"`)) errors.push("Art missing from pinboard " + lang);
 for (const work of art.works) {
  const card = html.match(new RegExp(`<article id="${work.id}"[^>]*>([\\s\\S]*?)</article>`))?.[1] ?? "";
  const [entry, readings = ""] = card.split(/<details(?:\s[^>]*)?>/);
  if (!html.includes(`href="#${work.id}"`) || !work.sources.every(source => entry.includes(`href="${source.url.replaceAll("&", "&amp;")}"`))) {
   errors.push("Work missing its direct route " + lang + "/" + work.id);
  }
  for (const field of ["observation", "reading", "counterreading", "transfer", "test"]) {
   if (!readings.includes(work[field][lang])) errors.push("Missing art field " + lang + "/" + work.id + "/" + field);
  }
 }
}
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log("Verified both Liber Artis pinboard links, original sources and optional interpretations.");

// ENT-00: the public route and bundled, unreviewed protocol must be present in both languages.
for (const lang of ["de","en"]) {
 const page=await readFile(join(out,lang,"entitaet","index.html"),"utf8");
 for (const token of ["ENT-00","data-entity-form","data-entity-events","protocol/entity-loop.v0.json"]) {
  if (!page.includes(token)) errors.push("Entity prototype "+lang+" lacks "+token);
 }
}
const entityProtocol=JSON.parse(await readFile(join(out,"protocol/entity-loop.v0.json"),"utf8"));
if(entityProtocol.status!=="experimental_proposal"||entityProtocol.runtime_enabled!==false||entityProtocol.direction_index.public_score_allowed!==false)errors.push("ENT-00 must remain an unreviewed and inactive proposal");
if(errors.length){console.error(errors.join("\n"));process.exit(1);}
