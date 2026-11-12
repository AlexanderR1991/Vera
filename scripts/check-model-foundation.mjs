import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { validateCorpus, buildSupervisedExport } from "../data/learning-data.mjs";
import { buildTrainingPlan } from "../training/plan.mjs";
import { createPlan, validateCases, validateReferences, validateExternalManifest } from "../evals/evaluation.mjs";

// Offline contract check. Pending prerequisites are reported, never converted
// into a claim of training, measured performance or independent review.
const root = fileURLToPath(new URL("../", import.meta.url));
const readJson = async name => JSON.parse(await readFile(new URL(`../${name}`, import.meta.url), "utf8"));
try {
  const corpus = validateCorpus(await readJson("data/corpus.v1.json"));
  validateCorpus(await readJson("data/dev-fixtures.v1.json"));
  const exported = buildSupervisedExport(corpus);
  const cases = validateCases(await readJson("evals/cases/dev.v1.json"), "dev");
  validateReferences(await readJson("evals/references/dev.v1.json"), cases);
  const external = validateExternalManifest(await readJson("evals/holdout-manifest.v1.json"), { allowPending: true });
  const comparison = await createPlan({ root });
  const training = buildTrainingPlan(await readJson("training/config.v1.json"), corpus);
  console.log(JSON.stringify({
    contract_check: "passed", model_called: false, training_performed: false,
    data: { valid: true, purpose: corpus.purpose, eligible_examples: exported.manifest.counts.exported },
    evaluation: { development_cases: cases.cases.length, scheduled_pairs: comparison.schedule.length,
      responses_per_pair: comparison.budget.responsesPerCase, independent_cases: external.status,
      input_completeness: "requires_verified_model_token_counter_for_holdout", efficacy_result: null },
    training: { status: training.status, missing: training.missing.map(item => item.code) }
  }, null, 2));
} catch (error) {
  console.error(`Model foundation check: ${error.message}`);
  process.exitCode = 1;
}
