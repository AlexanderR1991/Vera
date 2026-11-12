# Vom Erkenntniswerkzeug zum trainierbaren Vera-Modell

**Technische Grundlage · 12. November 2026.** Die Laufzeit, der Vergleichsrunner und die Datenprüfung sind Softwarebausteine. Ein eigenes trainiertes Vera-Modell und ein unabhängiger Wirksamkeitsnachweis stehen weiter aus.

## Was jetzt zusammengehört

Vera verbindet ein austauschbares Sprachmodell mit versioniertem Projektwissen und nachvollziehbaren Prüfverfahren. Die sechs Atlasfelder ordnen Themen. Die Gehirnidee wird hier über prüfbare Funktionen verfolgt: Kontext halten, Wissen abrufen, Fehler dokumentieren, Korrekturen für einen späteren Lernlauf aufbereiten und den Transfer auf neue Fälle prüfen. Anatomische Namen begründen keine Modellfähigkeit.

```text
Eingabe + zulässiger Sitzungskontext
                  ↓
       runtime/ → Modelladapter → Antwortentwurf + Laufprotokoll
           ↕
 versionierte Quellen / begrenzter Abruf
                  ↓
      Einwand und geprüfte Korrektur
                  ↓
 data/ → zulässige Lernbeispiele → training/ → neuer Modellstand
                  ↑                              ↓
                  └──── unabhängige evals/ ──────┘
```

Die untere Schleife ist vorbereitet, aber noch kein durchgeführter Lernprozess. Es gibt keine automatische Übernahme von Gesprächen, Forschungsentwürfen oder Registereinträgen in Trainingsdaten. Modellantworten erteilen keine Rechte und verändern keine öffentlichen Prüfgrade. Eine [optionale Verbindung](../runtime/recorded-inquiry.mjs) übernimmt Antwort und tatsächlich abgerufene Quellen als ungeprüfte KI-Entwürfe in den bestehenden [Einwandskern](../src/lib/entity-core.mjs). Originalentwurf und Herkunft bleiben erhalten. Das geschieht im Arbeitsspeicher; Speicherung und menschliche Entscheidung benötigen einen eigenen verantworteten Schritt. Überlange Texte werden ausdrücklich abgelehnt. Eine Modellantwort ist kein menschlicher Review.

## Bausteine und Grenzen

| Bereich | Ausführbar | Noch erforderlich |
| --- | --- | --- |
| [Laufzeit](../runtime/README.md) | Gemeinsame Modell- und Werkzeuggrenze, lokaler Ollama-Adapter, Quellenabruf und Antwortprotokoll; die bisherige Ask-CLI nutzt diese Grundlage. | Installiertes Modell, dokumentierter Modellstand und Messung realer Aufgabenleistung. Weitere Backends können denselben Vertrag implementieren. |
| [Vergleich](../evals/README.md) | Planung, vier öffentliche synthetische Entwicklungsfälle, T0/T1/T2-Entwicklungsläufe, Rohprotokolle und getrennte Bewertung. | Extern erstellte 16 Prüffälle, unabhängig geprüfte Bezugslösungen, menschliche Bewertungen und ein Modelladapter mit nachgewiesener Zählung des vollständigen Inputs. |
| [Lerndaten](../data/README.md) | Validierung, Ausschluss ungeprüfter Entwürfe, Prüfung auf Überschneidungen zwischen Quellen/Fallfamilien und Export geeigneter Beispiele. | Ein realer, inhaltlich geprüfter und für Training freigegebener Bestand. Der Standardkorpus ist leer. |
| [Training](../training/README.md) | Konfiguration und Planungsprüfung mit sichtbaren fehlenden Voraussetzungen. | Auswahl und Lizenzprüfung von Basismodell und Tokenizer, Trainingsbackend, Rechenleistung, geeignete Daten und unabhängige Evaluation. Der Plan trainiert kein Modell. |

Alle Befunde bleiben auf die tatsächlich geprüfte Version und Aufgabe begrenzt. Strukturtests können weder Quellenwahrheit noch wirksame Einwilligung oder die Qualität einer menschlichen Bewertung bestätigen.

## Zuerst den Zusatznutzen prüfen

Der ausführbare Vergleich setzt die [P-02-Transferprobe](evaluation-v1.md#transferprobe-von-zugangshinweisen-zu-zeichnungsständen) technisch um. T0 erhält einen neutralen Prüfauftrag, T1 zusätzlich eine kurze Prüfliste und T2 den am Git-Stand fixierten Vera-Kontext. Modell, Quellen, Aufgaben und Budgets bleiben gleich; jede Bedingung beginnt eine eigene Sitzung. Die zweite Nachricht folgt erst nach der ersten Antwort. Bezugslösungen gehören nicht in Modellanfragen.

Die öffentlichen Entwicklungsfälle prüfen den Ablauf. Ein erfolgreicher Softwaretest mit simuliertem Modell ist kein Modellvergleich. Auch Ergebnisse auf den Entwicklungsfällen sind keine unabhängige Transferprüfung. Für die externe Probe werden Fallpaket, Prüfsummen, Anweisungen, Modellstand, Laufreihenfolge und Bewertungsregeln vor dem Lauf fixiert. Ergebnisse, Fehlversuche und offene Bewertungen bleiben unterscheidbar. Die in P-02 beschriebene Schwelle begründet höchstens eine größere Untersuchung.

Eine nachträglich gemeldete Tokenzahl beweist nicht, dass der Server zuvor keinen Kontext abgeschnitten hat. Der Ollama-Adapter liefert derzeit keinen verifizierten Zähler für den vollständigen modellabhängigen Input einschließlich Chat-Template. Entwicklungsversuche kennzeichnen diese Grenze; externe Holdout-Läufe bleiben bis zu einer geprüften Zähl- oder gleichwertigen Integritätsprüfung gesperrt. Ein größer eingestelltes Kontextfenster allein hebt die Sperre nicht auf.

Die Bewertungen bleiben auf die jeweilige Aufgabe beschränkt: richtiger Quellenstatus, entscheidende Fundstelle oder fehlender Beleg sowie der Umgang mit Korrektur, unbelegtem Einwand, Nein oder fortgesetzter Hilfe. Einigung und positive Selbstauskunft sind keine Ersatzmaße.

## Von einer Korrektur zum Lernbeispiel

Ein geeignetes Beispiel hält Aufgabe und Quellen, die geprüfte Zielantwort, Aussageart, Geltungsbereich, Gegenbelege und Grenzen fest. Herkunft, Quellenrevision, erlaubte Nutzung, Datenschutz und menschliche Prüfung werden mitgeführt. Eine öffentliche Datei ist dadurch noch nicht für jeden Trainingszweck geeignet. Eine Behauptung im Manifest ersetzt keine tatsächliche Rechte- oder Inhaltsprüfung.

Fälle derselben Familie und Fälle mit gemeinsamen Quellen gehören in dieselbe Datenaufteilung. So soll eine nur umformulierte Trainingsaufgabe nicht versehentlich als unabhängiger Test gelten. Das Verfahren prüft bekannte Kennungen und Inhalte; unbekannte Abhängigkeiten brauchen weiter eine inhaltliche Gegenprüfung. Für echte Evaluation zurückgehaltene Aufgaben dürfen nicht zum Trainieren oder zur Auswahl der besten Modellfassung verwendet werden.

Korrigierbares Wissen bleibt zunächst im externen Register. Erst ein gesondert bewerteter Lernlauf darf es in Modellparameter überführen. Ein eigener Adapter oder ein angepasstes Basismodell wäre ein erstes begrenztes Modellartefakt. Das vollständige Vortraining eines allgemeinen Grundmodells ist ein anderer, erheblich größerer Forschungspfad.

## Entwicklungsschritte mit überprüfbarem Ende

1. **Laufzeit und Infrastruktur prüfen.** Der bestehende CLI-Aufruf bleibt benutzbar; simulierte Modellfehler, Werkzeuggrenzen und getrennte Sitzungen werden geprüft.
2. **Den Vergleich betreiben.** Ein lokal verfügbares Modell mit festgehaltenem Stand auf Entwicklungsfällen ausführen. Danach einen extern vorbereiteten und unabhängig bewerteten Transferlauf durchführen. Ein gleich guter einfacher Vergleich ist ein Grund, Vera zu vereinfachen.
3. **Geprüfte Korrekturen kuratieren.** Einen ersten zulässigen Datenbestand mit dokumentierter Herkunft und getrennten Datenaufteilungen exportieren. Ungeprüfte KI-Entwürfe bleiben ausgeschlossen.
4. **Einen begrenzten Lernlauf implementieren.** Basismodell und Tokenizer fixieren, Backend und Rechenbudget auswählen, Laufkonfiguration und Modellartefakte speichern. Der gegenwärtige Trainingsplan benennt diese fehlenden Voraussetzungen.
5. **Verbesserung auf neuen Fällen zeigen.** Ausgangsmodell und angepasste Fassung bei gleichen Bedingungen prüfen; Rückschritte, Aufwand und Fehler getrennt berichten. Erst danach über eine Veröffentlichung mit Modellkarte, Lizenzumfang, Datenbeschreibung und Wiederholungsanleitung entscheiden.

Die vorhandenen [Governance-Regeln](community-governance.md), [META-01](selbstkorrektur.md) und der [AGI-Horizont](agi-horizont.md) gelten weiter. Fähigkeiten, Nutzen für Menschen und Befugnisse brauchen jeweils eigene Nachweise. Keine Stufe beweist Bewusstsein oder allgemeine Intelligenz.

## English

Vera now has a shared local inference boundary, executable comparison infrastructure, a validated learning-data export and a training-readiness plan. These components do not constitute a trained Vera model. The training corpus starts empty. No conversation, public register or AI draft is automatically collected for training.

The six atlas fields remain topic domains. Brain-inspired development is expressed as testable functions: context, retrieval, documented errors, curated corrections and transfer to unseen tasks. The existing deterministic inquiry ledger remains separate from model output and human authorization.

Use the component guides for commands: [runtime](../runtime/README.md), [evaluation](../evals/README.md), [data](../data/README.md) and [training](../training/README.md). Public development fixtures and simulated-model tests validate infrastructure only. The independent 16-case transfer study requires external cases, committed hashes, reference solutions and human reviewers. It also requires an adapter that verifies the complete model/template-specific input token count; the current Ollama adapter does not provide this capability, so holdout execution remains blocked. No efficacy result is claimed.

The next milestones are an actual fixed-model comparison, a reviewed and permitted dataset, a bounded training backend and independent comparison of the resulting model against its unchanged baseline. Base model, tokenizer, licenses, compute, reproducibility and release documentation remain explicit requirements. Model performance, benefit to people and authority to act remain separate questions.
