import {readFile} from "node:fs/promises";
import {pathToFileURL} from "node:url";
import {validateQuestionAtlas} from "../src/lib/questions.mjs";
import {topics} from "../src/lib/tree.mjs";

const load = async name => JSON.parse(await readFile(new URL("../public/knowledge/"+name,import.meta.url),"utf8"));
export async function checkQuestions() {
 const [atlas, claims] = await Promise.all([load("questions.json"),load("claims.json")]);
 return validateQuestionAtlas(atlas,claims.claims,topics);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
 const errors = await checkQuestions();
 if (errors.length) {console.error(errors.join("\n"));process.exitCode=1;}
 else console.log("Question atlas: IDs, bilingual content, source links, claim references and relations validated (not a truth check).");
}
