import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { parseMarkdown, validateDocLinks } from '../scripts/validate-doc-links.mjs';

function fixture(t, contents) {
  const root = mkdtempSync(join(tmpdir(), 'vera-doc-links-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const [name, content] of Object.entries(contents)) {
    const file = join(root, name);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, content);
  }
  return { root, siteUrl: 'https://example.test/Vera/', repository: 'https://github.com/example/Vera' };
}

test('Markdown headings, references and image paths retain their meaning; code examples are ignored', t => {
  const setup = fixture(t, {
    'README.md': '# Start\n[Go][chapter]\n\n[chapter]: docs/guide.md#über-uns\n\n![Artwork](<images/open circle.svg>)\n\n```md\n[Example](missing.md)\n```',
    'docs/guide.md': 'Über *uns*\n========\n\n[Again](#über-uns-1)\n\n## Über uns\n',
    'images/open circle.svg': '<svg></svg>'
  });
  const result = validateDocLinks({ ...setup, files: ['README.md', 'docs/guide.md'] });
  assert.deepEqual(result.errors, []);
  assert.equal(result.checked, 3);
});

test('renamed files and headings fail separately, including parentheses and explicit HTML anchors', t => {
  const setup = fixture(t, {
    'README.md': '[Missing](gone.md)\n[Renamed](docs/guide.md#old-heading)\n[Valid](docs/guide.md#stable)\n[Parentheses](docs/guide(2).md)\n[Not an ID](docs/guide.md#not-an-anchor)',
    'docs/guide.md': '# New heading\n<a id="stable"></a>\n<div data-id="not-an-anchor"></div>',
    'docs/guide(2).md': '# Another guide'
  });
  const result = validateDocLinks({ ...setup, files: ['README.md'] });
  assert.equal(result.errors.length, 3);
  assert.match(result.errors[0], /missing target: gone\.md/);
  assert.match(result.errors[1], /missing anchor #old-heading/);
  assert.match(result.errors[2], /missing anchor #not-an-anchor/);
});

test('published routes and fragments resolve against the built base, with explicit deferral before build', t => {
  const setup = fixture(t, {
    'README.md': '[Start](https://example.test/Vera/de/#welcome)\n[Broken anchor](https://example.test/Vera/de/#old)\n[Missing page](https://example.test/Vera/en/missing/)\n[Old address](https://example.test/Wirklich/de/)',
    'dist/de/index.html': '<h1 id="welcome">Vera</h1>'
  });
  const deferred = validateDocLinks({ ...setup, files: ['README.md'] });
  assert.equal(deferred.deferredSite, 3);
  assert.equal(deferred.errors.length, 1);
  const built = validateDocLinks({ ...setup, files: ['README.md'], dist: join(setup.root, 'dist') });
  assert.equal(built.deferredSite, 0);
  assert.equal(built.errors.length, 3);
  assert.match(built.errors[0], /missing anchor #old/);
  assert.match(built.errors[1], /missing target/);
  assert.match(built.errors[2], /outside the published site base/);
});

test('current GitHub files and issue templates are checked; historical and foreign URLs stay outside the audit', t => {
  const setup = fixture(t, {
    'README.md': '[Current](https://github.com/example/Vera/blob/main/docs/guide.md#valid)\n[Lines](https://github.com/example/Vera/blob/main/docs/guide.md#L1-L2)\n[Template](https://github.com/example/Vera/issues/new?template=missing.yml)\n[Historical](https://github.com/example/Vera/blob/abcdef/docs/old.md)\n[External](https://elsewhere.test/page)',
    'docs/guide.md': '# Valid'
  });
  const result = validateDocLinks({ ...setup, files: ['README.md'] });
  assert.equal(result.external, 2);
  assert.equal(result.checked, 3);
  assert.equal(result.errors.length, 1);
  assert.match(result.errors[0], /missing target.*template=missing\.yml/);
});
