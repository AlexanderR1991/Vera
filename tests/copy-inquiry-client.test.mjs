import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {createContext, runInContext} from 'node:vm';

const source = readFileSync(new URL('../src/client/copy-inquiry.mjs', import.meta.url), 'utf8');
function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return {promise, resolve, reject};
}
function mount(lang, clipboardAvailable = true) {
  const jobs = [], details = {open: false}, status = {textContent: ''};
  const button = {hidden: true, dataset: {copied: 'Copied ' + lang}, addEventListener(type, fn) {
    assert.equal(type, 'click'); this.click = fn;
  }};
  const outside = {}, document = {activeElement: outside, documentElement: {lang}};
  const field = {value: 'Synthetic framework', selections: 0, focuses: 0,
    closest(selector) { assert.equal(selector, 'details'); return details; },
    focus() { this.focuses++; document.activeElement = field; },
    select() { this.selections++; }};
  const nodes = new Map([['button[data-copy-inquiry]', button], ['textarea#inquiry-prompt', field],
    ['[data-copy-status]', status]]);
  document.querySelector = selector => { assert(nodes.has(selector)); return nodes.get(selector); };
  const navigator = clipboardAvailable ? {clipboard: {writeText(text) {
    assert.equal(text, field.value); const job = deferred(); jobs.push(job); return job.promise;
  }}} : {};
  runInContext(source, createContext({document, navigator}));
  return {button, field, status, details, document, outside, jobs};
}
const failureText = lang => lang === 'en'
  ? 'The text is selected. Use your device’s Copy command.'
  : 'Der Text ist markiert. Nutze die Kopierfunktion deines Geräts.';
const finish = (job, outcome) => outcome === 'success' ? job.resolve() : job.reject(new Error('Synthetic rejection'));

test('only the newest copy attempt may report or activate the manual fallback', async () => {
  for (const lang of ['de', 'en']) for (const oldOutcome of ['success', 'failure']) {
    for (const newOutcome of ['success', 'failure']) for (const order of [[0, 1], [1, 0]]) {
      const view = mount(lang);
      const pending = [view.button.click(), view.button.click()];
      for (const index of order) {
        finish(view.jobs[index], [oldOutcome, newOutcome][index]); await pending[index];
        const latestFinished = index === 1 || order[0] === 1;
        const latestFailed = latestFinished && newOutcome === 'failure';
        assert.equal(view.status.textContent, !latestFinished ? '' : latestFailed ? failureText(lang) : view.button.dataset.copied);
        assert.equal(view.details.open, latestFailed);
        assert.equal(view.field.focuses, latestFailed ? 1 : 0);
        assert.equal(view.field.selections, latestFailed ? 1 : 0);
        assert.equal(view.document.activeElement, latestFailed ? view.field : view.outside);
      }
      assert.equal(view.jobs.length, 2);
    }
  }
});

test('current success, current rejection and unavailable clipboard retain useful feedback', async () => {
  for (const lang of ['de', 'en']) {
    for (const outcome of ['success', 'failure']) {
      const view = mount(lang); const pending = view.button.click();
      finish(view.jobs[0], outcome); await pending;
      assert.equal(view.button.hidden, false);
      assert.equal(view.status.textContent, outcome === 'success' ? view.button.dataset.copied : failureText(lang));
      assert.equal(view.details.open, outcome === 'failure');
    }
    const unavailable = mount(lang, false); await unavailable.button.click();
    assert.equal(unavailable.status.textContent, failureText(lang));
    assert.equal(unavailable.details.open, true);
    assert.equal(unavailable.field.selections, 1);
  }
});

test('starting a new copy clears the previous report while it is pending', async () => {
  for (const lang of ['de', 'en']) {
    const view = mount(lang); const first = view.button.click();
    finish(view.jobs[0], 'success'); await first;
    assert.equal(view.status.textContent, view.button.dataset.copied);
    const next = view.button.click();
    assert.equal(view.status.textContent, '');
    finish(view.jobs[1], 'failure'); await next;
    assert.equal(view.status.textContent, failureText(lang));
  }
});
