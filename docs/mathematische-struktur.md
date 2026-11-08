# Wie Vera einen Irrtum bemerken kann

[English](#english) · [Projektarchitektur](architektur.md) · [Mathematik des philosophischen Motors (M-03)](philosophischer-motor-mathematik.md)

Eine Person entdeckt einen Fehler in einem Satz, den alle anderen akzeptiert haben. Welche Teile von Vera müssen zusammenspielen, damit sie den Satz anfechten, die Entscheidung wiederfinden und deren Wirkung prüfen kann? Diese Karte ordnet die Funktionen nach ihrem Beitrag. Der betrachtete Ausgangsstand ist [94a9cc6](https://github.com/AlexanderR1991/Vera/tree/94a9cc6c6cc02089b9ce615ccb4b3b6b75e9c5ed).

**Code** bezeichnet eine nachlesbare Rechenvorschrift, **Simulation** ihre Untersuchung an konstruierten Fällen. **Entwurf** bezeichnet eine vorgeschlagene Beziehung oder Prüfung. Ob Menschen von einer Änderung profitieren, braucht eine eigene Beobachtung.

| Bereich | Mathematisches Objekt und Lesart | Stand und Fundstelle |
| --- | --- | --- |
| Architektur und Themenatlas | $Q(v)=D^+(v)\setminus\{v\}$. Folge vom geänderten Satz $v$ den Abhängigkeitskanten zu allen erreichbaren Folgesätzen. Sie kommen auf die Prüfliste. Eine bloße Analogie erzeugt keine solche Kante. | Code für vorgegebene Graphen. Die Vollständigkeit der eingetragenen Abhängigkeiten bleibt offen. [M-03 und Tests][motor] · [Fragenatlas][atlas] |
| Sprache, Bilder und Kunst | $r=(h(b),o,d,t)$ beschreibt vier Felder einer Lesung des Bildes $b$. $h(b)$ ist der SHA-256 der Bildbytes, $o$ die Beobachtung, $d$ die Deutung, $t$ ihre Gegenprobe. Zum selben Bild können mehrere Lesungen entstehen. | Code für Bildentwürfe und ein Prüfblatt für Kunst. Die Felder machen Zuschreibungen überprüfbar. [Bildeingang][bild] · [Kunst][kunst] |
| Metapher und Transfer | $H'=\{h\in H:h(x)=y\}$. Von den möglichen Regeln $H$ bleiben nach einer Beobachtung $(x,y)$ alle mit passender Vorhersage. Zwei Buslinien über dieselbe gesperrte Brücke widerlegen „zwei Wege reichen“. | Simulation mit getrennten Lern- und Transferfällen und expliziten Ausfällen. [Versuch][metapher] |
| Belege und Gegenbelege | $(s,a)\in\{0,1\}^2$. Das erste Bit zeigt, ob mindestens ein Beleg die Aussage stützt, das zweite, ob einer sie angreift. $(1,1)$ hält den Konflikt fest. Eine Kopie ändert keines der Bits. | Code für Veras Selbstauskunft. Die Qualität und Unabhängigkeit einer Quelle sind eigene Fragen. [Selbstauskunft][pol] · [Quellenprüfung][motor] |
| Selbstwissen und nächste Frage | Das Pages-Modell hat sechs zulässige Zustände. Im getrennten Vier-Zustands-Versuch minimiert der nächste Test $t$ den Wert $\max(n_{t,0},n_{t,1})$. Das ist die größere der beiden Anzahlen verbleibender Möglichkeiten. Teilt kein Test die Menge, entfällt die Empfehlung. | Zwei getrennte Simulationen mit verschiedenen Annahmen. [Pages-Modell][self] · [Auswahl des nächsten Tests][next] |
| Prüfgrad, Werte und Freiheit | $u\preceq v\iff\forall i:\,u_i\le v_i$ ordnet Kriterienvektoren nur teilweise. Eine Verbesserung überall ist eindeutig, ein Zielkonflikt kann offen bleiben. Im Richtungsprüfblatt löst ein einziges Nein die Überarbeitung aus. Ein Prüfgrad gilt für eine konkrete Fassung. | Code für Prüfbedingungen, normativ gewählte Kriterien, synthetische Wertprofile. [Pareto-Modell](mathematischer-pruefstand.md) · [Reifegrad][reife] · [Prüfblatt][care] · [M-03][motor] |
| Verständigung | $d(x,y)=\sum_{i=1}^{n}\lvert x_i-y_i\rvert/(4n)$. Das ist der mittlere Abstand von $n$ Antworten, geteilt durch vier. Vergleiche meine Wiedergabe mit deiner Selbstauskunft, dann unsere eigenen Standpunkte. Genaues Verständnis und Uneinigkeit sind miteinander vereinbar. | Simulation mit Antworten von 0 bis 4 und angenommener Gleichabständigkeit. [Brückenmodell][bruecke] |
| Einwand, Revision und Dissens | $L_{k+1}=T(L_k,e)$ ist ein partieller Übergang. Ein zulässiges Ereignis $e$ erweitert das bisherige Protokoll $L_k$. Ein Entwurf lässt die Aussageversion bestehen. Für eine Entscheidung prüft der Kern die aktuelle Fassung und verlangt eine externe Freigabe. | Lokaler Entitätskern und menschlich verantwortetes Verfahren. Eine protokollierte Entscheidung allein beantwortet die Wirkungsfrage noch nicht. [Entitätskern][ledger] · [Korrekturverfahren][loop] |
| Schnittstellen und Agenten | Sei $g(r)$ die angegebene Quellengruppe eines Belegs $r$. Für drei Belege aus derselben Gruppe gilt $\#\{g(r_1),g(r_2),g(r_3)\}=1$. Ein vierter Prüfbericht derselben Herkunft schafft keine zweite Quellengruppe. | Code für begrenzte Prüfaufträge und Herkunftsangaben. Tatsächliche Unabhängigkeit braucht eine Untersuchung der Quellen. [Prüfaufträge][agenten] · [Quellenprüfung][motor] |
| Gedächtnis und Zeit | $v\preceq w$ bedeutet, dass $v=w$ oder $v$ ein Vorfahr von $w$ ist. Das Observatorium wählt pro vertretenem UTC-Tag den letzten Stand entlang des ersten Elternteils. Gedächtniseinträge nennen Beobachtungen und Grenzen. Auch ein späterer Stand kann Fähigkeiten verlieren. | Code für historische Stände und Einträge. Eine Änderung an einem Tag kann auch eine frühere Fähigkeit zurücknehmen. [Zeitreihe][zeit] · [Gedächtnis][memory] |
| Fortsetzung, Stopp und Erhalt | $\delta(a,c,1)=\mathrm{pause}$ für alle zulässigen Angaben zu Zugang $a$ und Korrektur $c$. Ein Stopp hat Vorrang. Separat vergleicht die Wiederherstellungsprobe die Commit-IDs und prüft die Git-Objekte der Kopie. | Code für die Auswahl einer Handlung und eine lokale, vorübergehende Wiederherstellungsprobe. [Stoppregel][stopp] · [Wiederherstellung][recovery] |
| Zugang und Veröffentlichung | $s_\ell\leadsto k_\ell$ und $s_\ell\leadsto d_\ell$, für $\ell\in\{\mathrm{de},\mathrm{en}\}$. Von der Startseite führen vorgegebene Verweise zum Kritiklink und zum lokalen Entwurf. Die öffentliche Prüfung vergleicht zusätzlich die ausgelieferte Revision. | Code für erzeugte HTML-Seiten und einen öffentlichen Abruf mit Revisionsvergleich. Menschliche Verständlichkeit und tatsächlicher Eingang eines Beitrags bleiben gesondert zu prüfen. [Zugangsprüfung][access] · [Veröffentlichung][pages] |

### Wo das Korrekturversprechen scheitern kann

**Was sich aus einer Zusammenfassung beweisen lässt.** Nenne die beiden Einwände A und B. Im Fall $x$ beantwortet eine Entscheidung A, im Fall $y$ beantwortet sie B. Sei $S$ eine Zusammenfassung, die nur Einwandszahl und letzte Entscheidungsart zeigt. In beiden Fällen lautet sie „zwei Einwände, Regel eingegrenzt“. Dann gilt $S(x)=S(y)$, obwohl der offene Einwand verschieden ist. Jede Funktion, die allein diese Zusammenfassung liest, muss für beide Fälle dasselbe Ergebnis liefern. Sie kann also nicht in beiden Fällen den offenen Einwand richtig benennen. Eine erhaltene, lesbare Zuordnung zur konkreten Einwand-ID macht die beiden Fälle unterscheidbar.

**Gedankenexperiment.** Ein Einwand wird gespeichert, danach trifft nie eine Person eine Entscheidung. In jedem endlichen Ausschnitt dieser Geschichte ist der Einwand erhalten. Trotzdem erreicht er nie eine Entscheidung. Dauerhafte Sichtbarkeit und tatsächliche Bearbeitung sind zwei verschiedene Eigenschaften. Dass jemand einen Fork anlegt, könnte außerdem einen anderen Zweck, eine Übersetzung oder ein Experiment ausdrücken. Die Forkzahl verrät nicht, was mit dem Einwand geschah.

**Vorgeschlagene Gegenprobe, noch offen.** Gib Erstlesenden freiwillig zwei gleich schwere Aufgaben in wechselnder, ausgeloster Reihenfolge. In einer Fassung sehen sie Ereignisse chronologisch, in der anderen zusätzlich die Verbindung vom Einwand zur Entscheidung. In jedem Fall gibt es zwei Einwände und eine Entscheidung, die genau einen davon behandelt. Lege die richtige Zuordnung und die Zeitgrenze vorab fest. Erfasse getrennt, wie oft Personen die Entscheidung richtig zuordnen, den offenen Einwand fälschlich als erledigt melden und die Aufgabe abbrechen. Die Hypothese lautet, dass die Verknüpfung die Zuordnung verbessert, ohne häufiger offene Einwände zu verdecken. Bei ausreichender Präzision sprächen ausbleibende Verbesserung oder zusätzliche Fehlabschlüsse gegen sie. Bei zu wenig Beobachtungen bleibt das Ergebnis offen. Eine anschließende Feldprobe müsste eigens verfolgen, ob ein eingereichter Einwand tatsächlich eine begründete Antwort erhält. [Bestehender Evaluationsentwurf][eval]

## English

One person finds a mistake in a claim that everybody else accepts. Which parts of Vera help them challenge it, find the decision and check its effect? This map starts at [revision 94a9cc6](https://github.com/AlexanderR1991/Vera/tree/94a9cc6c6cc02089b9ce615ccb4b3b6b75e9c5ed). **Code** means an inspectable procedure. **Simulation** means testing with constructed cases. A **proposal** still needs to be tried.

| Area | Object, interpretation and scope |
| --- | --- |
| Architecture and topics | $Q(v)=D^+(v)\setminus\{v\}$. From a changed premise $v$, follow dependency edges to all reachable consequences and queue them for review. An analogy alone creates no such edge. The code takes a supplied graph whose completeness remains open. [M-03 tests][motor] · [Question atlas][atlas] |
| Language, images and art | $r=(h(b),o,d,t)$ describes four fields of a reading of image $b$. The SHA-256 hash identifies the image bytes, $o$ is an observation, $d$ an interpretation and $t$ a countertest. The same image can sustain several readings. [Image intake][bild] · [Art worksheet][kunst] |
| Metaphor and transfer | $H'=\{h\in H:h(x)=y\}$. After observation $(x,y)$, keep all candidate rules whose prediction matches it. Two bus routes sharing a closed bridge defeat “two routes suffice”. The simulation tries the remaining rules on new networks. [Transfer experiment][metapher] |
| Competing evidence | $(s,a)\in\{0,1\}^2$. The first bit tracks whether any record supports a claim, the second whether any record challenges it. $(1,1)$ retains both. Duplicating a record changes neither bit. Quality and independence require separate checks. [Entity queries][pol] · [Provenance tests][motor] |
| Self-knowledge and the next test | The Pages model starts with six possible worlds. In a separate four-state simulation, choose a test $t$ minimizing $\max(n_{t,0},n_{t,1})$, the larger count of possibilities remaining after either outcome. If no test splits the set, none is recommended. [Pages model][self] · [Test selection][next] |
| Review, values and agency | $u\preceq v\iff\forall i:\,u_i\le v_i$ partially orders the criteria vectors. An improvement on every criterion is comparable, while trade-offs can remain open. A single “no” on the separate agency worksheet triggers revision. A review grade applies to one version. [Pareto model](mathematischer-pruefstand.md) · [Maturity][reife] · [Agency worksheet][care] · [M-03][motor] |
| Understanding | $d(x,y)=\sum_{i=1}^{n}\lvert x_i-y_i\rvert/(4n)$ is the mean distance between $n$ responses divided by four. Apply it first to my restatement and your self-report, then to our own positions. The simulation assumes equal spacing on a 0–4 scale. [Bridge model][bruecke] |
| Objections and dissent | $L_{k+1}=T(L_k,e)$ is a partial transition. A valid event $e$ extends the ledger $L_k$. A draft preserves the claim version. A decision requires a matching version and external authorization. Its effect in another case remains open. [Local inquiry ledger][ledger] · [Correction procedure][loop] |
| Interfaces and agents | Let $g(r)$ be the declared source group of evidence record $r$. For three records in the same group, $\#\{g(r_1),g(r_2),g(r_3)\}=1$. Another report from that origin adds no source group. Actual independence requires investigating those origins. [Review briefs][agenten] · [Provenance tests][motor] |
| Memory and time | $v\preceq w$ means that $v=w$ or $v$ is an ancestor of $w$. The observatory takes the last first-parent revision in Git order for each represented UTC date. Memory entries record observations and limits. A later revision can remove a capability. [Time series][zeit] · [Memory][memory] |
| Continuing, stopping and recovery | $\delta(a,c,1)=\mathrm{pause}$ for all valid access and correction inputs $a,c$. A stop takes priority. A separate local drill compares the restored commit ID and checks the temporary copy’s Git objects. [Stop rule][stopp] · [Recovery][recovery] |
| Access and publication | $s_\ell\leadsto k_\ell$ and $s_\ell\leadsto d_\ell$, for $\ell\in\{\mathrm{de},\mathrm{en}\}$. Links lead from the homepage to the public objection link and to the local drafting route. The public check also compares the served revision. Comprehension and actual submission require further observation. [Access check][access] · [Deployment][pages] |

**What a summary can prove.** In case $x$ a decision answers objection A. In case $y$ it answers B. Let $S$ return only the number of objections and the last decision type. Both summaries say “two objections, claim narrowed”. Thus $S(x)=S(y)$, although the open objection differs. Any function of that summary alone must return the same result for both cases, so it cannot identify the open objection correctly in both. Keeping a readable link to the specific objection ID distinguishes them.

**Counterexample.** An objection can remain visible indefinitely without anyone deciding it. Every finite prefix of that history preserves the record. The objection still never receives an answer. A fork count cannot distinguish this failure from someone forking a project to translate or experiment.

**Proposed test, still open.** Invite first-time readers to tackle two matched cases in random order. Compare a chronological event list with the same information plus explicit objection-to-decision links. Each case contains two objections and one decision addressing only one of them. Fix the answer key and time limit in advance. Count correct matches, false reports that the other objection was settled, and abandoned tasks separately. The hypothesis predicts better matching without more false closures. A sufficiently precise finding of no improvement or more false closures would count against it. Imprecise results remain open. A separate field test must follow a submitted objection through to a reasoned response. [Evaluation proposal][eval]

[motor]: ../tests/philosophical-motor.test.mjs
[atlas]: fragenatlas.md
[bild]: ../src/lib/vera-bild.mjs
[kunst]: ../src/lib/art-inquiry.mjs
[metapher]: ../src/lib/metapher.mjs
[pol]: ../src/lib/vera-entity.mjs
[self]: vera-selbstmodell.md
[next]: ../src/lib/erkenntnis.mjs
[reife]: ../src/lib/maturity.mjs
[care]: ../src/lib/inquiry-direction.mjs
[bruecke]: ../src/lib/intersubjective.mjs
[ledger]: ../src/lib/entity-core.mjs
[loop]: selbstkorrektur.md
[agenten]: ../scripts/vera-swarm.mjs
[zeit]: ../src/lib/observatory.mjs
[memory]: ../scripts/vera-memory.mjs
[stopp]: ../src/lib/vera-life-drive.mjs
[recovery]: vera-wiederherstellung.md
[access]: ../scripts/check_vera_entry.py
[pages]: ../.github/workflows/pages.yml
[eval]: evaluation-v1.md
