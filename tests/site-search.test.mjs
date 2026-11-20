import test from "node:test";
import {spawnSync} from "node:child_process";
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

test("canonical Unicode spellings retain the same normalization and umlaut transliteration", () => {
  for (const text of ["Überprüfung", "Ärger", "Öl", "Ärger, übermäßig!", "Vera", "community", "café"]) {
    assert.equal(normalizeSearch(text.normalize("NFD")), normalizeSearch(text.normalize("NFC")));
  }
  assert.equal(normalizeSearch("U\u0308ber"), "ueber");
});

test("short canonical queries and index fields preserve the same lexical hits and ranking", () => {
  // Both forms fit fully within the existing raw 120-code-unit query budget.
  for (const term of ["Überprüfung", "Ärger", "Öl", "community", "café"]) {
    for (let mask = 0; mask < 8; mask++) {
      const fields = ["title", "description", "search"].map((_, i) => term.normalize(mask & (1 << i) ? "NFD" : "NFC"));
      const entries = [
        {id: "title", title: fields[0], description: "", search: ""},
        {id: "description", title: "Entry", description: fields[1], search: ""},
        {id: "body", title: "Entry", description: "", search: fields[2]},
        {id: "unrelated", title: "Other", description: "", search: ""}
      ];
      const before = structuredClone(entries);
      for (const data of [entries, prepareSearchEntries(entries)]) {
        for (const form of ["NFC", "NFD"]) {
          assert.deepEqual(searchEntries(data, term.normalize(form)).map(entry => entry.id), ["title", "description", "body"]);
        }
      }
      assert.deepEqual(entries, before);
    }
  }
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

test("declared umlaut filler words do not impose an extra search requirement", () => {
  const entries = [{id: "target", title: "Quarzraum", description: "", search: ""}];
  for (const data of [entries, prepareSearchEntries(entries)]) {
    for (const word of ["für", "fuer", "fu\u0308r", "können", "koennen", "ko\u0308nnen", "the", "muss"]) {
      for (const query of [word + " quarzraum", "quarzraum " + word]) {
        assert.deepEqual(searchEntries(data, query).map(entry => entry.id), ["target"], query);
      }
    }
    assert.deepEqual(searchEntries(data, "quarzraum nebenraum"), []);
  }
});

test("queries containing only declared umlaut filler words return no hits", () => {
  const entries = [{title: "Für Können", description: "", search: ""}];
  for (const query of ["für", "fuer", "fu\u0308r", "können", "koennen", "ko\u0308nnen", "für können"]) {
    assert.deepEqual(searchEntries(entries, query), [], query);
  }
});


test("DE/EN search retains canonical I-word hits across host process locales", () => {
  const moduleUrl = new URL("../src/lib/site-search-match.mjs", import.meta.url).href;
  const worker = `
    import {normalizeSearch, prepareSearchEntries, searchEntries} from ${JSON.stringify(moduleUrl)};
    const hits = [];
    for (const indexForm of ["NFC", "NFD"]) {
      const text = "Identität".normalize(indexForm);
      const entries = [
        {id:"title",title:text,description:"",search:""},
        {id:"description",title:"Other",description:text,search:""},
        {id:"body",title:"Other",description:"",search:text}
      ];
      for (const queryForm of ["NFC", "NFD"]) for (const prepared of [false,true]) {
        hits.push(searchEntries(prepared ? prepareSearchEntries(entries) : entries,
          "Identität".normalize(queryForm)).map(entry => entry.id));
      }
    }
    console.log(JSON.stringify({locale:Intl.DateTimeFormat().resolvedOptions().locale,
      normalized:[normalizeSearch("Identität"),normalizeSearch("Identität".normalize("NFD"))],hits}));
  `;
  for (const [environment, expectedLocale] of [["en_US.UTF-8","en-US"],["de_DE.UTF-8","de-DE"],["tr_TR.UTF-8","tr-TR"]]) {
    const child = spawnSync(process.execPath,["--input-type=module","-e",worker], {
      encoding:"utf8",env:{...process.env,LANG:environment,LC_ALL:environment,LC_CTYPE:environment}
    });
    assert.equal(child.status,0,child.stderr);
    const result=JSON.parse(child.stdout);
    assert.equal(result.locale,expectedLocale);
    assert.deepEqual(result.normalized,["identitaet","identitaet"],environment);
    assert.equal(result.hits.length,8);
    for (const hits of result.hits) assert.deepEqual(hits,["title","description","body"],environment);
  }
});
