# Werkstatt: Esoterik und Mathematik / Workshop: esotericism and mathematics

**Arbeitsfassung 0.1 · 2026-11-05 · KI-unterstützt; keine unabhängige fachliche Prüfung.**

Ziel ist, mögliche Verbindungen untersuchbar zu machen. Eine symbolische Tradition kann Fragen liefern; ihre Formalisierung kann innere Struktur oder Widersprüche sichtbar machen. Die Passung zur Wirklichkeit ist eine weitere, empirische Frage. Eine gelungene Codierung beweist weder einen übernatürlichen Mechanismus noch eine Vorhersagefähigkeit.

The aim is to make possible connections examinable. Symbolic traditions may inspire questions; formalisation can expose structure or contradictions. Fit to reality is a further empirical question. A successful encoding establishes neither a supernatural mechanism nor predictive ability. English remains a translation draft.

## Ein Platz im größeren Baum / A place in the wider tree

Diese Werkstatt ist ein einzelner Prüfweg des [offenen Esoterik-Wissensbaums](esoterik-katalog.md) mit 17 Hauptästen und 134 Unterfragen. Die Themen von Tarot über Hermetik bis zur Parapsychologie sind keine bestätigten Befunde. Neue Äste und Gegenmodelle können öffentlich vorgeschlagen und nach menschlicher Prüfung im versionierten Katalog ergänzt werden.

This workshop is one method within the [open esotericism tree](esoterik-katalog.md). Its 17 main branches and 134 subquestions are not validated findings. Further branches and countermodels can be proposed and included after human review.

## Drei Werkzeuge / Three tools

1. **Symbol → Modell:** Bearbeitbares Prüfblatt mit Aussageart, Definitionen, Formel samt Worten, Folgerung/Vorhersage, Gegenmodell, Prüfung, Korrekturbedingung und Quellenlücken. Vorlagen: I Ging, Resonanz als Deutung, hypothetischer Intuitionstest. Export als JSON oder Text. Kein KI-Aufruf und keine automatische Wahrheits- oder Beweisprüfung. / Editable worksheet with explicit claim type, assumptions, predictions, alternatives and revision criteria; JSON/text export. No automatic truth or proof evaluation.
2. **I Ging → Binärraum:** 64 binäre Muster, sechs veränderbare Linien, Vergleichsmuster, Hamming-Abstand und sechs Nachbarn. / 64 binary patterns, six editable lines, a reference state, Hamming distance and six neighbours.
3. **Vorhersage → Zufallsmodell:** Einseitige exakte Binomial-Verteilungssumme für mehr Treffer als unter einem festgelegten Grundmodell erwartet; optionale Bonferroni-Korrektur über die geplante Testfamilie. / Exact upper binomial tail for more hits than the stated baseline expects, with a Bonferroni adjustment across the planned family.

## Formales Modell / Formal model

Für b₁,…,b₆ ∈ {0,1}: ID = Σᵢ₌₁⁶ bᵢ · 2ⁱ⁻¹. Die unterste Linie ist b₁ (Gewicht 1); das sichtbare Binärwort läuft von b₆ bis b₁. Die ID 0–63 ist **keine King-Wen-Nummer**. Sechs freie binäre Stellen ergeben 2⁶ = 64 Muster. Ein Linienwechsel ist ein Bitflip; der Hamming-Abstand zählt verschiedene Linien. Die zweiwertige Codierung enthält keine Deutungen und keine Verteilung eines Münz- oder Schafgarbenverfahrens.

The bottom line is the least significant bit. The displayed word reads from the top line to the bottom. IDs are computational addresses, not King Wen numbers. Hamming distance counts different lines. Casting probabilities and traditional interpretations are not represented.

## Statistik / Statistics

Unter H₀: X ~ Bin(n,p₀). Der Rechner summiert P(X ≥ k) = Σⱼ₌ₖⁿ C(n,j) p₀ʲ(1−p₀)ⁿ⁻ʲ. In Worten: die Wahrscheinlichkeit von mindestens k Treffern in n unabhängigen Versuchen bei gleicher Grundchance p₀. Der p-Wert ist **keine Wahrscheinlichkeit einer Hypothese**. Die Richtung „mehr Treffer“ muss vorab gewählt sein. p_korr = min(1, m·p) ist die Bonferroni-Korrektur für m geplante Tests, kein Mittel gegen nachträgliche Hypothesenwahl, selektive Datenerfassung oder optionales Stoppen.

Inputs: n integer 1–10,000; k integer 0–n; 0 < p₀ < 1; m integer 1–1,000,000. Log-space summation preserves very small tails internally. The UI displays probabilities below 10⁻³⁰⁰ as an upper bound, never as proof or a literal probability of zero. The test is exact in its finite-distribution definition, evaluated with floating-point arithmetic. Default data (15/20, p₀=.5, m=1) are fictional. There is no significance badge or automatic interpretation threshold.

Für einen bestätigenden Versuch fehlen weiterhin ein geeignetes konkretes Studiendesign, eine begründete Fallzahl/Teststärke, unabhängige Dokumentation vor Ergebniszugriff, Kontrollen und Replikation. Ein unauffälliger Test schließt einen kleinen Effekt nicht automatisch aus. Die Werkstatt selbst ist noch nicht auf wissenschaftlichen oder pädagogischen Nutzen evaluiert.

## Daten und Export / Data and export

Alle Berechnungen laufen lokal im Browser; keine Netzaufrufe, keine automatische Speicherung. Ein Neuladen verwirft Eingaben. Exportstatus ist immer `unreviewed_draft`, `registered: false`; die Uhrzeit stammt unbestätigt vom Nutzergerät. Das ist kein manipulationssicheres Register. Formeleingaben sind Text und werden nie ausgeführt. Änderungen verwerfen das alte Ergebnis vor einem erneuten Export bzw. einer Neuberechnung.

Calculations stay in the browser, without network calls or automatic persistence. Reloading discards input. Export is an unreviewed draft with an unverified device timestamp, not a preregistration. User formulas are never evaluated. Changes hide stale outputs until recalculated.

## Quellen / Sources

- [Leibniz an Fontenelle, 7. April 1703, englische Übersetzung](https://www.leibniz-translations.com/fontenelle-slt): historische Primärquelle zur Verbindung von Binärarithmetik und Fuxi-Figuren; keine empirische Bestätigung von Orakeln.
- [NIST: Binomial distribution](https://www.itl.nist.gov/div898/handbook/eda/section3/eda366i.htm): Verteilungsformel und Parameter.
- [NIST: Bonferroni](https://www.itl.nist.gov/div898/handbook/prc/section4/prc473.htm): Bonferroni-Ungleichung als Grundlage der Korrektur.
- [Center for Open Science: Preregistration](https://www.cos.io/initiatives/prereg): unabhängige Vorab-Dokumentation und Unterscheidung von geplanten und explorativen Analysen.

## Prüfung und Grenzen / Review and limits

`node --test tests/symbol-math.test.mjs` prüft alle 64 Zustände, die Bitreihenfolge, Nachbarschaften, explizit enumerierte faire Zufallsversuche, asymmetrische Fälle, sehr kleine Verteilungssummen, ungültige Eingaben und Exportstatus. `npm run build` prüft zusätzlich Routen, Metadaten und Einbindung.

Offene fachliche Prüfung: Verständlichkeit der Trennung von Analogie und Mechanismus; Auswahl der Beispiele; numerische Grenzen; praktische Eignung eines konkreten Studienplans. Neue Brücken dürfen auch an fehlender Operationalisierung oder Gegenbelegen scheitern. Die Entscheidung wird dokumentiert, nicht als persönliches Scheitern behandelt.

Original prose: CC BY-SA 4.0. Original software: MIT. No third-party interpretation text or artwork is reproduced.
