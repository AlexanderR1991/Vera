import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { memoryPath } from "./vera-memory.mjs";
import { renderVeraContext, veraProfilePath, veraPromptPath } from "../src/lib/vera-context.mjs";

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
    process.stdout.write(renderVeraContext({
      language, revision, repository: project.repository,
      profile: read(veraProfilePath), prompt: read(veraPromptPath(language)),
      memory: JSON.parse(read(memoryPath))
    }));
  } catch (error) {
    console.error(`Vera context unavailable. Use a Git checkout containing the committed Vera profile, inquiry prompt and project memory. ${error.message.split("\n")[0]}`);
    process.exitCode = 1;
  }
}
