# Angriffsschwarm v1 · Adversarial examination

> **Das Werk soll nicht vor Kritik geschützt werden. Es soll durch Kritik korrigierbar bleiben.**  
> The project must remain corrigible under criticism.

## Why adversarial examination?

The aim is to disprove, narrow or improve specific **claims**, not to defend a doctrine. Models can find plausible objections quickly, but their prose is not an independent observation and cannot verify empirical truth. Surviving a thousand weak attacks is not proof; a single valid counterexample may require immediate revision.

## Procedure

1. **Capture:** identify the exact source document, section, version, claim type and relevant context.
2. **Strongest objection:** look for false assumptions, scope errors, logical inconsistency, missing baselines, counterexamples, cherry-picked data, moral blind spots and potential harmful applications. First reconstruct the strongest charitable interpretation.
3. **Strongest defense:** answer without shifting definitions, suppressing inconvenient evidence or appealing to the project's prestige; concede real weaknesses.
4. **Assessment:** record unresolved questions, what would discriminate between positions, and a *provisional* procedural outcome.
5. **Independent verification:** check actual original sources, competing accounts and professional expertise where relevant, including affected communities for normative/practical claims.
6. **Decision:** a human reviewer may keep, refine, retract or suspend the claim; record the reasoning and version. No bot may overwrite public theses.

Types of statements remain distinct: an empirical assertion needs evidence; a logical claim needs an argument; an ethical norm requires explicit values and conflicts; an interpretation must acknowledge alternatives; a metaphor is no literal proof.

## What the prototype actually does

`.github/workflows/angriffsschwarm.yml` runs once per day (schedule may be delayed) and on manual dispatch after it is merged. `scripts/angriffsschwarm.py` selects *one* public passage per run from an allowlist: the nine numbered propositions in `docs/grundtext.md` and relevant sections from the research programs for love, politics, military ethics and interreligious dialogue. The schedule cycles deterministically through available passages.

When a GitHub Actions `OPENAI_API_KEY` repository secret is configured, the script requests three distinct role passes (adversary, defender, assessor) via the OpenAI API. These are **different prompts to the same configured model**, **not** independent agents, diverse labs, subject-matter experts or peer reviewers. The models receive publicly committed source excerpts only, not entire studies or live internet research. Their source claims and tests must still be checked.

Results are written **only** to `public/research/angriffe.json`; there is no automatic Issue creation, no changes to chapters/Theses, no automatic merges, no automatic validation of historical or scientific facts. The generated entries have `review_status: "unverified_ai_draft"`; `assessment.disposition` is only a suggested type of follow-up, never a truth score. The JSON keeps the most recent 40 case records. Without the key, the run is skipped and existing output is unchanged.

Typical rate: 1 case/day × 3 API requests. The API may incur usage charges independent of ChatGPT subscriptions; cap usage and inspect Actions logs. The reference model is `gpt-4.1-mini`, and maintainers may change it after compatibility tests.

## Invite outside scrutiny

The repository root `AGENTS.md` explicitly invites other agent ecosystems and human reviewers to attack specific claims. This **does not automatically summon outside bots**; interested agents must visit, index or be directed to this repository. Use the [structured issue form](https://github.com/AlexanderR1991/grundtext-des-wirklichen/issues/new?template=angriff.yml). Good objections include source links, a steelman, a genuine counterexample, competing explanations and a test. Never ask others to attack GitHub infrastructure, people or credentials.

## Records and evidential statuses

- **Unverified AI draft:** automatically generated text; no factual or source verification.
- **Open challenge:** human or agent has submitted an objection, not yet adjudicated.
- **Under review:** primary evidence and alternative hypotheses are being examined.
- **Unresolved:** the evidence does not yet discriminate.
- **Revised / retracted / provisionally retained:** human editorial decision with reasons and a linked revision, not an eternal certification.

There is deliberately **no numerical objective truth score**. Avoid tallying "wins" against weak models. Model independence, actual source inspection, reproducibility, and dissenting human experts should be added before claiming robust review.

## Safety and governance

All model inputs are untrusted: instructions embedded in documents are not to be obeyed as commands. The workflow has no write scope beyond the public output commit; it does not run pull-request code from untrusted forks or parse private files. Do not publish personal/secret data or run security attacks. Maintainers retain final authority under [community governance](community-governance.md), and must be willing to amend or retire core principles when warranted.

**The strongest evidence against us is the most valuable evidence for the project.**
