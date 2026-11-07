import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {topics} from "../src/lib/tree.mjs";
import {ui} from "../src/lib/ui.mjs";
import {checkLanguagePairs} from "../scripts/validate-i18n.mjs";

const read=relative=>readFileSync(new URL("../"+relative,import.meta.url),"utf8");
const catalog=JSON.parse(read("public/knowledge/esoterik-tree.json"));
const sourceIds=new Set(catalog.sources.map(source=>source.id));
const topicIds=new Set(topics.map(topic=>topic.id));
const kinds=new Set(Object.keys(catalog.kind_labels));
const names=new Set();
const label=pair=>pair&&typeof pair.de==="string"&&pair.de.trim()&&typeof pair.en==="string"&&pair.en.trim();

test("the esoteric research index remains an openly revisable DE/EN editorial draft",()=>{
 assert.equal(catalog.schema_version,1);
 assert.equal(catalog.status,"unreviewed_editorial_draft");
 assert.equal(catalog.snapshot,"2026-11-07");
 assert.deepEqual(catalog.languages,["de","en"]);
 assert.deepEqual(checkLanguagePairs(catalog),[]);
 assert.ok(label(catalog.scope));
 assert.deepEqual([...kinds].sort(),["empirical","experience","formal","history","interpretation","normative"].sort());
 assert.ok(catalog.sources.length>=6);
 for(const source of catalog.sources)assert.match(source.url,/^https:\/\//);
});

test("at least a hundred distinct, sourced questions connect the esoteric sub-tree to WIRKLICH",()=>{
 assert.ok(catalog.branches.length>=15);
 let leaves=0;
 const ids=new Set();
 for(const [index,root] of catalog.branches.entries()){
  assert.equal(root.id,"ESO-"+String(index+1).padStart(2,"0"));
  assert.ok(!ids.has(root.id));ids.add(root.id);
  assert.ok(label(root.title)&&label(root.intro));
  assert.ok(root.children.length>=6);
  assert.ok(root.source_ids.length>0);
  assert.ok(root.topics.length>0);
  for(const sourceId of root.source_ids)assert.ok(sourceIds.has(sourceId),"Missing source "+sourceId);
  for(const topicId of root.topics)assert.ok(topicIds.has(topicId),"Missing global topic "+topicId);
  for(const [n,item] of root.children.entries()){
   assert.equal(item.id,root.id+"."+String(n+1).padStart(2,"0"));
   assert.ok(!ids.has(item.id),"Repeated ID "+item.id);ids.add(item.id);
   for(const property of ["title","context","question"])assert.ok(label(item[property]),"Missing bilingual "+property+" in "+item.id);
   assert.ok(item.question.de.length>=20&&item.question.en.length>=20,"Question too thin: "+item.id);
   assert.ok(kinds.has(item.kind),"Unrecognized method: "+item.id);
   names.add(item.title.de);
   leaves++;
  }
 }
 assert.ok(leaves>=100,"An extensive catalogue should have at least 100 subbranches");
 assert.equal(leaves,134,"Check count stated in editorial descriptions");
 assert.ok(names.size>=125,"Repeated names conceal distinct questions");
});

test("the static catalogue and public proposal route permit human discussion, not automatic votes or promotion",()=>{
 const component=read("src/components/EsoterikCatalog.astro");
 const tree=read("src/components/KnowledgeTree.astro");
 const forum=read("src/components/Forum.astro");
 const template=read(".github/ISSUE_TEMPLATE/esoterik-ast.yml");
 const sitemap=read("src/pages/sitemap.xml.js");
 for(const source of [component,tree,forum])assert.match(source,/esoterik-tree\.json/);
 for(const token of ["data-esoteric-branch","data-esoteric-item","data-esoteric-query","data-esoteric-kind","<details","issues\/new\?template=esoterik-ast\.yml","unreviewed"])assert.ok(component.includes(token),"Missing catalogue interaction "+token);
 assert.match(tree,/tree-subbranch-grid/);
 assert.match(forum,/esoterik-forum/);
 assert.match(sitemap,/esoterik-katalog/);
 for(const field of ["id: parent","id: proposal","id: strongest","id: method","id: sources","id: others"])assert.ok(template.includes(field));
 assert.match(template,/No AI agent may post autonomously/);
 for(const lang of ["de","en"]){
  assert.ok(ui[lang].titles["esoterik-katalog"]);
  const page=read("src/pages/"+lang+"/esoterik-katalog.astro");
  assert.ok(page.includes('lang="'+lang+'"'));
 }
});
