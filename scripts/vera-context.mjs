import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { formatMemory, memoryPath } from "./vera-memory.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const [language = "de", ...extra] = process.argv.slice(2);

function git(...args) {
  return execFileSync("git", ["--no-replace-objects", "-C", root, ...args], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
}

if (extra.length || !["de", "en"].includes(language)) {
  console.error("Usage: node scripts/vera-context.mjs [de|en]");
  process.exitCode = 2;
} else {
  try {
    const revision = git("rev-parse", "--verify", "HEAD^{commit}").trim();
    const read = (path) => git("show", `${revision}:${path}`);
    const project = JSON.parse(read("public/project.json"));
    const profilePath = "docs/vera.md";
    const promptPath = `public/prompts/erkenntnisprompt-v1.${language}.txt`;
    const profiles = read(profilePath).split(/^## English\s*$/m);
    if (profiles.length !== 2 || profiles.some((profile) => !profile.trim())) {
      throw new Error("Expected German and English sections in docs/vera.md");
    }

    const english = language === "en";
    const sources = [profilePath, promptPath, memoryPath, "AGENTS.md", "docs/grundtext.md",
      "docs/selbstkorrektur.md", "docs/ki-charta.md", "docs/community-governance.md"];
    const sourceUrls = sources.map((path) => `${project.repository}/blob/${revision}/${path}`);
    const prompt = read(promptPath).trim();
    const memory = formatMemory(JSON.parse(read(memoryPath)), { language, repository: project.repository, revision });
    const header = [
      `Vera · Git ${revision}`,
      english
        ? "This context comes from a Git checkout. Verify publication separately."
        : "Dieser Kontext stammt aus einem Git-Checkout. Prüfe den veröffentlichten Stand gesondert.",
      `${english ? "Project sources" : "Projektquellen"} · CC BY-SA 4.0 · AlexanderR1991 & ${english ? "contributors" : "Mitwirkende"}`,
      ...sourceUrls
    ].join("\n");

    process.stdout.write(`${header}\n\n${profiles[english ? 1 : 0].trim()}\n\n${memory}\n\n${prompt}\n`);
  } catch (error) {
    console.error(`Vera context unavailable. Use a Git checkout containing the committed Vera profile, inquiry prompt and project memory. ${error.message.split("\n")[0]}`);
    process.exitCode = 1;
  }
}
