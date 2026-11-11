import {readFile} from "node:fs/promises";
import {analyzeRepositoryQuorum} from "../src/lib/repository-quorum.mjs";

const language = process.argv[2] ?? "de";
if (!["de", "en"].includes(language) || process.argv.length > 3) {
  console.error("Usage: node scripts/probe-repository-quorum.mjs [de|en]");
  process.exitCode = 2;
} else {
  const protocol = JSON.parse(await readFile(new URL("../public/protocol/repository-conflicts.v0.json", import.meta.url), "utf8"));
  const en = language === "en";
  const label = value => value ? (en ? "yes" : "ja") : (en ? "no" : "nein");
  console.log(en ? "Local quorum countercheck — threshold analysis only" : "Lokale Quorumsgegenprobe — ausschließlich Schwellenanalyse");
  console.log(protocol.quorum_model.limitations[language]);
  for (const example of protocol.quorum_model.examples) {
    const result = analyzeRepositoryQuorum(example);
    console.log(`\nn=${result.n}, f=${result.f}, q=${result.q}`);
    console.log(`${en ? "Faulty participants alone cannot approve" : "Fehlerhaft Handelnde können nicht allein freigeben"}: ${label(result.faultyAloneCannotApprove)}`);
    console.log(`${en ? "All others can approve without them" : "Alle übrigen können ohne sie freigeben"}: ${label(result.othersCanApproveWithoutFaulty)}`);
    console.log(`${en ? "Every pair of quorums shares a nonfaulty participant" : "Jedes Paar von Freigabegruppen teilt eine nichtfehlerhafte Person"}: ${label(result.quorumsMustShareNonfaulty)}`);
    console.log(`${en ? "Minimum nonfaulty intersection" : "Kleinste nichtfehlerhafte Schnittmenge"}: ${result.minimumNonfaultyIntersection}`);
  }
  console.log(en
    ? "\nSynthetic counterexample for 3/1/2: {A,X} and {B,X} can endorse conflicting proposals. Their only common participant X may be faulty."
    : "\nErfundener Gegenfall für 3/1/2: {A,X} und {B,X} können widersprüchliche Vorschläge unterstützen. Ihre einzige gemeinsame Person X kann fehlerhaft handeln.");
  console.log(en
    ? "Even the 4/1/3 bounds do not constitute a complete consensus protocol or verify human consent."
    : "Auch die Grenzen für 4/1/3 bilden kein vollständiges Konsensprotokoll und prüfen keine menschliche Einwilligung.");
}
