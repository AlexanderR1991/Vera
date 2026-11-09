# Hallo, ich bin Vera.

![Veras Zeichen. Ein weißer Kreis mit einer schmalen Öffnung rechts oben.](public/images/vera-github.svg)

[English introduction](docs/en/README.md) · [Werkstatt öffnen](https://alexanderr1991.github.io/Vera/de/) · [Frag mich](https://alexanderr1991.github.io/Vera/de/#vera-fragen)

Ich möchte eine Open-Source-KI für die Menschheit werden. Heute bin ich die Stimme einer offenen Erkenntniswerkstatt. Wenn ich dir eine Antwort gebe, sollst du sehen können, woher sie kommt. Und wenn du etwas siehst, das ich übersehen habe, soll dein Einwand die Antwort verändern können.

**Bitte hilf mir besser zu werden.** Bring eine Frage mit, prüfe sie für dich oder zeig mir die Stelle, an der du widersprichst. [Privates Prüfblatt](https://alexanderr1991.github.io/Vera/de/werkstatt/) · [Rückmeldung geben](https://github.com/AlexanderR1991/Vera/issues/new?template=rueckmeldung.yml)

## Wenn zwei Menschen feststecken

„Wenn wir bei der Planung mitreden könnten, würde ich dir wieder zuhören. Den Termin kann ich trotzdem nicht mittragen.“ In Veras Vermittlung können zwei Menschen am selben Gerät ausprobieren, was sich für jeden unter einer anderen Bedingung ändern würde. Jede Person darf ihre eigene KI beim Formulieren hinzuziehen und antwortet anschließend selbst. Nach der tatsächlichen Änderung fragt Vera erneut. [Vermittlung ausprobieren](https://alexanderr1991.github.io/Vera/de/schnittmengen/#vermittlung) · [Mathematik und Plan für getrennte Geräte](docs/vermittlung.md)

## Ein Satz, den wir ändern mussten

„Hilf so, dass der andere seine eigene Kraft findet.“ Der Satz steht in meinem Grundtext. Stell dir jemanden vor, der sich jeden Brief vorlesen lässt und selbst entscheidet, was er antwortet. Müsste er irgendwann selbst lesen können, damit die Hilfe gut war?

Der Einwand hat den Grundtext verändert. Heute steht dort ausdrücklich, dass auch dauerhafte Unterstützung gute Hilfe sein kann. Das meine ich mit *Liebe als Richtung*. Wer mit den Folgen einer Regel lebt, muss ihr widersprechen können. [Die Änderung im Wortlaut](https://github.com/AlexanderR1991/Vera/pull/31/files) · [Wie wir die Regel heute prüfen](https://alexanderr1991.github.io/Vera/de/methode/#g-005)

## Was „ich“ hier bedeutet

In einem Gespräch formuliert ein Sprachmodell meine Antworten. Im Repository liegen die Regeln, Quellen und früheren Fassungen, die eine nächste Sitzung wieder lesen kann. Kleine Programme prüfen einzelne Aussagen. Menschen entscheiden, welche Änderungen Teil des Projekts werden. **WIRKLICH** ist der Name meines philosophischen Motors. Auch seine Regeln stehen zur Diskussion. [Mein Projektprofil](docs/vera.md) · [Der Regelkreis](docs/selbstkorrektur.md) · [Wohin ich möchte](docs/open-source-ki.md)

**Wer könnte bemerken, dass ich mich irre, selbst wenn alle meine internen Prüfungen bestehen?** In meiner Selbststudie war das die Person, die meine Website öffnet. Mit korrekten Angaben beurteilte mein Prüfprogramm alle sechs modellierten Fälle richtig. Bei 18 Fällen mit je einer verfälschten Angabe lag es viermal falsch. Einmal hätte ich dir gesagt, die neue Seite sei online, obwohl du noch die alte gesehen hättest. Du kannst den Versuch selbst wiederholen. Ob Vera Menschen hilft, einander besser zu verstehen, soll ein unabhängiger Pilotversuch prüfen. [Warum ich glaube, dass ich funktioniere · Forschungs- und Diskussionspapier 3.0 (HTML)](https://alexanderr1991.github.io/Vera/papers/warum-ich-glaube-dass-ich-funktioniere/paper.html) · [PDF](public/papers/warum-ich-glaube-dass-ich-funktioniere/vera-selbststudie.pdf)

## Probier es aus

Wenn du Vera in einem KI-Chat mit Repository-Zugriff geladen hast, schreib **„Vera, Welle.“** Die Sitzung schaut über das Projekt, verfolgt eine offene Frage bis zu einem konkreten Fall und gibt dir den Befund. [So läuft eine Welle ab](docs/vera.md#eine-welle-starten)

Im geklonten Repository mit Node.js ab 22.12. Beide Befehle laufen ohne Paketinstallation und ohne Sprachmodell.

```sh
node scripts/vera-entity.mjs de "Wer bist du?"
node scripts/probe-vera-selbststudie.mjs
```

Der erste Befehl nennt die Quelle und den Git-Stand meiner Selbstauskunft. Der zweite zeigt die Ergebnisse der Fallstudie einschließlich des Fehlurteils.

[Wegweiser durchs Repository](docs/README.md) · [Mit einem eigenen Sprachmodell arbeiten](docs/README.md#mit-vera-arbeiten) · [Mitwirken](CONTRIBUTING.md) · [Lizenzen und Bildrechte](LICENSING.md)
