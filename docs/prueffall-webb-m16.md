# VM-004 · Zwei Bilder, wie viele Beobachtungen?

**Quellenprüfung vom 8. November 2026.** Geprüft wurde die Aussage „Für das veröffentlichte NIRCam-Bild der Säulen der Schöpfung in M16 wurden Daten des Filters F470N verwendet.“ So lässt sich die Herkunft auf eine konkrete Aussage beziehen.

| Fundstelle | Was lässt sich nachsehen? | Beitrag zur Aussage |
| --- | --- | --- |
| [NASA · NIRCam-Bild][nircam] | Unter *About the Data* stehen Programm 2739, NIRCam, 14. August 2022 und F470N. Unter *Color Info* ist F470N der Farbe Rot zugeordnet. | Die Produktbeschreibung stützt die Verwendung von F470N. |
| [NASA · NIRCam mit Maßstab][compass] | Die Seite verlinkt auf die Bildbeschreibung oben und ergänzt Orientierung, Maßstab und Farbschlüssel. Instrument, Datum und Filter stimmen überein. | Zweite Fundstelle mit derselben Bildgrundlage. Die Beschriftung fügt keine Messung hinzu. |
| [NASA · MIRI-Bild][miri] | Dasselbe Ziel, Programm und Datum. Hier nennt NASA MIRI und die Filter F770W, F1130W und F1500W. | Diese separate Beobachtung lässt die Aussage zum NIRCam-Filter offen. |

**Gegenprobe.** Ändere die Frage zu „Hat MIRI die Säulen ebenfalls aufgenommen?“ Jetzt stützt die dritte Seite die Aussage. Im Beobachtungsplan gehört NIRCam zu Beobachtung 1 und MIRI zu Beobachtung 2. Die Programmnummer allein würde beide zusammenwerfen. [STScI · Programm 2739, PDF-Seiten 1, 7 und 9][plan]

**Grenze.** Die Zuordnung beruht auf den Angaben zu den veröffentlichten Bildern und dem Beobachtungsplan. Welche einzelnen Belichtungen ins endgültige Mosaik eingingen, wäre anhand der Produktzuordnungen und FITS-Dateien im Archiv zu prüfen. Die statistische Unabhängigkeit der Messfehler bleibt offen. [MAST · JWST-Datenprodukte][mast]

## English · Two images, how many observations?

**Source check, 8 November 2026.** The claim under review is “The published NIRCam image of the Pillars of Creation in M16 used data from filter F470N.”

| Source | What to check | Bearing on the claim |
| --- | --- | --- |
| [NASA · NIRCam image][nircam] | *About the Data* gives program 2739, NIRCam, 14 August 2022 and F470N. *Color Info* assigns that filter to red. | The product description supports the use of F470N. |
| [NASA · NIRCam compass image][compass] | The page links back to the image caption and adds orientation, scale and a color key. Instrument, date and filters match. | A second publication uses the same underlying image. Its annotation adds no measurement. |
| [NASA · MIRI image][miri] | Same target, program and date. NASA lists MIRI and filters F770W, F1130W and F1500W. | This separate observation leaves the claim about the NIRCam filter open. |

**Countercheck.** Change the question to “Did MIRI also image the Pillars?” The third page now supports the claim. In the observing plan, NIRCam is observation 1 and MIRI is observation 2. Grouping by program number alone would collapse these observations. [STScI · program 2739, PDF pages 1, 7 and 9][plan]

**Limit.** The trace uses the published image metadata and observing plan. Identifying all individual exposures used in the final mosaic would require inspecting the archive associations and FITS products. Statistical independence of measurement errors remains untested. [MAST · JWST data products][mast]

[nircam]: https://science.nasa.gov/asset/webb/pillars-of-creation-nircam-image/
[compass]: https://science.nasa.gov/asset/webb/pillars-of-creation-nircam-compass-image/
[miri]: https://science.nasa.gov/asset/webb/pillars-of-creation-miri-image/
[plan]: https://www.stsci.edu/jwst/phase2-public/2739.pdf
[mast]: https://archive.stsci.edu/missions-and-data/jwst
