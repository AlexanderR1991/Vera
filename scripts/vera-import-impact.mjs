import {execFileSync} from "node:child_process";
import {posix as path} from "node:path";
import {parse as parseAstro} from "@astrojs/compiler";
import {init, parse as parseModules} from "es-module-lexer";
import {impactPaths} from "../src/lib/impact-paths.mjs";

const usage = "Usage: node scripts/vera-import-impact.mjs <tracked-path>";

// Read versioned bytes without executing any code from the scanned revision.
const git = (...args) => execFileSync("git", args, {encoding: "utf8", maxBuffer: 32 * 1024 * 1024});

async function moduleBlocks(file, source) {
  if (!file.endsWith(".astro")) return [source];
  const {ast, diagnostics} = await parseAstro(source);
  const error = diagnostics.find(diagnostic => diagnostic.severity === 1);
  if (error) throw Error(error.text);
  const blocks = [];
  function visit(node) {
    if (node.type === "frontmatter") blocks.push(node.value);
    if (node.type === "element" && node.name === "script") {
      const type = node.attributes.find(attribute => attribute.name === "type")?.value ?? "";
      if (["", "module", "text/javascript", "application/javascript"].includes(type)) {
        blocks.push(node.children.filter(child => child.type === "text").map(child => child.value).join(""));
      }
    } else {
      for (const child of node.children ?? []) visit(child);
    }
  }
  visit(ast);
  return blocks;
}

async function importImpact(target) {
  const revision = git("rev-parse", "HEAD").trim();
  const files = new Map();
  for (const entry of git("ls-tree", "-rz", "--full-tree", revision).split("\0").filter(Boolean)) {
    const tab = entry.indexOf("\t");
    const [mode, , oid] = entry.slice(0, tab).split(" ");
    files.set(entry.slice(tab + 1), {mode, oid});
  }
  if (!files.has(target)) throw Error(`Path absent from this revision: ${target}`);

  await init;
  const dependents = new Map(), unresolved = [];
  let scanned = 0, edges = 0;
  for (const [file, {mode, oid}] of files) {
    if (!mode.startsWith("100") || !/\.(?:m?js|astro)$/.test(file)) continue;
    scanned++;
    try {
      const refs = new Set();
      for (const code of await moduleBlocks(file, git("cat-file", "blob", oid))) {
        for (const spec of parseModules(code)[0]) {
          if (spec.d === -1 && /^\.\.?\//.test(spec.n)) {
            refs.add(path.join(path.dirname(file), spec.n.split(/[?#]/, 1)[0]));
          }
        }
      }
      for (const dep of refs) {
        if (!files.has(dep)) { unresolved.push({from: file, to: dep}); continue; }
        if (!dependents.has(dep)) dependents.set(dep, []);
        dependents.get(dep).push(file);
        edges++;
      }
    } catch (error) {
      throw Error(`Cannot inspect ${file}: ${error.message}`);
    }
  }
  const candidates = impactPaths(dependents, target);
  return {
    revision, target,
    scope: "Committed regular .js, .mjs and Astro module imports and re-exports with exact relative paths. Paths run from dependency to consumer. Dynamic imports, markup links, aliases and external packages are outside this scan.",
    tracked: files.size, scanned, edges,
    unresolvedCount: unresolved.length, unresolved,
    direct: candidates.filter(item => item.path.length === 2),
    indirect: candidates.filter(item => item.path.length > 2)
  };
}

try {
  const args = process.argv.slice(2);
  if (args.length === 1 && args[0] === "--help") console.log(usage);
  else if (args.length === 1) console.log(JSON.stringify(await importImpact(args[0]), null, 2));
  else throw Error(usage);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
