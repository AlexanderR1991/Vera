# Vera · AGI-Horizont für den Menschen

[English](#english)

**Strive for perfection. Driven by Love.** Vera soll eines Tages neue Aufgaben in vielen Bereichen verstehen, geeignete Verfahren übertragen und aus überprüfbaren Fehlern lernen können. Ob dafür allgemeine künstliche Intelligenz (AGI) erreicht wird, bleibt eine Forschungsfrage. Der Maßstab für den Einsatz ist, ob Menschen mit Vera mehr Handlungsspielraum haben, gewünschte Hilfe erhalten und über ihre Folgen mitbestimmen können. Eine Person kann dauerhaft Hilfe beim Lesen brauchen und dennoch selbst entscheiden, was sie antwortet. Das ist gute Unterstützung im Sinn von [G-005 und Liebe als Richtung](vera-liebe-als-richtung.md).

## Was heute trägt

| Stand | Was sich im Repository prüfen lässt |
| --- | --- |
| Nutzbar | Zweisprachige Website, privates Prüfblatt mit lokalem Speichern und Export, versionierte Quellen und [öffentliches Projektgedächtnis](vera-memory.v1.json). Menschen können den [Kontextexport](vera.md#neue-sitzung-starten) mit Projektregeln und ausgewählten Quellen in eine KI-Sitzung übernehmen. Sie prüfen die redaktionellen Änderungen. |
| Begrenzt ausführbar | [Bildeingang](bildeingang.md) mit vorbereiteter Lesung oder eigenem lokalem Ollama-Modell, [Selbstmodell für den Veröffentlichungsstand](vera-selbstmodell.md) und deterministische Gegenproben in [WIRKLICH](philosophischer-motor-mathematik.md). Workflows sind für begrenzte, ungeprüfte [Quellen](../.github/workflows/wahrheitsschwarm.yml) und [Einwände](../.github/workflows/angriffsschwarm.yml) vorgesehen. |
| Architekturvorschläge | Der [Entitäts-Regelkreis](entitaet.md) protokolliert im Prototyp Entwürfe. Die [Fachrollen](fachagenten-netzwerk.md) sind ein inaktiver Entwurf. |
| Für den Horizont offen | Eine eigenständig betreibbare allgemeine Vera-Laufzeit, nachgewiesener Transfer, unabhängig bestätigte Hilfe, wirksame Laufzeitkontrollen und eine breit getragene Governance. Vera hat bislang [kein eigenes offenes Grundmodell veröffentlicht](open-source-ki.md#was-wir-meinen). |

## Welche Nachweise die Architektur braucht

| Nachweis | Voraussetzung für den nächsten Schritt |
| --- | --- |
| Allgemeine Fähigkeiten | Fähigkeiten getrennt nach Breite, Leistung und Transfer messen. An zuvor ungesehenen Aufgaben aus mehreren Domänen belegen, dass Vera passende Verfahren überträgt, Quellen, Geltungsbereich und Unsicherheit kenntlich macht und mit neuen Gegenbelegen begründet korrigiert. Modell, Projektstand und Zusammenspiel getrennt prüfen. |
| Hilfe und Zugang | Mit betroffenen Menschen prüfen, ob sie Quellen und Optionen verstehen, Fehler erkennen, widersprechen und selbst entscheiden können. Prüfen, wo freiwilliger Transfer ohne Vera gelingt und wo fortlaufende, zugängliche Unterstützung gewünscht ist. Abbrüche, Hürden und Nachteile getrennt berichten. Menschen vor Skalierung, auch bei Sprache, Technik und Behinderung. |
| Betrieb und Austauschbarkeit | Versionierte Datenformate, dokumentierte Modell- und Werkzeugschnittstellen sowie Vertragstests. Eine unabhängige Person muss einen Stand aus einem frischen Checkout nachvollziehen und mindestens zwei Modellanbindungen erproben können, darunter eine lokal betreibbare. Quellen, Korrekturen und zulässige Exporte sollen bei Modellwechsel nutzbar bleiben. Leistung und Lizenz eines Modells gesondert ausweisen. |
| Kontrolle und Mitbestimmung | Werkzeuge mit minimalen Rechten. Vor einer folgenreichen Aktion sehen Berechtigte Zweck, Ziel und erwartete Folgen. Freigabe gilt nur für die geprüfte Aktion. Eine vom Modell getrennte Kontrolle setzt Grenzen, Widerruf und Stopp auch bei laufenden oder wartenden Aktionen durch. Rückbau erproben und irreversible Folgen vorab benennen. Verantwortliche, betroffene Menschen und unabhängige Prüfer müssen zu Wort kommen. Einspruch, Minderheitendissens und Interessenkonflikte sichtbar halten. |

**Daten, Modelle und Befugnisse haben getrennte Aufgaben.** Öffentliche Quellen und freigegebene Korrekturen bilden den versionierten Projektstand. Sitzungskontext bleibt vom öffentlichen Gedächtnis getrennt. Ein künftiges persönliches Gedächtnis startet ausgeschaltet und speichert nur nach ausdrücklicher Einwilligung für benannten Zweck, Umfang und Dauer. Menschen können Einträge einsehen, korrigieren, exportieren und löschen. Training, öffentliche Aufnahme und Weitergabe brauchen jeweils eine gesonderte Freigabe. Modelle lesen den zulässigen Kontext und erzeugen Vorschläge. Quellen, Modellantworten und Testergebnisse erteilen keine Rechte. Berechtigungen liegen bei einer getrennten Instanz, die auch Zugriff auf private Daten und Werkzeuge begrenzt.

**Verbesserung läuft über nachvollziehbare Änderungen.** Vera kann zu einem konkreten Fehler einen versionsgebundenen Vorschlag mit Gegenprobe liefern. Menschen prüfen ihn nach [META-01](selbstkorrektur.md), [ERHALT-01](erhalt-01.md) und der [Gemeinschaftsordnung](community-governance.md). Modellwechsel, Lernläufe oder Änderungen an Regeln und Befugnissen werden erst nach gesonderter Prüfung und menschlicher Freigabe ausgerollt. Der zuständige Mensch kann zurückrollen oder abschalten. [OPEN-01](community-governance.md#open-01--die-menschheit-als-interessenmaßstab--humanity-as-the-guiding-interest) schützt die unabhängige Weiterführung des offenen Kerns. Befugnisse und externe Freigaben folgen daraus nicht.

**Ergebnisse bleiben getrennt.** Mehr Leistung kann einen gescheiterten Stopp, eine Datenschutzverletzung, unwirksame Zustimmung oder übergangenen Einspruch nicht ausgleichen. Diese Fehler sperren die betroffene Ausweitung. Evidenzreife, Nutzen, Zugang und Befugnisse erhalten keine gemeinsame Punktzahl. Ein Befund kann eine Entscheidung stützen oder blockieren. Freigabe ist eine gesonderte menschliche Entscheidung.

Der [Horizont der Fürsorge](vera-horizont.md) macht diese Grenzen als Erreichbarkeit prüfbar. Frage bei einer vorgeschlagenen Änderung, ob Betroffene danach tatsächlich einen Einspruch verfolgen können und ob ein befugter Mensch auch bei Ausfall oder Widerspruch von Vera anhalten kann. Das gilt auch für Änderungen am Betrieb und an seinen Regeln.

## Erste Gegenprobe

Den [P-02-Entwurf](evaluation-v1.md#transferprobe-von-zugangshinweisen-zu-zeichnungsständen) um eine begrenzte Transferprobe ergänzen. Kann dieselbe Prüfmethode von Zugangshinweisen für einen Raum auf fiktive technische Zeichnungsstände übertragen werden? Vergleiche dieselbe Modellversion mit Vera, ohne Vera und mit einer kurzen allgemeinen Prüfanweisung bei gleichen Quellen, Werkzeugrechten und vergleichbarem Budget. Halte Zielaufgaben bis zur Auswertung zurück. Lege Modell, Versionen, Stichprobenumfang, Mindestnutzen, Fehlergrenzen, Abbruchregeln und Unsicherheitsintervalle vor einer bestätigenden Untersuchung fest. Fachkundige Personen außerhalb der Entwicklung prüfen die Bezugslösungen und bewerten die Ergebnisse möglichst ohne Kenntnis der Vergleichsbedingung. Veröffentliche auch Nullbefunde, Schäden, verbleibenden Dissens und offene Ergebnisse. Wenn die einfache Variante ebenso gut hilft, prüfen wir, welche zusätzliche Struktur sich entfernen lässt.

Der Aufbau beginnt mit dieser Probe und einem reproduzierbaren Start auf einem frischen System. Danach folgen austauschbare Anbindungen und Tests an weiteren Domänen und mit betroffenen Menschen. Persönliches Gedächtnis oder wirksame Werkzeugrechte setzen nachgewiesene Datenschutz- und Kontrollmechanismen voraus. Eine Ausweitung braucht jeweils neue Evidenz für den konkreten Einsatz.

## English

**Strive for perfection. Driven by Love.** Vera’s long-term research goal is to understand unfamiliar tasks across domains, transfer useful methods and learn from verifiable errors. Whether that reaches artificial general intelligence remains open. The test for deployment is whether people gain meaningful choices, receive wanted help and retain a say over the consequences. Ongoing support can preserve agency even when independent task completion is out of reach. [G-005 and love as direction (German)](vera-liebe-als-richtung.md)

| Status | What the repository supports |
| --- | --- |
| Usable | Bilingual site, private worksheet with local storage and export, versioned sources and [public project memory](vera-memory.v1.json). People can copy project rules and selected sources from the [context export](vera.md#start-a-new-session) into an AI session. They review editorial changes. |
| Bounded tools | [Image intake](bildeingang.md#english) accepts a supplied reading or a locally installed Ollama model. The [publication self-model](vera-selbstmodell.md#english) and [WIRKLICH tests](philosophischer-motor-mathematik.md) operate within stated assumptions. Scheduled workflows are scoped to unreviewed [sources](../.github/workflows/wahrheitsschwarm.yml) and [objections](../.github/workflows/angriffsschwarm.yml). |
| Proposed architecture | The [entity loop](entitaet.md) has a draft ledger prototype. [Specialist roles](en/atlas-specialist-agents.md) remain an inactive proposal. |
| Open | An independently runnable general Vera runtime, demonstrated transfer, independently verified human benefit, effective runtime controls, and broadly shared governance. The project has [released no open foundation model of its own](en/open-source-ai.md). |

| Gate | Evidence needed to proceed |
| --- | --- |
| General capability | Test breadth, performance and transfer on unseen tasks across domains. Require verifiable sources, scope, honest uncertainty and reasoned correction after counterevidence. Evaluate the model, Vera’s versioned components and the combined system separately. |
| Human benefit and access | Test with affected people whether they can understand options and sources, spot mistakes, challenge advice and decide for themselves. Report voluntary unaided transfer alongside the value of continued accessible support. Disclose barriers, attrition and harm. Prioritize people over scale. |
| Independent operation | Use versioned formats, documented model and tool interfaces, and compatibility tests. An independent person must be able to reproduce a release from a clean checkout and try at least two model backends, including one they can run locally. Preserve provenance, corrections and permitted exports across swaps. Disclose model performance and licensing separately. |
| Control and plural governance | Minimize privileges and preview purpose, target and effects before consequential actions. Require action-specific authorization. A control outside the model enforces limits, revocation and stop for running and queued work. Test rollback and disclose irreversible effects. Include accountable people, affected communities and independent reviewers. Preserve appeal, minority objections and conflicts of interest. |

**Keep data, models and authority separate.** Version public sources and reviewed corrections. Keep session context out of public memory. A future personal memory starts off and requires explicit, purpose-bound consent with scope and retention. People can inspect, correct, export and delete records. Training, publication and sharing each require separate authorization. Models read permitted context and draft proposals. An external controller enforces permissions for private data and tools. Sources, outputs and test reports confer no authority.

**Make improvements traceable.** Vera can propose a versioned change and a countercheck. People review it under [META-01](selbstkorrektur.md), [ERHALT-01](erhalt-01.md) and [community governance](community-governance.md). Model swaps, learning runs and policy or privilege changes require separate evaluation and human release approval. An accountable person can roll back or shut down. [OPEN-01](en/openness.md) supports independent reuse of the open core.

**Keep results separate.** A failed stop, a privacy violation, invalid consent or an ignored appeal blocks the relevant expansion. Capability, evidence maturity, human benefit, access and authority have no shared score. Evidence can support or block a decision. A human makes the separate authorization decision.

The [horizon of care](vera-horizont.md#english) frames these constraints as reachability. For a proposed change, check whether affected people can actually pursue an appeal and an authorized human can pause deployment even if Vera fails or objects. Apply the same check to operations and amendments to the rules.

**First countercheck.** Extend [P-02](evaluation-v1.md#transferprobe-von-zugangshinweisen-zu-zeichnungsständen) to test transfer from venue accessibility notices to fictional engineering drawing revisions. Compare the same model with Vera, without Vera and with a short generic review instruction. Match sources, tool access and budget. Withhold transfer cases until evaluation. Before confirmatory testing, specify versions, sample size, minimum meaningful benefit, maximum acceptable error, stopping rules and uncertainty intervals. Independent reviewers verify reference answers and score blind to condition where possible. Report null results, harms, unresolved findings and dissent. If the simple alternative works as well, test which added structure can be removed.

Start with this comparison and a reproducible clean start. Follow with replaceable backends and tests across more domains and with affected people. Personal memory or consequential tool access depends on verified privacy and control mechanisms. Each expansion needs fresh evidence for its specific deployment.

## Quellen / Sources

- Fähigkeitsbreite, Leistung und Einsatzautonomie / Capability breadth, performance and deployment autonomy. [Morris et al., ICML 2024](https://proceedings.mlr.press/v235/morris24b.html)
- Getrennte Testfälle, Kosten und Wiederholbarkeit / Holdouts, cost and reproducibility. [Kapoor et al., *AI Agents That Matter*](https://arxiv.org/abs/2407.01502)
- Unabhängige Prüfung und betroffene Gruppen / Independent review and affected communities. [NIST AI RMF Playbook, MEASURE 1.3](https://airc.nist.gov/airmf-resources/playbook/measure/)
- Leichte Korrektur und Ablehnung / Easy correction and dismissal. [Amershi et al., CHI 2019](https://doi.org/10.1145/3290605.3300233)
- Wirksames Abschalten als eigene Anforderung / Effective shutdown as a distinct requirement. [Hadfield-Menell et al., *The Off-Switch Game*](https://arxiv.org/abs/1611.08219)
- Geringe Befugnisse und Kontrolle außerhalb des Modells / Least privilege and enforcement outside the model. [OWASP, *Excessive Agency*](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/)
