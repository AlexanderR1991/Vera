#!/usr/bin/env python3
"""Check the deployed Pages paths offline, including every generated fragment link."""
from collections import defaultdict
from html import unescape
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys
from urllib.parse import unquote, urljoin, urlsplit
from xml.etree import ElementTree

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
SITE = json.loads((ROOT / "public/project.json").read_text())["website"]
BASE = urlsplit(SITE)


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.duplicates = set()
        self.refs = []
        self.alternates = {}
        self.canonical = None
        self.lang = None
        self.h1_count = 0

    def handle_starttag(self, tag, attrs):
        props = dict(attrs)
        if tag == "html":
            self.lang = props.get("lang")
        if tag == "h1":
            self.h1_count += 1
        if ident := props.get("id"):
            if ident in self.ids:
                self.duplicates.add(ident)
            self.ids.add(ident)
        for attr in ("href", "src"):
            if ref := props.get(attr):
                self.refs.append((tag, ref))
        if tag == "link" and props.get("rel") == "canonical":
            self.canonical = props.get("href")
        if tag == "link" and props.get("rel") == "alternate":
            self.alternates[props.get("hreflang")] = props.get("href")


def check_rule_pack(lang, errors):
    pack = (DIST / "prompts" / f"wirklich-regeln.{lang}.txt").read_text()
    prompt = (ROOT / "public" / "prompts" / f"erkenntnisprompt-v1.{lang}.txt").read_text()
    guide = (DIST / lang / "fragen-und-ki-prompt" / "index.html").read_text()
    worksheet = (DIST / lang / "werkstatt" / "index.html").read_text()
    preview = re.search(r'<textarea\b[^>]*\bid="inquiry-prompt"[^>]*>(.*?)</textarea>', guide, re.S)
    embedded = re.search(r'<script\b[^>]*\bdata-inquiry-rules\b[^>]*>(.*?)</script>', worksheet, re.S)
    if not preview or unescape(preview[1]) != pack:
        errors.append(f"{lang}: manual copy and rule pack download differ")
    if not embedded or json.loads(embedded[1]) != pack:
        errors.append(f"{lang}: worksheet export uses different rules")
    label = "These" if lang == "de" else "Thesis"
    numbers = re.findall(rf"^{label} (\d+):", pack, re.M)
    if numbers != [f"{n:02}" for n in range(1, 10)] or not pack.endswith(prompt):
        errors.append(f"{lang}: expected the nine theses and the complete inquiry prompt")


def check():
    pages = {}
    errors = []
    # The book is archived in the repository. The planned domain is not a site address.
    book_path = re.compile(r"die[-_]richtung(?![a-z])", re.I)
    book_title = re.compile(r"""[„“«"'‘>]\s*Die Richtung\s*[“”»"'’<]|\b(?:Buch|book) Die Richtung\b""")
    for file in sorted(DIST.rglob("*")):
        if not file.is_file():
            continue
        path = file.relative_to(DIST).as_posix()
        if book_path.search(path):
            errors.append(f"{path}: repository-only book included in Pages output")
        if file.suffix not in {".html", ".xml", ".json", ".txt", ".js", ".css", ".svg"} and file.name != "CNAME":
            continue
        content = file.read_text(encoding="utf8")
        decoded = unescape(content)
        if "wirklich.org" in decoded.lower() or book_path.search(decoded) or book_title.search(decoded):
            errors.append(f"{path}: unpublished address or repository-only book reference")
        if file.suffix == ".html":
            page = Page()
            page.feed(content)
            pages[file] = page

    links = 0
    neighbors = defaultdict(set)
    canonical_urls = set()
    for file, page in pages.items():
        path = file.relative_to(DIST).as_posix()
        page_url = urljoin(SITE, path.removesuffix("index.html") if file.name == "index.html" else path)
        if page.duplicates:
            errors.append(f"{path}: duplicate ids {sorted(page.duplicates)}")
        if file.name == "index.html":
            lang, _, slug = path.partition("/")
            locale = lang if slug else "de"
            if page.lang != locale or page.h1_count != 1:
                errors.append(f"{path}: expected lang={locale} and one main heading")
            if page.canonical != page_url:
                errors.append(f"{path}: expected canonical {page_url}")
            canonical_urls.add(page_url)
            for alternate in ("de", "en"):
                dest = urljoin(SITE, alternate + "/" + slug.removesuffix("index.html"))
                if page.alternates.get(alternate) != dest:
                    errors.append(f"{path}: wrong {alternate} alternate; expected {dest}")
        for tag, ref in page.refs:
            url = urlsplit(urljoin(page_url, ref))
            if url.scheme not in ("http", "https") or url.netloc != BASE.netloc:
                continue
            links += 1
            if not url.path.startswith(BASE.path):
                errors.append(f"{path}: outside the deployed base: {ref}")
                continue
            target = DIST / unquote(url.path[len(BASE.path):])
            if target.is_dir():
                target /= "index.html"
            if not target.is_file():
                errors.append(f"{path}: missing target {ref}")
            elif target in pages:
                if url.fragment and unquote(url.fragment) not in pages[target].ids:
                    errors.append(f"{path}: missing fragment {ref}")
                if tag == "a":
                    neighbors[file].add(target)

    for lang in ("de", "en"):
        check_rule_pack(lang, errors)
        home = DIST / lang / "index.html"
        pending, seen = [home], set()
        while pending:
            current = pending.pop()
            if current not in seen:
                seen.add(current)
                pending.extend(target for target in neighbors[current] if target.is_relative_to(home.parent))
        for file in pages.keys() - seen:
            if file.is_relative_to(home.parent):
                errors.append(f"{file.relative_to(DIST)}: unreachable from the {lang} homepage")

    sitemap = ElementTree.parse(DIST / "sitemap.xml")
    listed_urls = {loc.text for loc in sitemap.iter("{http://www.sitemaps.org/schemas/sitemap/0.9}loc")}
    for url in sorted(listed_urls ^ canonical_urls):
        errors.append(f"Sitemap and canonical pages disagree: {url}")
    if errors:
        sys.exit("\n".join(errors))
    print(f"Verified {len(pages)} HTML files and {links} internal references, fragments, "
          "language pairs, sitemap and navigation from both homepages.")


if __name__ == "__main__":
    check()
