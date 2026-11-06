# P-02 · Prüft unsere Methode besser als eine brauchbare Alternative?

**Protokollentwurf 2 · 6. November 2026 · Kein Versuch, keine Vorregistrierung und keine Ergebnisdaten**

Unsere Arbeitsfrage lautet: Hilft das strukturierte Prüfblatt Menschen bei begrenzten Aufgaben — und welchen zusätzlichen Nutzen oder Schaden bringt KI-Gegenkritik? Die Existenz einer Website beantwortet diese Frage nicht. Das Protokoll konkretisiert auch die öffentliche Selbstprüfung [B-03](https://github.com/AlexanderR1991/Wirklich/issues/30).

## Zuerst Machbarkeit, dann Wirksamkeit

Ein kleiner Pilot soll zunächst Verständnis der Aufgaben, Bedienbarkeit und Aufwand erkunden. Er liefert keine allgemeine Wirksamkeitsbehauptung. Vor einer bestätigenden Untersuchung brauchen wir geeignete unabhängige Beteiligte, geklärte Teilnahme und Datenverarbeitung, eine begründete Stichprobengröße, feste Auswertungsregeln und einen öffentlich zeitgestempelten Analyseplan. Nichts davon wird hier als bereits zugesagt dargestellt.

## Drei Vergleichsbedingungen

| Bedingung | Aufgabe und verfügbare Quellen | Zusätzliche Struktur |
| --- | --- | --- |
| A · Vergleich | Gleiche abgegrenzte Aufgabe, gleiche Quellen, vergleichbares Zeitbudget | Freie Notizen und eine verständliche allgemeine Prüfanweisung |
| B · Prüfblatt | Wie A | WIRKLICH-Prüfblatt mit Aussageart, Einwand, Revisionsbedingung und begrenztem nächsten Schritt |
| C · Prüfblatt und KI | Wie B | Ein vorab fixierter KI-Kritikschritt; Modellversion, Prompt, Einstellungen, Ausgaben, Fehler und Kosten dokumentiert |

B gegen A untersucht den Nutzen der Struktur. C gegen B untersucht den zusätzlichen KI-Schritt. Ein Vergleich nur zwischen C und einer absichtlich schwachen Alternative wäre nicht aussagekräftig für diese beiden Fragen.

## Aufgaben und Bezugspunkte

- Ein vorab festgelegter Aufgabenbestand enthält begrenzte empirische, formale und normative Fälle sowie Interpretationen und Metaphern. Ergebnisse werden nach Aussageart getrennt berichtet.
- Jede Aufgabe nennt Begriffe, Geltungsbereich und zugängliche Ausgangsquellen. Quellen werden tatsächlich gelesen, nicht nur anhand ihrer Metadaten ausgewählt.
- Bei empirischen oder formalen Fehlern müssen Bezugslösung, Fehlerstelle und Begründung durch fachkundige Menschen geprüft werden. Bei Uneinigkeit bleibt die Bezugslösung als strittig markiert.
- Bei Werten und Deutungen gibt es kein erfundenes objektives Wahrheitsetikett. Bewertet werden unter anderem offengelegte Prämissen, ernst genommene Perspektiven, Konsistenz und erkannte Grenzen anhand vorher formulierter Kriterien.
- Übungsfälle und spätere Auswertungsfälle bleiben getrennt. Der Aufgabenbestand darf nicht nach einem günstigen Ergebnis nachträglich ausgewählt werden.

## Zuteilung und Bewertung

Die endgültige Zuteilung, Reihenfolge und Auswertung werden vor dem Versuch festgelegt. Ein mögliches Pilotdesign verteilt vergleichbare Aufgaben auf die Bedingungen und gleicht die Reihenfolge aus; dieselbe Person bearbeitet denselben Fall nicht erneut. Vorwissen und Reihenfolge werden erfasst. Ein Pilot kann zeigen, dass diese Zuteilung geändert werden muss; das wird vor einem späteren bestätigenden Vergleich dokumentiert.

Auswertende Personen sollen die Bedingung möglichst nicht kennen. Entfernbare Hinweise auf die Oberfläche werden aus den Bewertungsunterlagen entfernt; verbleibende Erkennbarkeit und ihre Grenzen werden berichtet. Verfasser, Betreiber und KI-Rollen gelten nicht als voneinander unabhängige Fachgutachter. Strittige Bewertungen werden nicht durch einfache Modellabstimmung zu Gewissheit gemacht.

## Getrennte Ergebnisse statt einer Universalzahl

| Frage | Erfassung vorab bestimmen | Interpretation |
| --- | --- | --- |
| Werden tatsächliche Fehler erkannt? | Korrekt erkannte Fehler bezogen auf die prüfbar festgelegten Fehlerfälle | Mehr erkannte Fehler helfen nur zusammen mit einer Betrachtung der Fehlalarme. |
| Werden richtige Aussagen fälschlich beanstandet? | Unberechtigte Beanstandungen bezogen auf die prüfbar fehlerfreien Fälle | Eine große Menge Kritik kann auch schaden. |
| Werden Aussageart und Unsicherheit verstanden? | Aufgaben zu Werturteil, Befund, Beweis, Deutung und Status | Sprachgewandtheit allein zählt nicht als Verständnis. |
| Sind Gründe und Korrekturen nachvollziehbar? | Vorab erklärte Beurteilungskriterien, Bewertungen und verbleibender Dissens | Die Qualität normativer Gründe ist keine empirisch bewiesene Moral. |
| Was kostet die Arbeit? | Zeit, Abbrüche, wahrgenommene Belastung, gegebenenfalls tatsächliche API-Kosten | Ein Vorteil muss gegen Aufwand und Zugänglichkeit betrachtet werden. |

## Entscheidungsregeln

Für Aufgaben mit einer unabhängig geprüften Bezugslösung lautet die begrenzte Hypothese: Im gleichen Zeitbudget finden Menschen mit dem Prüfblatt (B) gegenüber der Quellenprüfung (A) einen praktisch bedeutsam größeren Anteil der vorhandenen Fehler, bei vertretbarer Fehlalarmquote. Für die zusätzliche KI-Kritik gilt dieselbe Frage im Vergleich C gegen B.

Vor der ersten bestätigenden Aufgabe veröffentlichen wir die Mindestverbesserung, die noch einen Einsatz rechtfertigt, und den maximal vertretbaren Anstieg der Fehlalarmquote. Beide Grenzen sind mit Blick auf den Anwendungsfall zu begründen. Zeitbudget, Aufgaben, Stichprobenumfang, Umgang mit Abbrüchen und Unsicherheitsintervalle für beide Vergleiche werden vorab festgelegt. Solange diese Festlegungen fehlen, bleibt das Vorhaben im Entwurfsstadium.

| Befund bei der untersuchten Fassung | Entscheidung |
| --- | --- |
| Die Untergrenze des Unsicherheitsintervalls für die Verbesserung erreicht oder übersteigt die Mindestverbesserung. Die Obergrenze für zusätzliche Fehlalarme liegt höchstens beim festgelegten Maximum. | Den Vorteil für diese Aufgaben berichten. Die Reichweite endet bei den untersuchten Personen und Bedingungen. |
| Selbst die Obergrenze der Verbesserung unterschreitet die Mindestverbesserung, oder schon die Untergrenze des Fehlalarmanstiegs überschreitet die zulässige Grenze. | Den behaupteten praktischen Vorteil für diese Fassung und Aufgabe verwerfen. Bei B betrifft dies das Prüfblatt, bei C die Ergänzung durch KI. Den betroffenen Schritt vor einer Ausweitung vereinfachen, weglassen oder mit einer neuen Fassung erneut prüfen. |
| Alle übrigen Fälle, einschließlich unzureichender Daten. | Ergebnis offen berichten. Ein zusätzlicher Versuch braucht vorab einen eigenen Plan. |

Bei Wertfragen und Deutungen untersuchen wir gesondert, ob Gründe, betroffene Perspektiven und Dissens nachvollziehbar erhalten bleiben. Einigung ist dort kein Endpunkt der Untersuchung. Auch Reichweite hat einen eigenen Maßstab. Für freiwillige Pilotrunden die Rekrutierungswege, soweit ohne private Angaben möglich die Zahl der Eingeladenen, Teilnahmen und Abbrüche berichten. Wer nur freiwillig Teilnehmende untersucht, kann daraus keine Wirkung auf fernbleibende Konfliktparteien ableiten.

## Selbstständigkeit und Übertragung getrennt prüfen

Ein unmittelbar besseres Ergebnis mit dem Werkzeug ist kein Nachweis, dass Menschen später selbstständiger urteilen. Deshalb sieht die nächste Protokollfassung zusätzlich neue, zuvor ungesehene Aufgaben ohne Prüfblatt, Autorenhinweis oder KI vor; eine spätere freiwillige Wiederholung prüft die Beständigkeit. Aufgabenabstand, Zuteilung und Bewertung sind vor der Untersuchung festzulegen. Es ist noch kein Termin und keine Teilnahme vereinbart.

Die Aufgaben enthalten entscheidende und nicht entscheidende Hinweise, begründetes Beibehalten sowie ehrliches Offenlassen. Bei Wertkonflikten wird kein Konsens als richtige Lösung verlangt. Übungsaufgaben bleiben von Prüfaufgaben getrennt. Lesesicherheit, Sprachverständnis und technische Unterstützung werden als Nutzungsbedingungen betrachtet, nicht aus Bildungsabschlüssen abgeleitet. Barrieren, Abbrüche und benötigte Hilfe werden neben möglichen Vorteilen berichtet. Persönliche Würde oder Intelligenz erhalten keine Punktzahl.

## Grenzen, Veröffentlichung und Abbruch

- Teilnahme muss freiwillig sein. Persönliche Konflikte oder sensible Daten sind für den ersten Bedienpilot nicht erforderlich; mit synthetischen oder öffentlichen Fällen beginnen.
- Bei Druck, unangemessenem Aufwand, unverständlicher Aufgabe oder erkennbar ungeeignetem Bewertungsmaß den Pilot unterbrechen und den Grund dokumentieren.
- Ein Modellwechsel ist eine Protokolländerung. Gemeinsame Modellfehler, Ankereffekte und erfundene Quellen werden als mögliche Fehler erfasst.
- Keine heimliche Sammlung von Werkstatteingaben. Erhebung und Veröffentlichung benötigen vorher geklärte Einwilligung, Zweck, Umfang, Zugriff und Aufbewahrung.
- Nullbefunde, Nachteile, Protokollabweichungen und uneindeutige Fälle werden genauso berichtet wie Vorteile. Für geteilte Daten gelten Rechte und Datenschutz; erforderlichenfalls aggregiert oder mit synthetischen Beispielen veröffentlichen.
- Der Bericht nennt die getestete Werkzeugfassung. Bei Änderungen bleiben deren Ergebnis und die damaligen Entscheidungskriterien nachlesbar.

## English

This is an unrun, unregistered protocol draft. Compare ordinary source-based review, the structured worksheet, and the worksheet plus one fixed AI critique step. Separate the value of structure from the added effect of AI. Define tasks, assignment, independent assessment, endpoints, sample rationale and analysis before any confirmatory study. Report false alarms, uncertainty, time, costs, null findings and harms. Normative and interpretive cases do not receive invented empirical truth labels.

Also assess independent transfer on unseen tasks without the worksheet or AI, including a later voluntary follow-up. Distinguish decisive from non-decisive clues and justified retention from revision. Enjoyment, agreement and sharing are not evidence of improved reasoning.

For reference cases, set a minimum useful gain in error detection and a maximum acceptable increase in false alarms before confirmatory testing. Test B against A and C against B within the same time budget. If the uncertainty interval rules out a useful gain or shows excess false alarms, reject the benefit claim for that version and task. If the intervals cross decision boundaries, report the result as inconclusive. Report recruitment and attrition separately. Participation by volunteers cannot establish impact on absent parties.
