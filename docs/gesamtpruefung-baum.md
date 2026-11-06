# Der fliegende Baum · Gesamtprüfung und Arbeitsbeginn

**5. November 2026 · KI-unterstützter redaktioneller Entwurf · unabhängige Prüfung ausstehend**

## Nachprüfung am 6. November 2026

Ausgangspunkt dieser Durchsicht ist [der Projektstand nach PR 37](https://github.com/AlexanderR1991/Wirklich/tree/66616c10e3cf08d9a2bbf307dd999084520b9345). Vier Fragen haben das Ergebnis verändert.

| Frage | Befund im Ausgangsstand | Änderung |
| --- | --- | --- |
| Wie erlebt ein neuer Leser die Werkstatt? | Auf Startseite und Unterseiten wiederholten sich Einladungen zu denselben Kapiteln. Auf der Methodenseite standen zwei Projektvorstellungen vor der eigentlichen Überschrift. | Die Startseite bietet ein privates Prüfblatt, eine öffentliche Frage und eine dokumentierte Korrektur an. Die Bibliothek führt die lesbaren Fachkapitel an einem Ort zusammen. |
| Ist erkennbar, wann ein Einwand etwas bewirkt hat? | Der Grundtext würdigte dauerhafte Unterstützung bereits ausdrücklich. G-005 führte diese Präzisierung noch als künftigen Schritt. | [G-005 im Register](../public/knowledge/claims.json) dokumentiert jetzt die Revision und ihren Anlass. Die Methode führt durch die Änderung an These 05. Das Urteil ist normativ, der Reviewstatus bleibt ungeprüft. |
| Was belegt ein erfolgreicher Suchlauf? | Der gespeicherte Forschungsstrom führte fünf Hinweise mit Publikationsdaten nach seinem Abfragetag. | Der Datenstand wurde von 33 auf 28 berichtigt. Der Datumsfilter gilt bei neuen Treffern und übernommenen Einträgen. Ein abrufbarer Treffer bleibt ein Hinweis zur Quellenprüfung. |
| Wo lässt sich die Werkstatt widerlegen? | Der Vergleich des Prüfblatts mit gewöhnlicher Quellenprüfung ist geplant. Es fehlen Ergebnisse und ein unabhängiger Einspruchsweg. | Der [Projektstatus](https://alexanderr1991.github.io/Wirklich/de/projektstatus/) und das [Vergleichsprotokoll](evaluation-v1.md) machen diese Grenze auffindbar. Eine dokumentierte Textkorrektur zeigt die Arbeitsweise an einem Fall. Die Frage nach dem Nutzen bleibt offen. |

Die technische Prüfung umfasst den Produktionsbuild beider Sprachfassungen, die internen Links und Sprungziele, die Softwaretests und Browserprüfungen. Die Fachliteratur der einzelnen Kapitel wurde in dieser Runde nicht vollständig neu begutachtet.

## Gegenstand und Grenze dieser Durchsicht

Ausgangspunkt ist Commit [`0314140`](https://github.com/AlexanderR1991/Wirklich/tree/0314140ebb18c733d8d81e4cb5f133be298e860e). Die Durchsicht betrachtet die Gesamtarchitektur, öffentliche Texte und Sprachfassungen, den strukturierten Registerbestand, Beitragswege, Governance sowie die Recherche- und Kritikprototypen. Sie prüft ihre Verbindungen und sichtbaren Grenzen. Die angeführten Fachstudien wurden dabei **nicht erneut vollständig fachlich begutachtet**. Technische Prüfungen belegen die Funktionsfähigkeit des Entwurfs, nicht die Wahrheit seiner Inhalte.

Zum damaligen Ausgangsstand waren die Vorschläge #18, #22, #25, #26 und #27 offen. Die heutige Themenkarte führt die übernommenen Entwürfe zu Mathematik, Kunst und Esoterik auf. Der [mathematische Prüfstand](mathematischer-pruefstand.md) enthält das Gegenbeispiel M-01.

## Das Bild

Ein Baum will vorwärts fliegen. Seine nach unten verzweigten Äste nehmen menschliche Stimmen, Philosophie, wissenschaftliche Arbeit, Kunst, Erfahrung und Gegenfragen auf. Was sich verbinden lässt, wird über gemeinsame Arbeitsebenen zusammengeführt. Was einander widerspricht, darf verbunden **und weiterhin widersprüchlich** bleiben.

Die ganze Menschheit ist der offene Horizont dieses Projekts. Der gegenwärtige Bestand ist eine kleine Auswahl; er repräsentiert sie nicht. Niemand muss seine Tradition, Erfahrung oder Person in einem Rangsystem einordnen lassen, um eine Frage beizutragen.

Der Baum ergänzt das Raumschiff: Das Schiff beschreibt Orientierung, Instrumente und gemeinsame Reise; der Baum beschreibt Vielfalt und Beziehungen. Beide sind Organisationsbilder und bleiben ersetzbar.

## Zwei unabhängige Ordnungen

| Ordnung | Aufgabe | Grenze |
| --- | --- | --- |
| Themen und Atlasfelder | Inhalte auffindbar und Berührungspunkte sichtbar machen | Mehrfachzuordnung zulassen; sechs Felder bilden keine vollständige Ontologie |
| Arbeitsebenen | Von Stimmen und Fragen zu begründeten Verbindungen und begrenztem Handeln gelangen | Keine Leiter, auf der eine Metapher zu einem empirischen Beweis aufsteigt |

Die sechs Arbeitsebenen sind:

1. **Menschen und Stimmen:** Erfahrungen, Philosophien, Traditionen, Werke und Quellen; Herkunft und fehlende Perspektiven benennen.
2. **Themen und Fragen:** Begriffe, Kontext und mehrere passende Äste festhalten.
3. **Aussagen und Voraussetzungen:** Aussageart, Begründungslage und Prüfstatus getrennt erfassen.
4. **Passende Prüfung:** Quellen, Ableitungen, normative Gründe oder Gegenlesarten prüfen; eigene Revisionsbedingungen angeben.
5. **Zusammenhänge und Dissens:** Stützung, Widerspruch, Einschränkung, Voraussetzung und alternative Deutung mit Gründen verbinden.
6. **Handeln und Rückkopplung:** Verantwortliche, Folgen und Abbruchbedingungen nennen; Ergebnisse können jede frühere Ebene verändern.

Diese Ebenen ergänzen die fünf bisherigen **Zugänge der Website** aus der Architektur. Website-Navigation und Arbeitsverfahren beschreiben unterschiedliche Dinge.

## Befunde über das Ganze

| Bereich | Befund im Ausgangsstand | Konsequenz dieser Arbeit |
| --- | --- | --- |
| Mission und Raumschiff | Gemeinsame Werte, Instrumente und Grenzen sind benannt | Baum als ergänzende Themen- und Arbeitsordnung anbinden |
| Atlas | Sechs Einstiege, einzelne Themen überschneiden sich | 22 Themen mit Mehrfachzuordnung und sichtbaren Ausarbeitungslücken aufnehmen |
| Bibliothek und Fachkapitel | Erkenntnis, Liebe, Politik, Religion, Militär und Ernährung sind lesbar | Bestehende Entwürfe verknüpfen; Publikation eines Kapitels bleibt von geprüften Einzelaussagen verschieden |
| Mathematik, Kunst, Esoterik und Konflikte | Weiterführende Entwürfe liegen in eigenen Pull Requests | Im Bestandsbild mit tatsächlichen Vorschlagslinks aufführen |
| Philosophie | Begriffe, Voraussetzungen und normative Fragen betreffen alle Felder | Philosophie an jedem Ast zulassen; keine Pflicht zur Übersetzung jeder Deutung in einen Messwert |
| Grundtext, These 05 | Register G-005 nennt dauerhaften Hilfebedarf; Kurztexte lassen diese Grenze unausgesprochen | Einschränkung ausdrücklich in Grundtext, Manifest und Prüfstand übernehmen |
| Grundtext, These 09 | Deutsch sagt „bessere Menschen“, Englisch bereits „other people“ | Deutsch zu „andere Menschen“ ändern; keine Menschenrangordnung nahelegen |
| Methode und Register | Aussageart, Begründung und Prüfung sind getrennt; drei Einträge ausdrücklich ungeprüft | Trennung in allen Baumebenen beibehalten; keinen Eintrag durch Selbstkritik zu „reviewed“ hochstufen |
| Wissensverbindungen | Eine Beziehung zwischen Aussagen braucht selbst eine Begründung | Beziehungstypen erklären; das Schulverpflegungsbeispiel als Gedankenbeispiel kennzeichnen |
| Recherche und Angriffsschwarm | Im gelesenen Ausgangsstand sind beide öffentlichen Ergebnislisten leer | Keine erfolgreichen Forschungsläufe oder unabhängigen Gutachten behaupten |
| KI-Prompt und KI-001 | Nutzen ist ausdrücklich nicht gemessen | Einen fairen Vergleich mit einfacher Quellenprüfung konkretisieren |
| Verantwortung und Finanzierung | Werte und Interessenkonflikte sind benannt; unabhängige Redaktion/Einspruchsprüfung fehlen | Vorläufigen Einspruchsweg dokumentieren und fehlende Unabhängigkeit sichtbar lassen |
| Zugang und Mitwirkung | DE/EN und GitHub ermöglichen Beiträge, erfassen aber nicht alle Stimmen | Lücken als Frage führen; Auffindbarkeit und Verständnis tatsächlich mit Lesern prüfen |
| Lizenz und private Inhalte | Öffentliche Projekttexte und Code haben getrennte Lizenzregeln; private Inhalte bleiben ausgenommen | Nur öffentliche Projektinhalte und neue Arbeitsentwürfe verwenden |

## Öffentliche Selbstangriffe

Die folgenden Threads wurden im Auftrag des Projektinhabers als **öffentliche Issues** angelegt. GitHub Discussions war lesbar, jedoch in der verfügbaren Browser-Sitzung nicht angemeldet. Die Issues sind konkrete Prüf- und Arbeitsfäden. Es wurden keine Beiträge in fremden Gemeinschaften platziert und keine unabhängigen Beteiligten vorgetäuscht.

| Thread | Unangenehme Fragen | Noch offene Prüfung |
| --- | --- | --- |
| [B-01 · Wer fehlt im Baum?](https://github.com/AlexanderR1991/Wirklich/issues/28) | Wer fehlt? Darf eine Philosophie unseren Werten widersprechen? Darf Dissens bleiben? Wer darf die Ordnung ersetzen? | Begrenzte Leserfragen vorab auswählen; Auffindbarkeit, Fehlzuordnung und fairen Umgang mit Fremdpositionen untersuchen |
| [B-02 · Wessen Werte und Entscheidungen?](https://github.com/AlexanderR1991/Wirklich/issues/29) | Ist dauerhafte Fürsorge gleich wertvoll? Warum unsere Werte? Wer prüft den Gründer? Wann wird Moderation zur Abwehr von Kritik? | Interessenkonflikte dokumentieren und eine unabhängige Zuständigkeit für Einsprüche klären. Die Textkorrekturen an These 05 und 09 sind veröffentlicht. |
| [B-03 · Hilft unser Verfahren?](https://github.com/AlexanderR1991/Wirklich/issues/30) | Besser als einfache Quellenprüfung? Wer findet gemeinsame KI-Fehler? Wann begrenzen wir KI? Zählen Korrekturen oder nur Texte? | Vorab beschriebenen Vergleich mit unabhängiger Bewertung durchführen |

Jeder Thread enthält Ausgangsstellen mit fixierter Revision, eine wohlwollende Lesart, den stärksten Einwand, vorläufige Einordnung und Bedingungen, unter denen die Kritik selbst revidiert würde. B-03 greift eine **offene** Hypothese an und behauptet nicht, das Werk habe bereits eine bewiesene Wirksamkeit reklamiert.

## Erste redaktionelle Korrekturen

**These 05, Zusatz zur bisherigen Erklärung:**

> Auch dauerhafte Unterstützung ist wertvoll. Würde und Fürsorge dürfen nicht von erreichbarer Selbstständigkeit abhängen.

Dies macht eine im Register G-005 bereits benannte Grenze auch im kurzen Grundtext sichtbar. Es ist eine normative Präzisierung, kein neu ermittelter empirischer Befund.

**These 09:** Die Redaktion ersetzte „bessere Menschen“ durch „andere Menschen“. Die englische Fassung nannte bereits „other people“.

Die Änderungen an Grundtext, Manifest, Prüfstand und Übersetzungszuordnung wurden am 5. November 2026 veröffentlicht. Der [Änderungsvergleich in PR #31](https://github.com/AlexanderR1991/Wirklich/pull/31/files) zeigt beide Textkorrekturen. Eine unabhängige Fachprüfung steht aus.

## Nächste Arbeit und mögliche Widerlegung

1. **Ein kleiner Bestand:** Zehn klar begrenzte Aussagen statt einer bloßen Themenquote. Quellen oder Voraussetzungen, Gegenargumente, Umfang, Unklarheiten und verantwortete Entscheidungen erfassen. Die drei Demonstrationseinträge werden dadurch nicht rückwirkend geprüft.
2. **Eine echte Verbindung:** Einen begrenzten Fall wie Schulverpflegung durch Ernährung, Zugang, Kultur, Kosten und Entscheidung verfolgen. Empirische Fragen und Wertkonflikte getrennt bearbeiten; kein Ergebnis vorwegnehmen.
3. **Ein Vergleich:** Aufgaben, Quellenzugang, Zeitbudget, Zuteilung und Bewertungsregeln vorab festlegen. Empirische/formale Fehler anders bewerten als die Begründungsqualität normativer oder interpretativer Antworten. Bedingungslabels bei der Bewertung ausblenden; Lerneffekte berücksichtigen.
4. **Getrennte Ergebnisse:** Fehlererkennung, Fehlalarme, Verständnis von Unsicherheit, Zeit, Kosten und nicht entscheidbare Fälle separat berichten. Keine allgemeine Wahrheits- oder Menschenpunktzahl erzeugen.
5. **Ein tatsächlicher Einspruch:** Zuständigkeit und Interessenkonflikt dokumentieren. Unabhängigkeit erst behaupten, wenn eine tatsächlich unabhängige Person zugesagt und geprüft hat.

Wiederkehrende Fehlzuordnung kann die Baumstruktur zur Revision zwingen. Verlust einer wesentlichen Fremdperspektive kann eine behauptete Synthese unhaltbar machen. Fehlender Nutzen oder überwiegende neue Fehler sprechen gegen eine Ausweitung der KI-Unterstützung. Ein kleiner Pilot liefert zunächst Grenzen für den nächsten Schritt; er beweist keine universelle Leistungsfähigkeit.

**Es gibt bisher keinen durchgeführten Vergleich, keine Vorregistrierung und keine neue unabhängige Begutachtung.** Diese Runde lieferte eine Gesamtansicht, öffentliche Prüffragen, zwei veröffentlichte Textkorrekturen und Aufgaben für die nächste Prüfung.

## Umsetzung

- Zweisprachige Gesamtansicht: `/de/baum-des-wissens/` und `/en/baum-des-wissens/`.
- Themen und Mehrfachzuordnungen: `src/lib/tree.mjs`.
- Vollständige Themenliste ohne JavaScript lesbar; Suche und kombinierbare Filter ergänzen sie im Browser.
- Einstieg auf Startseite, Atlas, Bibliothek, Methode, Prüfstand, Mitwirkenseite, Mission und im gemeinsamen Footer.
- Vorhandene Fachkapitel und offene PRs bleiben mit ihren tatsächlichen Arbeitsständen verbunden.

## English

The flying tree complements the spacecraft metaphor. Downward branches gather human voices, philosophy, disciplinary knowledge, art and objections; six stages of work connect them without ranking people or merging distinct kinds of justification. The topic map contains 22 overlapping branches and marks working drafts, proposals and gaps.

The review led to two edits published on 5 November 2026. Thesis 05 explicitly recognizes the value of lasting support. In Thesis 09 the German wording changed from “better people” to “other people.” Public issues B-01–B-03 examine representation, editorial responsibility and the usefulness of AI-generated criticism. Independent review and a comparison of the method with ordinary source checking are still pending.
