import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read = path => readFileSync(new URL("../"+path,import.meta.url),"utf8");
const protocol=JSON.parse(read("public/protocol/self-correction.v1.json"));
const project=JSON.parse(read("public/project.json"));
const bilingual=value=>["de","en"].every(lang=>typeof value?.[lang]==="string"&&value[lang].trim().length>=12);

test("META-01 is explicitly normative, bilingual and revisable",()=>{
 assert.equal(protocol.schema_version,1);
 assert.equal(protocol.principle_id,"META-01");
 assert.equal(protocol.status,"editorial_normative_draft");
 assert.equal(project.guiding_principle.id,"META-01");
 assert.ok(bilingual(protocol.motto)&&bilingual(protocol.purpose)&&bilingual(protocol.limitations));
 assert.match(read("docs/selbstkorrektur.md"),/## English/);
 assert.match(read("docs/selbstkorrektur.md"),/Auch META-01 selbst darf/);
});

test("Ten testable rules are unique and bilingual",()=>{
 assert.equal(protocol.principles.length,10);
 assert.deepEqual(protocol.principles.map(p=>p.id),Array.from({length:10},(_,i)=>"SC-"+String(i+1).padStart(2,"0")));
 for(const p of protocol.principles)assert.ok(bilingual(p.title)&&bilingual(p.test),p.id);
});

test("Correction loop has seven stages and permits unresolved outcomes",()=>{
 assert.deepEqual(protocol.cycle.map(s=>s.id),["frame","classify","challenge","review","decide","record","repeat"]);
 for(const step of protocol.cycle)assert.ok(bilingual(step.title)&&bilingual(step.question),step.id);
 assert.deepEqual(protocol.decision_options,["retain","narrow","correct","withdraw","open"]);
 for(const key of ["source_revision","claim_type","scope","strongest_objection","revision_condition","decision","proposed_or_revised_wording","reason","human_responsible","date"])assert.ok(protocol.revision_record.includes(key),key);
});

test("Bilingual public pages and exported AI pack consume META-01",()=>{
 assert.match(read("src/components/MissionHome.astro"),/protocol\.motto\[lang\]/);
 assert.match(read("src/components/SelfCorrection.astro"),/protocol\.principles\.map/);
 assert.match(read("src/lib/rule-pack.mjs"),/localCorrection/);
 assert.match(read("src/pages/sitemap.xml.js"),/"regelkreis"/);
 for(const lang of ["de","en"])assert.ok(read("src/pages/"+lang+"/regelkreis.astro").includes('lang="'+lang+'"'));
});
