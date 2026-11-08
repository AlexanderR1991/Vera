import test from "node:test";
import project from "../public/project.json" with {type:"json"};
import assert from "node:assert/strict";
import {buildSiteSearchIndex, extractMainText} from "../src/lib/site-search-index.mjs";
import {normalizeSearch, searchEntries, prepareSearchEntries} from "../src/lib/site-search-match.mjs";

test("bilingual index includes linked published pages and editorial content", () => {
  for (const lang of ["de", "en"]) {
    const {entries} = buildSiteSearchIndex(lang);
    assert.ok(entries.length > 150);
    for (const entry of entries) {
      assert.ok(entry.title && entry.description && entry.search);
      assert.ok(entry.href.startsWith(new URL(project.website).pathname.replace(/\/?$/, "/") + lang + "/"), entry.href);
      assert.ok(!entry.href.includes("javascript:"));
    }
    assert.ok(entries.some(item => item.href.endsWith("/aussagen/#G-005")));
    assert.ok(entries.some(item => item.href.includes("/esoterik-katalog/#ast-eso-")));
    assert.ok(entries.some(item => item.href.includes("/forum/#alltag-liebe")));
  }
});

test("search finds real targets and ignores case, umlauts and filler words", () => {
  const de = prepareSearchEntries(buildSiteSearchIndex("de").entries);
  const en = prepareSearchEntries(buildSiteSearchIndex("en").entries);
  assert.equal(normalizeSearch("Ärger, übermäßig!"), "aerger uebermaessig");
  assert.ok(searchEntries(de, "fuersorge", 20).some(item => item.href.includes("aussagen/#G-005")));
  assert.ok(searchEntries(de, "muss ich bleiben", 20).some(item => item.href.includes("forum/#alltag-liebe")));
  assert.ok(searchEntries(de, "Okkultismus", 30).some(item => item.href.includes("esoterik-katalog/#ast-eso-")));
  assert.ok(searchEntries(en, "love", 30).length > 0);
  assert.deepEqual(searchEntries(de, "", 10), []);
  assert.deepEqual(searchEntries(de, "qxz-linguistic-impossibility-349", 10), []);
});

test("main-text enrichment excludes script, navigation and escaped markup", () => {
  const html = '<nav>menu</nav><main id="inhalt"><h1>Liebe &amp; Wahrheit</h1><script>secret()</script><p>Ein &quot;Test&quot; &#8211; heute</p></main><footer>exclude</footer>';
  const text = extractMainText(html);
  assert.match(text, /Liebe & Wahrheit/);
  assert.match(text, /Ein "Test" – heute/);
  assert.ok(!text.includes("secret"));
  assert.ok(!text.includes("menu"));
  assert.ok(!text.includes("exclude"));
});
