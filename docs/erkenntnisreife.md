# Erkenntnisreife: Aufstieg, Rückstufung und Konsens / Evidence maturity

**Vera · Verfahrensentwurf und strukturell abgesicherter Pilot · 6. November 2026**

> Eine Erkenntnis steigt nicht durch Zustimmung auf, sondern durch die Qualität ihrer Begründung und Prüfung. Ihre Stellung bleibt jederzeit korrigierbar.

**META-01:** Der [selbstkorrigierende Regelkreis](selbstkorrektur.md) verlangt, dass auch eine hochgereifte Aussage nach einem neuen qualifizierten Einwand rückgestuft, eingegrenzt oder zurückgezogen werden kann. Ein R-Wert zählt dokumentierte Prüfung, nicht die Fähigkeit einer Institution, recht zu behalten.

## Drei Achsen, kein Wahrheits-Thron

1. **Aussageart** entscheidet über die angemessene Prüfung: empirisch, formal, normativ, interpretativ oder metaphorisch. Ein Wert kann nicht zum Naturgesetz „aufsteigen“.
2. **Abstraktion** beschreibt Reichweite: Einzelfall (case), Muster (pattern), fachbezogene Aussage (disciplinary), Prinzip (principle). Eine allgemeinere Aussage ist nicht automatisch besser belegt. Diese Stufe ist **keine Aufstiegsleiter**.
3. **Erkenntnisreife R0–R4** bezeichnet eine *dokumentierte Qualität der Begründung und Gegenprüfung*, keine mathematische Wahrscheinlichkeit und keine absolute Wahrheit. **Konsens** wird als weitere, separate Beobachtung erfasst.

Verschiedene Aussagen können nicht miteinander verglichen werden. Kein Durchschnitt aus Zustimmung, Quellenanzahl und KI-Stimmen darf eine epistemische Rangzahl erzeugen.

## Fünf Reifestufen und die nötige Prüfung

| Stufe | Bedeutung | Mindestbedingung für Aufnahme |
| --- | --- | --- |
| **R0** | Ungeprüfter Stand | Herkunft und Unsicherheit sichtbar; ein ungeprüfter Entwurf darf offen bleiben. |
| **R1** | Prüfbar formuliert | Wortlaut, Geltungsbereich, Aussageart, geeignete Prüfung, stärkster Einwand und Revisionsbedingung; eine verantwortliche **menschliche Prüfung der aktuellen Fassung** ist dokumentiert. |
| **R2** | Begründet geprüft | R1 plus Prüfung der fachlich passenden Gründe und ihrer Grenzen. Für empirische Aussagen braucht es als Beleg markierte, wirklich untersuchte Evidenz; für formale Aussagen eine explizite Ableitung unter Voraussetzungen. Normen verlangen offengelegte Werte, Betroffenenperspektiven und Einwände, keinen „wissenschaftlichen Beweis“ für Werte. |
| **R3** | Unabhängig gegenprüft | R2 plus mindestens eine öffentlich nachvollziehbare, möglichst fachkundige unabhängige Gegenprüfung. Name, Datum, Umfang, mögliche Interessenkonflikte und Nachweis sind dokumentiert. Das System kann die tatsächliche Unabhängigkeit **nicht authentifizieren**. |
| **R4** | Robust gegenkritisiert | R3 plus mindestens zwei unterschiedliche, dokumentierte unabhängige Prüfer und nachvollziehbare Behandlung der stärksten Einwände. Bei empirischen Aussagen sind belastbare Replikation, Verzerrungsrisiken, Präzision, Widersprüche und externe Geltung je nach Fachgebiet zu prüfen; bei formalen Aussagen die Ableitung; bei Normen Konflikte und Gegenpositionen. R4 ist **keine Unangreifbarkeit**. |

Die Mindestbedingungen sind **notwendig, nicht hinreichend**: Ein Eintrag kann formal alle Pflichtfelder erfüllen und trotzdem fachlich falsch sein. Quellennachweis, Review-URL, Fingerabdruck und Votum ersetzen weder Fachkompetenz noch Quellenlektüre. In Medizin, Recht, Sicherheit und anderen risikoreichen Bereichen sind strengere externe Standards, gegebenenfalls Fachinstitutionen, erforderlich; keine Nutzerentscheidung wird aus R4 allein automatisch freigegeben.

**Keine erzwungene Beförderung:** Ein gut geprüftes R1 kann stehen bleiben. Ein förmlicher Beweis gilt nur in seinem Axiomensystem und ist außerhalb dieses Systems nicht automatisch empirisch belegt. Eine Metapher bleibt eine Metapher. Ein normatives R4 bezeichnet robust geprüfte Argumentation, nicht bewiesene universelle Ethik.

## Verfahren: Hinauf, hinunter, offen lassen

1. **Fassung fixieren:** Aussagekennung, Wortlaut in beiden Sprachen, Version, Abstraktion, Typ, Voraussetzungen, Quellenversionen und Geltungsbereich benennen. Beobachtung, Wert und Interpretation bei Bedarf in getrennte Aussagen aufspalten.
2. **Fachlich geeignet prüfen:** Belege und Gegenbelege, methodische Schwächen, starke Gegenmodelle und Betroffenenperspektiven aufnehmen. Ergebnisse und mögliche Widerlegungen offenlegen. Unabhängige KI-Ausgaben sind keine unabhängigen menschlichen Reviews.
3. **Entscheidung begründen:** In einem öffentlichen Pull Request erklären, warum gerade die angestrebte Stufe erfüllt sein soll, woran sie scheitern könnte und wer verantwortlich prüfte. Der aktuelle Maintainer entscheidet redaktionell; das ist nicht automatisch unabhängiges Peer Review. Bei Konflikten muss die fehlende Unabhängigkeit sichtbar bleiben.
4. **Versionieren:** Jede inhaltliche oder metadatenbezogene Änderung erhöht die Versionsnummer und ergänzt die deutsch-englische Änderungshistorie. Bei veränderten Daten wird ein alter Prüfvermerk ungültig. Eine neue Prüfung benötigt ihren eigenen Vermerk und einen Fingerabdruck des gesamten neuen Eintrags. **Ein neuer Hash allein ist niemals eine neue Prüfung.**
5. **Revidieren:** Ein substanziell bestätigter Gegenbeleg kann R4 genauso wie R1 herabstufen, den Geltungsbereich einschränken oder zum Status „umstritten“ beziehungsweise „zurückgezogen“ führen. Bloßer Widerspruch löst eine Prüfung aus, aber noch keine automatische Widerlegung. Zurückgezogene Aussagen tragen R0; ihr alter Verlauf bleibt erhalten.
6. **Abhängigkeiten prüfen:** Jeder bestätigte Fehler muss für verbundene Aussagen und Anwendungsfälle Folgen haben. *Heute* gibt es erst einen kuratierten Erkenntnisnavigator; ein allgemeiner Graph mit automatischer Markierung aller abhängigen Aussagen ist **noch nicht implementiert**. Bis dahin gehören betroffene Verbindungen ausdrücklich in die Review-Begründung.

R1–R4 verlangen einen dokumentierten menschlichen Review der **aktuellen Fassung**, und R3/R4 zusätzliche nachvollziehbare unabhängige Prüfungen. Kein Bot und keine Mehrheit dürfen die Stufe selbst verändern. Der Validator prüft nur Pflichtangaben und verhindert einige unzulässige Kombinationen. Ob Quellen tatsächlich tragfähig sind, bleibt menschliche Arbeit.

## Richtungsindex ist keine Erkenntnisreife

Der [Forschungsentwurf zur kollektiven Moral](kollektive-moral.md) erprobt eine **zusätzliche bedingte Orientierung** von −1 bis +1, die nur mit explizitem Wertprofil, Referenz und unabhängiger Prüfung sinnvoll sein könnte. Sie ersetzt **keines** der Felder Aussageart, Abstraktion, R0–R4, Konsens oder Review. Keine Zustimmung, KI-Antwort oder spätere Richtung darf einen Reifegrad automatisch verändern. Der Entwurf enthält derzeit **nur nicht bewertete Beispiele**. Öffentliche Zahlen wären erst nach mindestens R3-Prüfung der einschlägigen Wirkungsannahmen, Kalibrierung, Robustheitsprüfung und verantwortlicher menschlicher Entscheidung vertretbar.

## Konsens nicht mit Wahrheit verwechseln

Der Konsensstatus im Register ist **not_assessed** (nicht erhoben), **documented_agreement** (Zustimmung belegt), **documented_dissent** (Dissens belegt) oder **mixed** (beides). Für dokumentierte Positionen braucht es überprüfbare Referenzen und ihren Kontext; eine einzelne Zustimmung ist **kein allgemeiner Konsens**. Unbekannte Grundgesamtheit, Auswahlverzerrung, stille Gegenstimmen und Abhängigkeiten sind offenzulegen.

Wiederholte Meldungen, Like-Zahlen, dieselbe KI-Antwort in hundert Fassungen, Schweigen und Mehrheiten erzeugen weder Wahrheit noch fachliche Prüfungen. Ein einzelner belastbarer Gegenbeweis kann eine Aussage zu Fall bringen. Ein einzelner unbelegter Einwand darf sie nicht automatisch zu Fall bringen. Bei Wertkonflikten kann gut begründeter Dissens das angemessene Endergebnis sein.

## Daten und Grenzen des Piloten

Die öffentliche Datenquelle bleibt [public/knowledge/claims.json](../public/knowledge/claims.json). Neu sind je Aussage: `abstraction_level`, `maturity` (level, rationale, independent_checks, adversarial_resolution) und `consensus` (status, note, records). Die Daten werden auf den DE/EN-Registerseiten angezeigt und durch `src/lib/maturity.mjs` und `scripts/validate-claims.mjs` **strukturell** kontrolliert. `tests/maturity.test.mjs` prüft Sperren und Regressionen nur an künstlichen Beispielen. Die drei öffentlich sichtbaren Demonstrationsaussagen bleiben **R0, unbegutachtet, ohne erhobenen Konsens**. Die Einführung der Zusatzfelder änderte ihre inhaltlichen Aussagen nicht.

Das ist bewusst *kein* globales Ranking von Menschen, Traditionen, Religionen oder Forschungsgebieten. Es gibt keinen universellen Punktescore und keine Garantie, die Wahrheit endgültig ermittelt zu haben.

---

## English · Rules for advancement and correction

**Principle:** A claim does not advance because people agree with it. It advances only when the reasons and tests appropriate to its type justify it, and every decision remains reversible.

The system separates **claim type**, **abstraction** (case, pattern, disciplinary, principle), **maturity** (R0–R4), and **documented agreement or dissent**. None is a truth probability. A broad principle is no truer than a narrow case merely because it is broad.

| Level | Meaning | Minimum gate |
| --- | --- | --- |
| R0 | Unreviewed | Status and uncertainty explicit |
| R1 | Testably formulated | Claim, scope, relevant method, strongest objection and revision condition, plus documented human review of the current version |
| R2 | Reasoned review | Type-appropriate examined support, including empirical evidence or formal derivation where relevant; normative judgments are justified as values, not proven as facts |
| R3 | Independently challenged | At least one traceable independent review with scope and conflicts declared |
| R4 | Robust under criticism | At least two distinct traceable independent checks and a documented response to the strongest objections, with discipline-specific quality requirements |

These are **necessary, not sufficient**, gates. The validator cannot authenticate reviewers, verify source quality, or guarantee truth. High-stakes subjects need stronger external standards. R4 must never mean unquestionable. Metaphors do not become facts; moral claims do not become theorems. Well-defended disagreement may be the outcome.

To change a level: identify the exact bilingual version; test sources and the strongest objections; document the accountable human decision in a PR; increment version and history; renew the review **only after actual reassessment** of the changed content; keep previous versions traceable. Verified counterevidence can justify narrowing, demotion, dispute or withdrawal regardless of popularity. Mere disagreement prompts investigation, not automatic demotion. Withdrawn claims return to R0. Dependent claims must be examined, but automatic dependency propagation is not yet built.

Consensus is separately recorded as unassessed, documented agreement, documented dissent or mixed. A cited participant position does not prove general agreement. Votes, likes, silence and duplicated AI outputs never decide truth or review level. Current demonstrations remain R0 with consensus unassessed.
