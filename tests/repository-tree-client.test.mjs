import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {createContext, runInContext} from 'node:vm';

const library = readFileSync(new URL('../src/lib/repository-tree.mjs', import.meta.url), 'utf8');
const source = readFileSync(new URL('../src/client/repository-tree.mjs', import.meta.url), 'utf8');
const id = n => String(n).repeat(40);
const settle = () => new Promise(resolve => setImmediate(resolve));
class Element {
  dataset = {}; children = []; listeners = new Map(); hidden = false;
  textContent = ''; disabled = false; href = '';
  append(...nodes) { this.children.push(...nodes); }
  replaceChildren(...nodes) { this.children = nodes; }
  addEventListener(type, fn) { this.listeners.set(type, fn); }
  contains(target) { return this === target || this.children.some(node => node.contains(target)); }
  focus() {}
  setAttribute() {}
}

async function mount(lang, initial = {}) {
  const state = {head: id(3), tree: id(4), ...initial};
  const controls = Object.fromEntries(['status', 'refresh', 'map', 'heading', 'github', 'trail', 'tiles', 'graph']
    .map(name => [name, new Element()]));
  const page = new Element();
  page.dataset = {
    repository: 'https://github.com/example/synthetic',
    snapshot: JSON.stringify({sha: id(2), commit: id(1), entries: [{path: 'build.txt', type: 'blob'}]}),
    copy: JSON.stringify(Object.fromEntries(['folder', 'file', 'submodule', 'empty', 'waiting', 'contents',
      'checking', 'live', 'previous', 'build', 'unavailable'].map(name => [name, name])))
  };
  page.querySelector = selector => {
    const name = selector.match(/^\[data-tree-(.+)\]$/)?.[1];
    assert(Object.hasOwn(controls, name), selector); return controls[name];
  };
  page.querySelectorAll = () => [];
  const calls = [];
  const document = {documentElement: {lang}, activeElement: null, createElement: () => new Element()};
  const fetch = async (url, options) => {
    assert.equal(options.credentials, 'omit');
    assert.equal(options.referrerPolicy, 'no-referrer');
    assert.equal(options.cache, 'no-cache');
    calls.push(url);
    const commitRequest = new URL(url).pathname.endsWith('/commits/main');
    if (state.fail === (commitRequest ? 'commit' : 'tree')) return {ok: false, status: 503};
    let body;
    if (commitRequest) {
      body = state.badCommit ? {sha: 'invalid'} : {sha: state.head, commit: {tree: {sha: state.tree}}};
      if (state.moveDuringRead) { state.head = id(5); state.tree = id(6); }
    } else {
      const path = new URL(url).pathname;
      const requested = path.split('/').at(-1);
      const sha = requested === 'main' ? state.tree : requested;
      body = {sha: state.mismatch ? id(9) : sha, truncated: Boolean(state.truncated), tree: [
        {path: 'note.txt', type: 'blob'}, {path: 'docs', type: 'tree'},
        {path: 'docs/note.txt', type: 'blob'}
      ]};
    }
    return {ok: true, json: async () => body};
  };
  const graph = {render() {}, zoomIn() {}, zoomOut() {}, reset() {}};
  const context = createContext({document, fetch, URL, AbortController, setTimeout, clearTimeout,
    createRepositoryGraph: () => graph});
  runInContext(library.replace(/export function /g, 'function '), context);
  runInContext(source.replace(/^import .*;\s*$/gm, '').replace(/export function /g, 'function '), context);
  context.page = page;
  runInContext('mountRepositoryTree(page)', context);
  await settle(); await settle();
  const links = () => controls.tiles.children.map(node => node.children[0]).filter(Boolean);
  return {state, controls, calls, links, page,
    async refresh() { await controls.refresh.listeners.get('click')(); await settle(); }};
}

test('live entries retain their observed commit after main moves and on same-tree refresh', async () => {
  for (const lang of ['de', 'en']) {
    const view = await mount(lang);
    const href = view.links().find(link => link.href.endsWith('/note.txt')).href;
    assert.equal(href, 'https://github.com/example/synthetic/blob/' + id(3) + '/note.txt');
    assert.match(view.controls.github.href, new RegExp('/tree/' + id(3) + '$'));
    view.state.head = id(5); view.state.tree = id(6);
    assert.equal(view.links().find(link => link.href.endsWith('/note.txt')).href, href);
    await view.refresh();
    assert(view.links().every(link => link.href.includes('/' + id(5) + '/')));
    view.state.head = id(7); await view.refresh();
    assert(view.links().every(link => link.href.includes('/' + id(7) + '/')));
    assert.equal(view.calls.length, 6);
    assert.equal(view.controls.status.textContent, 'live · main · ' + id(7).slice(0, 7));
  }
});

test('a branch move between commit and tree reads cannot change the requested snapshot', async () => {
  for (const lang of ['de', 'en']) {
    const view = await mount(lang, {moveDuringRead: true});
    assert.equal(view.state.head, id(5));
    assert.equal(view.calls.length, 2);
    assert(view.calls[1].endsWith('/git/trees/' + id(4) + '?recursive=1'));
    assert(view.links().every(link => link.href.includes('/' + id(3) + '/')));
    const folder = view.links().find(link => link.dataset.folder === 'docs');
    view.page.listeners.get('click')({target: {closest: () => folder}, button: 0, preventDefault() {}});
    assert(view.links()[0].href.includes('/blob/' + id(3) + '/docs/note.txt'));
    assert(view.controls.github.href.includes('/tree/' + id(3) + '/docs'));
    assert(view.controls.trail.children[0].href.endsWith('/tree/' + id(3)));
  }
});

test('failed or inconsistent responses preserve the build snapshot and restore refresh controls', async () => {
  for (const lang of ['de', 'en']) for (const invalid of [
    {badCommit: true}, {mismatch: true}, {truncated: true}, {fail: 'commit'}, {fail: 'tree'}
  ]) {
    const view = await mount(lang, invalid);
    assert.equal(view.controls.status.dataset.state, 'fallback');
    assert.equal(view.links()[0].href, 'https://github.com/example/synthetic/blob/' + id(1) + '/build.txt');
    assert.equal(view.controls.refresh.disabled, false);
    assert.equal(view.calls.length, invalid.badCommit || invalid.fail === 'commit' ? 1 : 2);
  }
});

test('a failed later refresh retains the last complete commit-bound live snapshot', async () => {
  for (const lang of ['de', 'en']) {
    const view = await mount(lang);
    const prior = view.links().map(link => link.href);
    view.state.mismatch = true;
    view.state.head = id(5); view.state.tree = id(6);
    await view.refresh();
    assert.deepEqual(view.links().map(link => link.href), prior);
    assert.equal(view.controls.status.dataset.state, 'fallback');
    assert.equal(view.controls.refresh.disabled, false);
    view.state.mismatch = false; await view.refresh();
    assert.equal(view.controls.status.dataset.state, 'live');
    assert(view.links().every(link => link.href.includes('/' + id(5) + '/')));
  }
});
