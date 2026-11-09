import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=(path)=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("industrial board retains independent DE/EN labels and links to real Vera routes",()=>{
 const board=read("src/components/IndustrialBoard.astro");
 const home=read("src/components/MissionHome.astro");
 for(const id of ["conversation","first-step","everyday","art","military","society","bridge","atlas","counterexample"]){
  assert.match(board,new RegExp('id:"'+id+'"'));
 }
 for(const route of ["atlas","forum","die-bruecke","schnittmengen","kunst-und-erkenntnis","militaer-und-verantwortung","gegenprobe-01"]){
  assert.ok(board.includes('route:"'+route+'"'),route+" missing");
 }
 assert.match(board,/const word=\(v\)=>v\[lang\]/);
 assert.match(board,/data-board-card/);
 assert.match(board,/data-board-keywords/);
 assert.match(board,/aria-live="polite"/);
 assert.match(board,/Keine passende Kachel/);
 assert.match(board,/No matching tile/);
 assert.match(home,/<IndustrialBoard lang=\{lang\}/);
 assert.match(home,/t\.opening\.greeting/);
 assert.match(home,/t\.opening\.rules/);
 assert.match(home,/t\.status/);
 assert.match(home,/<FirstAnswer lang=\{lang\}/);
});

test("industrial palette is bundled through the existing static assets pipeline",()=>{
 const css=read("src/styles/industrial.css");
 const build=read("scripts/build-locales.mjs");
 const site=read("src/client/site.js");
 assert.match(build,/src\/styles\/industrial\.css/);
 assert.match(build,/public\/assets\/style\.css/);
 assert.match(css,/\.board-grid\s*\{[^}]*display:\s*grid/);
 assert.match(css,/\.board-grid\b[^{}]*\{[^}]*grid-template-columns:\s*1fr\b/);
 assert.match(css, /prefers-reduced-motion:\s*reduce/);
 assert.match(css, /\.board-tile\[hidden\]/);
 assert.match(css, /:focus-visible/);
 assert.match(site, /data-board-filter/);
 assert.match(site, /boardFilter\.addEventListener\("input",apply\)/);
});


test("site and philosophy accurately present an open-source AI goal rather than a finished model",()=>{
 const home=read("src/components/MissionHome.astro");
 const mission=read("src/components/MissionPage.astro");
 const ai=read("src/components/AIPhilosophy.astro");
 const site=read("src/layouts/SiteLayout.astro");
 const docs=read("docs/open-source-ki.md");
 const docsEn=read("docs/en/open-source-ai.md");
 const project=JSON.parse(read("public/project.json"));
 const copy=JSON.parse(read("src/lib/mission-copy.json"));
 assert.ok(home.includes("t.opening.ambition"));
 assert.match(copy.de.opening.ambition,/Open-Source-KI.*werden/);
 assert.match(copy.en.opening.ambition,/want to become an open-source AI/);
 assert.ok(mission.includes("opensource-ki"));
 assert.ok(mission.includes("Noch keine eigenständig veröffentlichte Vera-KI"));
 assert.ok(ai.includes("kein offenes eigenes Grundmodell"));
 assert.ok(site.includes("Unser Ziel: eine Open-Source-KI mit Menschen bauen"));
 assert.ok(docs.includes("noch keine fertig entwickelte, selbstständig lauffähige Vera-KI"));
 assert.ok(docsEn.includes("no completed, independently runnable Vera AI"));
 assert.equal(project.ai_ambition.status,"in_development");
 assert.equal(project.ai_ambition.own_open_foundation_model_released,false);
 assert.equal(project.ai_ambition.independently_runnable_model_available,false);
 assert.equal(project.visual_identity.design_stylesheet,"src/styles/industrial.css");
 const build=read("scripts/build-locales.mjs");
 assert.ok(build.includes(project.visual_identity.design_stylesheet));
});
