import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
import {createContext, runInContext} from "node:vm";

const client = readFileSync(new URL("../src/client/site-search.mjs", import.meta.url), "utf8");
const core = readFileSync(new URL("../src/lib/site-search-match.mjs", import.meta.url), "utf8");
const settle = () => new Promise(resolve => setImmediate(resolve));

class Element {
  constructor(tag = "div") {
    this.tag = tag; this.value = ""; this.textContent = ""; this.hidden = false;
    this.children = []; this.listeners = new Map(); this.dataset = {};
  }
  append(...nodes) { this.children.push(...nodes); }
  replaceChildren(...nodes) { this.children = nodes; }
  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) ?? [];
    listeners.push(listener); this.listeners.set(type, listeners);
  }
  emit(type) {
    for (const listener of this.listeners.get(type) ?? []) listener({type, target: this});
  }
}

class Clock {
  now = 0; next = 1; timers = new Map();
  setTimeout = (callback, delay = 0) => {
    const id = this.next++; this.timers.set(id, {at: this.now + delay, callback}); return id;
  };
  clearTimeout = id => this.timers.delete(id);
  async advance(milliseconds) {
    const target = this.now + milliseconds;
    for (;;) {
      const due = [...this.timers].filter(([, timer]) => timer.at <= target)
        .sort((a, b) => a[1].at - b[1].at || a[0] - b[0])[0];
      if (!due) break;
      this.now = due[1].at; this.timers.delete(due[0]); due[1].callback(); await settle();
    }
    this.now = target; await settle();
  }
}

function mount(language, loads, {clock, pageMode = false, abortAvailable = true} = {}) {
  const header = new Element(), input = new Element("input"), panel = new Element();
  const status = new Element("p"), results = new Element("ul"), all = new Element("a");
  const form = new Element("form");
  form.action = `/Vera/${language}/suche/`;
  header.dataset = {lang: language, indexUrl: `/Vera/search/${language}.json`};
  const controls = new Map([
    ["form", form], ["[data-site-search-input]", input], ["[data-site-search-panel]", panel],
    ["[data-site-search-status]", status], ["[data-site-search-results]", results],
    ["[data-site-search-all]", all]
  ]);
  header.querySelector = selector => {
    assert(controls.has(selector), selector); return controls.get(selector);
  };
  const page = new Element(), pageInput = new Element("input");
  const pageStatus = new Element("p"), pageResults = new Element("ul");
  const pageControls = new Map([["[data-search-page-input]", pageInput],
    ["[data-search-page-status]", pageStatus], ["[data-search-page-results]", pageResults]]);
  page.querySelector = selector => {
    assert(pageControls.has(selector), selector); return pageControls.get(selector);
  };
  const document = new Element("document");
  document.querySelector = selector => {
    if (selector === "[data-site-search]") return header;
    assert.equal(selector, "[data-search-page]"); return pageMode ? page : null;
  };
  document.createElement = tag => new Element(tag);
  const calls = [], requestOptions = [];
  const fetch = (url, options) => {
    assert.equal(url, header.dataset.indexUrl);
    assert.equal(options.credentials, "same-origin");
    const load = loads[calls.length]; calls.push(url); requestOptions.push(options);
    assert(load, "Unexpected automatic or additional index request"); return load(options);
  };
  const context = createContext({document, fetch, URLSearchParams,
    location: {search: pageMode ? "?q=quarzraum" : ""},
    setTimeout: clock ? clock.setTimeout : setTimeout,
    clearTimeout: clock ? clock.clearTimeout : clearTimeout,
    ...(abortAvailable ? {AbortController} : {})});
  runInContext(core.replace(/export function /g, "function "), context);
  runInContext(client.replace(/^import .*;\s*$/gm, ""), context);
  return {calls, requestOptions, results, status, pageStatus, pageResults, enter(query, event = "input") { input.value = query; input.emit(event); }};
}

const response = language => Promise.resolve({ok: true, status: 200, json: async () => ({
  lang: language, entries: [{type: "page", title: "Quarzraum", description: "", search: "quarzraum",
    href: `/Vera/${language}/synthetic/`}]
})});
const failures = [
  () => Promise.reject(new Error("Synthetic network failure")),
  () => Promise.resolve({ok: false, status: 503}),
  () => Promise.resolve({ok: true, status: 200, json: () => Promise.reject(new Error("Synthetic JSON failure"))}),
  () => Promise.resolve({ok: true, status: 200, json: async () => ({lang: "invalid", entries: []})})
];
function assertResult(search, language) {
  assert.equal(search.results.children.length, 1);
  const link = search.results.children[0].children.find(child => child.tag === "a");
  assert.equal(link.href, `/Vera/${language}/synthetic/`);
}

test("a new manual search can reload after an index failure without automatic retries", async () => {
  for (const language of ["de", "en"]) for (const event of ["input", "focus"]) for (const fail of failures) {
    const search = mount(language, [fail, () => response(language)]);
    search.enter("quarz"); await settle();
    assert.equal(search.calls.length, 1);
    assert.equal(search.results.children.length, 0);
    assert.equal(search.status.textContent, language === "en"
      ? "Search temporarily unavailable." : "Suche vorübergehend nicht verfügbar.");
    await settle(); assert.equal(search.calls.length, 1, "No retry while idle");
    search.enter("quarzraum", event); await settle();
    assert.equal(search.calls.length, 2, "The next manual search retries the failed load");
    assertResult(search, language);
    search.enter("quarzraum"); await settle();
    assert.equal(search.calls.length, 2, "A recovered index remains cached");
    assertResult(search, language);
  }
});

test("successful and pending index loads remain shared between manual searches", async () => {
  for (const language of ["de", "en"]) {
    const loaded = mount(language, [() => response(language)]);
    loaded.enter("quarz"); await settle();
    for (const event of ["input", "focus"]) {
      loaded.enter("quarzraum", event); await settle();
      assert.equal(loaded.calls.length, 1); assertResult(loaded, language);
    }
    let release;
    const pending = new Promise(resolve => { release = resolve; });
    const loading = mount(language, [() => pending]);
    loading.enter("quarz"); loading.enter("quarzraum");
    assert.equal(loading.calls.length, 1);
    release(await response(language)); await settle();
    assert.equal(loading.calls.length, 1); assertResult(loading, language);
  }
});


const timeoutMessage = language => language === "en"
  ? "The search index did not finish loading in time. You can search again."
  : "Der Suchindex wurde nicht rechtzeitig geladen. Du kannst erneut suchen.";

test("a shared index deadline covers fetch and body stalls and ignores their late completion", async () => {
  for (const language of ["de", "en"]) for (const pageMode of [false, true]) {
    for (const abortAvailable of [false, true]) for (const phase of ["fetch", "body"]) {
      let release;
      const stalled = new Promise(resolve => { release = resolve; });
      const first = phase === "fetch" ? () => stalled
        : () => Promise.resolve({ok: true, status: 200, json: () => stalled});
      const clock = new Clock();
      const search = mount(language, [first, () => response(language)], {clock, pageMode, abortAvailable});
      if (!pageMode) search.enter("quarzraum");
      await settle(); await clock.advance(14999);
      const activeStatus = pageMode ? search.pageStatus : search.status;
      assert.equal(activeStatus.textContent, language === "en" ? "Searching…" : "Suche läuft…");
      assert.equal(search.calls.length, 1);
      await clock.advance(1);
      assert.equal(activeStatus.textContent, timeoutMessage(language));
      assert.equal(search.calls.length, 1, "A deadline never initiates an automatic retry");
      assert.equal(clock.timers.size, 0);
      if (abortAvailable) assert.equal(search.requestOptions[0].signal.aborted, true);
      else assert.equal(search.requestOptions[0].signal, undefined);
      search.enter("quarzraum"); await settle();
      assert.equal(search.calls.length, 2, "A later manual lookup may start a new load");
      assertResult(search, language); assert.equal(clock.timers.size, 0);
      const headerStatus = search.status.textContent, oldPageStatus = search.pageStatus.textContent;
      const late = {lang: language, entries: [{type: "page", title: "Quarzraum", description: "Late",
        search: "quarzraum", href: `/Vera/${language}/late/`}]};
      release(phase === "fetch" ? {ok: true, status: 200, json: async () => late} : late);
      await settle();
      assertResult(search, language);
      assert.equal(search.status.textContent, headerStatus);
      assert.equal(search.pageStatus.textContent, oldPageStatus);
      assert.equal(search.pageResults.children.length, 0);
      assert.equal(search.calls.length, 2);
    }
  }
});

test("successful shared index loads clear their deadline and retain the cached result", async () => {
  for (const language of ["de", "en"]) for (const pageMode of [false, true]) {
    for (const abortAvailable of [false, true]) {
      const clock = new Clock();
      const search = mount(language, [() => response(language)], {clock, pageMode, abortAvailable});
      if (!pageMode) search.enter("quarzraum");
      await settle(); search.enter("quarzraum"); await settle();
      assert.equal(search.calls.length, 1); assertResult(search, language);
      assert.equal(clock.timers.size, 0);
      await clock.advance(15000);
      assert.equal(search.calls.length, 1); assertResult(search, language);
      if (abortAvailable) assert.equal(search.requestOptions[0].signal.aborted, false);
    }
  }
});

test("timeout remains the reported outcome when abort synchronously rejects the pending fetch", async () => {
  for (const language of ["de", "en"]) {
    const clock = new Clock();
    const search = mount(language, [options => new Promise((resolve, reject) => {
      options.signal.addEventListener("abort", () => {
        const error = new Error("Synthetic transport abort"); error.name = "AbortError"; reject(error);
      });
    })], {clock});
    search.enter("quarzraum"); await settle(); await clock.advance(15000);
    assert.equal(search.status.textContent, timeoutMessage(language));
    assert.equal(search.calls.length, 1); assert.equal(clock.timers.size, 0);
  }
});
