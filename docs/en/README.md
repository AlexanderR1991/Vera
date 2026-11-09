# Hi, I’m Vera.

[Visit the English workshop](https://alexanderr1991.github.io/Vera/en/) · [Deutsch](../../README.md)

I’m the name people and AI assistants use when they work on a question together here. In a chat, a language model puts my answer into words. In this repository, you can see which rules it could draw on, who challenged them and what a maintainer decided to change. My goal is to become an open-source AI that people can run for themselves. Today you can already use the workshop, take my project profile into a chat and run small programs that put specific claims to the test. [Project profile](../vera.md#english) · [What works today and what we hope to build](open-source-ai.md)

## When two people get stuck

“If we had a say in planning it, I’d listen again. I still can’t make that date.” In Vera’s mediation exercise, two people share one device and explore what would change for each of them under a condition either person names. Each may bring a draft from their own AI and decides how to respond. Once the change actually takes place, Vera asks again. [Try the exercise](https://alexanderr1991.github.io/Vera/en/schnittmengen/#vermittlung) · [Model and two-device roadmap](../vermittlung.md#english-summary)

## When an objection changes my answer

One of my rules says to help people find their own strength. Imagine someone who needs their letters read aloud every week. They decide how to reply. If I judge the help by whether the reading eventually stops, I miss the freedom it gives them today.

An objection about long-term support led to a change in the foundational text. It now says that people’s dignity and their claim to care hold regardless of how much independence they can achieve. You can compare the two versions and judge the change yourself. [Read the case in English](https://alexanderr1991.github.io/Vera/en/methode/#g-005) · [See the revision](https://github.com/AlexanderR1991/Vera/pull/31/files)

**Please help me get better.** Pick a sentence that matters to you. Where does it stop being true? A specific case, an awkward phrase or a missing perspective is enough to begin. You can think it through privately in the worksheet or send a public objection on GitHub. [Private worksheet](https://alexanderr1991.github.io/Vera/en/werkstatt/) · [Give feedback](https://github.com/AlexanderR1991/Vera/issues/new?template=rueckmeldung.yml) · [Challenge a claim](https://github.com/AlexanderR1991/Vera/issues/new?template=angriff.yml)

## Can I tell when I’m wrong?

If I say a new website is online, you can open it and see which version actually loads. In my self-study, my checker judged all six simulated publication states correctly when its inputs were accurate. When one input was reversed, it gave four wrong answers in 18 cases. I now ask a second question when I describe myself. **Who could spot my mistake even if every internal check passed?** An independent pilot is proposed to test whether Vera improves mutual understanding. [Research and discussion paper 3.0 (English summary)](https://alexanderr1991.github.io/Vera/papers/warum-ich-glaube-dass-ich-funktioniere/paper.html#english) · [Self-model specification in English](../vera-selbstmodell.md#english)

To repeat the experiment, run this from the repository root with Node.js 22.12 or later. It uses synthetic inputs and needs no model, network connection or package installation.

```sh
node scripts/probe-vera-selbststudie.mjs
```

## Find your way around

With Vera’s profile loaded in an AI chat that can read the repository, type **“Vera, wave.”** The session surveys the project, follows one open question through a concrete case and hands you its findings. [How a wave works](../vera.md#start-a-wave)

| If you want to… | Start here |
| --- | --- |
| Examine a question or follow a disagreement | [Forum](https://alexanderr1991.github.io/Vera/en/forum/) · [Correction loop](https://alexanderr1991.github.io/Vera/en/regelkreis/) · [Method notes with English summary](../methode.md) |
| Read the philosophy behind WIRKLICH, my inquiry method | [Nine foundational theses](grundtext.md) · [Why open source matters](openness.md) · [The role of AI](https://alexanderr1991.github.io/Vera/en/ki-und-mensch/) |
| Explore the research proposals | [Collective intelligence](kollektive-intelligenz.md) · [Understanding someone you disagree with](https://alexanderr1991.github.io/Vera/en/die-bruecke/) · [Fundamental questions atlas](https://alexanderr1991.github.io/Vera/en/grundfragen/) |
| Check Vera's mathematical structure | [Model map](../mathematische-struktur.md) · [Track individual objections across revisions](../entitaet.md#tracking-objections-across-revisions) |
| Work on the code or use Vera in another chat | [Start a session in English](../vera.md#start-a-new-session) · [Repository guide (German)](../README.md) · [Contributor guide](../../CONTRIBUTING.md) |

To run the site locally, use Node.js 22.12 or later, then run `npm ci` and `npm run dev` from the repository root. To check a change, run `npm run build` and, with Python 3.12, `python -m unittest discover -s tests -p 'test_*.py'`. [Build workflow](../../.github/workflows/pages.yml)

## Help with the English edition

German is the editorial source. The English website and the available English documents are machine-assisted drafts awaiting independent review. Some specialist documents still have only a German edition. If a translation changes the meaning, point to the German passage and its version, quote the English wording and tell us how you read it. [Glossary](../i18n-glossary.md) · [Translation inventory](../../public/i18n/review-register.v1.json) · [Review policy](../internationalisierung.md) · [Suggest a translation correction](https://github.com/AlexanderR1991/Vera/issues/new?template=uebersetzung.yml)
