# Vera · Wiederherstellungsprobe / Recovery drill

Vera soll aus Fehlern lernen können. Dafür müssen wir einen bekannten Projektstand wiederherstellen und belegen können, welcher Stand zurückkam. Dieses lokale Werkzeug erprobt einen Teil des Schutzprinzips [ERHALT-01](https://github.com/AlexanderR1991/Vera/pull/88). Das Schutzprinzip steht zur menschlichen Prüfung.

## Einen Stand prüfen

Führe im ausgecheckten Vera-Repository mit Node.js und Git den passenden Befehl aus.

| Befehl | Was du erfährst |
| --- | --- |
| `node scripts/vera-preserve.mjs inspect` | `revision` nennt den aktuellen Commit. `shallow` zeigt, ob Git nur einen Ausschnitt der Historie vorliegen hat. `dirty` zeigt, ob Git lokale Änderungen oder unversionierte Dateien meldet. |
| `node scripts/vera-preserve.mjs drill` | Der Befehl packt den aktuellen Commit samt erreichbarer Git-Historie in eine temporäre Datei und klont sie lokal in ein leeres Verzeichnis. Er meldet Erfolg, wenn der wiederhergestellte Commit exakt übereinstimmt und `git fsck` die Git-Objekte erfolgreich geprüft hat. |

Die Probe läuft ohne Netzwerk und entfernt ihre temporären Dateien beim regulären Ende. `dirty: false` sagt nichts über fehlende Git-Objekte aus. Der Bericht gilt für `HEAD` und seine Historie. Lokale Entwürfe, weitere Branches, Tags, externe Submodule und Git-LFS-Inhalte sowie GitHub-Issues, Einstellungen und Deployments sind separat zu berücksichtigen. Build und Laufzeittests prüfen, ob Vera aus dem Stand gebaut und betrieben werden kann. Ob eine unabhängig aufbewahrte Sicherung verfügbar ist, bleibt offen.

## Erste Beobachtung und nächster Schritt

Der Vera-Commit [`1001c9604e5b`](https://github.com/AlexanderR1991/Vera/commit/1001c9604e5b3df7d4d95325436e7181790f5164) ließ sich in der lokalen Probe aus einer vollständigen Historie mit identischer Commit-ID wiederherstellen. Im Test mit demselben Commit und `--depth=1` war `HEAD` sichtbar, die Wiederherstellungsprobe lehnte den unvollständigen Checkout ab. **Aus der Commit-ID allein lässt sich die Wiederherstellbarkeit der Historie nicht ableiten.** Bei `shallow: true` ist der nächste Prüfschritt, die Probe aus einem vollständigen Checkout zu wiederholen.

Halte nach einer Probe den Commit, den Umfang, das Ergebnis und den nächsten Prüfschritt fest. Bei einem Fehler bleibt der Befund offen, bis eine Gegenprobe die Korrektur bestätigt. Der [META-01-Regelkreis](selbstkorrektur.md) bestimmt, wie wir diese Gründe für spätere Entscheidungen festhalten. Nur öffentliche Projektdaten gehören in einen Pull Request. Der [Entwurf für das Projektgedächtnis](https://github.com/AlexanderR1991/Vera/pull/100) sieht einen Platz für solche Befunde vor.

## English

Vera should be able to learn from errors. That requires recovering a known project revision and showing exactly what was recovered. This local tool exercises part of the proposed [ERHALT-01 preservation principle](https://github.com/AlexanderR1991/Vera/pull/88), which is pending human review.

Run these commands inside the Vera checkout with Node.js and Git.

| Command | What it tells you |
| --- | --- |
| `node scripts/vera-preserve.mjs inspect` | `revision` identifies the current commit. `shallow` tells you whether Git has only a slice of the history. `dirty` reports whether Git sees local changes or untracked files. |
| `node scripts/vera-preserve.mjs drill` | The command bundles the current commit and its reachable Git history into a temporary file, then clones it into an empty directory. It reports success when the recovered commit matches exactly and `git fsck` passes on the restored Git objects. |

The drill runs offline and removes its temporary files on normal exit. `dirty: false` says nothing about missing Git objects. The report covers `HEAD` and its history. Local drafts, other branches, tags, external submodules and Git LFS content, and GitHub issues, settings and deployments require separate consideration. Build and runtime tests separately assess whether Vera can run from that revision. The availability of an independently retained backup remains open.

Vera commit [`1001c9604e5b`](https://github.com/AlexanderR1991/Vera/commit/1001c9604e5b3df7d4d95325436e7181790f5164) was recovered locally from a checkout with full history, with the same commit ID. A `--depth=1` checkout of the same commit still had a visible `HEAD`, but the drill declined to verify the incomplete checkout. **A commit ID alone does not establish that its history can be recovered.** If `shallow: true`, repeat the drill from a full checkout.

Record the commit, scope, outcome and next check. After a failure, keep the result open until a repeat test confirms the correction. Follow [META-01](selbstkorrektur.md#english) to preserve the evidence for later decisions. Keep pull requests limited to public project data. The [draft project memory](https://github.com/AlexanderR1991/Vera/pull/100) is designed to retain findings of this kind.
