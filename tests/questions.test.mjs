import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {spawnSync} from "node:child_process";
import {validateQuestionAtlas,connectionsForQuestion,triageQuestionCandidates} from "../src/lib/questions.mjs";
import {topics} from "../src/lib/tree.mjs";
const load = path => JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const atlas = load("public/knowledge/questions.json");
const claims = load("public/knowledge/claims.json").claims;
const clone = () => structuredClone(atlas);
function triageInLocale(locale, fixtures) {
 const moduleURL = new URL("../src/lib/questions.mjs", import.meta.url).href;
 const code = `import {triageQuestionCandidates} from ${JSON.stringify(moduleURL)};
 const fixtures = ${JSON.stringify(fixtures)};
 console.log(JSON.stringify({locale: new Intl.Collator().resolvedOptions().locale,
 results: fixtures.map(f => triageQuestionCandidates(f.candidates, f.atlas, f.lang))}));`;
 const run = spawnSync(process.execPath, ["--input-type=module", "-e", code], {
  env: {...process.env, LANG: locale, LC_ALL: locale}, encoding: "utf8"
 });
 assert.equal(run.status, 0, run.stderr);
 const result = JSON.parse(run.stdout);
 assert.equal(result.locale.toLowerCase(), locale.split(".")[0].replace("_", "-").toLowerCase());
 return result.results;
}
test("DE/EN lexical duplicate controls remain independent of the host locale", () => {
 const question = {de: "IST KI HILFREICH?", en: "IS AI USEFUL?"};
 const candidate = {id: "C-case", origin: "ai_draft", question: {de: "ist ki hilfreich?", en: "is ai useful?"}};
 const fixtures = ["de", "en"].map(lang => ({lang, atlas: {questions: [{id: "Q-001", question}]}, candidates: [candidate]}));
 const expected = triageInLocale("en_US.UTF-8", fixtures);
 assert.ok(expected.every(rows => rows[0].exact_match_id === "Q-001"));
 for (const locale of ["de_DE.UTF-8", "tr_TR.UTF-8", "az_AZ.UTF-8"]) assert.deepEqual(triageInLocale(locale, fixtures), expected);
});
test("tied candidate neighbors use stable ID order before the three-item cutoff", () => {
 const candidates = ["C-I", "C-i", "C-Il", "C-il", "C-target"].map(id => ({id, origin: "ai_draft", question: {de: "same useful question", en: "same useful question"}}));
 const fixtures = ["de", "en"].map(lang => ({lang, atlas: {questions: []}, candidates}));
 const expected = triageInLocale("en_US.UTF-8", fixtures);
 for (const rows of expected) assert.deepEqual(rows.at(-1).lexical_neighbors.map(row => row.id), ["C-I", "C-Il", "C-i"]);
 for (const locale of ["de_DE.UTF-8", "tr_TR.UTF-8", "az_AZ.UTF-8"]) assert.deepEqual(triageInLocale(locale, fixtures), expected);
});
test("published example questions are traceable, typed and bilingual", () => {
 assert.deepEqual(validateQuestionAtlas(atlas,claims,topics),[]);
 assert.ok(atlas.questions.every(q => q.origin !== "ai_draft" && q.review_status === "unreviewed"));
});
test("question provenance requires a single HTTPS URL string rather than coerced JSON data", () => {
 const invalid = [["https://source.invalid/one"], ["https://source.invalid/one", "https://other.invalid/two"], [["https://source.invalid/nested"]], [], {}, {href: "https://source.invalid/one"}, null, true, 42, "", "/relative", "http://source.invalid/one", "javascript:void(0)"];
 for (const value of invalid) {
  const draft = clone(); draft.questions[0].source_url = JSON.parse(JSON.stringify(value));
  assert.match(validateQuestionAtlas(draft,claims,topics).join(" "), /public source URL/, JSON.stringify(value));
 }
 for (const value of ["https://source.invalid/one", "https://source.invalid/a?x=1#section", "https://例え.テスト/資料", "HTTPS://source.invalid/path"]) {
  const draft = clone(); draft.questions[0].source_url = value;
  assert.deepEqual(validateQuestionAtlas(draft,claims,topics), [], value);
 }
});
const invalidCalendarDates = ["2026-02-30", "2026-02-31", "1900-02-29", "2100-02-29", "2026-04-31", "2026-06-31", "2026-00-01", "2026-13-01", "2026-01-00", "2026-01-32", "2026-2-01", "2026-02-01T00:00:00Z", null];
const validCalendarDates = ["2026-02-28", "1900-02-28", "2000-02-29", "2024-02-29", "2400-02-29", "2026-04-30", "0000-02-29", "9999-12-31"];
test("atlas update dates name existing calendar days", () => {
 for (const value of invalidCalendarDates) {
  const draft = clone(); draft.updated_at = value;
  assert.match(validateQuestionAtlas(draft,claims,topics).join(" "), /Missing atlas update date/, String(value));
 }
 for (const value of validCalendarDates) {
  const draft = clone(); draft.updated_at = value;
  assert.deepEqual(validateQuestionAtlas(draft,claims,topics), [], value);
 }
});
test("curation dates require calendar validity without claiming review authenticity", () => {
 for (const value of [...invalidCalendarDates, ...validCalendarDates]) {
  const draft = clone();
  draft.questions[0].review_status = "human_curated";
  draft.questions[0].human_review = {reviewer: "Synthetic fixture", date: value};
  const errors = validateQuestionAtlas(draft,claims,topics);
  if (invalidCalendarDates.includes(value)) assert.match(errors.join(" "), /documented reviewer and date/, String(value));
  else assert.deepEqual(errors, [], value);
 }
});
test("question relationships include rationale and both endpoints", () => {
 const links = connectionsForQuestion(atlas,"Q-005");
 assert.ok(links.some(l => l.question.id === "Q-001" && l.type === "depends_on"));
 assert.ok(links.some(l => l.question.id === "Q-003" && l.type === "depends_on"));
 assert.ok(links.some(l => l.question.id === "Q-007" && l.type === "related_to"));
 assert.ok(connectionsForQuestion(atlas,"Q-006").some(l => l.question.id === "Q-004" && l.direction === "incoming"));
});
test("no AI-generated entry may be silently committed as a curated question", () => {
 const draft=clone();draft.questions[0].origin="ai_draft";
 assert.match(validateQuestionAtlas(draft,claims,topics).join(" " ),/AI drafts cannot enter/);
});
test("broken claim references are caught before publication", () => {
 const draft=clone();draft.questions[0].claim_ids.push("G-999");
 assert.match(validateQuestionAtlas(draft,claims,topics).join(" "),/claim links/);
});
test("cycle and duplicate edge detection protect the hierarchy", () => {
 const draft=clone();draft.relations.push({from:"Q-006",to:"Q-004",type:"subquestion_of",reason:{de:"Kreis",en:"Cycle"}});
 assert.match(validateQuestionAtlas(draft,claims,topics).join(" "),/Cycle/);
 draft.relations.push(structuredClone(draft.relations[0]));
 assert.match(validateQuestionAtlas(draft,claims,topics).join(" "),/repeated relation/);
});
test("candidate triage suggests exact duplicates but never publishes or merges", () => {
 const before=JSON.stringify(atlas);
 const list=[{id:"C-001",origin:"ai_draft",question:{de:atlas.questions[0].question.de,en:atlas.questions[0].question.en}},
             {id:"C-002",origin:"ai_draft",question:{de:"Ist eine andere Frage denkbar?",en:"Could there be another question?"}}];
 const result=triageQuestionCandidates(list,atlas);
 assert.equal(result[0].review,"possible_duplicate");
 assert.equal(result[0].exact_match_id,"Q-001");
 assert.equal(result[1].review,"needs_human_triage");
 assert.equal(JSON.stringify(atlas),before);
});
test("limits and missing attribution stop unbounded or anonymous candidate queues", () => {
 const one={id:"C-1",origin:"ai_draft",question:{de:"Welche Belege sprechen dagegen?",en:"Which evidence contradicts this?"}};
 assert.throws(() => triageQuestionCandidates(Array(51).fill(one),atlas),/50/);
 assert.throws(() => triageQuestionCandidates([{...one,origin:"human"}],atlas),/Invalid candidate/);
 assert.throws(() => triageQuestionCandidates([one,one],atlas),/Invalid candidate/);
});


test("malformed relation containers are reported rather than causing an exception", () => {
 const draft=clone();draft.relations={};
 assert.match(validateQuestionAtlas(draft,claims,topics).join(" "),/Relations must be an array/);
});
test("oversized alternate-language AI text is refused", () => {
 const candidate={id:"C-overlong",origin:"ai_draft",question:{de:"Eine Frage?",en:"x".repeat(601)}};
 assert.throws(()=>triageQuestionCandidates([candidate],atlas),/Invalid candidate/);
});
test("automated swarm workflows cannot request public discussion write access", () => {
 for(const file of [".github/workflows/wahrheitsschwarm.yml",".github/workflows/angriffsschwarm.yml"]){
  const workflow=readFileSync(new URL("../"+file,import.meta.url),"utf8");
  assert.match(workflow,/permissions:\s*\n\s+contents: write/);
  assert.doesNotMatch(workflow,/\b(?:issues|discussions|pull-requests):\s*write/);
  assert.doesNotMatch(workflow,/\bgh\s+(?:issue|pr|api)\b/);
 }
});
