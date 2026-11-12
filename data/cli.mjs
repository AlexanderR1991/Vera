import { readFileSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { validateCorpus, buildSupervisedExport, canonicalJson, sha256 } from "./learning-data.mjs";

const defaultInput = fileURLToPath(new URL("./corpus.v1.json", import.meta.url));
export function runDataCli(args) {
  const command = args.shift();
  if (!["validate", "export"].includes(command)) throw new Error("Usage: node data/cli.mjs validate|export [--input file] [--out directory] [--allow-dev-fixtures]");
  const options = { input: defaultInput, allowDevFixtures: false };
  const seen = new Set();
  while (args.length) {
    const flag = args.shift();
    if (seen.has(flag)) throw new Error(`Duplicate flag: ${flag}`);
    seen.add(flag);
    if (flag === "--allow-dev-fixtures") options.allowDevFixtures = true;
    else if (["--input", "--out"].includes(flag) && args[0] && !args[0].startsWith("--")) options[flag.slice(2)] = resolve(args.shift());
    else throw new Error(`Unknown or incomplete option: ${flag}`);
  }
  if (command === "validate" && (options.out || options.allowDevFixtures)) throw new Error("validate accepts only --input");
  const corpus = validateCorpus(JSON.parse(readFileSync(options.input, "utf8")));
  if (command === "validate") return { valid: true, purpose: corpus.purpose, examples: corpus.examples.length, corpus_sha256: sha256(canonicalJson(corpus)), declarations_are_not_authentication: true };
  if (!options.out) throw new Error("export requires an explicit --out directory");
  const result = buildSupervisedExport(corpus, options);
  // Fixed filenames only; dataset text never becomes a filesystem path. Refuse overwrite.
  for (const name of Object.keys(result.files)) if (existsSync(join(options.out, name))) throw new Error(`Refusing to overwrite ${name}; choose a new output directory`);
  mkdirSync(options.out, { recursive: true });
  for (const [name, content] of Object.entries(result.files)) writeFileSync(join(options.out, name), content, { encoding: "utf8", flag: "wx" });
  return { output: options.out, ...result.manifest };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { console.log(JSON.stringify(runDataCli(process.argv.slice(2)), null, 2)); }
  catch (error) { console.error(error.message); process.exitCode = 2; }
}
