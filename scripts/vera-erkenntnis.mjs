import { assessErkenntnis, tests } from "../src/lib/erkenntnis.mjs";

const args = process.argv.slice(2);
const usage = `Usage: node scripts/vera-erkenntnis.mjs [${tests.join("|")}=yes|no ...]`;

if (args.length === 1 && args[0] === "--help") {
  console.log(usage);
} else {
  try {
    const observations = args.map((arg) => {
      const [test, value, ...rest] = arg.split("=");
      if (rest.length || !tests.includes(test) || !["yes", "no"].includes(value)) {
        throw new Error(`Invalid observation: ${arg}`);
      }
      return { test, value: value === "yes" };
    });
    const report = assessErkenntnis(observations);
    console.log(JSON.stringify({ observations, ...report }, null, 2));
    if (report.status === "conflict") process.exitCode = 1;
  } catch (error) {
    console.error(`${error.message}\n${usage}`);
    process.exitCode = 2;
  }
}
