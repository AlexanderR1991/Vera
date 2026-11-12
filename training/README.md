# Trainingsplanung · Version 1

**Stand: 12. November 2026.** Dieser Bereich enthält eine ausführbare Planungsprüfung für einen späteren begrenzten LoRA-Lernlauf. Er enthält derzeit **kein Trainingsbackend, keine Modellgewichte und keinen Tokenizer**. Der Befehl lädt nichts herunter und führt kein Training aus.

## Plan ausführen

Mit Node.js ab 22.12 im Stammverzeichnis:

```sh
node training/plan.mjs
node training/plan.mjs --require-ready
```

Der erste Aufruf erzeugt JSON mit `status: "blocked"`, `training_performed: false`, Prüfsummen und einer Liste `missing` mit den offenen Voraussetzungen. Exitcode 0 bedeutet, dass ein gültiger Plan berechnet wurde. Der zweite Aufruf liefert Exitcode 1, solange mindestens eine Voraussetzung fehlt. Ungültige Eingaben oder Konfigurationen liefern Exitcode 2. Eigene Dateien können mit `--config datei.json --data korpus.json` ausgewählt werden.

Die [Standardkonfiguration](config.v1.json) wählt bewusst kein Basismodell, keinen Tokenizer und keine Hardware aus. Hyperparameter wie Lernrate, LoRA-Rang und maximale Sequenzlänge sind ein Ausgangsentwurf für die spätere Implementierung, keine erprobten Empfehlungen für ein ausgewähltes Modell. Ziel ist überwachte Next-Token-Kreuzentropie nur auf den Assistant-Tokens. Eine tatsächliche Tokenisierung und korrekte Verlustmaske müssen im künftigen Backend geprüft werden.

## Offene Voraussetzungen

| Voraussetzung | Was festgehalten werden muss |
| --- | --- |
| Daten | Geeignete Beispiele in allen drei Datenaufteilungen, menschliche Prüfung, Nutzungsfreigabe und SHA-256 der exportierten Manifestdatei. Der reale Korpus startet leer. |
| Basismodell | Modellkennung, feste 40/64-stellige Hexrevision oder `sha256:`-Digest und dokumentierte Lizenzprüfung. Ein Tag wie `main` oder `release-v1` reicht nicht. |
| Tokenizer | Kompatible Kennung mit ebenfalls fester Hexrevision oder Digest. Kompatibilität wird durch diese Zeichenprüfung noch nicht bewiesen. |
| Rechenbudget | Gerät, Präzision, Speicherbudget und verantwortete Budgetgrundlage; ein späterer Hardwareversuch muss die Durchführbarkeit zeigen. |
| Evaluation | Bericht zum unveränderten Basismodell sowie unabhängig geprüfte Bezugslösungen und Bewertungen. Die Daten dürfen nicht mit Training oder Modellauswahl vermischt werden. |
| Backend | Optimierungscode, festgelegte Abhängigkeiten, Tokenisierung und Verlustmaske, passende LoRA-Zielmodule, Hardwareprüfung und reproduzierbare Ausführung. |

`minimum_examples_per_split: 1` prüft nur, ob die geplante Struktur vollständig befüllt ist. Es behauptet nicht, dass drei Beispiele für ein nützliches Modell ausreichen. Synthetische Entwicklungsbeispiele bleiben ein eigener Zweck und begründen keine Trainings- oder unabhängige Evaluationsreife. Es werden keine Daten stillschweigend aus dem Repository übernommen.

Der aktuelle Plan bleibt selbst bei vollständig ausgefüllten Betreiberangaben durch `trainer_not_implemented` blockiert. Eine Konfigurationsänderung kann keinen durchgeführten Lauf vortäuschen. Die angegebenen Revisionen und Prüfbelege sind Deklarationen; die Planung verifiziert weder tatsächlich vorhandene Modellartefakte noch menschliche Zuständigkeit oder Lizenzrechte.

## Erwartete Artefakte eines späteren Laufs

Die Konfiguration benennt Adaptergewichte und Adapterkonfiguration, Tokenizerreferenz, Trainingskonfiguration, Datenmanifest, Rohprotokoll, Evaluationsbericht und Modellkarte. Der Plan erzeugt diese Artefakte noch nicht. Ein späteres Backend muss Ausgangsmodell, Tokenizer, Daten, Codeversion und Ausführungsumgebung fixieren sowie Fehler und Ressourcenverbrauch protokollieren. Die angepasste Fassung wird gegen das unveränderte Basismodell auf neuen Fällen geprüft, bevor eine gesonderte Entscheidung über Veröffentlichung oder Einsatz getroffen wird.

[Lerndaten und Export](../data/README.md) · [Vergleichsinfrastruktur](../evals/README.md) · [Technischer Aufbauweg](../docs/modellentwicklung.md)

## English

This is an executable readiness plan for a future bounded LoRA supervised-finetuning backend. No trainer, model weights or tokenizer are included. Nothing is downloaded or trained.

Run `node training/plan.mjs` from the repository root. Exit 0 means a valid plan was computed, not that training is ready. The report remains `status: "blocked"` and `training_performed: false`. `node training/plan.mjs --require-ready` returns exit 1 for missing prerequisites; invalid inputs return exit 2. Use `--config file.json --data corpus.json` for explicit alternatives.

The default config leaves model, tokenizer and compute unselected. Hyperparameters are an untested starting design. The proposed objective is assistant-token-only next-token cross-entropy; a future backend must test tokenization and masking. Models and tokenizers require full 40/64-character hexadecimal revisions or `sha256:` digests. This syntax check cannot prove artifact identity or compatibility.

The plan requires eligible human-reviewed and permitted records in train/validation/test, the exact export-manifest checksum, model license review, compute budget, unchanged-model baseline and independent evaluation. The structural minimum of one example per split is not a useful dataset-size claim. Development fixtures cannot establish real training or independent evaluation readiness.

Even a fully declared configuration retains `trainer_not_implemented`. A reviewed optimizer backend, pinned dependencies, LoRA target modules and a hardware smoke test remain to be built. Expected artifacts include adapter weights/configuration, tokenizer reference, frozen training configuration, data manifest, logs, evaluation report and model card. The current command creates none of them. Declarations do not authenticate human review, verify rights or establish a successful training run.
