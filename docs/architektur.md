# Architektur und Gestaltungsprinzipien

**Fortgeschrieben bis zum Erkenntnisnavigator · 6. November 2026**

## Leitgedanke
Die Schönheit darf zum Denken einladen; sie darf es nicht ersetzen. Gestaltung und Argumentation haben unterschiedliche Aufgaben.

## Fünf Ebenen des öffentlichen Werks
1. **Auftakt:** atmosphärischer, verständlicher Zugang ohne Vorwissen.
2. **Atlas:** sechs Felder: Wirklichkeit, Leben, Bewusstsein, Mensch, Gesellschaft, Handeln.
3. **Bibliothek:** geführte Texte mit Quellen und – wo sinnvoll – zwei Lesetiefen.
4. **Prüfstand:** Status, Aussageart, Quellen, Einwände, Alternativen und Entscheidungen.
5. **Mitwirkung:** respektvolle Kritik und transparente Korrekturen.

## Gestaltung
- Dunkle Grundflächen, warmes Elfenbein, sparsam Gold und Weinrot.
- Klassische Serifenschriften für große Sinnabschnitte, sachliche Sans-Serif für Navigation und Metadaten.
- Originale geometrische Zeichen; Symbole ersetzen keine Belege.
- Weißraum, strenge Raster, gedämpfte Bewegung, gute Mobilnutzung.
- Kein Design, das Dogmen oder moralische Ranglisten suggeriert.

## Zugänglichkeit
- Konsistente Navigation, Tastatur-Fokusmarkierungen und semantische HTML-Struktur.
- Reduzierte Animationen für Nutzer mit entsprechender Systemeinstellung.
- Kerninhalte ohne JavaScript lesbar.
- Einfache und vertiefte Lesestufen erklären denselben Kern.

## Inhaltliche Integrität
- Wissenschaft: überprüfbare Quellen, Kontext, Unsicherheit.
- Philosophie: Prämissen, Gegenpositionen und Geltungsbereich.
- Metaphern: ausdrücklich als Bilder kenntlich.
- Praxis: Risiken, Grenzen und Betroffene mitdenken.
- Spätere Artikel enthalten Status, Version, Quelle, Kritik und Änderungen.

## Technik
Aktuell erzeugt Astro eine statische DE/EN-Website für GitHub Pages. Ältere Unterseiten werden aus den Root-HTML-Dateien und Übersetzungsdaten vorbereitet; neuere Kapitel verwenden gemeinsame Astro-Komponenten. Die ursprüngliche Fassung 0.2 bestand aus statischem HTML, CSS und Vanilla-JavaScript. Keine externen Fonts oder Tracker. Ein lokaler Volltextsuchindex, Backend und Anmeldung bleiben mögliche spätere Schritte bei belegtem Bedarf.

## Schutz
Private Manuskripte und Gespräche gehören nicht ohne ausdrückliche Freigabe ins Projekt. Keine erfundenen Quellen, Fachreviews oder Projektmitglieder. Texte CC BY-SA 4.0, Software MIT gemäß [LICENSING.md](../LICENSING.md); Rechte an fremdem Material, Projektsignet und redaktionelle Verantwortung vor breiter Verbreitung gesondert klären.

## Erkenntnishorizont (0.4)

Das Modell mit Mensch M, älterem Horizont a, gegenwärtigem Horizont b und offenen Kandidaten x₁–x₄ ist ein **philosophisches Denkbild**. Es wird ausdrücklich nicht als empirisch validierte geometrische oder mathematische Theorie dargestellt. Die frühere Foto-Skizze wird nicht veröffentlicht. Das Projekt unterscheidet unbelegte Hypothesen, widerlegte Aussagen und nicht empirisch prüfbare Fragen. Mathematik und empirische Wissenschaft haben unterschiedliche Begründungsverfahren; KI kann Forschung unterstützen, liefert aber keine automatische Wahrheit.

## Liber Amoris – Liebe als Forschungsfrage (0.5)

Ein zweisprachiger Bereich behandelt Liebe als heterogenes Phänomen. Anziehung, Bindung und Fürsorge werden unterschieden; philosophische Arbeitsdefinitionen sind **keine** empirischen Ergebnisse. Studien über soziale Beziehungen, stressbezogene Co-Regulation und theoretische Unterstützungsmodelle dürfen nicht als allgemeiner Kausalbeweis für Liebe ausgegeben werden. Vier Hypothesen enthalten Messideen, Gegenmodelle und einen ausdrücklich vorläufigen Status. Rechte, Autonomie und Gewaltprävention bleiben unaufhebbare ethische Grenzen.

## Liber Civitatis – Politik als überprüfbarer Entwurf (Version 0.6)

Der politische Forschungsbereich ist **kein Wahlprogramm und keine vollständig beweisbare Staatslehre**. Menschenwürde, Grundrechte, Rechtsstaat und demokratische Verantwortung bilden eine offen benannte normative Ausgangsposition; die empirische Wirkung konkreter Institutionen und Sozialmaßnahmen bleibt zu prüfen. Das Kapitel unterscheidet geltendes deutsches Verfassungsrecht von internationaler empirischer Forschung, zeigt legitime Zielkonflikte (Freiheit/Sicherheit, Markt/Sicherung, Mehrheit/Rechte, Gegenwart/Zukunft, Experten/Bürger) und dokumentiert fünf angreifbare Hypothesen (P-A–P-E). KI dient der Forschung, nicht als Ersatz demokratischer Entscheidungsverantwortung.

## Liber Custodiae – Militärische Macht und Friedensverantwortung (Version 0.7)

Der zweisprachige Bereich trennt *jus ad bellum*, *jus in bello* und zusätzliche normative bzw. empirische Prüfungen. Militärische Ethik wird weder auf Pazifismus noch auf unbeschränkte Verteidigung reduziert. Das Kapitel zeigt sechs normative Leitplanken, echte Gegeneinwände, ein bewusst nicht-operatives Dilemma und vier offene Forschungsfragen M-A–M-D. Rechtliche Schranken sind keine Variablen einer Maximierungsformel. Ziviler Schutz, demokratische Aufsicht und menschliche Verantwortung – auch für KI – werden anhand verlinkter Primär- und Fachquellen geprüft. Kein Einsatzleitfaden, keine bestätigte Universaltheorie.

## Gemeinsame Mission (0.9)

Die Startseiten werden jetzt aus `MissionHome.astro` und `src/lib/mission-copy.json` gebaut. `MissionPage.astro` erläutert die gemeinsame Architektur; `ClaimRegister.astro` rendert `public/knowledge/claims.json` in beiden Sprachen. Die alten Root-HTML-Dateien bleiben Quelle der bisherigen Unterseiten; die Root-`index.html` ist nur noch der historische, vom Locale-Skript weiterhin eingelesene Auftakt.

Das Register wird vor dem Build strukturell geprüft. Seine drei Einträge sind ungeprüfte Demonstrationen. Es fügt keine KI-Schreibrechte hinzu. Vollständige Trennung der drei Erkenntnisräume, Fachreview und institutionelle Governance sind noch nicht umgesetzt. Siehe [Mission](mission.md), [Datenvertrag](aussagenregister.md) und [Roadmap](roadmap.md).

## Der fliegende Baum · Gesamtprüfung vom 5. November 2026

Das ergänzende Organisationsbild verbindet eine Themenordnung mit sechs Arbeitsebenen: Stimmen, Fragen, Aussagen, Prüfung, Zusammenhänge und rückgekoppeltes Handeln. Die sechs Atlasfelder und die fünf Website-Zugänge bleiben davon unterscheidbar. „Nach oben“ bezeichnet mehr Kontext und Verantwortung; keine Kultur, Person oder Aussageart wird dadurch höher eingestuft.

`KnowledgeTree.astro` rendert die gemeinsamen DE/EN-Daten aus `src/lib/tree.mjs`. Die 22 Themen haben Mehrfachzuordnungen und sichtbare Ausarbeitungsstände. Kerninhalte sind ohne JavaScript lesbar; Filter verbessern den Zugang. Vorschläge aus offenen PRs werden als solche verlinkt. Ein erklärtes Gedankenbeispiel zeigt Verbindungstypen; ein automatisch geprüfter Wissensgraph wird damit nicht behauptet.

[Die Gesamtprüfung](gesamtpruefung-baum.md) dokumentiert den Ausgangsstand, Grenzen, öffentliche Selbstkritik B-01–B-03 und erste Präzisierungen von These 05 und These 09. Die unabhängige Prüfung der Methode und ein tragfähiger Einspruchsweg bleiben offene Arbeit.

## Erkenntnisnavigator · 6. November 2026

Der [Erkenntnisnavigator](erkenntnisnavigator.md) ergänzt den Baum um einen direkten Weg von Alltagsfragen zu möglichen Zusammenhängen. Fall, Muster, Fachwissen und Prinzip sind Abstraktionsstufen; sie ersetzen weder die sechs Arbeitsebenen noch die getrennte Erfassung von Aussageart, Begründung und Prüfstatus. Allgemeiner bedeutet nicht wahrer. Auch eine Verbindung zwischen Erkenntnis und Fall braucht eine eigene Begründung.

Der erste DE/EN-Pilot verwendet vier redaktionelle Entwurfskarten, lokale Wortsuche und Regeln für Paare von Textstellen. Themen und Karten sind über begründete Zuordnungen in beide Richtungen begehbar. Nutzer prüfen Voraussetzungen mit ja, nein oder unklar. Unbekannte Bedingungen bleiben offen; verneinte Bedingungen verwerfen die Verbindung. Ein freiwilliger Reflexionszettel mit TXT-Export unterstützt die spätere Korrektur. Eingaben werden nicht gesendet oder automatisch gespeichert; es entstehen keine Menschenpunktzahlen. Die vorhandenen Registerzustände bleiben unverändert.

Eine KI-Suche quer durch alle Äste sowie ein allgemeiner Wissensgraph mit versionierten, typisierten Verbindungen und Abhängigkeitsprüfung bleiben weitere Ausbauschritte. Der Pilot löst keine Modell-API-Aufrufe aus. Sein Nutzen gegenüber gewöhnlicher Suche muss noch gemessen werden.

**English:** The knowledge navigator adds a direct route from everyday questions to possible insights. Abstraction does not rank truth. Four editorial draft cards use local keyword matching and explicit yes/no/unknown applicability checks; a private, optional reflection note can be exported as TXT. There is no AI service, automatic storage, submission or person score. Cross-topic AI retrieval and a versioned knowledge graph remain future work; comparative usefulness is unmeasured.
