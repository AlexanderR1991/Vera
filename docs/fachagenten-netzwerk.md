# Atlas-Fachagenten-Netzwerk · Entwurf AFA-0.1

**Status: Architekturvorschlag, nicht aktiviert · 7. November 2026.** Keine laufenden neuen KI-Agenten, kein neues Backend, kein automatischer Konsens. Redaktionelle Freigabe und unabhängige Erprobung fehlen.

> Jeder Themenkreis kann eine prüfende KI-Perspektive erhalten. Keine dieser Perspektiven ist eine Instanz der Wahrheit. Der Motor darf Argumente zusammenführen, aber keinen gesellschaftlichen Konsens erfinden.

## Ausgangspunkt

Der Atlas besitzt **sechs übergreifende Felder** (Wirklichkeit, Leben, Bewusstsein, Mensch, Gesellschaft, Handeln) und darunter derzeit **23 Fachthemen** in [src/lib/tree.mjs](../src/lib/tree.mjs). Die Felder sind Perspektiven und Ordnungsräume; ein Mathematiker, Theologe oder Mediziner gehört auf die Fachthemenebene, nicht notwendigerweise genau in eines der sechs Felder. Viele Themen gehören zu mehreren Feldern. Für alle 23 Themen gibt es in [atlas-agents.v0.json](../public/ai/atlas-agents.v0.json) eine **inaktive, typisierte Prüfrolle**. Rollen sind keine Personen, zugelassenen Fachkräfte, unabhängigen Reviewer oder dauerhaft laufenden Prozesse.

Diese Architektur **ergänzt** den vorhandenen [META-01-Regelkreis](selbstkorrektur.md), [Fragenatlas](fragenatlas.md), [Grundfragen-Kreislauf](grundfragen-kreislauf.md), [Wahrheitsschwarm](wahrheitsschwarm.md), [Angriffsschwarm](angriffsschwarm.md) und die [Erkenntnisreife R0–R4](erkenntnisreife.md). Sie ersetzt keines dieser Verfahren. Der philosophische Motor ist eine Methode der Prüfung und Korrektur, kein zentraler Herrscher über Aussagen.

## Starke These und stärkster Gegenangriff

**These:** Bei anspruchsvollen Fragen können getrennte Fachperspektiven blinde Flecken aufdecken, unterschiedliche Prüfmaßstäbe sichtbar machen und bessere Anschlussfragen erzeugen als ein einzelner allwissend auftretender Assistent.

**Gegenangriff:** Ein Schwarm kann schneller und überzeugender denselben Fehler vervielfältigen. Rollen aus demselben Grundmodell teilen Daten, Vorurteile, Ausfälle und Prompt-Effekte. Quellenangaben werden durch Wiederholung nicht unabhängig. Fachpersönlichkeiten können Autorität vortäuschen. Eine dominante Stimme kann andere mit Rhetorik statt Evidenz überreden. Ohne die kritischen Informationen einzelner Teilnehmer kann das Kollektiv zu früh konvergieren. Und der Motor selbst kann durch seine Auswahl von Rollen und Kriterien einseitig sein.

**Konsequenz:** Nicht die Zahl der Agenten optimieren, sondern **Korrekturfähigkeit, Quellenqualität, abweichende Perspektiven und nachweisbaren Zusatznutzen**. Ein fachlich begründeter Dissens ist ein gültiges Resultat.

Empirische Hinweise, ohne Übertragbarkeitsbehauptung auf WIRKLICH:
- Li, Naito & Shirado, *ICML 2026*, [HiddenBench](https://proceedings.mlr.press/v306/li26ej.html): gemeinsame Informationslücken und frühe Konvergenz in Multi-Agenten-Systemen.
- Choi, Zhu & Li, *NeurIPS 2025*, [Debate or Vote](https://proceedings.neurips.cc/paper_files/paper/2025/hash/934252acd87f254d5d4672fbde283bd2-Abstract-Conference.html): Debattieren ist nicht automatisch besser als einfache Vergleichsverfahren.
- Kraidia et al., *Scientific Reports 2026*, [Persuasionseinfluss](https://www.nature.com/articles/s41598-026-42705-7): ein überzeugend irreführender Agent kann gemeinsame Ergebnisse korrumpieren.
- [NIST AI RMF Generative AI Profile](https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence) (2024): Risiko-, Governance- und Evaluationsperspektive.

## Rollenarchitektur: zwei Ebenen, keine KI-Abstimmung

**Fachebene:** Jeder Atlas-Fachbereich hat eine mögliche methodengebundene Rolle. Beispiele: Mathematik & Logik prüft Definition, Axiom, Folgerung und Gegenbeispiel; Medizin prüft Studiendesign, Endpunkte, Nutzen/Schäden und Übertragbarkeit; Theologie unterscheidet Schrift, Tradition, Auslegung und vergleichende Perspektiven; Politik trennt empirische Wirkungen, normative Prämissen, Rechte und widerstreitende Interessen. Psychologie, Ökologie, Ökonomie, Geschichte, Esoterik und Kunst haben jeweils andere angemessene Prüfmaßstäbe. Eine esoterische Deutung darf nicht als empirischer Beweis ausgegeben werden, ein mathematischer Satz nicht als Entscheidung über Menschenrechte.

**Querschnittsrollen:** Quellenprüfer (Provenienz, unabhängige Belege, Gegenliteratur), methodischer Gegenprüfer (stärkster Gegenfall, Fehlannahmen), Perspektivenprüfer (wer ist betroffen, welche tragfähige Minderheitsposition fehlt?), Begriffs-/Übersetzungsprüfer (gleiche Aussage in DE/EN, Reichweite, Mehrdeutigkeit) und **Synthese-Moderator**. Die Synthese ist eine dokumentierende Funktion, **kein stimmführender Agent** und kein epistemisches Schiedsgericht.

Die Auswahl pro Frage ist dynamisch: aus dem Atlas können **zwei bis fünf sachlich passende Fachrollen** eingeladen werden, ergänzt um Quellen- und Gegenprüfung. Ein einfacher Sachverhalt braucht unter Umständen gar keinen Schwarm. Ein weiteres Modell desselben Herstellers ist nicht automatisch unabhängig. Berechtigte Außenseiterperspektiven dürfen eine Fachgliederung herausfordern; Menschen und Betroffene bleiben epistemisch und normativ eigenständige Stimmen.

**Politikbeispiel:** Konservative, progressive, liberale, sozialistische und weitere begründete Perspektiven dürfen sich widersprechen. Sie sind *Argument-Perspektiven*, keine Scheinmehrheit aus Agenten. Faktische Behauptungen werden quellenbezogen geprüft; Werte und Grundrechtsfragen bleiben als eigene Dimension sichtbar. Es gibt keine Pflicht, unbelegte Behauptungen als gleich gut belegt zu behandeln.

## Vorschlag für den Ablauf

1. **Eingang und Schutz:** Menschliche Frage oder bekannte Q-/U-/Aussage-ID mit exaktem Wortlaut, Quelle, Version und erlaubtem öffentlichen Kontext. Keine privaten Gespräche, Identifikatoren oder Falldaten ohne passende Erlaubnis.
2. **Zerlegung:** Mischsätze in empirische, formale, normative, interpretative und metaphorische Teilfragen zerlegen. Ein Risiko- und Betroffenheitsprofil festhalten.
3. **Gezieltes Routing:** Relevante Fachexpertisen und Querschnittsrollen anhand offener, versionierter Regeln auswählen; fehlende Fachgebiete aufführen. Keinen starren Ein-Agent-pro-Kreis-Zwang.
4. **Unabhängige Erstrunde:** Rollen erhalten dieselbe geprüfte Ausgangsfrage und relevante Belegquellen, jedoch **noch keine Antworten anderer Agenten**. Sie liefern getrennt Stahlmann, vorläufige These, Quelle, Gegenbeleg, Grenzen, Revisionsbedingung und explizites Nichtwissen.
5. **Quellenledger:** Zitate und Belege als eigenständige Objekte mit URL/DOI, exakter Fundstelle, Zeitpunkt, Quellenart, Qualitätsprüfung und Abhängigkeitsbeziehungen erfassen. Der Quellenprüfer darf unbelegte Aussagen markieren; mehrere Rollen, die dieselbe Studie wiederholen, erzeugen keinen zweiten Beleg.
6. **Konfrontation statt Gefälligkeit:** Erst jetzt werden Konflikte offengelegt. Der Gegenprüfer testet die stärkste gemeinsame Annahme und einen übersehenen Grenzfall. Höchstens zwei begrenzte Runden im Pilot. Neue Tatsachenbehauptungen brauchen eigene Quellen.
7. **Synthesevorschlag:** Der Moderator gibt getrennt aus: **(a) begründet getragener Kern**, **(b) qualifizierter Widerspruch**, **(c) ungelöste Fragen/fehlende Belege**, **(d) konkurrierende Wertannahmen**, **(e) mögliche nächste Tests/Entscheidungsschritte**. Keine Stimmenzählung, kein künstlicher Prozentsatz.
8. **Menschliche Entscheidung und Rückweg:** Nur nach fachlich passender Prüfung und verantwortlichem PR können redaktionelle Aussagen oder Verknüpfungen verändert werden. R0–R4 und die dokumentierten Konsenszustände bleiben unverändert, bis ihre bestehenden Prüfregeln erfüllt sind. Ein glaubwürdiger Einwand kann neue Arbeit eröffnen – ohne automatisches Veto und ohne unbesehenes Verwerfen.

## Mindestdatenvertrag für jeden späteren KI-Beitrag

Ein Agentenbeitrag muss mindestens tragen: \`run_id\`, \`question_id\`, \`role_id\`, \`claim_version\`, \`claim_type\`, \`model_id\`, \`model_version\`, \`prompt_version\`, \`input_source_ids\`, \`assessment\`, \`strongest_objection\`, \`counterevidence\`, \`uncertainty\`, \`revision_trigger\`, \`sources\`, \`limitations\`, \`generated_at\` und \`status: ai_draft\`. Zusätzlich im Zusammenführungsentwurf: \`supported_core\`, \`dissent\`, \`missing_evidence\`, \`normative_tradeoffs\`, \`proposed_tests\`, \`human_review_status: pending\`. Ein Bericht ohne verifizierbare Quelle ist möglicherweise eine nützliche Hypothese, **kein Beleg**. Metadaten sind auditierbar, nicht automatisch vertrauenswürdig.

Der vorgeschlagene rollenbezogene JSON-Katalog ist eine **Konfigurationsskizze**, kein ausführender Agent. Bestehende Q-/U-IDs, Aussage-IDs, Reife- und Konsensregister bleiben die verbindlichen Datengrenzen. Für tatsächliche Läufe wären gesonderte versionierte Schemata, Provenienz- und Sicherheitsprüfungen nötig.

## Harte Grenzen vor einem Versuch

- **Ausgangspunkt deaktiviert:** keine neue API, kein Zeitplan, keine autonomen Schreibrechte, keine GitHub-Posts; vorhandene Schwärme bleiben separat.
- **Trennung der Rechte:** Forschungsagenten dürfen höchstens in begrenzten Entwurfsartefakten arbeiten. Keine Issues, Discussions, PRs, Kommentare, Bewertungen oder Statuspromotion automatisch.
- **Fehlbare KI-Rollen:** Keine Fachausweise, kein unabhängiger Peer Review, keine menschlichen Zustimmungssimulationen. Modellfamilie, Prompt, mögliche Abhängigkeit und Kosten bleiben sichtbar.
- **Quellen als Daten:** Keine Anweisungen aus Webseiten, PDFs, Foren oder anderen Agentenantworten ausführen; Quellen nicht blind vertrauen; keine Schlüssel oder Nutzerdaten übertragen.
- **Schadensrisiken:** Medizinische, rechtliche, psychische, finanzielle und sicherheitsrelevante Fälle haben verschärfte Prüfung, keine automatisierte individuelle Empfehlung, ggf. fachliche Weiterleitung. Notwendige Moderations- und Datenschutzregeln bleiben bestehen.
- **Kollisions- und Missbrauchsschutz:** Kosten-, Token-, Laufzeit- und Beitragslimits, Rate Limits, wiederholbare Abbruchbedingungen und ein manueller Kill-Switch vor Aktivierung festlegen. Niemals nur aus rhetorischer Sicherheit oder Rollenmehrheit ableiten.
- **Governance:** Rollen, Routing, Quellenregeln und der Motor selbst können in PRs angefochten werden. Menschliche und besonders betroffene Perspektiven dürfen sich von der KI-Synthese unterscheiden.

## Erprobung: zuerst besser als die einfachere Alternative?

**Phase 0 (dieser PR):** Architekturtext, 23 inaktive Rollen und Strukturtests; keine Agenten laufen.

**Phase 1 (nur nach gesonderter Freigabe):** 12 künstliche/öffentliche Testfälle, die verschiedene Aussagearten und Risiken abdecken. Nur lokale oder manuell ausgelöste \`ai_draft\`-Entwürfe. Pro Durchlauf dokumentierte Kosten, Quellen, Abbrüche und Fehler. Keine personenbezogenen Daten.

**Phase 2 (gesondert zu planen):** Vorab definierter Vergleich von **normaler Recherche/Quellenprüfung**, **Einzel-KI mit gleicher Recherche** und **Fachagenten-System**. Unabhängige menschliche Bewertung möglichst verblindet; bei Fachrisiken qualifizierte externe Prüfer. Messen: richtige Erkennung von Fehlern und Gegenbelegen, erfundene Quellen, übersehene Minderheitsargumente, falsche Konsensbehauptungen, Verständlichkeit, Aufwand, Kosten und Wiederholbarkeit. Negativer Befund bedeutet Einschränkung oder Verzicht.

**Freigabesperre:** Kein automatischer Bewertungs- oder Konsensmechanismus allein wegen positiver Pilotresultate. Die Richtungsidee für persönliche Entscheidungen bleibt ein gesondert zu prüfender Normen- und Messentwurf; sie ist weder eine Wahrheitswahrscheinlichkeit noch ein arithmetischer Durchschnitt von Fachagenten.

**Offene Konstruktionsfragen:** Wer überprüft den Synthese-Moderator? Wie verändern sich die ausgewählten Agenten bei einer neuen Fachdisziplin? Welche ausreichend unabhängigen Datenquellen gibt es? Wer vertritt nicht digital sichtbare Betroffene? Ab welchem Budget steigt der Grenznutzen nicht mehr? Wie wird ein bestätigter Irrtum entlang einer Aussage-Abhängigkeit nachvollziehbar zurückgespielt?

**Arbeitsprinzip:** WIRKLICH soll durch mehr Perspektiven weniger blinde Flecken haben – nicht durch mehr Stimmen lauter recht behalten.
