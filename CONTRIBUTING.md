# Mitmachen / How to contribute

> **Bitte hilf mir besser zu werden.**
>
> **Please help me get better.**

War eine Antwort unklar, fehlt eine Perspektive oder ist dir etwas auf der Website aufgefallen? Ein Satz reicht für den Anfang. [Rückmeldung geben](https://github.com/AlexanderR1991/Vera/issues/new?template=rueckmeldung.yml).

Was an answer unclear, did it miss a perspective, or did you spot something on the site? One sentence is enough to start. [Give feedback](https://github.com/AlexanderR1991/Vera/issues/new?template=rueckmeldung.yml).

> Eine Behauptung, die Kritik nicht aushält, sollte nicht das Fundament eines offenen Werkes sein.  
> A claim that cannot withstand criticism should not be the foundation of an open work.

Wir möchten Fragen, Einwände, Quellenhinweise und gute Vorschläge sammeln. **Du musst nicht programmieren können.**  
We welcome questions, objections, sources and improvements. **You do not need programming skills.**

**Unser Ziel / Our goal:** Wir möchten gemeinsam eine **Open-Source-KI für Menschen** entwickeln; noch existiert kein eigenständig veröffentlichtes Vera-KI-Modell. / We aim to build **open-source AI with people, for people**; no independently released Vera AI model exists yet. Auch eine einfache Frage oder ein begründeter Widerspruch ist ein Beitrag, nicht nur Code. / Questions and objections count as contributions, not only code. [Ziel (DE)](docs/open-source-ki.md) · [Goal (EN)](docs/en/open-source-ai.md).

## 1. Der einfachste Einstieg / The easiest way

Ohne Konto kannst du eine [Rückmeldung als Textdatei vorbereiten](https://alexanderr1991.github.io/Vera/de/mitwirken/#entwurf). Wenn jemand mit GitHub-Konto sie für dich einreicht, legt vorher gemeinsam den öffentlichen Wortlaut fest.

Without an account, you can [prepare feedback as a text file](https://alexanderr1991.github.io/Vera/en/mitwirken/#entwurf). If someone with a GitHub account submits it for you, agree on the public wording first.

Öffne für einen eigenen öffentlichen Beitrag ein GitHub Issue. Wähle die Vorlage, die zu deinem Anliegen passt:

| Deutsch | English | Einstieg / Entry |
|---|---|---|
| Kunst und Gegenlesarten einbringen | Share art and alternative readings | [Kunst / Art](https://github.com/AlexanderR1991/Vera/issues/new?template=kunst.yml) |
| Einen Härtetest einreichen | Challenge a claim | [Angriffsschwarm / Adversarial challenge](https://github.com/AlexanderR1991/Vera/issues/new?template=angriff.yml) |
| Eine Frage stellen | Ask a question | [Frage / Question](https://github.com/AlexanderR1991/Vera/issues/new?template=frage.yml) |
| Eine Idee vorschlagen | Propose an idea | [Idee / Idea](https://github.com/AlexanderR1991/Vera/issues/new?template=idee.yml) |
| Einen Beleg untersuchen | Examine evidence | [Quellenprüfung / Evidence](https://github.com/AlexanderR1991/Vera/issues/new?template=quellenpruefung.yml) |
| Eine These kritisieren | Challenge a thesis | [Kritik / Critique](https://github.com/AlexanderR1991/Vera/issues/new?template=kritik.yml) |
| Eine Übersetzung prüfen | Review translation | [Übersetzung / Translation](https://github.com/AlexanderR1991/Vera/issues/new?template=uebersetzung.yml) |

Schreibe in **Deutsch oder Englisch**. / Write in **German or English**.

Ein guter Beitrag enthält möglichst:
1. Eine **konkrete Stelle** (Zitat, Kapitel oder URL).
2. Die **Frage oder Behauptung**, die du prüfen möchtest.
3. **Begründungen und Quellen**, falls vorhanden.
4. Einen **Korrekturvorschlag**, wenn du bereits einen hast.

Auch ernst gemeinte Fragen ohne Fachkenntnisse sind willkommen. / Sincere beginner questions are welcome.

## 2. Einen Text selbst ändern / Edit a text directly

Auf GitHub benötigst du ein kostenloses Konto.

1. Öffne die Datei, die du verbessern willst.
2. Klicke auf das Stiftsymbol **Edit this file**. GitHub kann dir dabei eine Kopie (Fork) des Projekts anlegen.
3. Ändere nur die relevante Stelle und beschreibe den Grund.
4. Erstelle einen **Pull Request** auf den Branch `main`.
5. Die Änderung wird öffentlich diskutiert und vor einer Übernahme geprüft.

On GitHub, open the relevant file, click the pencil icon, edit your fork, and open a pull request. Explain *why* the change is better. Do not assume a proposal will automatically be accepted.

**Deutsch und Englisch bearbeiten / Editing both languages**

| Was möchtest du ändern? / What do you want to edit? | Wo findest du es? / Where does it live? |
| --- | --- |
| Startseite / Homepage | [Seitenaufbau / Layout](src/components/MissionHome.astro) · [Texte / Copy](src/lib/mission-copy.json) |
| Werkzeuge im privaten Prüfblatt / Tools in the private worksheet | [Werkzeugkatalog / Tool catalogue](src/lib/inquiry-tools.mjs) · [Felder und Dateiformat / Fields and file format](src/lib/inquiry.mjs) · [Tests](tests/inquiry-tools.test.mjs) |
| Mission und Aussagenregister / Mission and claim register | [Mission](src/components/MissionPage.astro) · [Register](src/components/ClaimRegister.astro) · [Aussagen / Claims](public/knowledge/claims.json) · [Datenvertrag / Data contract](docs/aussagenregister.md) |

Pflege neue Einträge auf Deutsch und Englisch. Bei älteren Unterseiten liegt der deutsche Quelltext in den HTML-Dateien im Stammverzeichnis, die englische Fassung unter [src/i18n/](src/i18n/). Neuere Kapitel findest du unter [src/components/](src/components/).

Write new entries in both languages. For older pages, edit the German HTML files at the repository root and the English text in `src/i18n/`. Newer chapters live in `src/components/`. For complex edits, start with an issue.

**Projektchronik / Project timeline.** Für einen Meilenstein ergänze in `src/lib/observatory-events.json` eine kurze Beschreibung in beiden Sprachen, die Issue- oder PR-Nummer und den belegten UTC-Zeitpunkt der Meldung oder Übernahme. Ordne ihn zeitlich ein. Die Tagesstände entstehen beim Build aus der vollständigen Git-Historie. / To add a milestone, record both descriptions, the issue or PR number and the verified UTC opening or merge time in chronological order. The build derives daily snapshots from a full Git checkout.

**Ein Werkzeug vorschlagen.** Welche Tätigkeit fällt jemandem schwer? Nenne ein Beispiel, das passende Eingabefeld im Prüfblatt und das Feld, in dem jemand mit dem Ergebnis weiterarbeiten kann. Probiere es in einem zweiten Lebensbereich aus. Beschreibe einen Fall, in dem die Frage offenbleiben sollte.

**Suggest a worksheet tool.** What is someone trying to do? Give an example, the worksheet field they can start from and the field where they can use the result. Try it in a second area of life. Describe one case that should stay open.

## META-01 · Bessere Einwände ermöglichen bessere Fassungen

> Wir bauen kein System, das recht behalten soll. Wir bauen ein System, das aus seinen Irrtümern lernen muss.

Dieser [anfechtbare Grundsatz](docs/selbstkorrektur.md) verlangt bei **substanziellen** Änderungsvorschlägen ein kleines Korrekturprotokoll: bisherige Stelle und Version, Aussageart und Geltungsbereich, stärkster bekannter Einwand, Maßstab und Revisionsbedingung, vorgeschlagene Entscheidung (beibehalten, eingrenzen, korrigieren, zurückziehen oder offenlassen), neue Fassung oder offene Frage, Gründe und menschliche Verantwortung. Ein Tippfehler braucht keinen Forschungsbericht. Auch die Leitregel selbst darf kritisiert werden. Die Entscheidung bleibt bis zum Aufbau einer gemeinsamen Governance beim benannten Maintainer.

**English:** The [contestable META-01 correction loop](docs/selbstkorrektur.md) asks substantive PRs to trace the old version, claim kind and scope, strongest fair objection, revision test, proposed outcome and accountable editor. Corrections are not guaranteed by objections, votes or AI agreement. Minor copy edits may use a lighter record.

[Einen Git-Stand lokal auf Wiederherstellbarkeit prüfen](docs/vera-wiederherstellung.md) · [Run a local Git recovery drill](docs/vera-wiederherstellung.md#english)

## 3. So prüfen wir Beiträge / How contributions are evaluated

- **Empirische Aussage / Empirical claim:** Reputable, verifiable sources, relevant caveats, and contrary findings.
- **Philosophische These / Philosophical thesis:** Clear assumptions, strong counterarguments, and transparent scope.
- **Metapher / Metaphor:** Explicitly figurative; not an empirical proof.
- **Praktische Empfehlung / Practical guidance:** Potential benefits, risks, consent, and effects on others.
- **Übersetzung / Translation:** Preserve meaning, nuance, and uncertainty. English remains a translation draft until independently reviewed.

Wir müssen nicht zustimmen. Wir müssen unsere Gründe offenlegen. / Agreement is optional. Reasons must be shared.

## 4. Prüfung und Freigabe / Review and merging

Ein Issue ist eine Einladung zur Untersuchung. Ein Pull Request ist ein Änderungsvorschlag. Nur die Projektverantwortlichen können Änderungen übernehmen. Es gibt derzeit **kein formales wissenschaftliches Peer-Review-Verfahren**.

Issues and PRs are public. Maintainers may request clarification, suggest revisions, or close contributions that do not match the project's scope or conduct rules. We cannot promise a response time.

**Deinen Einwand wiederfinden.** Nach dem Einreichen führt der Link zum Issue zurück zum öffentlichen Verlauf. Stehen zwei Einwände im selben Issue, kann eine Entscheidung beispielsweise „Punkt 1 geändert, Punkt 2 offen“ mit der Begründung und dem Link zur betroffenen Fassung festhalten. Ein neuer Gegenfall kann in diesem Verlauf auf den betroffenen Punkt verweisen.

**Following your objection.** After submission, the issue link takes you back to the public discussion. If one issue raises two objections, a decision can record “point 1 revised, point 2 open” with the reason and a link to the affected revision. Later counterexamples can refer to that specific point in the thread.

## 5. Grenzen und Rechte / Boundaries and rights

- Keine persönlichen Informationen anderer Menschen, keine privaten Chats, keine unveröffentlichten privaten Manuskripte.
- Keine beleidigenden, diskriminierenden oder bedrohenden Beiträge (siehe [Code of Conduct](CODE_OF_CONDUCT.md)).
- Bei Zitaten, Abbildungen und fremden Werken Urheberrechte beachten.
- **Lizenzvereinbarung für Beiträge:** Mit dem Vorschlag eines eigenen Textbeitrags für die Aufnahme in das Projekt bestätigst du, dass du berechtigt bist, den übernommenen Beitrag unter **CC BY-SA 4.0** veröffentlichen zu lassen; für eigenen Programmcode gilt **MIT**. Du behältst deine Urheberschaft. Bei umfangreichen oder unklaren Beiträgen fragen wir vor dem Merge ausdrücklich nach. Siehe [LICENSING.md](LICENSING.md).

Do not submit personal data, confidential communications, or third-party materials without permission. By proposing original text for inclusion, you confirm that you have authority to release the **accepted text under CC BY-SA 4.0**; original software contributions are accepted under **MIT**. You retain authorship. Maintainers may request explicit confirmation before merging. See [LICENSING.md](LICENSING.md).

---

**Die Wirklichkeit steht über diesem Werk. / Reality stands above this work.**

## Fragen verknüpfen, ohne Unterschiede zu verlieren / Link questions without suppressing differences

Schau zuerst in den [Fragenatlas im Forum](https://alexanderr1991.github.io/Vera/de/forum/#fragenatlas). Auch eine ähnlich klingende Frage darf gestellt werden, wenn sie eine andere Voraussetzung, einen neuen Einwand oder eine bislang unbeachtete Perspektive aufzeigt. Ein Vorschlag zur Verbindung nennt beide ursprünglichen Formulierungen, Herkunft, Beziehungstyp, Begründung, Unterschiede und Einwandsmöglichkeiten. Änderungen am [Datenbestand des Fragenatlas](public/knowledge/questions.json) brauchen einen geprüften Pull Request. Autonome KI-Massenkommentare, vorgetäuschte menschliche Identitäten und Scheinmehrheiten sind nicht zulässig. [Fragenatlas-Regeln](docs/fragenatlas.md).

**English:** Start with the [question atlas](https://alexanderr1991.github.io/Vera/en/forum/#fragenatlas) and its [source data](public/knowledge/questions.json). Similar questions may be genuinely different; preserve provenance and dissent. Propose traceable links in a reviewed PR; AI drafts must not auto-post or merge.
