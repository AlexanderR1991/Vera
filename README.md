# Grundtext des Wirklichen · Foundations of Reality

> **Die Menschheit hat über Jahrtausende versucht, Bücher zu schreiben, die für immer recht haben.**
>
> **Was wäre, wenn wir eines schreiben, das für immer lernen darf?**

*For thousands of years, humanity has tried to write books that would be right forever. What if we wrote one that could keep learning forever?*

**Ein offenes, korrigierbares Erkenntnisprojekt. / An open, revisable project of inquiry.**

[Website & Sprachauswahl](https://alexanderr1991.github.io/grundtext-des-wirklichen/) · [Deutsch](https://alexanderr1991.github.io/grundtext-des-wirklichen/de/) · [English draft](https://alexanderr1991.github.io/grundtext-des-wirklichen/en/)

## Austausch / Discussions

[Im offenen Forum diskutieren / Join our discussions](https://github.com/AlexanderR1991/grundtext-des-wirklichen/discussions) · [Begrüßung als Vorlage / Welcome draft](docs/community/welcome-discussion.md)

**Discussions** ist der Ort für offene Fragen und Gespräche. **Issues** sind für konkrete Aufgaben und überprüfbare Einwände; **Pull Requests** schlagen tatsächliche Änderungen an Text oder Code vor.

## Mitmachen / Contribute

**Du musst nicht programmieren können. / You do not need programming skills.**

- [Eine Frage stellen / Ask a question](https://github.com/AlexanderR1991/grundtext-des-wirklichen/issues/new?template=frage.yml)
- [Idee einreichen / Propose an idea](https://github.com/AlexanderR1991/grundtext-des-wirklichen/issues/new?template=idee.yml)
- [Quelle prüfen / Examine a source](https://github.com/AlexanderR1991/grundtext-des-wirklichen/issues/new?template=quellenpruefung.yml)
- [Übersetzung verbessern / Improve a translation](https://github.com/AlexanderR1991/grundtext-des-wirklichen/issues/new?template=uebersetzung.yml)
- [Kritik an einer These / Challenge a thesis](https://github.com/AlexanderR1991/grundtext-des-wirklichen/issues/new?template=kritik.yml)
- [Bereits offene Themen / Open issues](https://github.com/AlexanderR1991/grundtext-des-wirklichen/issues)

Wenn du die Website oder einen Text direkt verbessern möchtest, erstelle einen **Pull Request**. Wie das ohne Vorkenntnisse geht, steht in [CONTRIBUTING.md](CONTRIBUTING.md). / To edit the website or its texts, open a pull request; see the bilingual [contribution guide](CONTRIBUTING.md).

## Unser Anspruch / Our standard

**Kritik ist willkommen, Zustimmung nicht erforderlich.** Die neun Leitsätze sind vorläufige, hauptsächlich philosophisch-normative Aussagen und keine wissenschaftlich bestätigte Gesamttheorie. Behauptungen über Tatsachen benötigen Quellen; Metaphern dürfen keine empirischen Belege ersetzen.

**Disagreement is welcome; agreement is not required.** The English edition is a *machine-assisted translation draft* awaiting independent review.

## Technische Struktur / Technical structure

Die Website wird mit **Astro** als statische Seiten für **GitHub Pages** gebaut. Acht deutsche Originalseiten und acht englische Übersetzungsentwürfe nutzen dasselbe Layout, Sprachwechsel und Metadaten. Alte HTML-Adressen leiten auf die deutschen Seiten um. Die Original-HTML-Dateien und englischen Wörterbücher sind aktuell die redaktionelle Quelle; Markdown/MDX ist erst später geplant.

**Lokal bauen / Build locally** (Node.js 22+):

```sh
npm install
npm run dev
npm run build
```

GitHub Actions prüft Änderungen in Pull Requests und veröffentlicht nur nach erfolgreicher Übernahme in `main`.

## Editorial und Rechtliches / Editorial and licensing

- [Öffentliche Thesen / Public theses](docs/grundtext.md)
- [Methode / Method](docs/methode.md)
- [Internationalisierung / Internationalization](docs/internationalisierung.md)
- [Beitragsleitfaden / Contribution guide](CONTRIBUTING.md)
- [Diskussionskodex / Code of conduct](CODE_OF_CONDUCT.md)
- [Roadmap](docs/roadmap.md)
- [Lizenzentscheidung / Licensing proposal](docs/license-options.md)

**Eine offene Lizenz ist noch nicht beschlossen.** Öffentlich lesbarer Code und Text sind nicht automatisch unter einer Open-Source- oder Open-Content-Lizenz. Bis zur Klärung bitte keine umfangreichen fremden Texte, geschützten Bilder oder Inhalte ohne gesicherte Nutzungsrechte einreichen. Fragen und Vorschläge sind bereits erwünscht.

**No license has been chosen yet.** Public visibility does not automatically grant open reuse rights. Please discuss substantial text/code contributions and their licensing before expecting a merge. Private manuscripts and personal information must not be published without permission.

*Entstanden auf menschliche Initiative mit KI-Unterstützung; fachliche Prüfung und redaktionelle Entscheidungen bleiben menschliche Aufgaben.*
