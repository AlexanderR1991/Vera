# Aussagenregister / Claim register

## Stand und Grenzen / Status and limits

`public/knowledge/claims.json` ist die redaktionelle Datenquelle für `/de/aussagen/` und `/en/aussagen/` und wird unverändert als JSON ausgeliefert. Drei Einträge demonstrieren das Format. Alle sind ungeprüft. Quellen mit `role: provenance` belegen die Herkunft; sie gelten nicht als fachliche Bestätigung.

The JSON file is the single editorial source for both register pages and the download. All three entries are unreviewed demonstrations. Provenance references are not evidence of effectiveness. The register does not provide scientific validation or permanent per-version URLs yet; Git commits preserve dataset snapshots.

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
| `human_review` | `null` oder Person, Datum, Methode und begründete Entscheidung; kein KI-Rollenname als Mensch |
| `ai_assistance` | Ob KI half, ihre Aufgabe und erfasste Modellversion; `null` bedeutet nicht erfasst |
| `proof` | Nur bei `formal_proof` erforderlich: explizite Voraussetzungen und Ableitung, DE/EN |

`reviewed` bedeutet dokumentierte Bearbeitung, nicht endgültige Wahrheit oder automatisch unabhängige Fachprüfung. Ein Name im Datensatz ersetzt keine Authentizitätsprüfung. Der Validator prüft Pflichtfelder und semantische Mindestgrenzen, nicht die Qualität der Argumente oder Quellen.

## Änderungen / Changes

1. Aussage präzise begrenzen und Quellen tatsächlich prüfen.
2. Eintrag bearbeiten, Version erhöhen und Revisionsgrund hinzufügen. Auch bei einer Rücknahme bleibt die Kennung erhalten.
3. Menschliche Prüfung mit Methode, Datum und begründeter Entscheidung dokumentieren; keine erfundenen Gutachten eintragen.
4. `npm run test:claims` und `npm run build` ausführen.
5. Änderung als PR vorlegen. Redaktionelle Freigabe folgt der bestehenden Governance.

Kein Bot darf Aussagen anhand von Modellmehrheiten hochstufen. Die vorhandenen Schwarm-Workflows werden durch dieses Register nicht erweitert.

Current UI labels cover the defined enum values. New values require coordinated data, validator and bilingual UI changes. Withdrawn records remain visible. A future reviewed corpus needs finer source-to-claim links and discipline-specific quality assessment before scaling.
