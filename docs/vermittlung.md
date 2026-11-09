# Vera vermittelt zwischen zwei Menschen

[English summary](#english-summary)

Welche andere Frage müsste sich klären, damit wir über diesen Vorschlag wieder reden könnten? Die [Gesprächsübung](schnittmengen.md) beginnt mit der Sicht des Gegenübers. Dieser Prototyp lädt A und B ein, **denselben Vorschlag unter einer selbst benannten Bedingung ein zweites Mal zu beurteilen**. Beide können die [zweisprachige Übung am selben Gerät](https://alexanderr1991.github.io/Vera/de/schnittmengen/#vermittlung) ausprobieren. Ein Dienst für getrennte Geräte und die Erprobung mit Konfliktparteien gehören zum Entwicklungsplan.

## Wer darf das Gespräch beenden?

**Jede Person darf allein Stopp sagen.** A möchte weiter über den Marktplatz reden. B möchte gehen. Der Streit kann für A noch wichtig und ungelöst sein. Trotzdem endet die gemeinsame Übung sofort. B braucht dafür weder eine Begründung noch ein Ja von A. Wer möchte, kann für sich überlegen, was offenbleibt.

Eine Pause lässt eine andere Möglichkeit offen. Bei „So kann ich gerade nicht reden“ könnte B eine Pause brauchen oder anders zu Wort kommen wollen. B kann Unsicherheit angeben. Vera bietet dann einmal die Frage „Was möchtest du gerade?“ an. Die Antwort darf ausbleiben. Erst wenn beide von sich aus wieder teilnehmen wollen, geht es gemeinsam weiter. Antwortet jemand während der Übung nicht mehr, kann die Person am Gerät „Pause machen“ wählen. Vera erkennt Schweigen oder einen gesprochenen Stopp am gemeinsamen Gerät nicht von selbst.

### Die Regel in einer Formel

Für jede Person $i$ steht $J_i=1$ für ihr ausdrückliches Ja zur Teilnahme seit dem Beginn oder der letzten Unterbrechung. $J_i=0$ bedeutet nur, dass dieses Ja fehlt. $E=1$ bedeutet, dass die Sitzung beendet ist. Die gemeinsame Bearbeitung ist genau dann freigegeben, wenn

$$
G=(1-E)\,J_A\,J_B=1.
$$

Zu Beginn, bei Pause und bei gemeldeter Unsicherheit setzt Vera beide $J$ auf null. Danach kann jede Person nur ihr eigenes Ja geben. Schweigen verändert keinen Wert. Ein Stopp setzt $E$ dauerhaft auf eins und verwirft die gemeinsamen Eingaben. Damit bleibt der erste Faktor für diesen Durchlauf null, wie dringend A auch weitersprechen möchte. Nach einer Pause genügt ein einzelnes neues Ja ebenfalls nicht, weil der andere Faktor noch null ist. Am gemeinsamen Gerät bezeichnen A und B Rollen. Wer das Gerät bedient und ob jemand unter Druck steht, kann der Browser nicht prüfen.

$G$ beantwortet ausschließlich die Frage, ob beide jetzt gemeinsam arbeiten wollen. B kann mitreden und den Vorschlag ablehnen. Umgekehrt kann B den Vorschlag unterstützen und das Gespräch beenden. Daraus ergibt sich weder eine Bewertung der Person noch ein Maß dafür, wie gut die Vermittlung war.

## Ein Fall mit zwei möglichen Ausgängen

A möchte den Marktplatz drei Monate lang autofrei erproben. B erinnert sich daran, dass beim letzten Umbau der Plan bereits beschlossen war, als die Anwohner angehört wurden. B benennt eine Bedingung, die sich später prüfen lässt. „Noch vor dem Beschluss können wir Änderungen einreichen und bekommen eine begründete Antwort.“

Vera fragt beide, ob sie einander unter dieser Bedingung zuhören würden und ob sie den Versuch mittragen würden. B sagt „Dann würde ich wieder mitreden. Mein Vater braucht aber weiterhin eine Zufahrt.“ So können beide eine Gesprächsmöglichkeit erkennen und den offenen Einwand korrekt wiedergeben. B könnte auch antworten „Dann würde ich den Versuch mittragen.“ Ob B ihn nach einer tatsächlichen Beteiligung mitträgt, beantwortet B zu diesem späteren Zeitpunkt selbst. Faire Beteiligung steht B bei jeder Antwort zu.

## Mathematik der bedingten Einigung

Sei $X$ eine Menge konkreter Vorschläge. Der Prototyp prüft jeweils **einen** Vorschlag $x$ mit festem Wortlaut. Die Phasen $t=0,h,1$ stehen für heute, die vorgestellte Änderung und die erneute Befragung nach gemeldeter Änderung. Für jede Person $i$ und jede Achse $d$ erfassen wir eine direkte Antwort $r_i^d(x,t)$. Die Achsen sind Gesprächsbereitschaft und Zustimmung zum Vorschlag. Auf jeder Achse kann die Person Ja, Nein oder Enthaltung wählen oder die Antwort offenlassen. Offen bedeutet, dass eine Antwort aussteht. Eine Enthaltung ist eine ausdrückliche Antwort.

$$
S_i^d(t)=\{x\in X\mid r_i^d(x,t)=\mathrm{Ja}\},
\qquad C^d(t)=S_A^d(t)\cap S_B^d(t).
$$

Die erste Menge enthält die Vorschläge, zu denen die betreffende Person auf der betreffenden Achse Ja sagt. Die Schnittmenge enthält diejenigen, zu denen beide Ja sagen. Bei der Gesprächsbereitschaft bedeutet ein Ja „Ich würde mit dir über diesen Vorschlag sprechen“. Das allein sagt noch nichts darüber aus, wie beide entscheiden.

Eine **mögliche Brücke** auf derselben Achse liegt genau dann vor, wenn

$$
\big(\exists i\in\{A,B\}:r_i^d(x,0)=\mathrm{Nein}\big)
\quad\land\quad x\in C^d(h).
$$

Für denselben Vorschlag gab es heute mindestens ein ausdrückliches Nein und unter der vorgestellten Bedingung zwei ausdrückliche Ja. Fehlt die heutige Antwort von B und A hat bereits zugestimmt, lässt sich aus zwei späteren Ja kein überwundenes Nein ableiten. Eine Zustimmung nach gemeldeter Änderung ist wiederum $x\in C^{\mathrm{Sachvotum}}(1)$ und erfordert zwei neue Antworten. Diese Runde kann auch zu einem Ergebnis führen, das der vorherigen Erwartung widerspricht. Der [Modellkern](../src/lib/mediated-dialogue.mjs) berechnet diese Aussagen. Die [Gegenproben](../tests/mediated-dialogue.test.mjs) prüfen ihre Grenzen.

A und B melden den Eintritt der Bedingung jeweils selbst. Schon nach der ersten Meldung bleiben die bisherigen Antworten für den Vergleich festgehalten. Erst nach beiden Meldungen öffnet sich eine leere Antwortrunde. Eine Person kann ihre Meldung zurücknehmen. Dann verfallen beide Eintrittsmeldungen und die Antworten der dritten Runde. Auch zwei übereinstimmende Meldungen dokumentieren nur, wie die Beteiligten die Lage beschreiben. Änderungen am Vorschlag, an der Bedingung oder an ihrer Zuordnung erfordern neue Antworten. Auch nach zwei Ja bleiben Durchführbarkeit, Rechte weiterer Betroffener und Tatsachenbelege eigene Fragen. [Verstehen und Einigkeit in M-02](mathematik-des-dazwischen.md)

## Was eine Verbindung im Baum bedeutet

Ein Ast verbindet hier eine konkrete Bedingung mit einem Vorschlag und einer bestimmten Antwortfrage. Festgehalten wird, wer die Bedingung benannt hat und für welchen Fall sie gilt. Mehrere mögliche Verbindungen bilden ein Netz. Eine Erfahrung aus der Verkehrsplanung kann auf eine Frage bei der Einführung neuer Software aufmerksam machen. Konnten die Betroffenen Änderungen einbringen? Im neuen Fall wird diese Frage offen gestellt. Eine Antwort aus der Verkehrsplanung antwortet für niemanden im Softwareprojekt.

Aus „Unter $z$ könnte ich zuhören“ und „In einem anderen Fall folgte auf Zuhören eine Einigung“ folgt keine Zusage von B. Auch ein späteres tatsächliches Ja identifiziert keine alleinige Ursache. Zwischen beiden Gesprächen könnte sich beispielsweise die Versorgung von Bs Vater geändert haben. Eine Vermutung über die Motivation einer Person wird erst zu **ihrer eigenen Aussage**, wenn sie die Formulierung selbst bestätigt. Eine abgelehnte Vermutung endet an dieser Stelle. [Beziehungen im Fragenatlas](fragenatlas.md)

## Von der Übung zum aktiven Streitsystem

| Etappe | Was gebaut oder geprüft wird | Wann die nächste Etappe beginnen darf |
| --- | --- | --- |
| 1 · Gemeinsames Gerät | A und B sprechen für sich. Jede Person kann ihre eigene KI um einen Formulierungsvorschlag bitten, ihn ändern und selbst entscheiden, was sie zeigt. Vera stellt dieselben Fragen zu beiden Kontexten. | Mit fiktiven Fällen den vollständigen Ablauf einschließlich offenem Feld, bleibendem Nein, korrigierter Bedingung und Stopp durchspielen. Beide Sprachfassungen müssen den gleichen Ergebnisstatus zeigen. |
| 2 · Privater Raum für zwei Geräte | Ein zeitlich begrenzter Raum hat zwei getrennte Zugänge. Jede Freigabe benennt Rolle, Fassung, Empfänger und Inhalt. Ein Server prüft Zugriffsrechte und Fassung bei jeder Nachricht, setzt Ablauf und Löschung durch. Vorlagen lassen sich weiterhin ohne KI bearbeiten. | Zwei getrennte Clients testen. Ein fremder Zugang, eine verspätete Nachricht nach Stopp, eine doppelte Zustellung und eine Antwort auf eine alte Fassung dürfen weder Zustimmung erzeugen noch private Entwürfe offenlegen. Löschung und Ablauf einschließlich Wiederverbindung nachweisen. |
| 3 · Zwei persönliche KIs | Jede KI hilft nur auf Wunsch ihres Menschen beim Formulieren. Vor der Übermittlung sieht die Person den genauen Text. Der Vermittler nutzt nur freigegebene Beiträge und kann eine offene Rückfrage vorschlagen. Nur A und B dürfen die für sie gültigen Antworten geben. | Bei mindestens zwei verschiedenen KI-Anbindungen dieselben Vertragsprüfungen bestehen. Ein KI-Text wie „B stimmt bereits zu“ bleibt ein Entwurf. Automatisiertes Auslösen einer Freigabe, Rollenwechsel und Anbieterzugriff auf den privaten Entwurf der Gegenseite müssen in den Gegenproben scheitern. |
| 4 · Freiwilliger Pilot | Mit unabhängiger Begleitung, sicherem Ausstieg und unkritischen Alltagsfragen beginnen. Umfang, Messgrößen, Zeitraum, Stichprobe und Abbruchkriterien vorab festlegen. | Nachvollziehbarer Nutzen gegenüber dem Vergleich, ohne unvertretbaren Druck oder Datenschutzverletzung. Eine fingierte Zustimmung, ein gescheiterter Stopp oder eine Weitergabe ohne Freigabe unterbricht den betroffenen Pilotbetrieb. Begründete Nullbefunde führen zur Überarbeitung oder Beendigung. |

**Prüffrage für den Pilot.** Kann A nach dem Gespräch die Bedingung und den verbleibenden Einwand von B so wiedergeben, dass B sich darin erkennt? Dieselbe Frage gilt in Gegenrichtung. Die Beteiligten beurteilen das getrennt. Paare werden nach Möglichkeit zufällig der bisherigen Sprachprobe oder der gleich langen erweiterten Übung zugeteilt. Bei einer Prüfung des KI-Beitrags verwendet eine weitere Vergleichsgruppe dieselbe KI ohne Veras Protokoll. Je Paar auswerten, wie häufig beide Wiedergaben bestätigt werden. Zustimmung zum Vorschlag, tatsächliche spätere Umsetzung, empfundener Druck, Abbrüche und unbeantwortete Rückmeldungen gesondert ausweisen. Die Häufigkeit politischer Einigung ist kein Ersatz für diesen Test.

Vor dem Pilot benennt das Team eine Person für die Technik und Löschprüfung, eine unabhängige Begleitung für Rückmeldungen beider Parteien und eine erreichbare Person mit Befugnis zum Pausieren. Jede Partei willigt in eine etwaige Pilotmessung gesondert ein. Bei Zwang, Drohung oder fehlender Sicherheit kann jede Seite ohne Begründung aussteigen. Direkter Kontakt endet. In akuter Gefahr geht es um sichere Distanz und erreichbare Hilfe vor Ort.

## Wie Vera aus einem Streit wachsen kann

Am Ende kann jede Person freiwillig prüfen, an welcher Stelle Vera geholfen oder etwas falsch zusammengefasst hat. Wer aussteigt, schuldet keine Rückschau. Das Protokoll sieht zwei verschiedene Schritte vor.

1. **Im Gespräch** korrigiert die Person ihre eigene Aussage oder benennt einen offenen Einwand. So kann Vera den aktuellen Fall schon besser abbilden.
2. **Für das nächste Gespräch** kann jede Person im [Rückblick](https://alexanderr1991.github.io/Vera/de/schnittmengen/#rueckblick) eine vorgegebene Verfahrensfrage auswählen und die zugehörige synthetische Gegenprobe ausprobieren. Wer möchte, merkt sich die Prüffrage auf diesem Gerät. Gespeichert wird jede ausgewählte Fragen-ID höchstens einmal. Die Auswahl kann wieder gelöscht werden. Fallbezüge, Häufigkeiten und Zeitstempel werden nicht erfasst.

Für das gemeinsame Verfahren lässt sich aus einer öffentlichen Gegenprobe ein Textentwurf zur eigenen redaktionellen Prüfung übernehmen. Der Rückblick greift auf keine Texte, Antworten oder Sitzungsobjekte aus dem Streit zu und überträgt keine Daten. Im Pilot prüft die technische Leitung, ob für eine gewählte Prüffrage selbst mit leeren oder verworfenen Sitzungsdaten dieselbe Gegenprobe erscheint. Findet sich darin eine echte Äußerung oder ein Identifikator der Sitzung, wird dieser Lernweg gesperrt.

Ein neuer Fehler braucht einen vollständig erfundenen Fall. So muss nach einem hypothetischen Ja und einer tatsächlichen Enthaltung die spätere Enthaltung erkennbar bleiben. Ein prüfbarer Entwurf beschreibt Eingaben, erwartetes Ergebnis, beobachtete Abweichung und betroffene Version. Namen, Originalzitate, Gesprächsprotokolle und identifizierbare Details bleiben außerhalb des Repositorys.

Eine zuständige Person prüft unabhängig, ob sie den Fehler reproduzieren kann, ob ein vorhandener Test ausreicht und ob die Korrektur an Gegenbeispielen trägt. Änderungen am Modellkern und am Testbestand durchlaufen als Git-Diff die menschliche Prüfung, bevor eine neue gemeinsame Verfahrensversion entsteht. So kann gerade ein Fall mit bleibendem Dissens eine fehlerhafte Konsensanzeige aufdecken. [Selbstkorrektur](selbstkorrektur.md) · [Gemeinschaftsordnung](community-governance.md)

## English summary

### Who can end the conversation?

**Either person can stop.** A still wants to talk about the market square. B wants to leave. The disagreement may still matter to A. The shared exercise ends immediately, without a reason or A’s permission. Anyone who wants to can think over what remains open on their own.

A pause leaves room to return. “I can’t talk like this” might mean B needs a break or needs a different way to be heard. When someone chooses the unsure option, Vera offers one optional question. “What would you like right now?” They can leave it unanswered. The exercise waits for each person to choose to take part again. If someone stops replying during the exercise, the person holding the device can choose “Pause”. Vera cannot detect silence or a spoken stop on the shared device.

In the [formula above](#die-regel-in-einer-formel), $J_A$ and $J_B$ each record an explicit yes to taking part since the start or most recent interruption. They begin at zero. Pausing or signalling uncertainty clears both. Silence makes no change. Ending the session permanently sets $E=1$ and clears its entries. The shared exercise opens only when $(1-E)J_AJ_B=1$. One fresh yes after a pause leaves the other factor at zero. After a stop the first factor stays zero for that session. On a shared device A and B identify turns. The browser cannot verify identity or freedom from pressure. Someone can support the proposal and still leave the conversation. Neither choice rates the person or measures the success of mediation.

### What the two people explore

Two people assess one proposal under present conditions and under a change named by either participant. They answer “Would I listen?” and “Would I support this proposal?” separately. A possible bridge requires an explicit initial **no** on that dimension and two hypothetical **yes** responses. Missing answers and abstentions stay visible. Both participants must separately report that the condition now holds to open a fresh round. They must then answer the proposal again before the exercise can record agreement on the proposal in the new situation. A connection across topics suggests a question to ask and carries no authority over anyone's answer.

The first prototype uses one shared device. The roadmap moves to expiring two-device rooms with role-bound approvals, optional personal AI drafting, and a controlled pilot against the existing exercise. Stopping, stale approvals, replays, deletion and unauthorized access must be tested before expanding access. Evaluate whether each person recognizes their view in the other's account, including any remaining objection. Either person may end contact. Optional reflection uses a fixed menu of procedural questions and fictional tests independent of session data. People may optionally keep a deletable local set of unique check IDs for future conversations. Shared changes to rules or test cases require a human-reviewed Git diff. Private conflict histories and model training are outside the learning process described here.

## Eine neue Gegenprobe beitragen / Contributing a case

Im [öffentlichen Fallkatalog](../public/research/mediation-cases.v1.json) reicht ein neuer Eintrag mit einer eigenen stabilen ID. Die drei Texte je Sprache enthalten Prüffrage, erfundene Ausgangslage und erwartetes Ergebnis. Unter `events` erklären A und B vor der gemeinsamen Bearbeitung einzeln, dass sie teilnehmen möchten. Dann folgen der Vorschlag samt Bedingung und benennender Person sowie die einzelnen Antworten oder Meldungen. `expected` legt die vollständige erwartete Modellausgabe fest. Die [Katalogtests](../tests/mediation-lessons.test.mjs) spielen jeden Eintrag durch denselben Kern wie die Oberfläche. Neue Einträge erscheinen nach der redaktionellen Prüfung und Veröffentlichung in der Auswahl.

```sh
node --test tests/mediation-lessons.test.mjs tests/mediated-dialogue.test.mjs
```

**Wiederaufnahme nach mehreren Tagen.** Dieser Prototyp verwirft den Streit beim Beenden oder Neuladen der Seite. Lokal gemerkte Prüf-IDs lassen sich später weiterverwenden. Tritt eine vereinbarte Bedingung erst nach Tagen ein, können A und B einen neuen Durchlauf beginnen. Vera kann diesen keinem vergangenen Durchlauf sicher zuordnen. Für eine durchgängige spätere Befragung braucht Etappe 2 einen von beiden freigegebenen Sitzungsstand mit festgelegtem Ablaufdatum, getrennten Zugängen und geprüfter Löschung.

To contribute, add a bilingual fictional entry, its ordered model events and the full expected assessment to the catalogue, then run the command above. Local check IDs can outlive a page reload. The dialogue itself cannot be resumed days later in this prototype.
