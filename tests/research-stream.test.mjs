import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

test('research cards preserve supplied date precision and mark unknown legacy dates',async()=>{
 const source=await readFile(new URL('../src/components/ResearchStream.astro',import.meta.url),'utf8');
 const script=source.match(/<script is:inline>\s*([\s\S]*?)\s*<\/script>/)[1];
 class Element{
  constructor(tag){this.tagName=tag;this.children=[];this.dataset={};this.text='';}
  set textContent(value){this.text=String(value);this.children=[];}
  get textContent(){return this.text+this.children.map(child=>child.textContent).join('');}
  append(...children){this.children.push(...children);}
 }
 for(const lang of ['de','en']){
  const elements=Object.fromEntries(['research-live','stream-status','stream-meta','stream-items'].map(id=>[id,new Element('div')]));elements['research-live'].dataset.lang=lang;
  const items=[['2026-01-01','year'],['2026-11-01','month'],['2026-11-02','day'],['2026-01-01',undefined],['2026-11-01','invalid'],['',undefined]].map(([date,date_precision],i)=>({id:'synthetic:'+i,title:'Synthetic date case '+i,date,date_precision,authors:[],agent_notes:{}}));
  const data={items,agents_enabled:false,errors:[]},before=structuredClone(data);let calls=0;
  const document={getElementById:id=>elements[id],createElement:tag=>new Element(tag)};
  new vm.Script(script).runInContext(vm.createContext({document,AbortController,setTimeout,clearTimeout,fetch:async()=>{calls++;return{ok:true,json:async()=>data};}}),{timeout:1000});
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(calls,1);assert.deepEqual(data,before);
  const cards=elements['stream-items'].children.filter(child=>child.tagName==='article');assert.equal(cards.length,6);
  const expected=lang==='de'?['2026 (Jahresangabe)','2026-11 (Monatsangabe)','2026-11-02','2026-01-01 (Genauigkeit nicht dokumentiert)','2026-11-01 (Genauigkeit nicht dokumentiert)','']:['2026 (year only)','2026-11 (month only)','2026-11-02','2026-01-01 (precision not recorded)','2026-11-01 (precision not recorded)',''];
  assert.deepEqual(cards.map(card=>card.children.find(child=>child.className==='stream-detail').textContent),expected);
  for(const card of cards)assert.match(card.textContent,lang==='de'?/UNGEPRÜFT/:/UNREVIEWED/);
 }
});

test('research loading deadline covers headers and body and ignores late data',async()=>{
 const source=await readFile(new URL('../src/components/ResearchStream.astro',import.meta.url),'utf8');
 const script=source.match(/<script is:inline>\s*([\s\S]*?)\s*<\/script>/)[1];
 class Element{
  constructor(tag){this.tagName=tag;this.children=[];this.dataset={};this.text='';}
  set textContent(v){this.text=String(v);this.children=[];}
  get textContent(){return this.text+this.children.map(c=>c.textContent).join('');}
  append(...nodes){this.children.push(...nodes);}
 }
 const flush=()=>new Promise(resolve=>setImmediate(resolve));
 for(const lang of ['de','en'])for(const stage of ['headers','body','success','http_error','json_error']){
  const nodes=Object.fromEntries(['research-live','stream-status','stream-meta','stream-items'].map(id=>[id,new Element('div')]));nodes['research-live'].dataset.lang=lang;
  nodes['stream-status'].textContent='Loading';
  const data={items:[],agents_enabled:false,errors:[]};let settle,calls=0,signal,now=0,id=0;const jobs=new Map();
  const pending=new Promise(resolve=>{settle=resolve;});
  const response={ok:stage!=='http_error',status:503,json:()=>stage==='body'?pending:stage==='json_error'?Promise.reject(Error('Synthetic JSON error')):Promise.resolve(data)};
  const context={document:{getElementById:id=>nodes[id],createElement:tag=>new Element(tag)},AbortController,
   setTimeout:(fn,ms)=>{const key=++id;jobs.set(key,{fn,at:now+ms});return key;},clearTimeout:key=>jobs.delete(key),
   fetch:(_url,options)=>{calls++;signal=options.signal;return stage==='headers'?pending:Promise.resolve(response);}};
  new vm.Script(script).runInNewContext(context,{timeout:1000});await flush();
  if(stage==='headers'||stage==='body'){
   assert.equal(nodes['stream-status'].textContent,'Loading');assert.equal(jobs.size,1);
   const timer=[...jobs.entries()][0];assert.equal(timer[1].at,15000);
   now=14999;assert.equal(nodes['stream-status'].textContent,'Loading');
   now=15000;jobs.delete(timer[0]);timer[1].fn();await flush();
   assert.match(nodes['stream-status'].textContent,lang==='de'?/nicht rechtzeitig/:/in time/);
   assert.equal(signal.aborted,true);assert.equal(nodes['stream-meta'].textContent,'');assert.equal(nodes['stream-items'].textContent,'');
   const terminal=nodes['stream-status'].textContent;
   settle(stage==='headers'?response:data);await flush();
   assert.equal(nodes['stream-status'].textContent,terminal);assert.equal(nodes['stream-items'].textContent,'');
  }else if(stage==='success'){
   assert.match(nodes['stream-status'].textContent,lang==='de'?/nicht fachlich überprüft/:/not scientifically reviewed/);assert.equal(signal.aborted,false);
  }else{
   assert.match(nodes['stream-status'].textContent,lang==='de'?/keine Forschungsdaten abrufbar/:/currently unavailable/);assert.equal(signal.aborted,false);
  }
  assert.equal(jobs.size,0);assert.equal(calls,1);assert.deepEqual(data,{items:[],agents_enabled:false,errors:[]});
 }
});
