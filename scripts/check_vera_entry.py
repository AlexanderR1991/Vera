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
    VOID_TAGS = set("area base br col embed hr img input link meta param source track wbr".split())

    def __init__(self, html):
        super().__init__()
        self.ancestors = []
        self.first_summary = {}  # details depth -> attributes of its first summary child
        self.marked_links = {}
        self.language_links = []
        self.first_question = None
        self.feed(html)
        self.close()

    def handle_starttag(self, tag, attrs):
        super().handle_starttag(tag, attrs)
        props = dict(attrs)
        depth = len(self.ancestors)
        if tag == "details":
            self.first_summary[depth] = None
        elif tag == "summary" and depth and self.ancestors[-1][0] == "details":
            if self.first_summary[depth - 1] is None:
                self.first_summary[depth - 1] = props
        if tag not in self.VOID_TAGS:
            self.ancestors.append((tag, props))
        if tag not in ("details", "a"):
            return
        if any(t == "template" or "hidden" in p or "inert" in p or p.get("aria-hidden") == "true"
               for t, p in self.ancestors):
            return
        for index, (ancestor, attributes) in enumerate(self.ancestors[:-1]):
            if ancestor == "details" and "open" not in attributes:
                if self.ancestors[index + 1][1] is not self.first_summary[index]:
                    return
        ids = {p["id"] for _, p in self.ancestors if "id" in p}
        in_questions = ENTRIES.get(self.lang) in ids
        question = props.get("data-entity-question")
        if tag == "details" and in_questions and question and self.first_question is None:
            self.first_question = question
        if tag != "a":
            return
        href = props.get("href", "")
        if props.get("hreflang"):
            self.language_links.append((props["hreflang"], href))
        for marker in ("data-vera-entry", "data-vera-correction", "data-vera-feedback", "data-vera-local-feedback", "data-vera-revision"):
            if marker not in props:
                continue
            if marker == "data-vera-correction" and not (in_questions and any(
                t == "details" and "open" in p and p.get("data-entity-question") == props[marker] for t, p in self.ancestors
            )):
                continue
            if marker in ("data-vera-feedback", "data-vera-local-feedback") and "korrektur" not in ids:
                continue
            self.marked_links.setdefault((marker, props[marker]), []).append(href)

    def handle_endtag(self, tag):
        for index in range(len(self.ancestors) - 1, -1, -1):
            if self.ancestors[index][0] == tag:
                del self.ancestors[index:]
                break


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
            other = "en" if lang == "de" else "de"
            alternate = urljoin(SITE, path.replace(lang + "/", other + "/", 1))
            if not any(target == other and urljoin(page.canonical or SITE, href) == alternate
                       for target, href in page.language_links):
                errors.append(f"{path}: missing switch to the other language")

        if home.marked_links.get(("data-vera-entry", None)) != ["#" + anchor] or anchor not in home.ids - home.duplicates:
            errors.append(f"{lang}: missing homepage link to Vera's questions")
        correction = home.marked_links.get(("data-vera-correction", "identity"), [])
        if home.first_question != "identity" or len(correction) != 1 or urljoin(home_url, correction[0]) != guide_url + "#korrektur":
            errors.append(f"{lang}: first answer or its correction link is missing")
        if "korrektur" not in guide.ids - guide.duplicates or guide.marked_links.get(("data-vera-feedback", None)) != [FEEDBACK]:
            errors.append(f"{lang}: correction guide or GitHub objection link is missing")
        draft = guide.marked_links.get(("data-vera-local-feedback", None), [])
        if len(draft) != 1 or urljoin(guide_url, draft[0]) != urljoin(SITE, home_path + "mitwirken/#entwurf"):
            errors.append(f"{lang}: correction guide has no local draft link")

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
