# Internationalisierung / Internationalization

**Stand / As of 7 November 2026 · Source language: German (DE) · English: translation drafts.**

The website is structurally bilingual. This **does not** mean that all repository documentation has a complete English edition or that English arguments have been independently reviewed.

## Technical coverage / Technische Abdeckung

- The root URL offers language selection. Public website routes are generated under /de/ and /en/, with reciprocal hreflang and canonical metadata.
- Astro has 28 explicit per-locale page files, including the shared dynamic page route. Seven older HTML-page families are compiled from the German text sources into both languages, yielding **34 localized page families** in the current translation inventory. The game cards use a shared bilingual dynamic route.
- The original eight HTML bodies (home plus seven subpages) are localized with phrase dictionaries in src/i18n/*.en.json by scripts/build-locales.mjs. Astro components use localized strings or paired de/en content.
- Published structured texts in public/knowledge/*.json, the AI framework and selected src/lib/*-copy.json datasets carry both language variants.
- GitHub issue forms are readable in DE and EN but are not a completely localized GitHub interface.
- Most technical and philosophical Markdown files under docs/ have not yet received full English companion documents. An English entry point exists at [docs/en/README.md](en/README.md); the [foundational text](en/grundtext.md) now has a draft English companion.

## Two different quality gates / Zwei verschiedene Prüfungen

**1. Machine coverage / Automatische Parität.** The repository executes scripts/validate-i18n.mjs in npm run build. It checks locale route symmetry, public route inventory, selected bilingual JSON fields, navigation labels, required dictionaries, the shared game route and all top-level docs/ Markdown files against the public review register. Tests cover negative cases (missing/blank translations and false review metadata). Existing scripts/build-locales.mjs additionally catches untranslated phrases in the legacy HTML pages. A passing build means **technical structural consistency only**; it cannot establish accurate philosophical translation or complete language-neutral accessibility.

**2. Human review / Menschliche Freigabe.** A reviewer compares the exact German source revision with its English rendering, tests the philosophical distinctions against the [terminology glossary](i18n-glossary.md), supplies at least one possible misreading or counterexample, and records a traceable decision. Only then may the relevant item in [review-register.v1.json](../public/i18n/review-register.v1.json) change to *reviewed* with the reviewer's name, date, immutable 40-character source commit, and public GitHub review URL. This is an **editorial** record. Do not describe it as *independent* review if the reviewer is the maintainer or a collaborator who helped write the text. External independent review needs explicit evidence, not an inferred label.

Status meanings:
- **draft:** English companion or paired website text exists but no human attestation is recorded.
- **partial:** a source has an English section or excerpt, not a complete reviewed counterpart.
- **shared_bilingual:** a shared bilingual reference exists; this alone is not reviewed.
- **unassessed:** documentation coverage has not been individually determined; not a claim that no English text exists.
- **reviewed:** translation review metadata present and accountable. It is not scientific peer review.

The public inventory tracks **all top-level docs/*.md documents** and **each published localized static page family**. Additional nested resources may still require examination and are not asserted to be complete. New documents and routes require a registry update; otherwise npm run build fails.

## Philosophy-sensitive editorial checks / Philosophisch sensible Begriffe

Reviewers must distinguish: **truth from consensus**, **evidence from formal proof**, **review status from validity**, **value commitments from empirical findings**, **analogies from established connections**, and **agreement from forced conformity**. Preserve qualifiers, uncertain conclusions, references, applicable scope and opposing arguments. Check whether translation introduces stronger claims than the German source. Back-translate contested passages if necessary.

Use [the translation issue template](../.github/ISSUE_TEMPLATE/uebersetzung.yml) for proposals, and document in the PR: DE source link and commit, EN target, changed wording, terminology decision, the strongest competing reading, reviewer and final disposition. Do not set *reviewed* before the decision is recorded.

## Release wording / Freigabeformulierung

**Allowed now:** "Our website is available in German and English; English text is a draft that welcomes corrections. Parts of the documentation remain untranslated."

**Not allowed yet:** "The complete project is fully translated and philosophically verified in both languages."

A future claim of *full bilingual release* requires: all public-facing user journeys tested in both languages; all designated core philosophical documents translated; no unresolved missing pages or bilingual fields; terminology reviewed by qualified humans, with recorded objections and revision decisions; translation links and metadata updated; accessibility tested with real users; and accurate public disclosure of what remains outside scope.

## Local checks / Lokal testen

Requires Node.js 22.12+.

    npm ci
    npm test
    npm run build

The GitHub Pages workflow runs npm run build on pull requests and deploys from main if the workflow succeeds. Publishing without green checks or silently relabelling drafts is against the intended process.
