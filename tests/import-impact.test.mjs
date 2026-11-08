import assert from "node:assert/strict";
import {execFileSync} from "node:child_process";
import {mkdtempSync, rmSync, writeFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {test} from "node:test";
import {fileURLToPath} from "node:url";

const script = fileURLToPath(new URL("../scripts/vera-import-impact.mjs", import.meta.url));

test("a committed import chain survives working-tree edits and ignores links, prose and dynamic imports", t => {
  const cwd = mkdtempSync(join(tmpdir(), "vera-import-impact-"));
  t.after(() => rmSync(cwd, {recursive: true, force: true}));
  const git = (...args) => execFileSync("git", args, {cwd});
  git("init", "--quiet");
  const files = {
    "core.mjs": "export const value = 1;",
    "shared.mjs": "export {value} from './core.mjs';",
    "page.astro": "---\nimport './shared.mjs';\n---\n<script>import './shared.mjs?raw';</script>",
    "widget.astro": "<Layout><section><script>import './core.mjs'; import './generated.mjs';</script></section></Layout>",
    "other.astro": `<a href="./core.mjs">import "./core.mjs"</a><script type="application/json">{"note":"import './core.mjs'"}</script>`,
    "loader.js": "const next = import('./core.mjs'); // import './core.mjs';"
  };
  for (const [name, content] of Object.entries(files)) writeFileSync(join(cwd, name), content);
  git("add", ".");
  git("-c", "user.name=Fixture", "-c", "user.email=fixture@invalid.example",
      "-c", "commit.gpgsign=false", "commit", "--quiet", "-m", "Import fixture");
  writeFileSync(join(cwd, "shared.mjs"), "// changed after commit");
  const report = JSON.parse(execFileSync(process.execPath, [script, "core.mjs"], {cwd, encoding: "utf8"}));
  assert.equal(report.revision, git("rev-parse", "HEAD").toString().trim());
  assert.equal(report.edges, 3);
  assert.equal(report.scanned, 6);
  assert.deepEqual(report.direct, [{id: "shared.mjs", path: ["core.mjs", "shared.mjs"]},
    {id: "widget.astro", path: ["core.mjs", "widget.astro"]}]);
  assert.deepEqual(report.indirect, [{id: "page.astro", path: ["core.mjs", "shared.mjs", "page.astro"]}]);
  assert.deepEqual(report.unresolved, [{from: "widget.astro", to: "generated.mjs"}]);
});
