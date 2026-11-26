import test from "node:test";
import assert from "node:assert/strict";
import {readFile,readdir} from "node:fs/promises";
import {topics} from "../src/lib/tree.mjs";
import {validateUniversal,questionsForRoute,findingsForRoute,findingsForQuestion} from "../src/lib/universal-questions.mjs";
const read=async path=>JSON.parse(await readFile(new URL("../"+path,import.meta.url),"utf8"));
const catalogue=await read("public/knowledge/universal-questions.v1.json");
const findings=await read("public/knowledge/universal-findings.v1.json");
const atlas=await read("public/knowledge/questions.json");
const ledger=await read("public/i18n/review-register.v1.json");
const files=(await readdir(new URL("../docs/",import.meta.url))).filter(x=>x.endsWith(".md")).map(x=>"docs/"+x);
const args=[new Set(topics.map(t=>t.id)),new Set(Object.keys(ledger.website.pages)),new Set(files),atlas.questions.map(q=>q.id)];
test("The published cross-domain catalogue has valid traceable questions and no false findings",()=>{
 assert.equal(validateUniversal(catalogue,findings,...args).length,0);
 assert.equal(catalogue.questions.length,16);
 assert.equal(findings.findings.length,0);
});
for (const [field, kind] of [["questions", "question"], ["relations", "relation"], ["findings", "finding"]]) {
 test(`Non-object ${field} records produce indexed errors without mutating the data`, () => {
  for (const value of [null, false, 17, "synthetic record", []]) {
   const copy = structuredClone(catalogue), ledgerCopy = structuredClone(findings);
   const records = field === "findings" ? ledgerCopy.findings : copy[field];
   const index = records.length;
   records.push(JSON.parse(JSON.stringify(value)));
   const before = JSON.stringify([copy, ledgerCopy]);
   let errors;
   assert.doesNotThrow(() => { errors = validateUniversal(copy, ledgerCopy, ...args); });
   assert.ok(errors.some(error => error.includes(`Invalid ${kind} record at ${field}[${index}]`)));
   assert.equal(JSON.stringify([copy, ledgerCopy]), before);
  }
 });
}
test("Every domain only sees questions mapped to that route",()=>{
 for(const route of args[1]){
  const items=questionsForRoute(catalogue,route);
  assert.ok(items.length<=3);
  assert.ok(items.every(q=>q.return_routes.includes(route)));
 }
 assert.ok(questionsForRoute(catalogue,"die-bruecke").some(q=>q.id==="U-003"));
});
test("findings report invalid referenced route fields without aborting validation", () => {
 const q = catalogue.questions[0];
 // Complete synthetic metadata is only a structural control, not a real review.
 const answer = {schema_version: 1, findings: [{
  id: "UF-001", question_id: q.id, version: 1, status: "reviewed", claim_type: "empirical",
  answer: {de: "Synthetische Antwort", en: "Synthetic answer"},
  scope: {de: "Synthetischer Bereich", en: "Synthetic scope"},
  dissent: {de: "Synthetischer Einwand", en: "Synthetic dissent"},
  revision_condition: {de: "Synthetische Gegenprobe", en: "Synthetic counterexample"},
  reviewer: "Synthetic reviewer", reviewed_at: "2026-11-01", source_commit: catalogue.source_revision,
  review_url: "https://github.com/synthetic/project/pull/1",
  evidence_paths: [q.source_paths[0]], return_routes: [q.return_routes[0]]
 }]};
 assert.deepEqual(validateUniversal(catalogue, answer, ...args), []);
 for (const value of [null, false, 0, 17, {}, q.return_routes[0]]) {
  const copy = structuredClone(catalogue);
  copy.questions[0].return_routes = value;
  const before = JSON.stringify(copy);
  let errors;
  assert.doesNotThrow(() => { errors = validateUniversal(copy, answer, ...args); });
  assert.ok(errors.some(error => error.includes("Invalid answer return destinations")));
  assert.ok(errors.some(error => error.includes("Finding may return only")));
  assert.equal(JSON.stringify(copy), before);
 }
});
test("A finding must not be projected without review and matching destination",()=>{
 const bad={...findings,findings:[{id:"UF-001",question_id:"U-003",status:"ai_draft",return_routes:["die-bruecke"]}]};
 assert.deepEqual(findingsForRoute(catalogue,bad,"die-bruecke"),[]);
 assert.ok(validateUniversal(catalogue,bad,...args).length>0);
 assert.deepEqual(findingsForQuestion(findings,"U-003"),[]);
});
test("Rejection of fabricated source, changed status, duplicate ID and fake backport",()=>{
 const copy=structuredClone(catalogue);
 copy.questions[0].source_paths.push("docs/not-a-real-source.md");
 copy.questions[1].id=copy.questions[0].id;
 copy.questions[2].review_status="reviewed";
 assert.ok(validateUniversal(copy,findings,...args).length>=3);
});
test("Cycles in dependency relationships are rejected",()=>{
 const copy=structuredClone(catalogue);
 copy.relations.push({from:"U-007",to:"U-001",type:"depends_on",reason:{de:"Test-Gegenkante",en:"Test counteredge"}});
 assert.ok(validateUniversal(copy,findings,...args).some(x=>x.includes("Cycle")));
});
test("Review metadata is necessary even if an answer is plausible",()=>{
 const answer={schema_version:1,findings:[{
 id:"UF-001",question_id:"U-003",version:1,status:"reviewed",claim_type:"empirical",
 answer:{de:"Hypothese",en:"Hypothesis"},scope:{de:"Bedingt",en:"Conditional"},
 dissent:{de:"Ungeklärt",en:"Unresolved"},revision_condition:{de:"Gegenbeleg",en:"Counterevidence"},
 reviewer:"AI",reviewed_at:"2026-11-07",source_commit:"x",review_url:"https://invalid.test",
 evidence_paths:["docs/schnittmengen.md"],return_routes:["die-bruecke"]
 }]};
 assert.ok(validateUniversal(catalogue,answer,...args).length>=3);
});

test("finding review dates must be calendar-valid strings in the existing 20xx range", () => {
 const q = catalogue.questions[0];
 const synthetic = {schema_version: 1, findings: [{
  id: "UF-001", question_id: q.id, version: 1, status: "reviewed", claim_type: "empirical",
  answer: {de: "Synthetische Antwort", en: "Synthetic answer"},
  scope: {de: "Synthetischer Bereich", en: "Synthetic scope"},
  dissent: {de: "Synthetischer Einwand", en: "Synthetic dissent"},
  revision_condition: {de: "Synthetische Gegenprobe", en: "Synthetic counterexample"},
  reviewer: "Synthetic reviewer", reviewed_at: "2026-11-01", source_commit: catalogue.source_revision,
  review_url: "https://github.com/synthetic/project/pull/1",
  evidence_paths: [q.source_paths[0]], return_routes: [q.return_routes[0]]
 }]};
 // These fixtures assert structure only; none records a real human review.
 for (const date of ["2000-02-29", "2024-02-29", "2096-02-29", "2026-02-28", "2026-04-30", "2026-11-30", "2099-12-31"]) {
  const copy = structuredClone(synthetic);
  copy.findings[0].reviewed_at = date;
  assert.deepEqual(validateUniversal(catalogue, copy, ...args), []);
 }
 for (const date of ["2026-02-30", "2025-02-29", "2026-04-31", "2026-00-01", "2026-13-01", "2026-01-00", "2026-01-32", "1999-12-31", "2100-01-01", ["2026-11-01"], null]) {
  const copy = JSON.parse(JSON.stringify(synthetic));
  copy.findings[0].reviewed_at = date;
  const before = JSON.stringify(copy);
  assert.ok(validateUniversal(catalogue, copy, ...args).some(error => error.includes("Finding needs a review date")), JSON.stringify(date));
  assert.equal(JSON.stringify(copy), before);
 }
});

test("source commits must be scalar SHA strings without JSON array coercion", () => {
 const q = catalogue.questions[0];
 const synthetic = {schema_version: 1, findings: [{
  id: "UF-001", question_id: q.id, version: 1, status: "reviewed", claim_type: "empirical",
  answer: {de: "Synthetische Antwort", en: "Synthetic answer"},
  scope: {de: "Synthetischer Bereich", en: "Synthetic scope"},
  dissent: {de: "Synthetischer Einwand", en: "Synthetic dissent"},
  revision_condition: {de: "Synthetische Gegenprobe", en: "Synthetic counterexample"},
  reviewer: "Synthetic reviewer", reviewed_at: "2026-11-01", source_commit: catalogue.source_revision,
  review_url: "https://github.com/synthetic/project/pull/1",
  evidence_paths: [q.source_paths[0]], return_routes: [q.return_routes[0]]
 }]};
 for (const field of ["source_revision", "source_commit"]) {
  for (const value of [catalogue.source_revision, "0".repeat(40), [catalogue.source_revision], [[catalogue.source_revision]], [[[catalogue.source_revision]]], null, {}, false, 7, "a".repeat(39), "A".repeat(40)]) {
   const copy = structuredClone(catalogue), ledgerCopy = structuredClone(synthetic);
   if (field === "source_revision") copy.source_revision = value;
   else ledgerCopy.findings[0].source_commit = value;
   const before = JSON.stringify([copy, ledgerCopy]);
   const errors = validateUniversal(copy, ledgerCopy, ...args);
   if (typeof value === "string" && /^[a-f0-9]{40}$/.test(value)) assert.deepEqual(errors, []);
   else assert.ok(errors.some(error => error.includes(field === "source_revision" ? "Catalog requires a traceable source revision" : "Finding requires an immutable source commit")), `${field}: ${JSON.stringify(value)}`);
   assert.equal(JSON.stringify([copy, ledgerCopy]), before);
  }
 }
});

test("finding review links must be scalar strings without JSON array coercion", () => {
 const q = catalogue.questions[0];
 const synthetic = {schema_version: 1, findings: [{
  id: "UF-001", question_id: q.id, version: 1, status: "reviewed", claim_type: "empirical",
  answer: {de: "Synthetische Antwort", en: "Synthetic answer"},
  scope: {de: "Synthetischer Bereich", en: "Synthetic scope"},
  dissent: {de: "Synthetischer Einwand", en: "Synthetic dissent"},
  revision_condition: {de: "Synthetische Gegenprobe", en: "Synthetic counterexample"},
  reviewer: "Synthetic reviewer", reviewed_at: "2026-11-01", source_commit: catalogue.source_revision,
  review_url: "https://github.com/synthetic/project/pull/1",
  evidence_paths: [q.source_paths[0]], return_routes: [q.return_routes[0]]
 }]};
 const url = synthetic.findings[0].review_url;
 for (const value of [url, "https://github.com/synthetic/project/pull/42"]) {
  const copy = structuredClone(synthetic);
  copy.findings[0].review_url = value;
  assert.deepEqual(validateUniversal(catalogue, copy, ...args), []);
 }
 for (const value of [[url], [[url]], [[[url]]], [url, url], [], null, {}, false, 1, "", "https://invalid.test/pull/1"]) {
  const copy = JSON.parse(JSON.stringify(synthetic));
  copy.findings[0].review_url = value;
  const before = JSON.stringify(copy);
  assert.ok(validateUniversal(catalogue, copy, ...args).some(error => error.includes("Finding requires a traceable PR review")), JSON.stringify(value));
  assert.equal(JSON.stringify(copy), before);
 }
});

test("non-string identifiers produce indexed diagnostics without coercing JSON objects", () => {
 const q = catalogue.questions[0];
 const synthetic = {schema_version: 1, findings: [{
  id: "UF-001", question_id: q.id, version: 1, status: "reviewed", claim_type: "empirical",
  answer: {de: "Synthetische Antwort", en: "Synthetic answer"},
  scope: {de: "Synthetischer Bereich", en: "Synthetic scope"},
  dissent: {de: "Synthetischer Einwand", en: "Synthetic dissent"},
  revision_condition: {de: "Synthetische Gegenprobe", en: "Synthetic counterexample"},
  reviewer: "Synthetic reviewer", reviewed_at: "2026-11-01", source_commit: catalogue.source_revision,
  review_url: "https://github.com/synthetic/project/pull/1",
  evidence_paths: [q.source_paths[0]], return_routes: [q.return_routes[0]]
 }]};
 const targets = [
  ["question", "id", "questions[0].id"],
  ["finding", "id", "findings[0].id"],
  ["relation", "from", "relations[0].from"],
  ["relation", "to", "relations[0].to"],
  ["relation", "type", "relations[0].type"]
 ];
 assert.deepEqual(validateUniversal(catalogue, synthetic, ...args), []);
 for (const [kind, field, location] of targets) {
  for (const value of [null, false, 7, {}, [], {toString: null}, [{toString: null}]]) {
   const copy = JSON.parse(JSON.stringify(catalogue)), ledgerCopy = structuredClone(synthetic);
   const record = kind === "question" ? copy.questions[0] : kind === "relation" ? copy.relations[0] : ledgerCopy.findings[0];
   record[field] = value;
   const before = JSON.stringify([copy, ledgerCopy]);
   let errors;
   assert.doesNotThrow(() => { errors = validateUniversal(copy, ledgerCopy, ...args); });
   assert.ok(errors.some(error => error.includes(location)), `${location}: ${JSON.stringify(value)}`);
   assert.equal(JSON.stringify([copy, ledgerCopy]), before);
  }
 }
});
