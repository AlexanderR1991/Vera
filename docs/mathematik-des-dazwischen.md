# M-02 · Die Mathematik des Dazwischen / Mathematics Between Minds

**Status:** Vera-Forschungsentwurf 0.2, 8. November 2026. **Keine neue bewiesene Theorie menschlichen Miteinanders, keine validierte psychologische Skala, keine empirische Studie, keine unabhängige Begutachtung.** Das Modell operationalisiert ein kleines Teilproblem. [Mathematischer Prüfstand](mathematischer-pruefstand.md) · [Sprachprobe](schnittmengen.md) · [Öffentliche Versuchsanordnung](../public/research/intersubjective-dynamics.v0.json).

> **Die Brücke:** Zwei Menschen müssen nicht dieselbe Überzeugung haben, um einander zutreffend verstehen zu können. Verständigung ist nicht mit Zustimmung gleichzusetzen.

## 1. Drei getrennte Fragen

1. **Erleben (phänomenologisch):** Wie fühlt sich eine Erfahrung für A an? Direkter Zugang liegt bei A. Der Messwert eines Fragebogens bildet das Erleben nicht vollständig ab.
2. **Verstehen (epistemisch/kommunikativ):** Kann B die ausdrücklich formulierte Position von A nach gemeinsam geklärten Fragen zutreffend wiedergeben?
3. **Übereinstimmung (inhaltlich):** In welchem Maß stimmen die Positionen von A und B bei denselben Fragen überein?

*Inter-Subjektive Dynamik* (Arbeitstitel) untersucht **zeitliche Veränderung** der zweiten und dritten Größe und ihre Beziehung zu freiwilliger Konfliktbearbeitung. „Mathematik des Dazwischen“ ist unser **Projektname für ein Forschungsprogramm**, kein Anspruch, eine neue mathematische Disziplin oder einen bereits bewiesenen Naturgesetzkomplex gefunden zu haben.

## 2. Minimalmodell M-02

Zwei Personen A und B antworten auf **dieselben vorher festgelegten Fragen** `j=1,…,m` auf einer vereinbarten Skala `0,1,2,3,4`:

- `a_j`: A formuliert die eigene Position.
- `b_j`: B formuliert die eigene Position.
- `hat(a)_{B,j}`: B schätzt nach aktivem Nachfragen, was A selbst antworten würde.
- `hat(b)_{A,j}`: A schätzt, was B selbst antworten würde.

Der **normierte Abweichungswert** für zwei Antwortreihen `x,y` ist:

```text
d(x,y) = (1/(4m)) · Σ[j=1..m] |x_j - y_j|
```

*In Worten:* Wir addieren die absoluten Antwortunterschiede auf allen gleich gewichteten Fragen und teilen durch viermal die Zahl der Fragen. Bei diesen vereinbarten Zahlen liegt der Wert zwischen 0 (identisch) und 1 (maximal auseinander). **Die Gleichgewichtung und gleiche Abstände der Antwortstufen sind Modellannahmen**, keine Eigenschaften subjektiven Erlebens.

Damit definieren wir:

```text
V(B→A) = 1 - d(a, hat(a)_B)   // Genauigkeit von Bs Wiedergabe von A
V(A→B) = 1 - d(b, hat(b)_A)   // Genauigkeit von As Wiedergabe von B
K(A,B) = 1 - d(a,b)          // inhaltliche Übereinstimmung
```

*In Worten:* **V** ist die Antwortgenauigkeit in einer konkreten Richtung, **K** die Nähe der formulierten Positionen. Es sind **operationale Kennwerte für definierte Fragen**, kein Maß für Persönlichkeit, moralischen Wert, Empathie, Sicherheit oder unvermitteltes subjektives Erleben.

Wir berichten `V(B→A)` und `V(A→B)` **getrennt**, damit eine hohe durchschnittliche Zahl die fehlende Gegenseitigkeit nicht verdeckt. `min(V(B→A), V(A→B))` kann ergänzend als konservativer Indikator verwendet werden; auch das ist eine gewählte Definition.

### Satz M-02.1 · Keine logische Gleichsetzung (innerhalb des Modells)

**Behauptung:** `V=1` erzwingt nicht `K=1`, und `K=1` erzwingt nicht `V=1`.

**Konstruktive Beispiele (`m=1`):**

| A | B | B schätzt A | A schätzt B | V(B→A) | V(A→B) | K | Interpretation |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | 4 | 0 | 4 | 1 | 1 | 0 | Vollständig gegensätzlich, genau wiedergegeben |
| 4 | 4 | 0 | 0 | 0 | 0 | 1 | Identische Positionen, aber jeweils falsch wiedergegeben |

**Begründung:** Einsetzen in die Definitionen ergibt die angegebenen Zahlen. Das ist eine elementare modellinterne Folgerung, **kein empirischer Beweis** darüber, wie Menschen tatsächlich miteinander umgehen.

**Gemeinsame Grenzen.** Bei einer einzigen Frage und beiden gerichteten V-Werten gleich null müssen beide eigenen Antworten Randwerte (0 oder 4) sein. Dann ist K entweder 0 oder 1. Der Wert 0,75 ist in dieser Kombination unmöglich.

### Veränderung über ein Gespräch

Bei gleichbleibenden Fragen, Bedeutungen, Antwortkonventionen und Referenzantworten definieren wir `ΔV(B→A) = V_nach(B→A) - V_vor(B→A)` und analog für die Gegenrichtung. In Worten ziehen wir die Treffgenauigkeit vor dem Gespräch von der Treffgenauigkeit danach ab. `ΔK`, die Veränderung der Übereinstimmung, wird getrennt berichtet. Ein positiver `ΔV` kann mit `ΔK=0` zusammenfallen.

**Gegenprobe mit wandernder Referenz.** A und B antworten zuerst jeweils 0 und danach jeweils 4. Beide schätzen das Gegenüber durchgängig auf 4. Die einfache Differenz der Momentaufnahmen ergibt in beiden Richtungen +1, obwohl die Schätzungen gleich geblieben sind. Die Vergleichsfunktion lässt deshalb die betroffene Richtung offen (`null`), sobald sich dort eine Referenzantwort ändert. Wenn nur A die eigene Antwort ändert, bleibt die Richtung A→B auswertbar, sofern Bs Antworten und die Fragen stabil sind. Gleiche Vektorlängen garantieren weder gleiche Fragen noch gleiche Bedeutungen. Wer die Messung durchführt, muss beides vorab absichern.

## 3. Messgrenzen und Gegenmodelle

- **Ordinale Antwortstufen:** `0…4` haben nicht automatisch gleiche psychologische Abstände. Unsere Abstandsfunktion ist nur unter einer expliziten Intervallannahme sinnvoll; alternativ vorab eine kategoriale Trefferquote, paarweise Ordnung oder geeignetes ordinales Maß untersuchen.
- **Selbstbericht ≠ Innerlichkeit:** A kann die eigene Position missverstehen, verbergen, ändern oder nur teilweise verbalisieren. Wir messen Antworten auf festgelegte Fragen, nicht Qualia oder „die wahre Innenwelt“.
- **Zufall und Anpassung:** B kann Antworten erraten, auswendig lernen oder sich für eine gute Zahl anpassen, ohne offen oder wohlwollend zu sein.
- **Macht und Druck:** Zustimmung, als korrekt bestätigte Wiedergabe oder Gesprächsteilnahme unter Drohung ist kein Zeichen gelingender Verständigung. Die Perspektiven von Dritten und die Rechte der Betroffenen bleiben gesondert.
- **Goodhart:** Sobald hohe V-Werte zum Ziel oder zur Belohnung werden, können Aufgaben, Auswahl der Fragen oder Selbstdarstellungen auf den Score optimiert werden. **Kein Ranking von Menschen, kein verpflichtender Verstehensindex, kein Wahrheits- oder Moralurteil aus V oder K.**
- **Mehrdeutigkeit und Sprache:** Gleiche Zahlen können verschiedene Gründe und Empfindungen verbergen. Klärende Textantworten und Beispiele gehen dem quantitativen Vergleich voraus.

Ein nachträglich veränderter Fragekatalog macht Vorher/Nachher-Scores ohne vergleichbare Anker uninterpretierbar. Ergebnisse sollen stets Unsicherheiten und qualitative Einwände neben den Zahlen zeigen.

## 4. Falsifizierbare Hypothese H-M02

> Bei freiwilligen, ausreichend geschützten Gesprächen über definierte Meinungsunterschiede führt **gegenseitiges Wiedergeben mit Korrekturmöglichkeit** im Mittel zu einer stärkeren Verbesserung **beider gerichteter V-Werte** als eine gleich lange, neutral strukturierte Gesprächsbedingung. Eine Änderung von K ist dafür **nicht notwendig**.

**Dies ist eine offene empirische Hypothese.** Sie kann falsch sein. Eine robuste Nullwirkung, ein Vorteil der Kontrollbedingung oder deutliche Nachteile in wichtigen Teilgruppen wären Gründe, sie zu verwerfen oder einzuschränken.

### Pilotdesign (Vorschlag, noch nicht durchgeführt)

1. Unabhängige Ethik- und Sicherheitsprüfung; freiwillige erwachsene Teilnehmende, Einwilligung, Abbruch ohne Nachteil; zunächst alltagsnahe und nicht traumatisierende Streitfragen.
2. Vorab festgelegte Aussagen, Begriffe, Antwortskalen, Ausschlussregeln, Stichprobengröße und primäre Zielgröße. Keine nachträgliche Auswahl günstiger Fragen.
3. Randomisierte Zuweisung: **A** strukturierte Wiederholung mit ausdrücklich erlaubter Korrektur, **B** gleich lange neutrale Diskussion ohne diese Vorgabe. Zeit, Thema und Reihenfolge möglichst ausbalancieren.
4. Vorher/nachher: Jede Person nennt die eigene Position und schätzt die Antwort der anderen; mit stabilen Ankerfragen. Zusätzlich getrennt erheben: subjektives Gefühl des Verstandenwerdens, wahrgenommener Druck, Wohlbefinden, Gesprächsqualität und offene Einwände.
5. Primär: Veränderung in **beiden** gerichteten V-Werten gegenüber Kontrolle, mit Vertrauensintervallen und vorab definiertem statistischem Modell. Lege vorab fest, wie wechselnde Referenzantworten behandelt werden, und berichte ihre Häufigkeit pro Gruppe. Die Gesprächsbedingung kann beeinflussen, wer seine Antwort ändert. Eine Auswertung nur stabiler Fälle könnte dadurch die Vergleichbarkeit der Gruppen verlieren. **Sekundär:** Veränderung von K, Eskalationsindikatoren, Fairness, mögliche Schäden, Abbruch.
6. Auswertung nach dokumentiertem Protokoll, möglichst verblindete qualitative Kodierung; Ergebnisse einschließlich Nullbefunden veröffentlichen. Keine KI-Ratings als alleinige Referenz für subjektives Verständnis.

**Alternative Erklärungen:** zusätzliche Gesprächszeit, Höflichkeit, sozial erwünschte Antworten, Vertrautheit mit der Aufgabenart, bloße Wiederholung, Gruppeneffekte. Diese müssen gegenüber der „Brückenhypothese“ ausdrücklich geprüft werden.

## 5. Warum dies keine neue Mathematik behauptet

Das Projekt benutzt bekannte Werkzeuge: normierte Abstände, dyadische gerichtete Relationen, zeitliche Veränderungen, experimentelle Messung und Modelle sozialer Interaktion. **Neu sein könnte allenfalls die konkrete Kombination, ihre präzise Fragestellung, ihr späterer empirischer Nutzen oder ein noch zu entwickelnder Satz – nicht schon der Name.**

Verwandte Forschung, ohne direkte Bestätigung unseres Modells:

- **Kleiner & Ludwig (2024):** Was es heißt, mathematische Strukturen bewusstem Erleben zuzuordnen, ohne das Erleben durch bloße Symbolik zu ersetzen. [Synthese, DOI 10.1007/s11229-024-04503-4](https://doi.org/10.1007/s11229-024-04503-4).
- **Eyal, Steffel & Epley (2018):** In Experimenten ist bloßes Sich-Hineinversetzen kein verlässlicher Ersatz für zuverlässiges Wissen über andere; die Studie motiviert das **Nachfragen statt Zuschreiben**. [Journal of Personality and Social Psychology, DOI 10.1037/pspa0000115](https://doi.org/10.1037/pspa0000115).
- **Friedkin & Johnsen (1990):** Formalisierung sozialer Einflüsse, Meinungsbildung und Konflikt. Das ist **verwandte mathematische Soziologie**, keine Validierung von V. [Journal of Mathematical Sociology, DOI 10.1080/0022250X.1990.9990069](https://doi.org/10.1080/0022250X.1990.9990069).

## 6. Wie M-02 in Vera eingebettet wird

- **Philosophie:** [Schnittmengen finden](schnittmengen.md) bleibt das freiwillige Gesprächsverfahren, einschließlich offenem Dissens und Schutzgrenzen.
- **Mathematik:** M-02 ist **neben** M-01 im [mathematischen Prüfstand](mathematischer-pruefstand.md) verortet. M-01 betrifft mehrkriterielle moralische Bewertungen, M-02 die Beschreibung von Verstehensgenauigkeit; die Kennzahlen dürfen nicht gleichgesetzt werden.
- **Website:** [Die Brücke / Mathematik des Dazwischen](https://alexanderr1991.github.io/Vera/de/die-bruecke/) illustriert ein **Ein-Frage-Spielzeugmodell**, keine Erhebung realer Personen.
- **Technische Prüfung:** [Rechenfunktionen](../src/lib/intersubjective.mjs) und [Tests](../tests/intersubjective.test.mjs) prüfen Modellgrenzen und die elementaren Zahlenbeispiele.
- **Revision:** Öffentliche Kritik an Definition, Messannahmen, experimentellem Design, Sicherheitsgrenzen oder wissenschaftlicher Abgrenzung kann zum Ändern, Eingrenzen oder Zurückziehen von M-02 führen.

**Forschungsfrage für die nächste Iteration:** Gibt es ein *messinvariantes* Maß für das angemessene Verstehen einer Position, das weniger auf willkürlichen Zahlenabständen und mehr auf gegenseitig bestätigten Bedeutungsunterschieden beruht? Ein Vorschlag muss den Fall „auswendig gelernte, aber nicht verstandene Antwort“ und asymmetrische Machtverhältnisse ausdrücklich bestehen.

---

## English summary (draft / not independently reviewed)

**M-02: Mathematics Between Minds** separates *directed accuracy of restatement* (`V(B→A)`, `V(A→B)`) from *agreement* (`K(A,B)`). Given `m` pre-agreed 0–4 item responses and each participant's estimate of the other's responses, normalized absolute disagreement `d` yields `V=1-d` and `K=1-d` on different input pairs. The elementary counterexamples show that perfect accuracy can coexist with complete disagreement, and agreement can coexist with inaccurate interpretations. This is an **internal implication of the chosen definitions**, not a discovered law of human relationships.

The three scores have joint constraints. With one item, zero accuracy in both directions forces both self-answers to be endpoints, so agreement can only be 0 or 1. Before/after comparison requires identical anchored items and stable reference responses for the direction being scored. If both self-answers move from 0 to 4 while both estimates stay at 4, the snapshot scores rise by 1 in each direction. The comparison instead returns `null` in each affected direction and reports the change in agreement separately.

The **untested empirical hypothesis** is that voluntary, reciprocal restatement with a chance to correct misunderstandings improves *both* directed accuracy measures more than a time-matched neutral conversation. Prespecify how to handle moving reference responses and report their frequency by group. Restricting the analysis to stable responses could compromise comparability if the intervention affects who changes their mind. The website offers a toy demonstration only. No score identifies moral truth, inner experience, dignity or suitability for contact; no valid clinical or social metric is claimed. Research must address ordinal scales, measurement invariance, self-report limits, coercion, Goodhart effects and independent human review. Null results and legitimate dissent remain valid outcomes.
