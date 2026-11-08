import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
import {runInNewContext} from "node:vm";

const script = readFileSync(new URL("../src/client/site.js", import.meta.url), "utf8");
const thought = "Test & 🐾";

function feedbackForm(lang, onLine) {
  const status = {textContent: ""};
  const field = Object.assign(new EventTarget(), {value: thought});
  const form = Object.assign(new EventTarget(), {
    elements: {gedanke: field, art: {value: "Test"}, stelle: {value: "Atlas"}},
    querySelector: selector => selector === "[data-form-message]" ? status : null
  });
  const visits = [];
  const downloads = [];
  runInNewContext(script, {
    document: {
      documentElement: {lang, classList: {add() {}}},
      querySelectorAll: () => [],
      querySelector: selector => selector === "[data-feedback-draft]" ? form : null,
      createElement: () => ({click() { downloads.push(this.download); }, remove() {}}),
      body: {append() {}}
    },
    navigator: {onLine},
    location: {assign: url => visits.push(new URL(url))},
    Blob, URL, setTimeout: callback => callback()
  });
  function submit(openIssue) {
    const event = new Event("submit", {cancelable: true});
    event.submitter = {hasAttribute: name => openIssue && name === "data-open-issue"};
    form.dispatchEvent(event);
    assert.ok(event.defaultPrevented);
  }
  return {submit, visits, downloads, status, field};
}

for (const lang of ["de", "en"]) {
  test(`offline feedback stays in the form and can still be downloaded (${lang})`, () => {
    const page = feedbackForm(lang, false);
    page.submit(true);
    assert.equal(page.visits.length, 0);
    assert.equal(page.field.value, thought);
    assert.match(page.status.textContent, lang === "de" ? /Textdatei/ : /text file/);
    page.submit(false);
    assert.deepEqual(page.downloads, [lang === "de" ? "vera-rueckmeldung.txt" : "vera-feedback.txt"]);
    assert.equal(page.visits.length, 0);
  });

  test(`online feedback opens the GitHub draft with the original text (${lang})`, () => {
    const page = feedbackForm(lang, true);
    page.submit(true);
    assert.equal(page.visits.length, 1);
    const [url] = page.visits;
    assert.equal(url.origin + url.pathname, "https://github.com/AlexanderR1991/Vera/issues/new");
    assert.equal(url.searchParams.get("title"), "[Test] Atlas");
    assert.ok(url.searchParams.get("body").includes(thought));
  });
}
