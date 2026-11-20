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
  // The source HTML has empty textareas, an unclassified type and open checks.
  // Initial values above model user edits, not the native reset defaults.
  let resetCalls = 0, removeCalls = 0;
  form.reset = () => {
    resetCalls++;
    for (const [name, control] of controls) control.value = name === "type" ? "unclassified"
      : name.startsWith("direction-") ? "open" : "";
  };
  const root = new Element({dataset: {lang}});
  const selectors = new Map([
    ["[data-inquiry-form]", form],
    ...["data-inquiry-status", "data-inquiry-preview", "data-inquiry-curiosity", "data-inquiry-direction",
      "data-direction-result", "data-inquiry-completion", "data-inquiry-types", "data-inquiry-deeper",
      "data-export-json", "data-export-text", "data-export-ai", "data-local-save", "data-local-load",
      "data-local-clear", "data-import", "data-load-example"].map(name => [`[${name}]`, new Element()])
  ]);
  // Use the component's actual DE/EN fixture instead of copying its bus text.
  const component = readFileSync(resolve(checkout, "src/components/InquiryWorkbench.astro"), "utf8");
  const exampleDeclaration = component.match(/const example = en \? \{[\s\S]*?\n\};(?=\n---)/)?.[0];
  assert.ok(exampleDeclaration, "The component's example declaration must be inspectable");
  const sourceExample = vm.runInNewContext(`${exampleDeclaration}\nexample;`, {en: lang === "en"});
  selectors.set("[data-inquiry-example]", new Element({textContent: JSON.stringify(sourceExample)}));
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
  let storedRaw = null, getCalls = 0;
  const context = createContext({document, FormData: FormDataDouble, URL: URLDouble, Blob, Event, TextDecoder,
    window: {location: {hash: ""}, setTimeout(callback) { callback(); }},
    localStorage: {getItem() {
      getCalls++;
      if (scenario === "local_load_throws") throw new Error("Synthetic storage read failure");
      return storedRaw;
    }, setItem() {}, removeItem() {
      removeCalls++;
      if (scenario.startsWith("clear_fails_")) throw new Error("Synthetic storage removal failure");
    }}
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
  const notes = {A: imported("A"), B: imported("B"), C: imported("C")};
  const input = selectors.get("[data-import]");
  const capture = () => ({...Object.fromEntries(fields.map(key => [key, controls.get(key).value])),
    type: controls.get("type").value,
    direction: Object.fromEntries(checks.map(key => [key, controls.get(`direction-${key}`).value])),
    directionDisabled: checks.map(key => controls.get(`direction-${key}`).disabled),
    preview: selectors.get("[data-inquiry-preview]").textContent,
    status: selectors.get("[data-inquiry-status]").textContent, selectedFile: input.value});
  const select = (label, raw = JSON.stringify(notes[label])) => {
    let complete, fail;
    const text = new Promise((resolve, reject) => {complete = resolve; fail = reject;});
    input.files = [{name: `${label}.json`, size: Buffer.byteLength(raw), text: () => text,
      arrayBuffer: async () => new Blob([await text]).arrayBuffer()}];
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
  if (scenario.startsWith("utf8_")) {
    const kind = scenario.slice(5);
    const middles = {
      invalid_ff: [0xff], invalid_continuation: [0x80],
      invalid_overlong: [0xc0, 0xaf], invalid_truncated: [0xe2, 0x82],
      literal: [0xef, 0xbf, 0xbd], escaped: Buffer.from("\\uFFFD"),
      unicode: Buffer.from("界🌱é"), bom: Buffer.from("界")
    };
    assert.ok(Object.hasOwn(middles, kind));
    const raw = JSON.stringify({...notes.B, question: "LEFT_MARKER_RIGHT"});
    const [prefix, suffix] = raw.split("_MARKER_");
    const body = Buffer.concat([Buffer.from(prefix), Buffer.from(middles[kind]), Buffer.from(suffix)]);
    const bytes = kind === "bom" ? Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), body]) : body;
    const file = new File([bytes], "synthetic.json", {type: "application/json"});
    input.files = [file]; input.value = file.name;
    await input.listeners.get("change")[0]({type: "change", target: input});
    const middle = kind === "unicode" ? "界🌱é" : kind === "bom" ? "界" : "�";
    return {start, final: capture(), expected: {...notes.B, question: "LEFT" + middle + "RIGHT"}};
  }
  if (scenario === "single") {
    const B = select("B"); await B.resolve();
    return {start, final: capture(), expected: notes.B};
  }
  if (scenario.startsWith("example_load_")) {
    const B = scenario === "example_load_single" ? null
      : select("B", scenario === "example_load_invalid" ? "{invalid pending JSON" : JSON.stringify(notes.B));
    selectors.get("[data-load-example]").dispatchEvent(new Event("click"));
    const afterExample = capture();
    if (scenario.startsWith("example_load_then_import_")) {
      const C = select("C");
      if (scenario.endsWith("older_first")) {
        await B.resolve(); const first = capture();
        await C.resolve();
        return {start, afterExample, first, final: capture(), example: sourceExample, expected: notes.C};
      }
      await C.resolve(); const first = capture();
      await B.resolve();
      return {start, afterExample, first, final: capture(), example: sourceExample, expected: notes.C};
    }
    if (scenario === "example_load_reject") await B.reject();
    else if (B) await B.resolve();
    return {start, afterExample, final: capture(), example: sourceExample};
  }
  if (scenario.startsWith("local_load_")) {
    const B = select("B", scenario === "local_load_invalid" ? "{invalid pending JSON" : JSON.stringify(notes.B));
    storedRaw = scenario === "local_load_missing" ? null
      : scenario === "local_load_malformed" ? "{invalid stored JSON" : JSON.stringify(notes.A);
    selectors.get("[data-local-load]").dispatchEvent(new Event("click"));
    const afterLoad = capture();
    if (scenario.startsWith("local_load_then_import_")) {
      const C = select("C");
      if (scenario.endsWith("older_first")) {
        await B.resolve(); const first = capture();
        await C.resolve();
        return {start, afterLoad, first, final: capture(), expected: notes.C, loaded: notes.A};
      }
      await C.resolve(); const first = capture();
      await B.resolve();
      return {start, afterLoad, first, final: capture(), expected: notes.C, loaded: notes.A};
    }
    if (scenario === "local_load_reject") await B.reject();
    else await B.resolve();
    const loadFailed = ["local_load_missing", "local_load_malformed", "local_load_throws"].includes(scenario);
    return {start, afterLoad, final: capture(), expected: loadFailed ? notes.B : notes.A, getCalls};
  }
  if (scenario.startsWith("clear_")) {
    const B = select("B", scenario.endsWith("invalid") ? "{invalid JSON after clear" : JSON.stringify(notes.B));
    selectors.get("[data-local-clear]").dispatchEvent(new Event("click"));
    const afterClear = capture();
    if (scenario.startsWith("clear_then_import_")) {
      const A = select("A");
      if (scenario.endsWith("older_first")) {
        await B.resolve(); const first = capture();
        await A.resolve();
        return {start, afterClear, first, final: capture(), expected: notes.A};
      }
      await A.resolve(); const first = capture();
      await B.resolve();
      return {start, afterClear, first, final: capture(), expected: notes.A};
    }
    if (scenario.endsWith("reject")) await B.reject();
    else await B.resolve();
    return {start, afterClear, final: capture(), expected: notes.B, resetCalls, removeCalls};
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
    for (const kind of ["invalid_ff", "invalid_continuation", "invalid_overlong", "invalid_truncated", "literal", "escaped", "unicode", "bom"]) {
      test(`UTF-8 file decoding preserves valid content and rejects malformed bytes (${lang}, ${kind})`, () => {
        const result = run(lang, `utf8_${kind}`);
        if (kind.startsWith("invalid_")) {
          for (const key of [...fields, "type", "direction", "directionDisabled", "preview"]) {
            assert.deepEqual(result.final[key], result.start[key], key);
          }
          assert.match(result.final.status, lang === "de" ? /Import nicht möglich/ : /Use a worksheet exported as JSON/);
        } else assertB(result);
        assert.equal(result.final.selectedFile, "");
      });
    }
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
    for (const completion of ["valid", "invalid", "reject"]) {
      test(`successful local clear supersedes a pending ${completion} import (${lang})`, () => {
        const result = run(lang, `clear_success_${completion}`);
        assert.equal(result.removeCalls, 1);
        assert.equal(result.resetCalls, 1);
        for (const field of fields) assert.equal(result.afterClear[field], "", field);
        assert.equal(result.afterClear.type, "unclassified");
        assert.deepEqual(result.afterClear.direction, Object.fromEntries(checks.map(key => [key, "open"])));
        assert.deepEqual(result.afterClear.directionDisabled, checks.map(() => true));
        assert.match(result.afterClear.status, lang === "de" ? /Felder geleert/ : /fields cleared/);
        assert.equal(result.afterClear.selectedFile, "");
        for (const field of [...fields, "type", "direction", "directionDisabled", "preview", "status", "selectedFile"]) {
          assert.deepEqual(result.final[field], result.afterClear[field], field);
        }
      });
      test(`failed storage clear preserves edits and the pending ${completion} import (${lang})`, () => {
        const result = run(lang, `clear_fails_${completion}`);
        assert.equal(result.removeCalls, 1);
        assert.equal(result.resetCalls, 0);
        for (const field of [...fields, "type", "direction", "directionDisabled", "preview"]) {
          assert.deepEqual(result.afterClear[field], result.start[field], field);
        }
        assert.match(result.afterClear.status, lang === "de" ? /Browserspeicher konnte nicht gelöscht/ : /Browser storage could not be cleared/);
        if (completion === "valid") assertB(result);
        else {
          for (const field of [...fields, "type", "direction", "directionDisabled", "preview"]) {
            assert.deepEqual(result.final[field], result.start[field], field);
          }
          assert.match(result.final.status, lang === "de" ? /Import nicht möglich/ : /Use a worksheet exported as JSON/);
        }
      });
    }
    for (const order of ["older_first", "newer_first"]) {
      test(`a new explicit import after local clear remains usable (${lang}, ${order})`, () => {
        const result = run(lang, `clear_then_import_${order}`);
        for (const field of fields) assert.equal(result.afterClear[field], "", field);
        assert.equal(result.afterClear.selectedFile, "");
        assertB(result);
        assert.match(result.final.status, lang === "de" ? /Prüfblatt importiert/ : /Worksheet imported/);
        assert.equal(result.final.selectedFile, "");
        if (order === "older_first") {
          for (const field of [...fields, "type", "direction", "directionDisabled", "preview", "status"]) {
            assert.deepEqual(result.first[field], result.afterClear[field], field);
          }
          assert.equal(result.first.selectedFile, "A.json");
        } else assert.deepEqual(result.final, result.first);
      });
    }
    for (const completion of ["valid", "invalid", "reject"]) {
      test(`a successfully loaded local note supersedes a pending ${completion} import (${lang})`, () => {
        const result = run(lang, `local_load_${completion}`);
        assert.equal(result.getCalls, 1);
        for (const field of ["question", "positions", "objection", "action", "direction"]) {
          assert.deepEqual(result.afterLoad[field], result.expected[field], field);
        }
        assert.match(result.afterLoad.status, lang === "de" ? /Gespeicherten Entwurf geöffnet/ : /Saved draft opened/);
        assert.equal(result.afterLoad.selectedFile, "");
        for (const field of [...fields, "type", "direction", "directionDisabled", "preview", "status", "selectedFile"]) {
          assert.deepEqual(result.final[field], result.afterLoad[field], field);
        }
      });
    }
    for (const failure of ["missing", "malformed", "throws"]) {
      test(`failed local load (${failure}) preserves edits and the authorized pending import (${lang})`, () => {
        const result = run(lang, `local_load_${failure}`);
        assert.equal(result.getCalls, 1);
        for (const field of [...fields, "type", "direction", "directionDisabled", "preview"]) {
          assert.deepEqual(result.afterLoad[field], result.start[field], field);
        }
        assert.match(result.afterLoad.status, failure === "missing"
          ? lang === "de" ? /Kein gespeicherter Entwurf/ : /No saved draft/
          : lang === "de" ? /Entwurf konnte nicht geöffnet/ : /draft could not be opened/);
        assertB(result);
        assert.match(result.final.status, lang === "de" ? /Prüfblatt importiert/ : /Worksheet imported/);
      });
    }
    for (const order of ["older_first", "newer_first"]) {
      test(`a new explicit file import after local load remains usable (${lang}, ${order})`, () => {
        const result = run(lang, `local_load_then_import_${order}`);
        for (const field of ["question", "positions", "objection", "action", "direction"]) {
          assert.deepEqual(result.afterLoad[field], result.loaded[field], field);
        }
        assert.equal(result.afterLoad.selectedFile, "");
        assertB(result);
        assert.match(result.final.status, lang === "de" ? /Prüfblatt importiert/ : /Worksheet imported/);
        assert.equal(result.final.selectedFile, "");
        if (order === "older_first") {
          for (const field of [...fields, "type", "direction", "directionDisabled", "preview", "status"]) {
            assert.deepEqual(result.first[field], result.afterLoad[field], field);
          }
          assert.equal(result.first.selectedFile, "C.json");
        } else assert.deepEqual(result.final, result.first);
      });
    }
    for (const completion of ["single", "valid", "invalid", "reject"]) {
      test(`the source example and its fiction notice survive ${completion} import completion (${lang})`, () => {
        const result = run(lang, `example_load_${completion}`);
        for (const field of fields) assert.equal(result.afterExample[field], result.example[field] ?? "", field);
        assert.equal(result.afterExample.type, result.example.type);
        assert.deepEqual(result.afterExample.direction, Object.fromEntries(checks.map(key => [key, "open"])));
        assert.match(result.afterExample.status, lang === "de"
          ? /Erfundenes Beispiel geladen.*keine tatsächlichen Busfahrten/
          : /Fictional example loaded.*does not describe actual bus journeys/);
        assert.equal(result.afterExample.selectedFile, "");
        for (const field of [...fields, "type", "direction", "directionDisabled", "preview", "status", "selectedFile"]) {
          assert.deepEqual(result.final[field], result.afterExample[field], field);
        }
      });
    }
    for (const order of ["older_first", "newer_first"]) {
      test(`a new explicit file import after loading the example remains usable (${lang}, ${order})`, () => {
        const result = run(lang, `example_load_then_import_${order}`);
        for (const field of fields) assert.equal(result.afterExample[field], result.example[field] ?? "", field);
        assert.equal(result.afterExample.selectedFile, "");
        assertB(result);
        assert.match(result.final.status, lang === "de" ? /Prüfblatt importiert/ : /Worksheet imported/);
        assert.equal(result.final.selectedFile, "");
        if (order === "older_first") {
          for (const field of [...fields, "type", "direction", "directionDisabled", "preview", "status"]) {
            assert.deepEqual(result.first[field], result.afterExample[field], field);
          }
          assert.equal(result.first.selectedFile, "C.json");
        } else assert.deepEqual(result.final, result.first);
      });
    }
  }
}
