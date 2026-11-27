import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const moduleFile = new URL('../src/lib/rule-pack.mjs', import.meta.url);
const commit = 'a'.repeat(40);
const base = `https://github.com/AlexanderR1991/Vera/blob/${commit}/docs/ki-charta.md`;
const read = file => readFileSync(new URL(file, moduleFile), 'utf8');

// Execute the actual exporter; only its bundler-owned raw/JSON imports are
// supplied locally, without running a build or installing a Markdown loader.
function load(charter) {
  const inputs = {};
  let source = readFileSync(moduleFile, 'utf8').replace(
    /^import (\w+) from "([^"]+)"(?: with \{type: "json"\})?;$/gm,
    (_, name, path) => {
      const raw = path.endsWith('?raw');
      const text = read(path.replace(/\?raw$/, ''));
      inputs[name] = raw ? text : JSON.parse(text);
      return '';
    }
  );
  if (charter !== undefined) inputs.aiCharter = charter;
  source = source.replace(/^export /gm, '');
  return new Function(...Object.keys(inputs), 'process', source + '\nreturn rulePack;')(
    ...Object.values(inputs), {env: {GITHUB_SHA: commit}}
  );
}

test('both exported charters resolve fixture links against the pinned source', () => {
  const targets = ['selbstkorrektur.md', '../public/ai/philosophy-engine.v0.json',
    '#frei-01--freiwilligkeit', 'https://example.org/check?x=1#result'];
  const section = targets.map((target, i) => `[Synthetic ${i}](${target})`).join('\n');
  const rulePack = load(section + '\n## English\n' + section);
  for (const lang of ['de', 'en']) {
    const output = rulePack(lang);
    for (const [i, target] of targets.entries()) {
      assert(output.includes(`[Synthetic ${i}](${new URL(target, base).href})`), `${lang}: ${target}`);
    }
  }
});

test('current DE and EN charter links retain the original document and revision', () => {
  const rulePack = load();
  const sections = read('../../docs/ki-charta.md').split(/^## English\s*$/m);
  for (const [index, lang] of ['de', 'en'].entries()) {
    const output = rulePack(lang);
    const links = [...sections[index].matchAll(/\]\(([^)\s]+)\)/g)].map(match => match[1]);
    assert(links.length > 0);
    for (const target of links) {
      assert(output.includes(`](${new URL(target, base).href})`), `${lang}: ${target}`);
    }
  }
});
