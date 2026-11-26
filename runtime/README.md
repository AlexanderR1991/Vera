# Vera inference runtime · v1

**Deutsch:** Diese gemeinsame Laufzeit verbindet die vorhandene Ask-CLI und lokale Versuche mit einem bereits installierten Ollama-Modell. Sie hält Modellantworten, tatsächliche Quellenabrufe und Fehlerprotokolle getrennt. Der Aufruf bleibt `node scripts/vera-ask.mjs de <lokales-modell> "Frage"`; pro Lauf ist höchstens eine lesende Projektsuche möglich. Modelle werden weder installiert noch trainiert. Die [deutsche Übersicht](../docs/modellentwicklung.md) erklärt den Aufbau und die noch fehlenden Voraussetzungen.

Die folgenden API-Beispiele beschreiben den Vertrag für weitere Adapter. Angegebene Modelldigests sind Betreiberangaben, keine verifizierte Identität. Gemeldete Tokenzahlen belegen allein keinen vollständigen Input; der Vergleichsrunner behandelt diese Grenze gesondert.

An executable inference boundary for the existing CLI and local experiments. It contains no model weights or training loop. It calls an already installed Ollama model on IPv4 loopback. Nothing starts or downloads a model, saves a conversation, publishes a result or makes a human decision.

```js
import { createOllamaAdapter } from "./ollama.mjs";
import { createGitProjectSource } from "./project-source.mjs";
import { runInquiry } from "./inquiry.mjs";

const adapter = createOllamaAdapter({ model: "your-installed-model", options: {
  num_ctx: 8192, num_predict: 512, temperature: 0, seed: 42
} });
const source = createGitProjectSource({ root: process.cwd(), language: "de" });
const draft = await runInquiry({ adapter, revision: source.revision,
  messages: [{ role: "user", content: "Welche Grenzen hat META-01?" }],
  searchProject: source.search
});
console.log(draft.content); // Still an unreviewed AI draft.
```

Import paths above are relative to this directory. The CLI remains `node scripts/vera-ask.mjs de <local-model> "Question"`. Its default context size remains 8192; it retains the existing optional, single project search. The runtime can be used separately from the website.

`createOllamaAdapter(config).generate({messages, tools?, options?, signal?})` returns:

- `message`: the provider's assistant message; tool requests are data and are never executed by the adapter.
- `model`: requested `model`, optional operator-supplied `modelDigest`, provider-reported model name in `reported`, and `digestVerified: false`. A name or supplied digest does **not** pin or authenticate weights. Record and independently check the actual local artifact for a reproducible experiment.
- `options`: exact merged generation settings sent to Ollama.
- `usage`: provider-reported `inputTokens` and `outputTokens`, or `null` when absent.
- `finishReason`, `durationMs`, and `schemaVersion`.

Every adapter must normalize a reported regular technical completion to `finishReason: "stop"`, including a completed tool request. The invariant is: a successful inquiry implies that every generation has `finishReason === "stop"`; nonempty text alone is insufficient. `runInquiry` checks this after recording each generation and before executing a search or continuing with its answer. Missing, unknown, error and truncation reasons fail explicitly; they cannot create a successful draft or inquiry-ledger record through this runtime. The Ollama adapter requires both `done: true` and `done_reason: "stop"` and retains available inference metadata on rejection. A regular completion is not proof of semantic completeness or truth.

The [example configuration](example.config.json) needs an installed model name. Supported numeric options are `num_ctx`, `num_predict`, `temperature`, `seed`, `top_p`, `top_k` and `repeat_penalty`. Per-call options override the adapter defaults. Configured deadlines and an optional `AbortSignal` cancel requests. Input and response byte limits bound transport size; these are **not token counts**. There is no tokenizer or accurate input-token preflight. `num_ctx` includes the context window; allow space for the requested output. Evaluations must separately reject excess/missing token counts as their protocol requires. An incomplete or truncated response fails; `error.inference` preserves available response metadata for the caller to log. Network/protocol failures do not manufacture a draft.

`runInquiry({adapter,messages,searchProject?,options?,signal?,revision?,onSearch?})` returns a draft with `content`, the completed `messages`, retrieved `sources`, generation/search `trace`, last-generation `usage`, model metadata and explicit false authority flags. It makes at most two generations and one search. Without `searchProject`, no tool is offered and attempted calls fail. Only `search_project` can run, with a short gap and literal term; subsequent or arbitrary tool calls fail. `onSearch` is an optional trusted application callback, used by the CLI to print retrieved sources. Failed inquiries expose `error.trace`. Nothing is persisted automatically; callers must decide whether, where and with whose permission to save inputs or outputs.

Search results must contain a valid passage at every array position. Sparse arrays are rejected before source recording, `onSearch` and a second generation; an empty array remains a valid result with no sources. Fehlende Arrayeinträge werden zurückgewiesen und weder als Quellen protokolliert noch an Callback oder weitere Generierung übergeben. Dies prüft keine Quellenwahrheit.

Input chat messages must be nonempty and valid at every array position. Missing positions are rejected by the shared validator before an inference adapter is called; unlike search results, an empty message array remains invalid. Nachrichtenlücken werden weder ergänzt noch still entfernt. Die Prüfung verlangt keine bestimmte menschliche Gesprächsrolle und belegt keine Einwilligung.

Supplied tool declaration arrays must pass the existing function type/name checks at every position before HTTP transport. Missing positions are rejected; an empty or omitted list remains valid. Werkzeugdeklarationen bleiben Daten und erteilen keine Ausführungsbefugnis. Dies ist keine vollständige Funktionsschema-Prüfung.

Ein bereits beobachtbares Abbruchsignal verhindert eine neue Generierung, Projektsuche, Anwendung von `onSearch` und erfolgreiche Entwurfsrückgabe. Auch `runRecordedInquiry` prüft es vor der anschließenden Übernahme ins Protokoll. Von diesen Checkpoints erzeugte Abbruchfehler heißen `AbortError`, behalten den Signalgrund als `cause` und bereits abgeschlossene Schritte im `trace`. Das ist eine Ablaufgrenze: Adapter bleiben für den Abbruch ihrer laufenden Anfragen zuständig. Noch laufende unkooperative Arbeit wird weder präemptiert noch muss ein offenes `await` sofort zurückkehren; spätere Abbrüche machen abgeschlossene Rückgaben nicht rückwirkend ungültig.

An already observable abort signal prevents a new generation, project search, `onSearch` callback, or successful draft return. `runRecordedInquiry` also checks before converting the returned draft into a record. Abort errors created by these checkpoints have name `AbortError`, retain the signal reason as `cause` and completed steps in `trace`. These are continuation checkpoints: adapters remain responsible for cancelling their in-flight requests. They do not preempt ongoing uncooperative work or force an open `await` to settle immediately; a later abort does not retroactively invalidate a completed return.

Nicht-Error-Ablehnungen aus einer bereits begonnenen Anfrage werden als gewöhnlicher `Error` mit dem unveränderten Originalwert als `cause` und den vorhandenen Schritten als `trace` zurückgegeben. Das Originalobjekt wird dabei nicht verändert. Gewöhnliche beschreibbare Error-Objekte behalten ihre Identität und Metadaten. Daraus wird keine allgemeine Abbruchpriorität abgeleitet.

Non-Error rejections from an admitted inquiry operation are wrapped in an ordinary `Error`, retaining the exact original value as `cause` and existing steps in `trace`, without modifying the original object. Ordinary writable Error objects retain their identity and metadata. This does not infer cancellation priority from the signal state.

`createGitProjectSource({root,language,revision?})` pins the full commit hash at construction and searches committed DE or EN project documentation. Results contain up to three literal matches and commit/line URLs. Working-tree text is excluded. Neither a match nor a commit proves source truth, publication, independent evidence or consent. UTF-8 filenames, including spaces, punctuation and newlines, remain associated with their own line and excerpt; each URL path segment is percent-encoded. Excerpts preserve the original line's first 400 JavaScript UTF-16 code units. This does not verify that the URL is reachable. Supplied revisions must equal Git's complete canonical commit ID for this repository: a 40-character SHA-256 prefix is rejected, rather than treated as a full SHA-1 ID. They must be primitive full-ID strings naming actual commit objects; raw tree, blob and annotated-tag object IDs are rejected. Omitted or null revisions still resolve HEAD as a commit. A commit object does not prove reachability, publication or authorship.

Explizite Revisionen müssen mit Gits vollständiger kanonischer Commit-ID dieses Repositorys übereinstimmen; ein 40-stelliger SHA-256-Präfix wird nicht als vollständige SHA-1-ID behandelt. Sie müssen primitive vollständige Commit-ID-Strings sein und echte Commit-Objekte bezeichnen. Baum-, Blob- und annotierte Tag-Objekt-IDs werden abgelehnt. Fehlende oder null-Revisionen lösen weiterhin HEAD als Commit auf. Das belegt weder Erreichbarkeit noch Veröffentlichung oder Urheberschaft.

UTF-8-Dateinamen mit Leerzeichen, Satzzeichen oder Zeilenumbrüchen bleiben ihrer Fundstelle zugeordnet; Quellenlinks kodieren jedes Pfadsegment. Ausschnitte behalten die ersten 400 JavaScript-UTF-16-Einheiten der Originalzeile. Die Erreichbarkeit eines Links ist damit nicht geprüft.

The search disables Git color and column output for that invocation so local display preferences do not enter excerpts or hide parsed matches. Local Git configuration is unchanged. Die Suche schaltet Farbe und Spaltenanzeige nur für diesen Aufruf aus; persönliche Git-Einstellungen bleiben erhalten.

Repository addresses with a complete `.` or `..` owner/repository segment are rejected because URL resolution changes their path. Dots within a name remain allowed. This does not verify repository existence or authorship. Vollständige Punktsegmente werden zurückgewiesen statt auf ein anderes Repository umgedeutet; dies prüft weder Existenz noch Autorenschaft.

## Einwandsprotokoll anbinden / Connect the inquiry ledger

Die optionale [Verbindung zu ENT-00](recorded-inquiry.mjs) kann einen Laufzeitentwurf im Arbeitsspeicher in ein Einwandsprotokoll übernehmen. `createInquiryDraftRecord({id,question?,draft,at,lang?,claim_type?,scope?})` behält den vollständigen Originalentwurf sowie Modell- und Gitprovenienz im zurückgegebenen Wrapper. Die Frage wird aus der letzten Nutzernachricht abgeleitet; eine ausdrücklich angegebene andere Frage wird abgelehnt. Nur tatsächlich im Suchprotokoll enthaltene Quellen werden als `evidence_hint` übernommen. Antwort und Hinweise bleiben `ai_draft`; ein späterer Einwand bleibt bis zu einer eigenen Entscheidung offen. Der Kern kann keine menschliche Entscheidung authentifizieren.

```js
import { createInquiryDraftRecord } from "./recorded-inquiry.mjs";
const recorded = createInquiryDraftRecord({
  id: "INQUIRY-001", draft, at: new Date().toISOString(), lang: "de"
});
console.log(recorded.summary.review_state); // unreviewed_draft
```

`runRecordedInquiry({id,question?,at,lang?,claim_type?,scope?,inquiry:{adapter,messages,...}})` combines generation and this opt-in conversion. It binds the record to the last user message. ENT-00's 2,000-character limit is enforced: overlong answers fail explicitly instead of being truncated. Use a suitably bounded generation; token limits alone cannot guarantee a character count. The original draft stays available when converting it separately. Nothing is saved, published, promoted to reviewed evidence or used for training automatically. Provenance consistency is checked; its authenticity and source truth are not established.

The generation record follows Ollama's [chat API](https://docs.ollama.com/api/chat). Protocol tests use local mock servers. Passing them proves transport and boundary behavior, not model quality, learning or human benefit. Compare fixed real-model runs against a simpler prompt before claiming a Vera-specific improvement.
