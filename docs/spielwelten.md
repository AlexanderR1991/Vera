# Vera in Spielwelten

[English](#english)

**Entwurf für Spielestudios.** Wer ein Computerspiel entwickelt, könnte Vera in einen Dialog, ein Bordterminal oder ein Archiv einbauen. Menschen stellen mitten in der Spielwelt eigene philosophische Fragen. Vera antwortet auf Grundlage dessen, was die Figur in dieser Szene wissen darf, macht unterschiedliche Gründe sichtbar und lässt Raum für Widerspruch. Das ist ein Vorschlag für eine künftige Anbindung.

## Eine Frage an die Archivarin

Eine belagerte Stadt hat nur noch Energie für ihr Schutzschild oder für die Signalfeuer, die einen Flüchtlingskonvoi zur Stadt führen. Du fragst die Archivarin: **„Wem schulden wir zuerst Schutz?“**

> Wenn wir das Schild halten, schützen wir die Menschen, die schon in der Stadt sind. Wenn wir die Feuer entzünden, geben wir den Menschen draußen eine Chance, uns zu finden. Ich weiß nicht, ob der Konvoi einen anderen Weg kennt. Können wir das herausfinden, bevor wir entscheiden?

Das Spiel zeigt die Folgen der gewählten Handlung. Vera hilft, den Konflikt zu verstehen. Die Archivarin kann irren, und du kannst ihr widersprechen oder weitergehen.

## Wie ein Spiel Vera einbinden könnte

| Das Spiel gibt an Vera | Vera gibt an das Spiel zurück |
| --- | --- |
| Eine Frage und die Antwortsprache | Eine kurze Antwort mit begründeten Perspektiven in der Sprache des Dialogs |
| Die freigegebenen Fakten der Szene und das Wissen der Figur | Verweise auf diese Fakten für die Prüfung durch das Studio sowie eine offene Annahme oder Rückfrage, wenn sie die Abwägung verändert |

Eine offene, versionierte Schnittstelle soll von Spiel-Engine und Sprachmodell unabhängig bleiben. Das Spiel wählt den erlaubten Szenenausschnitt aus, bevor das Modell die Anfrage erhält. Spielstände, Spielerprofile und Chatverläufe sind dafür entbehrlich. Generierte Dialoge sind als solche erkennbar. Bei einem externen Dienst sehen Spielende vor der freiwilligen Nutzung, wohin ihre Frage geht.

Die Anbindung liefert ausschließlich Dialogtext und Prüfinformationen. Das Spiel behandelt die Ausgabe als Daten und gibt ihr keine Befehlsrechte für Quests, Figuren oder Spielstände. Das Studio kann die Funktion abschalten. Wer sie überspringt oder bei einem Fehler weitergehen möchte, erhält den vom Studio geschriebenen Dialog.

## Eine Szene zum Ausprobieren

Ein erster Versuch umfasst eine Szene, eine Figur und ein freies Fragefeld. Für einen lokalen Versuch lässt sich an Veras [Terminalexperiment mit einem lokalen Sprachmodell](README.md#mit-vera-arbeiten) anknüpfen. Für den Vergleich eignen sich auch Veras [vorbereitete Spielkarten](emporirren.md) als Beispiel dafür, wie eine Gegenperspektive ohne generierten Dialog aussehen kann.

Vergleiche in derselben Szene den Studio-Dialog mit der Vera-Variante. Können Spielende danach die Gründe beider Seiten in eigenen Worten wiedergeben und benennen, was offen ist? Probiere auch eine Frage aus, mit der jemand geheimes Figurenwissen entlocken will, und unterbrich den Dienst mitten im Dialog. Enthüllt Vera dadurch versteckte Handlung oder stockt das Weiterspielen, muss das Studio den betroffenen Ablauf vor einer Ausweitung korrigieren.

## English

**Proposal for game studios.** A game in development could bring Vera into a character dialogue, a ship terminal or an archive. Players could ask their own philosophical questions from inside the game world. Vera would use what the character is allowed to know in that scene, explain different reasons and leave room for disagreement. This is a proposal for a future integration.

### A question for the archivist

A besieged city has enough power for its shield or for the signal beacons guiding a refugee convoy to the city. You ask the archivist, **“Whom do we owe protection first?”**

> Keeping the shield up protects the people already inside. Lighting the beacons gives the people outside a chance to find us. I don’t know whether the convoy knows another way. Can we find out before deciding?

The game shows the consequences of the player’s action. Vera helps the player understand the conflict. The archivist can be wrong, and the player can challenge her or move on.

### How a game could connect to Vera

| The game sends Vera | Vera returns to the game |
| --- | --- |
| A question and the response language | A short answer with reasons for different perspectives in the dialogue language |
| Approved scene facts and what the character knows | References to those facts for studio review, plus an open assumption or follow-up question when it affects the trade-off |

An open, versioned interface would let studios choose their game engine and language model independently. The game selects the permitted scene context before the model sees the request. The request can work without saves, player profiles or chat history. Players can identify generated dialogue and see where their question goes before choosing to use an external service.

The integration returns dialogue and review information only. The game treats model output as data and gives it no authority over quests, characters or saves. The studio can turn the feature off. A studio-written dialogue is available to anyone who skips it or needs to continue after a failure.

### A one-scene trial

Start with one scene, one character and one open question field. Vera’s [local language-model experiment](README.md#mit-vera-arbeiten) is a possible starting point. The [scripted game cards](emporirren.md#english-summary) also show how a counterperspective can work without generated dialogue.

Compare the studio-written dialogue with the Vera version in the same scene. Can players restate the reasons on both sides and identify what is still unknown? Try to get the character to disclose hidden story information, and interrupt the service mid-dialogue. A spoiler or an interrupted playthrough blocks expansion until the studio fixes the affected flow.
