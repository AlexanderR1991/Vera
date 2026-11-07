(()=>{
"use strict";
document.documentElement.classList.add("has-js");
const en=document.documentElement.lang==="en";
const modes=[...document.querySelectorAll("[data-reading-mode]")];
if(modes.length){
 const set=mode=>{document.querySelectorAll("[data-depth]").forEach(e=>{e.hidden=e.dataset.depth!==mode;});modes.forEach(b=>{const on=b.dataset.readingMode===mode;b.classList.toggle("is-active",on);b.setAttribute("aria-pressed",String(on));});};
 modes.forEach(b=>b.addEventListener("click",()=>set(b.dataset.readingMode)));set("simple");
}
const cards=[...document.querySelectorAll("[data-atlas-card]")],search=document.querySelector("[data-atlas-search]"),filters=[...document.querySelectorAll("[data-atlas-filter]")];
if(cards.length){
 let category="alle";const normalize=s=>s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
 const refresh=()=>{
  const term=normalize((search?.value||"").trim());let count=0;
  cards.forEach(card=>{const show=(category==="alle"||card.dataset.category===category)&&normalize(card.dataset.search||"").includes(term);card.hidden=!show;if(show)count++;});
  const result=document.querySelector("[data-atlas-count]");if(result)result.textContent=en?count+" field"+(count===1?"":"s"):count+" Themenfeld"+(count===1?"":"er");
  const empty=document.querySelector("[data-atlas-empty]");if(empty)empty.hidden=count>0;
 };
 filters.forEach(btn=>btn.addEventListener("click",()=>{category=btn.dataset.atlasFilter;filters.forEach(b=>{const active=b===btn;b.classList.toggle("is-active",active);b.setAttribute("aria-pressed",String(active));});refresh();}));
 search?.addEventListener("input",refresh);refresh();
}
const proofButtons=[...document.querySelectorAll("[data-proof-filter]")],proofCards=[...document.querySelectorAll("[data-proof-card]")];
proofButtons.forEach(btn=>btn.addEventListener("click",()=>{
 const category=btn.dataset.proofFilter;
 proofButtons.forEach(b=>{const on=b===btn;b.classList.toggle("is-active",on);b.setAttribute("aria-pressed",String(on));});
 proofCards.forEach(card=>{card.hidden=category!=="alle"&&card.dataset.kind!==category;});
}));
const form=document.querySelector("[data-issue-builder]");
if(form)form.addEventListener("submit",e=>{
 e.preventDefault();if(!form.reportValidity())return;
 const data=new FormData(form),kind=String(data.get("art")||"").trim(),place=String(data.get("stelle")||"").trim(),thought=String(data.get("gedanke")||"").trim();
 if(thought.length<10)return;
 const title="["+kind+"] "+(place||(en?"General":"Allgemein"));
 const body=en?
 "## Contribution\n"+kind+"\n\n## Relevant passage\n"+(place||"General")+"\n\n## Question or objection\n"+thought+"\n\n## Sources and suggested revision\n[Optional]\n":
 "## Art des Beitrags\n"+kind+"\n\n## Betroffene Stelle\n"+(place||"Allgemein")+"\n\n## Gedanke / Einwand\n"+thought+"\n\n## Quellen und mögliche Korrektur\n[Optional ergänzen]\n";
 location.assign("https://github.com/AlexanderR1991/Vera/issues/new?title="+encodeURIComponent(title)+"&body="+encodeURIComponent(body));
});
if(form)form.hidden=false;
// The homepage filter only searches its own visible tiles; it is not a site-wide knowledge search.
const boardFilter=document.querySelector("[data-board-filter]");
if(boardFilter){
 const items=[...document.querySelectorAll("[data-board-card]")];
 const counter=document.querySelector("[data-board-counter]");
 const empty=document.querySelector("[data-board-empty]");
 const clean=(s)=>String(s||"").toLocaleLowerCase(document.documentElement.lang==="en"?"en":"de").normalize("NFD").replace(/[\u0300-\u036f]/g,"");
 const apply=()=>{
  const query=clean(boardFilter.value.trim());
  let shown=0;
  items.forEach(item=>{const matches=clean(item.dataset.boardKeywords).includes(query);item.hidden=!matches;if(matches)shown++;});
  if(counter)counter.textContent=shown+" "+(en?(shown===1?"entry":"entries"):(shown===1?"Zugang":"Zugänge"));
  if(empty)empty.hidden=shown!==0;
 };
 boardFilter.addEventListener("input",apply);
 boardFilter.addEventListener("search",apply);
 apply();
}
})();