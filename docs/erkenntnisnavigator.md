# Erkenntnisnavigator · Verbindungen prüfen

**6. November 2026 · erster redaktioneller Pilot · Nutzen noch nicht gemessen**

Der Baum ordnet Themen. Ein Netz kann seine Äste verbinden. Der Erkenntnisnavigator führt von einer konkreten Frage zu einer möglichen Erkenntnis und prüft mit dem Fragenden, ob deren Voraussetzungen passen. Niemand muss dafür das Fachgebiet oder den Fachbegriff schon kennen.

Einstieg: [Deutsch](https://alexanderr1991.github.io/Wirklich/de/erkenntnisnavigator/) · [English](https://alexanderr1991.github.io/Wirklich/en/erkenntnisnavigator/).

## Vier Ordnungen auseinanderhalten

Die [sechs Arbeitsebenen](gesamtpruefung-baum.md) bleiben bestehen: Menschen und Stimmen, Themen und Fragen, Aussagen und Voraussetzungen, passende Prüfung, Zusammenhänge und Dissens, Handeln und Rückkopplung. Sie beschreiben ein Verfahren. Die Atlasfelder ordnen Themen; die Website-Zugänge ordnen die Navigation.

Davon unabhängig beschreibt der Navigator Abstraktionsstufen:

| Stufe | Gegenstand | Gedankenbeispiel |
| --- | --- | --- |
| Fall | Eine Frage und ihre Umstände | Zwölf Stunden notwendige Arbeit, acht verfügbare Stunden. |
| Muster | Eine mögliche Beziehung im Fall | Bedarf übersteigt Kapazität. |
| Fachwissen | Eine begründete Aussage mit Geltungsbedingungen | Nicht parallel ausführbare Arbeit passt unter diesen Angaben nicht in die verfügbare Zeit. |
| Prinzip | Eine allgemeinere, übertragbare Beziehung | Eine Planung muss ihre Ressourcenbedingungen erfüllen. |

**Allgemeiner bedeutet nicht wahrer.** Aussageart, Begründungslage und Prüfstatus bleiben auf jeder Stufe getrennt. Ein Werturteil wird durch Abstraktion kein Naturgesetz. Eine gefundene Ähnlichkeit ist zunächst ein Vorschlag, keine bestätigte Anwendung. Eine Frage darf mehrere Äste berühren oder ohne passenden Treffer bleiben.

## Was der erste Pilot tatsächlich leistet

Die statische DE/EN-Seite arbeitet mit vier redaktionellen Entwurfskarten aus `src/lib/navigator.mjs`: Kapazität, Beobachtung und Deutung, Durchschnitt und Verteilung sowie Hilfe und Selbstbestimmung. Die ersten drei prüfen formale Beziehungen; die vierte begründet einen normativen Leitgedanken einschließlich dauerhafter Fürsorge. Quellenhinweise unterscheiden Herkunft und Ableitung. Der Bestand ersetzt weder das Aussagenregister noch dessen Reviewverfahren.

Eine begrenzte Stichwortsuche schlägt Karten vor. Nutzer können sie auch selbst auswählen. Sie ist **keine KI-Mustererkennung** und versteht eine freie Lebensbeschreibung nicht zuverlässig. Aus dem Fragetext werden keine Voraussetzungen als erfüllt übernommen. Die Karten nennen ihre Bedingungen; Nutzer markieren sie einzeln als **ja**, **nein** oder **unklar**.

Der öffentliche Datenexport `/knowledge/connections.json` führt die redaktionellen Karten als eigenen Entwurfsbestand (`schema_version: 1`). Er enthält keine persönlichen Fragen oder Reflexionszettel. Die Hilfe-Karte verweist mit `sourceClaim` auf G-005 v2; dieser Herkunftsbezug verleiht weder ihr noch G-005 einen neuen Reviewstatus.

| Ergebnis | Bedeutung |
| --- | --- |
| Kontext fehlt | Mindestens eine notwendige Voraussetzung ist unbekannt. Die benannte Rückfrage bleibt offen. |
| Nicht anwendbar | Mindestens eine notwendige Voraussetzung wurde verneint. Diese Verbindung wird verworfen. |
| Bedingt passend | Alle Voraussetzungen wurden vom Nutzer bestätigt. Die Folgerung gilt nur unter diesen Angaben; die Software hat deren Wahrheit nicht überprüft. |

Der Status „Entwurf“ bleibt auch bei einer bedingt passenden Anwendung bestehen. Es entsteht kein unabhängiges Fachreview und kein Wahrheitssiegel. Der Prüfstatus der Registereinträge bleibt von dieser Zuordnung unabhängig. Ein nicht passender Treffer widerlegt nicht automatisch die zugrunde liegende allgemeine Aussage.

Der freiwillige Reflexionszettel hält Ziel, Beobachtung, Deutung, Gefühl, Wunsch oder Angst, nächsten Schritt, erwartete und beobachtete Folgen sowie einen Änderungsgrund auseinander. Er bewertet Entscheidungen im Verhältnis zu selbst benannten Zielen; er vergibt keine Gesamtpunktzahl für einen Menschen. Eingaben werden vom Navigator nicht gesendet oder automatisch gespeichert. Ein TXT-Export wird ausdrücklich gestartet; die Datei bleibt in der Verantwortung der Person, die sie herunterlädt. Eine öffentliche Einreichung wäre ein eigener, bewusster Schritt.

## Ableitungen und Begründungen der vier Karten

Die folgenden Stellen legen die projektinternen Gründe offen. Sie sind keine unabhängige Begutachtung. Die Fallzahlen sind erfundene Rechenbeispiele.

<a id="capacity"></a>
### Kapazität

Angenommen, alle notwendigen Aufgaben benötigen zusammen zwölf Stunden derselben begrenzten Arbeitskapazität. Sie lassen sich nicht parallel ausführen und müssen vollständig innerhalb eines Zeitraums mit acht verfügbaren Arbeitsstunden abgeschlossen werden. Zwölf ist größer als acht; die Reihenfolge ändert die Summe nicht. Unter diesen Voraussetzungen kann eine reine Umordnung die Lücke nicht schließen. Ändern sich Umfang, Ausführungsaufwand, verfügbare Kapazität oder Frist, ist neu zu rechnen. Ungeprüfte Zeitschätzungen oder mögliche Parallelisierung tragen die ursprüngliche Anwendung nicht. Die Ableitung beurteilt eine Planung, nicht die Disziplin oder den Wert einer Person.

<a id="observation"></a>
### Beobachtung und Deutung

Aus „Wenn Erklärung P zutrifft, folgt Beobachtung Q“ und „Q wurde beobachtet“ folgt P nicht zwingend. Ein Gegenmodell genügt: P ist falsch und Q ist wahr; das ist mit „wenn P, dann Q“ vereinbar. Eine andere Erklärung R könnte ebenfalls Q hervorbringen. Ein ausgebliebener Rückruf könnte beispielsweise mehrere Ursachen haben. Dieses Gedankenbeispiel behauptet keine tatsächlichen Motive. Es zeigt, warum die Beobachtung allein keine eindeutige Erklärung festlegt. Zusätzliche Informationen können eine Deutung stützen oder ausschließen; die Unbestimmtheit eines Falls beweist nicht, dass jede Deutung gleich plausibel ist.

<a id="distribution"></a>
### Durchschnitt und Verteilung

Die Werte 0 und 10 haben denselben arithmetischen Mittelwert wie 5 und 5: jeweils 5. Bei einer angenommenen Mindestmenge von 4 liegt im ersten Beispiel ein Wert darunter, im zweiten keiner. Der Mittelwert von mindestens zwei Werten legt die Einzelwerte daher nicht eindeutig fest. Wer Folgen für einzelne Betroffene beurteilen will, braucht weitere Angaben zur Verteilung. Vorausgesetzt sind vergleichbare Größen und die tatsächlich verwendete Mittelwertdefinition. Aus dem Gegenbeispiel folgt weder, dass jede ungleiche Verteilung ungerecht ist, noch welche Verteilung Menschen wählen sollten; diese Wertfragen benötigen eigene Gründe.

<a id="help"></a>
### Hilfe und Selbstbestimmung

Die Hilfe-Karte greift den normativen Leitgedanken [G-005 v2](../public/knowledge/claims.json) auf: Bedürfnisse und Handlungsmöglichkeiten der betroffenen Person ernst nehmen und ihre Perspektive einbeziehen. Dauerhafte Fürsorge bleibt wertvoll; erreichbare Selbstständigkeit ist keine Bedingung für Würde oder Unterstützung. Aus diesem Wert folgt kein empirischer Wirksamkeitsbeleg für eine konkrete Hilfe. Ob sie gewünscht ist, welche Folgen sie hat und ob Schutzpflichten oder andere Zielkonflikte berührt sind, muss im konkreten Fall geklärt werden. Die Karte legt niemandem Motive oder Zustimmung in den Mund. Eine verneinte Voraussetzung blockiert diese Anwendung; sie begründet weder ein Verbot noch den Entzug notwendiger Fürsorge.

## Vertrag für spätere Verbindungen im Wissensnetz

Der erste Pilot bildet feste Verbindungen in Karten ab. Ein allgemeiner Wissensgraph und die folgende automatisierte Abhängigkeitsprüfung sind noch nicht implementiert. Für diesen Ausbau gilt:

| Bestandteil einer Verbindung | Erforderliche Information |
| --- | --- |
| Identität | Eigene ID und Version; Ausgangs- und Zielaussage jeweils mit Version. |
| Beziehung | Typ wie „setzt voraus“, „stützt“, „widerspricht“, „schränkt ein“, „angewandt auf“ oder „ähnelt lediglich“. |
| Begründung | Warum diese Beziehung gelten soll; überprüfbare Quelle oder explizite Ableitung. |
| Geltung | Voraussetzungen, Kontext, passende Ziele und bekannte Ausschlussbedingungen. |
| Einwand | Stärkster Gegenbeleg, entscheidender Unterschied oder Gegenfall. |
| Prüfung | Entwurf, geprüfter Umfang, zuständige Person, Datum und dokumentierte Entscheidung; KI-Vorschlag bleibt als solcher erkennbar. |
| Revision | Was die Verbindung ändern würde und welche weiteren Aussagen von ihr abhängen. |

Die Qualität eines Ausgangstexts belegt nicht schon seine Anwendbarkeit auf einen neuen Fall. Jede Verbindung braucht ihre eigene Begründung. Wenn sich eine referenzierte Aussage oder Voraussetzung ändert, müssen abhängige Verbindungen zur erneuten Prüfung markiert werden. Ein bereits ausgegebenes Ergebnis muss zu seiner damaligen Version zurückverfolgbar bleiben.

KI könnte später über alle Themenäste nach solchen Kandidaten suchen, Unterschiede herausarbeiten und Rückfragen formulieren. Sie dürfte Voraussetzungen nicht stillschweigend ergänzen, Werte nicht als empirisch bewiesen behandeln und den Reviewstatus nicht selbst hochstufen. Keine passende Verbindung zu finden bleibt ein zulässiges Ergebnis. Ein solcher Dienst ist in diesem Pilot nicht angeschlossen; es werden keine Modell-API-Aufrufe oder automatischen Recherchen ausgelöst.

## Rückkopplung und Gegenbeispiele

Ein neuer Fall kann eine allgemeinere Erkenntnis einschränken oder korrigieren. Zuerst ist zu prüfen, ob der Fall richtig beschrieben wurde und die Voraussetzungen tatsächlich galten. Rückmeldungen sind Hinweise für eine Prüfung; ein einzelner Erfolg ist kein allgemeiner Wirksamkeitsbeleg, und eine Veränderung nach einer Handlung ist allein noch kein Kausalbeweis.

**Gedankenbeispiel für einen falschen Transfer:** Aus „Engpässe begrenzen einen Produktionsprozess“ folgt nicht „Beschleunige den langsameren Partner in einer Beziehung“. Die technische Analogie begründet weder ein gemeinsames Lebensziel noch ein Verfügungsrecht über einen Menschen. Das System muss solche Unterschiede offenlegen, auch wenn die Formulierungen ähnlich klingen.

## Wie der Nutzen geprüft werden soll

Der Pilot ergänzt den [Evaluationsentwurf](evaluation-v1.md). Ein Vergleich wurde noch nicht durchgeführt; die folgenden Punkte sind keine Vorregistrierung und keine Ergebnisdaten.

1. Einen begrenzten Fallsatz mit begründeten Referenzurteilen vorab festlegen: passende, nicht passende und unentscheidbare Verbindungen; formale und normative Aufgaben getrennt bewerten. Erfundene Fälle kennzeichnen.
2. Besonders Fallpaare aufnehmen, deren Wortlaut fast identisch ist und bei denen nur eine notwendige Voraussetzung wechselt. Beispiel: Aufgaben sind nicht parallel ausführbar gegenüber Aufgaben sind parallel ausführbar. Die ursprüngliche Kapazitätsfolgerung darf nicht unverändert übernommen werden.
3. Gewöhnliche Suche und den kuratierten Navigator bei gleichem Quellenzugang und Zeitbudget vergleichen. Eine spätere KI-Variante erhält eine eigene Vergleichsbedingung; ihr Nutzen wird nicht aus dem Erfolg der kuratierten Karten abgeleitet.
4. Fehlübertragungen, übersehene passende Verbindungen, angemessenes Offenlassen und gezielte Rückfragen getrennt zählen. Menschen sollen den Zusammenhang und seine Grenze in eigenen Worten erklären können. Zeit, Aufwand und gegebenenfalls Kosten zusätzlich erfassen.
5. Bewertenden soweit möglich die verwendete Bedingung verbergen; Reihenfolge und Lerneffekte berücksichtigen. Unterschiedliche Sprach- und Bildungsvoraussetzungen gezielt einbeziehen, Ergebnisse nach Gruppen prüfen und fehlende Perspektiven benennen.

Wiederkehrende falsche Übertragungen, schlechteres Verständnis oder kein Vorteil gegenüber einfacher Suche wären Gründe, Verfahren oder Karten zu ändern und die Ausweitung auszusetzen. Ein kleiner erfolgreicher Vergleich würde zunächst nur den geprüften Fallsatz und die beteiligten Gruppen betreffen.

## Technische Bezugspunkte

- [GraphRAG-Dokumentation von Microsoft](https://microsoft.github.io/graphrag/): möglicher Baustein für die spätere Suche in verknüpften Quellen. Ein Suchverfahren ersetzt keine Anwendbarkeitsprüfung.
- [Dedre Gentner, Structure-Mapping (1983)](https://groups.psych.northwestern.edu/gentner/papers/Gentner83.2b.pdf): theoretischer Bezug für den Vergleich von Beziehungen und Strukturen statt bloßer Oberflächenähnlichkeit.

Beide Bezüge begründen Architekturfragen. Sie belegen weder die Wirksamkeit von WIRKLICH noch die Richtigkeit einer konkreten Übertragung.

## English

The knowledge navigator connects an everyday question with a possible insight, then asks whether its prerequisites apply. The existing six stages of work remain intact. Case, pattern, disciplinary knowledge and general principle are separate levels of abstraction: **more general does not mean more certain**. Claim type, grounds and review status remain distinct at every level.

The first bilingual pilot uses four editorial draft cards: capacity, observation and interpretation, averages and distribution, and help and self-determination. The first three address formal relationships; the fourth is a normative principle that explicitly includes lasting care. Limited browser-local keyword matching suggests candidates; people can also select a card directly. It is not AI pattern recognition. The question text never automatically confirms a prerequisite.

The public `/knowledge/connections.json` export contains the editorial draft collection (`schema_version: 1`), not personal entries. The help card's `sourceClaim` points to G-005 v2 as provenance; it does not confer a new review status on either record.

Each prerequisite can be answered yes, no or unknown. Unknown conditions require more context; a failed condition blocks that transfer; all conditions confirmed by the user allow only a conditional conclusion. The software has not verified those confirmations. Neither a successful match nor publication upgrades a card or the existing claim register to independent review.

A failed prerequisite on the help card does not justify withholding necessary care. It only blocks that particular transfer and leaves the need for appropriate support and clarification open.

A voluntary reflection note separates goals, observations, interpretations, feelings, wishes or fears, action, expected and observed outcomes, and reasons for revision. The navigator does not send or automatically save entries. TXT export requires a deliberate action. There is no overall score for a person and no automatic public contribution.

A future knowledge graph would make each connection a versioned object with typed relations, source and target revisions, grounds, applicability conditions, counterexamples, review decisions and dependencies. Changed premises would trigger re-examination of dependent connections. AI might search across the tree and suggest such connections; it must not invent confirmed premises or promote its own review status. This service and automated dependency tracking are not implemented in the pilot. No model API or automated research is invoked.

Feedback can challenge general insights, but a reported outcome is a lead for examination, not automatically a causal or general efficacy claim. The proposed evaluation compares ordinary search with the curated navigator, and later with a separate AI condition. Near-identical case pairs with one changed prerequisite test transfer sensitivity. False transfers, missed useful connections, justified abstention, useful questions, comprehension, time and costs are evaluated separately. Source access, time budgets, order effects and assessor blinding should be addressed. Different language and educational backgrounds must be represented before claiming broad accessibility. No comparative trial, preregistration or effectiveness result is reported here.
