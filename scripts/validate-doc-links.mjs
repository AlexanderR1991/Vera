import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import GithubSlugger from 'github-slugger';

const parser = unified().use(remarkParse);
const read = path => readFileSync(path, 'utf8');
const within = (parent, target) => {
  const rel = relative(parent, target);
  return rel !== '..' && !rel.startsWith('..' + sep) && !isAbsolute(rel);
};
const walk = (node, visit) => {
  visit(node);
  for (const child of node.children ?? []) walk(child, visit);
};
const plainText = node => node.type === 'html' ? '' :
  node.value ?? node.alt ?? (node.children ?? []).map(plainText).join('');
const htmlAttributes = (html, name) => [...html.matchAll(new RegExp(
  `(?:^|\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'gi'
))].map(match => match[1] ?? match[2] ?? match[3]);

export function parseMarkdown(source) {
  const tree = parser.parse(source);
  const anchors = new Set();
  const slugger = new GithubSlugger();
  const definitions = new Map();
  const links = [];
  walk(tree, node => {
    if (node.type === 'definition' && !definitions.has(node.identifier)) {
      definitions.set(node.identifier, node.url);
    }
    if (node.type === 'heading') anchors.add(slugger.slug(plainText(node)));
    if (node.type === 'html') {
      for (const id of [...htmlAttributes(node.value, 'id'), ...htmlAttributes(node.value, 'name')]) anchors.add(id);
    }
  });
  walk(tree, node => {
    const line = node.position?.start.line ?? 1;
    if (node.type === 'link' || node.type === 'image') links.push({ url: node.url, line });
    if (node.type === 'linkReference' || node.type === 'imageReference') {
      const url = definitions.get(node.identifier);
      if (url) links.push({ url, line });
    }
    if (node.type === 'html') {
      for (const url of [...htmlAttributes(node.value, 'href'), ...htmlAttributes(node.value, 'src')]) {
        links.push({ url: url.replace(/&amp;/g, '&'), line });
      }
    }
  });
  return { anchors, links };
}

// Local paths and current project URLs are checked offline. External resources and
// historical Git revisions are left to source review, not treated as verified.
export function validateDocLinks({ root, files, siteUrl, repository, dist = null }) {
  root = resolve(root);
  const site = new URL(siteUrl);
  const repo = new URL(repository.replace(/\/$/, '') + '/');
  const parsed = new Map();
  const errors = [];
  let checked = 0, external = 0, deferredSite = 0;
  const markdown = path => {
    if (!parsed.has(path)) parsed.set(path, parseMarkdown(read(path)));
    return parsed.get(path);
  };
  const targetAnchors = path => extname(path) === '.md'
    ? markdown(path).anchors
    : new Set([...htmlAttributes(read(path), 'id'), ...htmlAttributes(read(path), 'name')]);

  for (const filename of files) {
    const file = resolve(root, filename);
    for (const link of markdown(file).links) {
      let target, fragment;
      const fail = message => errors.push(`${filename}:${link.line}: ${message}: ${link.url}`);
      try {
        const absolute = /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(link.url);
        const url = new URL(link.url, absolute ? site : 'https://repository.invalid/');
        fragment = decodeURIComponent(url.hash.slice(1));
        if (absolute && url.origin === site.origin) {
          if (!url.pathname.startsWith(site.pathname)) {
            fail('outside the published site base');
            continue;
          }
          if (!dist) { deferredSite++; continue; }
          target = resolve(dist, decodeURIComponent(url.pathname.slice(site.pathname.length)));
        } else if (absolute && url.origin === repo.origin && url.pathname.startsWith(repo.pathname)) {
          const subpath = url.pathname.slice(repo.pathname.length);
          if (/^(?:blob|tree)\/main\//.test(subpath)) {
            target = resolve(root, decodeURIComponent(subpath.replace(/^(?:blob|tree)\/main\//, '')));
            if (/^L\d+(?:-L\d+)?$/.test(fragment)) fragment = '';
          } else if (subpath === 'issues/new' && url.searchParams.has('template')) {
            target = resolve(root, '.github/ISSUE_TEMPLATE', url.searchParams.get('template'));
          } else { external++; continue; }
        } else if (absolute) {
          external++;
          continue;
        } else {
          const pathname = decodeURIComponent(link.url.split(/[?#]/, 1)[0]);
          target = pathname ? resolve(pathname.startsWith('/') ? root : dirname(file), pathname.replace(/^\//, '')) : file;
        }
        const boundary = dist && within(resolve(dist), target) ? resolve(dist) : root;
        if (!within(boundary, target)) {
          fail('target escapes the checkout');
          continue;
        }
        checked++;
        if (!existsSync(target)) { fail('missing target'); continue; }
        if (statSync(target).isDirectory()) {
          if (dist && within(resolve(dist), target)) target = resolve(target, 'index.html');
          else if (fragment && existsSync(resolve(target, 'README.md'))) target = resolve(target, 'README.md');
          else continue;
          if (!existsSync(target)) { fail('missing index'); continue; }
        }
        if (fragment && ['.md', '.html', '.svg'].includes(extname(target)) && !targetAnchors(target).has(fragment)) {
          fail(`missing anchor #${fragment}`);
        }
      } catch (error) {
        fail(error.message);
      }
    }
  }
  return { files: files.length, checked, external, deferredSite, errors };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.some(arg => arg !== '--dist') || args.length > 1) throw new Error('Usage: node scripts/validate-doc-links.mjs [--dist]');
  const root = fileURLToPath(new URL('../', import.meta.url));
  const project = JSON.parse(read(resolve(root, 'public/project.json')));
  const dist = args.includes('--dist') ? resolve(root, 'dist') : null;
  if (dist && !existsSync(resolve(dist, 'index.html'))) throw new Error('Build the site before checking --dist links.');
  const files = execFileSync('git', ['ls-files', '-z', '--', '*.md'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
  const result = validateDocLinks({ root, files, siteUrl: project.website, repository: project.repository, dist });
  if (result.errors.length) {
    console.error(result.errors.join('\n'));
    process.exitCode = 1;
  } else {
    console.log(`Verified ${result.checked} local links and anchors in ${result.files} Markdown files; ${result.external} external or historical references not fetched; ${result.deferredSite} site links deferred${dist ? '' : ' (run with --dist after building)'}.`);
  }
}
