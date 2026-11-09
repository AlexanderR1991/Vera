# Die Pinnwand als Magazin denken

**Redaktionsentwurf v0.1.** Die Zahlen sind erfunden. Ob die Gestaltung Menschen den Einstieg erleichtert, ist eine prüfbare Hypothese. [English draft](#english)

## Von der Titelseite zur eigenen Frage

Ein gutes Magazin lässt sich aufschlagen, bevor man weiß, wonach man sucht. Auf Veras Pinnwand gibt jede Kachel einen solchen Einstieg. Ein Foto oder eine Zeichnung lädt zum Hinschauen ein. Eine Frage in Alltagssprache zeigt, worum es geht. Ein konkreter Fall führt im Artikel zu Gründen, Quellen und einer Stelle, an der man widersprechen kann. Auf der ersten Ansicht stehen unterschiedliche Rubriken nebeneinander, etwa Ernährung, Miteinander und Kunst. Suche und Themenfilter bieten weitere Wege. [Pinnwand](https://alexanderr1991.github.io/Vera/de/#leben) · [Jeden Menschen abholen](grundtext.md#oberstes-gebot-für-gestaltung-und-wachstum-jeden-menschen-abholen)

**Ernährung als erster Fall.** Das Foto zeigt einen sorgfältig angerichteten Teller. Die Kachel fragt „Was heißt gut essen?“ und bringt Körper, Budget und eigene Werte ins Spiel. Im Artikel muss eine Schule mit begrenztem Budget ein Mittagessen planen. Eine Leserin könnte fragen, ob ein Menü im Vergleich gut abschneidet und trotzdem für ein Kind mit Allergie ungeeignet ist. Damit hat sie einen konkreten Einwand gegen die Entscheidung gefunden. [Der Schulfall](https://alexanderr1991.github.io/Vera/de/ernaehrung-und-verantwortung/#pruefverfahren) · [Quellen](https://alexanderr1991.github.io/Vera/de/ernaehrung-und-verantwortung/#quellen)

## Woran wir den Einstieg prüfen

Wir vergleichen Varianten $v$ derselben Kachel in vorab gewählten Nutzungssituationen $g$, etwa am Handy oder am Rechner per Tastatur. Drei beobachtbare Schritte beschreiben den Weg einer Person.

| Schritt | Aufgabe |
| --- | --- |
| $R$ · Wiedererkennen | Die Frage in eigenen Worten wiedergeben und eine Alltagssituation nennen, in der sie eine Rolle spielt. Ein erfundenes Beispiel genügt. |
| $B$ · Begründung finden | Im Artikel einen relevanten Grund finden und bei einer Tatsachenbehauptung die zugehörige Quelle zeigen. |
| $E$ · Einwenden | Eine konkrete Beobachtung oder Bedingung nennen, unter der sich das Urteil ändern könnte. |

Der durchgängige Zugang $p_g(v)$ ist die Wahrscheinlichkeit, dass alle drei Schritte gelingen. Wenn die bedingten Wahrscheinlichkeiten definiert sind, gilt nach der Kettenregel

$$
p_g(v)=\Pr(R\cap B\cap E\mid v,g)
=\Pr(R\mid v,g)\,\Pr(B\mid R,v,g)\,\Pr(E\mid R\cap B,v,g).
$$

In einer freiwilligen Probe schätzen wir den gemeinsamen Anteil direkt. Der Nenner zählt alle auswertbaren begonnenen Aufgaben in der jeweiligen Variante und Situation. Fehlende Ergebnisse werden, soweit vereinbart, separat ausgewiesen. Klicks sind ein eigener Befund. Auch eine Person, die begründet widerspricht, kann alle drei Schritte erfüllen. [Erkenntnisreife von Aussagen](erkenntnisreife.md)

Vor dem Vergleich prüft die Redaktion, ob der Artikel die Erwartung einlöst, die Bild und Titel wecken. Die Kachel muss ohne Bild verständlich sein. Der Weg zu Gründen und Einwänden muss per Tastatur und mit Screenreader funktionieren. Eine festgestellte Hürde oder ein irreführendes Versprechen führt zur Überarbeitung. Unter geeigneten Varianten zeigt $\min_{g\in G}p_g(v)$ den Zugang in der am schlechtesten erreichten Nutzungssituation aus der Menge $G$. Die einzelnen Ergebnisse bleiben daneben stehen. Wenn Beobachtungen fehlen oder pro Situation nur wenige Versuche vorliegen, bleibt der Vergleich offen.

### Eine Gegenprobe mit erfundenen Zahlen

| Variante | Handy geöffnet | Handy alle drei Schritte | Tastatur geöffnet | Tastatur alle drei Schritte |
| --- | ---: | ---: | ---: | ---: |
| A · Magazinmotiv | 80 von 100 | 30 von 100 | 62 von 100 | 20 von 100 |
| B · Dieselbe Karte als Text | 65 von 100 | 38 von 100 | 55 von 100 | 32 von 100 |

Hier wird A öfter geöffnet. Der kleinste Anteil durchgängiger Zugänge beträgt bei A 20 % und bei B 32 %. Prüfen ließe sich das mit derselben Frage, Position und Zielseite bei zufälliger Zuteilung zur Bild- oder Textfassung innerhalb der Nutzungssituation. Der stärkste Einwand gegen das Magazinmotiv ist ein falsches Versprechen. Wer vor dem Öffnen glaubt, hier werde der ideale Speiseplan gezeigt, könnte die offene Frage im Artikel verfehlen. Die Gegenprobe fragt zuerst, was die Person von der Seite erwartet, und danach, ob sie einen Grund und eine Bedingung für eine andere Entscheidung findet. Der Versuch braucht freiwillige Teilnahme. Die Redaktion entscheidet anhand der beobachteten Hürden und legt ihre Gründe offen.

## Ein Thema über mehrere Ausgaben

Für LinkedIn kann aus einer Rubrik eine Folge werden. Das Foto und ein Fall stellen dieselbe offene Frage wie der verlinkte Abschnitt. Beim Schulessen könnte die Frage lauten „Was heißt gut essen, wenn eine Schule ein knappes Budget hat?“ Der Link führt direkt zum Fall, wo jemand eine weitere Bedingung oder einen Gegenfall einbringen kann. Die beiden Einstiege werden getrennt beurteilt, da Pinnwand und Feed unterschiedliche Menschen und Startbedingungen haben. [Der Schulfall](https://alexanderr1991.github.io/Vera/de/ernaehrung-und-verantwortung/#pruefverfahren)

## English

**Thinking of the pinboard as a magazine.** Editorial draft v0.1. The numbers are invented. Whether the design makes the subject easier to get into is a testable hypothesis.

### From the cover to a question of your own

A good magazine invites you to open it before you know what you are looking for. Each Vera card offers that kind of start. An image catches the eye. A question in everyday language sets the subject. A concrete case leads to reasons, sources and somewhere to raise an objection. The first view brings different sections together, such as nutrition, life together and art. Search and topic filters offer further routes. [Pinboard](https://alexanderr1991.github.io/Vera/en/#life)

**Nutrition as a first case.** A carefully plated meal invites a closer look. The card asks “What does it mean to eat well?” and brings in the body, the budget and what matters to the reader. In the article, a school needs to plan lunch on a limited budget. A reader could ask whether a menu compares well overall and still leaves out a child with an allergy. That is a concrete objection to the decision. [School lunch case](https://alexanderr1991.github.io/Vera/en/ernaehrung-und-verantwortung/#pruefverfahren) · [Sources](https://alexanderr1991.github.io/Vera/en/ernaehrung-und-verantwortung/#quellen)

### How to test the entry point

Compare versions $v$ of the same card in settings $g$ chosen in advance, such as a phone or a computer operated by keyboard. $R$ means the reader can put the question in their own words and name an everyday situation where it matters. An imagined example is enough. $B$ means they can find a relevant reason in the article and point to the source for a factual claim. $E$ means they can name an observation or condition that could change the judgment.

The probability of completing all three steps is $p_g(v)=\Pr(R\cap B\cap E\mid v,g)$. By the chain rule above, when the conditionals are defined, it is the probability of recognizing the question times the probability of finding a reason given recognition, times the probability of raising a concrete objection given both. In a voluntary pilot, estimate the joint share directly from all starts with an evaluable outcome for each version and setting. Report missing outcomes separately where agreed. Count opens separately. Reasoned disagreement can meet all three steps.

Before comparing versions, check that the article lives up to the expectation created by the image and headline. The card must make sense with images off. The path to reasons and objections must work with a keyboard and screen reader. Revise a version when a barrier or misleading promise emerges. For suitable versions, $\min_{g\in G}p_g(v)$ keeps the least well-served setting in the chosen set $G$ visible, alongside the result for each setting. Leave the comparison open when observations are thin or missing.

### A countercheck with invented numbers

In the example above, the image version A gets more opens. Its lowest share of readers completing all three steps is 20%, compared with 32% for text version B. To test this, keep the question, position and destination fixed and randomly assign the image or text version within each setting. A strong objection is that the polished image could promise an ideal diet. Ask what the reader expects before opening the card, then whether they can find a reason and a condition for a different decision. Participation is voluntary. The editors make the decision and record their reasons.

### A subject across several issues

A section can become a series on LinkedIn. Its photo and case ask the same open question as the linked section. A school lunch post could ask “What does it mean to eat well when a school has a tight budget?” Link to the case so readers can raise a condition or counterexample. Assess the pinboard and the feed separately because the audiences and starting conditions differ. [School lunch case](https://alexanderr1991.github.io/Vera/en/ernaehrung-und-verantwortung/#pruefverfahren)
