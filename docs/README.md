# Wegweiser durch Veras Werkstatt

[Veras Vorstellung](../README.md) · [Start here in English](en/README.md)

## Eine Frage verfolgen

| Was möchtest du tun? | Wo kannst du anfangen? |
| --- | --- |
| Vera zum ersten Mal ausprobieren | Die [Pinnwand](https://alexanderr1991.github.io/Vera/de/#leben) führt zu Fragen aus dem Alltag. [Frag mich etwas](https://alexanderr1991.github.io/Vera/de/#frag-mich) sucht in vorbereiteten Antworten und zeigt, wenn keine passt. |
| Einen guten Einwand lesen | [Die Revision zur dauerhaften Hilfe](https://alexanderr1991.github.io/Vera/de/methode/#g-005) zeigt die frühere Aussage, den Einwand und die überarbeitete Fassung. |
| Eine eigene Frage durchdenken | Im [Prüfblatt](https://alexanderr1991.github.io/Vera/de/werkstatt/) bleibt dein Entwurf auf deinem Gerät. Das [Forum](https://alexanderr1991.github.io/Vera/de/forum/) enthält öffentliche Fragen und erste Antworten. |
| Einen Streit zu zweit durchgehen | Die [Vermittlung](https://alexanderr1991.github.io/Vera/de/schnittmengen/#vermittlung) begleitet einen freiwilligen Versuch am selben Gerät. Das [Modell und der Entwicklungsplan](vermittlung.md) beschreiben die Grenzen und nächste Schritte. |
| In eigenen Notizen weiterdenken | Der [Obsidian-Einstieg](https://alexanderr1991.github.io/Vera/de/obsidian/) bietet Markdown-Vorlagen für eine Denknotiz. Deine Notizen werden nicht automatisch mit Vera synchronisiert. |
| Den philosophischen Motor verstehen | Der [Grundtext](grundtext.md) enthält die Thesen. Der [Regelkreis](selbstkorrektur.md) erklärt, wie man sie prüft und ändert. Die [offenen Regeln](offenheit.md) erlauben anderen, die Arbeit unabhängig fortzuführen. |
| Vera in ein Computerspiel einbauen | [Vera in Spielwelten](spielwelten.md) skizziert einen ersten Versuch mit einer Figur, einer freien Frage und dem Wissen aus einer Spielszene. |
| Eine Forschungsfrage ausprobieren | [Die Brücke](mathematik-des-dazwischen.md) fragt, wie gut zwei Menschen einander verstehen, wenn sie sich uneinig sind. Der [Metaphernversuch](metaphern-lernen.md) zeigt, wie ein vertrautes Bild eine prüfbare Vorhersage anregen kann. |
| Veras Struktur mathematisch prüfen | Die [mathematische Landkarte](mathematische-struktur.md) verbindet die Bereiche mit ihren Modellen und Gegenproben. Im [Einwandsprotokoll](entitaet.md#einwände-über-fassungen-verfolgen) lässt sich prüfen, wer nach einer Entscheidung noch auf eine Antwort wartet. |
| Verfolgen, was ein Einwand verändert | [Gleiches Gehör und Korrekturwelle](gehoer-und-korrekturwelle.md) zeigt mit einem lokalen Versuch, wie Vera Beiträge einzeln verfolgt und betroffene Schlüsse neu berechnet. |
| Nachsehen, was schon trägt | Das [Projektprofil](vera.md) beschreibt die Rolle, das [Projektgedächtnis](vera-memory.v1.json) einzelne Befunde mit Quellen und Grenzen. Der [Projektstatus](https://alexanderr1991.github.io/Vera/de/projektstatus/) führt den Stand der öffentlichen Prüfungen auf. |
| Eine Datei oder ein Thema wiederfinden | Die [Suche](https://alexanderr1991.github.io/Vera/de/suche/) durchsucht die Website. Der [Repository-Baum](https://alexanderr1991.github.io/Vera/de/repository/) zeigt Ordner und Dateien mit direkten Quelllinks. |

Weitere Einstiege bieten der [Fragenatlas](fragenatlas.md), die [Grundfragen](grundfragen-kreislauf.md), [Kunst und Erkenntnis](kunst-und-erkenntnis.md) sowie die [Forschung zur kollektiven Intelligenz](kollektive-intelligenz.md). Die [Versionsgeschichte](versionsgeschichte.md) erklärt den Übergang von WIRKLICH zu Vera und den Ursprung in [*Die Richtung*](archiv/die-richtung-2.0-lesefassung.txt).

## Mit Vera arbeiten

Für die Terminalbeispiele brauchst du einen Git-Checkout und Node.js ab 22.12. Wechsle zuerst in das Stammverzeichnis des Repositories. Nur für das Gespräch über Ollama brauchst du ein lokal installiertes Sprachmodell.

**Im eigenen KI-Chat.** Der erste Befehl gibt Veras Profil, die Prüfregeln und eine Auswahl aus dem Gedächtnis aus. Der zweite nimmt ausgewählte Zeilen aus demselben Commit dazu. Kopiere die Ausgabe in deinen Chat und frage, welche Stelle die Antwort stützt. Mit `en` erhältst du die englische Fassung. [Projektprofil](vera.md#neue-sitzung-starten) · [Leseprofil für GitHub Copilot](../.github/agents/vera.agent.md)

```sh
node scripts/vera-context.mjs de
node scripts/vera-task.mjs de docs/selbstkorrektur.md:24-32
```

**Mit einem lokalen Sprachmodell.** Starte Ollama, schalte für den Offlinebetrieb seine Cloud-Funktionen aus und lade einmalig ein Modell mit Werkzeugunterstützung, etwa mit `ollama pull qwen3:4b`. Danach kannst du eine Frage stellen oder das Modell eine offene Frage auswählen lassen. Pro Lauf kann es einmal in den Dokumenten des ausgecheckten Commits suchen. Mit `--no-search` beantwortet es eine konkrete Frage nur anhand des übergebenen Kontexts. Der Befehl verweigert dann jeden Werkzeugaufruf. Das Terminal gibt gefundene Textstellen getrennt vom Antwortentwurf aus. [Ollama](https://ollama.com/download) · [Cloud-Funktionen ausschalten](https://docs.ollama.com/faq#how-do-i-disable-ollama-cloud-features)

```sh
node scripts/vera-ask.mjs de qwen3:4b "Woran merke ich, dass ich jemanden verstanden habe?"
node scripts/vera-ask.mjs de qwen3:4b "Woran merke ich, dass ich jemanden verstanden habe?" --no-search
node scripts/vera-ask.mjs de qwen3:4b --explore
```

**Einzelne Modelle prüfen.** Bei `vera-erkenntnis` kannst du mit anderen Eingaben testen, wann sich das Urteil ändert. Die Selbststudie spielt alle vorgesehenen Fälle durch. `vera-swarm` gibt ohne Modellnamen drei Prüfaufträge aus. [Entscheidungsmodell](vera.md#erkenntnis-ausprobieren) · [Selbstmodell](vera-selbstmodell.md) · [Bildeingang](bildeingang.md)

```sh
node scripts/vera-erkenntnis.mjs publication=no
node scripts/probe-vera-selbststudie.mjs
node scripts/vera-swarm.mjs de entity
```

## Am Projekt entwickeln

| Ort | Was liegt dort? |
| --- | --- |
| [src/pages](../src/pages) · [src/components](../src/components) | Routen und Bausteine der Astro-Website. Die deutsche und die englische Startseite verwenden dieselbe [Startseitenkomponente](../src/components/MissionHome.astro). |
| [src/lib](../src/lib) | Prüfprogramme und gemeinsame Seitendaten, darunter die [DE/EN-Startseitentexte](../src/lib/mission-copy.json) und die [wechselnden Begrüßungen](../src/lib/home-greetings.mjs). |
| [public/knowledge](../public/knowledge) · [public/protocol](../public/protocol) | Öffentliche Aussagen, Fragen und Verfahrensregeln als versionierte Daten. |
| [scripts](../scripts) · [tests](../tests) | Terminalwerkzeuge, Build-Prüfungen und ausführbare Gegenproben. |

Die Vorschau lässt sich nach der Installation mit `npm run dev` starten. Vorschau und Produktionsbuild brauchen einen Checkout mit vollständiger Git-Historie, weil die Projektchronik daraus Tagesstände rekonstruiert. Für einen Prüfablauf wie in CI nutze Node.js ab 22.12 und Python 3.12. [Build-Workflow](../.github/workflows/pages.yml)

```sh
npm ci
node scripts/verify-memory.mjs
npm run build
python -m unittest discover -s tests -p 'test_*.py'
python scripts/validate_site.py
python scripts/check_vera_entry.py
```

Projekttexte und Übersetzungen stehen unter CC BY-SA 4.0, eigener Code unter MIT. Einzelheiten zu Bildrechten und Ausnahmen stehen in den Lizenzhinweisen. [Lizenzen](../LICENSING.md) · [Urheberschaft](../AUTHORS.md) · [Beitragsleitfaden](../CONTRIBUTING.md)
