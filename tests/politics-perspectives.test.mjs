import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const policy=JSON.parse(readFileSync(new URL("../src/lib/policy-copy.json",import.meta.url),"utf8"));
const chapter=readFileSync(new URL("../src/components/PolicyChapter.astro",import.meta.url),"utf8");

test("political perspectives represent substantive right and other arguments in both languages",()=>{
 const expected=["migration","security","economy","tradition","europe","climate","budget","speech"];
 for(const lang of ["de","en"]){
  const p=policy[lang];
  assert.deepEqual(p.perspectives.map(x=>x.id),expected);
  assert.equal(p.perspectivesSources.length,8);
  for(const x of p.perspectives){
   for(const field of ["topic","right","other","test"]){
    assert.ok(typeof x[field]==="string"&&x[field].trim().length>30,lang+" "+x.id+" missing "+field);
   }
  }
  for(const field of ["perspectivesLabel","perspectivesTitle","perspectivesIntro","perspectivesRightLabel","perspectivesOtherLabel","perspectivesTestLabel","perspectivesBoundary","perspectivesSourcesLabel"]){
   assert.ok(p[field]&&p[field].trim(),lang+" missing "+field);
  }
  for(const source of p.perspectivesSources){
   assert.match(source.url,/^https:\/\//);
   assert.ok(source.label.length>5);
  }
 }
 assert.match(chapter,/id="perspektiven"/);
 assert.match(chapter,/t\.perspectives\.map/);
 assert.match(chapter,/t\.perspectivesSources\.map/);
});

test("political argument map distinguishes contested means from well-established climate science",()=>{
 for(const lang of ["de","en"]){
  const climate=policy[lang].perspectives.find(x=>x.id==="climate");
  assert.match(climate.test,/IPCC/);
  assert.match(policy[lang].perspectivesBoundary,/2024\/2025/);
 }
});
