# Licenses / Lizenzen

**Effective from this repository revision · 2026-11-05**
**Gültig ab dieser Repository-Revision · 05.11.2026**

The project is **openly licensed with distinct licenses for two different kinds
of material**. This is a division of scope, not an invitation to apply MIT to
a book or CC BY-SA to the JavaScript engine.

## A · Texts and editorial content / Texte

**CC BY-SA 4.0 International**
- [License notice / Lizenzhinweis](LICENSE-CONTENT.md)
- [Official legal code / Rechtstext](https://creativecommons.org/licenses/by-sa/4.0/legalcode)

Includes the original philosophical texts, thesis descriptions, book/essay
chapters, methodological explanations, editorial prose, and their translations,
**only to the extent that project contributors control the relevant rights**.

Examples of covered textual material:
- `docs/grundtext.md`, `docs/methode.md`, and other project-authored editorial
  markdown in `docs/`
- `README.md`, `CONTRIBUTING.md`, and other project-authored explanatory prose
- Human-readable body text in the original root `*.html` pages
- Textual translation values in `src/i18n/*.en.json`
- Human-readable UI strings in `src/lib/ui.mjs` and prose in
  `src/pages/index.astro`
- Equivalent textual content in the generated German and English website

To reuse: attribute the original authors and the project, link the source and
license, state your changes, and follow the ShareAlike requirement for any
published adaptation. **Commercial sharing and adaptations are allowed.**
The project retains editorial control over its official edition but does not
control independent adaptations made under this license.

### Die Richtung · Open book text edition

The explicitly released text-only edition `docs/archiv/die-richtung-2.0-lesefassung.txt` contains an extraction from the author's 196-page book, including chapter prose, descriptions and art credits. The original prose is offered under **CC BY-SA 4.0** to the extent the author/contributors have rights to license it. The separately provided illustrated PDF is **not hosted in this repository**; neither artwork reproductions nor independently protected third-party content are relicensed by this notice. The extraction has not undergone line-by-line proofreading against the designed PDF. The book is a historical/intellectual origin, not a peer-reviewed scientific source.

## B · Software / Quellcode

**MIT License**
- [License file / Lizenzdatei](LICENSE)

Covers original program logic, configuration, build and validation scripts,
template/layout mechanics, structural HTML markup, CSS, JavaScript, and
Astro source code, to the extent contributors hold the necessary rights.

Typical paths:
- `astro.config.mjs`, `package.json`, `scripts/`
- `src/client/`, `src/lib/` program logic, `src/layouts/`,
  `src/components/`, `src/pages/` structural/functional templates
- `src/styles/`, `assets/style.css`, `assets/site.js`
- `.github/workflows/` and other project-authored technical configuration

**Mixed files / Gemischte Dateien:** HTML and Astro files can contain both
functional markup and original editorial text. MIT applies to the
**software/markup**, CC BY-SA applies to the **editorial wording**. The presence
of a file in a software directory does not waive the content license. Likewise,
MIT must not be interpreted to relicense book prose.

## C · Explicit exceptions / Ausnahmen

- `assets/signet.svg` is the project's **identity symbol**, displayed as a
  brand mark. It is **excluded from the project's MIT and CC BY-SA grants**,
  pending a separate rights/branding decision. No assertion of exclusive rights
  is made here beyond whatever rights, if any, are legally held.
- The project name, wordmark, and identity symbols do not receive a trademark
  license through either copyright license. Where no registered trademark
  exists, this statement **does not create a trademark right**.
- Third-party material (e.g. external libraries, quoted text, fonts, images,
  dependencies) remains subject to its own terms; inclusion or reference in
  this repository does not relicense those materials.
- Official license texts (MIT and Creative Commons) remain governed by their
  respective source terms, not by this project's prose license.
- Unpublished private manuscripts (apart from the expressly released open text
  edition of “Die Richtung”), chats, and personal information are not covered
  by this repository license because they are not published here.
- Public-domain portions remain public domain; this license does not create
  new rights in material that lacks copyright protection.

## D · Credits / Namensnennung

Suggested credit for substantial reuse of original text:

> Based on "Grundtext des Wirklichen" (AlexanderR1991 and contributors),
> https://github.com/AlexanderR1991/Wirklich,
> licensed under CC BY-SA 4.0. Changes: [describe].

For software reuse, preserve the MIT copyright and license notice from
`LICENSE`.

Individual contributions retain their own authorship. Relevant authors and
their contribution history are available via Git commits and PR records; see
`AUTHORS.md`. Do not imply project endorsement when reusing content.

## E · Contributing / Mitwirken

A contributor submitting original text intended for inclusion must have the
right to authorize publication under **CC BY-SA 4.0**. A contributor submitting
original software must have the right to authorize its publication under
**MIT**. The contributor keeps authorship; this is not an automatic assignment
of copyright. A maintainer may request explicit clarification before merging
a large or ambiguous contribution. See `CONTRIBUTING.md`.

**Discussion comments and issues** are proposals, not automatically folded
into the book. Licensing of third-party contributions is confirmed before
they are incorporated in the official edition.

## F · Deutsch in Kürze

Die Texte und Übersetzungen stehen, soweit die jeweiligen Urheber dazu
berechtigt sind, unter **CC BY-SA 4.0**: Teilen, Bearbeiten, Übersetzen und auch
kommerzielle Nutzung sind unter Namensnennung und ShareAlike erlaubt.
Unser eigener Website-Code steht unter **MIT**. Texte in HTML- oder
JavaScript-Dateien werden dadurch **nicht** zu MIT-Inhalten. Das Projektsignet
und fremde Werke sind ausdrücklich ausgenommen; deren Rechte bleiben
gesondert zu prüfen.

**Rechtsverbindlich sind die jeweiligen offiziellen Lizenzbedingungen.**
