# Die Mathematik der inneren Wege

[English](#english)

**WIRKLICH · Forschungsentwurf · Fünf erfundene Fälle, keine empirische Validierung.**

Zwei Menschen sehen denselben Fehler. Einer widerspricht. Der andere müsste dafür etwas riskieren, das im Sitzungsprotokoll gar nicht vorkommt. Der [philosophische Motor](philosophischer-motor-mathematik.md) hält Gründe und Einwände fest. Diese fünf Modelle ergänzen ihn um Fragen nach den Wegen, die Menschen in einer Situation wahrnehmen.

### 1. Der Horizont der Sagbarkeit

Für eine Person und einen konkreten Einwand sei `P` die endliche Menge der betrachteten Wege, ihn zu äußern. Jeder Weg hat mindestens eine Etappe. Jede Etappe `e` hat eine von der Person geschätzte Hürde `r(e) ≥ 0`. Für die größte Einzelhürde und die kumulative Belastung gelten zwei verschiedene Modelle.

$$
H_{\max} = \min_{p \in P}\max_{e \in p} r(e),
\qquad H_{\Sigma} = \min_{p \in P}\sum_{e \in p}r(e).
$$

Der direkte Widerspruch im Meeting hat die Hürde 8. Ein Vorgespräch und ein selbst freigegebener Beitrag haben die Hürden 2 und 4. Bei einem Budget von 5 liegt der zweite Weg im Einzelhürdenmodell mit 4 in Reichweite. Im Summenmodell kostet er 6. Das Summenmodell setzt voraus, dass sich die Hürden sinnvoll addieren lassen. Eine leere Menge bekannter Wege ergibt keinen erreichbaren Weg im Modell. Unbekannte Wege bleiben offen.

**Gegenprobe.** Unter 100 Menschen sind fünf geäußerte Einwände sowohl mit fünf Zweifelnden vereinbar, die alle sprechen, als auch mit 50 Zweifelnden, von denen fünf sprechen. Die Beobachtung allein identifiziert die Zahl der Zweifelnden nicht. Frag freiwillig nach fehlenden Wegen und prüfe, ob die alternative Route dieselben Risiken tatsächlich verändert. Der Ereignishorizont ist hier eine Analogie für Erreichbarkeit. Der [Horizont der Fürsorge](https://github.com/AlexanderR1991/Vera/pull/164) ist ein eigener Entwurf zur institutionellen Erreichbarkeit von Einspruch, Hilfe und Ausstieg.

### 2. Atmosphäre hat eine Reihenfolge

Sei `x` ein Ausgangszustand eines Gesprächs. `A` steht für das Anerkennen einer Verletzung, `B` für das Erklären der eigenen Absicht. Die Reihenfolge macht im Modell für einen Zustand einen Unterschied, wenn `B(A(x)) ≠ A(B(x))`.

**Rechenprobe.** In einem Spielmodell sei `x = 0,4` eine Bereitschaft zum Weiterreden, `A(x) = 0,6x + 0,4` und `B(x) = 0,5x`. Erst anerkennen, dann erklären ergibt 0,32. Die umgekehrte Folge ergibt 0,52. Das Vorzeichen folgt aus den gewählten Funktionen. Andere Funktionen können es umkehren oder beide Folgen gleich machen.

**Gegenprobe.** Spiele denselben Wortlaut in beiden Reihenfolgen mit gleich langer Pause vor „Ist schon gut“ durch. Die Person selbst deutet ihre Antwort. Die Rechnung zeigt einen möglichen Reihenfolgeeffekt. Ob er auftritt, in welcher Richtung und aus welchem Grund, bleibt zu prüfen.

### 3. Welche Hilfe bleibt nach einem Nein?

Die Person benennt eine endliche Menge `Z` eigener Ziele, die mit der angebotenen Hilfe erreichbar sind. `R` enthält die Ziele, die erreichbar bleiben, wenn sie zu einer sachfremden Bitte Nein sagt. Für `Z ≠ ∅` ist `F = |Z ∩ R| / |Z|`. Bei leerem `Z` bleibt der Wert offen.

**Gegenprobe.** Sind von drei gewünschten Zielen nach dem Nein noch zwei erreichbar, ist `F = 2/3`. Entscheidend bleibt, welches Ziel entfällt. Verlässliche Assistenz, die weiterhin angeboten wird, bleibt Teil der erreichbaren Wege. Der Test untersucht eine konkrete Abhängigkeit unter einer benannten Bedingung. Ein freiwilliges Nein wird weder verlangt noch als Versuch ausgelöst. [Fürsorge und eigene Entscheidung](vera-liebe-als-richtung.md)

### 4. Heimweh nach einer Zukunft

Für eine vorgestellte Zukunft `f` bezeichne `p(f) ∈ [0,1]` ihre subjektiv eingeschätzte Erreichbarkeit und `v(f) ≥ 0` ihre Bedeutung für die Person. Halten wir `v(f)` für den Vergleich fest, ergibt sich `L(f) = v(f) · max(0, p_vorher(f) − p_heute(f))`. Bei `v = 4` und einem Rückgang von 0,75 auf 0,25 liefert die Regel 2. Die Eingaben sind hypothetische Selbstauskünfte. Eine fallende Erreichbarkeit legt ihre Ursache nicht offen.

**Gegenprobe.** Ein ersehntes Leben am Meer wird unerreichbar. Eine andere Zukunft kann dennoch die darin gesuchte Ruhe und Zugehörigkeit ermöglichen. Dann muss man entscheiden, ob der Vergleich die konkrete Zukunft oder den zugrunde liegenden Wunsch beschreiben soll.

### 5. Ein Einwand schließt einen unmöglichen Kreis

Für dieselbe konkrete Entscheidung seien `x_i ∈ {−1,+1}` binäre Positionen. Eine ausdrücklich behauptete Gleichheit oder Gegensätzlichkeit hat ein Vorzeichen `s_ij ∈ {−1,+1}` und verlangt `x_j = s_ij · x_i`. Durch Einsetzen entlang eines geschlossenen Kreises gilt `x_i = (∏ s_ij) · x_i`. Ein Produkt von −1 macht die Annahmen gemeinsam unerfüllbar.

**Gegenprobe.** Ehrlichkeit und Respekt verlangen hier dasselbe, Respekt und Schweigen auch, Schweigen und Ehrlichkeit aber das Gegenteil. `(+1)(+1)(−1) = −1`. Der Kreis zeigt den Konflikt zwischen den Annahmen. Welche Kante revidiert werden muss, bleibt offen. Wenn „Respekt“ unterwegs seine Bedeutung wechselt oder die Kante nur „oft“ bedeutet, greift die formale Probe erst nach einer genaueren Formulierung.

### Im Streit anwenden

Im Streit um einen autofreien Marktplatz lautet die einfache Vergleichsfrage „Was hält dich davon ab, deinen Einwand vorzubringen?“ Eine Person kann selbst angeben, welcher Weg fehlt, etwa ein Beitrag vor der Entscheidung mit Antwortrecht. Die zusätzliche Karte lohnt sich, wenn die Beteiligten damit einen gangbaren Weg oder einen präziseren offenen Einwand finden. Bleibt die Frage allein ebenso hilfreich, genügt die einfachere Methode. Entsteht Druck zur Offenlegung oder wird aus Schweigen Zustimmung abgeleitet, endet der Versuch. Gesprächszugang, Sachposition und Einwilligung bleiben getrennt. [Vermittlung und ihre Gegenproben](vermittlung.md)

## English

**The mathematics of the paths we see**

**WIRKLICH · Research draft · Five fictional cases. English translation draft.**

Two people notice the same error. One objects. The other would have to risk something that never appears in the meeting minutes. The [philosophical engine](en/philosophical-motor-mathematics.md) records arguments and objections. These models ask which routes people see through a situation.

### 1. The horizon of speaking up

Let `P` be the finite set of routes considered for voicing a particular objection. Each route has at least one step. The person estimates the hurdle `r(e) ≥ 0` for each step. Compare the smallest maximum hurdle, `H_max = min_p max_e r(e)`, with the smallest total hurdle, `H_sum = min_p Σ_e r(e)`, over routes `p ∈ P` and their steps. The latter requires a meaningful additive scale. A direct objection costs 8. A private conversation followed by a contribution that the speaker approves costs 2 and 4. With a budget of 5, the route is within reach under the first rule (4) and beyond reach under the second (6). An empty set of routes gives no reachable path in the model. Unknown routes remain open.

**Countercheck.** Five voiced objections in a group of 100 fit both a room with five dissenters who all speak and one with 50 dissenters, five of whom speak. Ask voluntarily about missing routes and check whether an alternative changes the actual exposure. The event horizon is a reachability analogy. The separate [care horizon draft](https://github.com/AlexanderR1991/Vera/pull/164) examines whether people can access institutional routes to appeal, support and exit.

### 2. Atmosphere depends on order

Let `A` acknowledge hurt and `B` explain intent. Order matters at a starting state `x` if `B(A(x)) ≠ A(B(x))`. In a toy model for willingness to continue, let `x = 0.4`, `A(x) = 0.6x + 0.4` and `B(x) = 0.5x`. Acknowledging before explaining yields 0.32. Explaining before acknowledging yields 0.52. Other functions can reverse or erase the difference.

**Countercheck.** Swap the order of identical lines and keep the pause before “It's okay” the same. Let the person explain what their answer meant. Whether an effect occurs, in which direction and why remain open questions.

### 3. What help remains after a no?

Let `Z` be the finite set of self-chosen goals reachable with the offered help. Let `R` contain the goals that remain reachable after declining an unrelated request. For nonempty `Z`, define `F = |Z ∩ R| / |Z|`. With no goals specified, the ratio is undefined.

**Countercheck.** If two of three goals remain reachable, `F = 2/3`. Which goal disappears still matters. Reliable ongoing assistance stays among the available routes. Examine the specific dependency without requiring anyone to perform a refusal. [Care and self-determination](vera-liebe-als-richtung.md)

### 4. Homesick for a future

Let `p(f) ∈ [0,1]` be a person's perceived attainability of a future `f` and `v(f) ≥ 0` its value to that person. Holding the value fixed, define `L(f) = v(f) · max(0, p_before(f) − p_now(f))`. With `v = 4` and attainability falling from 0.75 to 0.25, the rule gives 2. These inputs are hypothetical self-reports. Falling attainability leaves its cause open.

**Countercheck.** A hoped-for life by the sea becomes unattainable. Another future may still offer the same peace and belonging. Decide whether the comparison should describe the particular future or the underlying wish.

### 5. An objection closes an impossible loop

Use binary positions `x_i ∈ {−1,+1}` for the same decision. An explicit equality or opposition imposes `x_j = s_ij · x_i`, where `s_ij ∈ {−1,+1}`. Substituting around a closed loop gives `x_i = (∏ s_ij) · x_i`. A product of −1 makes the assumptions jointly unsatisfiable.

**Countercheck.** Suppose honesty and respect call for the same thing, as do respect and silence, while silence and honesty call for opposites. `(+1)(+1)(−1) = −1`. Which link needs revision remains open. A shift in the meaning of “respect” or a link that only means “often” requires clarification before this test applies.

### Use in a disagreement

In a dispute about a car-free square, start with “What's in the way of raising your objection?” Someone might name a missing route, such as submitting a comment before the decision with a right to a reply. The extra structure earns its place if it helps people find a feasible route or name a more precise unresolved objection. If the simple question works just as well, use it. Stop the exercise if it pressures people to disclose or turns silence into agreement. Access to the conversation, the substantive position and consent are separate questions. [Mediation and its counterchecks](vermittlung.md#english-summary)
