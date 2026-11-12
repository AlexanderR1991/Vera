# Lerndaten · Version 1

**Stand: 12. November 2026.** Dieser Bereich validiert ausdrücklich bereitgestellte Daten und exportiert geeignete Beispiele als Chat-Nachrichten. Der [echte Korpus](corpus.v1.json) startet leer. Es werden keine Gespräche, Registereinträge oder Forschungsentwürfe automatisch eingesammelt. Der Export trainiert kein Modell.

## Befehle

Im Stammverzeichnis des Repositories, mit Node.js ab 22.12:

```sh
node data/cli.mjs validate
node data/cli.mjs export --out work/learning-export
node training/plan.mjs
```

Der erste Befehl prüft den Standardkorpus. Der zweite erzeugt einen neuen Export mit null Beispielen, solange der Korpus leer ist. Er schreibt `train.jsonl`, `validation.jsonl`, `test.jsonl` und `manifest.json`. Vorhandene Exportdateien werden nicht überschrieben; verwende für jeden Export einen neuen Zielordner. Lokale Ergebnisse gehören in das ignorierte `work/`, insbesondere wenn sie später nicht öffentliche Inhalte enthalten.

Die [synthetischen Entwicklungsbeispiele](dev-fixtures.v1.json) dienen ausschließlich der Softwareprüfung. Ihr Export braucht einen gesonderten Schalter:

```sh
node data/cli.mjs validate --input data/dev-fixtures.v1.json
node data/cli.mjs export --input data/dev-fixtures.v1.json --out work/learning-fixture-export --allow-dev-fixtures
```

Dieser Export bleibt im Manifest als `development_fixture: true` gekennzeichnet und kann keine Trainings- oder Evaluationsreife begründen. Die drei Beispiele sind keine unabhängigen Prüffälle. Eigene Datensätze werden mit `--input datei.json` ausdrücklich ausgewählt. Eine Eingabedatei wird dabei nur gelesen; es gibt keinen Netzabruf.

## Datenvertrag

Die ausführbare Definition liegt in [learning-data.mjs](learning-data.mjs). Der Korpus enthält `schema_version: 1`, `kind: "vera_learning_corpus"`, den Zweck `training` oder `development_fixture` und eine Liste `examples`. Jeder Eintrag hält Folgendes getrennt fest:

| Feld | Inhalt |
| --- | --- |
| `id`, `family_id`, `split` | Stabile Kennung, gemeinsame Fallfamilie und `train`, `validation`, `test` oder `quarantine`. |
| `claim_kind`, `scope` | Aussageart und begrenzter Geltungsbereich. |
| `source` | Quellenkennung, feste Revisionsbezeichnung, HTTPS-Fundstelle, genauer Abschnitt, Quellenausschnitt und dessen SHA-256. Die eingebettete Textkopie macht den verwendeten Ausschnitt nachvollziehbar. |
| `provenance` | Menschliche Kuratierung, KI-Entwurf oder synthetische Herkunft; Entstehungsbeschreibung und bei generiertem Material die Generatorangabe. |
| `usage` | Lizenz, deren Fundstelle, gesonderte Trainingsfreigabe mit Beleg und Datenschutzkategorie. |
| `review` | Prüfstatus, verantwortliche menschliche Prüfer und Beleg zur Prüfung. |
| `task`, `target` | Aufgabe mit Kontext sowie die geprüfte Zielantwort. |
| `counterexamples`, `limitations` | Gegenbeispiele und ausdrücklich verbleibende Grenzen. |
| `correction` | Kennungen ersetzter Beispiele und Begründung der Korrektur. |

Für einen echten Export muss das Beispiel einem der drei Datensplits zugeordnet sein, `review.status: "accepted"` und `usage.training_permission: "granted"` haben und darf nicht `restricted` sein. Eine ungeprüfte KI-Antwort wird in `quarantine` aufbewahrt und nicht exportiert. Das gilt auch für abgelehnte, nicht freigegebene oder beschränkte Einträge. Synthetische Herkunft allein ist weder eine menschliche Prüfung noch eine Trainingsfreigabe.

Ein exportfähiger Korrektureintrag ersetzt die ausdrücklich genannten Ziele im Export; ihre Quelleneinträge bleiben im Korpus erhalten. Die Verfolgung älterer Vorgänger läuft nur durch ebenfalls exportfähige Zwischenfassungen. Ersetzt C allein einen ungeprüften oder nicht freigegebenen Quarantäneeintrag B, werden dessen eigene Verweise auf A nicht übernommen. C muss A ausdrücklich unter `supersedes` nennen, wenn auch A ersetzt werden soll. Ein unzulässiger oder quarantänisierter Ersatz entfernt kein bisher exportfähiges Ziel. Verweise auf fehlende Einträge, Selbstverweise, Zyklen und Korrekturen über verschiedene Fallfamilien werden abgelehnt.

## Datenaufteilung und Nachvollziehbarkeit

Quellenkennung, Quellen-URL, exakt gleicher Quellenausschnitt anhand seiner SHA-256 und Fallfamilie müssen jeweils in einer Datenaufteilung bleiben. Zusätzlich dürfen gleiche normalisierte Aufgaben mit Kontext keine Aufteilungen überschreiten. So wird beispielsweise ein identischer Quellenausschnitt unter einer neuen Kennung und URL nicht zum unabhängigen Test. Das Verfahren erkennt keine beliebigen Paraphrasen oder unbekannten Quellenabhängigkeiten; dafür ist eine inhaltliche Prüfung nötig. Die Revision einer Quelle ändert nicht ihre Quellenfamilie.

Der Export sortiert Beispiele nach Kennung, schreibt kanonisches JSON und hält Prüfsummen, Datensplits, Herkunft, Nutzungsangaben und Korrekturbezüge im Manifest fest. Prüfdaten werden getrennt ausgegeben. Sie dürfen später weder für das Training noch für die Auswahl einer Modellfassung verwendet werden. Der Trainingsplan verlangt die Prüfsumme der vollständigen Manifestdatei.

Die Prüfung kontrolliert deklarierte Angaben und interne Konsistenz. Sie authentifiziert keine Personen, bestätigt keine tatsächlichen Rechte und verifiziert keine Quellenwahrheit. Auch eine feste Revisionsbezeichnung und passende Prüfsumme können zu einem falsch beschriebenen Inhalt gehören. Rechte, Inhalt und Nutzungszweck brauchen weiterhin verantwortliche menschliche Prüfung.

[Trainingsplanung](../training/README.md) · [Vergleichsinfrastruktur](../evals/README.md) · [Technischer Aufbauweg](../docs/modellentwicklung.md)

## English

This directory validates explicitly supplied learning records and exports eligible examples as supervised chat messages. The real corpus starts empty. No conversation, claim register or AI draft is collected automatically. These commands do not train a model or fetch sources.

Run `node data/cli.mjs validate` from the repository root. Export the empty real corpus with `node data/cli.mjs export --out work/learning-export`, or select a file using `--input`. A new export contains `train.jsonl`, `validation.jsonl`, `test.jsonl` and `manifest.json`; existing files are never overwritten. Keep local and private artifacts in ignored `work/`.

The public synthetic examples can only be exported with `node data/cli.mjs export --input data/dev-fixtures.v1.json --out work/learning-fixture-export --allow-dev-fixtures`. They retain `development_fixture: true`, have no actual human approval or training permission, and cannot establish training or evaluation readiness.

Each record preserves stable IDs, case family, split, claim kind, scope, versioned source excerpt and checksum, provenance, usage and privacy declarations, human review, task, target, counterexamples, limits and correction lineage. A real exported record requires accepted human review, declared training permission and nonrestricted data. Other records remain in quarantine. Only an exportable correction retires its named targets, and transitive retirement follows exportable intermediates only. If C replaces quarantined B, B's own links to older A are not adopted; C must explicitly name A under `supersedes` to retire it too. Invalid or cyclic lineage fails.

Source IDs, source URLs, identical excerpt hashes, case families and identical normalized inputs cannot cross train/validation/test. This catches known overlap, not arbitrary paraphrases or unknown dependencies. Canonical exports and a provenance manifest make repeated exports comparable. Test data must remain separate from training and model selection. Declarations and checksums do not authenticate reviewers, prove lawful permission or establish source truth; accountable content and rights review remains necessary.
