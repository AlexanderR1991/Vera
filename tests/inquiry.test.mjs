import test from "node:test";
import assert from "node:assert/strict";
import {createInquiry,parseInquiry,inquiryMarkdown,inquiryFields,inquirySchema,missingInquiryFields,maxFieldLength,maxInquiryFileSize} from "../src/lib/inquiry.mjs";
import {assessDirection, directionChecks, directionStates} from "../src/lib/inquiry-direction.mjs";
import {summarizeProject} from "../src/lib/project-status.mjs";
import {claimReviewFingerprint} from "../src/lib/claims.mjs";

test("unfinished notes can be exported, reopened and completed without invented evidence", () => {
  const note = createInquiry({question:"  Was ist hier unbekannt?  ",type:"normative"});
  assert.equal(note.question,"Was ist hier unbekannt?");
  assert.equal(note.support,"");
  assert.equal(missingInquiryFields(note).length,7);
  assert.deepEqual(parseInquiry(JSON.stringify(note)),note);
  const reopened = createInquiry({...parseInquiry(JSON.stringify(note)),objection:"Ein dauerhafter Zielkonflikt."});
  assert.equal(missingInquiryFields(reopened).length,6);
  assert.match(inquiryMarkdown(reopened),/^# Vera · Prüfblatt\n/);
  assert.match(inquiryMarkdown(reopened),/Ungeprüfter eigener Entwurf/);
  assert.match(inquiryMarkdown(reopened),/Aussageart: Normatives Urteil/);
});

test("English notes keep Unicode, quotes and multiline contents through JSON and text exports", () => {
  const values = Object.fromEntries(inquiryFields.map(key=>[key,`Line one: ${key}\n“Würde, Freiheit” <script>alert(1)</script>`]));
  const note = createInquiry({...values,type:"interpretive"},"en");
  assert.deepEqual(parseInquiry(JSON.stringify(note)),note);
  const md = inquiryMarkdown(note);
  assert.match(md,/^# Vera · Inquiry worksheet\n/);
  assert.match(md,/Unreviewed personal draft/);
  assert.match(md,/Interpretation \/ experience/);
  assert.match(md,/## What would change my position\?/);
  assert.ok(md.includes(note.objection));
});

test("import rejects foreign schemas, unknown types, invalid language and malformed fields", () => {
  const valid = createInquiry({question:"A question"});
  for (const data of [null,[],{}, {...valid,schema_version:inquirySchema+1}, {...valid,kind:"claim_record"}, {...valid,type:"true"}, {...valid,lang:"fr"}, {...valid,lang:undefined}, {...valid,support:4}, {...valid,revision:undefined}, {...valid,positions:undefined}]) {
    assert.throws(()=>parseInquiry(JSON.stringify(data)));
  }
  assert.throws(()=>parseInquiry("{oops"));
});

test("field and file limits fail before replacing an existing note", () => {
  const current = createInquiry({question:"Keep this note"});
  const tooLong = {...current,claim:"x".repeat(maxFieldLength+1)};
  assert.throws(()=>parseInquiry(JSON.stringify(tooLong)));
  assert.throws(()=>parseInquiry(" ".repeat(maxInquiryFileSize+1)));
  assert.equal(current.question,"Keep this note");
  assert.equal(createInquiry({claim:"x".repeat(maxFieldLength)}).claim.length,maxFieldLength);
});

test("imported extra properties cannot become note fields or alter prototypes", () => {
  const note = createInquiry({question:"An ordinary question"});
  const malicious = JSON.parse(JSON.stringify(note).slice(0,-1)+',"__proto__":{"polluted":true},"review_status":"reviewed","html":"<img onerror=alert(1)>"}');
  const clean = parseInquiry(JSON.stringify(malicious));
  assert.equal(Object.hasOwn(clean,"__proto__"),false);
  assert.equal(Object.hasOwn(clean,"review_status"),false);
  assert.equal(Object.hasOwn(clean,"html"),false);
  assert.equal({}.polluted,undefined);
  assert.deepEqual(clean,note);
});

test("project status counts recorded review separately from volume and automation configuration", () => {
  const registry = {claims:[{review_status:"unreviewed",human_review:null},{review_status:"in_review",human_review:{reviewer:"Someone"}},{review_status:"reviewed",human_review:null}]};
  const topics = [{state:"draft"},{state:"open"},{state:"proposed"}];
  const stats = summarizeProject(registry,topics,{updated_at:null,items:[],agents_enabled:true},{items:[{}],updated_at:"2026-11-05"});
  assert.deepEqual(stats,{claims:3,reviewed:0,topics:3,drafts:1,proposals:1,open:1,discovery:{items:0,updated_at:null},criticism:{items:1,updated_at:"2026-11-05"}});
  registry.claims.push({review_status:"reviewed",human_review:{reviewer:"Named reviewer"}});
  assert.equal(summarizeProject(registry,topics,{},{items:[]}).reviewed,0);
});

test("project status counts only reviews bound to the displayed version and content", () => {
  const claim = {id:"TEST-001",version:1,statement:{de:"Testaussage",en:"Test claim"},review_status:"reviewed",human_review:null};
  claim.human_review = {reviewer:"Synthetic test reviewer",date:"2026-11-06",method:{de:"Testmethode",en:"Test method"},decision:{de:"Testentscheidung",en:"Test decision"},claim_version:1,content_sha256:claimReviewFingerprint(claim)};
  const registry = {claims:[claim]};
  const count = () => summarizeProject(registry,[],{},{}).reviewed;
  assert.equal(count(),1);
  claim.statement.en="Changed claim";
  assert.equal(count(),0);
  claim.statement.en="Test claim";claim.version=2;
  assert.equal(count(),0);
  claim.version=1;delete claim.human_review.claim_version;
  assert.equal(count(),0);
  claim.human_review.claim_version=1;delete claim.human_review.method;
  assert.equal(count(),0);
});


test("three-step notes remain unclassified and round-trip without invented detail", () => {
  const values = {question:"Mein erster Gedanke", objection:"Eine andere Erklärung ist möglich.", action:"Eine offene Frage klären."};
  const note = createInquiry(values);
  assert.equal(note.type,"unclassified");
  assert.deepEqual(parseInquiry(JSON.stringify(note)),note);
  for (const key of ["claim","scope","support","positions","revision"]) assert.equal(note[key],"");
  assert.match(inquiryMarkdown(note),/Aussageart: Noch nicht eingeordnet/);
  assert.match(inquiryMarkdown(createInquiry(values,"en")),/Claim type: Not classified yet/);
});

test("previous version-one detailed exports retain their classification and every field", () => {
  const oldFields = ["question","claim","scope","support","objection","revision","action"];
  const values = Object.fromEntries(oldFields.map(key => [key,`Preserve ${key}`]));
  for (const type of ["empirical","formal","normative","interpretive","metaphor"]) {
    const legacy = {schema_version:1,kind:"inquiry_note",lang:"de",type,...values};
    assert.deepEqual(parseInquiry(JSON.stringify(legacy)),{...legacy,schema_version:inquirySchema,positions:""});
  }
});


test("hearing agreement or dissent adds no evidence to a worksheet", () => {
  const positions = "Residents agree on the cost but disagree on how to spend it.";
  for (const lang of ["de", "en"]) {
    const note = createInquiry({type:"normative",positions},lang);
    const reopened = parseInquiry(JSON.stringify(note));
    assert.equal(reopened.support,"");
    assert.equal(reopened.positions,positions);
    const heading = lang === "de" ? "Zustimmung, Dissens und fehlende Perspektiven" : "Agreement, disagreement and missing perspectives";
    assert.ok(inquiryMarkdown(reopened).includes(`## ${heading}\n\n${positions}`));
  }
});

test("a valid worksheet with full-length fields still fits the import limit", () => {
  const values = Object.fromEntries(inquiryFields.map(key => [key,"\u0000".repeat(maxFieldLength)]));
  const note = createInquiry(values);
  const exported = JSON.stringify(note, null, 2);
  assert.ok(Buffer.byteLength(exported) < maxInquiryFileSize);
  assert.deepEqual(parseInquiry(exported),note);
});

test("every direction check can stop a step and open checks cannot count as yes", () => {
  const combinations = directionChecks.reduce((partial, key) => partial.flatMap(direction =>
    directionStates.map(state => ({...direction, [key]: state}))), [{}]);
  const outcomes = {revise: 0, clarify: 0, review: 0, unassessed: 0};
  for (const direction of combinations) {
    const result = assessDirection(direction);
    outcomes[result]++;
    if (Object.values(direction).includes("no")) assert.equal(result, "revise");
  }
  assert.deepEqual(outcomes, {revise: 65, clarify: 14, review: 1, unassessed: 1});
  assert.equal(assessDirection({evidence:"yes", agency:"yes", care:"yes", repair:"yes"}), "review");
});

test("direction checks survive export without treating consent or evidence as established", () => {
  const direction = {evidence:"yes", agency:"no", care:"open", repair:"yes"};
  for (const lang of ["de", "en"]) {
    const note = createInquiry({action:"Publish the contribution", direction}, lang);
    const reopened = parseInquiry(JSON.stringify(note));
    assert.deepEqual(reopened, note);
    assert.equal(reopened.support, "");
    assert.equal(reopened.positions, "");
    assert.match(inquiryMarkdown(reopened), lang === "de" ? /Halte inne/ : /Pause/);
    assert.match(inquiryMarkdown(reopened), lang === "de" ? /bleibt ein Nein wirksam\? Nein/ : /would a no be respected\? No/);
  }
});

test("older notes and unopened direction checks stay optional; malformed checks are rejected", () => {
  const note = createInquiry({action:"Proposed step", positions:"Unresolved dissent"});
  assert.deepEqual(parseInquiry(JSON.stringify({...note, schema_version:2})), note);
  const open = {evidence:"open", agency:"open", care:"open", repair:"open"};
  assert.deepEqual(createInquiry({...note, direction:open}), note);
  assert.doesNotMatch(inquiryMarkdown(note), /Liebe als Richtung/);
  for (const direction of [null, [], {...open, care:"great"}, {...open, evidence:undefined}]) {
    assert.throws(() => parseInquiry(JSON.stringify({...note, direction})), /Invalid direction check/);
  }
  assert.throws(() => createInquiry({direction:{...open, agency:"yes"}}), /needs a next step/);
});
