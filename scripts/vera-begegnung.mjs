import { readFile } from "node:fs/promises";
import { inspectEncounter, encounterKey } from "../src/lib/vera-encounter.mjs";

const args = process.argv.slice(2);
if (args.length === 1 && args[0] === "--help") {
  console.log("Usage: node scripts/vera-begegnung.mjs [de|en]");
} else if (args.length > 1 || (args.length && !["de", "en"].includes(args[0]))) {
  console.error("Usage: node scripts/vera-begegnung.mjs [de|en]");
  process.exitCode = 2;
} else {
  const lang = args[0] ?? "de";
  const base = JSON.parse(await readFile(new URL("../docs/examples/vera-encounter.json", import.meta.url), "utf8"));
  const stages = [];
  const add = (id, de, en, input) => stages.push({ id, label: lang === "de" ? de : en, input, report: inspectEncounter(input) });
  add("understood-dissent", "Genau wiedergegeben, trotzdem uneinig", "Accurate restatement with disagreement", base);
  const echo = structuredClone(base);
  echo.evidence.push({ ...echo.evidence[0], id: "copy", source_id: "fictional-copy" });
  add("source-echo", "Zwei Meldungen, eine deklarierte Herkunft", "Two reports, one declared origin", echo);
  const challenged = structuredClone(echo);
  challenged.evidence.push({
    id: "step-observation", claim_key: encounterKey(base.claim), source_id: "fictional-visit",
    dependency_group_id: "visit-origin", origin: "editorial", polarity: "challenges"
  });
  add("counterevidence", "Eine Stufe widerspricht der Ankündigung", "A step contradicts the notice", challenged);
  const revised = structuredClone(challenged);
  revised.claim = { ...base.claim, version: "2", wording: "Der Zugang zu Raum Nord ist ungeklärt." };
  revised.revision = {
    changed_id: base.claim.id,
    graph: {
      nodes: ["room-access", "visit-plan", "invitation", "similar-room"],
      edges: [
        { from: "room-access", to: "visit-plan", type: "depends_on" },
        { from: "visit-plan", to: "invitation", type: "depends_on" },
        { from: "room-access", to: "similar-room", type: "analogous_to" }
      ]
    }
  };
  revised.agreement.feasibility = "unknown";
  add("revision", "Neue Aussage: alte Belegzuordnungen prüfen", "New claim: reassess old evidence mappings", revised);
  const accepted = structuredClone(base);
  accepted.agreement.responses.forEach(response => { response.stance = "yes"; });
  add("exact-agreement", "Im Beispiel tragen beide diese Fassung mit", "Both fixture roles accept this exact wording", accepted);
  const rewritten = structuredClone(accepted);
  // Deliberately keep version "1": a wording change must still invalidate old replies.
  rewritten.proposal.wording = "Wir buchen Raum Nord für ein Jahr.";
  add("changed-invitation", "Anderer Vorschlag braucht neue Antworten", "A changed proposal needs fresh replies", rewritten);
  add("pause", "Pause: keine weitere Auswertung", "Pause: no further evaluation", { kind: "synthetic", participation: "paused" });
  add("stop", "Stopp: keine weitere Auswertung", "Stop: no further evaluation", { kind: "synthetic", participation: "stopped" });
  console.log(JSON.stringify({
    kind: "synthetic_demonstration",
    note: lang === "de"
      ? "Erfundene Eingaben. Kein Gedankenlesen, keine echte Einwilligung, keine automatische Veröffentlichung. Die Stufen sind konstruierte Momentaufnahmen, keine beobachtete Lerngeschichte."
      : "Fictional inputs. No mind reading, real consent or automatic publication. Stages are constructed snapshots, not an observed learning history.",
    // Fixture wording remains German; field names and enum values are stable in both modes.
    stages
  }, null, 2));
}
