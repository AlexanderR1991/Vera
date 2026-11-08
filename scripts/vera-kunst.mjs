import {readFile} from "node:fs/promises";
import {artInquiry, artWorksheet} from "../src/lib/art-inquiry.mjs";

const [lang = "de", id, ...extra] = process.argv.slice(2);
const {works} = JSON.parse(await readFile(new URL("../public/knowledge/art-works.v1.json", import.meta.url), "utf8"));
const work = works.find(entry => entry.id === id);
if (!Object.hasOwn(artInquiry, lang) || extra.length || (id && id !== "--list" && !work)) {
  console.error("node scripts/vera-kunst.mjs [de|en] [--list|art-ID]");
  process.exitCode = 2;
} else if (id === "--list") {
  console.log(works.map(entry => entry.id + " · " + entry.title[lang]).join("\n"));
} else {
  console.log(artWorksheet(lang, work));
}
