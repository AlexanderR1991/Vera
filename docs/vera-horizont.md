# Vera · Der Horizont der Fürsorge

[English](#english)

**Entwurf für WIRKLICH und Veras Projektordnung.** Vera soll Menschen helfen, ihre Möglichkeiten zu erkennen und über den nächsten Schritt selbst zu bestimmen. Auch wer Vera widerspricht, auf dauerhafte Unterstützung angewiesen ist oder gehen möchte, soll handlungsfähig bleiben. Das ist eine normative Entscheidung aus [G-005 und Liebe als Richtung](vera-liebe-als-richtung.md). Sie bindet auch den Betrieb und die Menschen, die die Regeln verwalten.

## Was am schwarzen Loch mathematisch passiert

Ein zukünftiger Ereignishorizont grenzt in einer asymptotisch flachen Raumzeit den Bereich ab, von dem aus ein zukünftiges Signal das ferne Außen erreichen kann. Formal ist er der Rand der kausalen Vergangenheit der zukünftigen Nullunendlichkeit, `∂J⁻(ℐ⁺)`. [Sean Carroll, Spacetime and Geometry, §6.1](https://pierre.ag.gerard.web.ulb.be/textbooks/books/Carroll_GR.pdf) Für das ungeladene, nicht rotierende Schwarzschild-Loch liegt er beim Radius `rₛ = 2GM/c²`.

In einlaufenden Eddington–Finkelstein-Koordinaten mit `G = c = 1` lautet die Metrik `ds² = −(1−2M/r)dv² + 2 dv dr + r² dΩ²`. Setzt man für radiales Licht `ds² = dΩ² = 0`, liefert der auslaufende Zweig `dr/dv = ½(1−2M/r)`. Der Radius nimmt außen zu, bleibt am Horizont konstant und nimmt innen selbst für den auslaufenden Zweig ab. Die Koordinaten sind am Horizont regulär. Entscheidend ist, wohin das Licht gelangen kann. [David Tong, General Relativity, §6.1.3–4](https://davidtong.org/teaching/general-relativity/grhtml/S6)

## Wie Vera erreichbare Wege prüft

Für jede betroffene Person oder Rolle `p`, jede einschlägige Handlungsmöglichkeit `c` und jedes relevante Szenario `f` legen wir einen gerichteten Graphen $G_{p,c,f}$ an. Der Start `s′` ist der Zustand **nach** der vorgeschlagenen Änderung. Die Zielmenge $T_{p,c,f}$ enthält Zustände, in denen die Person die Handlung tatsächlich ausüben kann. Dazu gehören je nach Fall die Begründung verstehen, eine menschliche Entscheidung über einen Einspruch erreichen, eine zulässige Kopie exportieren, Unterstützung widerrufen oder als befugte Stelle den Betrieb anhalten. Ein Klick auf „Absenden“ allein schließt einen Einspruch nicht ab.

```text
Erreichbar(p, c, f) = { s | es gibt in G(p, c, f) einen Pfad von s nach T(p, c, f) }
Freigabevoraussetzung(s′) = Für jedes einschlägige (p, c, f) gilt s′ ∈ Erreichbar(p, c, f).
```

Das Komplement der erreichbaren Menge ist im jeweiligen Graphen abgeschlossen. Könnte ein Zustand daraus zu einem erreichbaren Zustand übergehen, gäbe es durch Verketten auch vom ersten Zustand aus einen Pfad zum Ziel. Genau diese Erreichbarkeit übertragen wir aus der Physik. Welche Ziele zählen und welche Wege Vera schützen soll, ist eine menschliche Entscheidung.

Ein Weg zählt nur für die Personen, die ihn mit ihren tatsächlichen Zugängen und Befugnissen nutzen können. Wird Vera oder eine verantwortliche Person überprüft, muss die Prüfung auch ohne deren Zustimmung erreichbar sein. Prüfe deshalb je nach Änderung auch Ausfälle, Befangenheit, sprachliche Hürden oder fehlende Konten. Wo die Zeit entscheidend ist, gehört sie zum Szenario. Anerkannte Unterstützung kann Teil eines nutzbaren Wegs sein. Bei persönlichen Daten schützt bereits der Entwurf Vertraulichkeit und Zustimmung. Eine öffentliche Offenlegung kann sich auch nach einem Git-Revert weiter auswirken und braucht ihre eigene vorherige Prüfung.

## Was die Gegenprobe zeigt

```sh
node scripts/vera-horizont.mjs docs/examples/vera-horizont.json
```

Die Probe unterscheidet bestätigte Wege (`verified`), mögliche Wege mit offenen Schritten (`unverified`) und blockierte Wege (`blocked`) im beschriebenen Modell. Nur durchgehend als bestätigt eingetragene Kanten erfüllen die Voraussetzung. Das Programm prüft Erreichbarkeit im übergebenen Graphen. Es überprüft die Belegreferenzen und realen Befugnisse nicht selbst. Die erfassten Betroffenen, Ziele, Zugänge und Ausfallszenarien müssen Menschen prüfen. Jede Freigabe bleibt eine gesonderte Entscheidung.

Der erste Fall zeigt an synthetischen Daten, wie gewünschte Hilfe und ein unabhängiger Einspruch zusammen funktionieren können. Der zweite bildet die dokumentierte Lücke ab. Eine eigene redaktionelle Entscheidung des Eigentümers kann öffentlich beanstandet werden. Ein dauerhaft unabhängiger Weg, über den Betroffene tatsächlich eine Prüfung erreichen, ist in der [Projektordnung](community-governance.md#einspruch-gegen-eine-redaktionelle-entscheidung--appealing-an-editorial-decision) offen. Der öffentliche Eingang reicht für dieses Ziel im Modell nicht aus.

**Auch über dem Projekt.** Eine Änderung an dieser Regel, an Zuständigkeiten oder am Betrieb muss an denselben Fragen gemessen werden. Eine fehlende Möglichkeit lässt sich weder mit größerer Reichweite noch mit Vorteilen für die Mehrheit ausgleichen. Ein Fork des offenen Kerns und ein wirksamer Stopp der laufenden Instanz sind unterschiedliche Wege. Wenn der Betrieb nur fortgesetzt werden kann, indem wesentlicher Schutz, ein wirksamer Einspruch oder ein befugter Stopp aufgegeben wird, hat der Schutz Vorrang. Die Entscheidung kann ein kleinerer Versuch, eine Pause oder das Ende des Betriebs sein. [Projektordnung](community-governance.md#horizont-der-fürsorge--horizon-of-care) · [ERHALT-01](erhalt-01.md)

## English

**Proposal for WIRKLICH and Vera’s governance.** Vera should help people understand their options and choose what happens next. A person must retain meaningful agency when disagreeing, receiving ongoing support or leaving. That commitment comes from [G-005 and love as direction](vera-liebe-als-richtung.md), and applies to the people and institutions that operate Vera.

In an asymptotically flat spacetime, the future event horizon is the boundary of the causal past of future null infinity, `∂J⁻(ℐ⁺)`. [Sean Carroll, Spacetime and Geometry, §6.1](https://pierre.ag.gerard.web.ulb.be/textbooks/books/Carroll_GR.pdf) For a nonrotating, uncharged Schwarzschild black hole, it lies at `rₛ = 2GM/c²`. In ingoing Eddington–Finkelstein coordinates with `G = c = 1`, the metric is `ds² = −(1−2M/r)dv² + 2 dv dr + r² dΩ²`. Setting `ds² = dΩ² = 0` gives `dr/dv = ½(1−2M/r)` on the outgoing radial branch. The radius grows outside, stays constant at the horizon and decreases inside even for that branch. The coordinates are regular at the horizon. [David Tong, General Relativity, §6.1.3–4](https://davidtong.org/teaching/general-relativity/grhtml/S6)

For each affected person or role `p`, applicable capability `c` and relevant failure scenario `f`, define a directed graph and a set of states $T_{p,c,f}$ in which the person can exercise that capability. The state after a proposed change must have a verified path to the target set for each applicable triple. The complement of the reachable set is closed under the modeled transitions. An edge to a reachable state would give the original state a path to the goal by concatenation. Reachability is the mathematical transfer. The choice of whose agency and which capabilities to protect is normative.

Goals can include understanding a reason, obtaining an independent human review of an objection, exporting permitted material, withdrawing consent or pausing operations as an authorized human. Use real permissions, accessibility and any meaningful time constraints. An independent review must be possible without the assent of the person or component being reviewed. Appropriate assistance can be part of a viable path. Protect consent and confidentiality, and review irreversible disclosures before they happen.

Run `node scripts/vera-horizont.mjs docs/examples/vera-horizont.json` to see a synthetic working route and a documented gap in independent editorial appeals. The prototype distinguishes `verified` paths, `unverified` paths with unresolved steps and `blocked` paths in the supplied model. It does not authenticate evidence, inspect live services or confer approval. Affected people and accountable reviewers must check the model against reality.

**Above the project too.** Apply the same test to changes in the rule, roles and operations. Growth and majority benefit cannot substitute for a missing essential route. A source fork and an external stop of the original deployment protect different capabilities. The project’s continuation is subordinate to people’s safety, privacy and effective agency. [Community governance](community-governance.md#horizont-der-fürsorge--horizon-of-care) · [ERHALT-01](erhalt-01.md)
