import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildSupervisedExport, canonicalJson, sha256 } from "../data/learning-data.mjs";

const nonempty = value => typeof value === "string" && !!value.trim();
const pinned = value => typeof value === "string" && /^(?:[a-f0-9]{40}|[a-f0-9]{64}|sha256:[a-f0-9]{64})$/i.test(value);
const positive = value => typeof value === "number" && Number.isFinite(value) && value > 0;
const integer = value => Number.isSafeInteger(value) && value > 0;
export function validateTrainingConfig(config) {
  if (config?.schema_version !== 1 || config.kind !== "vera_training_plan" || config.method !== "lora_supervised_finetuning") throw new Error("Unsupported training plan schema or method");
  for (const field of ["base_model", "tokenizer", "objective", "hyperparameters", "compute", "data", "evaluation"]) if (!config[field] || typeof config[field] !== "object" || Array.isArray(config[field])) throw new Error(`Missing training config: ${field}`);
  if (config.objective.loss !== "next_token_cross_entropy" || config.objective.loss_on !== "assistant_tokens_only") throw new Error("The plan supports only assistant-token supervised cross-entropy");
  const hp = config.hyperparameters;
  if (!Number.isSafeInteger(hp.seed) || hp.seed < 0 || !positive(hp.epochs) || !positive(hp.learning_rate) || hp.learning_rate > 1 || !integer(hp.micro_batch_size) || !integer(hp.gradient_accumulation_steps) || !integer(hp.max_sequence_tokens) || !integer(hp.lora_rank) || !positive(hp.lora_alpha) || !Number.isFinite(hp.lora_dropout) || hp.lora_dropout < 0 || hp.lora_dropout >= 1) throw new Error("Invalid training hyperparameters");
  if (!integer(config.data.minimum_examples_per_split)) throw new Error("Invalid minimum_examples_per_split");
  if (!Array.isArray(config.expected_artifacts) || !config.expected_artifacts.length || config.expected_artifacts.some(name => !nonempty(name) || !/^[A-Za-z0-9_.-]+$/.test(name)) || new Set(config.expected_artifacts).size !== config.expected_artifacts.length) throw new Error("Invalid expected artifact names");
  if (!nonempty(config.evaluation.protocol)) throw new Error("An evaluation protocol reference is required");
  return config;
}

export function buildTrainingPlan(config, corpus) {
  validateTrainingConfig(config);
  // Development fixtures are never turned into readiness evidence, even if their
  // JSON flags are changed elsewhere. The data validator checks every record.
  const exported = buildSupervisedExport(corpus, { allowDevFixtures: true });
  const missing = [];
  const add = (code, detail) => missing.push({ code, detail });
  if (corpus.purpose !== "training") add("development_fixtures_only", "Synthetic development fixtures cannot establish model training or evaluation readiness.");
  for (const split of ["train", "validation", "test"]) if (exported.manifest.splits[split].examples < config.data.minimum_examples_per_split) add(`data_${split}`, `Need at least ${config.data.minimum_examples_per_split} eligible, human-accepted, permitted ${split} example(s). This is a structural minimum, not a claim of sufficient data.`);
  if (!nonempty(config.base_model.id)) add("base_model", "Select a base model; no model has been selected or downloaded.");
  if (!pinned(config.base_model.revision)) add("base_model_revision", "Pin a full 40/64-character hexadecimal base-model revision or sha256: digest; names and moving tags do not identify immutable weights.");
  if (!nonempty(config.base_model.license_review_reference)) add("model_license_review", "Record review of the selected model's allowed use and distribution.");
  if (!nonempty(config.tokenizer.id) || !pinned(config.tokenizer.revision)) add("tokenizer", "Select a compatible tokenizer and pin its full 40/64-character hexadecimal revision or sha256: digest.");
  if (!nonempty(config.compute.device) || !["float32", "float16", "bfloat16"].includes(config.compute.precision) || !positive(config.compute.memory_budget_gib) || !nonempty(config.compute.budget_reference)) add("compute", "Specify device, precision, measured memory budget and an accountable compute budget reference.");
  const manifestSha = sha256(exported.files["manifest.json"]);
  if (config.data.export_manifest_sha256 !== manifestSha) add("frozen_data_export", "Export and review the eligible dataset, then pin the exact manifest file SHA-256.");
  if (!nonempty(config.evaluation.baseline_report)) add("baseline_evaluation", "Run the unchanged base model on held-out tasks before comparing a trained adapter.");
  if (!nonempty(config.evaluation.independent_review_reference)) add("independent_evaluation", "Arrange independent reference answers and evaluation; a config string alone cannot verify this.");
  // This module is a working validator/export/plan, not an optimizer. A caller
  // cannot turn a readiness flag into a claim that GPU training has occurred.
  add("trainer_not_implemented", "A reviewed GPU training backend, tokenization/masking checks, adapter target-module selection, hardware smoke test and execution remain to be implemented. This command never trains.");
  return {
    schema_version: 1, kind: "vera_training_readiness", status: "blocked",
    training_performed: false, trainer_implemented: false, model_downloaded: false,
    config_sha256: sha256(canonicalJson(config)), corpus_sha256: exported.manifest.corpus_sha256,
    expected_export_manifest_sha256: manifestSha,
    counts: Object.fromEntries(Object.entries(exported.manifest.splits).map(([split, info]) => [split, info.examples])),
    missing, objective: config.objective, hyperparameters: config.hyperparameters,
    expected_artifacts: config.expected_artifacts,
    plan_only: true, declarations_are_not_authentication: true
  };
}

export function runTrainingPlanCli(args) {
  const options = { config: fileURLToPath(new URL("./config.v1.json", import.meta.url)), data: fileURLToPath(new URL("../data/corpus.v1.json", import.meta.url)), requireReady: false };
  const seen = new Set();
  while (args.length) {
    const flag = args.shift();
    if (seen.has(flag)) throw new Error(`Duplicate flag: ${flag}`);
    seen.add(flag);
    if (flag === "--require-ready") options.requireReady = true;
    else if (["--config", "--data"].includes(flag) && args[0] && !args[0].startsWith("--")) options[flag.slice(2)] = resolve(args.shift());
    else throw new Error(`Unknown or incomplete option: ${flag}`);
  }
  const report = buildTrainingPlan(JSON.parse(readFileSync(options.config, "utf8")), JSON.parse(readFileSync(options.data, "utf8")));
  return { report, exitCode: options.requireReady && report.missing.length ? 1 : 0 };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { const result = runTrainingPlanCli(process.argv.slice(2)); console.log(JSON.stringify(result.report, null, 2)); process.exitCode = result.exitCode; }
  catch (error) { console.error(error.message); process.exitCode = 2; }
}
