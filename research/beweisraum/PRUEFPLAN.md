# Von einer Frage zum nächsten überprüfbaren Schritt

**Pilotplan, keine gestartete Dauerautomation.** Alle Ergebnisse sind KI-Entwürfe R0. Ein Durchgang beginnt mit einem exakten Wortlaut und endet nach höchstens acht Einzelaufträgen und einer Synthese. Weitere Arbeit wird durch eine konkrete nächste Frage bestimmt.

## Erster Durchgang: C-006

**Prüffrage:** Welche methodische Beziehung zwischen Philosophie und Mathematik trägt die vorherige Erklärung tatsächlich?

1. `node research/beweisraum/room.mjs check` prüft den Bestand.
2. `node research/beweisraum/room.mjs brief C-006 de` gibt Wortlaut, Kontext, Raum-Fingerabdruck, Rollen und Rückgabeformat aus.
3. Je eine getrennte Erstbeurteilung rekonstruiert die tragfähigste Lesart (`constructor`), sucht den stärksten Einwand (`adversary`), liest Quellen (`source_checker`) und prüft Aussageart sowie Reichweite (`scope_checker`). Getrennte Kontexte erhöhen die Chance auf unterschiedliche Einwände; sie machen Modelle nicht zu unabhängiger Evidenz.
4. Der Koordinator bewahrt die kurzen Entwürfe in `drafts/`. Ein gültiger Datensatz ist lediglich formal lesbar und aktuell zur Raumdatei, nicht fachlich bestätigt.
5. Die Synthese benennt den stärksten verbleibenden Einwand, eine engere Formulierung und genau den nächsten Test. Sie zählt keine Siege oder Stimmen. Ein Mensch prüft über eine mögliche Aufnahme nach den vorhandenen Projektregeln; der Pilot verändert kein öffentliches Register automatisch.

Ein Agent erhält keine laufende Schleife und keine Veröffentlichungsvollmacht. `brief` startet nichts. Weder bezahlte Modellaufrufe noch externe Kommentare oder zusätzliche Workflows werden eingerichtet.

## Das Rückgabeformat

Die aktuelle Vorlage steht immer in `draft_shape` der Brief-Ausgabe. Beispiele stehen in [drafts](drafts). Jeder Entwurf braucht Zielkennung, exakten `room_sha256`, Rolle, tatsächliche Herkunftsabhängigkeiten, Befund, stärksten Einwand, nächsten Test, Revisionsbedingung und einzeln markierte Quellenlektüre. Vorschläge sind `retain`, `narrow`, `revise`, `withdraw` oder `open`; sie sind keine redaktionelle Entscheidung.

`room_sha256` bindet **nur die exakten Bytes von room.json**, nicht die gesamte Repository-Fassung oder den Wahrheitsgehalt ihrer Quellen. Git versioniert die übrigen Dateien. Bei einer Änderung der Raumdatei müssen bisherige Entwürfe in einen gesonderten Archivordner außerhalb `drafts/` wandern oder inhaltlich neu geprüft werden. Bloß den alten Hash zu ersetzen wäre eine falsche Prüfbehauptung. Alte Fassungen bleiben in Git erhalten; Quellenänderungen brauchen auch dann eine neue Prüfung, wenn der Raum-Hash unverändert ist.

## Danach: drei kleine Forschungsaufträge

| Auftrag | Ziel | Woran er scheitern kann |
| --- | --- | --- |
| C-002: normative Brücke | Beide Wahrheitsbelegungen bei festem p zeigen; erst danach p → n hinzufügen | Normative Bedeutung wird schon in die Tatsachenprämisse geschmuggelt; das Modell wird unbemerkt verändert |
| C-005: Miete und Bedürfnisse | Einen übersehenen Bedarf und eine Alternative zu beiden Regeln finden | Eine korrekte Rechnung wird als Beweis von Gerechtigkeit oder tatsächlicher Zustimmung ausgegeben |
| Q-001: Erfahrungsverlust | Zwei Darstellungen desselben fiktiven Erfahrungsberichts vergleichen | Die Darstellung kann einen begründeten Einwand aus der beschriebenen Perspektive nicht aufnehmen |

Die Auswahl ist ein Arbeitsvorschlag, kein automatischer Forschungsplan. Ein konkreter Gegenbeweis hat Vorrang vor einer größeren Menge gleichlautender Entwürfe.

<a id="erste-gegenpruefung"></a>

## Erste Gegenprüfung

Die erste skeptische Agentenprüfung an den vorhandenen M-03-Quellen kam zu zwei Einwänden, die in die Pilotfassung aufgenommen wurden:

- Eine Formalisierung kann den strittigen Inhalt in ihre Definitionen und Voraussetzungen verlagern. Deshalb fragt C-006 ausdrücklich nach Bedeutungsverlusten und Q-001 nach ausgelassenem Erleben.
- Einzelne Kanten zeigen noch nicht, welche Prämissen **gemeinsam** gebraucht werden. Deshalb hat jede formale Zielaussage einen vollständigen `premises`-Satz sowie `argument.system` und `argument.steps`. Analogie und Kontext stehen in einem eigenen Beziehungstyp.

Das ist eine dokumentierte KI-Anregung zur Gestaltung, kein unabhängiges Review und kein Wirksamkeitsnachweis. Die nachfolgende konkrete Rollenprüfung von C-006 wird in `drafts/` festgehalten. Ihr engster brauchbarer Arbeitsbefund lautet: Die Erklärung trägt als Hinweis auf gemeinsame Werkzeuge; ob ein mathematisches Modell eine bestimmte philosophische Frage angemessen erhält, muss fallweise gezeigt werden. Die wörtliche Identität folgt daraus nicht.

Vier aktuelle Entwürfe liegen vor. Drei getrennt bearbeitete Rollenbeurteilungen wurden vom Koordinator gekürzt; `coordinator_summary: true` kennzeichnet dies. Der Koordinator hat die konstruktive Rolle selbst bearbeitet. Alle gehören derselben KI-Sitzung an und zählen nicht als vier unabhängige Bestätigungen.

| Rolle | Sichtbarer Beitrag | Vorschlag, keine Entscheidung |
| --- | --- | --- |
| [Konstruktion](drafts/C-006.constructor.json) | Geteilte Werkzeuge als Ausgangspunkt für begrenzte Teilfragen | Beibehalten |
| [Gegenprüfung](drafts/C-006.adversary.json) | Gleiche Werkzeugnamen können verschiedene Prüfmaßstäbe verdecken | Enge Lesart beibehalten; Anwendung genauer prüfen |
| [Quellenprüfung](drafts/C-006.source_checker.json) | Originalbeispiele bei Platon und Euklid; interne Quellen sind keine unabhängige Bestätigung | Beibehalten, Beleggrenzen sichtbar lassen |
| [Reichweitenprüfung](drafts/C-006.scope_checker.json) | Eine korrekte Formel kann die eigentliche philosophische Frage verfehlen | Weiter eingrenzen |

Die Quellenrolle hat [Platons *Menon* in Übersetzung](https://classics.mit.edu/Plato/meno.html) und [Euklid I.1](https://www.claymath.org/euclid_index/triangles-parallels-and-area/?chapter=3) tatsächlich gelesen. Sie fand Beispiele für Begriffsprüfung und ausdrücklich verwendete Voraussetzungen. Das ist keine systematische Untersuchung beider Fächer. Die Peano-Chronologie war nur als Suchindexauszug erreichbar; diese Lücke bleibt im Quellenentwurf markiert. Der Vorschlag der Reichweitenrolle wird trotz der anderen Vorschläge ausdrücklich erhalten.

**Verbleibender Einwand:** Auch die engere Ähnlichkeit ist allgemein und wird von anderen Disziplinen geteilt. Sie begründet keinen besonderen Vorrang der Mathematik. Ein nächster Test sollte deshalb an einem Fall vergleichen: freies Argument, schlichtes Prüfblatt und explizite Formalisierung. Welche fehlende Voraussetzung wird jeweils sichtbar, welcher Sinn geht verloren und welcher zusätzliche Aufwand entsteht?

## Prüfen, ob der Raum überhaupt hilft

Q-002 bleibt offen. Als einfacheren Vergleich verwenden wir ein kurzes Prüfblatt mit gleichem Wortlaut, denselben Quellen und demselben Zeit- beziehungsweise Modellbudget. Bevor ein bestätigender Versuch beginnt, brauchen wir vorab festgelegte Fälle und getrennte Referenzantworten: gültige Ableitungen, verdeckte normative Brücken, scheinbare Gegenbeispiele mit veränderten Prämissen und ehrlich offene Fragen. Unabhängige Menschen müssten die Referenzantworten und die spätere Bewertung prüfen.

Erfassen wollen wir richtig erkannte Fehler, Fehlalarme, übersehene Fehler, erhaltenen Dissens und Aufwand. Eine größere Zahl erzeugter Texte ist kein Erfolgskriterium. Wenn das einfache Blatt genauso gut hilft oder der Graph mehr Fehler und Aufwand verursacht, wird der Aufbau vereinfacht oder verworfen. Es wurde bisher kein solcher Versuch durchgeführt.

## English

This is a bounded pilot, not a background swarm. Start with C-006, run `check`, then `brief C-006 en`. Four separate initial roles reconstruct, challenge, inspect sources and check scope. They return one R0 draft each; common model and source origins remain declared. The coordinator stores drafts and preserves objections. No voting, automatic truth assessment, public register changes or model/API calls occur.

The exact `room.json` bytes determine the SHA-256 hash. This does not bind all repository files or verify sources. Changed room bytes make old drafts stale; inspect them again or archive them outside `drafts/`. Merely replacing a hash is not a review. Changed source material also requires rechecking even if the room hash stays the same.

The initial skeptical design review identified hidden translation assumptions and the need to represent joint premise sets. Formal claim nodes now include `premises`, `argument.system` and `argument.steps`; non-proof links remain separate. This is AI design feedback, not independent validation. C-006's strongest remaining objection is that general reasoning tools are shared widely and do not privilege mathematics. The next check should compare free argument, a simple worksheet and formalisation on a concrete question.

Further proposed tasks test the normative bridge in C-002, omitted needs in C-005 and loss of experience in Q-001. Q-002 asks whether the room improves real error detection against an information- and budget-matched simple worksheet. Predefined held-out cases, independently examined reference answers, false alarms, missed errors, preserved dissent and effort are needed. No effectiveness evaluation has been conducted.
