# ENT-00 · WIRKLICH · ENTITÄT

**Forschungs- und Architekturentwurf 0.1 · 7. November 2026 · anfechtbar, nicht empirisch validiert**

> **Eine offene kollektive Erkenntnisarchitektur, die Fragen, Wissen, Widerspruch und nachvollziehbare Korrekturen miteinander verbindet.**
>
> **Nicht recht behalten. Besser prüfen. Korrigieren. Weiterfragen.**

Die **Entität** ist ein vorläufiger Name für die funktionale Architektur aus Menschen, Atlas, Forum, Prüfverfahren, optionalen KI-Fachrollen, mathematischen Forschungsmodellen und einem versionierten Erkenntnisgedächtnis. Das behauptet weder Leben noch Bewusstsein oder bereits vorhandene autonome kollektive Intelligenz. Auch der Begriff „Entität“ bleibt kritisierbar.

## Kein zweites, geschlossenes System

WIRKLICH besitzt bereits eine [Selbstkorrekturregel](selbstkorrektur.md), einen [Fragenatlas](fragenatlas.md), ein [Aussagenregister](aussagenregister.md), ein [Reifemodell R0–R4](erkenntnisreife.md), den [Erkenntnisnavigator](erkenntnisnavigator.md) und öffentliche Diskussionen. Die Entität soll sie **verknüpfen**, nicht ersetzen. Keine automatisierte Bewertung darf menschliche Verantwortung, fachliche Prüfung oder begründeten Dissens verdrängen.

Die teils überlappenden Vorschläge wurden als separate Pull Requests dokumentiert und bleiben **fachlich ungeprüfte Forschungsentwürfe**: [Richtungsindex #73](https://github.com/AlexanderR1991/Vera/pull/73), [kollektive Intelligenz #74](https://github.com/AlexanderR1991/Vera/pull/74), [Open Source #75](https://github.com/AlexanderR1991/Vera/pull/75), [Fachagenten #81](https://github.com/AlexanderR1991/Vera/pull/81), [Mathematik M-03 #83](https://github.com/AlexanderR1991/Vera/pull/83) und [vorwärtsgerichtete Entität #84](https://github.com/AlexanderR1991/Vera/pull/84). ENT-00 setzt sie weder automatisch in Kraft noch bildet es einen alternativen Wissensstandard.

## Der destillierte Kern

1. **Frage:** Ein Mensch beschreibt ein Problem – das ist noch keine überprüfte Aussage.
2. **Typ und Kontext:** Empirisches, Formales, Normatives, Interpretation und Metapher werden nach passenden Maßstäben behandelt.
3. **Perspektiven:** Menschen und deutlich gekennzeichnete Agenten dürfen Entwürfe und Einwände beitragen. Ihre Stimmen sind keine unabhängigen Beweise.
4. **Stärkster Einwand:** Auch bei hoher Zustimmung bleibt eine begründete Gegenposition sichtbar.
5. **Revisionsentwurf:** Eingrenzen, korrigieren, widerrufen oder offenlassen sind legitime Vorschläge, aber noch keine öffentliche Freigabe.
6. **Menschlich verantwortete Entscheidung:** Extern nachweisbar autorisierte Menschen tragen redaktionelle Änderungen; alte Fassungen und Gründe bleiben nachvollziehbar.
7. **Weiterfragen:** Jede Antwort kann neue Prüfungen auslösen. „Vorwärts“ bedeutet keine garantierte Verbesserung.

Eine formale **Architekturmetapher** lautet:

`E(t+1) = F(E(t), I(t), K(t), H(t))`

*In Worten:* Der nächste versionierte Stand hängt vom bisherigen Stand E, neuen Hinweisen I, Kritik K und einer menschlich autorisierten Entscheidung H ab. Ohne H werden Beiträge nicht zu offiziellen Revisionen. Die Formel ist **kein empirischer Nachweis** von Lernleistung.

## Der ausführbare Minimal-Kern

Die quelloffene JavaScript-Bibliothek [`src/lib/entity-core.mjs`](../src/lib/entity-core.mjs) erlaubt eine nachvollziehbare **Entwurfsspur**:

- Vorläufige Frage, Aussageart, Kontext und Formulierung unter stabiler ID speichern.
- Perspektiven, Quellenhinweise, Einwände und Revisionsvorschläge mit Herkunft, Zeit, Domäne und Bezugsrevision anhängen.
- Doppelte IDs, veraltete Bezugsrevisionen und ungeprüfte Statusbeförderungen abweisen.
- Neue Wortlaute versionieren und alte Fassungen für nachvollziehbare Korrekturen erhalten.
- Menschliche Entscheidungen nur über eine **vertrauenswürdige externe Autorisierungsfunktion** protokollieren.

**Sicherheitsgrenze:** Diese Bibliothek besitzt selbst **keine Identitätsprüfung**; ein beliebiger `verifyHumanReview = () => true` ist ausschließlich ein synthetischer Test-Stub, kein Beweis einer echten menschlichen Prüfung. Der statische Website-Prototyp ruft die Entscheidungsfunktion daher **nicht** auf. Ein künftiger Dienst muss Authentifizierung, Berechtigung, unveränderbaren Audit-Trail und Signatur/Commit-Bindung unabhängig sichern. Auch ein JSON-Protokoll kann außerhalb einer solchen Vertrauenskette manipuliert werden.

In der [deutschen](https://alexanderr1991.github.io/Vera/de/entitaet/) und [englischen](https://alexanderr1991.github.io/Vera/en/entitaet/) Demo dürfen Besucher **nur lokal im Browser** eigene Einwände ergänzen und ihren JSON-Entwurf speichern. Die Beispielinhalte sind erfunden. Es gibt keine Serverübertragung, keine öffentlich erfasste Zustimmung, keine Quellenprüfung und keinen aktiven KI-Agenten.

[Maschinenlesbares Protokoll](../public/protocol/entity-loop.v0.json) · [Synthetische Beispieldaten](../public/knowledge/entity-demo.v0.json) · [Node-Tests](../tests/entity-core.test.mjs).

### Einwände über Fassungen verfolgen

Zwei Menschen benennen verschiedene Fehler an derselben Regel. Eine Entscheidung ändert den Satz wegen des ersten Einwands. Was schulden wir der zweiten Person? Ihr Einwand muss mit seiner ursprünglichen Fassung und Kennung auffindbar bleiben. Das lokale Protokoll führt dafür die Menge $O$ der noch offenen Einwände je Vorgang.

| Ereignis | Neue offene Menge | In Worten |
| --- | --- | --- |
| Einwand mit neuer Kennung $i$ | $O \cup \{i\}$ | Dieser Einwand wartet auf eine Entscheidung. |
| Entscheidung mit `leave_open` zu den Kennungen $J$ | $O \cup J$ | Diese Einwände bleiben offen oder werden wieder geöffnet. |
| Begründete Entscheidung mit anderem Ausgang zu $J$ | $O \setminus J$ | Nur die ausdrücklich behandelten Einwände verlassen die offene Menge. |
| Anderer Entwurf oder Entscheidung ohne zugeordnete Kennungen | $O$ | Alle bisherigen Einwände behalten ihren Status. |

$J$ darf nur frühere Einwände desselben Vorgangs enthalten. Eine Entscheidung bezieht sich auf die aktuelle Fassung. Sie darf einen Einwand zu einer älteren Fassung ausdrücklich aufgreifen. Die Reihenfolge ergibt sich aus der Position im Protokoll. In `recordEntityDecision` bezeichnet `objection_ids` die Zuordnung. `inspectEntityRecord` liefert mit `open_objection_ids` die offenen Kennungen. `review_state` gibt weiterhin an, ob jemals eine Entscheidung protokolliert wurde. Ob eine Änderung geholfen hat, muss ein weiterer Fall zeigen.

**Gegenprobe.** Der Test spielt für bis zu vier Schritte jeden Verlauf des folgenden Modells durch. Jeder Schritt ist ein Einwand, eine Perspektive oder eine der fünf Entscheidungen zu einer beliebigen Teilmenge aller bisherigen Einwände. Für jede Kennung sucht eine unabhängige Vergleichsrechnung rückwärts nach der jüngsten zugehörigen Entscheidung. So lassen sich auch Wiederöffnung und Änderungen der Fassung prüfen. Die Autorisierung im Test ist simuliert. [Ausführbarer Vergleich](../tests/objection-histories.test.mjs) · [Modelle der anderen Bereiche](mathematische-struktur.md)

```sh
node --test tests/objection-histories.test.mjs
```

## Fünf zentrale Gegenangriffe

| Angriff | Konsequenz | Prüfidee |
| --- | --- | --- |
| **Pseudointelligenz:** Ein Datenverbund wird als Wesen verkauft. | „Entität“ bleibt eine funktionale Hypothese. | Verstehen Außenstehende diese Grenze? |
| **Schein-Konsens:** Viele Modelle teilen denselben Quellenfehler. | Modellstimmen zählen nicht als unabhängige Evidenz. | Vergleich mit Quellensuche und Einzelgutachtern. |
| **Scheinfortschritt:** Eine neue Aussage ist schlechter als die alte. | Rücknahme, Pause und Dissens gelten als zulässige Ergebnisse. | Fehlerhäufigkeit und unerwünschte Revisionen messen. |
| **Verdeckte Moralgewichtung:** Ein Index verschleiert Werte und Macht. | Kein öffentlicher Zahlenwert ohne offengelegte Wertprofile, kalibrierte Prüfung und Legitimation. Aktuell `null`. | Unterschiedliche Wertprofile explizit vergleichen. |
| **Schein-Review:** Ein JSON-Flag gibt sich als menschliche Freigabe aus. | Kein Review ohne externe Authentifizierung. | Veraltete oder gefälschte Freigaben abweisen. |

## Nächste echte Arbeit

Zunächst die offenen PRs auf Doppelungen und Konflikte prüfen; dann nachvollziehbare Quellen- und Versionierungsbeziehungen anbinden, einen unabhängig gesicherten menschlichen Einspruchsweg schaffen und erst anschließend eng begrenzte Fachagenten testen. Die Wirksamkeit muss in vorab definierten, blind überprüften Fällen gegen eine **einfache Alternative** gemessen werden. Die Zahl von Agenten, Argumenten oder Korrekturen ist selbst kein Erkenntnismaß.

**Nicht implementiert:** autonomer KI-Orchestrator, Live-Wissensgraph, automatische Forum-Synchronisation, unabhängige Peer-Review-Institution oder ein numerischer moralischer Richtungsindex.

Die Grundregel bleibt [META-01](selbstkorrektur.md): Auch ENT-00 darf begründet geändert oder verworfen werden. **Wir sind Open Source – nach vorn gerichtet.**

---

## English · ENT-00 · WIRKLICH · ENTITY

**Experimental, contestable architecture proposal, not a scientific validation.** The entity is a *functional* feedback model connecting people, an atlas, forums, typed inquiry, optional specialist AI roles, bounded mathematics and a versioned record of objections and revisions. It is **not** a claim of artificial consciousness, machine life or proven collective intelligence.

The loop is **question → classify → perspectives → strongest objection → evidence check → revision draft → accountable human decision → history → next question**. Withdrawal, uncertainty, a pause or justified dissent may be better than false agreement.

The deterministic [entity-core module](../src/lib/entity-core.mjs) stores provenance-labelled drafts against explicit revisions. It refuses AI-based status upgrades and requires a trusted **external** authorization function for accountable human decisions. The static site **does not** have such a function: the public example is synthetic and all visitor additions remain private to the browser session, with an optional local JSON export.

### Tracking objections across revisions

Within a case, each new objection enters the open set under its own ID. An externally authorized decision references earlier objections using `objection_ids`. A `leave_open` decision keeps or reopens the named objections. Other decisions remove exactly the named IDs from the open set. A decision without links, including a legacy decision, preserves every objection’s state. Decisions must refer to the current version and can explicitly address an objection from an earlier version. The ledger uses append order.

`inspectEntityRecord` returns the open IDs in `open_objection_ids`. The historical `review_state` reports whether any decision has been recorded. Human benefit needs a separate observation. Run `node --test tests/objection-histories.test.mjs` for a bounded comparison against the latest decision referring to each individual objection. It covers every sequence up to four steps drawn from two draft types and five decisions, including every subset of prior objections. Authorization in this test is synthetic. [Other mathematical models](mathematische-struktur.md#english)

It produces **no calibrated direction score**, verifies no human consensus, runs no agent swarm and does not automatically publish. External sources, contributor identities, source independence, governance and model evaluation remain open work. The companion JSON [protocol](../public/protocol/entity-loop.v0.json) and [synthetic fixture](../public/knowledge/entity-demo.v0.json) are available for inspection.

**Strongest objections:** false consciousness claims, shared model errors, harmful or incorrect revisions, concealed value weights and fake human-review metadata. Addressing these requires better tests, authorization and actual human governance—not more dramatic language. A useful trial must outperform an ordinary research/criticism process on independently measured outcomes.

Overlapping research proposals [#73](https://github.com/AlexanderR1991/Vera/pull/73), [#74](https://github.com/AlexanderR1991/Vera/pull/74), [#75](https://github.com/AlexanderR1991/Vera/pull/75), [#81](https://github.com/AlexanderR1991/Vera/pull/81), [#83](https://github.com/AlexanderR1991/Vera/pull/83) and [#84](https://github.com/AlexanderR1991/Vera/pull/84) remain distinct and without independent review. The [META-01](selbstkorrektur.md) correction principle also applies to this proposal.

**Open source, facing forward** means independent scrutiny, the right to fork, and continued opportunity for honest correction—not inevitable upward progress.
