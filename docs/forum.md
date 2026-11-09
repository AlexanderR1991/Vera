# Das Forum / The Forum

**Vera – öffentliche Gespräche, prüfbare Aussagen und dokumentierte Änderungen.**

**META-01:** [Wir bauen kein System, das recht behalten soll. Wir bauen ein System, das aus seinen Irrtümern lernen muss.](selbstkorrektur.md) Jeder Diskussionsraum dient Erkenntnisgewinn, nicht dem Sieg einer Fraktion. Ein belastbarer Einwand kann eine Prüfung neu eröffnen, aber weder Lautstärke noch Bot-Masse erzwingen eine redaktionelle Änderung.

Die antike Agora, Stoa und das römische Forum inspirieren die Darstellung, **nicht** eine antike Rangordnung, den Ausschluss von Menschen oder eine Abstimmung über Wahrheit. Die drei Begriffe bezeichnen verschiedene **Wege im bestehenden GitHub-System**, keine technisch separaten Community-Instanzen:

- **Agora – freie Gespräche:** [GitHub Discussions](https://github.com/AlexanderR1991/Vera/discussions). Fragen und Ideen dürfen unfertig bleiben.
- **Stoa – konkrete Aussagen:** Für jeden Eintrag in [claims.json](../public/knowledge/claims.json) existiert ein dauerhaft verlinkter GitHub-Issue-Debattenfaden. Das öffentlich exportierte [forum-threads.json](../public/knowledge/forum-threads.json) ordnet **stabile Aussage-ID → Issue-Nummer** zu.
- **Curia – nachvollziehbare Entscheidung:** Präzise Korrekturen und Änderungen erfolgen per [Pull Request](https://github.com/AlexanderR1991/Vera/pulls) mit öffentlicher Begründung, nach Prüfung durch die verantwortliche Redaktion. Die Regeln stehen in [community-governance.md](community-governance.md).

**Was eine Diskussion nicht ist:** Ein Forum-Kommentar, ein Like, ein GitHub-Issue oder eine von einer KI verfasste Erwiderung begründet weder fachliche Begutachtung noch eine Konsens- oder Wahrheitsstufe. Der Status und die Version jeder Aussage werden nur im redaktionell gepflegten Register nach den Aufstiegs- und Prüfregeln geändert. Ein einzelner belastbarer Gegenbeleg kann wichtiger sein als hundert zustimmende Beiträge.

**Beitragspraxis:** Aussage-ID und Version nennen, stärkste faire Lesart formulieren, Beleg oder Gegenbeispiel angeben, Unsicherheit ausdrücklich zulassen und beschreiben, welche Beobachtung die eigene Position ändern würde. Der [Diskussionskodex](../CODE_OF_CONDUCT.md) gilt. Kritik darf scharf sein; keine Übergriffe, persönlichen Daten oder vertraulichen Beschwerden in öffentlichen Threads. Lesen erfordert kein GitHub-Konto; Schreiben derzeit schon. Es existiert bislang kein zugesagter vertraulicher Meldekanal, keine garantierte Antwortzeit und keine unabhängige Moderation. Vor einer breiten öffentlichen Einladung sind diese Lücken nach [Governance](community-governance.md) gesondert zu schließen.

**Integrationsregel:** Beim Anlegen einer neuen Aussage eine eindeutige GitHub-Issue-Debatte erstellen, ihre Nummer in forum-threads.json aufnehmen und anschließend die Site-Checks ausführen. Bei Überarbeitung einer Aussage den Faden behalten und die diskutierte Version nennen. Debatten niemals automatisch in den Erkenntnisreifegrad übersetzen.

---

**English:** [META-01](selbstkorrektur.md) asks each discussion space to learn from mistakes, not to win. A serious objection may reopen examination, while votes and bot volume never determine truth.

**English:** The Agora, Stoa and Curia are navigational metaphors for three existing tools, not separate hosted forums: open GitHub Discussions, issue threads anchored to each claim ID, and reviewed pull requests for changes. A claim is never promoted by votes, comment counts or AI replies. The statement and its review status remain in the versioned register, separate from discussion. Use respectful, specific objections, cite the version and sources, and say what would change your mind. Public posts require a GitHub account; no confidential complaint route, response SLA or independent moderation is currently promised.

## Diskussionsplätze · Topic squares

Der Einstieg „Mitdiskutieren“ führt von einem Thema zu seinem eigenen Platz. Dort kann man eine konkrete Frage lesen, ein vorhandenes Gespräch öffnen oder mit dem richtigen Kontext einen Beitrag auf GitHub einreichen. Die Plätze teilen stabile Kennungen zwischen den Sprachfassungen. Ein Gespräch kann mehrere Themen verbinden und behält seine Adresse. Die [Architektur der Diskussionsplätze](forum-architektur.md) beschreibt das Zugangsmaß, eine Prüfreihenfolge für einen späteren Betrieb und einen konkreten Gegenfall.

**English:** “Join the discussion” connects a topic with its square. Readers find a concrete question, a link to a conversation if one exists, or a GitHub contribution route carrying the topic context. Squares share stable IDs across languages. A conversation can connect multiple topics and keeps its address. See the [architecture of the topic squares](forum-architektur.md#english) for the access measure, a proposed review order and a worked counterexample.

## REDE-01 · Was darf stehen bleiben? / What can remain visible?

**Möglichst jede Position prüfen, aber nicht jeden schädlichen Wortlaut öffentlich konservieren.** Der [anfechtbare Entwurf REDE-01](redefreiheit-und-schutz.md) schützt unangenehme, gegenläufige und sachlich falsche Thesen vor bloßer Mehrheitszensur. Wenn glaubhafte Gefährdung, gezielte Belästigung oder Privatsphäre betroffen sind, gelten vier abgestufte Antworten: stehen lassen, einordnen, vorläufig einschränken, öffentliche Verbreitung beenden. Der Maßstab ist konkreter Schutz, nicht die Unangreifbarkeit einer Idee. Grund und Einspruch sollen prüfbar sein; schädliche Originalinhalte werden **nicht zur Transparenz öffentlich wiederholt**.

**English:** The [contestable REDE-01 proposal](redefreiheit-und-schutz.md) distinguishes lawful disagreement from credible threats, targeted harassment and privacy violations. Keep, contextualize, restrict pending accountable review, or stop public distribution as appropriate. Do not preserve harmful raw material publicly. There is no live moderation API or independent appeals service in this GitHub-based pilot.

## Alltagsfragen · Everyday questions

Der [Einstieg ins Forum](https://alexanderr1991.github.io/Vera/de/forum/#alltagsfragen) zeigt ausgewählte Alltagsfragen mit einer ersten philosophischen Antwort und einer Gegenfrage. Die Antworten sind KI-unterstützte, vorläufige Denkangebote. Die Gegenfrage hilft dabei, einen konkreten Fall zu finden, den die Antwort erklären können sollte. Der Abschnitt ist ohne Konto lesbar. Einwände und bessere Antworten lassen sich über ein kurzes öffentliches GitHub-Formular einreichen.

Die [zweisprachige Quelldatei](../public/knowledge/everyday-questions.json) speist Startseite und Forum. Beim Überarbeiten bleiben der Link `#alltag-<id>` und die gemeinsame GitHub-Kennung `[ALLTAG-<id>]` erhalten. Die Kennung verbindet die Beiträge beider Sprachen. Führt ein Einwand zur Korrektur, verlinkt der Pull Request den Einwand und begründet die neue Fassung. Die Alltagsfragen sind ein eigener Einstieg. Der Fragenatlas erfasst belegte Verbindungen, das Aussagenregister dokumentiert den Prüfstatus seiner Aussagen.

**English:** The [everyday questions](https://alexanderr1991.github.io/Vera/en/forum/#alltagsfragen) pair provisional, AI-assisted philosophical answers with a question readers can use to test each answer. The GitHub form is prefilled with a stable link and the same issue title identifier in both languages. If an objection leads to a revision, the pull request links to it and explains the change.


## KI-Schleuse und Fragenatlas · AI gate and question atlas

**Das Forum ist kein Kommentar-Spielplatz für autonome KI-Schwärme.** Die bestehenden Forschungs- und Angriffsschwärme bleiben in begrenzten Entwurfsdateien; sie veröffentlichen keine GitHub Discussions, Issues oder Antworten. Von Menschen ausdrücklich erbetene KI-Hilfe ist als solche zu kennzeichnen. Der [Fragenatlas im Forum](https://alexanderr1991.github.io/Vera/de/forum/#fragenatlas) zeigt sechs redaktionelle ungeprüfte Beispiel-Fragen mit Aussage-IDs und nachvollziehbaren Verbindungen. Er synchronisiert nicht alle GitHub-Gespräche.

Eine mögliche Dopplung wird **geprüft**, nicht automatisch verschmolzen. Der Ursprungswortlaut, neue Gegenbelege und abweichende Minderheitspositionen bleiben erhalten. [Datenvertrag und Schutzregeln](fragenatlas.md).

**English:** AI swarms cannot auto-post to public threads. The six-question atlas is an unreviewed editorial pilot; lexical similarity never authorizes merging, voting or truth promotion.

## Esoterik als offener Diskussionsbaum / Esotericism as a discussion tree

Der [zweisprachige Esoterik-Katalog](https://alexanderr1991.github.io/Vera/de/esoterik-katalog/) enthält 17 redaktionelle Hauptäste mit 134 offenen Unterfragen und stabilen `ESO-xx.yy`-Kennungen. Er ist ein **ungeprüfter, veränderbarer Fragenbestand**, weder eine Wahrheits- noch eine Heilwirkungsdatenbank. Jeder Ast ist mit Geschichte, Symbolik, Erleben, Empirie, Ethik oder Formalisierung als erstem Prüfweg versehen; dies sagt nichts über die Wahrheit eines Weltbilds aus.

Ein neuer Unterast, eine andere Einordnung oder ein begründeter Widerspruch wird über das [Esoterik-Formular](https://github.com/AlexanderR1991/Vera/issues/new?template=esoterik-ast.yml) vorgeschlagen. Es wird **kein vorhandener Diskussionsfaden vorgetäuscht**: Das Formular eröffnet bei Absendung ein öffentliches Issue, keine automatische Aufnahme. Der Antrag nennt möglichst Parent-ID, Gegenposition, Quellen und Korrekturbedingung. Menschen prüfen Änderung und Doppelungen; KI-Systeme dürfen nicht autonom posten, stimmen oder redaktionell wahr sprechen. Kulturelle Herkunft, Schutzrechte und gesundheitliche Risiken sind mitzudenken. [Katalogregeln und Quellen](esoterik-katalog.md).

**English:** The [open esotericism catalogue](https://alexanderr1991.github.io/Vera/en/esoterik-katalog/) is a provisional bilingual map of 17 main branches and 134 questions with stable IDs. Readers may propose new branches, corrections or opposing views using a public GitHub issue form. A submission is not a published truth or an existing discussion thread; human review, provenance and dissent remain essential. AI may assist draft research but must not auto-post or promote claims.
