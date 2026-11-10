# Vera · Bildeingang

Mit dem lokalen Bildeingang kann ein Foto, eine Zeichnung oder ein Screenshot eine Frage für **WIRKLICH** liefern. Vera hält sichtbare Einzelheiten, abgeschriebenen Text und sichtbare Zuschreibungen getrennt von ihrer Deutung fest. Aus der Deutung leitet sie eine Frage, einen starken Einwand und eine Gegenprobe ab. Sie ordnet den Entwurf passenden Prüffragen aus dem [philosophischen Motor](../public/ai/philosophy-engine.v0.json) zu.

## Ein Bild einreichen

Führe den Befehl im Git-Checkout mit Node.js 22.12 oder neuer aus. Unterstützt werden PNG, JPEG und WebP bis 8 MiB. Verwende für `MODELLNAME` den Namen eines bereits installierten, bildfähigen Ollama-Modells. Starte deinen Ollama-Server im lokalen Modus mit `OLLAMA_NO_CLOUD=1`. Der Adapter verbindet sich mit `127.0.0.1:11434`. [Ollama-Konfiguration](https://docs.ollama.com/faq#how-do-i-disable-ollama-cloud-features)

```sh
node scripts/vera-bild.mjs bild.png --model MODELLNAME
```

Mit `--reading` kannst du eine vorhandene Lesung einlesen. Dieser Weg braucht nur Node.js und verarbeitet die Dateien lokal. `--prompt` zeigt das Format für eine selbst erstellte Lesung oder eine Lesung aus einem bildfähigen KI-Chat. Speichere in letzterem Fall das zurückgegebene JSON in `lesung.json`. Wenn du dafür einen externen Chat verwendest, gelten dort dessen Bedingungen für das Bild.

```sh
node scripts/vera-bild.mjs --prompt
node scripts/vera-bild.mjs bild.png --reading lesung.json
```

Die Schnittstelle gibt den JSON-Entwurf im Terminal aus. Er nennt den Ursprung der Lesung und enthält das Dateiformat und den SHA-256-Fingerabdruck. Damit kannst du später abgleichen, ob du genau dieselbe Datei prüfst. Die Bilddatei bleibt an ihrem ursprünglichen Ort. Die Lesung kann sensible Bildinhalte enthalten. Prüfe sie vor einer Weitergabe. Über eine Aufnahme ins öffentliche Register entscheidet die Redaktion nach Prüfung.

## Erste Gegenprobe

Eine Zitatgrafik zeigt den Namen „Mark Twain“ neben einem Satz über Wahrheit und Erinnerung. Die sichtbare Zuschreibung lässt sich am Bild prüfen. Ihre Richtigkeit braucht eine unabhängige Quelle. Auch die Deutung lässt sich angreifen. Eine aufrichtige Aussage kann falsch sein und eine wahre Aussage kann von Datum und Kontext abhängen.

Tausche gedanklich das Porträt und den Namen aus. Die Zuschreibung ändert sich, während die Frage nach Wahrheit und Erinnerung bestehen bleibt. Für den Motor ergibt sich daraus eine konkrete Frage. **Kann Vera dieselbe Aussage später aus den damaligen Gründen rekonstruieren und benennen, welche neue Beobachtung eine Korrektur auslösen würde?** Das lässt sich an [AI-P01 und AI-P05](../public/ai/philosophy-engine.v0.json) prüfen.

## English

Vera's local image intake turns a photograph, drawing or screenshot into a draft for **WIRKLICH**. It separates visible details, transcribed text and apparent attributions from an interpretation. It also records a question, a strong objection, a check that could overturn the interpretation and related questions from the [philosophical engine](../public/ai/philosophy-engine.v0.json).

From a Git checkout with Node.js 22.12 or newer, pass a PNG, JPEG or WebP file up to 8 MiB. Set `MODEL_NAME` to an installed vision-capable Ollama model. Run the Ollama server in local-only mode with `OLLAMA_NO_CLOUD=1`. The adapter connects to `127.0.0.1:11434`. [Ollama configuration](https://docs.ollama.com/faq#how-do-i-disable-ollama-cloud-features)

```sh
node scripts/vera-bild.mjs image.png --model MODEL_NAME
```

Use `--reading` to supply an existing reading. This path uses Node.js and processes the files locally. `--prompt` prints the requested format for writing a reading yourself or using an image-capable chat. Save the returned JSON as `reading.json`. If you send the image to an external chat, that service handles it under its own terms.

```sh
node scripts/vera-bild.mjs --prompt
node scripts/vera-bild.mjs image.png --reading reading.json
```

The command prints a JSON draft with the reading's origin, image format and SHA-256 fingerprint. The script leaves the original image in place and omits its bytes from the draft. Review the draft for sensitive details before sharing it. Editorial review is required to integrate a proposal into the engine.

**Try a check.** If a quote graphic names Mark Twain, the graphic shows that attribution. Authorship needs an independent source. Change the portrait and name while keeping the quote. The attribution changes and the question about truth and memory remains. For Vera, the test is whether she can reconstruct an answer from its original reasons and identify what would make her revise it.
