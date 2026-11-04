# Internationalisierung / Internationalization

**Version 0.3 – Deutsch (Original) and English (translation draft).**

## URLs
- Root /: language selection
- /de/: German original and seven subpages
- /en/: English translation draft and seven subpages
- Previous .html URLs: redirect to the corresponding German pages, retaining fragments when JavaScript is available
- Reciprocal hreflang and canonical links on every localized page

## Architecture
Astro generates a static website for GitHub Pages. The original eight root HTML files remain the German text source during this migration. English draft translations are maintained in phrase-level dictionaries under src/i18n/*.en.json. Before building, scripts/build-locales.mjs extracts and localizes the bodies. Temporary files in src/generated/pages are not committed. Markdown/MDX content collections are a future milestone, not yet implemented.

The design, site navigation and interactive controls are shared. No runtime server, cookies, external translation API, or analytics are required.

## Editorial principles
1. German is the original text, not a scientifically validated canon.
2. English is a machine-assisted draft that has not undergone independent bilingual or subject-matter review; each English page says so.
3. Translation must preserve uncertainty and distinguish evidence, hypotheses, metaphors, and normative proposals.
4. Changes to the German source must be accompanied by matching English dictionary entries.
5. Do not publish private manuscripts, correspondence, or third-party details without consent.

## Translation dictionary
- index.html: src/i18n/home.en.json
- atlas.html: src/i18n/atlas.en.json
- bibliothek.html: src/i18n/library.en.json
- lesestueck-wahrheit.html: src/i18n/reading.en.json
- manifest.html: src/i18n/manifest.en.json
- pruefstand.html: src/i18n/proof.en.json
- methode.html: src/i18n/method.en.json
- mitwirken.html: src/i18n/contribute.en.json
- Shared theses and terms: src/i18n/shared.en.json

## Local development
Requires Node.js 22 or newer.

    npm install
    npm run dev
    npm run build

The build checks untranslated strings, generates sixteen localized routes, and validates output metadata. GitHub Actions builds pull requests without publishing and deploys from main after a successful build.

## Adding another language
Register the new locale in Astro configuration, localized pages, UI strings, content generation and checks. Provide complete reviewed translations before exposing a language option.

## Limitations
- Draft English text needs independent proofreading.
- No Markdown/MDX editor yet: the current HTML-and-dictionary transition is intentionally explicit.
- No scientific review certification or peer-review institution is implied.
