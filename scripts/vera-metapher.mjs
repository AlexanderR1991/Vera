import { readFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import { demoMetaphor, learnMetaphor } from "../src/lib/metapher.mjs";

const usage = "Usage: node scripts/vera-metapher.mjs [--input cases.json]";
try {
  const { values } = parseArgs({ options: { input: { type: "string" }, help: { type: "boolean" } } });
  if (values.help) {
    console.log(usage);
  } else if (values.input !== undefined) {
    const { observations, cases } = JSON.parse(await readFile(values.input, "utf8"));
    console.log(JSON.stringify(learnMetaphor(observations, cases), null, 2));
  } else {
    console.log(JSON.stringify(demoMetaphor(), null, 2));
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
