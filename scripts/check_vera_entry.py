#!/usr/bin/env python3
"""Check the public path from Vera's homepage to an objection."""
import argparse
import json
import re
import sys
from urllib.parse import urljoin
from urllib.request import Request, urlopen

from validate_site import DIST, ROOT, SITE, Page

PROJECT = json.loads((ROOT / "public/project.json").read_text(encoding="utf-8"))
REPOSITORY = PROJECT["repository"]
FEEDBACK = REPOSITORY + "/issues/new?template=kritik.yml"
ENTRIES = {"de": "vera-fragen", "en": "ask-vera"}


class EntryPage(Page):
    def __init__(self, html):
        super().__init__()
        self.marked_links = {}
        self.identity_open = False
        self.feed(html)
        self.close()

    def handle_starttag(self, tag, attrs):
        super().handle_starttag(tag, attrs)
        props = dict(attrs)
        if tag == "details" and props.get("data-entity-question") == "identity":
            self.identity_open = "open" in props and "hidden" not in props
        if tag == "a" and "hidden" not in props:
            for marker in ("data-vera-entry", "data-vera-correction", "data-vera-feedback", "data-vera-revision"):
                if marker in props:
                    key = (marker, props[marker])
                    self.marked_links.setdefault(key, []).append(props.get("href", ""))


def read_page(path, live):
    url = urljoin(SITE, path)
    if live:
        request = Request(url, headers={"Cache-Control": "no-cache"})
        with urlopen(request, timeout=10) as response:
            if response.status != 200 or response.url != url or response.headers.get_content_type() != "text/html":
                raise ValueError("expected HTTP 200 HTML at the canonical URL")
            return EntryPage(response.read(1024 * 1024).decode("utf-8"))
    return EntryPage((DIST / path / "index.html").read_text(encoding="utf-8"))


def check(read, *, live=False, revision=None):
    errors = []
    revisions = {}
    for lang, anchor in ENTRIES.items():
        home_path = lang + "/"
        guide_path = home_path + "regelkreis/"
        home_url = urljoin(SITE, home_path)
        guide_url = urljoin(SITE, guide_path)
        try:
            home, guide = read(home_path), read(guide_path)
        except (OSError, ValueError) as error:
            errors.append(f"{lang}: could not verify public entry: {error}")
            continue

        for path, page in ((home_path, home), (guide_path, guide)):
            if page.lang != lang or page.canonical != urljoin(SITE, path) or page.h1_count != 1:
                errors.append(f"{path}: wrong language, canonical URL or main heading")

        if home.marked_links.get(("data-vera-entry", None)) != ["#" + anchor] or anchor not in home.ids:
            errors.append(f"{lang}: missing homepage link to Vera's questions")
        other = "en" if lang == "de" else "de"
        if not any(tag == "a" and urljoin(home_url, href) == urljoin(SITE, other + "/")
                   for tag, href in home.refs):
            errors.append(f"{lang}: missing switch to the other language")
        correction = home.marked_links.get(("data-vera-correction", "identity"), [])
        if not home.identity_open or len(correction) != 1 or urljoin(home_url, correction[0]) != guide_url + "#korrektur":
            errors.append(f"{lang}: first answer or its correction link is missing")
        if "korrektur" not in guide.ids or guide.marked_links.get(("data-vera-feedback", None)) != [FEEDBACK]:
            errors.append(f"{lang}: correction guide or GitHub objection link is missing")

        if live or revision:
            prefix = REPOSITORY + "/commit/"
            links = home.marked_links.get(("data-vera-revision", None), [])
            sha = links[0].removeprefix(prefix) if len(links) == 1 and links[0].startswith(prefix) else ""
            if not re.fullmatch(r"[a-f0-9]{40}", sha):
                errors.append(f"{lang}: no unique source revision")
            else:
                revisions[lang] = sha
                if revision and sha != revision:
                    errors.append(f"{lang}: expected {revision}, received {sha}")
    if len(set(revisions.values())) > 1:
        errors.append(f"Public language versions report different revisions: {revisions}")
    return errors, revisions


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--live", action="store_true", help="Read the public site instead of dist/")
    parser.add_argument("--revision", help="Require this full Git commit on both homepages")
    args = parser.parse_args()
    if args.revision and not re.fullmatch(r"[a-f0-9]{40}", args.revision):
        parser.error("--revision requires a full Git commit SHA")
    errors, revisions = check(lambda path: read_page(path, args.live), live=args.live, revision=args.revision)
    for lang, sha in revisions.items():
        print(f"{lang}: source revision {sha}")
    if errors:
        sys.exit("\n".join(errors))
    print("DE and EN: verified homepage, language switch, first answer and route to an objection.")


if __name__ == "__main__":
    main()
