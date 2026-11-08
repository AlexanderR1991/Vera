# OPEN-01 · Why WIRKLICH must remain open source

> **The interests WIRKLICH seeks to serve are those of humanity—not the advantage of any single owner, company, state or AI system.**

**Status:** A public, contestable editorial commitment. This is a normative aspiration, not a claim that the project has a mandate to represent humanity or already has independent, representative governance. **Translation status: machine-assisted draft; not independently reviewed.** [German source](../offenheit.md).

## Why openness is part of the mission

WIRKLICH aims to help people examine questions whose answers may affect others. A system that offers reasoning, objections and perhaps future directional assessments can itself shape judgments. **A tool that influences judgment must make its own workings open to scrutiny.** Otherwise it would claim the interpretive authority it is meant to question.

Open source is therefore not just a development strategy. It is a **condition for public corrigibility**:

1. **Inspectability:** People should be able to trace claims, sources, assumptions, interests and rules behind an output, including uncertainty and unresolved disagreement.
2. **Correctability:** Errors can be challenged, reasoned about and corrected in a visible version history. Substantive objections matter more than popularity.
3. **Resistance to capture:** Funding, editorial decisions, conflicts of interest and changes to standards should be visible. Money, influence and headcounts must not silently become proof.
4. **Ability to continue independently:** Where rights allow, people should be able to read, use, check, improve and independently carry forward the published core. Forking provides a safeguard even against the original maintainers.
5. **Participation:** Affected people and neglected perspectives need real ways to object. GitHub accounts, technical vocabulary and incomplete translations are current barriers to be reduced.

## Open source—looking forward

> **We open up more than today's work. We open up the possibility that others may go further than we do tomorrow.**

WIRKLICH is not meant to become a finished worldview or the only platform for “correct” answers. **Future openness** means that new evidence, questions, overlooked experiences, different methods and future AI systems may change the project—even when they overturn our own proposals. Established work remains traceable; novelty alone is not evidence of progress.

This commitment leads to testable design goals:

1. **Open, versioned formats rather than platform lock-in:** Claims, objections, sources, review states and revisions should be exportable in documented, machine-readable formats and, where validated, usable by independent tools.
2. **Documented interfaces rather than vendor dependence:** Future APIs, protocols and AI integrations should be documented, versioned and, wherever feasible, usable without an exclusive model or platform provider. Participation without AI must remain possible.
3. **Extensibility without a monopoly on truth:** Disciplines, languages and independent implementations may add their own review methods while preserving visible claim types, uncertainty, human rights, accountability and dissent.
4. **Forking and interoperability:** Independent continuation is possible within licensing and rights constraints. Divergences should be identifiable, and future technical comparison possible without forcing substantive agreement.
5. **Progress must earn its name:** New automation or a directional index gains no authority from scale, speed or the label “open source”. Errors, dependencies, harms and benefits over simpler methods need evaluation before wide deployment.

**Testable future milestone (not yet met):** An external team should be able to build a compatible application from a published, versioned protocol specification and test cases, and export and re-import a sample dataset—without access to private services or permission from the original editors. Technical compatibility emphatically **does not** require independent implementations to share moral judgments.

This is an ambition, **not an established standard**. There is not yet an independently reviewed protocol specification, demonstrated cross-platform compatibility or an external reference implementation. The [roadmap](../roadmap.md) must record progress and setbacks. **Translation status: machine-assisted draft, not independently reviewed.**

## What should be open—and what must be protected

The **published normative and technical core** should remain open: foundational texts, procedural rules, licensable source code, criteria for any proposed assessments, source roles, revision decisions and recorded dissent. Include reasons for accepting, rejecting or leaving a proposal unresolved.

Openness does **not** mean publishing private conversations, health data, identities, credentials, vulnerabilities, unpublished work without proper rights or information without consent. Transparency must protect people, not expose them. Nor does open access imply automatic publication of submissions, a substitute for expert review or a vote on truth.

## Actual licensing and power

- **Today:** Original software is offered under [MIT](../../LICENSE), original editorial content under [CC BY-SA 4.0](../../LICENSE-CONTENT.md), within the scope and exceptions specified in [LICENSING.md](../../LICENSING.md). The identity symbol, third-party materials and private information are not automatically licensed.
- **Limit:** MIT permits proprietary downstream adaptations. Open source alone cannot prevent capture or influence on the official edition. Previously published licensed versions remain available under their license terms.
- **Current responsibility:** The repository owner makes editorial decisions. There is **no** democratically legitimate representation of humanity, independent appeals body or fully accessible participation infrastructure.
- **At scale:** Shared oversight of rule changes, funding and conflict-of-interest disclosure, independent appeals, accessible participation, data export and portability need concrete institutional decisions. None is claimed as already implemented.

## The strongest objection

**“Open systems can be manipulated, too. Those with more money, time, reach or technical skills may still set the rules. What does openness really achieve?”**

This identifies a real limit. Openness does not guarantee fairness or truth. It can make power **more visible and contestable**, allow independent alternatives and create a precondition for accountability. Whether it works in practice remains to be tested. If participation continues to reproduce existing power imbalances, the claim of serving the common good must be revised—not celebrated as proven.

## Commitment and revision

**OPEN-01:** WIRKLICH should not silently privatize or make its published methodological, normative and technical core uninspectable or dependent on exclusive interests. Any change to openness, licensing strategy or decision-making power requires a public, versioned proposal explaining its effects, strongest counterargument and accountable decision under the [current governance rules](../community-governance.md). A fundamental break must be labeled as such and must not be described as humanity's endorsement.

This commitment is **open to criticism itself**. It never excuses violations of privacy, security, contributor rights or legal duties.

**In short:** *Humanity is the measure of our aspiration. No one has a mandate to determine truth in its name. That is why the tool itself must remain inspectable, correctable and capable of being carried forward by others.*

## Learning from other projects

On 8 November 2026 we chose 13 cases for the questions they could help Vera answer. How do we track down a fault? How can someone challenge a decision? What remains usable when a service closes? For each case we read documentation from the project or its maintainers. This method favours well-known projects with readily accessible documentation. The sources alone cannot establish which practices contributed to a project's success.

| Project | What the project does | How Vera could test the idea |
| --- | --- | --- |
| SQLite | A fix for a reported bug needs a test that would expose the bug. [Testing, § 5](https://sqlite.org/testing.html#regression_testing) | Trigger the feedback form's offline bug with the same text before and after the fix. |
| Git | Given a working revision and a failing one, `git bisect` narrows down the first change exhibiting the behaviour. [Manual](https://git-scm.com/docs/git-bisect) | Run the same test at intermediate revisions for a reproducible fault. Does the result change between the identified commit and its parent? |
| Linux kernel | Each logical change gets its own patch. [Contribution guide](https://docs.kernel.org/process/submitting-patches.html#separate-your-changes) | Could someone review and accept the form fix on its own if they declined a redesign proposed at the same time? |
| Reproducible Builds | With the same source, build environment and instructions, others should be able to recreate the specified output files byte for byte. [Definition](https://reproducible-builds.org/docs/definition/) | Build two fresh checkouts with the same tool versions. Compare the checksums of an output file chosen in advance. |
| Debian | Debian passes fixes and user requests back to the original projects. [Social contract, § 2](https://www.debian.org/social_contract) | If a fault is in a tool Vera uses, can its maintainers reproduce it from an anonymised example in our report? |
| Python | A PEP records rejected alternatives and the reasons for rejecting them. [PEP 1, “Rejected Ideas”](https://peps.python.org/pep-0001/#what-belongs-in-a-successful-pep) | Can a newcomer find the reason a plausible competing proposal was set aside when a rule changed? |
| NVDA | Contributors who attach screenshots are asked to describe them in text so blind developers can investigate. [Contributor guidance](https://github.com/nvaccess/nvda/blob/master/projectDocs/issues/githubIssueTemplateExplanationAndExamples.md#screenshots) | Hide the image. Can another person tell from the text where the fault occurs and what happens? |
| WordPress | Contributors navigate controls with the keyboard alone and check that focus stays visible. [Testing guide](https://make.wordpress.org/handbook/pathways/test/test-for-accessibility/) | Go from each language's homepage to the contribution form by keyboard. Can you see which element has focus at every step? |
| Apertium | Regression tests distinguish the existing output (`expected`) from variants explicitly recorded as correct (`gold`). [Test documentation](https://wiki.apertium.org/wiki/Regression_testing) | Produce a known mistranslation twice. Even if it matches yesterday's output, comparing it with the reviewed translation must still expose the error. |
| Weblate | The duplicate-word check skips Hindi among other languages because repetition can carry grammatical meaning. [Language checks](https://docs.weblate.org/en/weblate-2026.10.1/user/checks.html#consecutive-duplicated-words) | Test a typo and a repetition confirmed by Hindi speakers. Does a proposed correction preserve the meaningful repetition? |
| ODK Collect | Its form distinguishes a draft, a form ready to send and a submission received by the server. [Form states](https://docs.getodk.org/guide-end-of-form/) | Choose GitHub in Vera's open form while offline. The text should stay in the form and remain available to download. [Regression test](../../tests/feedback-draft.test.mjs) |
| Galaxy | Users can turn the recorded steps of an analysis into a workflow for other data. [Instructions](https://training.galaxyproject.org/training-material/faqs/galaxy/workflows_extract_from_history.html) | Ask someone else to apply the recorded checks from one case to a new one. At which step do they need missing information? |
| Atom (archived) | GitHub announced the end of maintenance and spelled out the consequences, including the loss of package management. [Announcement](https://github.blog/news-insights/product-news/sunsetting-atom/) | Leave the project server out of a trial. Can someone read an exported contribution locally and tell which features need a service? |

These cases suggest three questions for Vera. **Could someone find my mistake again tomorrow?** SQLite, Git and Apertium address different parts of that question. A repeatable test can reproduce a mistake just as reliably as a correct answer, so the expected result also needs a reason. **Who can challenge me?** NVDA gives a concrete example. Someone who cannot see the screenshot can still investigate the fault if the report describes it in words. **What stays in the person's hands?** ODK and Atom bring that question into focus when a connection drops or an entire service goes away.

For Vera's feedback form we adapt one part of ODK's practice. When the browser reports being offline, the text stays on the open page. Anyone who wants to keep it can download a text file. Automatically keeping it on a shared device could leave a personal objection visible to the next person. Here the author decides whether to save a copy. A browser reporting that it is online does not establish that GitHub received a contribution.

**Add a case.** One row is enough. Give the project and source with a date or version, the observed practice, a test that could challenge it at Vera, the result and a reason to adopt, adapt, drop or leave the idea open. An initial suggestion can leave the result open. For the next round, seek small projects, other languages, other code hosts and discontinued work. Software Heritage can help locate those sources. [Archive search](https://www.softwareheritage.org/software-heritage-features/) · [Suggest a case](https://alexanderr1991.github.io/Vera/en/mitwirken/#entwurf)
