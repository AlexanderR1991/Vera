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
const board = document.querySelector("[data-board-grid]");
if (board) {
 const search = document.querySelector("[data-board-filter]");
 const topics = document.querySelector("[data-board-topics]");
 const filters = [...topics.querySelectorAll("[data-board-topic-filter]")];
 const counter = document.querySelector("[data-board-counter]");
 const empty = document.querySelector("[data-board-empty]");
 const actions = document.querySelector("[data-board-actions]");
 const more = actions.querySelector("[data-board-more]");
 const pageSize = 9;
 const format = new Intl.NumberFormat(document.documentElement.lang);
 const clean = value => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replaceAll("ß", "ss");
 const now = Date.now();
 const pinned = [...board.querySelectorAll("[data-board-trend-rank]")]
  .filter(card => Number(card.dataset.boardTrendExpires) > now)
  .sort((a, b) => Number(a.dataset.boardTrendRank) - Number(b.dataset.boardTrendRank));
 for (const card of pinned) {
  const badge = card.querySelector("[data-board-trend]");
  badge.hidden = false;
  card.setAttribute("aria-describedby", `${card.getAttribute("aria-describedby")} ${badge.id}`);
 }
 if (pinned.length) board.prepend(...pinned);
 const entries = [...board.querySelectorAll("[data-board-card]")].map(card => ({
  card,
  topic: card.dataset.boardTopic,
  words: clean(card.dataset.boardKeywords ?? ""),
 }));
 let topic = "all";
 let limit = pageSize;
 let matches = [];

 function showMatches() {
  const shown = Math.min(limit, matches.length);
  const visible = new Set(matches.slice(0, shown));
  for (const entry of entries) {
   const hidden = !visible.has(entry);
   if (entry.card.hidden !== hidden) entry.card.hidden = hidden;
  }
  const total = format.format(matches.length);
  const noun = matches.length === 1 ? (en ? "question" : "Frage") : (en ? "questions" : "Fragen");
  counter.textContent = shown === matches.length
   ? total + " " + noun
   : format.format(shown) + (en ? " of " : " von ") + total + " " + noun;
  actions.hidden = shown === matches.length;
  empty.hidden = matches.length !== 0;
 }

 function apply() {
  const terms = clean(search.value.trim()).split(/\s+/).filter(Boolean);
  limit = pageSize;
  board.toggleAttribute("data-board-overview", topic === "all" && terms.length === 0);
  matches = entries.filter(entry => (topic === "all" || entry.topic === topic) &&
   terms.every(term => entry.words.includes(term)));
  showMatches();
 }

 function selectTopic(next) {
  topic = next;
  for (const filter of filters) filter.setAttribute("aria-pressed", String(filter.dataset.boardTopicFilter === topic));
  apply();
 }

 for (const filter of filters) filter.addEventListener("click", () => selectTopic(filter.dataset.boardTopicFilter));
 search.addEventListener("input", apply);
 more.addEventListener("click", () => {
  const next = matches[limit];
  limit += pageSize;
  showMatches();
  next?.card.focus();
 });
 empty.querySelector("[data-board-reset]").addEventListener("click", () => {
  search.value = "";
  selectTopic("all");
  search.focus();
 });

 apply();
 search.closest("[data-board-filter-wrap]").hidden = false;
 topics.hidden = false;
}
})();
