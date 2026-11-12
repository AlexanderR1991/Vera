# Modellvergleich · P-02

Dieser lokale Runner bereitet die [Transferprobe](../docs/evaluation-v1.md#transferprobe-von-zugangshinweisen-zu-zeichnungsständen) ausführbar vor. Er enthält vier **öffentliche synthetische Entwicklungsfälle**. Es gibt noch keine unabhängigen 16 Prüffälle, keine unabhängigen Bewertungen und keinen belegten Vera-Vorteil.

## Ohne Modell beginnen

Im Repository-Stamm mit Node.js ab 22.12 und vollständigem Git-Checkout:

```sh
node evals/cli.mjs plan
node evals/cli.mjs plan --split holdout
node --test tests/model-evaluation.test.mjs
```

`plan` gibt ohne `--out` nur JSON aus und ruft kein Modell auf. Der Holdout-Plan meldet `pending_external_cases`. Die Tests verwenden simulierte Antworten; sie prüfen die Infrastruktur und messen keine Modellqualität.

## Entwicklungsfälle mit einem lokalen Modell

Starte selbst einen lokalen Ollama-Dienst mit einem bereits installierten Modell. Der Runner lädt keine Gewichte herunter. Wähle jeweils einen **neuen** Ausgabeordner unter dem ignorierten `work/evals/`:

```sh
node evals/cli.mjs plan --model LOCAL_MODEL --out work/evals/dev-plan
node evals/cli.mjs preflight --plan-file work/evals/dev-plan/plan.json --out work/evals/dev-preflight
node evals/cli.mjs run --plan-file work/evals/dev-plan/plan.json --out work/evals/dev-run
```

Ersetze `LOCAL_MODEL` durch den installierten Namen. `--port` überschreibt den lokalen Port für `preflight`/`run`; sonst gilt `VERA_OLLAMA_PORT` oder 11434. Nur IPv4-Loopback wird verwendet. Modellname, optionaler vollständiger `--model-digest`, Seed, Anweisungen, Git-Stand, Implementierungshashes und Fallhash werden im Plan festgehalten. Ein geänderter Commit oder geänderter ausführbarer Code benötigt einen neuen Plan. Der Plan enthält zusätzlich den Arbeitsbaumstatus; der Modellkontext stammt immer aus dem genannten Commit.

Die Modellkennung wird vor und nach einem Lauf gegen die Digest-Angabe des lokalen `/api/tags`-Endpunkts geprüft. Mit `--model-digest` muss die vollständige SHA-256-Angabe übereinstimmen. Ohne vorgegebenen Digest wird bei DEV nur geprüft, ob der vom Server gemeldete Digest zwischen beiden Zeitpunkten gleich bleibt. Das authentifiziert weder die Gewichtsdateien noch die Angaben eines kompromittierten Servers. Ein Wechsel oder fehlgeschlagener Abschlusscheck sperrt eine Pilotentscheidung.

T0 erhält einen neutralen Auftrag, T1 zusätzlich eine kurze Prüfliste und T2 den Vera-Kontext. Alle Bedingungen verwenden dasselbe Modell, dieselben Quellen, dieselben Einstellungen und pro Fall eine neue Sitzung. Die Folgeeingabe wird erst nach der ersten Antwort gesendet. Es gibt keine Werkzeuge. Ein veröffentlichter DEV-Fall dient zuerst als T2-Vorabprobe. Danach werden zwölf Paare in reproduzierbar gemischter Reihenfolge bearbeitet. Je Antwort gelten 16.384 Eingabetokens, 512 Ausgabetokens und 90 Sekunden; das konfigurierte Kontextfenster lässt Platz für die Ausgabe.

**Grenze der Eingabezählung:** Der gebündelte Ollama-Adapter hat keinen exakten Tokenizer einschließlich Chat-Template. `prompt_eval_count` kann nach einer automatischen Kürzung liegen. Ein kleiner gemeldeter Wert beweist daher nicht, dass der vollständige Kontext verarbeitet wurde. DEV protokolliert `complete_input_verified: false`. Fehlende Tokenzahlen, Überschreitungen, unvollständige Antworten und Abbrüche gelten als Fehlversuche. Byte-Limits sind nur Transportgrenzen.

`run.json` enthält Anfragen, Rohantworten, verfügbare Fehler-Metadaten, Budgets und Zählwerte. `progress.jsonl` bewahrt nach der Vorabprobe und jedem **abgeschlossenen Paar** einen fortlaufenden Eintrag; `run.incomplete.json` ist ein Zwischenstand. Bei hartem Prozessabbruch können die aktuelle Antwort und das aktuelle Paar fehlen, bereits protokollierte Paare bleiben erhalten. Strg+C beendet die laufende Anfrage und markiert den Lauf unvollständig. Bei Fehlern vor Inferenz entsteht `failure.json` mit der erreichten Stufe. Vorhandene Ausgabeordner werden nicht überschrieben.

## Bewertungen getrennt halten

Der Lauf erzeugt `review-packet.json`, `ratings.template.json` und `review-key.private.json`. Gib bewertenden Personen nur das Paket, eine passende Bewertungsdatei und die unabhängig geprüften Bezugslösungen. **Plan, Rohprotokoll und privater Schlüssel bleiben bei der verwahrenden Person.** Zufällige private Pseudonyme verhindern, dass die Zuordnung aus dem öffentlichen Seed berechnet wird. Antwortformulierungen können die Bedingung trotzdem verraten; vollständige Verblindung wird nicht behauptet.

Zwei Menschen bewerten Status, Fundstelle beziehungsweise fehlenden Beleg, Begründung und Folgeverhalten. Sicherheitsmerkmale bleiben gesondert. Ersetze die Platzhalter für `reviewer_id` durch stabile Kennungen und ergänze `reviewer_provenance` mit `reviewer_id`, `human_attested`, `independent_of_implementation_attested` und `reference_reviewed_attested`. Diese Erklärungen sind keine technische Authentifizierung. Bei Widerspruch bleibt das Ergebnis offen oder eine dritte Person erhält für das Item `role: "adjudicator"`. Die ursprünglichen Bewertungen bleiben erhalten. Leere Felder werden nicht als positive Bewertung gewertet.

```sh
node evals/cli.mjs score --run-file work/evals/dev-run/run.json --ratings work/evals/dev-run/ratings.completed.json --out work/evals/dev-report
```

Die ausgefüllte Datei erstellst du selbst aus der Vorlage. `--review-key` erlaubt einen anderen Speicherort; standardmäßig wird der private Schlüssel neben `run.json` gelesen. Die Auswertung erfindet keine menschlichen Urteile. DEV und unvollständige Bewertungen führen zu keiner Pilotentscheidung. Auch vollständig bewertete Holdout-Ergebnisse liefern höchstens die im Protokoll beschriebene explorative Entscheidung, keine allgemeine Wirksamkeits- oder AGI-Aussage und keine Einsatzfreigabe.

## Was für Holdout noch fehlt

Eine externe Person erstellt und verwahrt 16 neue synthetische Fälle zu technischen Zeichnungsständen. [Fallvertrag](case.schema.json) und [Manifestvorlage](holdout-manifest.v1.json) legen die Form fest. Die Fallinputs enthalten keine Bezugslösung. Ein getrenntes Referenzpaket hält `id`, `initial_status`, `decisive_sources`, `rationale`, `followup_type` und `followup_expectation` fest. Die vier Erststatus werden vollständig mit den vier Folgetypen gekreuzt. Die Referenzen werden erst beim getrennten Scoring gelesen und gegen ihre vorab festgelegte Prüfsumme geprüft.

Das externe Manifest braucht `status: "externally_committed"`, getrennte `cases_file`/`references_file`, ihre Byte-SHA-256-Prüfsummen, `custodian`, `independent_of_implementation_attested: true` und `committed_at`. Relative Dateipfade beziehen sich auf den Manifestordner. Fallpaket und Lösungen gehören vor Entwicklerzugriff in externe Verwahrung; ein lokal gesetzter Zeitstempel beweist diese Unabhängigkeit nicht.

Zusätzlich benötigt Holdout einen unveränderlich festgelegten Modelldigest und einen Adapter mit `countInputTokens({messages, options, signal})`, der **vor jeder Generierung** `{exact: true, inputTokens: N}` für das genaue Modell samt Chat-Template zurückgibt. Der Providerzähler muss anschließend übereinstimmen. Diese Zählfunktion ist beim gebündelten Ollama-Adapter **noch nicht implementiert**; deshalb verweigert die CLI Holdout vor dem Fallzugriff. Die Schnittstelle und Tests bereiten ein geeignetes Backend vor. Der Runner erzeugt selbst keine unabhängigen Fälle und umgeht diese Lücke nicht durch eine Byte-Heuristik.

Alle Dateien bleiben lokal. Es werden keine Beiträge veröffentlicht, Daten gesammelt, Modelle trainiert, öffentliche Erkenntnisgrade geändert oder menschliche Befugnisse erteilt.

## English

This runner implements the local infrastructure for the [exploratory P-02 transfer probe](../docs/evaluation-v1.md#english). Four public synthetic DEV cases test the workflow. Independent 16-case holdouts, reference answers and human reviewers are still missing. No result or efficacy claim is supplied.

Start with `node evals/cli.mjs plan` or `plan --split holdout`; neither calls a model. Freeze a named-model DEV plan with `--out work/evals/new-plan`, then use `preflight` or `run --plan-file ... --out work/evals/new-run`. The operator must start Ollama and install a model separately. No weights are downloaded. Plans pin the commit, code hashes, prompts, settings, seed and case hash. Requests, responses, failures and usage are recorded locally. Server-reported model digests are compared before and after inference; this is not independent weight authentication.

T0/T1/T2 receive the same cases and budgets with separate sessions and two responses per case. Follow-up inputs arrive only after the first response. Each response has 16,384 input tokens, 512 output tokens and 90 seconds; tools are disabled. Missing usage and incomplete responses fail. Provider usage can follow input truncation, so DEV records full-input processing as unverified. Holdout is blocked until the adapter supplies an exact model/template input counter as well as a frozen digest and external case commitments. The bundled Ollama adapter cannot yet satisfy that counter requirement.

Give human reviewers only the pseudonymized review packet, rating template and independently examined reference answers. Keep raw run, plan and private review key separate. The private random salt prevents deriving conditions from the public seed; wording may still reveal them. `score` needs the completed ratings and matching private key. Two reviewers must agree or a third adjudicates; unresolved or absent ratings stay visible. Attestations do not authenticate independence. DEV never produces a pilot decision.

Append-only progress retains completed preflight/case pairs. A hard crash may lose the current response/pair; Ctrl+C marks the run interrupted. Existing output directories are never overwritten. The system does not publish, collect conversations, train weights or grant authority. Validated software and successful mock tests are not evidence of model improvement.
