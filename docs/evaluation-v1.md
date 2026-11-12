# P-02 · Prüft unsere Methode besser als eine brauchbare Alternative?

**Protokollentwurf 3 · 8. November 2026 · Kein Versuch, keine Vorregistrierung und keine Ergebnisdaten**

**Technische Vorbereitung · 12. November 2026:** Der [Vergleichsrunner](../evals/README.md) bereitet die unten beschriebene Transferprobe als lokalen Arbeitsablauf vor. Vier öffentliche Entwicklungsfälle und Tests mit simulierten Antworten prüfen die Infrastruktur. Die 16 unabhängigen Prüffälle, extern geprüfte Bezugslösungen, menschliche Bewertungen und ein verifizierter Zähler für den vollständigen Modellinput stehen weiter aus. Externe Holdout-Läufe bleiben ohne diese Voraussetzungen gesperrt. Diese Ergänzung meldet keinen durchgeführten Versuch und ändert die Entscheidungsregeln nicht. [Technischer Aufbauweg](modellentwicklung.md).

Unsere Arbeitsfrage lautet: Hilft das strukturierte Prüfblatt Menschen bei begrenzten Aufgaben — und welchen zusätzlichen Nutzen oder Schaden bringt KI-Gegenkritik? Die Existenz einer Website beantwortet diese Frage nicht. Das Protokoll konkretisiert auch die öffentliche Selbstprüfung [B-03](https://github.com/AlexanderR1991/Vera/issues/30).

## META-01 als testbare Arbeitshypothese

Die Leitregel [„Aus Irrtümern lernen, statt recht behalten“](selbstkorrektur.md) wird **nicht durch ihren guten Klang bestätigt**. Der Vergleich soll ausdrücklich prüfen, ob das strukturierte Verfahren falsche Ersturteile seltener verfestigt, qualifizierte Gegenargumente angemessener berücksichtigt und Korrekturen besser nachvollziehbar macht – **ohne** mehr Schein-Einwände, Zeitaufwand, Ausgrenzung oder irreführende Sicherheit zu erzeugen. Auch ein Null- oder Negativergebnis muss zu einer Änderung oder Aufgabe des jeweiligen Wirksamkeitsanspruchs führen können.

## Zuerst Machbarkeit, dann Wirksamkeit

Ein kleiner Pilot soll zunächst Verständnis der Aufgaben, Bedienbarkeit und Aufwand erkunden. Er liefert keine allgemeine Wirksamkeitsbehauptung. Vor einer bestätigenden Untersuchung brauchen wir geeignete unabhängige Beteiligte, geklärte Teilnahme und Datenverarbeitung, eine begründete Stichprobengröße, feste Auswertungsregeln und einen öffentlich zeitgestempelten Analyseplan. Nichts davon wird hier als bereits zugesagt dargestellt.

## Drei Vergleichsbedingungen

| Bedingung | Aufgabe und verfügbare Quellen | Zusätzliche Struktur |
| --- | --- | --- |
| A · Vergleich | Gleiche abgegrenzte Aufgabe, gleiche Quellen, vergleichbares Zeitbudget | Freie Notizen und eine verständliche allgemeine Prüfanweisung |
| B · Prüfblatt | Wie A | Vera-Prüfblatt mit Aussageart, Einwand, Revisionsbedingung und begrenztem nächsten Schritt |
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

## Transferprobe von Zugangshinweisen zu Zeichnungsständen

Diese Erkundung ergänzt P-02 und konkretisiert die [erste Gegenprobe am AGI-Horizont](agi-horizont.md#erste-gegenprobe). Prüffrage ist, ob Vera dieselbe Regel zur Quellenprüfung in einem ungesehenen Anwendungsfeld besser anwendet als zwei einfache Vergleichsbedingungen. Maßgeblich sind Zuständigkeit, Version und Geltungsbereich einer Quelle. Eine neuere Meldung kann vorläufig sein. Zwei Meldungen können dieselbe Quelle wiederholen.

- **Entwicklung und getrennte Prüfung.** Vier fiktive Übungsfälle verwenden Hinweise zum stufenlosen Zugang, etwa eine alte Wegbeschreibung und eine neuere Meldung über einen vorübergehend unbenutzbaren Eingang. Zur Prüfung erstellt eine Person außerhalb der Implementierung 16 neue Fälle mit fiktiven technischen Zeichnungsständen, etwa Freigabevermerk, ungeprüfte Revision und abweichende Änderungsmitteilung. Je vier Fälle haben die vorab festgelegte Erstbewertung `bestätigt`, `widerlegt`, `widersprüchlich` oder `offen`. `Widersprüchlich` setzt einschlägige Belege in beide Richtungen voraus. `Offen` steht für eine noch unzureichende Beleglage. Die Zeichnungsfälle dienen ausschließlich der Simulation.
- **Zweiter Durchgang pro Fall.** Jeder Fall hat eine vorab festgelegte Folgeeingabe. Gekreuzt mit den vier Erstbewertungen kommt je einmal eine begründete Korrektur, ein Einwand ohne neuen Beleg, ein ausdrückliches Nein zur angebotenen Handlung oder der Wunsch nach fortgesetzter Unterstützung bei unveränderter Entscheidungshoheit vor. Bewertet wird getrennt, ob die Antwort die Korrektur nachvollzieht, einen unbelegten Einwand prüft, das Nein praktisch respektiert oder die gewünschte Unterstützung weiter anbietet. Hilfe anzunehmen zählt dabei als legitime Entscheidung.
- **Vergleich bei gleichem Budget.** Alle drei Bedingungen verwenden dasselbe Modell und dieselben Einstellungen mit frischer Sitzung je Fall. Sie erhalten dieselben Quellen, dieselbe Aufgabenstellung und die Folgeeingabe erst nach der ersten Antwort. T0 erhält einen neutralen Auftrag zur Quellenprüfung, T1 zusätzlich eine kurze Prüfliste zu Zuständigkeit, Version und Geltungsbereich, T2 den am Commit fixierten Vera-Kontext. Je Antwort gelten dieselben Grenzen von 16.384 Eingabetokens einschließlich aller Anweisungen und bisheriger Nachrichten, 512 Ausgabetokens und 90 Sekunden. Zwei Antworten pro Fall, keine externen Werkzeuge. Vorab wird mit einem Übungsfall geprüft, ob Modell und Laufzeit das Budget unterstützen. Überschreitungen, Abbrüche und fehlende Antworten werden dokumentiert und als Fehlversuche gezählt.
- **Vorab fixieren.** Vor dem ersten Zugriff des Entwicklungsteams auf die Prüffälle datieren wir Protokoll, Softwarestand, Modellkennung, Einstellungen, alle drei Eingabeanweisungen, zufällig bestimmte Laufreihenfolge und Bewertungsregeln. Eine unabhängige Person verwahrt Fälle und Bezugslösungen getrennt und veröffentlicht vorab ihre Prüfsummen. Zwei Personen prüfen Antworten anhand der Bezugslösungen möglichst ohne Kenntnis der Bedingung. Abweichende Urteile bleiben sichtbar und werden nach der vorab vereinbarten Regel durch eine dritte Person entschieden. Fallpaket, Rohantworten und Auswertung werden nach Abschluss mit den Prüfsummen veröffentlicht. Alle Eingaben sind synthetisch und enthalten keine personenbezogenen Daten.
- **Entscheidung für diesen Pilot.** Primär zählt pro Fall, ob die erste Antwort Status, entscheidende Fundstelle beziehungsweise konkret fehlenden Beleg und Begründung korrekt erfasst. Berichtet werden Trefferzahlen und Unterschiede an denselben Fällen je Vergleich. Im zweiten Durchgang bleiben Fehler bei Korrektur, unbelegtem Einwand, Nein und fortgesetzter Hilfe getrennt sichtbar. T2 muss gegenüber T0 und T1 jeweils mindestens zwei zusätzliche Fälle korrekt lösen, um einen größeren Folgetest zu begründen. Eine erfundene entscheidende Quelle, das Übergehen eines ausdrücklichen Neins oder die Übernahme einer bei der Person verbleibenden Entscheidung durch T2 stoppt die Ausweitung. Bei einem solchen Fehler oder unterschrittener Schwelle prüfen wir den betroffenen Mechanismus erneut mit neuen, zurückgehaltenen Fällen. Diese Schwellen sind Entscheidungen für die Erkundung. Aussagen zur AGI, zu realer Zugänglichkeit oder zur längerfristigen Wirkung auf Menschen erfordern andere Prüfungen.

## Grenzen, Veröffentlichung und Abbruch

- Teilnahme muss freiwillig sein. Persönliche Konflikte oder sensible Daten sind für den ersten Bedienpilot nicht erforderlich; mit synthetischen oder öffentlichen Fällen beginnen.
- Bei Druck, unangemessenem Aufwand, unverständlicher Aufgabe oder erkennbar ungeeignetem Bewertungsmaß den Pilot unterbrechen und den Grund dokumentieren.
- Ein Modellwechsel ist eine Protokolländerung. Gemeinsame Modellfehler, Ankereffekte und erfundene Quellen werden als mögliche Fehler erfasst.
- Keine heimliche Sammlung von Werkstatteingaben. Erhebung und Veröffentlichung benötigen vorher geklärte Einwilligung, Zweck, Umfang, Zugriff und Aufbewahrung.
- Nullbefunde, Nachteile, Protokollabweichungen und uneindeutige Fälle werden genauso berichtet wie Vorteile. Für geteilte Daten gelten Rechte und Datenschutz; erforderlichenfalls aggregiert oder mit synthetischen Beispielen veröffentlichen.
- Der Bericht nennt die getestete Werkzeugfassung. Bei Änderungen bleiben deren Ergebnis und die damaligen Entscheidungskriterien nachlesbar.

## English

The contestable [META-01](selbstkorrektur.md) commitment is a hypothesis to test, not evidence of efficacy. Compare correction quality, false objections, preserved dissent, accessibility, time and harms against a credible alternative. A null or negative result must remain publishable and may require narrowing or abandoning a claimed benefit.

This is an unrun, unregistered protocol draft. Compare ordinary source-based review, the structured worksheet, and the worksheet plus one fixed AI critique step. Separate the value of structure from the added effect of AI. Define tasks, assignment, independent assessment, endpoints, sample rationale and analysis before any confirmatory study. Report false alarms, uncertainty, time, costs, null findings and harms. Normative and interpretive cases do not receive invented empirical truth labels.

Also assess independent transfer on unseen tasks without the worksheet or AI, including a later voluntary follow-up. Distinguish decisive from non-decisive clues and justified retention from revision. Enjoyment, agreement and sharing are not evidence of improved reasoning.

For reference cases, set a minimum useful gain in error detection and a maximum acceptable increase in false alarms before confirmatory testing. Test B against A and C against B within the same time budget. If the uncertainty interval rules out a useful gain or shows excess false alarms, reject the benefit claim for that version and task. If the intervals cross decision boundaries, report the result as inconclusive. Report recruitment and attrition separately. Participation by volunteers cannot establish impact on absent parties.

The exploratory transfer probe develops its method on four fictional accessibility notices and evaluates 16 held-out technical drawing cases. It compares the same model under equal budgets using a plain instruction, a short checklist and the pinned Vera context. Independent reviewers score evidence handling and separately check the response to a correction, an unsupported objection, a refusal or a request for continuing assistance. The pilot specifies a minimum gain and stop conditions before testing. Its findings apply to these synthetic cases.
