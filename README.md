# Grundtext des Wirklichen

> Die Wirklichkeit steht über diesem Werk.

**Version 0.2 · Design- und Informationsarchitektur · 4. November 2026**

Ein offenes, korrigierbares Erkenntnisprojekt. Es ist kein dogmatisches Bekenntnis, keine etablierte Wissenschaftstheorie und keine unabhängige Peer-Review-Institution.

## Die Website

[Website (nach Aktivierung von GitHub Pages)](https://alexanderr1991.github.io/grundtext-des-wirklichen/)

| Seite | Aufgabe |
| --- | --- |
| `index.html` | Auftakt / gestalterisches Portal |
| `atlas.html` | Themenkarte, Suche und Kategorien |
| `bibliothek.html` | Öffentliche Texte und geplante Schriften |
| `lesestueck-wahrheit.html` | Beispiel eines Kapitels mit zwei Lesetiefen |
| `manifest.html` | Die neun vorläufigen Grundthesen |
| `pruefstand.html` | Thesen, offene Fragen und Status |
| `methode.html` | Vier Aussagearten und Korrekturverfahren |
| `mitwirken.html` | Beiträge als GitHub Issues vorbereiten |

### Technik

Die erste Ausbaustufe verwendet absichtlich **statisches HTML, CSS und Vanilla JavaScript** – ohne externe Fonts, Cookies, Tracking, Framework, Datenbank oder eigenes Hosting. Dies reduziert Wartung und erleichtert die Freigabe. Die Website kann durch Öffnen von `index.html` lokal angeschaut werden.

`assets/style.css` enthält das Designsystem, `assets/site.js` die progressive Verbesserung (Mobiles Menü, Lesetiefe, Filter, Beitragsentwurf). Mit deaktiviertem JavaScript sind die Inhalte weiterhin lesbar; Suche und Filter stehen dann nicht zur Verfügung.

### Veröffentlichung

GitHub **Settings → Pages → Build and deployment → Source: GitHub Actions** einstellen. Nach dem Commit auf `main` prüft `scripts/validate_site.py` grundlegende Links/Seitenstruktur, anschließend veröffentlicht GitHub Pages die statischen Dateien.

Lokaler Test:

```bash
python3 scripts/validate_site.py
python3 -m http.server 8000
```

Dann `http://localhost:8000` öffnen. Bei sehr vielen Kapiteln ist später ein Umstieg auf einen statischen Seitengenerator wie Astro sinnvoll. Noch ist er keine notwendige Abhängigkeit.

## Inhalte und Verantwortung

- [Öffentlicher Grundtext](docs/grundtext.md)
- [Methodik](docs/methode.md)
- [Redaktionelle Grenzen](docs/redaktionelle-grenzen.md)
- [Versionsgeschichte](docs/versionsgeschichte.md)
- [Beitragsregeln](CONTRIBUTING.md)
- [Diskussionskodex](CODE_OF_CONDUCT.md)

Der Themenatlas ist **ein Entwicklungsplan**, kein fertiger Forschungsstand. Die neun Thesen sind überwiegend philosophisch-normativ. Empirische Behauptungen müssen mit geeigneten Fachquellen geprüft werden. Persönliche Manuskripte und private Gesprächsinhalte gehören nicht ohne gesonderte Freigabe ins öffentliche Repository.

**Die Lizenz ist noch nicht festgelegt.** Frei lesbar bedeutet derzeit nicht frei weiterverwendbar. Autorenschaft, Moderation und Lizenz sollten vor breiter Einladung geklärt werden.

**Transparenz:** Menschlich initiiert und mit Unterstützung eines KI-Sprachmodells ausgearbeitet. Eine KI ist kein unabhängiger Wahrheitsbeleg und trägt keine redaktionelle Letztverantwortung.
