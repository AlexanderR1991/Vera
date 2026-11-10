# Vera Gesprächsspiegel

**Entwurf 0.1 · Fiktive Website-Demo · Forumseinbindung als Konzept**

Ein aufklappbares Feld über einem Forenthread zeigt, wie sich das Gespräch entwickelt. Wer dazustößt, sieht die Ausgangsfrage, die wichtigsten Abzweigungen, belegte Annäherungen und offene Einwände. Jede Beobachtung führt zur betreffenden Stelle im Thread. Wer sich falsch wiedergegeben sieht, kann genau diese Stelle zur Korrektur markieren. Die Demo zeigt einen vorbereiteten Fall. Eine Einbindung bei Reddit oder anderen Foren setzt eine spätere Zusammenarbeit voraus.

## Beispiel · Soll die Innenstadt autofrei werden?

| Ast | Was der Spiegel im fiktiven Thread anzeigt |
| --- | --- |
| Lieferzeiten | Zwei Beteiligte haben ausdrücklich demselben Vorschlag zugestimmt. Lieferungen sind in einem sechswöchigen Versuch von 7 bis 10 Uhr vorgesehen. Die Übereinstimmung gilt für diese beiden Beteiligten und diese Fassung. |
| Verkehr in Nebenstraßen | Ob sich Verkehr dorthin verlagert, bleibt offen. Die Behauptung steht im Thread, eine Messung liegt im betrachteten Ausschnitt noch aus. |
| Stufenloser Zugang | Wie stufenloser Zugang erhalten bleibt und zugleich der Autoverkehr begrenzt wird, ist als Zielkonflikt sichtbar. Eine betroffene Perspektive oder ein konkreter Zugangsvorschlag könnte den Ast weiterbringen. |
| Frust | Ein Beitrag schildert Frust. Eine Antwort greift die konkrete Erfahrung mit einer früheren Anhörung auf. Für das Ziel „Gehör finden“ ist das ein sichtbarer Schritt. |

Wer die Verkehrsfrage klären möchte, bekommt einen möglichen nächsten Schritt angeboten: „Welche Messung vor und während einer möglichen Probesperrung könnte zeigen, ob der Verkehr in Nebenstraßen zunimmt?“ Wer gerade Gehör sucht, darf es bei der Schilderung belassen. Die Anzeige beschreibt Beiträge und Antworten. Das Gesprächsziel können Beteiligte selbst nennen. Sonst bleibt es offen.

## Wie der Motor den Verlauf abbildet

Ein Thread ist ein versionierter Antwortbaum. Typisierte Querverbindungen halten fest, welcher Beitrag eine Frage beantwortet, einen Beleg vorlegt, eine Aussage präzisiert oder ihr widerspricht. Jede Zuordnung ist ein überprüfbarer Vorschlag mit Herkunft. So kann eine Antwort in einem anderen Ast einen Einwand aufgreifen, ohne dass Vera die beiden Äste zusammenlegt. Empirische Behauptungen, Erfahrungen, Wertkonflikte und ausdrückliche Zustimmungen brauchen unterschiedliche Prüfungen. [M-03](philosophischer-motor-mathematik.md) · [Methode](methode.md) · [Forumarchitektur](forum-architektur.md)

Für jeden Ast $b$ und ein ausgewiesenes Zeitfenster $W$ zählt $x_b(W)$ getrennt die eindeutig zugeordneten Ereignisse je Kategorie. Dazu gehören erstmals beantwortete Einwände, neue prüfbare Behauptungen oder Quellen, präzisierter Dissens, ausdrückliche Zustimmungen, Wiederholungen und aufgegriffene Erfahrungen. Bei gleich langen Fenstern mit vergleichbarer Abdeckung beschreibt $\Delta_b=x_b(W_2)-x_b(W_1)$ die Veränderung der jeweiligen Anzahlen. Die Liste der Ereignisse mit ihren Fundstellen trägt den angezeigten Befund. Äste und Kategorien bleiben getrennt. Sinngleiche Wiederholungen können zur Orientierung gebündelt werden. Neue Gründe, Gegenbelege und abweichende Erfahrungen behalten ihren Platz. Mehrfachzitate derselben Quelle teilen eine Herkunft. Bei unbekannter oder wechselnder Abdeckung bleibt der Vergleich offen. Treffen in einem vollständig erfassten ersten Fenster null Zusagen zum Lieferfenster ein und im zweiten zwei zur selben Fassung, wächst die Komponente für diese Zusagen um zwei. Der Befund gilt für diesen Ast und diese Fassung.

Ob eine Änderung hilft, hängt vom benannten Ziel ab. Eine erstmals aufgegriffene Erfahrung kann beim Zuhören zählen, eine nachvollziehbare Messung beim Klären einer Tatsachenfrage und ein präziser, widerrufbarer Vorschlag beim Entscheiden. In einem Ast können mehrere Ziele nebeneinander stehen. Der Spiegel zeigt dafür jeweils die relevante Entwicklung. Der Entwurf sieht getrennte Angaben zu Quellen, Unsicherheit, Dissens und Zustimmung vor. Erkenntnisreife und Prüfung bleiben im bestehenden Verfahren. [Erkenntnisreife](erkenntnisreife.md) · [Schnittmengen](schnittmengen.md)

## Daten und Korrektur

| Objekt | Vorgesehene Felder und Verhalten |
| --- | --- |
| Threadstand | Vertragsschema, Regel- oder Modellfassung, Thread-ID, Stand und Zeitpunkt, erlaubter Ausschnitt sowie Abdeckung. Bei bekannter Gesamtzahl sind erfasste und bekannte Gesamtzahl sichtbar. Sonst steht dort „Abdeckung unbekannt“. |
| Fundstelle | Beitrag-ID, Fassung, Eltern-ID und Link. Vor der Anzeige wird geprüft, ob die angeführte Fassung im freigegebenen Ausschnitt noch zugänglich ist. |
| Beobachtung | Ast, Typ, kurzer Befund, Fundstellen, Unsicherheit, relevantes Gesprächsziel und gegebenenfalls eine nächste Frage. Jede Beobachtung kann bestätigt, angefochten, korrigiert oder zurückgezogen werden. |
| Teilübereinstimmung | Genau formulierter Vorschlag mit Fassung, ausdrückliche Zustimmungsstellen, beteiligte Personen nur im nötigen Geltungsbereich und offene Einwände. Schweigen, Reaktionen, Wiederholungen und Modellvorschläge bleiben aus der Zustimmungserhebung heraus. Änderungen am Wortlaut erfordern neue Zustimmungen. |

Eine Bearbeitung oder Löschung entzieht abgeleiteten Befunden mit dieser Fundstelle ihre bisherige Grundlage. Die Anzeige zieht diese Befunde zurück, bis ihre Quellen erneut geprüft sind. Gelöschte Inhalte und daraus rekonstruierbare Textteile werden aus Zwischenspeichern und Ausgaben entfernt. Bei einer Lücke steht „Zu wenig Kontext“. Korrekturen nennen die betroffene Beobachtung und den Grund der Änderung, soweit dieser ohne entfernte oder schutzbedürftige Angaben auskommt. Menschen entscheiden über begründete Einwände und öffentliche Korrekturen. [META-01](selbstkorrektur.md) · [REDE-01](redefreiheit-und-schutz.md)

## Vom Beispiel zum freiwilligen Pilot

1. **Fiktiver Fall.** Unabhängige Prüfende vergleichen die Einblendung mit dem vollständigen Beispielthread. Sie prüfen Quellen, falsch zugeschriebene Zustimmung, sichtbaren Dissens, klare Sprache und den Weg zum Widerspruch. Gegenproben tauschen Parteibezeichnungen bei gleichbleibenden Argumenten aus, wiederholen eine Position vielfach und ändern oder entfernen einen belegtragenden Beitrag.
2. **Freigegebener Ausschnitt.** Interessierte vergleichen freiwillig denselben Diskussionsausschnitt mit und ohne Spiegel sowie mit einer einfachen Kurzfassung. Erfasst werden korrekt erkannte offene Fragen, übersehene Einwände, falsche Zuschreibungen, wahrgenommener Druck und Aufwand für Korrekturen. Die Fortsetzung setzt belegbaren Nutzen und einen wirksamen Korrekturweg voraus. Eine fälschlich angezeigte Zustimmung, die Wiederanzeige gelöschter Inhalte oder ein gescheiterter Stopp hält die Ausweitung an. [Evaluationsentwurf](evaluation-v1.md) · [AGI-Horizont](agi-horizont.md)
3. **Partner-Einbindung.** Ein Forum kann das Panel für einzelne Räume nach Prüfung anbieten. Lesende können es ausblenden. Die verantwortliche Community kann es abschalten. Ein Adapter liefert den zweckgebunden freigegebenen Ausschnitt und die Änderungen daran. Der Spiegel bleibt eine Lesehilfe. Schreiben, Abstimmen, Ranglisten und Moderationsentscheidungen liegen bei den Menschen und den bestehenden Werkzeugen des Forums. Für den Pilot werden nur nötige Daten verarbeitet. Private Threads, dauerhafte Rohtextprofile und Verknüpfungen von Personen über Threads hinweg bleiben außerhalb seines Geltungsbereichs. Forumstexte sind Gesprächsdaten und erteilen Vera keine Befugnisse.

Reddit dokumentiert interaktive eigene Beiträge als Einstieg für Devvit-Apps. Ein Panel über bestehenden regulären Threads wäre Gegenstand einer gesonderten Plattformkooperation. [Reddit-Entwicklerdokumentation](https://developers.reddit.com/docs/capabilities/creating_custom_post)
