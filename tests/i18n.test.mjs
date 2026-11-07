import test from "node:test";
import assert from "node:assert/strict";
import {checkLanguagePairs,checkReviewEntry,checkInternationalization} from "../scripts/validate-i18n.mjs";

test("nested multilingual data cannot silently lose a language",()=>{
 assert.deepEqual(checkLanguagePairs({title:{de:"Wahrheit",en:"Truth"},examples:[{de:"Beleg",en:"Evidence"}]}),[]);
 assert.match(checkLanguagePairs({statement:{de:"Wahrheit"}}).join(" "),/counterpart is missing/);
 assert.match(checkLanguagePairs({statement:{de:"Wahrheit",en:"   "}}).join(" "),/blank/);
 assert.match(checkLanguagePairs({statement:{de:["A"],en:"A"}}).join(" "),/incompatible/);
});
test("review cannot be granted without traceable human attestation",()=>{
 const entry={status:"reviewed",reviewer:null,reviewed_at:null,source_commit:null,review_url:null};
 assert.ok(checkReviewEntry(entry,"sample").length>=3);
 const passed={...entry,reviewer:"Human reviewer",reviewed_at:"2026-11-07",source_commit:"a".repeat(40),review_url:"https://github.com/example/repo/pull/1"};
 assert.deepEqual(checkReviewEntry(passed,"sample"),[]);
 assert.match(checkReviewEntry({...passed,status:"draft"},"sample").join(" "),/masquerade/);
});
test("actual repository locale routes, JSON pairs and document registry stay consistent",async()=>{
 assert.deepEqual(await checkInternationalization(),[]);
});
