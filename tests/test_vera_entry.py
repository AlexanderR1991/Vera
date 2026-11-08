"""Exercise the published feedback path using small static HTML pages."""
from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from check_vera_entry import ENTRIES, FEEDBACK, SITE, EntryPage, check


def entry_pages():
    pages = {}
    for lang, anchor in ENTRIES.items():
        other = "en" if lang == "de" else "de"
        guide = f"{SITE}{lang}/regelkreis/"
        home_body = f"""
            <a data-vera-entry href="#{anchor}">Questions</a>
            <section id="{anchor}"><details data-entity-question="identity" open>
              <summary>Vera?</summary><p>Answer</p>
              <a data-vera-correction="identity" href="{guide}#korrektur">Correction</a>
            </details></section>"""
        guide_body = (f'<section id="korrektur"><a data-vera-local-feedback href="{SITE}{lang}/mitwirken/#entwurf">Draft</a>'
                      f'<a data-vera-feedback href="{FEEDBACK}">Form</a></section>')
        for suffix, body in (("", home_body), ("regelkreis/", guide_body)):
            path = f"{lang}/{suffix}"
            pages[path] = f"""<html lang="{lang}"><head><link rel="canonical" href="{SITE}{path}"></head>
                <body><a hreflang="{other}" href="{SITE}{other}/{suffix}">{other}</a>
                <h1>Vera</h1>{body}</body></html>"""
    return pages


class EntryPathTests(unittest.TestCase):
    def test_static_route_is_reachable(self):
        pages = entry_pages()
        errors, _ = check(lambda path: EntryPage(pages[path]))
        self.assertEqual(errors, [])

    def test_switch_in_first_summary_of_closed_details_is_visible(self):
        pages = entry_pages()
        switch = f'<a hreflang="en" href="{SITE}en/">en</a>'
        self.assertIn(switch, pages["de/"])
        pages["de/"] = pages["de/"].replace(switch, f'<details><summary>{switch}</summary></details>')
        errors, _ = check(lambda path: EntryPage(pages[path]))
        self.assertEqual(errors, [])

    def test_broken_routes_are_reported(self):
        cases = [
            ("de/", "open>", ">", "first answer"),  # closed on entry
            ("de/", 'id="vera-fragen"', 'id="vera-fragen" hidden', "first answer"),
            ("de/", "<details ", '<details data-entity-question="engine"></details><details ', "first answer"),
            ("de/", f'<a data-vera-correction="identity" href="{SITE}de/regelkreis/#korrektur">Correction</a>\n            </details>',
             f'</details><a data-vera-correction="identity" href="{SITE}de/regelkreis/#korrektur">Correction</a>', "first answer"),
            ("en/regelkreis/", f'<a data-vera-feedback href="{FEEDBACK}">Form</a></section>',
             f'</section><a data-vera-feedback href="{FEEDBACK}">Form</a>', "objection link"),
            ("en/regelkreis/", '<section id="korrektur">', '<section id="korrektur" inert>', "objection link"),
            ("en/", '<a hreflang="de"', '<a hidden hreflang="de"', "other language"),
            ("de/regelkreis/", '<a hreflang="en"', '<a hidden hreflang="en"', "other language"),
            ("de/regelkreis/", '<section id="korrektur">', '<i id="korrektur"></i><section id="korrektur">', "objection link"),
            ("en/", '<section id="ask-vera">', '<i id="ask-vera"></i><section id="ask-vera">', "homepage link"),
            ("de/", f'<a hreflang="en" href="{SITE}en/">en</a>',
             f'<details><summary>Menu</summary><summary><a hreflang="en" href="{SITE}en/">en</a></summary></details>', "other language"),
            ("de/regelkreis/", "de/mitwirken/#entwurf", "en/mitwirken/#entwurf", "local draft link"),
        ]
        for path, old, new, message in cases:
            with self.subTest(path=path, change=new):
                pages = entry_pages()
                self.assertIn(old, pages[path])
                pages[path] = pages[path].replace(old, new)
                errors, _ = check(lambda route: EntryPage(pages[route]))
                self.assertTrue(any(message in error for error in errors), errors)
