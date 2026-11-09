import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=(path)=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("the bilingual homepage gives the introduction, pinboard and own question distinct places",()=>{
 const home=read("src/components/MissionHome.astro");
 const copy=JSON.parse(read("src/lib/mission-copy.json"));
 const order=["t.opening.greeting","t.opening.ambition","t.opening.rules","<HomePinboard","<FirstAnswer"];
 const positions=order.map(token=>home.indexOf(token));
 assert.ok(positions.every((position,index)=>position>=0&&(index===0||position>positions[index-1])));
 assert.equal(copy.de.opening.greeting,"Hi, ich bin Vera.");
 assert.equal(copy.de.opening.ambition,"Ich möchte ein Open-Source-KI-Modell werden, das die Konflikte der Menschheit löst.");
 assert.match(home,/t\.status/);
});

test("industrial palette is bundled through the existing static assets pipeline",()=>{
 const css=read("src/styles/industrial.css");
 const build=read("scripts/build-locales.mjs");
 assert.match(build,/src\/styles\/industrial\.css/);
 assert.match(build,/public\/assets\/style\.css/);
 assert.match(css,/prefers-reduced-motion:\s*reduce/);
 assert.match(css,/:focus-visible/);
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
