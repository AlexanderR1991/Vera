# M-03 · Mathematik des philosophischen Motors

**WIRKLICH · Formaler Gesamtentwurf 0.1 · 7. November 2026 · nicht wissenschaftlich validiert, nicht unabhängig begutachtet.**

> **Wir modellieren, warum eine Richtung begründbar sein könnte – nicht, wem die Wahrheit gehört.**
>
> Ein Motor, der bei Unwissenheit eine Zahl erfindet, erfüllt WIRKLICH nicht. Die mathematisch notwendige Ausgabe kann auch **offen**, **mehrdeutig**, **nicht vergleichbar**, **unzulässig** oder **begründet umstritten** heißen.

**Geltung:** Dieses Dokument vereinheitlicht die bereits veröffentlichten Forschungsbausteine [M-01](mathematischer-pruefstand.md), [M-02](mathematik-des-dazwischen.md), [META-01](selbstkorrektur.md), die [Reifegrade R0–R4](erkenntnisreife.md), den [Grundfragen-Kreislauf](grundfragen-kreislauf.md), die [Schnittmengen](schnittmengen.md) und die [KI-Charta](ki-charta.md). Der Richtungsindex und die Fachagenten sind **zusätzliche, noch offene Vorschläge** aus [PR #73](https://github.com/AlexanderR1991/Vera/pull/73) und [PR #81](https://github.com/AlexanderR1991/Vera/pull/81); sie werden durch M-03 **nicht** automatisch angenommen oder aktiviert.

**Erkenntniskategorien für alle nachfolgenden Abschnitte:**
- **Definition / Satz mit Beweis:** formale Folgerung aus ausdrücklich gewählten Voraussetzungen.
- **Modellannahme:** festgelegte Skala, Typisierung, Verfahren oder Governance-Entscheidung.
- **Empirische Hypothese:** nur mit unabhängig durchgeführtem Versuch testbar.
- **Normatives Postulat:** begründungsbedürftige Wertannahme; keine naturwissenschaftlich bewiesene Moral.
- **Implementiert:** der reproduzierbare, rein synthetische M-03-Prototyp; **kein** laufender KI-Synthesedienst, keine reale Entscheidungsmaschine.

## 1. Nicht eine Zahl, sondern ein typisiertes Ergebnis

Für eine präzise Frage \(q\), einen Kontext \(c\), eine Version \(t\), Belege \(E\), eine Menge von Wertprofilen \(Z\) und verzeichnete Einwände \(O\) ist die **vorgeschlagene Ausgabestruktur**

\[
\mathcal{M}(q,c,E,Z,O,t) =
(\text{Aussageart},\,\text{Befund},\,\text{Gegenprobe},\,\text{Unsicherheit},\,
\text{Reife},\,\text{Dissens},\,\text{Richtung?},\,\text{nächster Test},\,\text{Version}).
\]

**In Worten:** Der Motor gibt immer getrennte Felder zurück: welche Art Aussage geprüft wurde, was die Gründe tragen, was dagegen spricht, was offenbleibt, wie geprüft die betreffende Fassung ist, wo begründeter Dissens existiert, ob eine kontextgebundene Richtung überhaupt zulässig ist und woran die Aussage weiter scheitern könnte.

Das **Fragezeichen** bei Richtung ist wesentlich: Ein Index ist optional, keine Pflichtausgabe. Auch das System selbst – Auswahl der Kriterien, Normen, Übersetzung, Aggregation und Schutzziele – ist kritisierbar.

### Aussagearten und geeignete Prüfungen

| Typ | Leitfrage | Geeignete Prüfung | Unzulässiger Kurzschluss |
| --- | --- | --- | --- |
| Empirisch | Was geschieht in der Welt? | Studien, Messung, Kausalprüfung, Replikation, Unsicherheit | Viele Quellen = sicher wahr |
| Formal / mathematisch | Was folgt aus festgelegten Axiomen? | Definitionen, Beweis, Gegenmodell | Ein bewiesener Satz definiert gesellschaftliche Ziele |
| Normativ | Was soll gelten? | Offen gelegte Werte, Rechte, Folgen, Betroffene, Gegenargumente | Eine Mehrheit oder KI beweist Moral |
| Interpretativ | Wie ist ein Werk, Erlebnis oder Text zu verstehen? | Text-, Kontext- und Perspektivenkritik | Eine Deutung gilt als Messwert |
| Metaphorisch / spekulativ | Welche Analogie oder Hypothese regt Forschung an? | Begrenzungen, Trennschärfe, daraus abgeleitete prüfbare Fragen | Ähnlichkeit = Beleg für denselben Mechanismus |

**Reife ist kein Wahrheitswahrscheinlichkeitswert:** R0–R4 ordnen den dokumentierten Prüfprozess, **nicht** die Nähe zu 100 % Wahrheit. Abstraktionsstufe, Reife, Aussageart und dokumentierter Konsens werden getrennt gespeichert. KI darf keine Stufe und keine dokumentierte menschliche Zustimmung autonom vergeben.

## 2. Wissensgraph statt Stimmenmaschine

Wir modellieren Quellen, Aussagen, Einwände, Alternativen, Wertannahmen und Fragen als **typisierten gerichteten Graphen**

\[
G_t=(V_t,E_t,\tau_V,\tau_E,\pi_t).
\]

- \(V_t\): versionierte Knoten (Frage Q-/U-ID, Aussage, Quellenbeleg, Gegenmodell, Wert, Betroffenengruppe, Handlung, Prüftest).
- \(E_t\): belegte Beziehungen. Ein Knoten kann eine Aussage **stützen**, **angreifen**, von ihr **abhängen**, ihr **analog** sein oder eine weitere Prüfung verlangen.
- \(\tau_V,\tau_E\): Typfunktionen. Eine Metapher darf nicht stillschweigend zur Messung werden; eine Analogie darf keine Beweis-Kante vortäuschen.
- \(\pi_t\): Provenienz (Quell-URL und Passage, Version, Zeitpunkt, Autor/Prüferrolle, Befangenheit, begrenzter Geltungsbereich).

**Wichtig:** Eine Graphkante ist zunächst eine menschlich oder redaktionell formulierte, anfechtbare Behauptung über einen Zusammenhang – keine automatisch wahre Tatsache. Die derzeitige Website enthält **keinen** vollständigen Live-Wissensgraphen. Der Fragenatlas, die 16 Grundfragen und der lexikalische Querschnittsscan liefern nur mögliche Verknüpfungen.

### Ein Quellenecho ist kein zweiter Beleg

Für Belege \(e_1,\dots,e_n\) braucht es eine Abhängigkeitsanalyse \(D(e_i,e_j)\). Hundert KI-Agenten, die dieselbe Studie zitieren, erzeugen keine hundert unabhängigen Studien. Das Ledger kann eindeutige Quellen und **deklarierte** Herkunftsgruppen zählen; deren tatsächliche Unabhängigkeit bleibt zu prüfen.

Bei wohldefinierten statistischen Hypothesen darf man unter nachvollziehbaren Annahmen beispielsweise Bayes verwenden:

\[
P(H\mid E)=\frac{P(E\mid H)P(H)}{P(E)}.
\]

**In Worten:** Neue Evidenz verändert eine vorherige Wahrscheinlichkeit nur gemäß einem begründeten statistischen Modell. Priors, Messmodelle, Abhängigkeiten und Kalibrierung müssen ausgewiesen werden. Ohne diese Voraussetzungen **keine frei erfundene „Wahrheitswahrscheinlichkeit“**. Insbesondere darf dieselbe abhängige Evidenz nicht durch scheinbar unabhängige Likelihood-Faktoren mehrfach eingerechnet werden.

## 3. M-01 · Richtungen bilden keine natürliche Gesamtordnung

Für Handlungsmöglichkeiten \(X\) und einen vorher festgelegten Kriterienvektor \(g:X\to\mathbb{R}^k\):

\[
x\succeq_P y \iff \forall j:\ g_j(x)\ge g_j(y).
\]

**In Worten:** \(x\) dominiert \(y\) schwach, wenn es unter den gewählten Kriterien in keiner Dimension schlechter ist.

Mit \(g(A)=(1,0)\) und \(g(B)=(0,1)\) ist weder A noch B eindeutig besser. Auf Kriterienvektoren gilt eine partielle Ordnung, auf Handlungen eine Präordnung (verschiedene Handlungen können gleiche Vektoren haben). Diese triviale, aber wichtige Gegeninstanz verhindert, dass aus dem Symbol **+1/−1** ein universeller mathematischer Moralrichter wird.

**Normatives Postulat:** Würde, Rechte, Schutz und die Beschwerdemöglichkeit Betroffener können **harte Nebenbedingungen** sein und sind nicht automatisch durch Nutzengewinne verrechenbar. Welche Nebenbedingungen legitim und wie sie auszulegen sind, ist selbst Gegenstand öffentlichen Widerspruchs und verantwortlicher menschlicher Entscheidung.

## 4. M-02 · Die Brücke: Verstehen ≠ Zustimmung

Bei \(m\) vorab vereinbarten Fragen mit Antwortstufen 0…4 und normierter Abstandsfunktion

\[
d(x,y)=\frac{1}{4m}\sum_{j=1}^{m}|x_j-y_j|
\]

definieren wir

\[
V(B\rightarrow A)=1-d(a,\widehat a_B),\quad
V(A\rightarrow B)=1-d(b,\widehat b_A),\quad
K(A,B)=1-d(a,b).
\]

**In Worten:** Die beiden gerichteten V-Werte beschreiben die Genauigkeit, mit der zwei Menschen ihre ausdrücklich formulierten Antworten gegenseitig wiedergeben. K beschreibt die Ähnlichkeit ihrer eigenen Antworten. **V = 1 bei K = 0** ist möglich; ebenso **K = 1 bei V = 0**. Die [konstruktiven Beispiele und Grenzen](mathematik-des-dazwischen.md) sind bereits dokumentiert.

M-02 misst weder subjektives Erleben noch Menschenwürde, Beziehungsqualität oder moralischen Charakter. Der angenommene Zahlenabstand der Skala ist eine **Modellannahme**. Die Hypothese, ob aktives Wiedergeben mit Korrektur in freiwilligen Gesprächen V tatsächlich verbessert, ist **empirisch offen**.

**Folge für den Motor:** Bei Meinungsstreit zuerst Bedeutung, gemeinsame Beispiele und Möglichkeiten zur Korrektur prüfen. Guter Dissens kann trotz präzisem Verstehen bestehen bleiben. Niemand schuldet Kontakt, Einigung, persönliche Offenlegung oder Versöhnung.

## 5. M-03 · Bedingte Richtung unter Unsicherheit

Ein möglicher Richtungsindex kann erst **nach** geklärtem Kontext definiert werden. Die Frage ist **nicht** „Ist X gut?“, sondern zum Beispiel: *Welche hypothetische Änderung entsteht bei Handlung \(a\) gegenüber Vergleich \(b\), für Betroffene \(p\), innerhalb von Zeitraum \(h\), unter ausdrücklich benannten Zielen und Grenzen?*

Wir wählen für einen **rein fiktiven, konstruierten Testfall** \(k\) vergleichbar normierte Wirkungsdimensionen. Jede besitzt einen vorab gesetzten Unsicherheitsbereich

\[
d_j(a\mid b,c,E)\in[\ell_j,u_j]\subseteq[-1,1].
\]

Für ein offen benanntes **normatives Wertprofil** \(z\) setzen wir

\[
w_j(z)\geq0,\qquad\sum_{j=1}^{k}w_j(z)=1.
\]

Damit ist der **bedingte und modellabhängige** Richtungswert

\[
I_z(a\mid b,c,E)=\sum_{j=1}^{k}w_j(z)\,d_j(a\mid b,c,E).
\]

**In Worten:** Wir summieren angenommene Wirkungsveränderungen, gewichtet danach, welche Ziele das offen ausgewiesene Wertprofil priorisiert. Die Normierung, Zielwahl und Gewichte werden **nicht aus der Natur bewiesen**. Selbst korrekte Messdaten legen diese Ziele nicht von allein fest.

### Satz M-03.1 · Eingeschlossene Ergebnisse (modellintern)

Unter den oben genannten Annahmen liegt jeder zulässige gewichtete Wert im Intervall

\[
I_z \in
\left[\sum_j w_j(z)\ell_j,\;\sum_j w_j(z)u_j\right]
\subseteq[-1,1].
\]

**Beweis:** Wegen \(w_j\ge0\) gilt für jede Dimension \(w_j\ell_j\le w_jd_j\le w_ju_j\). Addition liefert die beiden Schranken. Beide sind konvexe Kombinationen von Zahlen aus \([-1,1]\) und liegen deshalb selbst darin. Q. e. d.

**Grenze des Satzes:** Er prüft die Arithmetik einer Annahmenliste, **nicht** die Eignung der Skalen, ihre empirische Unabhängigkeit, das Recht auf diese Gewichtung oder die Genauigkeit der Intervalle. Die Szenariointervalle sind **keine statistischen Konfidenzintervalle**.

### Satz M-03.2 · Bedingte Vorzeichenstabilität

Für eine ausdrücklich festgelegte Menge vertretener Profile \(Z\) ist das Vorzeichen nur dann in diesem Modell **durchgehend positiv**, wenn

\[
\forall z\in Z:\ \sum_j w_j(z)\ell_j>0.
\]

Durchgehend negativ gilt analog, wenn alle oberen Schranken kleiner als null sind.

**In Worten:** Selbst die jeweils ungünstigste angenommene Wirkung bleibt für jedes geprüfte Wertprofil positiv (oder die günstigste negativ). Das beweist **nur Stabilität innerhalb des gewählten Profilsatzes und der vorgegebenen Intervalle**. Unberücksichtigte Perspektiven können das Ergebnis kippen.

**Gegenmodell:** Bei den fiktiven mittleren Werten \(d=(0{,}2,\;0{,}5,\;-0{,}4)\) ergeben die Gewichtungen
\(w_A=(0{,}4,\;0{,}4,\;0{,}2)\) den Wert \(+0{,}200\),
\(w_B=(0{,}2,\;0{,}2,\;0{,}6)\) dagegen \(-0{,}100\).
**Kein einzelner „Wert der Menschheit“ folgt daraus.** Das ist ein rechnerisches Gedankenexperiment, keine reale Bewertung von Hilfe, Ernährung, Politik oder Menschen.

### Vier voneinander getrennte Ausgänge

| Ausgang | Formale Bedingung innerhalb der getesteten Profile | Öffentliche Deutung |
| --- | --- | --- |
| **Bedingt positiv / negativ** | Alle Szenariointervalle haben dasselbe strikte Vorzeichen | Nur mit offenem Profil, Kontext und nachgewiesener Prüfqualität interpretierbar |
| **Profilabhängig** | Die Punktannahmen wechseln zwischen positiven und negativen Vorzeichen | Mehrere Richtungen und Dissens zeigen, nicht eine Zahl mitteln |
| **Unbestimmt** | Intervalle schneiden null oder Voraussetzungen sind nicht ausreichend | Offene Frage, weitere Prüfung |
| **Nicht berechenbar / blockiert** | Fehlende Wirkungen, ungültige Gewichte, unbekannte Schutzlage oder verletzt bewertete Rechte | **Keine** Ersatz-Null und **keine** legitimierende Nutzenzahl |

**Ein unbekannter Wert ist nicht Null.** Ein scheinbar eindrucksvoller Index wie **+0,167** ist derzeit nur als ausdrücklich fiktives UI-Beispiel möglich. Er ist **weder eine objektive Wahrscheinlichkeit noch ein wissenschaftlich ermitteltes moralisches Urteil**.

### Veröffentlichungssperre und Korrekturfähigkeit

Der jetzige M-03-Code berechnet Werte **ausschließlich in Datensätzen mit \`kind: "synthetic"\`**. Alle Ergebnisse tragen \`public_score_allowed: false\`. Reale Fragen erhalten den Status \`not_scored\`, auch wenn ein Eingabefeld behauptet, bereits „geprüft“ zu sein. Weder ein JSON-Feld noch ein bestandener Strukturtest kann menschliche Legitimation erzeugen.

Für ein etwaiges späteres Public-Scoring müssen **gesondert und vorab** überprüft sein: genauer Vergleich und Geltungsbereich, geeignete unabhängige Wirkungsevidenz (gemäß noch nicht angenommenem KM-0.1-Vorschlag mindestens R3), nachvollziehbare Skalierung, verschiedene legitim vertretene Wertprofile, echte Kalibrierung an unabhängigen Fällen, Schutzrechte, Sensitivitätsanalyse, Quellabhängigkeiten, dokumentierte menschliche Freigabe und Einspruch. **Diese Bedingungen sind heute nicht erfüllt.**

## 6. Konsens als genaue Vereinbarung, nicht als Mittelwert

Für einen **exakten, versionierten** Vorschlag \(P^v\) definieren wir getrennt:

\[
F(P^v)\in\{\text{machbar},\text{unmachbar},\text{offen}\}
\]

und für jede beteiligte Person \(i\)

\[
C_i(P^v)\in\{\text{ja},\text{nein},\text{Enthaltung},\text{ausstehend}\}.
\]

**In Worten:** Ein gemeinsam gewünschter Plan muss zugleich unter denselben Bedingungen machbar sein **und** von allen als zustimmend bezeichneten Personen ausdrücklich in **genau dieser Version** getragen werden. Alte Zusagen dürfen nicht auf einen veränderten Wortlaut übertragen werden. Ein Nein oder ein ausstehendes Votum ist keine Null, die aus dem Mittelwert verschwindet.

Eine im Modell dokumentierte, begrenzte Vereinbarung setzt voraus: \(F=\) machbar; Rechte-/Schutzprüfung nicht negativ; und für alle **genannten zustimmenden Beteiligten** liegt ein echtes Ja zur aktuellen Fassung vor. Das ist **kein Wahrheitsbeweis**, kein allgemeiner gesellschaftlicher Konsens, keine Missachtung weiterer Betroffener und kein Ersatz für eine unabhängige Prüfung realer Einwilligung.

Die Funktion \`assessScopedAgreement\` prüft lediglich die **interne Konsistenz fiktiver Erklärungen**. Niemandes reale Zustimmung wird automatisch erfasst oder behauptet.

## 7. Selbstkorrektur als Graphoperation, nicht als Fortschrittsgarantie

Sei \(v_t(x)\) die Version eines Knotens \(x\). Ändert sich eine Prämisse, ein Beleg oder eine Norm, verfolgen wir deren explizit verzeichnete Abhängigkeiten:

\[
\operatorname{Impact}(x)
=\{y\in V:\text{ein gerichteter Pfad von }x\text{ nach }y
\text{ über \`depends_on\` besteht}\}.
\]

**In Worten:** Eine Änderung zeigt, welche nachgelagerten Aussagen **erneut geprüft werden sollten**. Sie ändert **keine** Reifestufen oder Wahrheitslabels automatisch. Ähnlichkeits-, Stütz- und Angriffsbeziehungen sind keine stillschweigende logische Abhängigkeit. Ein Zyklus wird einmal durchlaufen und erzeugt keine Endlosschleife. Jede wirkliche Korrektur braucht belegte Ursache, neue Fassung, stärksten Einwand, menschliche Entscheidung und Versionsspur.

**Wichtiges Gegenmodell zu META-01:** Die Forderung „Korrigiere endlos“ ist kein Satz, dass das System bei jeder Iteration der Wahrheit näherkommt. Für einen messbaren, vorab gewählten Fehlermaßstab \(L_t\) kann durchaus \(L_{t+1}>L_t\) gelten – etwa durch schlechte neue Daten, Machtkonzentration oder irreführende Kritik. Ob die Methode unter definierten Bedingungen **besser als Alternativen** wird, ist Gegenstand von [P-02](evaluation-v1.md). **Keine monoton steigende „Wahrheit“ wird behauptet.**

## 8. Kollektive Intelligenz ohne Scheinmehrheit

Ein thematisches KI-Netz könnte Fachrollen zu den **23 aktuellen Atlas-Fachthemen in sechs übergreifenden Feldern** einsetzen und zusätzlich Quellensichtung, Gegenprüfung, Betroffenenperspektive, Übersetzungsprüfung und Synthese vorsehen (offener AFA-0.1-Vorschlag in [PR #81](https://github.com/AlexanderR1991/Vera/pull/81)).

Die mathematisch entscheidende Regel lautet nicht „mehr Modelle = mehr Wahrheit“:

\[
N_{\mathrm{Ausgaben}}\neq N_{\mathrm{unabhängigen\ Belege}}
\neq N_{\mathrm{menschlichen\ Zustimmungen}}.
\]

**In Worten:** Häufigkeit von Antworten, Evidenzunabhängigkeit und tatsächliche menschliche Zustimmung sind drei verschiedene Dinge. Ein fachlich starker, nachvollziehbarer Minderheiteneinwand kann den nächsten Test bestimmen; hundert gleichförmige Agentenantworten dürfen ihn nicht überstimmen. Die **Stärke eines Arguments** ist anhand seiner Methode, Daten und Gegenbeispiele zu prüfen – nicht nach Stimmenzahl.

Der Syntheseentwurf muss immer getrennt berichten:
1. **Tragfähiger Kern:** Was wird mit genauer Begründung und Geltungsgrenze gestützt?
2. **Qualifizierter Dissens:** Welche Gegenposition bleibt offen, und wieso?
3. **Fehlendes Wissen:** Welche Quellen, Betroffenen oder Tests fehlen?
4. **Wertkonflikt:** Welche normativen Voraussetzungen erzeugen andere Richtungen?
5. **Rückweg:** Welche Frage U-/Q-ID oder Aussageversion wird mit welchem Prüfbedarf erneut untersucht?

Daraus folgen **keine** automatischen Veröffentlichungen, Agentenstimmen, Freigaben, Review-Bestätigungen oder Personenscores. Unterschiedliche legitime Perspektiven dürfen existieren, aber Falschbehauptungen erhalten deshalb nicht automatisch gleiche Evidenzstärke.

## 9. Systemdynamik, Qualität und Angriffe

Für empirisch überprüfbare Aufgaben schlagen wir **getrennte** vorab definierte Größen vor:

\[
Q_t=(\text{Trefferquote},\;\text{Fehlalarmquote},\;
\text{Korrekturqualität},\;\text{Dissenssichtbarkeit},\;
\text{Schaden},\;\text{Aufwand},\;\text{Transfer}).
\]

**In Worten:** Eine große Zahl entdeckter Fehler hilft nicht, wenn gleichzeitig viele korrekte Aussagen fälschlich beanstandet werden. Ein schnell erzeugter Konsens ist kein Gewinn, wenn Minderheiten verstummen, Schutz versagt oder Menschen ohne das Werkzeug schlechter urteilen. Bei Wertkonflikten sind offengelegte Prämissen und Fairness gegenüber Betroffenen zu prüfen, **nicht** Übereinstimmung mit einer erfundenen „richtigen Moral“.

**Falsifizierbare Hypothese H-M03:** In einem vorab festgelegten Satz **synthetischer und später unabhängig prüfbarer Fälle** könnte die typisierte M-03-Ausgabe gegenüber einer Ein-Zahl-Ausgabe häufiger (a) echte Zielkonflikte, (b) Datenlücken und (c) harte Schutzprobleme sichtbar machen, **ohne** die Zeit oder unberechtigte Warnungen unvertretbar zu erhöhen. Eine robuste Nullwirkung, erhöhte Fehlalarme, bessere brauchbare Vergleichsverfahren oder Schaden widerlegen den entsprechenden behaupteten Vorteil. Es liegen **keine** Versuchsergebnisse vor.

**Gegenangriffe und offene mathematische Probleme:**
- **Skalenwillkür:** Wie ändern sich Richtungen bei anderer, aber plausibler Normierung? Invarianz ist nicht garantiert.
- **Gewichtemacht:** Wer repräsentiert Betroffene? Wann wird ein Wertprofil legitim statt nur populär?
- **Gegenläufige Rechte:** Welche Nebenbedingungen sind konsistent? Social-Choice- und Fairness-Unmöglichkeitsresultate dürfen nicht ignoriert werden (siehe [M-01](mathematischer-pruefstand.md)).
- **Korrelation / Goodhart:** Können Studien, Agenten oder Metriken systematisch denselben Bias verstärken?
- **Kontextwechsel:** Eine scheinbar robuste Richtung kann für andere Kulturen, Zeiträume oder vulnerable Gruppen nicht gelten.
- **Abbruch und Schutz:** Bei Drohung, Machtmissbrauch oder sensiblen Einzelfällen ist Nichtteilnahme eine gültige Ausgabe; keine Veröffentlichung intimer Daten.

## 10. Reproduzierbarer Implementierungsstand

| Ebene | Datei / Stand | Was wirklich funktioniert |
| --- | --- | --- |
| Existierende Fachdaten | [Aussagenregister](../public/knowledge/claims.json), [Fragenatlas](../public/knowledge/questions.json), [16 Grundfragen](../public/knowledge/universal-questions.v1.json) | Versionierte Projekttexte und bereits vorhandene Validierung / Suchhinweise, **keine automatische Wahrheit** |
| M-01 | [Prüfstand](mathematischer-pruefstand.md) | Formales Gegenbeispiel zur universellen Rangordnung |
| M-02 | [M-02](mathematik-des-dazwischen.md), [inter-subjective Testdaten](../public/research/intersubjective-dynamics.v0.json) | Abstandsbasierter Spielzeugwert für Verständnis und Übereinstimmung |
| M-03 | [Reiner JS-Kern](../src/lib/philosophical-motor.mjs) | Validierung, Intervall-Aggregation und Wertprofil-Sensitivität **nur für synthetische Fälle** |
| Bestehende Aussagen | [Read-only-Adapter](../src/lib/philosophical-motor.mjs) | Liest echte öffentliche Aussageart, Version, R0–R4, Konsensstatus und Zahl der verzeichneten Quellen **ohne** neue Bewertung |
| M-03-Schutz | gleicher JS-Kern | Fehlende Werte bleiben fehlend; Rechte-/Schutzstatus getrennt; realer Score gesperrt |
| M-03-Abhängigkeiten | gleicher JS-Kern | Markiert die Prüffolge nach geänderter Prämisse; verändert keine Aussagen |
| M-03-Herkunft | gleicher JS-Kern | Erfasst Quell-IDs und deklarierte Abhängigkeitsgruppen; behauptet **keine geprüfte** Unabhängigkeit |
| M-03-Einigung | gleicher JS-Kern | Prüft Modellkonsistenz von Machbarkeit, Status und exakt versionierten fiktiven Zusagen |
| Gegenbeispiele | [Fiktive Beispieldaten](../public/research/philosophical-motor-examples.v0.json), [Node-Tests](../tests/philosophical-motor.test.mjs) | Nachvollziehbare Rechenfälle, kein Datensatz über echte Menschen |
| Review / Aktivierung | Governance und menschliche PRs | **Nicht implementiert:** Live-KI, automatische Korrektur, Kalibrierung, Realbewertung oder öffentliche Zahlen |

### Formale Invarianten des Prototyps

1. \`kind !== "synthetic"\` ⇒ **keine Punktzahl**.
2. Fehlende Wirkungsdimension ⇒ **keine Punktzahl**, niemals Ersatz durch 0.
3. Ungültige Gewichte / Intervalle ⇒ **keine Punktzahl**.
4. Schutzverletzung ⇒ **blockiert**, auch bei angenommener positiver Wirkung.
5. Vorzeichenwechsel zwischen Wertprofilen ⇒ **profilabhängig**, nicht auf einen Gesamtwert reduzieren.
6. 100 KI-Zitate derselben Quelle ⇒ **eine eindeutige Quell-ID**, keine unabhängige Bestätigung.
7. Änderung einer Ausgangsthese ⇒ **Liste betroffener Folgeprüfungen**, keine automatische Wahrheitstransformation.
8. Eine Zusage zu Version \(v_1\) ⇒ **keine** Zusage zu \(v_2\).
9. In **jedem** Ergebnis bleibt \`public_score_allowed: false\`.

Diese Invarianten sind **Software-Anforderungen**, keine Beweise über die Welt. Ihre Tests können Regressionsfehler entdecken, nicht die philosophische Vision validieren.

## 11. Offene Forschung und Selbstkritik

**Mathematik:** Eindeutige Definitionsmengen, Vergleichbarkeit von Skalen, Mehrzielrobustheit, Unmöglichkeitssätze, kausale Abhängigkeitsgraphen und formale Durchsetzung von Schutzbedingungen prüfen.

**Statistik:** Vertrauenswürdige Wirkungsmodelle, verlässliche Unsicherheitsintervalle, Verteilungsschichten, Quellabhängigkeit, Gegenfaktisches, angemessene Kalibrierung und Zeitdrift entwickeln.

**Philosophie & Demokratie:** Quelle der normativen Autorität, Minderheitenschutz, Repräsentation, mögliche Nichtvergleichbarkeit und transparente Änderung der Regeln klären.

**Psychologie & Kommunikation:** M-02-Hypothese zu gegenseitiger Wiedergabe freiwillig und sicher testen; andere Formen von Verständigung nicht auf die Skala reduzieren.

**KI-Systemdesign:** Nur begrenzt ausgewählte Prüferrollen, voneinander getrennte Quellen und wiederholbare Protokolle; keine künstliche Abstimmung und keine fremde KI-Befugnis.

**Governance:** Offenheit und Überprüfbarkeit mit Privatsphäre, Recht und Einspruch vereinbaren. WIRKLICH soll ein **öffentlicher, veränderbarer Erkenntnisprozess** bleiben, kein unkontrollierter Zentralentscheider.

> **Kernentscheidung des Modells:** Bei unvereinbaren, plausibel begründeten Zielen kann die mathematisch richtige Aussage lauten: **„Diese Optionen sind unter den veröffentlichten Voraussetzungen nicht eindeutig vergleichbar.“** Das ist kein Versagen. Das ist die Grenze einer ehrlichen Rechnung.

---

*Die englische Fassung ist ein redaktioneller, noch nicht unabhängig fachsprachlich geprüfter Entwurf: [Mathematics of the Philosophical Engine](en/philosophical-motor-mathematics.md).*
