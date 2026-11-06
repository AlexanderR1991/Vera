# Aussagenregister / Claim register

## Stand und Grenzen / Status and limits

`public/knowledge/claims.json` ist die redaktionelle Datenquelle für `/de/aussagen/` und `/en/aussagen/` und wird unverändert als JSON ausgeliefert. MED-001 verknüpft den historischen CAST-Zwischenbericht mit dem berichteten Ergebnis. Die fachliche Prüfung dieses Eintrags steht aus. Quellen mit `role: provenance` belegen die Herkunft.

The JSON file is the single editorial source for both register pages and the download. MED-001 links the reported outcome to the historical CAST interim report. Expert review of this entry is pending. Provenance references are not evidence of effectiveness. The register does not provide scientific validation or permanent per-version URLs yet; Git commits preserve dataset snapshots.

## Datenvertrag / Data contract

| Feld | Bedeutung |
| --- | --- |
| `id` | Stabile ASCII-Kennung und Fragmentadresse, zum Beispiel `KI-001`; nicht wiederverwenden |
| `version`, `updated_at`, `history` | Fortlaufende Version, Datum und begründete Änderung je Version |
| `type` | `empirical`, `formal`, `normative`, `interpretive`, `metaphor` |
| `epistemic_status` | `open_hypothesis`, `source_supported`, `value_commitment`, `conceptual_model`, `formal_proof` |
| `review_status` | `unreviewed`, `in_review`, `reviewed`, `disputed`, `withdrawn` |
| `statement`, `scope`, `rationale` | Aussage, Geltungsbereich und Begründung, jeweils DE/EN |
| `evidence_note`, `sources` | Beleglage; Quellenrollen `provenance`, `evidence`, `counterevidence` |
| `counterarguments`, `uncertainty`, `revision_condition` | Einwände, Unsicherheit und Bedingungen einer Änderung, DE/EN |
| `human_review` | `null` oder Person, Datum, Methode, begründete Entscheidung sowie `claim_version` und `content_sha256`; kein KI-Rollenname als Mensch |
| `ai_assistance` | Ob KI half, ihre Aufgabe und erfasste Modellversion; `null` bedeutet nicht erfasst |
| `proof` | Nur bei `formal_proof` erforderlich: explizite Voraussetzungen und Ableitung, DE/EN |

`reviewed` bedeutet dokumentierte Bearbeitung, nicht endgültige Wahrheit oder automatisch unabhängige Fachprüfung. Ein Name im Datensatz ersetzt keine Authentizitätsprüfung. Der Validator prüft Pflichtfelder und semantische Mindestgrenzen, nicht die Qualität der Argumente oder Quellen.

### Eine Prüfung gilt für eine bestimmte Fassung / Reviews cover a specific version

Jeder vorhandene Prüfvermerk muss mit `claim_version` auf die aktuelle Versionsnummer und mit `content_sha256` auf den SHA-256-Fingerabdruck des geprüften Eintrags verweisen. `claimReviewFingerprint` in `src/lib/claims.mjs` berechnet ihn über sämtliche Eintragsfelder außer `human_review` und `review_status`. Damit sind insbesondere der Wortlaut in beiden Sprachen, Geltungsbereich, Quellen, Gegenargumente, Beleglage, Unsicherheit und Revisionsgeschichte gebunden. Objektschlüssel werden rekursiv sortiert; die Reihenfolge von Listen bleibt relevant.

Ändert sich dieser Inhalt, ist der alte Prüfvermerk ungültig — auch bei unveränderter Versionsnummer oder dem Status `disputed`. Vorherige Prüfungen bleiben über die Git-Historie zugänglich. Für eine neue ungeprüfte Fassung `human_review: null` und `review_status: unreviewed` (oder `in_review`) setzen. Ein alter Vermerk darf nicht durch bloßes Aktualisieren seines Fingerabdrucks erneuert werden: Erst die tatsächlich durchgeführte menschliche Prüfung berechtigt zum neuen Vermerk. Methode und Entscheidung müssen den Umfang dieser Prüfung und etwaige Übersetzungsgrenzen benennen.

Der Fingerabdruck erkennt eine veraltete Zuordnung. Er ist **keine Signatur**, authentifiziert keine Person und beweist keine inhaltliche Prüfung. Er bindet Quellen-URLs und ihre Angaben im Register, nicht veränderliche Inhalte externer Webseiten. Für die Nachprüfbarkeit konkrete Quellenversionen angeben, soweit verfügbar.

Every non-null review must bind to the current `claim_version` and the `content_sha256` of the complete claim snapshot, excluding only the review itself and its workflow status. Changes to either language, scope, evidence or other bound fields invalidate an inherited review. Reset the new version to an unreviewed record or document a genuinely renewed human review; regenerating a hash alone is not review. The fingerprint is not a signature, proof of review or a snapshot of external webpages. Review methods must state their scope and any limits on translation checking.

## Änderungen / Changes

1. Aussage präzise begrenzen und Quellen tatsächlich prüfen.
2. Eintrag bearbeiten, Version erhöhen und Revisionsgrund hinzufügen. Auch bei einer Rücknahme bleibt die Kennung erhalten.
3. Eine vorhandene Prüfung bei Inhaltsänderungen zurücksetzen. Eine neue menschliche Prüfung mit Methode, Datum, begründeter Entscheidung, `claim_version` und `content_sha256` dokumentieren; keine erfundenen Gutachten eintragen. Den Fingerabdruck erst aus dem fertig bearbeiteten Eintrag berechnen.
4. `npm run test:claims` und `npm run build` ausführen.
5. Änderung als PR vorlegen. Redaktionelle Freigabe folgt der bestehenden Governance.

Kein Bot darf Aussagen anhand von Modellmehrheiten hochstufen. Die vorhandenen Schwarm-Workflows werden durch dieses Register nicht erweitert.

Current UI labels cover the defined enum values. New values require coordinated data, validator and bilingual UI changes. Withdrawn records remain visible. A future reviewed corpus needs finer source-to-claim links and discipline-specific quality assessment before scaling.
