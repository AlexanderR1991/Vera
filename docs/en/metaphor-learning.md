# How Vera can learn from a metaphor

[Deutsch](../metaphern-lernen.md) · [Six cases from everyday life](metaphor-atlas.md)

A bridge takes you to the other bank. In a disagreement, I can stand there for a moment and see why things look different from the other person's side. A new question can reveal how well I have understood. Can I say how the other person would judge a particular case, and can they correct my account? We can still disagree.

**Working hypothesis.** A familiar image comes with expectations. “Bridge” draws attention to the banks, the crossing, who can use it and what weight it can bear. The new situation determines which of those relationships carry over. When a pattern recurs across several domains, it gives us a question worth asking. But stories can borrow from each other, and we may have picked only the examples that fit. Counting familiar shapes would overstate the number of independent observations.

## What Vera does with a new image

1. Record the original words and their context. What does the image let this person notice? When people speak about their own experience, they can correct an interpretation offered to them. A work of art can sustain several readings.
2. Describe the roles and their relationship in ordinary language. Which details can we leave behind? What other interpretation could explain the same observation?
3. If the metaphor suggests a factual claim, record its prediction **before** testing it. Pick a fresh case and a closely matched case in which one crucial relationship changes. If a judgment depends on values, record who chose the goal.
4. Compare the old and new answers. Record the error, the reason for the change, the outcome and the limit of the finding. Stating the same rule in literal language shows how much of the result the rule can account for on its own. Proposed changes to the project follow the existing [correction procedure](../selbstkorrektur.md).

## A learning experiment you can run

Two bus routes cross the same bridge. Would adding a second line to the map make the service resilient? In the model, each row describes one usable route and lists all the components it depends on. The start and destination stay available. The requirement is that at least one route works in normal operation and after any one component fails.

The [experiment](../../src/lib/metapher.mjs) starts with four possible rules. Any route will do. Two routes will do. Two routes must share no component that can fail. Or there must be at least one route, and no component may appear on every route. Each rule makes predictions fixed in advance. The program discards rules that conflict with a supplied observation. If the surviving rules disagree, it leaves the prediction open. If the observations contradict every rule, Vera reports the conflict.

Three constructed observations suffice to distinguish the four rules here. A single cable can fail. Two bus routes can lose the same bridge. In the third example, each of three routes uses a different pair of components drawn from A, B and C. No two routes are independent. Yet the system survives every single failure because the route that avoids the failed component stays open.

**Proof within the model.** If a component occurs on every route, its failure blocks them all. Conversely, if no such component exists, each component that can fail has at least one route that avoids it. Provided a route exists, this is exactly the required property. An incomplete map or several simultaneous failures change the question.

```sh
node scripts/vera-metapher.mjs
node --test tests/metapher.test.mjs
```

On six further cases designed for this exercise, the initially preferred rule, which accepts any available route, gets four right. A separate baseline requiring at least two routes also gets four right. Before seeing any observations, the four candidate rules unanimously decide two cases and leave four open. After the three observations, the surviving rule gets all six right and leaves none open. Giving the literal rule directly also gets six right. A separate simulation takes each component out of service in turn to establish the comparison answers. Removing the metaphorical descriptions from the training cases leaves the result unchanged. The lists of routes are supplied in this experiment. Whether Vera can identify the dependencies in free text still needs testing. The experiment shows how counterexamples can correct a choice among known rules. Any additional value of the metaphor in discovering or encoding the relationship remains an open question.

To evaluate your own cases, supply a JSON file with `node scripts/vera-metapher.mjs --input case.json`. Use `null` for an unknown observation. An empty outer array means there are no routes. An empty inner array describes a route that depends on no component that can fail.

```json
{
  "observations": [{"id":"Bus","routes":[["Bridge","North"],["Bridge","South"]],"observed":false}],
  "cases": [{"id":"Archive","routes":[["Paper"],["Drive"]]}]
}
```

## Testing the idea on Vera itself

We predicted that removing the source file for Vera's insight model would disable two ways of running or building the model from source. In an isolated copy of revision `e3cd587`, both the command-line tool and a fresh website build ran successfully. With `src/lib/erkenntnis.mjs` temporarily removed, both exited with code 1. The command-line tool reported a missing import in `scripts/vera-erkenntnis.mjs`, and Astro reported one in `src/components/VeraErkenntnis.astro`. After the file was restored, both exited with code 0. This observation covers a fresh build. Pages built earlier are a different case. [Command-line tool](../../scripts/vera-erkenntnis.mjs) · [Web component](../../src/components/VeraErkenntnis.astro)

To reproduce this in a disposable copy with dependencies installed, run `npm run predev` once. Then run both `node scripts/vera-erkenntnis.mjs` and `npx --no-install astro build` before moving the file, while it is absent and after restoring it.

## How to recognise a broader learning gain

Before the next trial, independent contributors prepare fresh target tasks and closely matched counterexamples with similar wording. They set the scoring criteria and withhold the tasks until evaluation. With the same model version, time allowance and access to facts, compare answers under three conditions. The first gets no new guidance, the second the literal rule, and the third the rule plus the metaphor. Reviewers who do not know which condition produced each answer score successful transfers, mistaken transfers and justified decisions to leave a question open separately. Report effort and improvements per task. If the literal rule achieves the same result with less effort, it suffices for that task. For an interpretation of personal experience, the speaker's own response is the appropriate check.

## What research contributes

- In negotiation tasks, more participants recognised the common principle when they compared two examples. In this study, the direct comparison of later application narrowly missed the conventional five per cent threshold for statistical significance. Naming a rule and applying it in a new situation are different achievements. [Loewenstein, Thompson & Gentner, 2003](https://doi.org/10.5465/amle.2003.9901663)
- In experiments, describing crime as a beast or a virus influenced which policy response participants favoured. Four follow-up experiments with modified controls did not find that effect. A plain-language control and a competing image can help reveal such limits. [Thibodeau & Boroditsky, 2013](https://doi.org/10.1371/journal.pone.0052961) · [Steen, Reijnierse & Burgers, 2014](https://doi.org/10.1371/journal.pone.0113536)
- In forum posts by people with cancer, both journey and battle metaphors could express a sense of agency or of powerlessness. Meaning depended on who used an image and how. The study examined language use. [Semino et al.](https://doi.org/10.1136/bmjspcare-2014-000785)
