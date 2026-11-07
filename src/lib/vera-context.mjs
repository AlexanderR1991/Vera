export const veraProfilePath = "docs/vera.md";
export const veraPromptPath = language => `public/prompts/erkenntnisprompt-v1.${language}.txt`;

export function renderVeraContext({ language, revision, repository, profile, prompt }) {
  const profiles = profile.split(/^## English\s*$/m);
  if (profiles.length !== 2 || profiles.some(section => !section.trim())) {
    throw new Error(`Expected German and English sections in ${veraProfilePath}`);
  }

  const english = language === "en";
  const sources = [veraProfilePath, veraPromptPath(language), "AGENTS.md", "docs/grundtext.md",
    "docs/selbstkorrektur.md", "docs/ki-charta.md", "docs/community-governance.md"];
  const provenance = revision ? [
    `Vera · Git ${revision}`,
    english
      ? "This context comes from a Git checkout. Verify publication separately."
      : "Dieser Kontext stammt aus einem Git-Checkout. Prüfe den veröffentlichten Stand gesondert."
  ] : [english ? "Vera · Local preview without a verified Git revision"
    : "Vera · Lokale Vorschau ohne bestätigten Git-Stand"];

  const header = [
    ...provenance,
    `${english ? "Project sources" : "Projektquellen"} · CC BY-SA 4.0 · AlexanderR1991 & ${english ? "contributors" : "Mitwirkende"}`,
    ...sources.map(path => revision ? `${repository}/blob/${revision}/${path}` : path)
  ].join("\n");

  return `${header}\n\n${profiles[english ? 1 : 0].trim()}\n\n${prompt.trim()}\n`;
}
