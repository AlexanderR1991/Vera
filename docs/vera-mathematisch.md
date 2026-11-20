# Vera mathematisch: vom ersten Zugang zur begründeten Korrektur

[English](#english) · [Mathematische Landkarte](mathematische-struktur.md) · [Philosophischer Motor](philosophischer-motor-mathematik.md)

**Ein Mensch kommt mit einer Frage. Er soll mit verständlichen Gründen, einem eigenen Urteil und einem möglichen nächsten Schritt weitergehen können.** Auch „Ich widerspreche“, „Das weiß ich noch nicht“ und „Ich höre hier auf“ sind vollständige Ergebnisse.

Dieses Modell verbindet vorhandene Bausteine zu einer prüfbaren Begegnung. Es beschreibt, was Vera anbieten und auseinanderhalten soll. Was ein Mensch dabei erlebt oder später im Denken behält, muss er selbst ausdrücken oder in einer freiwilligen Untersuchung zeigen.

**Stand · 14. November 2026:** Architekturentwurf mit ausführbarer, rein synthetischer Gegenprobe. Ausgangspunkt ist [4ade021](https://github.com/AlexanderR1991/Vera/tree/4ade021830a14eb823337b127c4a2e57f88720af). Die Verbindung ist kein trainiertes Vera-Modell, keine Messung eines inneren Zustands und kein Wirksamkeitsnachweis.

## In einer Minute ausprobieren

Im Checkout mit Node.js ab 22.12, ohne Paketinstallation oder API-Schlüssel:

~~~sh
node scripts/vera-begegnung.mjs de
node --test tests/vera-encounter.test.mjs
~~~

Die [Gegenprobe](../scripts/vera-begegnung.mjs) gibt acht beschriftete Momentaufnahmen mit Eingaben und Ergebnissen als JSON aus. Alle Personen, Quellen und Antworten sind erfunden.

| Moment | Was die Rechnung sichtbar hält |
| --- | --- |
| Zwei Personen geben sich genau wieder | Wiedergabegenauigkeit in beiden Richtungen 1, Ähnlichkeit ihrer eigenen Positionen 0; ein Nein zum Vorschlag bleibt bestehen. |
| Eine Meldung wird kopiert | Zwei Quellenkennungen, eine deklarierte Herkunftsgruppe. Tatsächliche Unabhängigkeit bleibt ungeprüft. |
| Eine Beobachtung widerspricht der Meldung | Stütze und Gegenbeleg ergeben einen Konflikt. Die Kopie überstimmt ihn nicht. |
| Die Aussage wird geändert | Alte Belegzuordnungen passen nicht automatisch zur neuen Fassung. Zwei abhängige Knoten kommen auf die Prüfliste; eine Analogie allein nicht. |
| Beide Beispielrollen sagen Ja | Im Datensatz liegt Zustimmung genau zu diesem Vorschlag vor. Das authentifiziert keine realen Menschen. |
| Aus einem Besuch wird eine Jahresbuchung | Auch bei vergessener Versionsänderung passen die alten Antworten nicht mehr zum neuen Wortlaut. |
| Pause oder Stopp | Die Auswertung endet vor dem Lesen weiterer Inhaltsfelder. |

Ein Verein sucht einen Raum. Eine Ankündigung nennt einen stufenlosen Eingang; eine fiktive Ortsbeobachtung meldet eine Stufe. Die richtigen Eingaben kommen nicht automatisch aus der Welt. Genau dort liegt eine Grenze der Rechnung.

## 1. Vera als zusammengesetzter Zustand

Wir schreiben den öffentlichen Projektstand als

$$
R_t=(G_t,L_t,\Pi_t,\nu_t).
$$

$G_t$ ist der Graph aus Fragen, Aussagen, Quellen und typisierten Beziehungen. $L_t$ hält Entwürfe, Einwände und Entscheidungen fest. $\Pi_t$ bezeichnet die offenliegenden Prüf- und Verfahrensregeln. $\nu_t$ ist die Git-Revision. Der Index $t$ ordnet Fassungen; ein späterer Stand kann schlechter sein.

Eine Begegnung führt einen davon getrennten Zustand

$$
X=(q,p,A,B,U,C,J).
$$

| Feld | Bedeutung | Umsetzung in der Gegenprobe |
| --- | --- | --- |
| $q$ | Ausdrücklich benannte Frage | Text im synthetischen Datensatz |
| $p$ | Fortsetzen, Pause oder Stopp | Vorgelagerte Abbruchregel |
| $A$ | Zugang zu Einstieg, Quelle und Einwand | Drei Angaben aus $\{\mathrm{ja},\mathrm{nein},?\}$ |
| $B$ | Belege und Gegenbelege zu einer genauen Aussagefassung | Bestehende Belegprüfung und Herkunftsanalyse |
| $U$ | Genauigkeit der Wiedergabe ausdrücklich gegebener Antworten | Bestehendes Brückenmodell M-02, sonst unbekannt |
| $C$ | Antworten auf einen konkreten Handlungsvorschlag | Bestehende Prüfung der versionsgebundenen Vereinbarung |
| $J$ | Von einer geänderten Aussage abhängige Knoten | Bestehende Verfolgung von Abhängigkeiten |

Für $p=\mathrm{fortsetzen}$ liefert die Zusammensetzung

$$
\mathcal V(X)=(A,B,U,C,J).
$$

Bei Pause oder Stopp liefert sie nur diesen Zustand und keine weiteren Auswertungen. **Das Tupel wird nicht zu einer Gesamtpunktzahl addiert.** Ein erreichbarer Link beweist kein Verständnis. Eine genaue Wiedergabe erteilt keine Zustimmung. Zustimmung liefert keinen neuen Wirkungsbeleg.

Im [Kompositionsmodul](../src/lib/vera-encounter.mjs) entsprechen die Felder den Ausgaben **access**, **evidence**, **understanding**, **agreement** und **review_queue**. Es nimmt nur ausdrücklich synthetische Eingaben an. Ein fehlender Brückenversuch bleibt **null**; ohne zugeordnete Belege ist der Belegstatus **open**. Null, unbekannt und nein haben unterschiedliche Bedeutungen.

## 2. Was von Vera im Denken bleiben soll

Das Gestaltungsziel ist eine übertragbare Prüfmethode:

> Was behaupte ich? Woran könnte ich mich irren? Welcher nächste Schritt könnte den Unterschied zeigen?

Die Methode darf mit eigener Sprache weiterverwendet, verändert oder verworfen werden. Wiederkehr, Verweildauer und Zustimmung zu Vera reichen als Nachweis nicht aus. Fortlaufend gewünschte Unterstützung bleibt ebenso wertvoll wie selbstständiger Transfer.

Sei $h$ ein innerer Zustand und $o=f(h)$ eine verfügbare Beobachtung, etwa ein Klick. Ein Modell erlaubt zwei Zustände $h_1\ne h_2$ mit demselben Klick: neugierige Zustimmung und skeptische Quellenprüfung. Dann gilt

$$
f(h_1)=f(h_2).
$$

**Grenze der Identifizierbarkeit:** Keine Funktion $g$ dieser Beobachtung kann beide Zustände sicher zurückgewinnen. Sonst müsste zugleich $g(f(h_1))=h_1$ und $g(f(h_2))=h_2$ gelten, obwohl die Argumente gleich sind. Widerspruch.

Dies ist eine Aussage über ein nicht eindeutiges Beobachtungsmodell, keine vollständige Theorie des Denkens. Für die Gestaltung folgt daraus: Vera fragt nach einer freiwilligen Wiedergabe oder einem konkreten Einwand, statt aus einem Klick Verständnis, Überzeugung oder Einwilligung abzuleiten. Die Gegenprobe erzeugt kein psychologisches Besucherprofil.

## 3. Verstehen, Belege und Zustimmung getrennt berechnen

### Wiedergabe

Für $m>0$ gemeinsame Fragen mit Antworten aus $\{0,1,2,3,4\}$ gilt im bestehenden M-02-Modell

$$
d(x,y)=\frac{1}{4m}\sum_{j=1}^{m}|x_j-y_j|.
$$

Mit eigenen Antworten $a,b$ und gegenseitigen Wiedergaben $\hat a_B,\hat b_A$ sind

$$
U_{B\to A}=1-d(a,\hat a_B),\qquad
U_{A\to B}=1-d(b,\hat b_A),\qquad
K=1-d(a,b).
$$

Setze $a=(0,0)$, $b=(4,4)$, $\hat a_B=a$, $\hat b_A=b$. Dann ist $U_{B\to A}=U_{A\to B}=1$, während $K=0$. Genaues Wiedergeben und maximale Positionsverschiedenheit sind in diesem Modell vereinbar.

Die [Beispieldaten](examples/vera-encounter.json) benennen beide Fragen und die gemeinsamen Skalenanker. Gleich große Abstände zwischen den Stufen sind eine Annahme. Die Rechnung prüft Zahlen und Vektorlängen; gemeinsame Bedeutung, Ehrlichkeit, Freiwilligkeit und tatsächliches Erleben prüft sie nicht. [M-02 und Grenzen](mathematik-des-dazwischen.md)

### Beleglage und Herkunft

Für die zur aktuellen Fassung passend zugeordneten Belege $E_v$ definieren wir

$$
B(E_v)=
\left(
\mathbf 1[E_v^+\ne\varnothing],
\mathbf 1[E_v^-\ne\varnothing]
\right).
$$

$(0,0)$ heißt offen, $(1,0)$ gestützt, $(0,1)$ bestritten, $(1,1)$ Konflikt. Das sind **Zustände der zugeordneten Belegliste**, keine Wahrheitswahrscheinlichkeiten oder Qualitätsurteile.

Eine Kopie eines vorhandenen Belegs ändert die Bits nicht. Ein Gegenbeleg macht aus $(1,0)$ den Konflikt $(1,1)$, auch wenn tausend Kopien die erste Aussage wiederholen. Die [Herkunftsanalyse](../src/lib/philosophical-motor.mjs) zählt deklarierte Quellengruppen. Unterschiedliche Kennungen beweisen keine Unabhängigkeit.

### Bindung an die genaue Fassung

Eine Vergleichskennung enthält das Tupel

$$
\kappa(x)=(\mathrm{id},\mathrm{version},\mathrm{wortlaut},\mathrm{aussageart?}).
$$

Der Code serialisiert es als JSON-Array; bei Handlungsvorschlägen ist die Aussageart **null**. Eine Veränderung von Wortlaut oder Aussageart verändert die Kennung auch bei gleichbleibender Versionsnummer. Das verhindert einfache Zuordnungsfehler. **Die Kennung ist keine Signatur.**

Nur Belege mit passender Kennung gehen in $B(E_v)$ ein. Andere bleiben unter **unmatched_ids** sichtbar und müssen erneut auf ihre Zuordnung geprüft werden. Das automatische Austauschen einer Kennung wäre kein Nachweis, dass der Beleg inhaltlich passt.

Zustimmung gehört gesondert zu $\kappa(P)$, der genauen Fassung eines Vorschlags $P$. Fehlende, alte oder anders zugeordnete Antworten zählen als ausstehend. Eine fiktive Vereinbarung setzt im bestehenden Prüfer ein Ja aller **benannten** Rollen sowie positiv angegebene Machbarkeit und Schutzlage voraus. Nicht benannte Betroffene bleiben eine mögliche Lücke. Rechteprüfung, Identität und reale Einwilligung müssen außerhalb dieses Datensatzes geprüft werden. [Regel und Grenzen](philosophischer-motor-mathematik.md#6-konsens-als-genaue-vereinbarung-nicht-als-mittelwert)

## 4. Wie ein Einwand das Repository verändern kann

Eine korrigierte Aussage $v$ betrifft nicht automatisch alles, was ähnlich klingt. Sei $D^+(v)$ die Menge der über Abhängigkeitskanten erreichbaren Knoten. Dann ist

$$
J(v)=D^+(v)\setminus\{v\}.
$$

Die Kante zeigt von der **Voraussetzung zum abhängigen Knoten**: Zugangsaussage → Besuchsplan → Einladung. Das ist die bestehende Konvention von **traceRevisionImpact**, trotz des Kantennamens **depends_on**. Eine Ähnlichkeitskante zu einem anderen Raum gehört nicht dazu. Zyklen werden einmal besucht.

$J$ ist eine **Prüfliste**. Sie besagt weder, dass alle Einträge falsch sind, noch dass eine Korrektur erfolgt ist. Fehlende Graphkanten können betroffene Schlüsse verbergen.

Ein möglicher öffentlicher Übergang bleibt

$$
R_{t+1}=
\begin{cases}
T(R_t,e,H), & \text{bei geprüftem Entwurf und gültiger menschlicher Freigabe }H,\\
R_t, & \text{sonst; der Vorschlag bleibt ein Entwurf.}
\end{cases}
$$

$T$ benennt hier das verantwortete Versionsverfahren. Die Gegenprobe ruft es **nicht** auf. Sie verändert keinen öffentlichen Projektstand, keine Prüfgrade und keine Trainingsgewichte. Der vorhandene [Entitätskern](entitaet.md) protokolliert Einwände und Entscheidungen; Authentifizierung und Veröffentlichung brauchen eine vertrauenswürdige Umgebung.

~~~mermaid
flowchart TD
  Q["Eigene Frage"] --> P{"Weitergehen?"}
  P -->|Pause oder Stopp| S["Hier aufhören"]
  P -->|Ja| B["Gründe und Gegenbelege"]
  B --> U["Wiedergabe und eigenes Urteil"]
  U -->|Einwand| O["Korrekturentwurf"]
  O --> H{"Menschliche Prüfung"}
  H -->|Revision angenommen| R["Neue Fassung und Prüfliste"]
  H -->|Offen oder abgelehnt| D["Begründung und Dissens"]
  R --> B
~~~

Das Diagramm beschreibt einen möglichen menschlichen Ablauf. Die Momentaufnahmen simulieren ausgewählte Zustände daraus; sie sind kein laufender Forumsdienst.

## 5. Wo die Teile im Repository liegen

| Aufgabe | Baustein |
| --- | --- |
| Einstieg, Quellen und Einwand auffinden | [Zugangsprüfung](../scripts/check_vera_entry.py); im neuen Versuch nur deklarierte Eingaben |
| Wiedergeben und uneinig bleiben | [Brückenrechnung](../src/lib/intersubjective.mjs) |
| Stütze und Gegenbeleg getrennt halten | [Belegprüfung](../src/lib/vera-entity.mjs) |
| Herkunft, Vereinbarung und abhängige Aussagen | [Philosophischer Motor](../src/lib/philosophical-motor.mjs) |
| Einwände, Entscheidungen und alte Fassungen erhalten | [Entitätsprotokoll](../src/lib/entity-core.mjs), separat von der Gegenprobe |
| Einen freiwilligen Versuch ändern oder beenden | [Einladungskern](../src/lib/care-step.mjs), separat von der Gegenprobe |
| Teilrechnungen gemeinsam prüfen | [Neues Kompositionsmodul](../src/lib/vera-encounter.mjs) · [Tests](../tests/vera-encounter.test.mjs) |

Pause und Stopp gelten jeweils für den aktuellen Aufruf. Die Komposition ist kein dauerhafter Sitzungsautomat und stoppt keine extern laufenden Aktionen.

Die Komposition besitzt keine Modellaufrufe, Dateischreibvorgänge, Netzwerkanfragen oder Speicherung. Das Terminalprogramm liest die öffentliche Beispieldatei und gibt seinen Bericht aus. Es startet keinen Agentenschwarm.

## 6. Woran der Nutzen scheitern könnte

**Offene Hypothese:** Dieser Einstieg hilft Erstlesenden eher, Gründe zu prüfen und einen konkreten Einwand zu formulieren, als derselbe Inhalt ohne diese Verknüpfung.

Eine freiwillige Vergleichsprobe braucht identische Informationen, vergleichbare Lesezeit und vorab festgelegte Aufgaben. Vergleiche die verknüpfte Darstellung mit einer kurzen einfachen Prüfliste. Prüfe getrennt:

- Finden Menschen die Quelle und die genaue Aussagefassung?
- Können sie einen offenen Einwand benennen, ohne ihn fälschlich für erledigt zu halten?
- Können sie die Methode an einem neuen Fall anwenden, gegebenenfalls mit gewünschter Unterstützung?
- Erleben sie Zustimmungsdruck, und bleibt Ablehnen oder Aufhören praktisch möglich?

Aufgaben, Bezugslösungen, Mindestnutzen, zulässige Fehler, Abbruchregel und Auswertung werden vorher festgelegt. Freiwillig beendete Versuche und fehlende Daten sind keine Zustimmung. Menschen außerhalb der Entwicklung sollten Bezugslösungen prüfen und Antworten ohne Kenntnis der Darstellungsgruppe bewerten. Speicherung oder Veröffentlichung ihrer Antworten braucht einen eigenen, verständlichen Einwilligungsweg.

**Stärkster Einwand:** Zusätzliche Begriffe, Formeln und Prüfschritte können den Zugang erschweren oder Autorität vortäuschen. Hilft die einfache Prüfliste ebenso gut, verdient sie den Vorrang. Mehr Verständnis bei gleichzeitig höherem Zustimmungsdruck wäre kein ausreichender Erfolg. Die Codeprüfungen liefern hierzu noch keine menschlichen Ergebnisdaten. [Evaluationsentwurf](evaluation-v1.md) · [AGI-Horizont](agi-horizont.md)

## English

**A person arrives with a question and should be able to leave with understandable reasons, their own judgment and a possible next step.** Disagreement, uncertainty, pausing and stopping are valid outcomes.

This proposed composition of existing Vera components includes an executable synthetic demonstration. It does not claim a trained Vera model or validated human benefits.

~~~sh
node scripts/vera-begegnung.mjs en
node --test tests/vera-encounter.test.mjs
~~~

Labels and notes switch to English; fictional source wording stays German so both runs evaluate identical inputs. Eight snapshots contain both inputs and results.

The public project state is $R_t=(G_t,L_t,\Pi_t,\nu_t)$: typed graph, inquiry ledger, review rules and Git revision. Encounter state $X=(q,p,A,B,U,C,J)$ keeps question, participation, access, evidence, restatement, scoped agreement and revision queue separate. Active participation produces $(A,B,U,C,J)$. Pause and stop return before evaluating further content. There is no combined human or moral score. This is a stateless per-call gate, not a persistent session controller or a stop mechanism for external actions.

**Limits of inference.** If two different inner states produce the same observed click, no function of that click can recover both uniquely. A visit cannot establish comprehension, belief or consent. The proposed transferable method asks: What am I claiming? What could show an error? What could I check next? Continued support can be valuable, too.

**Separate calculations.** Existing M-02 functions compute response distances on an assumed equally spaced 0–4 scale. Both fixture restatement accuracies are 1 while position agreement is 0. An explicit refusal of the proposed action remains a refusal. Common questions and scale anchors are stated in the fixture; arithmetic cannot validate their meaning or voluntary use.

The evidence pair records whether current, assigned support and challenge records exist. A copied source changes neither bit. Counterevidence yields conflict rather than a majority vote. Declared source families are counted without claiming actual independence.

**Exact snapshots.** Comparison keys serialize ID, version, wording and optional claim type. Changed wording or type breaks the match even with a reused version number. Unmatched evidence remains visible for reassessment. Old replies cannot become assent to a new proposal. Keys are not signatures; the fixture does not authenticate people, verify evidence or confer rights.

**Correction.** From a revised claim, the existing routine follows dependency edges from premise to dependent, excludes mere analogies and terminates on cycles. This yields a review queue, not a finding that every dependent is false or repaired. Missing edges remain a limitation. Public revision needs the existing human review procedure. This composition does not publish, change maturity grades or train weights.

**Counterchecks.** Tests cover accurate restatement with dissent, source echoes, counterevidence, evidence invariance under changed agreement, missing observations, changed claim type or wording, obsolete consent, cycles, pause and stop, malformed input, duplicate IDs, input immutability and both CLI languages.

**Human evaluation remains open.** Compare this linked presentation with a simple checklist at matched information and reading time. Predefine source-finding, unresolved-objection and transfer tasks, reference answers, meaningful benefit, acceptable errors, stopping rules and analysis. Report pressure to agree and barriers to refusal separately. Missing data and withdrawal are not assent. Independent reviewers and a separate voluntary data-consent process are needed. More complexity or pressure would count against the design; prefer an equally useful simple checklist.

[Code](../src/lib/vera-encounter.mjs) · [Fixture](examples/vera-encounter.json) · [Tests](../tests/vera-encounter.test.mjs) · [Mathematical map](mathematische-struktur.md#english) · [Evaluation](evaluation-v1.md) · [AGI horizon](agi-horizont.md#english)
