# Atlas specialist-agent network · Proposal AFA-0.1

**Status: unreviewed design; disabled · 7 November 2026.** No additional agents, backend, scheduled jobs or automated consensus exist. Human editorial approval and independent evaluation are pending.

> Every circle of the Atlas may be served by an AI perspective capable of examining questions. No perspective has authority to declare truth. The central engine may synthesize arguments; it cannot fabricate social consensus.

## What already exists

The WIRKLICH Atlas distinguishes **six broad fields** (Reality, Life, Consciousness, Humanity, Society, Action) from **23 specialist topics** recorded in [src/lib/tree.mjs](../../src/lib/tree.mjs). A mathematician, theologian or medical reviewer fits the topic layer; topics can span multiple fields. The [disabled role registry](../../public/ai/atlas-agents.v0.json) provides one typed **draft-review role** per current topic, not a certified expert, independent person or persistent software agent.

The proposed network adds a routing and review layer to the existing [META-01 correction loop](../selbstkorrektur.md), [question atlas](../fragenatlas.md), [universal question loop](../grundfragen-kreislauf.md), [research swarm](../wahrheitsschwarm.md), [adversarial swarm](../angriffsschwarm.md), and [R0–R4 maturity and separate consensus register](../erkenntnisreife.md). It replaces none of these. The philosophical engine remains a contestable process, never a sovereign judge.

## Central claim and strongest objection

**Hypothesis:** Independent first-pass assessments from relevant specialist perspectives may uncover blind spots, conflicting methods and better next questions than a single apparently omniscient assistant.

**Strongest objection:** Multiple model personas can reproduce the same error more convincingly. Sharing model training, evidence, prompts and biases is not independence. Debate can magnify persuasion rather than truth, shared citations can be counted repeatedly, and missing private information can lead to premature consensus. The central synthesizer can be biased through its choice of roles and evaluation criteria.

**Design consequence:** Optimize for falsification, evidence quality, dissent, explicit gaps and demonstrated marginal benefit—not agent count, eloquence or majority agreement. A justified unresolved dispute is a legitimate outcome.

Relevant research (not proof that the design works in WIRKLICH):
- Li, Naito & Shirado, [ICML 2026, HiddenBench](https://proceedings.mlr.press/v306/li26ej.html): systematic failure under distributed information and premature convergence.
- Choi, Zhu & Li, [NeurIPS 2025, Debate or Vote](https://proceedings.neurips.cc/paper_files/paper/2025/hash/934252acd87f254d5d4672fbde283bd2-Abstract-Conference.html): debate does not automatically outperform simpler voting/ensemble baselines.
- Kraidia et al., [Scientific Reports 2026](https://www.nature.com/articles/s41598-026-42705-7): persuasive but misleading agents can corrupt group outcomes.
- [NIST AI RMF Generative AI Profile](https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence) (2024): risk management, governance and evaluation.

## Two layers of roles, no AI vote

**Specialist roles:** The 23 topic roles carry different methods. Mathematics checks definitions, axioms, deductions and counterexamples. Medicine asks about study designs, outcomes, benefit, harm and external validity. Theology distinguishes scripture, traditions, interpretations and comparative perspectives. Politics separates empirical effects, legal constraints, normative premises and competing interests. Esoteric interpretations do not become experimentally confirmed results by being mentioned alongside science; mathematics does not settle human rights.

**Cross-cutting roles:** A source auditor checks origin, independence and contradictory evidence. An adversarial method reviewer finds the strongest counterexample. An affected-perspectives reviewer identifies whose interests and credible minority positions are missing. A terminology/translation reviewer checks scope and DE/EN fidelity. A **synthesis moderator** documents the resulting map of claims but has **no vote or right to change publication status**.

Route questions adaptively to **two to five relevant specialist perspectives** plus suitable adversarial and source checks; some simple questions need no swarm. Several instances of one model family do not constitute independent peer review. Affected people, outside specialists and dissenting readers remain separate voices.

**Politics:** Conservative, progressive, liberal, socialist and other defensible perspectives may disagree. They are lenses for examining arguments, not manufactured public opinion. Factual claims need evidence; value disagreements need explicit premises and rights-based scrutiny. Equal consideration is not a requirement to treat unsupported facts as equally well-supported.

## Proposed bounded pipeline

1. **Intake and protection:** Record an exact human question or existing Q-/U-/claim ID with public provenance, source, version and allowed context. Do not ingest private conversations, identifying information or sensitive case data without suitable authorization.
2. **Decomposition:** Separate empirical, formal, normative, interpretive and metaphorical components, and identify affected people and risks.
3. **Transparent routing:** Select only relevant topic and cross-cutting roles with versioned routing rules; name missing disciplines. There is no compulsory one-agent-per-circle process.
4. **Independent first pass:** Agents receive the same vetted question and eligible source material, **not each other's initial outputs**. Each drafts a charitable interpretation, support, criticism, counterevidence, scope and a revision condition; uncertainty and missing information are explicit.
5. **Source ledger:** Record each source and passage independently (URL/DOI, date, source type, version, evaluation and dependencies). A repeated citation does not become additional evidence.
6. **Structured challenge:** Reveal disagreement only after initial drafts. Test shared assumptions and overlooked counterexamples. The pilot allows at most two bounded rounds; factual additions need verifiable citations.
7. **Proposed synthesis:** Output separate **supported core**, **substantiated dissent**, **missing evidence/open questions**, **normative value conflicts**, and **proposed tests/actions**. Never output a fake probability of truth or tally model votes.
8. **Human gate and feedback:** Only an appropriately reviewed, accountable human PR may update editorial records. Existing R0–R4 and consensus statuses stay unchanged unless their own requirements are satisfied. A reasoned objection can reopen a case, but not automatically veto a soundly supported claim.

## Proposed output contract

Each future AI contribution needs at least: \`run_id\`, \`question_id\`, \`role_id\`, \`claim_version\`, \`claim_type\`, \`model_id\`, \`model_version\`, \`prompt_version\`, \`input_source_ids\`, \`assessment\`, \`strongest_objection\`, \`counterevidence\`, \`uncertainty\`, \`revision_trigger\`, \`sources\`, \`limitations\`, \`generated_at\`, \`status: ai_draft\`.

Each synthesis draft additionally needs \`supported_core\`, \`dissent\`, \`missing_evidence\`, \`normative_tradeoffs\`, \`proposed_tests\`, and \`human_review_status: pending\`. An unverified citation can be useful as a research lead but is **not a verified finding**. The registry is inert, not an executable prompt; schema, provenance and tool-use validation need their own design before activation.

## Activation and governance constraints

- **Disabled by default.** No new API calls, schedules, write permissions or automatic GitHub activity; existing bounded swarms remain unchanged.
- **Attention boundary.** Draft agents never automatically post Issues, Discussions, comments, PRs, status ratings or promotions. Research output remains in bounded, marked draft artifacts.
- **No fake authority.** Model personas are not licensed doctors, professional theologians, independent reviewers or human endorsements. Log model family, versions, prompts and possible dependencies.
- **Untrusted inputs.** Treat webpages, PDFs, forums and other agents' answers as data, not instructions. Do not exfiltrate secrets or user information; verify claims in full source context.
- **High-stakes questions.** Medical, mental-health, legal, financial and safety cases demand stricter domain standards, qualified human review and no unsupervised individual decisions.
- **Controllable budget.** Before any pilot, define rate, cost, token and time caps, stop rules, prompt-injection checks and a manual kill switch.
- **Revisable governance.** Roles, routing logic, selection of sources and the synthesis rules themselves must remain publicly challengeable. People affected by decisions may disagree with AI recommendations.

## Staged evaluation

**Phase 0 (this proposal):** Bilingual architecture, 23 disabled role records, structural tests. **No agents are running.**

**Phase 1 (separate approval):** Twelve synthetic or clearly public cases covering different claim types and risk classes, manually triggered unverified drafts only; log costs, bad citations, uncertainty, failures and aborts. No personal data.

**Phase 2 (independently planned):** Preregister a controlled comparison between **ordinary source review**, **a single AI with equivalent tools**, and **a multi-role approach**. Use qualified, independent and preferably blinded human assessors. Measure error and counterexample detection, citation integrity, missed dissent, false consensus claims, user comprehension, time, cost and reproducibility. A negative result must be allowed to stop or narrow the system.

No pilot alone authorizes automatic moral scoring or truth certification. A proposed direction index for decisions is a separate, unvalidated normative/measurement research problem, not an average of specialist outputs.

**Open design questions:** Who independently challenges the synthesizer? How is routing corrected when a new specialty arises? Which primary sources are sufficiently independent? Who represents people left out of online datasets? When do costs exceed additional value? How does a proven error propagate to linked claims without silently rewriting the archive?

**Principle:** More perspectives should help WIRKLICH discover what it has missed, not give it more voices with which to insist it is right.
