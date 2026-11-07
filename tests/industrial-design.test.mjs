import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=(path)=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("industrial board retains independent DE/EN labels and links to real WIRKLICH routes",()=>{
 const board=read("src/components/IndustrialBoard.astro");
 const home=read("src/components/MissionHome.astro");
 for(const id of ["atlas","forum","bridge","engine","workbench","questions","revision","research","esoterik","source"]){
  assert.match(board,new RegExp('id:"'+id+'"'));
 }
 for(const route of ["atlas","forum","die-bruecke","ki-und-mensch","werkstatt","grundfragen","regelkreis","mitwirken"]){
  assert.ok(board.includes('route:"'+route+'"'),route+" missing");
 }
 assert.match(board,/const word=\(v\)=>v\[lang\]/);
 assert.match(board,/data-board-card/);
 assert.match(board,/data-board-keywords/);
 assert.match(board,/aria-live="polite"/);
 assert.match(board,/Keine passende Kachel/);
 assert.match(board,/No matching tile/);
 assert.match(home,/<IndustrialBoard lang=\{lang\}/);
 assert.match(home,/t\.headline/);
 assert.match(home,/t\.headlineAccent/);
 assert.match(home,/t\.status/);
 assert.match(home,/issues\/new\?template=frage\.yml/);
});

test("industrial palette is bundled through the existing static assets pipeline",()=>{
 const css=read("src/styles/industrial.css");
 const build=read("scripts/build-locales.mjs");
 const site=read("src/client/site.js");
 assert.match(build,/src\/styles\/industrial\.css/);
 assert.match(build,/public\/assets\/style\.css/);
 assert.match(css,/\.board-grid\{/);
 assert.match(css,/@media\(max-width:500px\)/);
 assert.match(css, /prefers-reduced-motion:reduce/);
 assert.match(css, /\.board-tile\[hidden\]/);
 assert.match(css, /:focus-visible/);
 assert.match(site, /data-board-filter/);
 assert.match(site, /boardFilter\.addEventListener\("input",apply\)/);
});
