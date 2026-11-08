import { execFileSync } from "node:child_process";
import { ENTITY_QUERIES } from "../src/lib/vera-entity-catalog.mjs";
import { queryVera, resolveEntityQuery } from "../src/lib/vera-entity.mjs";
import project from "../public/project.json" with { type: "json" };
import protocol from "../public/protocol/self-correction.v1.json" with { type: "json" };

const [lang, ...words] = process.argv.slice(2);
const usage = "node scripts/vera-entity.mjs de|en [question or ID]";
if (lang === "--help") {
  console.log(usage);
} else if (!["de", "en"].includes(lang)) {
  console.error(usage);
  process.exitCode = 2;
} else if (words.length === 0) {
  console.log(ENTITY_QUERIES.map(query => [query.id, query[lang].question].join(" · ")).join("\n"));
} else {
  const matches = resolveEntityQuery(words.join(" "), lang);
  if (matches.length !== 1) {
    console.log(JSON.stringify({ status: matches.length ? "ambiguous-query" : "unknown-query", matches }, null, 2));
    process.exitCode = 2;
  } else {
    const [id] = matches;
    const report = queryVera(id, project);
    const { aliases, ...claim } = ENTITY_QUERIES.find(query => query.id === id)[lang];
    const git = (...args) => execFileSync("git", args, {
      cwd: new URL("..", import.meta.url),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
    let revision = null;
    try {
      const paths = ["src/lib/vera-entity.mjs", "src/lib/vera-entity-catalog.mjs", "public/project.json",
        "public/protocol/self-correction.v1.json", ...report.evidence.map(record => record.path.split("#")[0])];
      if (!git("status", "--porcelain", "--untracked-files=all", "--", ...paths)) {
        revision = git("rev-parse", "--verify", "HEAD^{commit}");
      }
    } catch {
      // An exported source archive may not carry Git metadata.
    }
    const ref = revision ?? "main";
    const evidence = report.evidence.map(record => ({
      id: record.id,
      polarity: record.polarity,
      label: record[lang],
      url: `${project.repository}/blob/${ref}/${record.path}`
    }));
    console.log(JSON.stringify({
      engine: { name: "WIRKLICH", rule: protocol.principle_id, motto: protocol.motto[lang] },
      revision,
      sourceRef: ref,
      ...claim,
      ...report,
      evidence
    }, null, 2));
  }
}
