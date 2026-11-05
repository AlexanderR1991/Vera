import test from "node:test";
import assert from "node:assert/strict";
import {createInquiry,parseInquiry,inquiryMarkdown,inquiryFields,missingInquiryFields,summarizeProject,maxFieldLength} from "../src/lib/inquiry.mjs";

test("unfinished notes can be exported, reopened and completed without invented evidence", () => {
  const note = createInquiry({question:"  Was ist hier unbekannt?  ",type:"normative"});
  assert.equal(note.question,"Was ist hier unbekannt?");
  assert.equal(note.support,"");
  assert.equal(missingInquiryFields(note).length,6);
  assert.deepEqual(parseInquiry(JSON.stringify(note)),note);
  const reopened = createInquiry({...parseInquiry(JSON.stringify(note)),objection:"Ein dauerhafter Zielkonflikt."});
  assert.equal(missingInquiryFields(reopened).length,5);
  assert.match(inquiryMarkdown(reopened),/^# WIRKLICH · Prüfblatt\n/);
  assert.match(inquiryMarkdown(reopened),/Ungeprüfter eigener Entwurf/);
  assert.match(inquiryMarkdown(reopened),/Aussageart: Normatives Urteil/);
});

test("English notes keep Unicode, quotes and multiline contents through JSON and text exports", () => {
  const values = Object.fromEntries(inquiryFields.map(key=>[key,`Line one: ${key}\n“Würde, Freiheit” <script>alert(1)</script>`]));
  const note = createInquiry({...values,type:"interpretive"},"en");
  assert.deepEqual(parseInquiry(JSON.stringify(note)),note);
  const md = inquiryMarkdown(note);
  assert.match(md,/^# REALLY\? · Inquiry worksheet\n/);
  assert.match(md,/Unreviewed personal draft/);
  assert.match(md,/Interpretation \/ experience/);
  assert.match(md,/## What would change my position\?/);
  assert.ok(md.includes(note.objection));
});

test("import rejects foreign schemas, unknown types, invalid language and malformed fields", () => {
  const valid = createInquiry({question:"A question"});
  for (const data of [null,[],{}, {...valid,schema_version:2}, {...valid,kind:"claim_record"}, {...valid,type:"true"}, {...valid,lang:"fr"}, {...valid,lang:undefined}, {...valid,support:4}, {...valid,revision:undefined}]) {
    assert.throws(()=>parseInquiry(JSON.stringify(data)));
  }
  assert.throws(()=>parseInquiry("{oops"));
});

test("field and file limits fail before replacing an existing note", () => {
  const current = createInquiry({question:"Keep this note"});
  const tooLong = {...current,claim:"x".repeat(maxFieldLength+1)};
  assert.throws(()=>parseInquiry(JSON.stringify(tooLong)));
  assert.throws(()=>parseInquiry(" ".repeat(256*1024+1)));
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
  assert.equal(summarizeProject(registry,topics,{},{items:[]}).reviewed,1);
});
