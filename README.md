# Vera

![](public/images/vera-github.svg)

**Die offene Erkenntniswerkstatt · The open inquiry workshop**

**Hallo, ich bin Vera. Bitte hilf mir besser zu werden.** Bring eine Frage mit. In der Werkstatt kannst du eine Antwort prüfen, ihre Gründe nachvollziehen und ihr begründet widersprechen.

**Hi, I’m Vera. Please help me get better.** Bring a question. In the workshop, you can examine an answer, follow its reasoning and challenge it with reasons of your own.

1. **Werkstatt öffnen · Visit the workshop.** [Website auf Deutsch](https://alexanderr1991.github.io/Vera/de/) · [Website in English](https://alexanderr1991.github.io/Vera/en/)
2. **Korrekturen nachvollziehen · Follow a correction.** [Regelkreis (DE)](https://alexanderr1991.github.io/Vera/de/regelkreis/) · [Correction loop (EN)](https://alexanderr1991.github.io/Vera/en/regelkreis/) · [Protokoll / Protocol](public/protocol/self-correction.v1.json)
3. **Mitwirken · Contribute.** [Rückmeldung geben / Give feedback](https://github.com/AlexanderR1991/Vera/issues/new?template=rueckmeldung.yml) · [Einwand einreichen / Submit an objection](https://github.com/AlexanderR1991/Vera/issues/new?template=angriff.yml) · [Beitragsleitfaden / Contribution guide](CONTRIBUTING.md)

**Projektstand · Project status.** Heute gibt es eine öffentliche Werkstatt, ein lokales Prüfblatt und erste Prototypen. Das Entwicklungsziel ist eine eigenständig lauffähige Open-Source-KI mit Menschen, für Menschen. [Vision und aktueller Stand (DE)](docs/open-source-ki.md)

Today there is a public workshop, a local worksheet and early prototypes. The development goal is independently runnable open-source AI built with people, for people. [Vision and current status (EN)](docs/en/open-source-ai.md)

[Mit Vera im KI-Chat arbeiten · Work with Vera in your AI chat](#mit-vera-arbeiten--work-with-vera)

**WIRKLICH · Philosophischer Motor.** Prüfe Veras Selbstmodell und seine Belege. [Frag mich](https://alexanderr1991.github.io/Vera/de/#vera-fragen) · [Ask me](https://alexanderr1991.github.io/Vera/en/#ask-vera) · [Modell und Terminalabfrage / Model and CLI](docs/vera.md#vera-abfragen)

> **META-01 · Wir bauen kein System, das recht behalten soll. Wir bauen ein System, das aus seinen Irrtümern lernen muss.**

Dieser Satz ist eine **anfechtbare Verfahrensregel**, nicht bloß Werbung: Jede Frage darf geprüft werden, ein starker Einwand muss eine neue Prüfung auslösen können, und substanzielle Korrekturen bleiben mit Gründen und verantwortlicher Person nachvollziehbar. [Der Regelkreis (DE)](https://alexanderr1991.github.io/Vera/de/regelkreis/) · [Normativer Grundsatz](docs/selbstkorrektur.md) · [Maschinenlesbarer Entwurf](public/protocol/self-correction.v1.json).

> **META-01 · We are not building a system to be right. We are building a system that must learn from its mistakes.**

The challengeable process rule asks for a traceable revision path, type-appropriate checks, visible dissent and human accountability—not automatic agreement or AI-certified truth. [The correction loop (EN)](https://alexanderr1991.github.io/Vera/en/regelkreis/).

**Mit Philosophie die Menschheit zum Konsens führen.** Hier kann jeder eine Frage stellen. Wenn unsere Antworten auseinandergehen, suchen wir nach einem Punkt, den wir aus eigenen Gründen mittragen. Was strittig bleibt, halten wir fest. Unsere philosophische Grundlage ist der [Grundtext des Wirklichen](docs/grundtext.md).[^ursprung]

**To guide humanity toward consensus through philosophy.** Anyone can bring a question. When our answers differ, we look for a point we can each agree on for our own reasons. We record where we still disagree.

## Die Grundidee: kollektive Intelligenz · The founding idea: collective intelligence

**Vera soll Menschen nicht das Denken abnehmen, sondern ihnen ermöglichen, gemeinsam besser zu denken.** Der Atlas ordnet Fragen, das Forum bewahrt Widerspruch, Git dokumentiert unsere Revisionen, der philosophische Motor prüft Gründe und KI darf begrenzte Muster und Gegenargumente vorschlagen. Damit könnte ein korrigierbarer gemeinsamer Lernprozess entstehen. **Das ist bisher eine unvalidierte Architekturhypothese, keine bewiesene kollektive Intelligenz.** [Konzept CI-0.1](docs/kollektive-intelligenz.md) · [Grundidee auf der Website](https://alexanderr1991.github.io/Vera/de/kollektive-intelligenz/) · [Datenvertrag](public/protocol/collective-intelligence.v0.json).

**Vera aims to help people think better together, not replace their judgment.** Its atlas maps domains, documented objections enable revision, the philosophical engine tests reasons and AI may assist with proposed links and challenges. This is an **unvalidated hypothesis**, not a demonstrated collective mind. [English concept](docs/en/kollektive-intelligenz.md) · [Public explanation](https://alexanderr1991.github.io/Vera/en/kollektive-intelligenz/).

**Menschen vor Skalierung.** Jeder Mensch soll mit einer einfachen Frage beginnen und in eigenem Tempo mitdenken oder widersprechen können. Verständlichkeit und echte Zugänglichkeit haben Vorrang vor Funktionsfülle und KI-Automatisierung. Das ist unser [oberstes Gestaltungsprinzip im Grundtext](docs/grundtext.md#oberstes-gebot-für-gestaltung-und-wachstum-jeden-menschen-abholen) – ein prüfbarer Anspruch, keine bereits erreichte Garantie.

**People before scale.** Anyone should be able to start with a simple question, think along at their own pace and disagree. Understanding and genuine access come before feature growth and AI automation. See the [foundational principle (draft translation)](docs/en/grundtext.md#highest-priority-for-design-and-growth-meet-people-where-they-are).

**Zugang prüfen · Check the entry path.** `python3 scripts/check_vera_entry.py --live` prüft die beiden Sprachfassungen vom Einstieg über die erste Antwort bis zum Korrekturhinweis. Nach dem Pages-Deploy prüft derselbe Befehl zusätzlich den erwarteten Commit. Ob Menschen den Weg verstehen, bleibt eine eigene [freiwillige Leseprobe](https://alexanderr1991.github.io/Vera/de/regelkreis/#leseprobe).

The live check follows both language versions from the homepage through the first answer to the correction guide. After deployment it also verifies the expected commit. An [optional first-time reader check](https://alexanderr1991.github.io/Vera/en/regelkreis/#leseprobe) explores whether people understand it.

| Einstieg | Deutsch | English |
| --- | --- | --- |
| Kollektive Intelligenz als Grundidee prüfen · Explore collective intelligence | [Grundidee](https://alexanderr1991.github.io/Vera/de/kollektive-intelligenz/) | [Founding idea](https://alexanderr1991.github.io/Vera/en/kollektive-intelligenz/) |
| Den selbstkorrigierenden Regelkreis verstehen · Explore the correction loop | [Regelkreis](https://alexanderr1991.github.io/Vera/de/regelkreis/) | [Correction loop](https://alexanderr1991.github.io/Vera/en/regelkreis/) |
| Eine Alltagsfrage prüfen · Examine an everyday question | [Fragen und erste Antworten](https://alexanderr1991.github.io/Vera/de/forum/#alltagsfragen) | [Questions and first answers](https://alexanderr1991.github.io/Vera/en/forum/#alltagsfragen) |
| Den philosophischen Motor für KI prüfen · Examine the philosophical engine for AI | [KI und Mensch](https://alexanderr1991.github.io/Vera/de/ki-und-mensch/) | [AI and Humanity](https://alexanderr1991.github.io/Vera/en/ki-und-mensch/) |
| Eine Minute spielen · Play a one-minute round | [Auf den zweiten Blick](https://alexanderr1991.github.io/Vera/de/spiel/) | [A second look](https://alexanderr1991.github.io/Vera/en/spiel/) |
| Einem Kunstwerk begegnen · Encounter a work of art | [Liber Artis](https://alexanderr1991.github.io/Vera/de/kunst-und-erkenntnis/#sammlung) | [Liber Artis](https://alexanderr1991.github.io/Vera/en/kunst-und-erkenntnis/#sammlung) |
| Die Werkstatt kennenlernen · Visit the workshop | [Startseite](https://alexanderr1991.github.io/Vera/de/) | [Home](https://alexanderr1991.github.io/Vera/en/) |
| Mit der eigenen KI Gegenargumente suchen · Ask your own AI for objections | [Prüfregeln für deinen Chat kopieren](https://alexanderr1991.github.io/Vera/de/fragen-und-ki-prompt/#prompt) | [Copy the rules for your chat](https://alexanderr1991.github.io/Vera/en/fragen-und-ki-prompt/#prompt) |
| Eine echte Korrektur lesen · Follow a real revision | [Wann ist Hilfe gut?](https://alexanderr1991.github.io/Vera/de/methode/#g-005) | [What makes help good?](https://alexanderr1991.github.io/Vera/en/methode/#g-005) |
| Eine Frage für sich prüfen · Work privately | [Prüfblatt öffnen](https://alexanderr1991.github.io/Vera/de/werkstatt/) | [Open a worksheet](https://alexanderr1991.github.io/Vera/en/werkstatt/) |
| Kollektive Moral als korrigierbaren Richtungsindex untersuchen · Explore collective morality | [Kollektive Moral](https://alexanderr1991.github.io/Vera/de/kollektive-moral/) | [Collective morality](https://alexanderr1991.github.io/Vera/en/kollektive-moral/) |
| Eine passende Verbindung finden · Find a relevant connection | [Erkenntnisnavigator](https://alexanderr1991.github.io/Vera/de/erkenntnisnavigator/) | [Knowledge navigator](https://alexanderr1991.github.io/Vera/en/erkenntnisnavigator/) |
| Politik und wirtschaftliche Macht prüfen · Examine politics and economic power | [Marx und fünf Gegenproben](https://alexanderr1991.github.io/Vera/de/politik-die-dem-menschen-dient/#eigentum-und-macht) | [Marx and five countertests](https://alexanderr1991.github.io/Vera/en/politik-die-dem-menschen-dient/#eigentum-und-macht) |
| Ein Netz verbundener Fragen sehen · Explore linked questions | [Fragenatlas (Pilot)](https://alexanderr1991.github.io/Vera/de/forum/#fragenatlas) | [Question atlas (pilot)](https://alexanderr1991.github.io/Vera/en/forum/#fragenatlas) |
| Die übergreifenden Grundfragen prüfen · Explore fundamental questions | [16 Grundfragen · Forschungsatlas](https://alexanderr1991.github.io/Vera/de/grundfragen/) | [16 Fundamental Questions · Research Atlas](https://alexanderr1991.github.io/Vera/en/grundfragen/) |
| Die Mathematik der Verständigung prüfen · Explore the mathematics of understanding | [Die Brücke · M-02](https://alexanderr1991.github.io/Vera/de/die-bruecke/) | [The Bridge · M-02](https://alexanderr1991.github.io/Vera/en/die-bruecke/) |
| Die Mathematik des Motors prüfen · Examine the engine's mathematics | [M-03 · Der philosophische Motor](https://alexanderr1991.github.io/Vera/de/philosophischer-motor/) | [M-03 · Philosophical Engine](https://alexanderr1991.github.io/Vera/en/philosophischer-motor/) |
| Einen esoterischen Wissensast prüfen · Explore an esoteric question | [Esoterik-Wissensbaum](https://alexanderr1991.github.io/Vera/de/esoterik-katalog/) | [Esotericism tree](https://alexanderr1991.github.io/Vera/en/esoterik-katalog/) |
| Eine Frage öffentlich stellen · Ask in public | [GitHub-Frageformular](https://github.com/AlexanderR1991/Vera/issues/new?template=frage.yml) | [GitHub question form](https://github.com/AlexanderR1991/Vera/issues/new?template=frage.yml) |

## English edition and translation review / Englische Ausgabe und Übersetzungsprüfung

The website has German and English routes; the English text remains a machine-assisted draft without independent philosophical review. The source documentation is only partly available in English. **Technical language parity is not a statement of philosophical accuracy.**

Start with the [English documentation guide](docs/en/README.md), the [English foundational theses (draft)](docs/en/grundtext.md), the [DE/EN terminology glossary](docs/i18n-glossary.md), and the [public translation and review inventory](public/i18n/review-register.v1.json). The [internationalization procedure](docs/internationalisierung.md) explains automated checks and the human review gate. [Propose a translation correction](https://github.com/AlexanderR1991/Vera/issues/new?template=uebersetzung.yml).

Die Website besitzt deutsche und englische Seiten. Dies ist **noch keine vollständige, unabhängig geprüfte Zweisprachigkeit** des gesamten Repositories. Das Register unterscheidet Entwurf, Teilübersetzung, ungeprüften Bestand und dokumentierte menschliche Freigabe.

## WIRKLICH · ENTITÄT · ENT-00 (Forschungsprototyp)

**Frage → Aussageart → Perspektiven → stärkster Einwand → Prüfung → Revisionsentwurf → menschliche Entscheidung → Änderungsgeschichte → neue Frage.** Die [Entität](docs/entitaet.md) ist unsere offene, anfechtbare Integrationsarchitektur für bestehende Atlas-, Forum-, KI- und Erkenntniswerkzeuge, **keine Behauptung künstlichen Lebens oder bereits vorhandener Autonomie**. Ein [bilingualer lokaler Prototyp](https://alexanderr1991.github.io/Vera/de/entitaet/) demonstriert versionierte Einwände. Das [offene JSON-Protokoll](public/protocol/entity-loop.v0.json) und ein [testbarer Codekern](src/lib/entity-core.mjs) halten KI-Entwürfe, echte menschliche Reviews, nicht erhobenen Konsens und fehlende Richtungswerte getrennt. Die überlappenden Forschungsentwürfe bleiben fachlich ungeprüft.

**English:** [ENTITY / ENT-00](docs/entitaet.md#english--ent-00--wirklich--entity) is a contestable architecture and an in-browser draft-loop demonstration, not conscious AI, autonomous publishing or validated collective intelligence. No numeric truth score is produced.

## Was MUSS KI für Menschen sein? · What MUST AI be for us?

Künstliche Intelligenz braucht mehr als Fähigkeiten. **Vera will mit Menschen einen philosophischen Motor für KI entwickeln**: einen offenen, korrigierbaren Prüfrahmen über Wahrheit, Freiheit, Würde, Macht und Verantwortung. [Charta (Entwurf)](docs/ki-charta.md) · [Acht Leitthesen und sechs Gegenproben als JSON](public/ai/philosophy-engine.v0.json) · [Freiwilliges KI-Regelpaket](docs/erkenntnisprompt.md). Die Prinzipien sind angreifbar; weder Prompt noch KI-Schwarm können Modellverhalten erzwingen oder eine unabhängige Prüfung ersetzen.

**We ask people to define and challenge the principles by which AI is judged.** This is a provisional, human-origin inquiry framework, not a universal or certified ethics standard.

## Warum Open Source bleiben muss · Why we must remain open source

**Unser Interessenmaßstab ist die Menschheit – kein Eigentümer, kein Unternehmen, kein Staat und keine KI.** Wer Menschen beim Prüfen von Erkenntnissen unterstützt, muss die eigenen Texte, Regeln, Methoden und möglichen Bewertungen selbst prüfbar und korrigierbar halten. Eine offene Lizenz allein garantiert weder Unabhängigkeit noch gerechte Teilhabe; private Daten und Rechte Dritter gehören nicht in die Öffentlichkeit. Wir sprechen **nicht** im Namen der Menschheit und haben noch keine unabhängige, repräsentative Governance. [OPEN-01: Begründung, Einwände und Grenzen](docs/offenheit.md) · [Governance](docs/community-governance.md).

**Humanity is the interest we seek to serve—not an authority we can claim to represent.** A system that helps examine human judgments must expose its own published rules, reasoning and methods to scrutiny and correction. Open licenses enable independent continuation but cannot by themselves prevent capture. Privacy and contributors' rights remain protected. [OPEN-01: English draft](docs/en/openness.md) · [Licenses](LICENSING.md).

**Open Source – nach vorn gerichtet:** Wir veröffentlichen nicht nur den heutigen Stand, sondern schaffen die Möglichkeit, dass andere ihn prüfen, widerlegen, erweitern oder unabhängig weiterentwickeln. Langfristiges Ziel sind offene, versionierte Formate, dokumentierte Schnittstellen, portable Daten und ein unabhängig implementierbares Erkenntnisprotokoll. **Das ist ein Entwicklungsziel, noch kein etablierter Standard.** [Zukunftsoffenheit und Prüfkriterien](docs/offenheit.md#open-source--nach-vorn-gerichtet) · [Roadmap](docs/roadmap.md).

**Open source—looking forward:** We want others to be able to scrutinize, challenge, extend and independently develop our work—not merely read today's version. Versioned open formats, documented interfaces, portable data and an independently implementable inquiry protocol are long-term goals, **not an established standard**. [Future openness and test criteria](docs/en/openness.md#open-sourcelooking-forward).

## Vera lokal fragen · Ask Vera locally

Vera übergibt das [versionierte Projektprofil](docs/vera.md) und den Erkenntnisprompt an ein lokales Sprachmodell. Du brauchst einen Git-Checkout, Node.js ab 22.12 und [Ollama](https://ollama.com/download) mit [abgeschalteten Cloud-Funktionen](https://docs.ollama.com/faq#how-do-i-disable-ollamas-cloud-features). Lade einmal ein [Modell mit Werkzeugunterstützung](https://ollama.com/library/qwen3:4b), etwa mit `ollama pull qwen3:4b`. Danach funktionieren beide Befehle offline.

```sh
node scripts/vera-ask.mjs de qwen3:4b "Wie prüft Vera, ob Verstehen und Zustimmung auseinanderfallen?"
node scripts/vera-ask.mjs de qwen3:4b --explore
```

Vera passes the versioned project profile and inquiry prompt to a local language model. Use a Git checkout, Node.js 22.12 or later, and Ollama with cloud features disabled. Download a model with tool support once, for example with `ollama pull qwen3:4b`. Both commands then work offline.

```sh
node scripts/vera-ask.mjs en qwen3:4b "How does Vera test when understanding and agreement diverge?"
node scripts/vera-ask.mjs en qwen3:4b --explore
```

Bei einer entscheidenden Wissenslücke kann das Modell selbst eine Suche anfordern. Mit `--explore` wählt es die Frage aus dem Grundfragenregister. Pro Lauf steht eine lokale Stichwortsuche in den Dokumenten desselben Git-Stands zur Verfügung. Das Terminal zeigt den Suchgrund und bis zu drei tatsächlich abgerufene Fundstellen separat vom Entwurf. Ein leerer Trefferbericht lässt die Frage offen. Wie gut das Modell Lücken und passende Suchbegriffe erkennt, lässt sich mit dem gewählten Modell prüfen. Der Befehl verbindet sich mit `127.0.0.1` (Port `11434`, einstellbar mit `VERA_OLLAMA_PORT`).

The model can request a search when a consequential gap remains. With `--explore`, it selects an open question from the project catalogue. Each run can perform one local keyword search in the documentation at the same Git revision. The terminal shows the reason for searching and up to three retrieved passages separately from the draft. An empty result leaves the gap open. Test how well your chosen model identifies gaps and selects search terms. The command connects to `127.0.0.1` (port `11434`, configurable via `VERA_OLLAMA_PORT`).

## Gemeinsam klüger werden · Learn together

**Wenn Open Source bei Blender funktioniert, warum nicht auch in der Philosophie?** Bei Blender kann jemand einen Fehler zeigen, den andere übersehen haben, und eine Änderung vorschlagen. Bei Vera kann ein einziger Einwand einen Grundsatz verändern. Einer unserer Sätze empfahl, Menschen so zu helfen, dass sie ihre eigene Kraft finden. Was ist mit jemandem, der ein Leben lang Hilfe braucht? Heute steht ausdrücklich im Text, dass Fürsorge auch dann wertvoll ist. Lies beide Fassungen und prüfe selbst, ob die neue dem Einwand gerecht wird. [Mitwirken bei Blender](https://www.blender.org/get-involved/) · [Die Änderung im Wortlaut](https://github.com/AlexanderR1991/Vera/pull/31/files)

**If open source works for Blender, why not for philosophy?** In Blender, someone can point out a bug others missed and propose a fix. At Vera, a single objection can change a principle. We wrote that we should help people find their own strength. What about someone who will need support all their life? The text now explicitly affirms the value of care in that case too. Read both versions and judge for yourself whether the revision answers the objection. [Contribute to Blender](https://www.blender.org/get-involved/) · [Follow the revision in English](https://alexanderr1991.github.io/Vera/en/methode/#g-005)

**Irrtum für Irrtum:** vermuten, prüfen und begründet weiterdenken. Vier erfundene Alltagskarten und drei freiwillige Einstiegsfragen im Prüfblatt bilden den Anfang. Wer genauer prüfen möchte, öffnet weitere Fragen. Begründetes Beibehalten und Offenlassen sind ebenso möglich wie eine Korrektur. [Konzept, Selbstangriff und offene Grenzen](docs/emporirren.md) · [Erster Nutzungspilot](docs/spielpilot.md)

Four fictional everyday cards and three optional worksheet prompts offer a simple start. Depth is optional. Keeping a well-supported answer and leaving a question open are valid outcomes. Accessibility across needs and independent learning transfer still need real-world testing.

## Woran wir arbeiten · What we do

Bei einer Tatsachenfrage suchen wir Belege und Gegenbelege. Bei einer Wertfrage legen wir den Maßstab offen und hören auf die Menschen, die mit den Folgen leben. Aus vorhandenen Erkenntnissen kann eine neue Vermutung entstehen. Wir formulieren, woran sie scheitern könnte. Ein begründeter Dissens kann das Ergebnis sein. [Methode](docs/methode.md) · [Mission](docs/mission.md)

The topic map connects questions across disciplines. Each claim record gives its scope, reasons, strongest objection, review status and revision history. Research feeds collect leads. People decide which revisions enter the public record. [Explore topics](https://alexanderr1991.github.io/Vera/en/baum-des-wissens/) · [Inspect the register](https://alexanderr1991.github.io/Vera/en/aussagen/)

## Die Grundfragen · Universal Question Loop

**Fragen hinter den Fachfragen:** Die [neue zweisprachige Grundfragen-Sammlung](https://alexanderr1991.github.io/Vera/de/grundfragen/) verbindet 16 **redaktionell synthetisierte, ausdrücklich ungeprüfte** Fragen mit Quellen aus Liebe, Politik, Medizin, KI, Mathematik, Esoterik und weiteren Bereichen. [Regeln und Grenzen](docs/grundfragen-kreislauf.md) · [versionierter Fragenbestand](public/knowledge/universal-questions.v1.json) · [leeres Befundregister](public/knowledge/universal-findings.v1.json). Ein reproduzierbarer, **lexikalischer** Public-Corpus-Scan liefert nur mögliche Querverbindungen, keine vollständige semantische Analyse oder automatische Wahrheit. Nach echter menschlicher Prüfung können begrenzte Erkenntnisse in zugeordnete Fachseiten eingeblendet werden; öffentliche GitHub-Issues bleiben Vorschläge.

**Questions behind the subject questions:** The [bilingual fundamental-question atlas](https://alexanderr1991.github.io/Vera/en/grundfragen/) offers 16 **unreviewed editorial cross-domain questions** with source traces, counterquestions and destinations for future findings. A reproducible **keyword-level** scan of public texts is not a full AI semantic analysis or evidence. The reviewed findings ledger is **empty**; human-reviewed partial answers can eventually appear in the mapped domain pages after documented PR review. [Protocol and English overview](docs/grundfragen-kreislauf.md) · [Open fundamental question issue form](https://github.com/AlexanderR1991/Vera/issues/new?template=grundfrage.yml).

## Die Brücke · Mathematics Between Minds

**Verstehen ist nicht Zustimmung.** M-02 untersucht in einem bewusst engen Modell, wie zutreffend zwei Menschen die jeweils formulierten Positionen wiedergeben können – getrennt davon, wie stark diese Positionen übereinstimmen. Das elementare Gegenbeispiel ist mathematisch nachvollziehbar; die Behauptung, dass bestimmte Gesprächsformen Verständigung *tatsächlich verbessern*, bleibt eine **ungetestete, widerlegbare Hypothese**. Keine psychologisch validierte Skala und keine Bewertung von Menschen. [Forschungsentwurf M-02](docs/mathematik-des-dazwischen.md) · [Mathematischer Prüfstand](docs/mathematischer-pruefstand.md) · [Zweisprachige Modelldemonstration](https://alexanderr1991.github.io/Vera/de/die-bruecke/).

**Understanding need not mean agreement.** M-02 uses a restricted, explicitly provisional mathematical model to distinguish directed accuracy of restating another person's expressed position from agreement on the same items. Elementary numerical examples are formally checkable; the predicted benefit of reciprocal restatement is an **untested empirical hypothesis**, not a proved law of cooperation. No person ranking, moral truth score or validated measurement instrument is claimed. [Research proposal and English précis](docs/mathematik-des-dazwischen.md) · [Interactive toy model in English](https://alexanderr1991.github.io/Vera/en/die-bruecke/).

## Wie reift eine Erkenntnis? · How a claim matures

Ein Vorschlag kann von **R0 (ungeprüft)** über dokumentierte menschliche und unabhängige Gegenprüfung bis **R4 (robust gegenkritisiert)** gelangen – und bei belastbarem Gegenbeleg zurückfallen. Aussageart, Abstraktion, Erkenntnisreife und Konsens werden **getrennt** erfasst; Mehrheiten und KI-Ausgaben verleihen kein Wahrheitssiegel. Die drei Demonstrationseinträge sind unverändert ungeprüft (R0). [Regeln für Aufstieg und Rückstufung](docs/erkenntnisreife.md) · [Aussagenregister](https://alexanderr1991.github.io/Vera/de/aussagen/)

A claim may advance from **R0 (unreviewed)** to **R4 (robust under criticism)** through documented, type-appropriate human and independent checks, and may be demoted after substantive counterevidence. Abstraction, maturity and agreement remain separate. All three demo records remain R0. [Read the rules](docs/erkenntnisreife.md) · [Claim register](https://alexanderr1991.github.io/Vera/en/aussagen/)

## Stand und offene Prüfung · Status and open work

Der **Erkenntnisnavigator** ergänzt den Baum um redaktionelle Entwurfskarten. Fragen und Begriffe führen zu Themen und möglichen Mustern. Die Suche zeigt passende Wörter oder zwei gemeinsam erkannte Hinweise. Von jedem zugeordneten Ast führt ein begründeter Weg über die Karte zu den anderen Ästen. Die Voraussetzungen lassen sich einzeln prüfen. Freiwillige Reflexion und Textausgabe bleiben im Browser, bis jemand selbst eine Datei exportiert. Keine laufende KI, kein menschlicher Gesamtwert und keine automatische Übernahme ins Aussagenregister. [Architektur und Evaluationsplan](docs/erkenntnisnavigator.md) · [Was Vera an einer Metapher lernen kann](docs/metaphern-lernen.md)

The **knowledge navigator** offers editorial draft connections, explicit applicability checks and an optional private reflection note. Questions and terms lead to topics and cards through local word matching and paired textual clues. Every topic-to-card link has a stated reason. Its usefulness compared with ordinary search has not yet been evaluated. [What Vera can learn from a metaphor](docs/en/metaphor-learning.md)

Version **1.0.0** stellt das lokale Prüfblatt mit Import und Export bereit. Die öffentlichen Zahlen zum Aussagenbestand und zu dokumentierten Reviews werden aus dem Register berechnet. Ob das Prüfblatt Menschen zu besser begründeten Urteilen verhilft, ist eine offene Forschungsfrage. [Projektstatus](https://alexanderr1991.github.io/Vera/de/projektstatus/) · [Vergleichsprotokoll](docs/evaluation-v1.md)

The [status page](https://alexanderr1991.github.io/Vera/en/projektstatus/) shows what has been reviewed. The next goals are ten claims examined by qualified human reviewers, a comparison with ordinary source checking and an independent route for appeals. [Roadmap](docs/roadmap.md) · [Governance](docs/community-governance.md) · [Funding](docs/finanzierung.md)

## Freie Rede braucht Schutz · Freedom to challenge

**Auch das Unbequeme darf zur Sprache kommen.** Eine Kritik wird nicht wegen Kränkung, Unbeliebtheit oder Widerspruch zur Projektleitung beseitigt. Doch Menschen haben weder einen Anspruch auf ein ungeschütztes Publikum noch müssen wir Drohungen, Doxxing oder gezielte Einschüchterung öffentlich konservieren. Der **anfechtbare Entwurf REDE-01** sieht eine gestufte Sichtbarkeitsentscheidung vor: stehen lassen, einordnen, vorläufig einschränken und prüfen, öffentliche Verbreitung beenden. Mit menschlicher Verantwortung, datensparsamer Begründung und Einspruch. Das ist **noch kein aktives Moderationssystem**. [REDE-01 (DE/EN)](docs/redefreiheit-und-schutz.md) · [Versionierter Verfahrensentwurf](public/protocol/speech-and-safety.v0.json).

**English:** Discomfort, dissent and criticism of Vera do not themselves warrant suppression. Credible threats, privacy abuse and targeted harassment may require proportionate restrictions. REDE-01 proposes four visibility outcomes with human reasons and appeal, not a live automated filter. [Read the bilingual proposal](docs/redefreiheit-und-schutz.md).

## Mitwirken · Contribute

Eine Frage braucht nur einen verständlichen Satz. Für einen Einwand helfen die genaue Stelle, dein Grund und eine mögliche Korrektur. Redaktionelle Änderungen werden in einem öffentlichen Pull Request begründet und von einem verantwortlichen Menschen freigegeben. [Beitragsleitfaden / Contribution guide](CONTRIBUTING.md) · [Kritik einreichen / Challenge a claim](https://github.com/AlexanderR1991/Vera/issues/new?template=angriff.yml) · [Erkenntnisprompt / Inquiry prompt](docs/erkenntnisprompt.md)

## Mit Vera arbeiten · Work with Vera

**Auf GitHub.** Wenn der Copilot Cloud Agent für dich und das Repository verfügbar ist, wähle im Agentenmenü zuerst `AlexanderR1991/Vera` und dann **Vera**. Das Profil gibt ihr Werkzeuge zum Lesen und Suchen. [Agentenmenü](https://github.com/copilot/agents) · [Agentenprofil](.github/agents/vera.agent.md) · [GitHub-Anleitung](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/create-custom-agents)

**On GitHub.** If Copilot cloud agent is available to you and this repository, select `AlexanderR1991/Vera` and then **Vera** in the agent picker. The profile gives her tools to read and search. [Agent picker](https://github.com/copilot/agents) · [Agent profile](.github/agents/vera.agent.md)

**In deinem KI-Chat.** Führe im Git-Checkout einen der Befehle aus und kopiere die Ausgabe in eine neue Sitzung. Der Export enthält Veras Profil, Prüfregeln, aktuelle Projektbefunde aus dem Gedächtnis und die angegebenen Zeilen aus demselben Commit. Teile nur Inhalte, die dafür freigegeben sind. [Projektgedächtnis](docs/vera-memory.v1.json)

**In your own AI chat.** Run one of these commands from a Git checkout and paste the output into a fresh session. It includes Vera’s profile, inquiry rules, recent project memory and the selected lines from the same commit. Share material only when it is approved for sharing. [Project memory](docs/vera-memory.v1.json)

```sh
node scripts/vera-task.mjs de docs/selbstkorrektur.md:24-32
node scripts/vera-task.mjs en docs/selbstkorrektur.md:61-65
```

**Gegenprobe.** Frag, welche Zeile ihre Antwort stützt und was Vera zusätzlich prüfen müsste. Wenn du einen Fehler findest, halte Git-Stand, Fundstelle und erwartete Korrektur fest. [Vera-Profil](docs/vera.md) · [Kritik einreichen](https://github.com/AlexanderR1991/Vera/issues/new?template=kritik.yml)

**Try a check.** Ask which line supports her answer and what else Vera would need to verify. If you find an error, record the Git revision, the exact passage and the expected correction. [Vera profile](docs/vera.md#english) · [Submit a critique](https://github.com/AlexanderR1991/Vera/issues/new?template=kritik.yml)

### Veras Optimierungsschwarm · Vera’s improvement swarm

**WIRKLICH · META-01.** Drei getrennte Sitzungen prüfen wahlweise das Selbstmodell (`entity`) oder das Entscheidungsmodell (`insight`). Die Rollen prüfen Verständlichkeit und Einspruch, mathematische Annahmen und technische Fehler. Jede Rolle liefert ihre Fundstelle, den stärksten Einwand und eine Gegenprobe. Der Bericht hält abweichende Befunde und fehlgeschlagene Rollen einzeln fest. Führe eine vorgeschlagene Gegenprobe aus, bevor du eine Änderung übernimmst.

**WIRKLICH · META-01.** Three separate sessions examine the self-model (`entity`) or decision model (`insight`). Each role reports its source, strongest objection and a check that could change its finding. The report preserves dissent and failed roles. Run a proposed check before adopting a change.

```sh
node scripts/vera-swarm.mjs de entity
node scripts/vera-swarm.mjs en insight qwen2.5:7b
```

Der erste Befehl gibt die drei Arbeitsaufträge mit Quellen aus einem Git-Commit aus. Setze im zweiten Befehl den Namen deines bereits installierten lokalen Modells ein. Er startet drei Anfragen an Ollama auf `127.0.0.1:11434` (Port über `VERA_OLLAMA_PORT` wählbar). Die Sitzungen verwenden dasselbe Modell ohne gegenseitigen Zugriff auf ihre Antworten. Die JSON-Ausgabe ist ein Prüfentwurf für Menschen. Eine fehlende oder ungültige Antwort führt zu Exitcode 1, vorhandene Ergebnisse bleiben im Bericht.

The first command exports three briefs with excerpts from one Git commit. Substitute the name of an installed local model in the second command. It sends three requests to Ollama at `127.0.0.1:11434` (override the port with `VERA_OLLAMA_PORT`). The sessions share a model and receive no other role’s output. The JSON report contains drafts for human review. Missing or invalid replies set exit code 1 and preserve the other results. [Ollama chat API](https://docs.ollama.com/api/chat)

### Erkenntnis ausprobieren · Try the insight model

Vera wählt in einem fiktiven Veröffentlichungsfall den nächsten Test. Die Website zeigt, was ein Ja oder Nein an ihrer Einschätzung ändert. Im Terminal lässt sich dieselbe Entscheidung nachvollziehen. [Modell und Annahmen](docs/vera.md#erkenntnis-ausprobieren) · [Model and assumptions](docs/vera.md#try-the-insight-model)

Vera chooses the next test in a fictional release scenario. The website shows what a yes or no changes. The same model runs in a Git checkout.

```sh
node scripts/vera-erkenntnis.mjs
node scripts/vera-erkenntnis.mjs publication=no
```

**Ein Bild in die Werkstatt bringen · Bring an image to the workshop.** Der lokale Bildeingang macht aus sichtbaren Details, Deutung und Gegenprobe einen prüfbaren Entwurf für WIRKLICH. The local image intake turns visible details, an interpretation and a challenge into a draft for WIRKLICH. [Anleitung (DE)](docs/bildeingang.md) · [Guide (EN)](docs/bildeingang.md#english)

**Veras Selbstmodell · Vera’s self-model.** Ein lokaler Prüfer trennt Build, Deployment und öffentlich ausgelieferte Revision. A local checker distinguishes build, deployment and the publicly served revision. [Beispiel und Modell](docs/vera-selbstmodell.md) · [Example and model](docs/vera-selbstmodell.md#english)

## Lokal entwickeln · Local development

Node.js 22.12+ und Python 3.12 wie in CI. Nach der Installation startet `npm run dev` die lokale Vorschau. Der Produktionsbuild prüft die Inhalte und die erzeugten Seiten.

```sh
npm ci
npm run build
python -m unittest discover -s tests -p 'test_*.py'
npm run dev
```

Eigene Texte und Übersetzungen stehen unter CC BY-SA 4.0, eigener Code unter MIT. Hinweise zu fremden Werken und zum Signet stehen in den Lizenzdetails. [Licensing](LICENSING.md) · [Credits](AUTHORS.md)

[^ursprung]: Die Projektidee entstand aus der Arbeit an *Die Richtung*. The German text edition is available here with its original credits. [Offene Textfassung 2.0](docs/archiv/die-richtung-2.0-lesefassung.txt) · [Rechte und Ausnahmen](LICENSING.md#die-richtung--open-book-text-edition)

WIRKLICH / REALLY? war der ursprüngliche Projektname. Die [Versionsgeschichte](docs/versionsgeschichte.md) dokumentiert den Übergang zu Vera.

## KI-Schwärme und Fragenatlas · AI swarms and question atlas

**KI darf prüfen, aber nicht die Diskussion durch Masse ersetzen.** Automatische Forschungsentwürfe bleiben getrennt von GitHub Discussions, Issues und redaktionellen Entscheidungen. Der [kleine Fragenatlas](docs/fragenatlas.md) versieht redaktionelle Beispiel-Fragen mit stabilen IDs und begründeten Beziehungen zu den Aussagen. Ein lokales Triage-Werkzeug schlägt nur mögliche Dopplungen und Wortähnlichkeiten vor – ohne automatische Veröffentlichung oder Zusammenführung. Begründeter Minderheiteneinwand und ursprüngliche Frageformulierung bleiben erhalten.

**AI may investigate, not dominate public conversation.** The small [question atlas pilot](docs/fragenatlas.md) links curated example questions to claims and to each other; offline draft triage suggests lexical neighbors only. No automatic posts, merges, consensus changes or AI-authored human identities.
