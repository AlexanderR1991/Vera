import {ui} from "./ui.mjs";
import {topics} from "./tree.mjs";
import project from "../../public/project.json" with {type:"json"};
import claims from "../../public/knowledge/claims.json" with {type:"json"};
import questions from "../../public/knowledge/questions.json" with {type:"json"};
import everyday from "../../public/knowledge/everyday-questions.json" with {type:"json"};
import universals from "../../public/knowledge/universal-questions.v1.json" with {type:"json"};
import esoterik from "../../public/knowledge/esoterik-tree.json" with {type:"json"};

// This is a discovery index, not an AI answer, a truth score or a review grade.
// Only already-published pages and explicitly public editorial datasets are indexed.
const base = new URL(project.website).pathname.replace(/\/?$/, "/");
const route = (lang, slug="index", anchor="") =>
  base + lang + "/" + (slug === "index" ? "" : slug + "/") + (anchor ? "#" + anchor : "");
const localized = (value, lang) => value?.[lang] ?? "";
const toAnchor = id => "ast-" + id.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export function buildSiteSearchIndex(lang) {
  if (!["de", "en"].includes(lang)) throw new Error("Unsupported search language: " + lang);
  const entries = [];
  const add = (type, title, description, href, extra="") => {
    if (!title || !href) return;
    entries.push({
      type, title,
      description: String(description || "").slice(0, 260),
      href,
      search: [title, description, extra].filter(Boolean).join(" ")
    });
  };

  for (const [slug, title] of Object.entries(ui[lang].titles)) {
    add("page", title, lang === "de" ? "Veröffentlichte Projektseite" : "Published project page",
      route(lang, slug), slug.replace(/-/g, " ") + (slug === "index" ? " WIRKLICH REALLY" : ""));
  }
  // The medicine chapter has its own page title but is not in the shared nav dictionary.
  add("page", lang === "de" ? "Medizin" : "Medicine",
    lang === "de" ? "Medizin und verantwortliche Evidenzprüfung" : "Medicine and responsible evidence review",
    route(lang, "medizin"));

  for (const topic of topics) {
    const href = topic.slug
      ? route(lang, topic.slug, topic.anchor || "")
      : route(lang, "baum-des-wissens", "ast-" + topic.id);
    add("topic", localized(topic.name, lang), localized(topic.question, lang), href,
      topic.id + " " + topic.fields.join(" "));
  }
  for (const claim of claims.claims) {
    add("claim", claim.id + " · " + localized(claim.statement, lang),
      localized(claim.scope, lang), route(lang, "aussagen", claim.id),
      [localized(claim.rationale, lang), ...(claim.counterarguments || []).map(item => localized(item, lang)),
        localized(claim.revision_condition, lang)].join(" "));
  }
  for (const item of everyday.questions) {
    add("everyday", localized(item.question, lang), localized(item.answer, lang),
      route(lang, "forum", "alltag-" + item.id),
      [item.id, localized(item.topic, lang), localized(item.challenge, lang)].join(" "));
  }
  for (const item of questions.questions) {
    add("question", item.id + " · " + localized(item.question, lang),
      lang === "de" ? "Offene Frage im Forum" : "Open question in the forum",
      route(lang, "forum", "frage-" + item.id), item.topics.join(" ") + " " + item.claim_ids.join(" "));
  }
  for (const item of universals.questions) {
    add("universal", item.id + " · " + localized(item.question, lang),
      localized(item.why, lang), route(lang, "grundfragen", item.id.toLowerCase()),
      [localized(item.challenge, lang), item.theme, item.topics.join(" ")].join(" "));
  }
  for (const branch of esoterik.branches) {
    add("esoterik", branch.id + " · " + localized(branch.title, lang),
      localized(branch.intro, lang), route(lang, "esoterik-katalog", toAnchor(branch.id)),
      branch.topics.join(" "));
    for (const child of branch.children) {
      add("esoterik", child.id + " · " + localized(child.title, lang),
        localized(child.context, lang), route(lang, "esoterik-katalog", toAnchor(child.id)),
        [localized(child.question, lang), localized(branch.title, lang), child.kind].join(" "));
    }
  }
  return {version:1, lang, scope:"published_editorial_content", entries};
}

// Only human-readable main content is used for optional full-text enrichment.
// Scripts, markup, repeated navigation and footer text are excluded.
export function extractMainText(html) {
  const main = String(html).match(/<main\b[^>]*\bid=["']inhalt["'][^>]*>([\s\S]*?)<\/main>/i);
  if (!main) return "";
  const entities = {amp:"&", lt:"<", gt:">", quot:'"', apos:"'", nbsp:" ",
    ndash:"–", mdash:"—", hellip:"…", laquo:"«", raquo:"»", rsquo:"’", ldquo:"“", rdquo:"”"};
  return main[1]
    .replace(/<(script|style|svg|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi, (match, key) => {
      if (key[0] === "#") {
        const number = key[1].toLowerCase() === "x" ? parseInt(key.slice(2), 16) : Number(key.slice(1));
        return number > 0 && number <= 0x10ffff ? String.fromCodePoint(number) : " ";
      }
      return entities[key.toLowerCase()] ?? " ";
    })
    .replace(/\s+/g, " ").trim().slice(0, 35000);
}
