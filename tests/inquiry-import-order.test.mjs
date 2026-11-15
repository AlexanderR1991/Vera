import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolve, dirname} from "node:path";
import vm from "node:vm";
import test from "node:test";
import {spawnSync} from "node:child_process";
import {fileURLToPath} from "node:url";
const {createContext, SourceTextModule, SyntheticModule} = vm;

const checkout = fileURLToPath(new URL("../", import.meta.url));
const fields = ["question", "claim", "scope", "support", "positions", "objection", "revision", "action"];
const checks = ["evidence", "agency", "care", "repair"];

// These doubles cover only the named controls, selectors, direct events and
// iterable FormData reads used by the checked-in inquiry client. They are not a
// browser, layout engine, real download, event-bubbling or input-normalization test.
class Element {
  constructor(properties = {}) {
    Object.assign(this, {value: "", textContent: "", disabled: false, hidden: false, open: false}, properties);
    this.listeners = new Map();
  }
  addEventListener(type, callback) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(callback);
  }
  dispatchEvent(event) {
    for (const callback of this.listeners.get(event.type) ?? []) callback(event);
    return true;
  }
}

async function runClientCase(lang, scenario) {
  const initial = {
    type: "normative",
    question: "Welche Information fehlt? / Which information is missing?",
    claim: "Vorläufige Notiz / Provisional note",
    scope: "Nur ein synthetischer Fall. / A synthetic case only.",
    support: "",
    positions: "A: Nein. B: noch offen.\nEine weitere Perspektive fehlt.",
    objection: "Der Einwand bleibt offen. / The objection remains open.",
    revision: "",
    action: lang === "de" ? "Erst Betroffene fragen." : "Ask the people affected first."
  };
  const initialDirection = {evidence: "yes", agency: "no", care: "open", repair: "yes"};
  const controls = new Map(Object.entries(initial).map(([name, value]) => [name, new Element({name, value})]));
  for (const key of checks) controls.set(`direction-${key}`, new Element({name: `direction-${key}`, value: initialDirection[key]}));
  const form = new Element();
  form.elements = {namedItem: name => {
    assert.ok(controls.has(name), `Unknown form control ${name}`);
    return controls.get(name);
  }};
  const root = new Element({dataset: {lang}});
  const selectors = new Map([
    ["[data-inquiry-form]", form],
    ...["data-inquiry-status", "data-inquiry-preview", "data-inquiry-curiosity", "data-inquiry-direction",
      "data-direction-result", "data-inquiry-completion", "data-inquiry-types", "data-inquiry-deeper",
      "data-export-json", "data-export-text", "data-export-ai", "data-local-save", "data-local-load",
      "data-local-clear", "data-import", "data-load-example"].map(name => [`[${name}]`, new Element()])
  ]);
  const typeGuide = new Element();
  typeGuide.querySelector = selector => {
    assert.equal(selector, "p");
    return {textContent: "Synthetic type guidance"};
  };
  root.querySelector = selector => {
    if (/^\[data-type-guide="(?:unclassified|empirical|formal|normative|interpretive|metaphor)"\]$/.test(selector)) return typeGuide;
    assert.ok(selectors.has(selector), `Unknown root selector ${selector}`);
    return selectors.get(selector);
  };
  root.querySelectorAll = selector => {
    assert.equal(selector, "[data-js-control]");
    return [selectors.get("[data-export-json]")];
  };
  class FormDataDouble {
    constructor(receivedForm) {
      assert.equal(receivedForm, form);
      this.entries = [...controls].filter(([, control]) => !control.disabled).map(([name, control]) => [name, control.value]);
    }
    [Symbol.iterator]() { return this.entries[Symbol.iterator](); }
  }
  const downloads = [];
  class URLDouble extends URL {
    static createObjectURL(blob) { downloads.push(blob); return "blob:synthetic-download"; }
    static revokeObjectURL() {}
  }
  const document = {
    querySelector(selector) { assert.equal(selector, "[data-inquiry-workbench]"); return root; },
    createElement(tag) { assert.equal(tag, "a"); return {click() {}, remove() {}}; },
    body: {append() {}}
  };
  const context = createContext({document, FormData: FormDataDouble, URL: URLDouble, Blob, Event,
    window: {location: {hash: ""}, setTimeout(callback) { callback(); }},
    localStorage: {getItem() { return null; }, setItem() {}, removeItem() {}}
  });
  const modules = new Map();
  const load = file => {
    if (!modules.has(file)) {
      const source = readFileSync(file, "utf8");
      const module = file.endsWith(".json")
        ? new SyntheticModule(["default"], function () { this.setExport("default", JSON.parse(source)); }, {context, identifier: file})
        : new SourceTextModule(source, {context, identifier: file});
      modules.set(file, module);
    }
    return modules.get(file);
  };
  const module = load(resolve(checkout, "src/client/inquiry.mjs"));
  await module.link((specifier, referring) => {
    assert.ok(specifier.startsWith("."), `Unexpected dependency ${specifier}`);
    return load(resolve(dirname(referring.identifier), specifier));
  });
  await module.evaluate();
  assert.ok(form.listeners.has("input"));
  assert.ok(form.listeners.has("change"));
  assert.deepEqual(Object.fromEntries(checks.map(key => [key, controls.get(`direction-${key}`).value])), initialDirection);


  const imported = label => ({schema_version: 3, kind: "inquiry_note", lang, type: "normative",
    question: `Question ${label}`, claim: "", scope: "", support: "", positions: `Dissent ${label}`,
    objection: `Objection ${label}`, revision: "", action: `Action ${label}`,
    direction: {evidence: "open", agency: label === "A" ? "yes" : "no", care: "yes", repair: "open"}});
  const notes = {A: imported("A"), B: imported("B")};
  const input = selectors.get("[data-import]");
  const capture = () => ({question: controls.get("question").value, positions: controls.get("positions").value,
    objection: controls.get("objection").value, action: controls.get("action").value,
    direction: Object.fromEntries(checks.map(key => [key, controls.get(`direction-${key}`).value])),
    status: selectors.get("[data-inquiry-status]").textContent, selectedFile: input.value});
  const select = (label, raw = JSON.stringify(notes[label])) => {
    let complete, fail;
    const text = new Promise((resolve, reject) => {complete = resolve; fail = reject;});
    input.files = [{name: `${label}.json`, size: Buffer.byteLength(raw), text: () => text}];
    input.value = `${label}.json`;
    const handlers = input.listeners.get("change");
    assert.equal(handlers.length, 1);
    const done = handlers[0]({type: "change", target: input});
    assert.equal(typeof done?.then, "function");
    return {
      async resolve() {complete(raw); await done;},
      async reject() {fail(new Error("Synthetic File.text read failure")); await done;}
    };
  };
  const start = capture();
  if (scenario === "single") {
    const B = select("B"); await B.resolve();
    return {start, final: capture(), expected: notes.B};
  }
  const A = select("A", scenario === "older_error" ? "{invalid JSON" : JSON.stringify(notes.A));
  const B = select("B", scenario === "newer_invalid" ? "{invalid newer JSON" : JSON.stringify(notes.B));
  if (scenario === "older_first") {
    await A.resolve(); const first = capture();
    await B.resolve();
    return {start, first, final: capture(), expected: notes.B};
  }
  await B.resolve(); const first = capture();
  if (scenario === "older_read_rejection") await A.reject();
  else await A.resolve();
  return {start, first, final: capture(), expected: notes.B};
}

if (process.argv[2] === "--client-probe") {
  console.log(JSON.stringify(await runClientCase(process.argv[3], process.argv[4])));
} else {
  const run = (lang, scenario) => {
    // Keep npm test / npm build unchanged: VM support is enabled only in this
    // isolated child. The child executes the checked-in client and libraries.
    const child = spawnSync(process.execPath, ["--experimental-vm-modules", fileURLToPath(import.meta.url),
      "--client-probe", lang, scenario], {encoding: "utf8", timeout: 10000});
    assert.equal(child.status, 0, child.stderr);
    return JSON.parse(child.stdout);
  };
  const assertB = ({final, expected}) => {
    for (const field of ["question", "positions", "objection", "action", "direction"]) {
      assert.deepEqual(final[field], expected[field], field);
    }
  };
  for (const lang of ["de", "en"]) {
    test(`a single asynchronous import preserves the selected note (${lang})`, () => {
      const result = run(lang, "single"); assertB(result);
      assert.match(result.final.status, lang === "de" ? /Prüfblatt importiert/ : /Worksheet imported/);
    });
    test(`an older import cannot apply while a newer selection is pending (${lang})`, () => {
      const result = run(lang, "older_first");
      for (const field of ["question", "positions", "objection", "action", "direction", "status"]) {
        assert.deepEqual(result.first[field], result.start[field], field);
      }
      assert.equal(result.first.selectedFile, "B.json");
      assertB(result);
    });
    test(`latest selection wins when its read finishes before the old read (${lang})`, () => {
      const result = run(lang, "newer_first"); assertB(result);
      assert.deepEqual(result.final, result.first);
    });
    test(`an older malformed JSON cannot overwrite a newer successful status (${lang})`, () => {
      const result = run(lang, "older_error"); assertB(result);
      assert.equal(result.final.status, result.first.status);
    });
    test(`an older File.text rejection cannot overwrite a newer successful import (${lang})`, () => {
      const result = run(lang, "older_read_rejection"); assertB(result);
      assert.match(result.first.status, lang === "de" ? /Prüfblatt importiert/ : /Worksheet imported/);
      assert.deepEqual(result.final, result.first);
    });
    test(`a newer invalid selection supersedes an older valid pending import (${lang})`, () => {
      const result = run(lang, "newer_invalid");
      for (const field of ["question", "positions", "objection", "action", "direction"]) {
        assert.deepEqual(result.final[field], result.start[field], field);
      }
      assert.match(result.first.status, lang === "de" ? /Import nicht möglich/ : /Use a worksheet exported as JSON/);
      assert.deepEqual(result.final, result.first);
    });
  }
}
