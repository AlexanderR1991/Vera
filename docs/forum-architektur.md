# Diskussionsplätze

[English](#english)

**Stand 0.1 · Themenplätze und Einstiege auf der Website · Modell für den späteren Betrieb**

Wer auf Vera über eine Frage stolpert, kann am selben Ort ein Gespräch dazu finden. „Mitdiskutieren“ führt zum Platz des Themas. Dort steht eine konkrete Einstiegsfrage und es ist sichtbar, ob man ein Gespräch öffnen oder erst eine Frage einreichen kann. Ein Satz genügt für den Einstieg. Die öffentlichen Plätze sind ohne Anmeldung lesbar. Für öffentliche Beiträge nutzt Vera derzeit GitHub und verlangt dort ein Konto. Das gilt auch dann, wenn der Weg auf Vera nur einen Klick braucht.

## Eine Stadt aus Fragen

| Ort | Wofür er da ist | Beispiel |
| --- | --- | --- |
| Themenplatz | Eine Frage stellen, Erfahrungen teilen, anderen zuhören. | Justiz. Was würde dir helfen, eine Gerichtsentscheidung zu verstehen? |
| Gespräch am Platz | Eine konkrete Frage gemeinsam verfolgen. Ein Gespräch kann von mehreren Plätzen erreichbar sein. | Wie soll eine Schule zwischen einem Kind, seinen Eltern und anderen Kindern vermitteln? |
| Prüftisch | Eine Aussage, ihre Fassung und den konkreten Einwand zusammen ansehen. | Ist diese Behauptung über den Zugang zu einem Verfahren durch einen Gegenfall widerlegt? |
| Werkstatt | Eine Änderung und ihre Gründe öffentlich verfolgen. | Ein überprüfter Einwand führt zu einer engeren Aussage oder zu einem erklärten offenen Stand. |

Die Orte greifen die heutigen Wege [Agora, Stoa und Curia](forum.md) auf. Jeder Platz braucht eine verständliche Frage, einen klaren nächsten Schritt und erkennbare Nachbarn. Eine Frage darf mehrere Themen berühren. Ihr Gespräch behält dabei eine Adresse. Eine mögliche Dopplung wird als Verbindung vorgeschlagen. Andere Formulierungen, Erfahrungen und Gegenbelege bleiben unterscheidbar. Ein eigener Platz ist sinnvoll, wenn eine eigenständige Frage und ein verständlicher Zugang benannt werden können. Ein einzelner begründeter Einwand kann dafür ausreichen. Eine ruhige Ecke darf ruhig bleiben.

## 1 · Der Weg zum richtigen Ort

Sei $A$ die Menge der diskutierbaren Seiten und eindeutig adressierten Abschnitte. Ein Einstieg $a=(s,f)$ besteht aus der Sprachversion übergreifenden Seite $s$ und optional dem stabilen Abschnitt $f$. Sei $P$ die Menge der Themenplätze. Die Zuordnung $\rho\colon A\to P$ weist jedem Einstieg genau einen ersten Platz zu. Ein Abschnitt ohne eigene Zuordnung nutzt die seiner Seite. Deutsch und Englisch teilen die Platz-ID und haben eigene sichtbare Texte und URLs. Ein Gespräch oder Prüffaden hat zusätzlich eine eigene Kennung. Diese kann einen bestimmten Einstieg direkt zu seinem Faden führen.

Der Graph $G=(P\cup T,E)$ verbindet die Plätze $P$ mit Gesprächen $T$ und ihren Nachbarn. Kanten benennen einen Grund wie „Teilfrage“, „auch relevant für“ oder „prüft Aussage X“. Mehrere Kanten dürfen auf dasselbe Gespräch zeigen. Eine solche Verbindung sagt etwas über den Kontext und hat keine Wirkung auf die Wahrheit einer Behauptung. Beim Umbenennen bleiben IDs und bestehende Adressen auflösbar. Verweise auf einen inzwischen geschlossenen Faden zeigen seinen Status und einen Weg für neue Einwände, soweit eine öffentliche Anzeige zulässig ist.

Sei $d_\ell(a,\rho(a))$ die Mindestzahl bewusster Link-Aktivierungen zum Themenplatz in Sprache $\ell$. Eine Route gilt nur als erreichbar, wenn sie öffentlich lesbar ist und zum gewählten Thema führt. Die Abdeckung ist

$$
C_\ell = \frac{|\{a\in A \mid d_\ell(a,\rho(a))\le 1\}|}{|A|}.
$$

Das Ziel ist $C_\ell=1$ je angebotener Sprache. Vom Platz soll höchstens eine weitere Aktivierung zum vorhandenen Gespräch oder zum passend bezeichneten Beitragsweg führen. Eine GitHub-Anmeldung zählt getrennt als Schreibbarriere. Die Weglänge erfasst nur die Navigation. Zur Bedienbarkeit gehören eigene Prüfungen mit Tastatur, ohne JavaScript, bei schmaler Ansicht, vergrößerter Schrift und mit Screenreader. Das mitlaufende Element muss bedienbar bleiben, ohne Inhalt oder Tastaturfokus zu verdecken.

## 2 · Gehör unter Last

Für einen späteren Betrieb schlagen wir einen Eingangsbeleg und nachvollziehbare Erstprüfung pro angenommenem Beitrag vor. Ein Platz speichert die Beiträge in nachvollziehbarer Reihenfolge. Eine begrenzte Zahl von Prüfschlangen kann Beiträge etwa nach Sprachen aufnehmen. Die Zuordnung und ihre Änderungen müssen einsehbar und anfechtbar sein. Bei der Prüfung kommt jede nicht leere Schlange der Reihe nach dran, jeweils mit ihrem ältesten wartenden Beitrag. Leere Schlangen geben ihren Zug frei. Neue Beiträge werden hinten angefügt. Ähnliche Beiträge dürfen gemeinsam geprüft werden, wenn jeder Eingang, der jeweilige Grund und der Einspruchsweg einzeln nachvollziehbar bleiben.

Ist die Zahl zugelassener Schlangen durch $G_{\max}$ begrenzt und stehen in derselben Schlange bei Ankunft von Beitrag $i$ genau $n_i$ Beiträge vor ihm, dann gilt bei durchlaufendem Wechsel:

$$
S_i \le G_{\max}(n_i+1).
$$

$S_i$ zählt Vergaben von Prüfterminen ab Annahme bis einschließlich der Vergabe für $i$. Jede volle Rotation verbraucht höchstens $G_{\max}$ Vergaben und lässt mindestens einen Beitrag aus der eigenen Schlange an die Reihe kommen. Die Schranke betrifft die Vergabe. Dauer der Prüfung, tatsächliche Antwortzeit, Ausfälle und vorgelagerte Hürden sind gesondert zu erfassen. Zugelassene Schlangen brauchen kontinuierlichen Dienst und ausreichende Kapazität. Zusätzliche Schutzfälle brauchen einen eigenen, menschlich beaufsichtigten Weg. Gründe für Verzögerung oder Ablehnung gehören in einen anfechtbaren Bescheid. Namen, private Details und Schutzmeldungen bleiben aus den öffentlichen Themenplätzen heraus.

**Beispiel.** Am Justizplatz treffen zehn Zustimmungen auf Deutsch und ein bisher unbeachteter Einwand auf Englisch ein. Unter zwei aktiven Sprachschlangen und ohne Vorgänger in der englischen Schlange bekommt der Einwand innerhalb von zwei Vergaben einen Prüftermin. Er weist etwa darauf hin, dass eine Entscheidungsmitteilung nur als gescanntes Bild vorliegt und für Screenreader unlesbar sein kann. Falls der Fall überprüft ist, genügt er, um die Allaussage „Jede Mitteilung ist mit einem Screenreader lesbar“ zu widerlegen. Die zehn Zustimmungen dürfen als Erfahrungen im Gespräch stehen bleiben. Eine menschlich verantwortete Prüfung hält fest, welche Behauptung sich ändert und was weiter offen ist.

Ein Platz mit vielen Besuchen bekommt dadurch keinen höheren Erkenntnisstatus. Gespräch, Moderation und Aussageprüfung sind getrennte Zustände. Für die öffentliche Prüfung zählen Aussageart, Quelle, Fassung, tragfähige Gründe und Gegenbelege. Eine KI kann einen Entwurf oder eine mögliche Querverbindung anbieten. Veröffentlichungen, inhaltliche Änderungen und Moderationsentscheidungen folgen [META-01](selbstkorrektur.md), [REDE-01](redefreiheit-und-schutz.md) und der [Gemeinschaftsordnung](community-governance.md).

## 3 · Was sich erproben lässt

- **Jetzt.** Von einem Thema zum passenden Platz gehen, den Kontext wiedererkennen und den Weg zum Schreiben samt Kontohürde sehen. Jede direkte Zuordnung muss zu einer vorhandenen Seite oder einem vorhandenen Faden führen. Das lässt sich je Sprachversion im gebauten Stand prüfen.
- **In einem begrenzten Pilot.** Mit Menschen testen, die Vera zum ersten Mal nutzen. Sie wählen ein Thema, finden den Ort und beginnen in ihren eigenen Worten. Verglichen werden Zeit, erreichte Schritte und Abbrüche mit einem gemeinsamen Forumseinstieg. Getrennt erheben wir bei vergleichbaren Einwänden je Prüfschlange die Wartezeiten und die Erkennungsrate. Moderationslast, Missbrauch, Fehlzuordnung und Einsprüche gehören in dieselbe Auswertung. Schlechtere Ergebnisse in einer Sprache können die nächste Ausbaustufe aufhalten.
- **Optionaler Anschluss.** [PR #160](https://github.com/AlexanderR1991/Vera/pull/160) untersucht einen lokalen Prototyp für Prüfschlangen und Korrekturwellen. Ein späterer Anschluss kann einen überprüften Einwand mit den davon betroffenen Aussagen verknüpfen. Diese Seite beschreibt die öffentlichen Einstiege. Dauerhafte Quittungen, Warteschlangen, vertrauliche Meldungen und ein Einspruchsdienst erfordern einen eigenen Betrieb.

## English

**Version 0.1 · topic squares and entry points on the site · proposed model for later operation**

When a question catches your attention on Vera, “Join the discussion” takes you to its topic square. It offers a concrete opening question and tells you whether you can open a conversation or submit a question to start one. One sentence is enough to get started. You can read Vera’s public squares without signing in. Posting uses GitHub and requires an account there.

### A city of questions

| Place | What you can do there | Example |
| --- | --- | --- |
| Topic square | Ask, share experiences and listen. | Justice. What would help you understand a court decision? |
| Conversation | Follow a specific question together. Several squares can link to the same conversation. | How should a school mediate between a child, their parents and other children? |
| Review table | Consider a claim, its version and a specific objection together. | Does a counterexample refute this claim about access to a procedure? |
| Workshop | Follow a revision and its public reasons. | A verified objection leads to a narrower claim or an explanation of what remains open. |

The places build on the existing [Agora, Stoa and Curia routes](forum.md). Each needs an understandable opening question, a clear next step and recognisable neighbours. Several topics can point to the same conversation and keep its address. A possible duplicate is a suggested connection. Preserve distinct framings, experiences and counterevidence. A new square needs a distinct question and a clear entrance. One substantiated objection can justify it. A quiet square can stay quiet.

### 1 · Reaching the right place

Let $A$ contain discussable pages and their addressable sections. An entry point $a=(s,f)$ is a locale-independent page $s$ with an optional stable section $f$. Let $P$ be the set of squares. The mapping $\rho\colon A\to P$ assigns one initial square to every entry point. A section inherits its page’s mapping when it lacks one of its own. German and English share the square ID and have their own labels and URLs. Conversations and claim threads carry separate IDs that can take readers straight to a specific discussion.

The graph $G=(P\cup T,E)$ connects squares $P$ with conversations $T$ and their neighbours. A link gives its reason, such as “subquestion”, “also relevant to” or “examines claim X”. Multiple links can lead to the same conversation. These links describe context and have no effect on a claim’s truth. Renaming keeps IDs and existing addresses resolvable. Links to closed threads explain their state and how to raise a new objection where public display is appropriate.

Let $d_\ell(a,\rho(a))$ count the fewest deliberate link activations to the correct, publicly readable square in language $\ell$. Coverage is

$$
C_\ell = \frac{|\{a\in A \mid d_\ell(a,\rho(a))\le 1\}|}{|A|}.
$$

The target is $C_\ell=1$ for every supported language. An existing conversation or a clearly labelled contribution route should take at most one further activation from the square. GitHub sign-in is a separate barrier to writing. Path length alone cannot measure usability. Check the route with a keyboard, without JavaScript, in a narrow viewport, with enlarged text and with a screen reader. The persistent control must stay operable while leaving content and keyboard focus visible.

### 2 · Giving people a hearing under load

A future service would give every accepted contribution an individual receipt and explainable first review. A square keeps its contributions in an auditable order. A bounded number of review queues can group entries by language, for example. Queue assignment and changes must be visible and open to challenge. Give each nonempty queue a turn and take its oldest waiting contribution. Skip empty queues and append new entries at the tail. Related contributions may share a review if each receipt, reason and appeal route remains individually traceable.

If there are at most $G_{\max}$ admitted queues and contribution $i$ arrives with $n_i$ entries ahead in its own queue, a continuously rotating scheduler gives it a review slot within

$$
S_i \le G_{\max}(n_i+1)
$$

slot allocations, counting its own allocation. Each full rotation uses at most $G_{\max}$ allocations and reaches its queue at least once. This is a bound on allocation. Measure review duration, actual response time, outages and barriers to admission separately. Admitted queues need continuous service and enough capacity. Safety cases need their own human-supervised route. Explain delays and rejections with a route to challenge them. Keep names, private details and safety reports out of the public square.

**Example.** The justice square receives ten German endorsements and one previously overlooked English objection. With two active language queues and nobody ahead in the English queue, the objection receives a review slot within two allocations. Suppose it identifies a decision notice available only as a scanned image, potentially inaccessible to screen readers. If verified, this one case refutes the claim “Every notice is readable with a screen reader.” The ten endorsements remain in the conversation as experiences. An accountable human review records which claim changes and what remains open.

A busy square has the same review standards as a quiet one. Conversation, moderation and claim review have separate states. Public review looks at claim type, source, version, reasons and counterevidence. AI can draft or suggest links. Publication, substantive revision and moderation follow [META-01](selbstkorrektur.md#english), [REDE-01](redefreiheit-und-schutz.md#english) and [community governance](community-governance.md).

### 3 · What to test

- **Now.** Go from a topic to its square, recognise the context, and identify the posting route and its account requirement. Test every direct link against an existing page or thread in each built language version.
- **In a limited pilot.** Ask first-time visitors to choose a topic, find its square and start in their own words. Compare time, steps reached and drop-off with a shared forum entrance. Separately measure waiting times and detection rates for comparable objections in each queue, as well as moderation workload, misuse, misrouting and appeals. Worse results in one language can halt the next expansion.
- **Optional integration.** [PR #160](https://github.com/AlexanderR1991/Vera/pull/160) explores a local prototype for review queues and correction waves. A later integration can connect a verified objection to claims it affects. This document describes public entry points. Durable receipts, queues, confidential reporting and an appeals service require their own operation.
