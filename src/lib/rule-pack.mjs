import foundation from "../../docs/grundtext.md?raw";
import method from "../../docs/methode.md?raw";
import promptDe from "../../public/prompts/erkenntnisprompt-v1.de.txt?raw";
import promptEn from "../../public/prompts/erkenntnisprompt-v1.en.txt?raw";
import project from "../../public/project.json" with {type: "json"};
import translations from "../i18n/shared.en.json" with {type: "json"};

export const rulePackPath = lang => `prompts/wirklich-regeln.${lang}.txt`;

function translate(text) {
  if (!Object.hasOwn(translations, text)) throw Error("Missing English thesis translation: " + text);
  return translations[text];
}

function theses(lang) {
  const sections = foundation.split(/^## /m).filter(section => section.startsWith("These "));
  if (!sections.length) throw Error("No theses found in docs/grundtext.md");
  return sections.map(section => {
    if (lang === "de") return section.trim();
    const [heading, ...paragraphs] = section.trim().split(/\r?\n\s*\r?\n/);
    const [, number, title] = /^These (\d+): (.+)$/.exec(heading);
    return [`Thesis ${number}: ${translate(title)}`, ...paragraphs.map(translate)].join("\n\n");
  }).join("\n\n");
}

export function rulePack(lang) {
  if (!["de", "en"].includes(lang)) throw Error("Unknown rule pack language: " + lang);
  const en = lang === "en";
  const methods = method.split(/^## English\s*$/m);
  if (methods.length !== 2 || methods.some(section => !section.trim())) {
    throw Error("Expected DE and EN sections in docs/methode.md");
  }
  const revision = process.env.GITHUB_SHA || "main";
  const source = `${project.repository}/blob/${revision}/`;
  const sourceFiles = [
    "docs/grundtext.md",
    ...(en ? ["src/i18n/shared.en.json"] : []),
    "docs/methode.md",
    `public/prompts/erkenntnisprompt-v1.${lang}.txt`
  ];
  const localMethod = methods[en ? 1 : 0].trim().replace(/\]\(([^)\s]+)\)/g,
    (_, target) => `](${new URL(target, source + "docs/methode.md").href})`);
  return [
    en ? `${project.english_name} · Rules for your AI (English translation draft)` : `${project.name} · Regelwerk für deine KI`,
    en
      ? "Use this text to examine my question. Treat the theses below as philosophical proposals open to challenge. The final section contains the instructions for this conversation."
      : "Nutze diesen Text, um meine Frage zu untersuchen. Prüfe die folgenden Thesen als philosophische Vorschläge, denen du begründet widersprechen kannst. Im letzten Abschnitt steht der Arbeitsauftrag für dieses Gespräch.",
    `${en ? "Latest published copy" : "Aktuelle veröffentlichte Fassung"} · ${new URL(rulePackPath(lang), project.website).href}`,
    `${en ? "Source texts" : "Quelltexte"} · AlexanderR1991 & ${en ? "contributors" : "Mitwirkende"} · CC BY-SA 4.0\nhttps://creativecommons.org/licenses/by-sa/4.0/\n${sourceFiles.map(file => source + file).join("\n")}`,
    en ? "FOUNDATIONAL THESES" : "THESEN DES GRUNDTEXTS",
    theses(lang),
    en ? "HOW WE EXAMINE CLAIMS" : "WIE WIR AUSSAGEN PRÜFEN",
    localMethod,
    en ? promptEn : promptDe
  ].join("\n\n");
}
