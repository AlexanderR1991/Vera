# Der Grundfragen-Kreislauf · The universal question loop

**Vera · Forschungs- und Infrastrukturentwurf 0.1 · 7. November 2026.** Der Kreislauf ist **kein vollautomatischer philosophischer Wahrheitsgenerator** und kein semantisch umfassender KI-Audit. Alle anfangs veröffentlichten Grundfragen sind **redaktionell synthetisierte, ungeprüfte Vorschläge**, nicht bewiesene Universalien.

> Aus Fragen entstehen verbindende Fragen. Erst Prüfung, Gegenprüfung und menschliche Verantwortung machen aus einer möglichen Antwort eine vorläufig belastbare Aussage. Der Weg zurück in die Fachbereiche muss sichtbar bleiben.

## 1. Warum eine eigene Grundfragen-Schicht?

Der [Themenbaum](gesamtpruefung-baum.md) zeigt Fachgebiete; der [Erkenntnisnavigator](erkenntnisnavigator.md) schlägt passende Muster vor; der [Fragenatlas](fragenatlas.md) ordnet einzelne Diskussionen; die [Sprachprobe](schnittmengen.md) schützt begründeten Dissens. Diese Schicht fragt auf **einer anderen Abstraktionsebene**:

- Welche Frage stellt sich in **mehreren** Bereichen, ohne in einem Bereich allein gelöst zu werden?
- Welche **gemeinsamen Begriffe** müssen zuerst geklärt werden?
- Warum kann dieselbe Formulierung unterschiedliche *empirische, normative, formale oder interpretative* Teilfragen verdecken?
- Welche Antwort gilt **für welche Kontexte** und muss ausdrücklich *nicht* in die anderen Bereiche übertragen werden?
- Wo liefert ein Widerspruch aus einem anderen Fachgebiet eine sinnvolle neue Gegenprüfung?

**Grundfragen sind kein höherer Wahrheitsrang.** Abstraktere Fragen sind nicht automatisch richtiger; eine Weltanschauung, eine mathematische Definition und ein empirischer Befund bekommen nicht durch denselben Frage-Titel denselben Wahrheitsstatus.

## 2. Die Ausgangssichtung, 7. November 2026

Erste **redaktionelle themenübergreifende Synthese** entlang der bisherigen öffentlichen Projektkapitel: Erkenntnismethode, Grundtext, Bewertungs-/Reifemodell, Liebe und Fürsorge, Ernährung, Politik, Religion, Militär, Kunst, Esoterik, KI, Schnittmengen, Mathematik des Dazwischen. **16 Fragen U-001…U-016** stehen mit ihren mindestens zwei nachvollziehbaren Quelltexten, Gegenfragen, zugeordneten Themen, bestehenden Fragenatlas-Bezügen und Rückwegen in [`public/knowledge/universal-questions.v1.json`](../public/knowledge/universal-questions.v1.json).

Der Ausgangsstand ist auf den **Quellcommit** `8dbeedf4c21a9e51d032fd78431ad35847a14d64` referenziert. Er behauptet **nicht**, dass sämtliche Aussagen und Varianten jeder Repository-Datei semantisch einzeln durch ein Sprachmodell geprüft wurden oder alle möglichen Grundfragen erkannt sind. Die publizierte Auswahl ist redaktionell angreifbar.

## 3. Reproduzierbarer Korpus- und Wortmuster-Scan

`npm run scan:universal` liest die **publizierten, maschinenlesbaren Textquellen**, einschließlich aller aktuellen Markdown-Dateien unmittelbar unter `docs/`, der öffentlichen älteren HTML-Seiten, der in Astro verfassten Komponenten, ausgewählter öffentlicher JSON-Texte und redaktioneller Kopien.

- Quellen werden mit relativen Pfaden, Byteumfang und **SHA-256-Prüfsumme** registriert. Es werden **keine privaten Chats, Dateiuploads oder vertraulichen Daten** importiert.
- `docs/archiv/`, Übersetzungsdoppelungen in `docs/en/`, Quellcode als isolierter philosophischer Beleg und Binärdateien bleiben bei der inhaltlichen Textzählung bewusst außen vor.
- Pro U-Frage sucht die Offline-Regel einige vorab veröffentlichte Wortstämme, meldet Textstellen **nur als mögliche Nachbarschaft** (Datei + passende Wörter) und erzeugt **keine** automatisch geprüfte Bedeutung.
- Überschneidungen zweier Linsen erscheinen in `possible_cross_links` nur als **Review-Warteschlange**; sie eröffnen keine Issues, Threads oder Belegkanten.
- Beim Build entsteht das öffentliche, maschinenlesbare Protokoll `/research/universal-scan.v1.json`; es steht unter dem Status `automatic_lexical_scan_unreviewed`. Ein anderer Korpus erfordert eine neue dokumentierte Sichtung. Das Scannen an sich liefert **keine neuen verlässlichen Antworten**.

**Blindstellen:** Zeichenketten finden keine verlässlich semantischen Synonyme, Negationen, Ironie oder begrifflich äquivalente Probleme. Eine häufige Wortverbindung kann trivial, irreführend oder dogmatisch sein. Es gibt keine garantierte Vollständigkeit.

## 4. Die zwei Register und warum wir sie trennen

### A. Grundfragen (offene Forschungsagenda)

`public/knowledge/universal-questions.v1.json`: unveränderliche Identität **U-###**, DE/EN-Frage, Typ, Quellen, Gegenfrage, Domänen, Rückweg-Routen, Beziehungen und **`review_status: unreviewed`**.

- `source_paths` führen zu konkreten öffentlich zugänglichen, versionierten Projektdateien, **nicht** zu automatisch überprüften Quellenbeweisen.
- Beziehungen dürfen `depends_on`, `subquestion_of`, `related_to`, `alternative_framing` tragen. Die beiden gerichteten Beziehungen bilden keinen Zyklus. Eine Verbindung ist ohne dokumentierte Begründung nicht zulässig.
- Bezüge zum **kleinen Fragenatlas** `Q-001`…`Q-006` werden referenziert, aber die beiden Register werden **nicht** blind zusammengeführt.
- Alle U-Fragen bleiben anfechtbar; die Auswahl einer Frage oder ihre Häufigkeit verleiht keine Erkenntnisreife.

### B. Geprüfte Teilbefunde (derzeit leer)

`public/knowledge/universal-findings.v1.json` enthält bewusst **null** übernommene Antworten. Eine Schlussfolgerung aus einer KI, ein Abstimmungsergebnis oder eine bloße Quellenliste genügt nicht.

Ein künftiger Eintrag braucht **UF-###**, Referenz auf U-###, präzise **begrenzte** DE/EN-Antwort, Aussageart, Geltungsbereich, Quellen/Belege, offene Gegenposition, Revisionsbedingung, echten menschlichen Reviewer, Datum, Quellcommit, nachvollziehbaren GitHub-PR und eine Auswahl der bestehenden Rückweg-Routen. Ein Struktur-Validator kann diese Metadaten prüfen, **aber keine unabhängige Begutachtung oder Wahrheit garantieren.**

Es wird nie aus dem bloßen Vorhandensein einer U-Frage geschlossen, dass schon eine Antwort bereitsteht.

## 5. Vom Gegenbeleg zurück in den Fachbereich (technischer Rückweg)

```text
Öffentliche Texte und Aussagen (versionierte Quellen)
       ↓  Textinventur / mögliche Querverbindungen (kein Wahrheitsurteil)
Ungeprüfte Grundfragen U-### + Gegenfragen + Quellpfade
       ↓  menschliche Diskussion und passende Fachprüfung
Nachvollziehbarer PR für einen begrenzten Befund UF-###
       ↓  Prüfung der Metadaten + inhaltliche menschliche Freigabe
Öffentliches Befundregister
       ↓  wiederverwendbare, rein lesende Einblendung an zugeordneten Routen
Liebe / Medizin / Politik / Esoterik / Mathematik / KI / andere Bereiche
       ↖  Widerspruch, Geltungsgrenze oder neue Frage → erneute Prüfung
```

**Bereits vorbereitet:**

1. **Rückwege:** `return_routes` in jedem U-Eintrag bestimmen, an welchen Seiten eine zulässige Teilantwort sichtbar werden kann. Ein kompakter **Kontextbereich** auf diesen Seiten zeigt schon die passenden offenen Grundfragen.
2. **Ausspielung:** `UniversalQuestionsContext.astro` liest ausschließlich im freigegebenen Befundregister enthaltene Einträge mit `status: reviewed`, deren `question_id` und `return_routes` zulässig sind. **Keine Datenbank, kein Bot, kein KI-Votum**.
3. **Redaktionsplan:** `npm run plan:universal` listet, wo ein bereits geprüfter Befund zu sehen ist und welche Fachtexte zusätzlich **menschlich** bearbeitet werden müssten. Er ändert keine Dateien.
4. **Bestandswahrung:** Ein offener, betroffener und fachlich begründeter Widerspruch darf zu Korrektur, Begrenzung, Rückzug oder ausdrücklich offenem Stand führen. Kein stilles Überschreiben der Fachtexte.

**Wichtig:** Die Einblendung ist eine Lesefunktion, keine Eintragung ins separate R0–R4-Aussagenregister. Ein formaler Befund wird nicht automatisch zu einer Norm, ein normativer Konsens nicht automatisch zu einem empirischen Beweis.

## 6. Reale Einreichung und Moderation

Die [Grundfragen-Seite](https://alexanderr1991.github.io/Vera/de/grundfragen/) bietet Suche, thematische Filter, die 16 Quellenverbindungen sowie das **öffentliche [GitHub-Grundfragen-Formular](https://github.com/AlexanderR1991/Vera/issues/new?template=grundfrage.yml)**. Hier sind **Vorschläge** möglich – neue Frage, Einwand gegen eine Zuordnung, Gegenbeispiel, Teilantwort mit Quellen.

Ein Issue ist weder eine bestätigte Antwort noch ein automatische Auslösung eines Agentenschwarms. Die redaktionelle Prüfung entscheidet, ob eine Änderung als versionierter PR aufgenommen wird. Aktuell existiert **kein** automatischer GitHub-Issues-Import, keine Hintergrund-KI mit freier Schreibbefugnis, keine vertrauliche Eingabe und keine personenbezogene Forschungsdatenbank.

**Datenschutz:** Keine privaten Konfliktverläufe, Nachrichten, medizinischen Details oder identifizierenden Angaben Dritter in öffentlichen Issues; Fragen können abstrakt und anonymisiert formuliert werden. Bei akuter Gefahr, Zwang oder Missbrauch sind Schutz und professionelle zuständige Stellen wichtiger als ein philosophischer Diskurs.

## 7. Qualitätsmaßstäbe und Selbstangriffe

1. **Relevanz statt Volumen:** Warum verbindet die Frage zwei Bereiche tatsächlich? Was wäre ein Gegenbeispiel gegen die behauptete Übertragbarkeit?
2. **Dubletten vermeiden:** Übersetzungsgleichheit und Wortähnlichkeit sind kein semantischer Beweis. Sie dürfen unterschiedliche Fragestellungen nicht löschen.
3. **Rechte und Interessen:** Dritte, Machtunterschiede und betroffene Minderheiten müssen über die Quelle der Frage hinaus sichtbar werden.
4. **Spezifität:** Jede geplante Rückführung nennt Voraussetzungen, Ausnahmen und Kontexte, in denen der Befund **nicht** gilt.
5. **Evaluation:** Vor Skalierung prüfen, ob Menschen mit Grundfragen andere Fachtexte besser finden und angemessene Gegenbelege leichter benennen als mit der vorhandenen Suche. Messung vorab definieren; auch Nullwirkungen dokumentieren.
6. **KI-Kennzeichnung:** Ein späterer automatischer semantischer Vorschlag bleibt `ai_draft` in einer **separaten Warteschlange**, darf nicht als menschlicher Konsens erscheinen und nicht autonom fachliche Ergebnisse veröffentlichen.

**Abbruchgrenzen:** Nicht nachvollziehbare Quelle, unmögliche Übersetzung, falsche Gleichsetzung von Aussagearten, Zwangsanreize oder manipulierte Treffer müssen zu einer sichtbaren Korrektur des Projekts selbst führen.

## 8. Fachliche und sprachliche nächste Schritte

- [x] Offene 16er-Ausgangsagenda, stabile IDs, DE/EN, Quellen und Gegenfragen
- [x] Reproduzierbare Textinventur und begrenzte lexikalische Prüfhinweise beim Website-Build
- [x] Versioniertes leeres Befundregister, Validatoren und Tests
- [x] Thematische öffentliche DE/EN-Katalogseite, bestehender Forum-Beitragsweg und vorbereitete Rückeinblendung
- [ ] Unabhängige redaktionelle Prüfung der 16 Grundfragen und ihrer Beziehungen
- [ ] Menschlich geprüfte Übersetzung und Tests mit Menschen aus unterschiedlichen Perspektiven
- [ ] Ersten realen Teilbefund UF-001 **erst nach** fachlich angemessener Gegenprüfung veröffentlichen
- [ ] Vorteile gegenüber der normalen Suche messen; rechtliche, soziale und organisatorische Auswirkungen untersuchen
- [ ] Erst nach Governance-Entscheidung erwägen: semantischer KI-Vorschlagsgenerator, manuelle Review-Oberfläche, skalierbare Datenbank und stärkerer Rückweg in Fachtexte

---

## English overview (translation draft)

The **Universal Question Loop** introduces a separate cross-disciplinary research layer. Its 16 initial U-### entries are unreviewed editorial synthesis, not universal truths. Each includes a bilingual question, counterquestion, stable identifier, exact public source documents, linked disciplines, and routes where a future reviewed partial finding could reappear.

A **reproducible lexical scan** inventories the project's present published text sources and proposes co-occurrence hints. It is **not an AI semantic run** and cannot establish meaning or proof. Its output is published as `/research/universal-scan.v1.json`. The validated `universal-findings.v1.json` ledger is intentionally empty. Once a bounded finding receives a documented human-reviewed GitHub pull request and required review metadata, its approved answer can be displayed on the linked domain routes. No crowd, AI swarm, lexical match or single majority vote certifies truth. Open disagreement, consent and safety boundaries remain in place.
