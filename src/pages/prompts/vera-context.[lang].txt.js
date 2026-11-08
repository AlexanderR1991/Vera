import { execFileSync } from "node:child_process";
import profile from "../../../docs/vera.md?raw";
import promptDe from "../../../public/prompts/erkenntnisprompt-v1.de.txt?raw";
import promptEn from "../../../public/prompts/erkenntnisprompt-v1.en.txt?raw";
import project from "../../../public/project.json" with { type: "json" };
import { memoryPath } from "../../../scripts/vera-memory.mjs";
import { locales } from "../../lib/paths.mjs";
import { renderVeraContext, veraProfilePath, veraPromptPath } from "../../lib/vera-context.mjs";

export function getStaticPaths() {
  return locales.map(lang => ({ params: { lang } }));
}

export function GET({ params: { lang } }) {
  const sha = process.env.GITHUB_SHA;
  const revision = /^[a-f0-9]{40}$/.test(sha) ? sha : undefined;
  const read = (path) => execFileSync("git", ["--no-replace-objects", "show", `${revision}:${path}`],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  const context = revision ? {
    revision,
    repository: JSON.parse(read("public/project.json")).repository,
    profile: read(veraProfilePath),
    prompt: read(veraPromptPath(lang)),
    memory: JSON.parse(read(memoryPath))
  } : { repository: project.repository, profile, prompt: lang === "en" ? promptEn : promptDe };
  const content = renderVeraContext({ language: lang, ...context });
  return new Response(content, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
