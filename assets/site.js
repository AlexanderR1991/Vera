(()=>{
"use strict";
const doc=document.documentElement;
doc.classList.add("has-js");
const toggle=document.querySelector("[data-menu-toggle]");
const nav=document.querySelector(".site-nav");
if(toggle&&nav){
  const close=()=>{toggle.setAttribute("aria-expanded","false");nav.classList.remove("is-open");};
  toggle.addEventListener("click",()=>{const open=toggle.getAttribute("aria-expanded")!=="true";toggle.setAttribute("aria-expanded",String(open));nav.classList.toggle("is-open",open);});
  nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",close));
  document.addEventListener("keydown",e=>{if(e.key==="Escape")close();});
}
const readingButtons=[...document.querySelectorAll("[data-reading-mode]")];
if(readingButtons.length){
  const setMode=mode=>{
    document.querySelectorAll("[data-depth]").forEach(node=>{node.hidden=node.dataset.depth!==mode;});
    readingButtons.forEach(btn=>{const active=btn.dataset.readingMode===mode;btn.setAttribute("aria-pressed",String(active));btn.classList.toggle("is-active",active);});
  };
  readingButtons.forEach(btn=>btn.addEventListener("click",()=>setMode(btn.dataset.readingMode)));
  setMode("simple");
}
const atlasCards=[...document.querySelectorAll("[data-atlas-card]")];
const atlasSearch=document.querySelector("[data-atlas-search]");
const atlasFilters=[...document.querySelectorAll("[data-atlas-filter]")];
if(atlasCards.length){
 let filter="alle";
 const normalize=s=>s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
 const update=()=>{
   const query=normalize((atlasSearch?.value||"").trim());
   let count=0;
   atlasCards.forEach(card=>{const ok=(filter==="alle"||card.dataset.category===filter)&&normalize(card.dataset.search||"").includes(query);card.hidden=!ok;if(ok)count++;});
   const label=document.querySelector("[data-atlas-count]");
   if(label)label.textContent=count+" Themenfeld"+(count===1?"":"er");
   const empty=document.querySelector("[data-atlas-empty]");
   if(empty)empty.hidden=count!==0;
 };
 atlasFilters.forEach(btn=>btn.addEventListener("click",()=>{filter=btn.dataset.atlasFilter;atlasFilters.forEach(b=>{const on=b===btn;b.classList.toggle("is-active",on);b.setAttribute("aria-pressed",String(on));});update();}));
 atlasSearch?.addEventListener("input",update);
 update();
}
const proofButtons=[...document.querySelectorAll("[data-proof-filter]")];
const proofCards=[...document.querySelectorAll("[data-proof-card]")];
if(proofButtons.length){
 proofButtons.forEach(btn=>btn.addEventListener("click",()=>{
   const kind=btn.dataset.proofFilter;
   proofButtons.forEach(b=>{const on=b===btn;b.classList.toggle("is-active",on);b.setAttribute("aria-pressed",String(on));});
   proofCards.forEach(card=>card.hidden=kind!=="alle"&&card.dataset.kind!==kind);
 }));
}
const form=document.querySelector("[data-issue-builder]");
if(form){
 form.addEventListener("submit",e=>{
   e.preventDefault();
   if(!form.reportValidity())return;
   const fd=new FormData(form);
   const art=String(fd.get("art")||"Frage");
   const stelle=String(fd.get("stelle")||"Allgemein").trim();
   const gedanke=String(fd.get("gedanke")||"").trim();
   if(gedanke.length<10)return;
   const title="["+art+"] "+(stelle||"Allgemeiner Beitrag");
   const body="## Art des Beitrags\n"+art+"\n\n## Betroffene Stelle\n"+(stelle||"Allgemein")+"\n\n## Gedanke / Einwand\n"+gedanke+"\n\n## Quellen und mögliche Korrektur\n[Optional ergänzen]\n";
   const url="https://github.com/AlexanderR1991/Vera/issues/new?title="+encodeURIComponent(title)+"&body="+encodeURIComponent(body);
   window.location.assign(url);
 });
}
})();