import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const readJSON=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const claims=readJSON("public/knowledge/claims.json").claims;
const forum=readJSON("public/knowledge/forum-threads.json");
const project=readJSON("public/project.json");

test("every published claim has exactly one permanent forum thread",()=>{
 assert.equal(forum.schema_version,1);
 assert.equal(forum.repository,"AlexanderR1991/Wirklich");
 assert.equal(project.repository,"https://github.com/"+forum.repository);
 const ids=claims.map(claim=>claim.id);
 const threadIds=forum.threads.map(t=>t.claim_id);
 assert.deepEqual([...threadIds].sort(),[...ids].sort());
 assert.equal(new Set(threadIds).size,threadIds.length);
 assert.equal(new Set(forum.threads.map(t=>t.issue_number)).size,forum.threads.length);
 for(const thread of forum.threads){
  assert.match(thread.claim_id,/^[A-Z]+-\d{3}$/);
  assert.ok(Number.isSafeInteger(thread.issue_number)&&thread.issue_number>0);
 }
});

test("forum entry points use the registry and GitHub discussion routes",()=>{
 const component=readFileSync(new URL("../src/components/Forum.astro",import.meta.url),"utf8");
 const register=readFileSync(new URL("../src/components/ClaimRegister.astro",import.meta.url),"utf8");
 const sitemap=readFileSync(new URL("../src/pages/sitemap.xml.js",import.meta.url),"utf8");
 assert.match(component,/register\.claims\.map/);
 assert.match(component,/threads\.get\(claim\.id\)/);
 assert.match(component,/\/discussions/);
 assert.match(register,/threads\.get\(c\.id\)/);
 assert.match(sitemap,/"forum"/);
});