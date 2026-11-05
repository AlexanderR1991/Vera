# Wahrheitsschwarm · Forschungsstrom v1.1

Der Schwarm ist ein **Werkzeug zur Suche nach prüfbaren Fragen**, kein Wahrheitsautomat.

## Was läuft?

GitHub Actions startet ungefähr alle sechs Stunden (UTC; Ausführung kann verzögert werden) und kann manuell gestartet werden. Ein Python-Skript liest bibliografische Crossref-Metadaten aus sieben Forschungsfeldern: Wirklichkeit, Leben, Bewusstsein, Liebe, Gesellschaft, KI und Kunst. Dazu kommen arXiv-Metadaten für Kunst, Bewusstsein und KI. Pro Suchfeld werden höchstens fünf Treffer aus den vergangenen 45 Tagen abgefragt. Die Suchbegriffe stehen im Skript; sie bilden keine systematische Literatursuche.

Crossref-Kandidaten werden nach DOI, arXiv-Kandidaten nach Kennung einschließlich Version dedupliziert. Eine verknüpfte Zeitschriften-DOI bleibt sichtbar. Verschiedene Fassungen derselben Arbeit sind keine unabhängigen Belege. Das Archiv und die Anzeige enthalten höchstens 80 Titel. arXiv-Anfragen erfolgen nacheinander mit 3,1 Sekunden Pause. Nur Metadaten werden gespeichert, keine PDFs oder vollständigen Werke.

Ohne OPENAI_API_KEY arbeitet nur die Quellensuche. Mit OPENAI_API_KEY als GitHub Actions Repository Secret gibt es für bis zu zwei neue Kandidaten pro Lauf drei **verschieden instruierte** KI-Rollen:

1. Methodologe: mögliche methodische Schwachstellen und Datenlücken.
2. Skeptiker: alternative Erklärungen und denkbare Widerlegungstests.
3. Synthese: mögliche Bedeutung für den Wissensatlas und nächste Verifikationsschritte.

Alle Rollen sehen NUR bibliografische Metadaten, keinen Volltext. Sie liefern Prüf-Fragen, niemals validierte Studienergebnisse. Drei Rollen desselben Modells sind keine unabhängigen Gutachter.

## Grenze der Automatik

Das System schreibt ausschließlich public/research/stream.json. Die Website liest diese Datei zur Laufzeit direkt aus dem GitHub-Standardzweig. So bleibt der Forschungsstrom aktuell, obwohl von GITHUB_TOKEN erzeugte Commits keinen separaten Pages-Build auslösen.

Der Automat ändert niemals Manuskripte, Kapitel, Thesen, Bewertungen des Prüfstands oder redaktionelle Entscheidungen. Ein Titel, eine DOI oder die Zeitschriftenart bestätigen weder die Qualität der Studie noch eine Aussage über die Welt. Jede Anzeige muss deshalb **ungeprüft** tragen.

Zur Übernahme ins eigentliche Werk: Originalquelle vollständig lesen, korrekte DOI prüfen, Mess- und Studiendesign beurteilen, Alternativerklärungen und Gegenbelege suchen, Aussagearten unterscheiden (empirisch / philosophisch / normativ / Metapher), Unsicherheit festhalten, dann menschlich begutachteten Pull Request stellen.

## Aktivierung

Nach Merge im Tab Actions den Workflow Wahrheitsschwarm manuell starten. Danach läuft der 6-Stunden-Zeitplan. Für drei KI-Agenten OPENAI_API_KEY unter Settings → Secrets and variables → Actions als Repository Secret hinterlegen. Niemals einen API-Schlüssel in Code, Issues oder Chat posten. API-Nutzung wird separat vom ChatGPT-Abo abgerechnet; Kosten und das Modell-Limit sollten regelmäßig geprüft werden.

Crossref und arXiv stellen nur Ausschnitte wissenschaftlicher Literatur bereit. arXiv selbst führt kein Peer Review durch; eine mögliche Journalbegutachtung wird nicht aus Metadaten unterstellt. Pro Lauf werden erfolgreiche Abfragen je Anbieter und Fehler protokolliert. Bei Teilausfällen bleiben ältere Einträge erhalten und die Website zeigt einen Hinweis; beim Totalausfall bleibt die Datei unverändert. Ein erfolgreicher Abruf mit null Treffern ist kein Ausfall. Für systematische Prüfung braucht es Volltexte, eine begründete Suchstrategie, voneinander unabhängige Evidenz, Gegenliteratur, methodische Qualitätskontrolle und menschliche Redaktion. Private Manuskripte und Gespräche werden nicht gelesen. Weitere Quellen dürfen erst nach Rechte- und Zuverlässigkeitsprüfung ergänzt werden.

Lizenz: Code unter MIT gemäß LICENSE. Bibliografische Metadaten werden ihrem Anbieter Crossref oder arXiv zugeordnet. arXiv stellt beschreibende Metadaten unter CC0 bereit; Manuskripte haben gesonderte Rechte. Siehe [arXiv API-Nutzungsbedingungen](https://info.arxiv.org/help/api/tou.html) und [API-Handbuch](https://info.arxiv.org/help/api/user-manual.html), geprüft am 05.11.2026.

Kunstwerke und andere öffentliche Netzquellen können über [Kunst und Erkenntnis](kunst-und-erkenntnis.md) eingereicht werden. Europeana ist ein verlinkter Rechercheeinstieg, kein automatisch angebundener Datenkanal.
