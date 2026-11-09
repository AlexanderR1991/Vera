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
const form=document.querySelector("[data-feedback-draft]");
if(form){
 const thoughtField=form.elements.gedanke;
 thoughtField.addEventListener("input",()=>thoughtField.setCustomValidity(""));
 form.addEventListener("submit",event=>{
  event.preventDefault();
  const thought=thoughtField.value.trim();
  if(!thought){
   thoughtField.setCustomValidity(en?"Write a short observation.":"Schreib eine kurze Beobachtung.");
   thoughtField.reportValidity();
   return;
  }
  const kind=form.elements.art.value;
  const place=form.elements.stelle.value.trim()||(en?"General":"Allgemein");
  const title="["+kind+"] "+place;
  const body=en?
   "## Contribution\n"+kind+"\n\n## Relevant passage\n"+place+"\n\n## Question or objection\n"+thought+"\n":
   "## Art des Beitrags\n"+kind+"\n\n## Betroffene Stelle\n"+place+"\n\n## Gedanke / Einwand\n"+thought+"\n";
  if(event.submitter?.hasAttribute("data-open-issue")){
   if(navigator.onLine===false){
    form.querySelector("[data-form-message]").textContent=en?
     "You’re offline. Your draft is still open here. Save it as a text file or try again when you’re back online.":
     "Du bist offline. Dein Entwurf ist hier noch offen. Speichere ihn als Textdatei oder versuche es wieder, sobald du online bist.";
    return;
   }
   location.assign("https://github.com/AlexanderR1991/Vera/issues/new?title="+encodeURIComponent(title)+"&body="+encodeURIComponent(body));
   return;
  }
  const url=URL.createObjectURL(new Blob([body],{type:"text/plain;charset=utf-8"}));
  const link=document.createElement("a");
  link.href=url;
  link.download=en?"vera-feedback.txt":"vera-rueckmeldung.txt";
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),30_000);
  form.querySelector("[data-form-message]").textContent=en?
   "Download started. Your feedback has not been sent.":"Download gestartet. Deine Rückmeldung wurde nicht versendet.";
 });
 form.hidden=false;
}
})();
