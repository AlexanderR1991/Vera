// Exercise the actual client with synthetic clipboard promises; no OS clipboard access.
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const repo=fileURLToPath(new URL('../',import.meta.url));
const core=await import(pathToFileURL(resolve(repo,'src/lib/mediated-dialogue.mjs')));
const client=readFileSync(resolve(repo,'src/client/mediated-dialogue.mjs'),'utf8').replace(/^import .*;\n/m,'').replace('export function mountMediation','function mountMediation');
const component=readFileSync(resolve(repo,'src/components/MediatedDialogue.astro'),'utf8');
const front=component.match(/^---\n([\s\S]*?)\n---/)[1].replace(/^import .*;\n/gm,'').replace('(de: string, en: string)','(de, en)');
function copyFor(lang){return vm.runInNewContext(front+'\n;({messages,aiPrompt,answers});',{Astro:{props:{lang}}});}
class Element{
 constructor(dataset={}){this.dataset=dataset;this.value='';this.textContent='';this.hidden=false;this.disabled=false;this.open=false;this.handlers={};this.focusCalls=0;this.options=[];}
 addEventListener(name,fn){this.handlers[name]=fn;}
 focus(){this.focusCalls++;}
 emit(name){if(!this.disabled)return this.handlers[name]?.();}
 click(){return this.emit('click');}
}
function deferred(){let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};}
const flush=()=>new Promise(r=>setImmediate(r));
function fixture(lang){
 const data=copyFor(lang),root=new Element({copy:JSON.stringify(data.messages)}),nodes={};
 for(const key of ['session','ended','workspace','gate','gate-title','opt-in','ready-status','uncertain','actor','phase','claim','observe','unobserve','result','rest-note','owner','follow-up','observers','pause','stop','copy-status','copy-prompt','prompt'])nodes[key]=new Element();
 nodes.prompt.textContent=data.aiPrompt;nodes.phase.value='today';
 const afterChange=new Element();nodes.phase.querySelector=()=>afterChange;
 const endedHeading=new Element();nodes.ended.querySelector=()=>endedHeading;
 const ready=['A','B'].map(actor=>new Element({ready:actor}));
 const frames=['proposal','condition'].map(frame=>new Element({frame}));
 const answers=['listen','support'].map(answer=>{const e=new Element({answer});e.options=data.answers.map(([value,text])=>({value,text}));return e;});
 const records=['listen','support'].flatMap(record=>['A','B'].map(person=>new Element({record,person})));
 const details=[nodes['opt-in'],new Element()];
 root.querySelector=selector=>nodes[selector.match(/^\[data-(.*)\]$/)[1]];
 root.querySelectorAll=selector=>({'[data-ready]':ready,'[data-frame]':frames,'[data-answer]':answers,'[data-record]':records,'details':details}[selector]||[]);
 const windowHandlers={};const pending=[],requested=[];
 const window={addEventListener:(name,fn)=>windowHandlers[name]=fn};
 const navigator={clipboard:{writeText:text=>{requested.push(text);const task=deferred();pending.push(task);return task.promise;}}};
 vm.runInNewContext(client+'\n;mountMediation(root);',{root,window,navigator,...core});
 const activate=()=>{ready[0].click();ready[1].click();frames[0].value='Synthetic proposal, never a clipboard payload.';frames[0].emit('input');frames[1].value='Synthetic condition, never a clipboard payload.';frames[1].emit('input');nodes.claim.click();};
 const projection=()=>({sessionHidden:nodes.session.hidden,endedHidden:nodes.ended.hidden,workspaceHidden:nodes.workspace.hidden,gateHidden:nodes.gate.hidden,frames:frames.map(x=>x.value),actor:nodes.actor.value,phase:nodes.phase.value,result:nodes.result.textContent});
 activate();
 return {data,nodes,ready,frames,pending,requested,activate,projection,pagehide:()=>windowHandlers.pagehide()};
}

async function settleCopy(x,index,outcome){
 const before=x.projection();
 if(outcome==='success')x.pending[index].resolve();else x.pending[index].reject(Error('Synthetic clipboard error'));
 await flush();assert.deepEqual(x.projection(),before);
 assert.ok(x.requested.every(text=>text===x.data.aiPrompt));
}

test('only the latest clipboard attempt may update mediation feedback',async()=>{
 for(const lang of ['de','en']){
  const single=fixture(lang);single.nodes['copy-prompt'].click();await settleCopy(single,0,'success');
  assert.equal(single.nodes['copy-status'].textContent,single.data.messages.copied);
  single.nodes['copy-prompt'].click();assert.equal(single.nodes['copy-status'].textContent,'');
  await settleCopy(single,1,'reject');assert.equal(single.nodes['copy-status'].textContent,single.data.messages.selectCopy);
  for(const first of ['success','reject'])for(const second of ['success','reject'])for(const order of [[0,1],[1,0]]){
   const x=fixture(lang);x.nodes['copy-prompt'].click();x.nodes['copy-prompt'].click();let expected='';
   for(const index of order){
    const outcome=index===0?first:second;
    if(index===1)expected=x.data.messages[outcome==='success'?'copied':'selectCopy'];
    await settleCopy(x,index,outcome);assert.equal(x.nodes['copy-status'].textContent,expected);
   }
  }
 }
});

test('ending or leaving mediation invalidates pending clipboard feedback',async()=>{
 for(const lang of ['de','en'])for(const action of ['stop','pagehide'])for(const outcome of ['success','reject']){
  const x=fixture(lang);x.nodes['copy-prompt'].click();
  if(action==='stop')x.nodes.stop.click();else x.pagehide();
  assert.equal(x.nodes['copy-status'].textContent,'');assert.deepEqual(x.frames.map(f=>f.value),['','']);
  await settleCopy(x,0,outcome);assert.equal(x.nodes['copy-status'].textContent,'');
 }
 for(const lang of ['de','en'])for(const first of ['success','reject'])for(const second of ['success','reject']){
  const x=fixture(lang);x.nodes['copy-prompt'].click();x.pagehide();x.activate();x.nodes['copy-prompt'].click();
  await settleCopy(x,1,second);const latest=x.data.messages[second==='success'?'copied':'selectCopy'];
  assert.equal(x.nodes['copy-status'].textContent,latest);
  await settleCopy(x,0,first);assert.equal(x.nodes['copy-status'].textContent,latest);
 }
});
