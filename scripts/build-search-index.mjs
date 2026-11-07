import {readFile, mkdir, writeFile} from "node:fs/promises";
import {join} from "node:path";
import {buildSiteSearchIndex, extractMainText} from "../src/lib/site-search-index.mjs";

const dist = process.argv.includes("--dist");
const output = dist ? "dist" : "public";
for (const lang of ["de", "en"]) {
  const index = buildSiteSearchIndex(lang);
  if (dist) {
    for (const item of index.entries.filter(entry => entry.type === "page")) {
      const path = item.href.replace(/^\/Wirklich\//, "");
      try {
        const html = await readFile(join("dist", path, "index.html"), "utf8");
        const pageText = extractMainText(html);
        item.search += " " + pageText;
        if (pageText) item.description = pageText.slice(0, 210);
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
        throw new Error("Indexed page is not in the built site: " + path);
      }
    }
  }
  await mkdir(join(output, "search"), {recursive:true});
  await writeFile(join(output, "search", lang + ".json"), JSON.stringify(index), "utf8");
  console.log("Search index " + lang + ": " + index.entries.length + " entries (" + output + ")");
}
