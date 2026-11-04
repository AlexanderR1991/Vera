#!/usr/bin/env python3
"""Validate the public static site without installing dependencies."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse, unquote
import sys

ROOT = Path(__file__).resolve().parents[1]
EXCLUDE = {".git", "node_modules", ".venv"}
PAGES = sorted(ROOT.glob("*.html"))
errors = []

class Check(HTMLParser):
    def __init__(self, file):
        super().__init__(convert_charrefs=True)
        self.file = file
        self.ids = set()
        self.refs = []
        self.has_lang = False
        self.has_title = False
        self.h1_count = 0
    def handle_starttag(self, tag, attrs):
        props = dict(attrs)
        if tag == "html" and props.get("lang") == "de": self.has_lang = True
        if tag == "h1": self.h1_count += 1
        ident = props.get("id")
        if ident:
            if ident in self.ids: errors.append(f"{self.file.name}: duplicate id {ident}")
            self.ids.add(ident)
        for attr in ("href", "src"):
            if props.get(attr): self.refs.append(props[attr])
    def handle_data(self, data):
        if getattr(self, "in_title", False) and data.strip(): self.has_title = True
    def handle_endtag(self, tag):
        if tag == "title": self.in_title = False
    def handle_startendtag(self, tag, attrs): self.handle_starttag(tag, attrs)

if not PAGES: errors.append("No HTML pages found")
for file in PAGES:
    text = file.read_text(encoding="utf8")
    if "<title>" not in text: errors.append(f"{file.name}: missing title")
    p = Check(file)
    p.feed(text)
    if not p.has_lang: errors.append(f"{file.name}: missing lang=de")
    if p.h1_count != 1: errors.append(f"{file.name}: expected exactly one h1, found {p.h1_count}")
    for ref in p.refs:
        u = urlparse(ref)
        if u.scheme in ("https", "http", "mailto", "tel", "data") or ref.startswith("//"): continue
        target = ROOT / unquote(u.path) if u.path.startswith("/") else file.parent / unquote(u.path)
        if not u.path: target = file
        if not target.exists(): errors.append(f"{file.name}: broken reference {ref}")
        if u.fragment and target.suffix == ".html" and target.exists():
            content = target.read_text(encoding="utf8")
            import re
            if not re.search(r'\\bid=["\\\']'+re.escape(u.fragment)+r'["\\\']', content):
                errors.append(f"{file.name}: missing target anchor {ref}")
if errors:
    print("SITE CHECK FAILED")
    print("\n".join(" - "+s for s in errors))
    sys.exit(1)
print(f"SITE CHECK PASSED: {len(PAGES)} HTML pages; checked links, lang and headings.")
