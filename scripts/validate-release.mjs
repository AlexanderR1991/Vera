import {readFile} from "node:fs/promises";

const readJSON = async path => JSON.parse(await readFile(new URL("../"+path,import.meta.url),"utf8"));
const project = await readJSON("public/project.json");
const pkg = await readJSON("package.json");
const lock = await readJSON("package-lock.json");
const history = await readFile(new URL("../docs/versionsgeschichte.md",import.meta.url),"utf8");
const errors = [];
if (project.schema_version !== 1 || project.name !== "Vera" || project.english_name !== "Vera") errors.push("Invalid public project identity");
if (!/^\d+\.\d+\.\d+$/.test(project.version) || pkg.version !== project.version) errors.push("Package and public project versions must match");
if (lock.version !== project.version || lock.packages?.[""]?.version !== project.version) errors.push("Dependency lock and project version must match");
if (!history.includes("## "+project.version+" ·")) errors.push("Release must have a version history entry");
if (!/^\d{4}-\d{2}-\d{2}$/.test(project.release_date) || Number.isNaN(Date.parse(project.release_date))) errors.push("Invalid release date");
for (const lang of ["de","en"]) {
  if (!project.subtitle?.[lang]?.trim() || !project.release_scope?.[lang]?.trim()) errors.push("Missing release description for "+lang);
}
if (errors.length) { console.error(errors.join("\n")); process.exitCode = 1; }
else console.log(`Validated ${project.name} ${project.version}: package, project profile and version history agree.`);
