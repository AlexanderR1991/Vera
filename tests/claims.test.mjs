import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {validateRegister} from "../scripts/validate-claims.mjs";
const original=JSON.parse(await readFile(new URL("../public/knowledge/claims.json",import.meta.url),"utf8"));
test("the register corpus satisfies its structural contract",()=>{
 assert.deepEqual(validateRegister(original),[]);
});
test("a normative principle cannot be promoted into formal proof",()=>{
 const data=structuredClone(original);data.claims[0].epistemic_status="formal_proof";
 assert.ok(validateRegister(data).some(x=>x.includes("formal proof requires a formal claim")));
});
test("reviewed labels cannot be added without an accountable review",()=>{
 const data=structuredClone(original);data.claims[0].review_status="reviewed";data.claims[0].human_review=null;
 assert.ok(validateRegister(data).some(x=>x.includes("requires an accountable human review")));
});
test("provenance alone cannot support an empirical result",()=>{
 const data=structuredClone(original);data.claims[2].epistemic_status="source_supported";
 assert.ok(validateRegister(data).some(x=>x.includes("require an evidence source")));
});
test("stable identifiers, translations and revision records cannot silently disappear",()=>{
 const data=structuredClone(original);data.claims[1].id=data.claims[0].id;
 delete data.claims[2].revision_condition.en;data.claims[0].version=2;
 const errors=validateRegister(data);
 assert.ok(errors.some(x=>x.includes("duplicate identifier")));
 assert.ok(errors.some(x=>x.includes("missing bilingual revision_condition")));
 assert.ok(errors.some(x=>x.includes("preserve each version")));
});
