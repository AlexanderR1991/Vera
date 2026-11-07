// Offline preview only: never publishes questions, discussions or issue comments.
import {readFile} from "node:fs/promises";
import {triageQuestionCandidates} from "../src/lib/questions.mjs";
const file = process.argv[2], lang = process.argv[3] === "en" ? "en" : "de";
if (!file) {console.error("Usage: npm run triage:questions -- ./draft-candidates.json [de|en]"); process.exitCode=2;}
else {
 try {
  const draft = JSON.parse(await readFile(file,"utf8"));
  const atlas = JSON.parse(await readFile(new URL("../public/knowledge/questions.json",import.meta.url),"utf8"));
  const review = triageQuestionCandidates(draft.candidates,atlas,lang);
  console.log(JSON.stringify({status:"suggestions_only_requires_human_review",language:lang,review},null,2));
 } catch(error) {console.error(error.message);process.exitCode=1;}
}
