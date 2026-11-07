# Fragenatlas & KI-Schleuse / Question atlas & AI attention boundary

**Pilot seit 7. November 2026.** Der [Fragenatlas im Forum](https://alexanderr1991.github.io/Wirklich/de/forum/#fragenatlas) verbindet sechs **redaktionelle, ungeprüfte Beispielfragen**. Er ist kein Live-Index aller GitHub Discussions und noch kein verifizierter Wissensgraph.

> **Die Zahl der Fragen darf wachsen. Die Unübersichtlichkeit nicht.**
>
> KI darf nach Erkenntnis suchen, aber nicht durch Masse die Aufmerksamkeit von Menschen beanspruchen.

## Drei Arbeitsräume

- **Forum (Menschen):** Agora = GitHub Discussions, Stoa = aussagegebundene Issues, Curia = geprüfte Pull Requests. Menschen können kritisieren, widersprechen und begründeten Dissens bewahren. Gewünschte KI-Hilfe muss klar gekennzeichnet und begrenzt sein; ein automatisch kommentierender Forum-Bot existiert derzeit **nicht**.
- **Labor (KI):** Wahrheitsschwarm und Angriffsschwarm liefern begrenzte, sichtbar ungeprüfte Entwürfe unter `public/research/`. Sie dürfen keine Discussions, Issues, PR-Kommentare oder redaktionelle Entscheidungen automatisch erzeugen. Unterschiedliche Rollen desselben Modells zählen nicht als unabhängige Bestätigung. Weitere bezahlte Agenten sind nicht aktiviert.
- **Fragenatlas (Verbindungen):** Das manuell gepflegte `public/knowledge/questions.json` hält stabile Frage-IDs, DE/EN-Wortlaut, Typ, Herkunft, zugeordnete Themen, Links zu bestehenden Aussage-IDs und begründete Beziehungen fest. Änderungen brauchen einen redaktionell geprüften PR. Der Atlas befördert **keine** Aussage auf eine höhere Erkenntnis- oder Konsensstufe.

Diese Räume sind derzeit Arbeitsbereiche des vorhandenen Repositories, keine separate Diskussionsplattform oder neue Datenbank.

## Verbindungen ohne Scheinkonsens

Die zulässigen Beziehungen zwischen Fragen sind:

| Typ | Aussage | Grenze |
| --- | --- | --- |
| `subquestion_of` | A ist Teilfrage von B | Keine Zyklen; Teilhabe ist kein Beweis |
| `depends_on` | A braucht eine Prüfung von B | Ergebnisse werden nicht automatisch vererbt |
| `related_to` | A und B berühren einander | Wortähnlichkeit beweist keine Gleichheit |
| `alternative_framing` | A und B betrachten etwas aus anderen Blickwinkeln | Unterschiede und Wertmaßstäbe bleiben sichtbar |
| `possible_duplicate` | Vielleicht dieselbe Frage | Prüfbitte, niemals automatische Zusammenführung |

Frage-zu-Aussage-Links besagen **nur**, dass der öffentliche Eintrag relevant sein könnte. Aussagen, Quellen, Belege, Gegenbelege, Geltungsbedingungen und Konsens sind verschiedene Objekte. Für einen künftigen Beleggraphen wären gesonderte geprüfte `supports`-, `refutes`- und `boundary_condition`-Beziehungen nötig.

## Aufnahme, Verdichtung und Einspruch

1. **Herkunft dokumentieren:** Eingang durch Menschen im Forum/Issue oder als `ai_draft` im separaten Labor. Keine vertraulichen Daten in öffentliche Warteschlangen übertragen.
2. **Aufmerksamkeit schützen:** Die Offline-Triage akzeptiert **höchstens 50** Entwurfskandidaten pro Lauf; dieser Grenzwert ist ein Pilotbudget, kein universeller Sicherheitsnachweis. Forschungsmodelle sind separat freiwillig und kostenbegrenzt konfigurierbar.
3. **Vorsichtig vergleichen:** Exakt normalisierte Fragen werden als mögliche Dopplungen, lexikalisch ähnliche als Nachbarn vorgeschlagen. Das System versteht weder Synonyme noch Negationen zuverlässig. Es fügt Fragen **nicht** automatisch zusammen, verwirft sie nicht und öffnet keine Diskussionen.
4. **Menschlich prüfen:** Redaktion vergleicht die ursprünglichen Formulierungen und Geltungsbedingungen, nennt den Unterschied, die Gegenposition und die Gründe einer Verbindung. Das Original und die Quelle müssen auffindbar bleiben. Ein qualifizierter Minderheiteneinwand kann die Zuordnung erneut öffnen.
5. **Versionieren:** Nur ein prüfbarer PR ändert das öffentliche Register. Ein Mehrheitsvotum oder tausend identische Modellantworten rechtfertigen keine höhere Erkenntnisreife; R0–R4 bleiben eigenständig und rückstufbar.
6. **Auswerten:** Beobachten, wie oft vorgeschlagene Dopplungen falsch sind, Unterschiede übersehen werden, Menschen keinen Treffer finden oder eine Prüfung wegen eines Einwands wieder aufgenommen wird. Vor der Skalierung mit einer normalen Liste oder Suche vergleichen.

## Datenformat und lokale Triage

Das öffentliche Register `public/knowledge/questions.json` führt `schema_version: 1` und stabile IDs `Q-001` usw. Nach Veröffentlichung darf eine ID nicht neu vergeben werden. Die `origin`-Werte sind `editorial_draft` und `human_submission`. **KI-Entwürfe (`ai_draft`) sind im öffentlichen Register durch den Validator verboten.** `review_status: unreviewed` bleibt bei allen sechs Beispielen. `human_curated` benötigt einen namentlichen und datierten Review-Eintrag, dessen Echtheit ein Strukturskript allein nicht sicherstellen kann.

Für die Offline-Triage lässt sich eine lokale (nicht automatisch publizierte) JSON-Datei anlegen:

```json
{
  "candidates": [
    {
      "id": "C-001",
      "origin": "ai_draft",
      "question": {
        "de": "Welche Annahmen kann ein einzelner Gegenbeleg widerlegen?",
        "en": "Which assumptions could one counterexample refute?"
      }
    }
  ]
}
```

Befehl: `npm run triage:questions -- ./draft-candidates.json de`. Der Befehl druckt ausschließlich `possible_duplicate` oder `needs_human_triage` mit optionalen lexikalischen Nachbarn. Er speichert keine Frage, ruft kein Modell auf und kommentiert nichts auf GitHub. `node scripts/validate-questions.mjs` und `npm test` prüfen Datenform, Querverweise, Dopplungen von Kanten und Zyklen von Teilfragen, **nicht** Erkenntnisqualität.

## Schutz gegen externe Bots und organisatorische Grenzen

Offizielle Agenten imitieren keine Menschen, erzeugen keine Scheinmehrheit und dürfen menschliche Threads nicht durch wiederholte Antworten beanspruchen. Unsere GitHub Actions verfügen aktuell über `contents: write` für begrenzte Forschungsdateien, nicht über Issues-/Discussions-Schreibrechte. Neue Rechte, API-Ausgaben oder automatische Veröffentlichungen erfordern einen gesonderten, begründeten und geprüften PR. Bei fremder Bot-Flut brauchen wir GitHub-Moderation, Beitragslimits und nachvollziehbare Einsprüche, statt unzuverlässig nach vermuteter KI-Autorenschaft zu urteilen.

**Nicht realisiert:** Live-Synchronisation aller GitHub-Fragen, sprachübergreifende semantische Suche, automatische Konsolidierung, Beleggraph, unabhängige Moderation, vertraulicher Meldeweg und skalierbare externe Datenbank. Diese Punkte sind offen und dürfen auf der Website nicht als bereits verfügbare Funktionen erscheinen.

---

**English summary:** The bilingual question atlas is a small, unreviewed editorial pilot. Human discussions, bounded AI research drafts and the question graph are separated. Offline lexical triage never auto-posts, merges, deletes, promotes claims or counts model agreement as evidence. Stable IDs, original wording, provenance, minority objections and reversible editorial links take precedence over volume. Live GitHub ingestion, a semantic graph and independent moderation remain future work.
