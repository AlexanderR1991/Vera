# Gemeinschaft und Redaktion / Community & editorial process

**WIRKLICH 1.0 · Grundtext des Wirklichen als philosophisches Fundament**

## Grundsatz / Principle

> Die Wirklichkeit steht über diesem Werk. / Reality stands above this work.

Jeder kann über Issues Argumente einbringen und über Pull Requests Änderungen vorschlagen. **Nicht jede Einreichung wird automatisch veröffentlicht.** Die Maintainer entscheiden vorläufig über die Aufnahme und begründen wichtige Ablehnungen oder Änderungen. Das ist kein unabhängiger wissenschaftlicher Review-Prozess.

Anyone can suggest ideas through issues or changes through pull requests. **Submission does not imply acceptance.** Maintainers make editorial decisions and should explain substantive corrections or rejections.

## Aktueller Stand / Current status

- Repository: öffentlich / public
- Issues: aktiviert / enabled
- Pull Requests: technisch verfügbar / available
- GitHub Discussions: aktiviert / enabled
- Maintainer: Repository-Eigentümer / repository owner
- Rechtliche Lizenzierung: Texte CC BY-SA 4.0; eigener Code MIT; Logo und fremde Materialien ausgenommen / content CC BY-SA 4.0, original code MIT; logo and third-party exceptions
- Formale wissenschaftliche Begutachtung: nicht eingerichtet / not established

## Ablauf / Process

1. **Frage, Einwand oder Vorschlag / Question, objection or proposal:** GitHub Issue erstellen.
2. **Diskussion / Discussion:** Aussagen präzisieren, Quellen und Gegenpositionen prüfen.
3. **Änderungsentwurf / Proposed revision:** Pull Request mit klarer Begründung.
4. **Prüfung / Review:** Bedeutung, Gegenargumente, Rechte, Sprache und mögliche Folgen prüfen.
5. **Entscheidung / Decision:** Merge, überarbeiten, oder begründet zurückstellen.
6. **Dokumentation / Record:** Wichtige Änderungen in der Versionsgeschichte erfassen.

## Wer darf die Regeln ändern? / Who can change the rules?

Für WIRKLICH gilt eine Gründungsentscheidung. Veröffentlichte Aussagen und das Verfahren selbst müssen öffentlich begründet angefochten und korrigiert werden können. Für redaktionelle Entscheidungen trägt ein benannter Mensch Verantwortung. Die Aufnahme einer Aussage in einen Prüfstatus braucht Gründe, die sich an dieser Aussage überprüfen lassen. Auch diese Setzung darf kritisiert werden. Wer etwa künftig Mehrheiten über den Wahrheitsstatus entscheiden lassen will, schlägt damit eine Neugründung oder ausdrücklich anders begründete Hauptversion vor. Der Bruch und die letzte Fassung unter den bisherigen Regeln bleiben in der [Versionsgeschichte](versionsgeschichte.md) erkennbar.

1. **Vorschlag.** Jede Person kann einen öffentlichen Regeländerungs-PR eröffnen. Er verlinkt die bisherige Regel mit Commit und Abschnitt, zeigt den neuen Wortlaut und einen Fall, in dem sich die Entscheidung ändern würde. Auch wer dadurch Entscheidungsmacht gewinnt oder verliert, gehört in die Begründung.
2. **Prüfung.** Es gelten die zu diesem Zeitpunkt auf `main` veröffentlichten Regeln, auch bei Änderungen dieses Abschnitts. Ändert sich eine einschlägige Regel während der Beratung, vermerkt der Maintainer den neuen Ausgangsstand und prüft den Vorschlag daran erneut. Ein Entwurf kann seine eigene Annahme nicht rechtfertigen.
3. **Entscheidung.** Derzeit entscheidet der Repository-Eigentümer. Er nennt im PR vorab einen Termin für Einwände und dokumentiert nach Ablauf die Entscheidung mit Gründen, dem stärksten verbleibenden Einwand und erkennbarer Befangenheit. Die neue Regel gilt ab ihrem Merge. Eine Neubewertung früherer Fälle braucht einen eigenen sichtbaren Vermerk. Für Einsprüche gilt das unten beschriebene Verfahren.

WIRKLICH starts from an explicit choice. Its published claims and procedures remain open to public challenge and correction, and a named human takes responsibility for editorial decisions. Assigning a review status requires reasons that can be checked against the claim. Abandoning that commitment requires a declared refounding or a distinctly identified major version. The record preserves the previous rules and the break.

Anyone may propose a rule change in a public PR. Link the previous rule at a specific commit, give the new wording, and identify a case that would be decided differently and whose authority changes. The rules already published on `main` govern the review, including changes to this section. If a relevant rule changes during review, the maintainer records the new baseline and reviews again. The repository owner currently decides, announces a deadline for objections in advance and records the reasons, strongest remaining objection and any conflict of interest after that deadline. The new rule takes effect at merge. Reopening earlier cases requires a visible record. The appeal process below also applies.

## Wenn Einwände gehäuft eingehen / When objections arrive in volume

Gleichlautende Einreichungen werden auf einen Vorgang verwiesen. Neue Gegenbelege, abweichende Gründe und der ursprüngliche Kontext bleiben dort einzeln auffindbar. Likes, Reaktionen, Kontenzahl und wiederholte KI-Ausgaben zählen weder als unabhängige Belege noch als Stimmen über den Prüfstatus. Dieselbe Regel gilt, ob hundert Personen denselben Punkt vorbringen oder ein einzelner Mensch ihn entdeckt.

Bei begrenzter Zeit priorisiert der Maintainer mögliche Schäden, folgenreiche Fehler und konkret prüfbare Einwände. Eine Zurückstellung erhält im Issue einen kurzen Grund und eine Bedingung für die Wiederaufnahme, etwa einen benannten Gegenfall oder freie Prüfkapazität. Schweigen zählt weder als Zustimmung noch als Widerlegung. Auch gegen das Zusammenlegen oder Zurückstellen ist der unten beschriebene Einspruch möglich.

Group duplicate submissions under one issue and preserve distinct evidence, reasons and original context there. Reactions, account counts and repeated AI output carry no evidential weight and do not set review status. When capacity is limited, the maintainer prioritizes potential harm, consequential errors and objections that can be checked. Record why an item was deferred and what would reopen it. Silence implies neither agreement nor refutation. Grouping and deferral can both be appealed below.

## Reifegrade und fachliche Zustimmung / Maturity and review

Eine Reifestufe R0–R4 ist **kein Wahrheitsurteil durch Mehrheitsbeschluss**. Wer eine Änderung vorschlägt, legt die genaue Version, passende Prüfungen, Gegenbelege, unabhängige Fachprüfung soweit erforderlich, verbleibende Einwände und Interessenkonflikte offen. Die redaktionelle Entscheidung liegt beim verantwortlichen Maintainer und ersetzt keine unabhängige Fachbegutachtung. Ein nachgewiesener Fehler kann unabhängig von Popularität zu Korrektur, Einschränkung oder Rückstufung führen. Ein einzelner unbelegter Widerspruch allein ist kein Nachweis. Jede Änderung braucht Versionsgeschichte, begründeten PR und bei geändertem Inhalt einen erneuerten echten Review. KI-Schwärme dürfen keinen Reviewstatus oder Reifegrad selbst vergeben. [Aufstiegsregeln](erkenntnisreife.md).

A maturity level is **not a majority vote on truth**. Proposals must identify the exact version, relevant checks, counterevidence, independent expertise when required, outstanding objections and conflicts. Editorial acceptance is not independent peer review. Substantive error can justify correction or demotion regardless of popularity; bare dissent does not itself disprove a claim. Maintain version history and a genuinely renewed review of changed content. AI systems may not assign or raise maturity or review status.

## Verantwortung / Responsibilities

Ein persönliches Prüfblatt aus der Werkstatt ist ein ungeprüfter Entwurf. Export, Speicherung und Import verleihen weder eine öffentliche Kennung noch eine fachliche Freigabe. Für eine Aufnahme ins Aussagenregister gelten dieselben Quellen-, Rechte-, Revisions- und menschlichen Prüfpflichten wie für andere Beiträge. Ein methodisch vollständiges Blatt darf trotzdem falsch, unklar oder nicht auflösbar sein.

A personal worksheet is an unreviewed draft. Exporting, saving or importing it does not grant a public identifier or expert approval. Admission to the claim register retains the same source, rights, revision and human review requirements as other contributions.

Respekt und substantielle Gegenargumente sollen nebeneinander möglich sein. Die Maintainer können toxische oder private Inhalte entfernen, müssen aber nicht vorgetäuschte Einstimmigkeit herstellen. Die Lizenzzuordnung ist in [LICENSING.md](../LICENSING.md) dokumentiert. Bei Beiträgen sind Rechte, Zustimmung und angemessene Namensnennung vor der Übernahme zu prüfen; die redaktionelle Verantwortung liegt weiterhin bei den Maintainers.

Respect and strong criticism can coexist. Maintainers can moderate harassment or private material without manufacturing consensus. License scope is documented in [LICENSING.md](../LICENSING.md). Author rights and consent require review before third-party contributions are merged; editorial responsibility remains with maintainers.

## Einspruch gegen eine redaktionelle Entscheidung / Appealing an editorial decision

Ein konkreter Einspruch kann als öffentliches Issue mit Link zur Entscheidung gestellt werden. Er enthält die betroffene Aussage, den stärksten Einwand, die verlangte Änderung und mögliche Interessenkonflikte. Die Antwort soll die entscheidende Person, Gründe und verbleibende offene Fragen nennen. Redaktionelle Annahme ersetzt keine Fachprüfung.

Wenn ein Einwand eine eigene Entscheidung des Repository-Eigentümers betrifft, ist dessen Antwort **keine unabhängige Einspruchsprüfung**. Eine unabhängige Prüfperson wird erst benannt, wenn sie tatsächlich zugesagt hat. Solange eine solche Prüfung fehlt, bleibt dieser Mangel sichtbar; ausbleibende Antwort oder Zustimmung der KI gilt nicht als Bestätigung. Ein institutionell unabhängiges Verfahren ist weiterhin aufzubauen. Die konkrete Selbstprüfung läuft in [B-02](https://github.com/AlexanderR1991/Wirklich/issues/29).

Appeals can be submitted as public issues identifying the decision, objection, requested change and conflicts of interest. The decision-maker should state reasons and unresolved questions. An owner's review of their own decision is not independent. No independent reviewer or appeals institution is claimed before one actually exists.

## Diskussionsräume / Discussion spaces

In [Discussions](https://github.com/AlexanderR1991/Wirklich/discussions) können offene Gespräche, Vorstellungsrunden und die Erkundung von Ideen stattfinden. Die zweisprachige Website-Seite [Das Forum](https://alexanderr1991.github.io/Wirklich/de/forum/) führt zu diesen Gesprächen und zu einem festen öffentlichen Issue-Debattenfaden **je Aussage-ID**. Die Zuordnung steht in [forum-threads.json](../public/knowledge/forum-threads.json); die Debatten bleiben auch bei neuen Aussageversionen nachvollziehbar. **Issues** bleiben für konkrete, prüfbare Aufgaben, Fehler und die an Aussagen gebundenen Debatten; **Pull Requests** für tatsächliche Text- und Codeänderungen. Die Agora-/Stoa-/Curia-Namen dienen der Orientierung, sie sind keine gesondert betriebenen Unterforen. Gesprächsbeiträge und Reaktionen setzen keine Wahrheitsebene und keinen Prüfstatus herauf. [Forum-Protokoll](forum.md).

The bilingual [Forum](https://alexanderr1991.github.io/Wirklich/en/forum/) links open GitHub Discussions and permanent issue threads for every registered claim. [The mapping](../public/knowledge/forum-threads.json) uses stable claim IDs. Those discussions do not change review or maturity status automatically. The Agora/Stoa/Curia labels describe paths through existing GitHub services, not separately hosted subforums. Actual edits go through reviewed pull requests.

## Erster Beitrag / Welcome discussion

Die zweisprachige Begrüßung ist in [Discussion #7](https://github.com/AlexanderR1991/Wirklich/discussions/7) veröffentlicht. Die [Textfassung](community/welcome-discussion.md) liegt im Repository.

## Zugang und vertrauliche Beschwerden / Access and private reports

Spielen und das persönliche Prüfblatt benötigen kein GitHub-Konto. Für öffentliche Beiträge ist GitHub derzeit weiterhin eine Hürde. In einer betreuten Pilotrunde kann eine Person ihre Frage mündlich oder auf Papier formulieren. Eine andere Person darf sie nur mit ausdrücklicher Zustimmung und nach Rückprüfung des Wortlauts öffentlich übertragen; Hilfe beim Einreichen verleiht kein Stimmrecht über den Inhalt. Ein allgemeiner betreuter Einreichungsdienst wird noch nicht angeboten.

Öffentliche Issues sind für sachliche redaktionelle Einwände geeignet, nicht für vertrauliche Beschwerden mit privaten Angaben. Ein vertraulicher Meldeweg mit zugesagter zuständiger Person, angemessener Reaktion und Umgang mit Befangenheit ist noch nicht eingerichtet. Vor breiter Community-Einladung muss diese Lücke geschlossen werden. Bis dahin bleibt der Nutzungspilot begrenzt und persönlich betreut. Es wird keine private Meldestelle oder Reaktionsfrist behauptet, die niemand verlässlich übernimmt.

Playing and private worksheets need no GitHub account; public contributions currently do. During a facilitated pilot, a helper may submit a participant's wording only with explicit consent and their check of the final text. Public issues are unsuitable for confidential reports. A private reporting route, an actual responder and a way to handle conflicts of interest must be established before broad community recruitment. These are open requirements, not existing services.


## KI-Autonomie, Aufmerksamkeit und Minderheiteneinwände / AI autonomy and minority challenges

**Die Zahl der Fragen darf wachsen. Die Unübersichtlichkeit nicht.** Nach dem [Fragenatlas-Protokoll](fragenatlas.md) bleiben menschliche Gespräche, begrenzte KI-Forschungsentwürfe und das manuell gepflegte Fragenregister getrennt. Die Projektschwärme dürfen keine Issues, Discussions oder Kommentare automatisch fluten; KI-Beiträge auf menschliche Nachfrage sind klar zu kennzeichnen. Masse, Likes und Modellübereinstimmung ändern weder Wahrheit noch Erkenntnisreife.

Ein Vorschlag zum Verbinden von Fragen muss Originalformulierungen, Herkunft, begründete Beziehungen, mögliche Unterschiede und einen Einspruch offenhalten. Die Redaktion entscheidet im öffentlichen PR, ohne Minderheiten durch Häufigkeit zu überstimmen. Ein neuer qualifizierter Gegenbeleg kann eine Wiederprüfung auslösen, nicht unmittelbar eine R-Stufe verändern.

Fremde Bots können nicht zuverlässig allein anhand des Schreibstils erkannt werden. Moderation, Beitragslimits, erreichbare Ansprechpersonen und ein unabhängiger Einspruchsweg bleiben vor breiter Skalierung zu klären. Eigenständige KI-Publikationsrechte würden eine gesonderte öffentliche Regeländerung mit Risiko-, Kosten- und Verantwortungsprüfung erfordern.

**English:** Separate bounded AI drafts from human discussion and editorial question links. Preserve provenance and minority objections. One serious new objection can reopen scrutiny; no bot volume may promote a claim. Independent moderation and trusted reporting remain open requirements.
