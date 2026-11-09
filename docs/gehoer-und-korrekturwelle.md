# Gleiches Gehör und Korrekturwelle

[English](#english)

**Stand 0.1 · lokal ausführbarer Prototyp und Architekturentwurf**

Jeder angenommene Beitrag hat denselben Anspruch auf eine nachvollziehbare Erstprüfung und einen Einspruchsweg. Ein begründeter Einwand kann eine zentrale Annahme und viele ihrer Folgen verändern. Zustimmungshäufigkeit und Begründung werden getrennt geführt. Der Atlas ist die sichtbare Karte. Der Korrekturgraph verbindet die Prämissen mit den Schlüssen, die von ihnen abhängen.

## Ausprobieren

```sh
node scripts/vera-correction-wave.mjs
```

Die lokale Gegenprobe legt 10.000 ähnliche Zustimmungen und einen anderssprachigen Einwand vor. Obwohl der Einwand zuletzt eingeht, kommt er als Zweiter an die Reihe. Im Testfall ist sein Gegenbeispiel bereits bestätigt. Es entkräftet die Annahme, dass alle Betroffenen Zugang haben. Zwei davon abhängige Schlüsse verlieren ihre Grundlage. Ein weiterer bleibt über eine unabhängige Begründung ableitbar. Vera nimmt die Prüfung alternativer Zugangswege als neuen Schluss auf. Die Rechnung zeigt, welche Aussagen erneut geprüft werden und welche sich tatsächlich ändern. „Vera, Welle“ bezeichnet den [Prüfauftrag für eine KI-Sitzung](vera.md#eine-welle-starten).

Mit einem eigenen Szenario führt `node scripts/vera-correction-wave.mjs <scenario.json>` die ausdrücklich eingetragenen Graphrevisionen aus und gibt Vorherstand, Änderungswellen und Nachherstand als JSON aus.

```json
{
  "initial": {
    "facts": ["all-can-register"],
    "rules": [{"id": "one-route", "premises": ["all-can-register"], "conclusion": "one-route-suffices"}]
  },
  "revisions": [{"label": "confirmed-access-gap", "removeFacts": ["all-can-register"]}],
  "inspect": ["one-route-suffices"]
}
```

Jede Revision kann `addFacts`, `removeFacts`, `addRules` und `removeRules` enthalten. `removeRules` enthält Regel-IDs. Beim Ersetzen einer Regel mit gleicher ID steht sie in beiden Regellisten.

## Gehör unter Last

Für jeden angenommenen Beitrag $i$ ist $H_i(t)=1$, sobald bis zur Zeit $t$ eine Erstprüfung mit nachvollziehbarem Ergebnis und Einspruchsweg vorliegt. Vorher ist $H_i(t)=0$. Der Eingangsbeleg bestätigt die Annahme, die Prüfung liefert den Befund. Auch wenn ähnliche Beiträge gemeinsam geprüft werden, bleiben Quittung, Zuordnung und Einspruch einzeln verfolgbar.

Bei einem gleichzeitigen Schub von $N$ Beiträgen und einer Obergrenze von $C$ Erstprüfungen pro Sekunde gilt $T_{\mathrm{alle}}\ge N/C$. Für acht Milliarden Beiträge bei einer Million Prüfungen pro Sekunde sind das mindestens 8.000 Sekunden. Gleiche frühe Auswahlchancen können kleine Gruppen übergehen. Bei gleichmäßiger Ziehung von $m$ aus $N$ Beiträgen erwartet eine Gruppe mit $n$ Beiträgen $mn/N$ Plätze. Liegt dieser Wert unter 1, kann ihr das Verfahren keinen Platz in dieser Runde garantieren.

Der lokale Prototyp teilt die Prüftermine reihum unter den aktiven Warteschlangen auf, zum Beispiel nach Sprache. Eine leere Warteschlange gibt ihren Platz frei. Das schützt kleine Warteschlangen vor dauerhafter Verdrängung. Für einen späteren Pilotversuch messen wir je Gruppe Wartezeiten und

$$
r_g(\tau)=\Pr(\text{Einwand bis }\tau\text{ erkannt}\mid\text{vergleichbarer, gültiger Einwand in Gruppe }g).
$$

Mindestniveau und maximaler Gruppenunterschied werden vor der Messung festgelegt. Die Auswertung zählt Beiträge. Eine Aussage über einzelne Menschen setzt zusätzlich voraus, dass Mehrfacheingaben und Zugangsbarrieren untersucht werden.

## Korrekturgraph

Die zugelassenen Prämissen bilden $B$. Die expliziten Schlussregeln $R$ enthalten Regeln $A\to h$, für die alle Voraussetzungen aus $A$ gemeinsam gelten müssen. Mehrere Regeln für $h$ bilden alternative Begründungen. Der kleinste Abschluss $D$ entsteht durch Wiederholung bis zur Stabilität.

$$
D_0=B,\qquad D_{k+1}=D_k\cup\{h\mid(A\to h)\in R,\ A\subseteq D_k\}.
$$

Im gerichteten Graphen $G$ führt jede Kante von einer Prämisse zu ihrem Schluss. Bei einer Änderung zu $B',R',G'$ starten wir bei den hinzugefügten und entfernten Prämissen und bei den Zielaussagen der geänderten Regeln.

$$
S=(B\triangle B')\cup\{h\mid(A\to h)\in R\triangle R'\},\qquad
W=\operatorname{Erreichbar}_{G\cup G'}(S).
$$

Der alte Graph erfasst auch Abhängigkeiten, die gerade wegfallen. Der neue erfasst neue Wege. Vera berechnet $W$ mit den weiterhin ableitbaren Aussagen außerhalb von $W$ als Randbedingungen neu. Ein Schluss kann seine Gültigkeit im Modell behalten und dabei eine Begründung verlieren. Der Befund unterscheidet deshalb erneute Prüfung, Änderung der Ableitbarkeit und Änderung der unmittelbaren Begründung (zugelassene Prämisse oder anwendbare Schlussregeln). Im ungünstigsten Fall umfasst $W$ den ganzen Graphen.

Im Betrieb würde eine Änderung die Aussageart, Fassung, Quelle, Geltungsgrenze, den überprüften Einwand und die verantwortliche Person referenzieren. Ein überprüftes Gegenbeispiel kann eine Allaussage entkräften. Bei einem Wertkonflikt kann ein Einwand eine menschliche Abwägung neu eröffnen. Die Rechnung nimmt die ausdrücklich übergebenen Prämissen und Regeln als Ausgangspunkt. Ihre Zulassung folgt [META-01](selbstkorrektur.md) und der [Gemeinschaftsordnung](community-governance.md).

## Vom lokalen Versuch zum Betrieb

1. **Lokal.** Prüfreihenfolge, Einspruch und Graphrevision laufen mit synthetischen Eingaben im Arbeitsspeicher. Einfache Eingangsreihenfolge und vollständige Neuberechnung dienen als Vergleichsmaßstäbe.
2. **Begrenzter Pilot.** Geschützte Speicherung mit stabilen Quittungen, versionierten Graphständen und menschlich geprüften Änderungen. Persönliche Originale sind zugriffsbeschränkt und unterliegen Löschfristen. Der öffentliche Verlauf enthält freigegebene, bereinigte Begründungen. Tests vergleichen Erkennungsraten je Sprache und prüfen, ob falsch gebündelte Einwände wieder einzeln behandelt werden.
3. **Verteilter Betrieb als Entwurf.** Eingänge und Prüftermine verteilen, Wiederholungen sicher behandeln, Abhängigkeiten über Teilgraphen indexieren und Änderungswellen aus geprüften Ereignissen wiederholen können. Konsistente Stände gemeinsam veröffentlichen. Lasttests müssen Rückstau, Ausfälle und eine Änderung mit sehr großem Wirkungsbereich abdecken.

Der lokale Versuch prüft Rechenregeln und Prüfreihenfolge. Ein öffentliches Eingabesystem, semantische Prüfung und fairer Betrieb in großem Maßstab gehören zum Pilot- und Forschungsplan.

## English

**Version 0.1 · local prototype and proposed architecture**

Every accepted contribution has the same right to an explainable first review and an appeal. A substantiated objection can change a central premise and many of its consequences. Endorsements and reasons are recorded separately. The atlas is the visible map. The correction graph connects premises to the conclusions that rely on them.

Run `node scripts/vera-correction-wave.mjs` from the repository root. The local exercise submits 10,000 similar endorsements and one objection in another language. The objection arrives last and is reviewed second. The fixture supplies a verified counterexample to universal access. Two conclusions lose their grounds and another survives through a separate justification. The revised graph adds a conclusion to review alternative access routes. Pass a [scenario file](#ausprobieren) with initial facts and rules, revision patches and claim IDs to inspect. The [“Vera, Welle” session command](vera.md#eine-welle-starten) requests a project review from an AI session.

**Hearing under load.** For accepted contribution $i$, $H_i(t)=1$ once an explainable first review and an appeal route exist by time $t$. Before then, it is 0. A receipt records admission. Shared review of similar contributions preserves individual receipts, assignments and appeals. A simultaneous burst of $N$ contributions needs at least $N/C$ seconds for first review at capacity $C$ per second. Uniform early selection gives a group of $n$ contributions an expected $mn/N$ slots among the first $m$. If that is below 1, some selections leave the group out entirely. The local prototype rotates among nonempty queues, for instance queues for different languages. A future pilot would measure waiting times and $r_g(\tau)$, the fraction of comparable valid objections from group $g$ detected by time $\tau$. Set both a minimum level and a maximum gap before evaluation. A contribution count says little about how many distinct people were reached unless repeat submissions and barriers are studied separately.

**Correction graph.** Starting with admitted premises $B$, repeatedly apply rules $A\to h$ in $R$ when every premise in $A$ holds. The least closure $D$ represents what follows under those assumptions. Separate rules for the same head provide alternative reasons. When premises or rules change, start at changed premises and the heads of changed rules. Follow dependencies in the union of the old and new graphs and recompute the reachable set $W$. The old graph keeps withdrawn dependencies in view. Conclusions can stay derivable while their direct reasons change (admitted premise or applicable rules). A central premise can make $W$ span the whole graph. In a real review, scope, sources, the objection, prior versions and the accountable reviewer belong in the revision record. Admitting or revising claims follows [META-01](selbstkorrektur.md#english) and [community governance](community-governance.md). A value conflict can reopen human deliberation.

**Path to operation.** The in-memory test uses synthetic inputs. Compare queue fairness against arrival order and graph results against full recomputation. A limited pilot would add protected storage, durable receipts, human-reviewed changes, private originals with a deletion schedule, and approved redacted public reasons. It would measure first-review detection across languages and test recovery from misgrouped objections. A later distributed design could partition intake and graph indices, handle retries, replay reviewed changes and publish consistent snapshots. Stress tests would need to cover backlogs, failures and graph-wide corrections. Public intake, semantic review and large-scale fairness remain research and implementation work.
