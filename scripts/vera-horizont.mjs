import { readFileSync } from "node:fs";
import { assessVeraHorizon } from "../src/lib/vera-horizont.mjs";

const usage = "Usage: node scripts/vera-horizont.mjs <scenario.json>";
const [path, ...extra] = process.argv.slice(2);

if (path === "--help" && extra.length === 0) {
  console.log(usage);
} else if (!path || path.startsWith("-") || extra.length > 0) {
  console.error(usage);
  process.exitCode = 2;
} else {
  try {
    const contents = readFileSync(path, "utf8");
    let input;
    try {
      input = JSON.parse(contents);
    } catch {
      throw new Error("Scenario file must contain valid JSON.");
    }
    const result = assessVeraHorizon(input);
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = result.status === "verified" ? 0 : 1;
  } catch (error) {
    console.error(`Vera horizon: ${error.message}`);
    process.exitCode = 2;
  }
}
