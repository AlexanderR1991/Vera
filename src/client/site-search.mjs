import {prepareSearchEntries, searchEntries} from "../lib/site-search-match.mjs";

const header = document.querySelector("[data-site-search]");
if (header) {
  const en = header.dataset.lang === "en";
  const t = (de, english) => en ? english : de;
  const form = header.querySelector("form");
  const input = header.querySelector("[data-site-search-input]");
  const panel = header.querySelector("[data-site-search-panel]");
  const status = header.querySelector("[data-site-search-status]");
  const list = header.querySelector("[data-site-search-results]");
  const all = header.querySelector("[data-site-search-all]");
  const page = document.querySelector("[data-search-page]");
  const types = {
    page:t("Seite","Page"), topic:t("Themengebiet","Topic"),
    claim:t("Aussage · Entwurf","Claim · draft"), everyday:t("Alltagsfrage","Everyday question"),
    question:t("Frage · Entwurf","Question · draft"), universal:t("Grundfrage · Entwurf","Fundamental question · draft"),
    esoterik:t("Esoterik-Katalog","Esotericism catalogue")
  };
  let indexPromise;
  const index = () => {
    if (!indexPromise) indexPromise = fetch(header.dataset.indexUrl, {credentials:"same-origin"})
      .then(response => {
        if (!response.ok) throw Error("Search index unavailable: " + response.status);
        return response.json();
      }).then(data => {
        if (!Array.isArray(data.entries) || data.lang !== header.dataset.lang) throw Error("Invalid search index");
        return prepareSearchEntries(data.entries);
      });
    return indexPromise;
  };
  const element = (tag, content, className) => {
    const node = document.createElement(tag);
    if (content !== undefined) node.textContent = content;
    if (className) node.className = className;
    return node;
  };
  function result(hit, compact) {
    const li = element("li");
    const badge = element("small", types[hit.type] || hit.type);
    const link = element("a", hit.title);
    link.href = hit.href;
    li.append(badge, link);
    if (!compact && hit.description) li.append(element("p", hit.description));
    return li;
  }
  const hide = () => {panel.hidden = true;};
  async function suggest() {
    const query = input.value.trim();
    if (query.length < 2) {hide();return;}
    panel.hidden = false;
    list.replaceChildren();
    status.textContent = t("Suche läuft…","Searching…");
    all.href = form.action + "?q=" + encodeURIComponent(query);
    try {
      const entries = await index();
      if (query !== input.value.trim()) return;
      const matches = searchEntries(entries, query, 6);
      list.replaceChildren(...matches.map(hit => result(hit, true)));
      status.textContent = matches.length
        ? t("Passende Einträge", "Matching entries")
        : t("Keine Treffer. Versuche einen anderen Begriff.", "No matches. Try another term.");
    } catch {
      status.textContent = t("Suche vorübergehend nicht verfügbar.", "Search temporarily unavailable.");
    }
  }
  input.addEventListener("input", suggest);
  input.addEventListener("focus", () => {if (input.value.trim().length > 1) void suggest();});
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !panel.hidden) {hide();input.focus();}
    if (event.key === "ArrowDown" && document.activeElement === input && !panel.hidden) {
      const first = list.querySelector("a");
      if (first) {event.preventDefault();first.focus();}
    }
  });
  document.addEventListener("pointerdown", event => {if (!header.contains(event.target)) hide();});
  document.addEventListener("focusin", event => {if (!header.contains(event.target)) hide();});

  if (page) {
    const query = (new URLSearchParams(location.search).get("q") || "").slice(0, 120).trim();
    const pageInput = page.querySelector("[data-search-page-input]");
    const pageStatus = page.querySelector("[data-search-page-status]");
    const pageResults = page.querySelector("[data-search-page-results]");
    pageInput.value = query;
    input.value = query;
    if (query.length < 2) {
      pageStatus.textContent = t("Gib mindestens zwei Zeichen ein, um veröffentlichte Inhalte zu finden.",
        "Enter at least two characters to search published content.");
    } else {
      pageStatus.textContent = t("Suche läuft…","Searching…");
      void index().then(entries => {
        const matches = searchEntries(entries, query, 60);
        pageResults.replaceChildren(...matches.map(hit => result(hit, false)));
        pageStatus.textContent = matches.length
          ? (matches.length === 60
              ? t("Erste 60 Treffer für „", "First 60 matches for “") + query + "”"
              : matches.length + t(" Treffer für „", " matches for “") + query + "”")
          : t("Keine Treffer für „", "No matches for “") + query + "”. " +
            t("Versuche ein anderes Stichwort.", "Try another keyword.");
      }).catch(() => {
        pageStatus.textContent = t("Der Suchindex konnte nicht geladen werden.",
          "The search index could not be loaded.");
      });
    }
  }
}
