# WIRKLICH / REALLY?

**Die offene Erkenntniswerkstatt · The open inquiry workshop**

**Mit Philosophie die Menschheit zum Konsens führen.** Hier kann jeder eine Frage stellen. Wenn unsere Antworten auseinandergehen, suchen wir nach einem Punkt, den wir aus eigenen Gründen mittragen. Was strittig bleibt, halten wir fest. Unsere philosophische Grundlage ist der [Grundtext des Wirklichen](docs/grundtext.md).[^ursprung]

**To guide humanity toward consensus through philosophy.** Anyone can bring a question. When our answers differ, we look for a point we can each agree on for our own reasons. We record where we still disagree.

| Einstieg | Deutsch | English |
| --- | --- | --- |
| Die Werkstatt kennenlernen · Visit the workshop | [Startseite](https://alexanderr1991.github.io/Wirklich/de/) | [Home](https://alexanderr1991.github.io/Wirklich/en/) |
| Eine echte Korrektur lesen · Follow a real revision | [Wann ist Hilfe gut?](https://alexanderr1991.github.io/Wirklich/de/methode/#g-005) | [What makes help good?](https://alexanderr1991.github.io/Wirklich/en/methode/#g-005) |
| Eine Frage für sich prüfen · Work privately | [Prüfblatt öffnen](https://alexanderr1991.github.io/Wirklich/de/werkstatt/) | [Open a worksheet](https://alexanderr1991.github.io/Wirklich/en/werkstatt/) |
| Eine Frage öffentlich stellen · Ask in public | [GitHub-Frageformular](https://github.com/AlexanderR1991/Wirklich/issues/new?template=frage.yml) | [GitHub question form](https://github.com/AlexanderR1991/Wirklich/issues/new?template=frage.yml) |

## Woran wir arbeiten · What we do

Bei einer Tatsachenfrage suchen wir Belege und Gegenbelege. Bei einer Wertfrage legen wir den Maßstab offen und hören auf die Menschen, die mit den Folgen leben. Aus vorhandenen Erkenntnissen kann eine neue Vermutung entstehen. Wir formulieren, woran sie scheitern könnte. Ein begründeter Dissens kann das Ergebnis sein. [Methode](docs/methode.md) · [Mission](docs/mission.md)

The topic map connects questions across disciplines. Each claim record gives its scope, reasons, strongest objection, review status and revision history. Research feeds collect leads. People decide which revisions enter the public record. [Explore topics](https://alexanderr1991.github.io/Wirklich/en/baum-des-wissens/) · [Inspect the register](https://alexanderr1991.github.io/Wirklich/en/aussagen/)

## Stand und offene Prüfung · Status and open work

Version **1.0.0** stellt das lokale Prüfblatt mit Import und Export bereit. Die öffentlichen Zahlen zum Aussagenbestand und zu dokumentierten Reviews werden aus dem Register berechnet. Ob das Prüfblatt Menschen zu besser begründeten Urteilen verhilft, ist eine offene Forschungsfrage. [Projektstatus](https://alexanderr1991.github.io/Wirklich/de/projektstatus/) · [Vergleichsprotokoll](docs/evaluation-v1.md)

The [status page](https://alexanderr1991.github.io/Wirklich/en/projektstatus/) shows what has been reviewed. The next goals are ten claims examined by qualified human reviewers, a comparison with ordinary source checking and an independent route for appeals. [Roadmap](docs/roadmap.md) · [Governance](docs/community-governance.md) · [Funding](docs/finanzierung.md)

## Mitwirken · Contribute

Eine Frage braucht nur einen verständlichen Satz. Für einen Einwand helfen die genaue Stelle, dein Grund und eine mögliche Korrektur. Redaktionelle Änderungen werden in einem öffentlichen Pull Request begründet und von einem verantwortlichen Menschen freigegeben. [Beitragsleitfaden / Contribution guide](CONTRIBUTING.md) · [Kritik einreichen / Challenge a claim](https://github.com/AlexanderR1991/Wirklich/issues/new?template=angriff.yml) · [Erkenntnisprompt / Inquiry prompt](docs/erkenntnisprompt.md)

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
