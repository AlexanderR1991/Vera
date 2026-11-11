# Was muss zuerst feststehen?

**Unbegutachteter Arbeitsentwurf.** Die historischen Belege unten und die heutige logische Rekonstruktion beantworten verschiedene Fragen.

## Wann begann Mathematik?

Wir kennen keinen einzelnen Gründungsakt, ersten Menschen oder nachweislich zuerst beschlossenen mathematischen Satz. Zählen, Vergleichen und Messen entwickelten sich als Praktiken. Erhaltene mesopotamische Verwaltungstafeln belegen Zahlengebrauch: Das Metropolitan Museum beschreibt früheste Tafeln um 3300 v. Chr., die Wirtschaftsangaben mit Bildzeichen und Zahlen festhalten. Die dort konkret ausgestellte Tafel wird auf etwa 3100–2900 v. Chr. datiert. Diese Funde sind erhaltene Zeugnisse, kein Geburtsdatum mathematischen Denkens. [Metropolitan Museum, Objekt und Einordnung](https://www.metmuseum.org/art/collection/search/327385)

Eine viel spätere, systematische Ordnung von Definitionen, Postulaten und bewiesenen Sätzen bieten Euklids *Elemente* um 300 v. Chr. Das ist ein bedeutendes Beispiel axiomatischen Arbeitens, keine Behauptung, erst dort habe Mathematik begonnen. [Clay Mathematics Institute, historisches Archiv](https://www.claymath.org/library/historical/euclid/index.html)

**„Zuerst wurde 1 + 1 = 2 festgelegt“ ist deshalb keine belegte Ursprungsgeschichte.** Die moderne Frage, aus welchen Regeln wir diesen Satz ableiten können, bleibt trotzdem nützlich. Peanos bekannte Veröffentlichung zur Axiomatik der Arithmetik stammt von 1889; auch sie ist eine späte Grundlegung. [Universität Turin, Peano-Chronologie](https://www.asut.unito.it/peano/cronologia.html)

## Noch einfacher als 1 + 1 = 2

Für unser heutiges Beispiel wählen wir natürliche Zahlen mit `0` und einer Nachfolgerfunktion `S`. Wir setzen voraus, dass die folgenden Ausdrücke und Gleichheitsumformungen in diesem System zulässig sind. Dies ist ein kleiner Ausschnitt, keine vollständige Auflistung der Peano-Axiome.

- **D-001 · Definitionen:** `1 := S(0)` und `2 := S(1)`.
- **A-001 · Additionsregeln:** `a + 0 = a` und `a + S(b) = S(a + b)`.

Dann folgt C-001:

```text
1 + 1 = 1 + S(0)       Definition von 1
      = S(1 + 0)       Rekursionsregel der Addition
      = S(1)           a + 0 = a
      = 2              Definition von 2
```

Wir brauchen also schon Bedeutungen für Zeichen, Regeln für Addition und zulässiges Schließen. Ob diese Beschreibung der beste historische, philosophische oder pädagogische Anfang ist, beweist die Rechnung nicht. Zwei Wassertropfen, die verschmelzen, widersprechen der Rechnung nicht: Dort hat sich die gezählte Einheit geändert. Die Verbindung zwischen Modell und Gegenstand muss eigens begründet werden.

## Wo die Erklärung zu „Philosophie = Mathematik“ trägt

Die Erklärung aus dem Gespräch benennt gemeinsame Werkzeuge: Begriffe klären, Voraussetzungen offenlegen, folgerichtig argumentieren und Gegenbeispiele prüfen. Das passt zu Veras [Methode](../../docs/methode.md), [M-01](../../docs/mathematischer-pruefstand.md) und [M-03](../../docs/philosophischer-motor-mathematik.md).

Die Erklärung begründet jedoch keine Identität der Fächer. **C-006 lautet hier enger:** „Philosophie und Mathematik teilen bestimmte Werkzeuge begründeten Denkens.“ Welche philosophischen Fragen sich angemessen formalisieren lassen, ist Gegenstand der Forschung. Es wird nicht vorausgesetzt, dass alles Erleben, jede Deutung und jede Wertfrage auf ein einziges Axiomensystem reduziert werden kann.

### C-007 · Gemeinsamkeit ist kein Identitätsbeweis

**D-004:** Im kleinen Mengenmodell sei `P = {Begriffsarbeit, Wertkritik}` und `M = {Begriffsarbeit, formaler Zahlbeweis}`. Diese erfundenen Mengen sind ein Gegenmodell zum Schlussmuster, keine vollständige Beschreibung der Fächer.

Beide Mengen enthalten Begriffsarbeit. Dennoch enthält P ein Element, das M nicht enthält, und M eines, das P nicht enthält. Also gilt `P ∩ M ≠ ∅` und zugleich `P ≠ M`. Die Schlussregel „Gemeinsame Methode, also identisch“ ist ungültig. Das beweist nicht, dass Philosophie und Mathematik überhaupt keine weiteren Beziehungen haben.

## C-002 · Was folgt aus Fakten allein?

Wir wählen die klassische Aussagenlogik und zwei unabhängig belegbare Aussagenzeichen:

- `p`: Eine Handlung senkt in einem bestimmten Vergleich eine gemessene Belastung.
- `n`: Diese Handlung soll ausgeführt werden.

Die Bedeutungen dienen der Anschauung; formal stehen hier zwei unabhängige Variablen. Für `p = wahr` sind sowohl `n = wahr` als auch `n = falsch` zulässige Belegungen. Damit gibt es ein Gegenmodell mit wahrer Prämisse p und falscher Schlussfolgerung n. Also gilt in diesem System **nicht** `p ⊨ n`.

Eine zusätzliche Brückenprämisse wie `p → n` würde zusammen mit p den Schluss auf n ermöglichen. Ob diese Brücke angemessen ist, braucht eine eigene Begründung: Nebenfolgen, Rechte, Alternativen und betroffene Menschen können dagegen sprechen. Der kleine Beweis ist weder ein neuer philosophischer Durchbruch noch ein Satz über jede denkbare Logik oder jede Theorie normativer Sprache. Er macht eine oft verdeckte Annahme prüfbar.

## Wie Leben in den Raum kommt

Der erste Gegenstand ist ein **Ausschnitt**: eine Frage, ein Kontext, bekannte und unbekannte Bedingungen, mehrere Handlungsmöglichkeiten, ausdrücklich benannte Werte und mögliche Folgen. Beobachtungen, Selbstberichte und Deutungen erhalten getrennte Einträge. Fehlendes bleibt sichtbar. Ein Mensch wird durch keinen Knoten vollständig erfasst.

Im [Mietfall](LEBENSFALL.md) lassen sich Beträge ausrechnen. Welche Verteilung angemessen ist und ob beide sie freiwillig wählen, bleibt davon getrennt. Auch die Auswahl der erfassten Faktoren ist kritisierbar. Eine spätere Erweiterung muss zeigen, welche neue Frage sie besser beantwortet, statt bloß weitere Lebensbereiche einzusammeln.

## English

There is no known single founding event or first agreed mathematical theorem. The [Metropolitan Museum](https://www.metmuseum.org/art/collection/search/327385) describes early Mesopotamian economic tablets using numerals around 3300 BCE; its displayed object is dated about 3100–2900 BCE. These are surviving records, not a birth date. [Euclid's Elements](https://www.claymath.org/library/historical/euclid/index.html), around 300 BCE, provide a much later systematic example of definitions, postulates and proofs. [Peano's 1889 publication](https://www.asut.unito.it/peano/cronologia.html) is later still. We do not claim that humanity began by stipulating `1 + 1 = 2`.

Our modern miniature starts with `1 := S(0)`, `2 := S(1)`, `a + 0 = a` and `a + S(b) = S(a + b)`, under ordinary equality rules. Thus `1 + 1 = S(1 + 0) = S(1) = 2`. This is a restricted formal reconstruction, not the full Peano axiom system or a historical account. Applying arithmetic to merging drops requires stable counting units.

The earlier explanation supports shared methods between philosophy and mathematics, not identity. C-007 gives a countermodel to the inference from shared methods to equal disciplines: two sets can overlap without being equal. C-002 uses independent propositional variables p and n: p can be true while n is false, so `p ⊭ n`. Adding `p → n` permits modus ponens, but does not justify that normative bridge. This is a small conditional result, not a theorem about every possible ethical theory.

Life enters the workspace through bounded, revisable cases: context, options, assumptions, unknowns, values, observations and objections. A graph cannot fully represent a person. The [fictional rent case](LEBENSFALL.md#english) separates arithmetic from value choice and actual consent.
