import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createOllamaAdapter } from "../runtime/ollama.mjs";
import { createPlan, assertPlanUnchanged, loadRunCases, runEvaluation, readReferenceForScoring, scoreRatings, createRunWriter, writePlan, writeReport, sha256 } from "./evaluation.mjs";
import { readOllamaIdentity, compareIdentitySnapshots } from "./model-identity.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const usage = "node evals/cli.mjs plan|preflight|run|score [--model name] [--model-digest sha256] [--split dev|holdout] [--manifest file] [--seed integer] [--plan-file file] [--run-file file] [--ratings file] [--review-key file] [--port integer] [--out work/evals/new-directory]";
const readJson = async file => JSON.parse(await readFile(file, "utf8"));
const json = value => JSON.stringify(value, null, 2) + "\n";

export function parseArguments(args) {
  const [command, ...rest] = args;
  if (!["plan", "preflight", "run", "score"].includes(command)) throw new Error(usage);
  const allowed = command === "plan" ? ["model", "model-digest", "split", "manifest", "seed", "out"]
    : command === "score" ? ["run-file", "ratings", "review-key", "out"] : ["plan-file", "port", "out"];
  const options = {};
  while (rest.length) {
    const flag = rest.shift();
    if (!flag?.startsWith("--")) throw new Error(usage);
    const key = flag.slice(2);
    if (!allowed.includes(key) || key in options || !rest[0] || rest[0].startsWith("--")) throw new Error(`Unknown, duplicate or incomplete option; ${usage}`);
    options[key] = rest.shift();
  }
  return { command, options };
}

export async function runCli(args) {
  const { command, options } = parseArguments(args);
  if (command === "plan") {
    const seed = options.seed === undefined ? 20261111 : Number(options.seed);
    const plan = await createPlan({ root, model: options.model ?? null, modelDigest: options["model-digest"] ?? null, seed,
      split: options.split ?? "dev", manifestFile: options.manifest ? path.resolve(options.manifest) : undefined });
    const location = options.out ? await writePlan(root, path.resolve(options.out), plan) : null;
    return { exitCode: 0, output: location ? { status: plan.status, directory: location, plan_sha256: sha256(plan), model_selected: !!plan.model.requested, efficacy_claim: false } : plan };
  }
  if (!options.out) throw new Error("An explicit new --out subdirectory of ignored work/evals/ is required");
  if (command === "score") {
    if (!options["run-file"] || !options.ratings) throw new Error("score requires --run-file and --ratings");
    const result = await readJson(options["run-file"]);
    const ratings = await readJson(options.ratings);
    const keyFile = options["review-key"] ?? path.join(path.dirname(options["run-file"]), "review-key.private.json");
    const report = scoreRatings({ result, ratings, reviewKey: await readJson(keyFile), reference: await readReferenceForScoring(result, root) });
    const directory = await writeReport(root, path.resolve(options.out), report);
    return { exitCode: 0, output: { directory, status: report.status, conclusion: report.conclusion, efficacy_claim: false } };
  }
  if (!options["plan-file"]) throw new Error(`${command} requires a previously frozen --plan-file`);
  const plan = await readJson(options["plan-file"]);
  await assertPlanUnchanged(plan, root);
  if (!plan.model.requested) throw new Error("Select a model in a new plan before inference; no model will be downloaded");
  const writer = await createRunWriter(root, path.resolve(options.out), plan);
  const port = options.port === undefined ? Number(process.env.VERA_OLLAMA_PORT ?? 11434) : Number(options.port);
  let result, stage = "adapter_configuration", caseAccessAttempted = false, casePackageValidated = false, inferenceAttempted = false;
  const startedAt = new Date().toISOString();
  const controller = new AbortController();
  const interrupt = () => controller.abort();
  process.once("SIGINT", interrupt);
  try {
    const adapter = createOllamaAdapter({ model: plan.model.requested, modelDigest: plan.model.operator_supplied_digest, port, options: plan.settings, timeoutMs: plan.budget.responseMs });
    // This gate precedes access to external cases. The bundled adapter currently
    // has no exact tokenizer/chat-template counter and therefore cannot run holdout.
    if (plan.split === "holdout" && typeof adapter.countInputTokens !== "function") throw new Error("Holdout gate: exact model/template input counter is not implemented by the bundled adapter");
    if (plan.split === "holdout" && !plan.model.operator_supplied_digest) throw new Error("Holdout gate: frozen model digest required");
    stage = "model_identity_preflight";
    const before = await readOllamaIdentity({ model: plan.model.requested, expectedDigest: plan.model.operator_supplied_digest, port });
    stage = "case_package_validation";
    caseAccessAttempted = true;
    const pack = await loadRunCases(plan, root);
    casePackageValidated = true;
    stage = "generation";
    inferenceAttempted = true;
    result = await runEvaluation({ plan, pack, adapter, preflightOnly: command === "preflight", signal: controller.signal,
      onProgress: progress => writer.checkpoint(progress) });
    try {
      const after = await readOllamaIdentity({ model: plan.model.requested, expectedDigest: plan.model.operator_supplied_digest, port });
      result.model_identity_checks = compareIdentitySnapshots(before, after);
      if (!result.model_identity_checks.stable) result.status = "model_changed_unscored";
    } catch (error) {
      result.model_identity_checks = { before, after: null, stable: false, error: String(error.message) };
      result.status = "model_identity_unverified_unscored";
    }
    stage = "result_persistence";
    await writer.finish(result);
  } catch (error) {
    const failure = { schema_version: 1, status: inferenceAttempted ? "failed_run_not_completed" : "blocked_before_inference", stage, case_access_attempted: caseAccessAttempted, case_package_validated: casePackageValidated, inference_attempted: inferenceAttempted, command, started_at: startedAt, completed_at: new Date().toISOString(), plan_sha256: sha256(plan), error: { name: error.name, message: String(error.message) }, efficacy_claim: false };
    await writeFile(path.join(writer.directory, "failure.json"), json(failure), { flag: "wx" });
    return { exitCode: 1, output: { ...failure, directory: writer.directory } };
  } finally {
    process.removeListener("SIGINT", interrupt);
  }
  const succeeded = result.status === "completed_unscored" || result.status === "preflight_passed_not_efficacy_evidence";
  return { exitCode: succeeded ? 0 : 1, output: { directory: writer.directory, status: result.status, completed_pairs: result.runs.length, efficacy_claim: false, note: "DEV never establishes efficacy; ratings are a separate human step." } };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { const result = await runCli(process.argv.slice(2)); console.log(json(result.output)); process.exitCode = result.exitCode; }
  catch (error) { console.error(error.message); process.exitCode = 2; }
}
