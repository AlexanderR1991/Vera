# Liber Criticae · Der mathematische Prüfstand / The Mathematical Crucible

**Status:** öffentlicher Forschungs- und Widerlegungsaufruf (Entwurf 0.1, 2026-11-05). **Kein mathematisch bewiesenes Ethiksystem, kein begutachtetes Paper und keine institutionelle Kooperation.**

> **Widerlegt uns dort, wo wir präzise werden. Wenn unsere Begriffe keine präzise Aussage tragen, ist das bereits ein Befund.**
>
> **Refute us where our claims become precise. If our concepts cannot support a precise claim, that itself is a finding.**

## 1. Was genau wird angegriffen? / Exact target

**Quelltext:** [Grundtext, These 07](grundtext.md#these-07-1-und-1-bezeichnen-richtungen-nicht-menschen). Der Grundtext beschreibt +1/−1 als *philosophische Heuristik*, ausdrücklich **nicht** als wissenschaftlich validierte Skala. Ebenfalls prüfbar: [These 06](grundtext.md#these-06-erkenne-abweichung-früh-korrigiere-ehrlich-wiederhole) und die [Prüfmethode](methode.md).

Die folgenden Definitionen sind **experimentelle Formalisierungen** der Forschungsfrage. Sie dürfen **nicht** rückwirkend als Inhalt oder Beweis der ursprünglichen These ausgegeben werden.

- **Mathematische Frage:** Welche Aussagen folgen logisch aus klar benannten Axiomen? Gibt es Gegenmodelle oder Unmöglichkeitssätze?
- **Empirische Frage:** Welche beobachtbaren Folgen haben bestimmte Verfahren der Fehlerkorrektur, Kooperation und Konfliktlösung?
- **Normative Frage:** Welche Ziele, Rechte und Prioritäten *sollen* gelten? Mathematik kann die Folgen einer Wertannahme analysieren, sie aber nicht ohne normative Prämissen als moralisch verpflichtend beweisen.

## 2. Erster formaler Angriff: Gibt es immer eine einzige Richtung? / Challenge M-01

Sei \(X\) eine Menge von Handlungsmöglichkeiten. Sei \(g:X\to\mathbb{R}^k\) ein Vektor von **vorher offengelegten und begründeten** Bewertungskriterien; größere Werte bedeuten jeweils *innerhalb dieses Modells* bessere Ausprägung. Die Koordinaten, Skalen, Messfehler und möglichen Rechteverletzungen müssen separat angegeben werden.

Definiere die **schwache Pareto-Dominanz** durch

\[
x\succeq_P y\quad\Longleftrightarrow\quad g_i(x)\geq g_i(y)\text{ für alle }i.
\]

In Worten: **x ist nach diesem Kriterium mindestens so gut wie y, wenn x in keiner betrachteten Dimension schlechter abschneidet.**

**Ein Gegenbeispiel gegen eine automatische vollständige Rangordnung:** Für \(k=2\) seien \(g(A)=(1,0)\) und \(g(B)=(0,1)\). Dann gilt weder \(A\succeq_P B\) noch \(B\succeq_P A\), denn jede Option ist in genau einer Dimension schlechter.

**Ergebnis.** Auf den Kriterienvektoren ist der komponentenweise Vergleich eine partielle Ordnung. Auf den Handlungen ist er im Allgemeinen eine **Präordnung**. Zwei verschiedene Handlungen mit identischen Kriterienwerten schneiden in beiden Vergleichsrichtungen gleich gut ab. Erst wenn wir solche Handlungen zusammenfassen, erhalten wir eine partielle Ordnung auf den so gebildeten Klassen. A und B bleiben im Beispiel unvergleichbar. Ein universeller binärer „+1/−1“-Entscheider folgt **nicht** schon daraus. Das ist ein elementares mathematisches Gegenbeispiel zur *stärkeren* Behauptung, alle Zielkonflikte ließen sich ohne zusätzliche Wertannahmen eindeutig ordnen. Es widerlegt **nicht** die tatsächliche, bewusst heuristische These 07.

Wer dennoch eine vollständige Rangordnung vorschlägt, muss zusätzliche Annahmen offenlegen – etwa Gewichte, Prioritäten, Ausschlussregeln oder ein Verfahren für nicht vergleichbare Optionen – und deren Konsequenzen prüfen lassen.

### Angriffe, die wir ausdrücklich suchen

1. **Axiome:** Welche minimalen, widerspruchsfreien Axiome formalisieren Wahrhaftigkeit, Freiheit, Fürsorge, Würde und Korrigierbarkeit? Sind die Begriffe ausreichend definiert? Ein formales Konsistenzresultat ist nicht gleich empirische Wahrheit.
2. **Gegenmodelle:** Gibt es endliche Fälle, in denen dieselben Handlungen nach plausiblen Bewertungsannahmen entgegengesetzt geordnet werden? Welche Annahme erzeugt die Differenz?
3. **Rechte und Grenzen:** Wann ist eine Handlung unzulässig, selbst wenn eine gewichtete Nutzenfunktion positiv wäre? Solche Nebenbedingungen sind **normative Setzungen**, keine aus einem Algorithmus abgeleiteten Menschenrechte.
4. **Messung und Goodhart-Risiko:** Können beobachtbare Stellvertreter für „Wahrheit“, „Wohl“, „Liebe“ oder „Freiheit“ strategisch verbessert werden, während die eigentliche Zielgröße leidet? Bitte konkrete, reproduzierbare Fälle statt Schlagwörter.
5. **Widerlegung des Korrekturversprechens:** Kann „Erkenne Abweichung früh. Korrigiere ehrlich. Wiederhole.“ bei irreführenden Daten, manipulierten Bewertungen oder falschen Modellen systematisch *schlechtere* Entscheidungen produzieren? Benennt Bedingungen, unter denen Korrektur robust funktioniert – und solche, unter denen sie versagt.
6. **Übertragbarkeit:** Wie stark ändern sich Ergebnisse zwischen Kulturen, Domänen, unterschiedlichen Betroffenengruppen und epistemischen Ausgangslagen? Vermeidet einen angeblich universellen Beweis aus einem ausgewählten Beispiel.

## 3. Einreichungsformat / Reproducible challenge packet

Jeder substanzielle Einwand sollte – soweit einschlägig – enthalten:

```yaml
target: "exact URL + file revision/commit + section"
claim_type: "logical | mathematical | empirical | normative"
claim: "the precisely challenged proposition"
definitions_and_assumptions: "symbols, domains, axioms, scope"
strongest_charitable_reading: "steelman before criticism"
attack: "proof, countermodel, experiment, or independent evidence"
reproduction: "minimal finite example, code, data, or proof steps"
sources: ["primary literature, where relevant"]
limits: "what the attack does and does not establish"
revision_trigger: "what result should force narrowing, withdrawal, or correction"
```

**Für einen formalen Gegenbeweis:** Eine vollständig spezifizierte, prüfbare Gegeninstanz reicht, um eine universelle mathematische Behauptung zu widerlegen. **Für empirische Ergebnisse:** Datenqualität, Studiendesign, Alternativhypothesen und Reproduzierbarkeit prüfen. **Für ethische Konflikte:** Betroffene, Rechte und Wertannahmen offenlegen; kein Wahrheitsstempel durch Mehrheitsvotum oder KI.

Eingang: [Adversarial Challenge Issue](https://github.com/AlexanderR1991/Wirklich/issues/new?template=angriff.yml). Korrekturen gehen als nachvollziehbare Pull Requests ein. Einwände müssen nicht unserem Weltbild entsprechen. Eine Widerlegung wird dokumentiert, nicht verborgen.

## 4. Was als Erfolg zählt / Success conditions

- **Widerlegt / Refuted:** explizite universelle Aussage durch gültiges Gegenbeispiel oder ungültige Ableitung zu Fall gebracht; relevante Textstellen werden korrigiert.
- **Präzisiert / Narrowed:** Geltungsbereich, Begriffe oder Prämissen nach legitimer Kritik geändert.
- **Offen / Unresolved:** unterschiedliche Modelle bleiben unter verfügbaren Daten möglich.
- **Vorläufig tragfähig / Provisionally retained:** ein bestimmter Einwand wurde beantwortet, ohne daraus endgültige Wahrheit abzuleiten.

**Keine Punkte für „abgewehrte Angriffe“. Kein Vertrauen allein aufgrund von Zahl, Eloquenz oder Menge der KI-Einwände.** Fachliche Unabhängigkeit, reproduzierbare Argumente und die Bereitschaft zur öffentlichen Korrektur sind wichtiger.

## 5. Weg zu arXiv, Universitäten und Fachleuten / Route to independent scrutiny

**arXiv ist ein Preprint-Repositorium, keine Gutachterperson und kein Beweis wissenschaftlicher Anerkennung.** Eine spätere arXiv-Einreichung erfordert eine *eigenständige, fachlich passende wissenschaftliche Arbeit* mit Literaturbezug, präzisen Resultaten und Erfüllung der jeweils aktuellen Zulassungs- und Endorsement-Anforderungen ([arXiv endorsement guidance](https://github.com/arXiv/arxiv-docs/blob/develop/source/help/endorsement.md)). Ein Manifest oder eine bloße Einladung gehört nicht automatisch dorthin.

**Harvard und andere Universitäten:** Nicht unterstellen, dass eine Institution beteiligt ist. Erst wenn es einen klaren, nachvollziehbaren Forschungsbeitrag gibt: einzelne thematisch passende Wissenschaftler:innen respektvoll um einen *spezifischen* Gegenbeweis oder eine methodische Einschätzung bitten. Keine Massenanschreiben, keine erfundenen Partnerschaften und keine Behauptung externer Begutachtung.

**Erstes überprüfbares Ziel:** Aus M-01 einen kurzen englischen Fachentwurf mit exakt formuliertem Satz, Beweis, Grenzen, relevanter Literatur und offenem Peer-Kommentar entwickeln. Das bereits bekannte, elementare Beispiel darf **nicht** als neue mathematische Entdeckung ausgegeben werden.

## 6. Bestehende mathematische Gegenkräfte / Relevant prior work

Das Projekt beginnt **nicht bei null**. Gerade Theoreme über unvereinbare Anforderungen sind geeignete Ausgangspunkte. Ihre Voraussetzungen müssen jeweils nachgelesen und dürfen nicht unbesehen auf unseren Kodex übertragen werden.

- **Arrow (Theorem zur Sozialwahl):** Unter spezifischen Bedingungen für die Aggregation individueller Präferenzen – unter anderem uneingeschränkte Domäne, Pareto-Bedingung, Unabhängigkeit irrelevanter Alternativen und Nicht-Diktatur – gibt es keine allgemeine Aggregationsregel, die alle Anforderungen erfüllt. **Prüffrage:** Verlangt unser Modell überhaupt eine Aggregation individueller Rangfolgen? Wenn ja, welche Axiome übernehmen wir und welche nicht? [Stanford Encyclopedia of Philosophy, ausführliche Fassung (2025)](https://plato.stanford.edu/entries/arrows-theorem/).
- **Amartya Sen (1970), „The Impossibility of a Paretian Liberal“:** Ein bestimmter schwacher Begriff individueller Entscheidungsrechte kann mit einem Pareto-Prinzip und weiteren formalen Anforderungen in Konflikt geraten. **Prüffrage:** Unter welchen Annahmen kollidieren die Priorität der Freiheit anderer und aggregierte Wohlfahrt? [Originalartikel, Journal of Political Economy, DOI: 10.1086/259614](https://doi.org/10.1086/259614); [Harvard-Forschungsarchiv](https://dash.harvard.edu/entities/publication/73120378-8203-6bd4-e053-0100007fdf3b).
- **Kleinberg, Mullainathan & Raghavan (2016), „Inherent Trade-Offs in the Fair Determination of Risk Scores“:** Drei mathematisch definierte Fairnessanforderungen können außerhalb eng begrenzter Spezialfälle nicht gleichzeitig erfüllt werden. **Prüffrage:** Welche Eigenschaften unseres vorgeschlagenen Verfahrens könnten in ähnlicher Weise unvereinbar sein? Das Ergebnis bezieht sich auf Risikoscores, nicht unmittelbar auf Moral oder Liebe. [arXiv:1609.05807](https://arxiv.org/abs/1609.05807).

**Redlichkeit:** Keiner dieser bestehenden Sätze widerlegt automatisch den Grundtext. Sie liefern **präzise Prüfmethoden und mögliche Gegenmodelle**. Erst nach Definition unserer tatsächlichen Behauptungen kann man bestimmen, was daraus folgt.

## English précis

We invite mathematicians, logicians, philosophers, statisticians and critical researchers to **disprove or delimit specific claims** of the project. The +1/−1 metaphor is currently a heuristic, not a validated moral metric. Challenge M-01 demonstrates that multi-criterion Pareto dominance can be incomplete: vectors (1,0) and (0,1) are incomparable. Componentwise comparison is a partial order on score vectors. It induces a preorder on actions because distinct actions can have identical scores. A complete ranking needs additional, explicit assumptions. The useful research task is to **define and scrutinize those assumptions**, distinguish mathematical validity from empirical adequacy and ethics, and publish counterexamples and corrections. We have **no claimed affiliation, endorsement or peer review** from arXiv, Harvard or any other research institution.

---

**Die Wirklichkeit steht über diesem Werk. / Reality stands above this work.**
