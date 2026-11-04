# Grundtext des Wirklichen / Foundations of Reality

> Die Wirklichkeit steht über diesem Werk. / Reality stands above this work.

**Version 0.3: International foundation**

An open, revisable philosophical inquiry with a German original edition and English translation draft.

## Website
- Language selection: https://alexanderr1991.github.io/grundtext-des-wirklichen/
- Deutsch: https://alexanderr1991.github.io/grundtext-des-wirklichen/de/
- English (draft): https://alexanderr1991.github.io/grundtext-des-wirklichen/en/

## Technical structure
Astro generates sixteen localized static pages for GitHub Pages. Both languages share a responsive layout, navigation, interactive reading depth, reciprocal language links, and SEO metadata. Old .html addresses redirect to German equivalents.

The German original is still maintained in the eight root HTML files; English wording lives in src/i18n/*.en.json. A prebuild generator prepares the localized text. This is a transitional architecture, not yet a Markdown/MDX content system.

## Development
Node.js 22+ required.

    npm install
    npm run dev
    npm run build

The build verifies translated routes and metadata. GitHub Actions checks PRs and publishes successful main-branch builds.

## Editorial integrity
German is the original and remains revisable. English is a machine-assisted translation draft, not independently reviewed. The project is not a scientifically certified or peer-reviewed system. No private manuscripts or conversations are published without explicit permission. Authorship, licensing, and moderation decisions remain open.

More information: docs/internationalisierung.md, docs/grundtext.md, CONTRIBUTING.md, docs/roadmap.md.
