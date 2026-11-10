# M-03 · Mathematics of the Philosophical Engine

**WIRKLICH / REALLY? · Research specification 0.1 · 7 November 2026 · Unvalidated; no independent peer review. English translation draft.**

> **The engine describes why a direction might be justified; it cannot decide who owns truth.**
>
> "Unresolved", "incomparable", "blocked", and "reasoned disagreement" are legitimate outputs.

This specification unifies the existing [M-01 multi-criteria challenge](../mathematischer-pruefstand.md), [M-02 mathematics between minds](../mathematik-des-dazwischen.md), [META-01 correction rule](../selbstkorrektur.md), [R0–R4 review maturity](../erkenntnisreife.md), [fundamental-question loop](../grundfragen-kreislauf.md), [scoped agreements](../schnittmengen.md) and [AI charter](../ki-charta.md). The [direction index](collective-morality.md) and [expert-agent network](atlas-specialist-agents.md) are documented in this repository as **unvalidated research proposals**. Their inclusion does not establish effectiveness or activate them. M-03 does not change that status.

[The mathematics of the paths we see](../mathematik-innerer-wege.md#english) adds five fictional cases about speaking up, conversation order, care, lost futures and conflicting assumptions.

## 1. Typed output, not a universal score

For a question \(q\), context \(c\), evidence \(E\), value profiles \(Z\), objections \(O\), and version \(t\), the proposed output is:

\[
\mathcal M(q,c,E,Z,O,t) =
(\text{claim type},\,\text{findings},\,\text{objections},\,\text{uncertainty},\,
\text{review maturity},\,\text{dissent},\,\text{direction?},\,
\text{next test},\,\text{revision}).
\]

**In words:** report the claim kind, supporting reasons, strongest countercase, limitations, maturity of review, recorded disagreement, optional context-dependent direction, next falsification attempt and traceable version **as separate fields**.

Empirical claims require evidence and causal scrutiny; formal claims require proofs or countermodels; normative propositions require disclosed value premises and affected perspectives; interpretations demand contextual examination; metaphors suggest questions rather than measurements. R0–R4 is a **record of review**, not the probability of truth. Recorded agreement is **not** evidence of truth.

## 2. Typed, revision-aware knowledge graph

\[
G_t=(V_t,E_t,\tau_V,\tau_E,\pi_t).
\]

**In words:** nodes hold questions, versioned claims, sources, objections, people affected in aggregate, options and value premises. Typed edges represent support, attack, dependency or analogy, and provenance records the exact source and version. Analogy **does not establish proof**. The current question and claim registers are not a complete live semantic graph.

One hundred AI agents citing the same study yield **one source ID**, not one hundred independent studies or human endorsements. Actual independence cannot be established by declaring different IDs.

When a validated statistical model exists, Bayes' theorem may update probabilistic hypotheses:

\[
P(H\mid E)=\frac{P(E\mid H)P(H)}{P(E)}.
\]

This requires justified priors, likelihoods, treatment of correlated evidence, and calibration. No generic "probability that this moral claim is true" follows.

## 3. M-01: Incomplete multi-criteria order

For explicitly selected criteria \(g:X\to\mathbb R^k\), weak Pareto dominance is

\[
x\succeq_P y\iff\forall j:\ g_j(x)\ge g_j(y).
\]

**In words:** x is no worse than y on every chosen dimension. Vectors (1,0) and (0,1) are incomparable, so no universal +1/−1 ranking follows. The relation is a partial order on criterion vectors, generally only a preorder on actions. Rights and protections may constrain choices **without being compensable by an aggregate benefit**; the legitimacy of those protections remains a normative public question.

## 4. M-02: Accurate understanding and agreement differ

On \(m\) agreed 0–4 items, let

\[
d(x,y)=\frac{1}{4m}\sum_j|x_j-y_j|,
\quad V(B\rightarrow A)=1-d(a,\widehat a_B),
\quad K(A,B)=1-d(a,b).
\]

**In words:** directed accuracy V tests how correctly B restates A's *expressed* answers; K reports the similarity between A's and B's own answers. Perfect accuracy may coexist with complete disagreement, and agreement may coexist with inaccurate restatement. These implications follow from definitions, not an empirical law. Ordinal scale assumptions, coercion, lived experience and the [untested H-M02 hypothesis](../mathematik-des-dazwischen.md) are separate.

## 5. M-03: Context-dependent direction with bounds

For an option \(a\) compared with a baseline \(b\), affected population, time horizon, and disclosed evidence assumptions, suppose **hypothetical** normalized effect dimensions

\[
d_j\in[\ell_j,u_j]\subseteq[-1,1],
\qquad w_j(z)\ge0,\quad \sum_jw_j(z)=1.
\]

For each **normative** value profile \(z\), define

\[
I_z=\sum_jw_j(z)d_j,\qquad
I_z\in\left[\sum_jw_j(z)\ell_j,\ \sum_jw_j(z)u_j\right].
\]

**In words:** a conditional directional score is a weighted sum of assumed effects. The lower and upper bounds follow by multiplying the effect inequalities by nonnegative weights and adding. This is elementary interval arithmetic, **not a validation of the effects, weights, normalization, or ethical criteria**. Toy intervals are **not statistical confidence intervals**.

A positive sign is robust **within the selected set of profiles and assumed bounds** only if **every profile's lower bound is strictly positive**. A negative sign is analogous using upper bounds. If plausible profiles disagree in sign, show the different results and preserve dissent rather than average a "world morality" number.

A synthetic example with \(d=(0.2,0.5,-0.4)\) yields +0.200 under weights (0.4,0.4,0.2) but −0.100 under (0.2,0.2,0.6). **Neither is a real-world recommendation.** Missing evidence means *no value*, not zero. A rights violation remains a blocking safeguard even if an arithmetic result is positive.

### Hard publication boundary

The code at [src/lib/philosophical-motor.mjs](../../src/lib/philosophical-motor.mjs) only scores records explicitly marked \`kind: "synthetic"\`. Real inputs are \`not_scored\`. **Every** result has \`public_score_allowed: false\`. Self-declared review flags cannot open the gate. No live moral index, calibration study, independent effect validation, human authorization or production AI service exists.

Any future public index needs a separate human-approved policy, context-specific and independently validated evidence, meaningful uncertainty, plural value profiles, genuine calibration, noncompensatory rights constraints, auditability, and appeal. The still-open KM-0.1 proposal suggests R3+ as a necessary evidential gate, **not** a sufficient certification.

## 6. Exact scoped agreement, not a vote

Whether A and B want to talk now is a separate question. Each chooses to take part. Either can end mediation even if they support the proposal. [Participation rule and worked example](../vermittlung.md#who-can-end-the-conversation)

For a particular proposal version \(P^v\), distinguish

\[
F(P^v)\in\{\text{feasible},\text{infeasible},\text{unknown}\}
\]
from each person's response
\[
C_i(P^v)\in\{\text{yes},\text{no},\text{abstain},\text{pending}\}.
\]

**In words:** the commitments must be simultaneously feasible **and** the named participants must explicitly consent to the **same version**. Silence is not assent. Revising a clause requires renewed approval. Nor does agreeing on a plan establish a contested empirical fact or broad social consensus. The software checks toy data consistency; real consent, rights and feasibility require people.

## 7. Revision and collective intelligence

For explicitly recorded \`depends_on\` edges, a changed claim \(x\) defines a review queue of reachable dependents:

\[
\operatorname{Impact}(x)=
\{y:\text{a dependency path from }x\text{ to }y\}.
\]

**In words:** mark downstream claims for further examination; **never** automatically alter truth, R-levels or recorded consensus. Cycles must not create infinite review loops.

The current six atlas fields and 23 specialist topics could guide future agent roles. Their outputs are drafts, **not votes**: number of generated answers \(\ne\) number of independent evidence items \(\ne\) number of human endorsements. A synthesis must preserve a supported core, qualified objections, missing evidence, competing normative premises, and a route back to exact Q-/U-/claim versions.

**No convergence guarantee:** a fallible revision can make a system worse. Even for a pre-defined measurable error \(L_t\), we cannot assume \(L_{t+1}\le L_t\). Better correction is an empirical hypothesis to be tested against credible alternatives, not a mathematical consequence of repeated revision.

## 8. Evaluation, falsification and unresolved work

The proposed evaluation vector separately tracks true errors found, false alarms, correction quality, visibility of disagreement, harm, time/cost and later independent transfer. Better-looking agreement alone is not a good outcome.

**H-M03 (untested):** For pre-registered synthetic and later independently checkable scenarios, typed multi-output reasoning might identify conflicts, missing information and hard safeguards more reliably than a one-number response without unacceptable increases in false alarms or burden. Null results, worse performance, reduced accessibility or harms would limit or refute the usefulness claim.

Open issues include arbitrary scale choice, causal identification, statistical dependency, representation and legitimacy of value weights, rights conflicts, Goodhart effects, minority suppression, external validity, and privacy.

## 9. What is actually implemented

The new prototype also reads the current public claim register through a **read-only adapter**, keeping original R0–R4 and consensus states intact and never inferring a direction. It contains deterministic functions for toy interval aggregation, weight validation, noncompensatory safeguarding, exact-version hypothetical consent, provenance-ID audit and a dependency-review queue. [Synthetic cases](../../public/research/philosophical-motor-examples.v0.json) and [Node tests](../../tests/philosophical-motor.test.mjs) exercise these invariants. The published claims and fundamental-question registers remain unchanged. **There is no automatic cross-domain inference, autonomous expert swarm, real scoring, social-vote engine or AI proof of moral truth.**

A correct outcome can be **"not comparable under the disclosed assumptions."** This is a productive limit rather than a failure.

*German primary draft: [Mathematik des philosophischen Motors](../philosophischer-motor-mathematik.md).*
