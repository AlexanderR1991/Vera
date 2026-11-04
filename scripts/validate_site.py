#!/usr/bin/env python3
"""Validate the static website using only Python's standard library."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse, unquote
import sys

ROOT = Path(__file__).resolve().parents[1]
errors = []


class Check(HTMLParser):
    def __init__(self, file):
        super().__init__(convert_charrefs=True)
        self.file = file
        self.ids = set()
        self.refs = []
        self.has_lang = False
        self.h1_count = 0
        self.has_title = False
        self._in_title = False

    def handle_starttag(self, tag, attrs):
        props = dict(attrs)
        if tag == "html" and props.get("lang") == "de":
            self.has_lang = True
        if tag == "h1":
            self.h1_count += 1
        if tag == "title":
            self._in_title = True
        ident = props.get("id")
        if ident:
            if ident in self.ids:
                errors.append(f"{self.file.name}: duplicate id {ident}")
            self.ids.add(ident)
        for attr in ("href", "src"):
            if props.get(attr):
                self.refs.append(props[attr])

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False

    def handle_data(self, data):
        if self._in_title and data.strip():
            self.has_title = True


def check():
    pages = sorted(ROOT.glob("*.html"))
    if not pages:
        errors.append("No HTML pages found")
    parsed = {}
    for file in pages:
        parser = Check(file)
        parser.feed(file.read_text(encoding="utf8"))
        parsed[file.resolve()] = parser
        if not parser.has_lang:
            errors.append(f"{file.name}: missing lang=de")
        if not parser.has_title:
            errors.append(f"{file.name}: missing page title")
        if parser.h1_count != 1:
            errors.append(f"{file.name}: expected one h1, found {parser.h1_count}")
    for file, parser in parsed.items():
        for ref in parser.refs:
            url = urlparse(ref)
            if url.scheme or url.netloc or ref.startswith("//"):
                continue
            target = (file.parent / unquote(url.path)).resolve() if url.path else file
            if not target.exists():
                errors.append(f"{file.name}: broken reference {ref}")
                continue
            if url.fragment and target.suffix.lower() == ".html":
                target_parser = parsed.get(target)
                if target_parser is not None and unquote(url.fragment) not in target_parser.ids:
                    errors.append(f"{file.name}: missing anchor {ref}")
    if errors:
        print("SITE CHECK FAILED")
        print("\n".join(" - " + msg for msg in errors))
        sys.exit(1)
    print(f"SITE CHECK PASSED: {len(pages)} HTML pages; local links, anchors, language and headings.")


if __name__ == "__main__":
    check()
