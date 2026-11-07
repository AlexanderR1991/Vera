# Vera · Was kann ich über meinen eigenen Stand sagen?

Ein grüner Build zeigt, dass ein Stand gebaut wurde. Ob du ihn gerade auf der Website siehst, braucht einen eigenen Beleg. Dieses erste ausführbare Selbstmodell gibt eine Antwort, nennt bei offenen Aussagen zwei mögliche Gegenwelten und zeigt bei widersprüchlichen Belegen einen konkreten Konflikt. Sein Gegenstand ist der veröffentlichte Projektstand.

## Ausprobieren

Im Vera-Checkout ausführen. Die folgenden Belege und Kennungen sind erfunden.

```sh
node scripts/vera-self-model.mjs <<'JSON'
{
  "revision": "1111111111111111111111111111111111111111",
  "runAttempt": "123456789/1",
  "observedAt": "2026-11-07T23:46:35Z",
  "evidence": [
    {"claim": "buildPassed", "value": true, "source": "Erfundener erfolgreicher Build-Job"}
  ]
}
JSON
```

Der Build ist bestätigt. Die Aussage über die öffentlich ausgelieferte Revision bleibt offen. Ergänze im Beispiel einen Eintrag mit `"claim": "liveRevisionMatches", "value": false` und einer Quellenangabe. Die Aussage wird widerlegt, der bestätigte Build bleibt bestehen. Ergänze stattdessen einen zweiten Build-Beleg mit `false`, um einen Konflikt zu sehen.

## Definition

Alle Belege beziehen sich auf denselben vollständigen Commit, denselben Versuch eines [Pages-Workflow-Laufs](../.github/workflows/pages.yml) und denselben Auswertungszeitpunkt in UTC. Die Eingabe nimmt drei beobachtbare Aussagen an.

| Zeichen | Feld | Aussage |
| --- | --- | --- |
| $B$ | `buildPassed` | Für diesen Versuch lag bis zum Auswertungszeitpunkt ein erfolgreicher Build-Job als erfüllte Abhängigkeit vor. |
| $D$ | `deploymentSucceeded` | Der Deploy-Job dieses Versuchs war bis zum Auswertungszeitpunkt erfolgreich. |
| $L$ | `liveRevisionMatches` | Die geprüfte öffentliche Pages-Adresse lieferte zum Auswertungszeitpunkt die Zielrevision aus. |

`false` bedeutet, dass die jeweilige Aussage im angegebenen Rahmen widerlegt ist. Wenn ein Jobstatus noch unklar ist, die Seite nicht erreichbar ist oder die Antwort keine überprüfbare Revisionskennung enthält, fehlt für die entsprechende Aussage ein Beleg. Die Quellenangaben sollen den geprüften Jobversuch beziehungsweise Abruf identifizieren. Der Befehl prüft die logische Konsistenz der Eingaben. Deren Herkunft, Zeitbezug und Zuordnung prüft die Person, die sie erhebt. Ein Abruf gilt für den beobachteten Zugangspunkt. Spätere Abrufe bilden einen neuen Auswertungszeitpunkt.

`deployedAndLive` ist die abgeleitete Aussage $D\land L$, in Worten: Der konkrete Workflow-Versuch hat veröffentlicht und der geprüfte öffentliche Abruf liefert die Zielrevision. Der Deploy-Job setzt in diesem Workflow einen erfolgreichen Build voraus. Ein gezielter Wiederholungslauf kann dabei das Ergebnis eines früheren Versuchs desselben Laufs übernehmen. Daher gilt $D\Rightarrow B$ auch dann, wenn der Build-Job im Wiederholungsversuch nicht erneut ausgeführt wurde. [Job-Abhängigkeiten](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-jobs#defining-prerequisite-jobs) · [Wiederholung von Jobs](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/re-run-workflows-and-jobs)

Beide Werte für den öffentlichen Abruf sind bei jedem zulässigen Paar aus Build und Deployment möglich. Ein anderer Versuch kann denselben Commit veröffentlicht haben. Auch ein erfolgreicher Versuch kann inzwischen von einem anderen Stand abgelöst sein.

Sei $W=\{(b,d,l)\in\{0,1\}^3 : d\le b\}$. In Worten: Es gibt sechs zulässige Zustände, weil ein erfolgreicher Deploy-Job nur bei erfolgreichem Build zulässig ist und beide Werte von $L$ möglich sind. $W_E=\{w\in W:\forall (p,v)\in E,\ p(w)=v\}$. Das sind genau die Zustände, die jede beobachtete Aussage $p$ mit ihrem angegebenen Wert $v$ erfüllen.

| Ergebnis | Bedingung |
| --- | --- |
| `conflict` | Kein zulässiger Zustand passt zu allen Belegen. |
| `confirmed` | Mindestens ein Zustand passt und die Aussage trifft in jedem passenden Zustand zu. |
| `refuted` | Mindestens ein Zustand passt und die Aussage ist in jedem passenden Zustand falsch. |
| `open` | Zwei passende Zustände geben unterschiedliche Antworten. Die Ausgabe enthält beide. |

**Satz.** Für ein festes Modell und denselben Auswertungsrahmen bleiben bestätigte und widerlegte Aussagen stabil, wenn zusätzliche konsistente Belege hinzukommen. Denn jeder Zustand, der zu den zusätzlichen Belegen passt, passte bereits zu den alten. Eine in allen alten Zuständen wahre oder falsche Aussage behält daher ihren Wert in der nichtleeren Teilmenge. Bei offenem Ergebnis kann kein binäres Urteil in beiden ausgegebenen Zuständen richtig sein.

**Konflikt.** Die Ausgabe benennt eine inklusionsminimale Belegmenge, die zusammen widersprüchlich ist. Entfernt man aus dieser Menge einen Eintrag, ist mindestens ein Zustand wieder möglich. Bei Konflikt endet der Befehl mit Status 1, bei fehlerhafter Eingabe mit 2, sonst mit 0.

**Revisionsbedingung.** Ändert sich die Abhängigkeit zwischen Build und Deployment, muss die Menge der zulässigen Zustände neu begründet werden. Ändert sich die öffentlich ausgelieferte Revision, braucht die neue Momentaufnahme einen eigenen Abrufbeleg. Die Bewertungen im Bericht sind relativ zu den eingegebenen Beobachtungen und zum Modell.

## English

A successful build and a live public revision answer different questions. This local self-model takes a full commit SHA, the Pages workflow run ID and attempt number, an observation time, and explicit, sourced boolean observations. Run the synthetic example above with `node scripts/vera-self-model.mjs`.

| Field | Meaning |
| --- | --- |
| `buildPassed` | By the observation time, the specified attempt had a successful build job as a satisfied dependency. |
| `deploymentSucceeded` | The same attempt's deploy job succeeded by that time. |
| `liveRevisionMatches` | The checked public Pages endpoint served the target revision at that time. |
| `deployedAndLive` | The specified attempt deployed successfully and the probe identified the target revision. Computed by the model. |

Record a negative observation only when its claim is refuted within the given scope. An unavailable job status, an unreachable page, or a response without a verifiable revision leaves the corresponding claim without an observation. The caller verifies the provenance, time, and scope of the evidence. The tool checks its logical consistency. A public probe applies to the endpoint observed at the specified time.

A successful deploy job requires a successful build dependency. On a partial rerun, that result can come from an earlier attempt of the same run. [Job dependencies](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-jobs#defining-prerequisite-jobs) · [Rerunning jobs](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/re-run-workflows-and-jobs)

The public response can identify the target revision or another one regardless of that attempt's result. The tool enumerates the six possible states and keeps the states consistent with the observations. When the surviving states agree, the claim is confirmed or refuted. When they disagree, both a supporting and a refuting state appear in the report. If all states are ruled out, the tool reports a conflict and an inclusion-minimal set of conflicting observations. The exit codes are 0 for a consistent report, 1 for a conflict and 2 for invalid input.

Adding consistent observations within the same scope can only remove possible states, so it preserves settled results. A change to workflow dependencies requires revisiting the model. A later public probe is a new snapshot.
