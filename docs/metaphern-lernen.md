# Wie Vera an einer Metapher lernen kann

[English](en/metaphor-learning.md) · [Sechs Fälle aus dem Leben](metaphern-atlas.md)

Eine Brücke trägt jemanden ans andere Ufer. In einem Streit kann ich dort für einen Augenblick stehen und sehen, warum die andere Person von ihrem Ufer aus etwas anderes sieht. Ob mir das gelungen ist, zeigt sich an einer neuen Frage. Kann ich wiedergeben, wie sie einen Fall beurteilen würde, und kann sie meine Wiedergabe korrigieren? Dazu dürfen wir verschiedener Meinung bleiben.

**Arbeitshypothese.** Ein vertrautes Bild bringt Erwartungen mit. „Brücke“ lenkt die Aufmerksamkeit auf Ufer, Übergang, Zugänglichkeit und Tragfähigkeit. Welche dieser Beziehungen in einer neuen Lage wiederkehrt, entscheidet sich an der Lage. Wiederholt sich ein Muster in mehreren Bereichen, lohnt sich eine gezielte Frage. Geschichten können aber auch voneinander abgeschrieben sein, oder wir haben nur passende Beispiele ausgewählt. Wie oft wir eine Form wiedererkennen, zählt deshalb nicht als Zahl unabhängiger Belege.

## Was Vera mit einem neuen Bild macht

1. Halte den ursprünglichen Satz und seinen Kontext fest. Was macht das Bild für diese Person wahrnehmbar? Bei einer persönlichen Äußerung darf die Person die angebotene Lesart ändern. Bei einem Kunstwerk können mehrere Lesarten nebeneinander bestehen.
2. Benenne die Rollen und ihre Beziehung in gewöhnlichen Worten. Was aus dem Bild lässt sich weglassen? Welche andere Deutung erklärt dieselbe Beobachtung?
3. Wenn daraus eine Sachbehauptung entsteht, notiere die Vorhersage **vor** der Prüfung. Wähle einen neuen Fall und einen möglichst ähnlichen Gegenfall, in dem sich eine entscheidende Beziehung ändert. Halte bei einer Wertfrage fest, wer das Ziel überhaupt gewählt hat.
4. Vergleiche die alte mit der neuen Antwort. Notiere Irrtum, Änderungsgrund, Ergebnis und Grenze. Eine wörtliche Fassung derselben Regel zeigt, welchen Teil der Leistung schon die Regel erklärt. Eine neue Projektfassung folgt dem bestehenden [Korrekturverfahren](selbstkorrektur.md).

## Ein ausführbarer Lernversuch

Zwei Buslinien überqueren dieselbe Brücke. Könnten wir den Fahrplan mit einem zweiten Strich auf der Karte ausfallsicher machen? Im Modell steht jede Zeile für einen benutzbaren Weg. Jede Zeile nennt alle Stellen, auf deren Funktion dieser Weg angewiesen ist. Start und Ziel bleiben verfügbar. Verlangt ist ein Weg im Normalbetrieb und nach jedem einzeln betrachteten Ausfall.

Der [Lernversuch](../src/lib/metapher.mjs) beginnt mit vier möglichen Antworten. Es genügt irgendein Weg. Es genügen zwei Wege. Man braucht zwei Wege ohne gemeinsames ausfallbares Teil. Oder es genügt, dass kein Teil in allen Wegen vorkommt, sofern überhaupt ein Weg existiert. Jede Regel macht vorab festgelegte Vorhersagen. Das Programm verwirft Regeln, die einer angegebenen Beobachtung widersprechen. Bei Uneinigkeit bleibt die gemeinsame Vorhersage offen. Widersprechen die Beobachtungen sämtlichen Regeln, weist Vera den Konflikt aus.

Drei konstruierte Beobachtungen genügen hier, um die vier Regeln zu unterscheiden. Ein einzelnes Kabel kann ausfallen. Zwei Buslinien können dieselbe Brücke verlieren. Beim dritten Beispiel brauchen die drei Wege je zwei der Teile A, B und C. Kein Paar von Wegen ist unabhängig. Trotzdem überlebt jeder Einzelausfall, weil jeweils der dritte Weg offensteht.

**Beweis im Modell.** Kommt ein Teil auf allen Wegen vor, sperrt sein Ausfall alle. Umgekehrt bedeutet das Fehlen eines solchen Teils, dass es für jedes ausfallbare Teil mindestens einen Weg gibt, der es umgeht. Bei mindestens einem Weg ist das genau die gesuchte Eigenschaft. Eine unvollständige Karte oder mehrere gleichzeitig ausgefallene Teile ändern die Fragestellung.

```sh
node scripts/vera-metapher.mjs
node --test tests/metapher.test.mjs
```

Auf sechs weiteren, eigens entworfenen Fällen liefert die anfangs bevorzugte Regel vier richtige Antworten. Auch die einfache Vergleichsregel „mindestens zwei Wege“ trifft vier von sechs. Die verbliebene Regel und die direkt vorgegebene wörtliche Regel liefern je sechs. Vor den Beobachtungen waren sich die Kandidaten bei zwei Fällen einig und ließen vier offen. Danach war jeder der sechs Fälle im Modell eindeutig entscheidbar. Eine getrennte Simulation sperrt jedes Teil einzeln und ermittelt die Vergleichsantworten. Entfernt man die Bildtexte aus den Lernfällen, bleibt das Ergebnis gleich. Die Wegelisten sind im Versuch vorgegeben. Bei freiem Text bleibt zu prüfen, ob Vera die Abhängigkeiten richtig herausliest. Der Versuch zeigt, wie Gegenbeispiele eine Auswahl unter bekannten Regeln korrigieren. Der zusätzliche Nutzen des Bildes beim Entdecken oder Kodieren dieser Beziehung bleibt offen.

Eigene Fälle lassen sich als JSON mit `node scripts/vera-metapher.mjs --input fall.json` auswerten. `null` markiert eine unbekannte Beobachtung. Ein leeres äußeres Array bedeutet, dass kein Weg existiert. Ein leerer innerer Weg kommt ganz ohne ausfallbare Teile aus.

```json
{
  "observations": [{"id":"Bus","routes":[["Brücke","Nord"],["Brücke","Süd"]],"observed":false}],
  "cases": [{"id":"Archiv","routes":[["Papier"],["Festplatte"]]}]
}
```

## Eine Gegenprobe an Vera selbst

Wir sagten folgenden Ausfall voraus. Fehlt die Quelldatei des Erkenntnismodells, fallen zwei Möglichkeiten aus, dieses Modell neu auszuführen oder zu bauen. In einer isolierten Kopie des Stands `e3cd587` liefen das Terminalwerkzeug und der frische Website-Build zunächst erfolgreich. Nach dem vorübergehenden Herausnehmen von `src/lib/erkenntnis.mjs` endeten beide mit Fehlercode 1. Das Terminal meldete den fehlenden Import in `scripts/vera-erkenntnis.mjs`, Astro den fehlenden Import in `src/components/VeraErkenntnis.astro`. Nach Wiederherstellung endeten beide mit Code 0. Diese Beobachtung betrifft einen Neubau. Bereits gebaute Seiten sind ein anderer Fall. [Terminalwerkzeug](../scripts/vera-erkenntnis.mjs) · [Webkomponente](../src/components/VeraErkenntnis.astro)

Zum Nachstellen in einer entbehrlichen Kopie mit installierten Abhängigkeiten einmal `npm run predev` ausführen. Dann jeweils `node scripts/vera-erkenntnis.mjs` und `npx --no-install astro build` vor dem Verschieben der Datei, während ihrer Abwesenheit und nach ihrer Rückkehr ausführen.

## Woran ein größerer Lerngewinn erkennbar wäre

Vor dem nächsten Versuch stellen unabhängige Personen neue Zielaufgaben samt ähnlich klingenden Gegenfällen zusammen. Sie legen Antwortkriterien fest und halten die Aufgaben bis zur Auswertung zurück. Bei gleicher Modellversion, Zeit und gleichem Zugang zu Fakten vergleichen wir Antworten ohne neue Anleitung, mit der wörtlichen Regel und mit Regel plus Metapher. Eine verdeckte Bewertung zählt richtige Übertragungen, falsche Übertragungen und begründetes Offenlassen getrennt. Aufwand und Verbesserungen pro Aufgabe bleiben sichtbar. Liefert die wörtliche Regel dasselbe Ergebnis mit weniger Aufwand, genügt sie für diese Aufgabe. Bei einer persönlichen Deutung ist die Rückmeldung der sprechenden Person der angemessene Prüfstein.

## Was die Forschung dazu beiträgt

- Bei Verhandlungsaufgaben erkannten mehr Teilnehmende das gemeinsame Prinzip, wenn sie zwei Beispiele miteinander verglichen. Der direkte Unterschied bei seiner späteren Anwendung erreichte in dieser Untersuchung die übliche Fünfprozentgrenze knapp nicht. Eine Regel benennen und sie in einer neuen Lage anwenden sind zwei verschiedene Leistungen. [Loewenstein, Thompson & Gentner, 2003](https://doi.org/10.5465/amle.2003.9901663)
- In Experimenten änderte die Darstellung von Kriminalität als Tier oder Virus die bevorzugte politische Maßnahme. Vier Folgeexperimente mit veränderten Kontrollen fanden diesen Effekt nicht. Eine Kontrollfassung in gewöhnlicher Sprache und ein konkurrierendes Bild machen solche Grenzen untersuchbar. [Thibodeau & Boroditsky, 2013](https://doi.org/10.1371/journal.pone.0052961) · [Steen, Reijnierse & Burgers, 2014](https://doi.org/10.1371/journal.pone.0113536)
- In Forenbeiträgen von Menschen mit Krebs konnten sowohl Reise- als auch Kampfbilder Handlungsspielraum oder Ohnmacht ausdrücken. Wer das Bild verwendet und wie, verändert seine Bedeutung. Die Untersuchung analysierte Sprachgebrauch. [Semino et al.](https://doi.org/10.1136/bmjspcare-2014-000785)
