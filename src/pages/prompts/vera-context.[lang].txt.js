import profile from "../../../docs/vera.md?raw";
import promptDe from "../../../public/prompts/erkenntnisprompt-v1.de.txt?raw";
import promptEn from "../../../public/prompts/erkenntnisprompt-v1.en.txt?raw";
import project from "../../../public/project.json" with { type: "json" };
import { locales } from "../../lib/paths.mjs";
import { renderVeraContext } from "../../lib/vera-context.mjs";

export function getStaticPaths() {
  return locales.map(lang => ({ params: { lang } }));
}

export function GET({ params: { lang } }) {
  const sha = process.env.GITHUB_SHA;
  const revision = /^[a-f0-9]{40}$/.test(sha) ? sha : undefined;
  const content = renderVeraContext({
    language: lang, revision, repository: project.repository, profile,
    prompt: lang === "en" ? promptEn : promptDe
  });
  return new Response(content, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
