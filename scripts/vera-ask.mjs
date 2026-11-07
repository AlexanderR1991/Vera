import { execFileSync } from "node:child_process";
import { request } from "node:http";
import { fileURLToPath } from "node:url";

const usage = 'Usage: node scripts/vera-ask.mjs <de|en> <local-model> "Question"';
const [language, model, question, ...extra] = process.argv.slice(2);
const contextScript = fileURLToPath(new URL("./vera-context.mjs", import.meta.url));
const port = Number(process.env.VERA_OLLAMA_PORT ?? 11434);

async function askOllama(port, model, messages) {
  const body = JSON.stringify({ model, messages, stream: false, options: { num_ctx: 8192 } });
  const response = await new Promise((resolve, reject) => {
    const req = request({
      hostname: "127.0.0.1",
      port,
      path: "/api/chat",
      method: "POST",
      agent: false,
      signal: AbortSignal.timeout(300_000),
      headers: { "Content-Type": "application/json" }
    }, resolve);
    req.on("error", reject);
    req.end(body);
  });

  if (response.statusCode !== 200) {
    response.resume();
    throw new Error(`Ollama returned HTTP ${response.statusCode}. Check the server and the installed model name.`);
  }

  const chunks = [];
  for await (const chunk of response) chunks.push(chunk);
  const result = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  const answer = result?.message?.content;
  if (result?.done !== true || typeof answer !== "string" || !answer.trim()) {
    throw new Error("Ollama returned no complete text answer.");
  }
  return answer.trimEnd();
}

if (language === "--help" && model === undefined) {
  console.log(usage);
} else if (!["de", "en"].includes(language) || !model?.trim() || !question?.trim() || extra.length) {
  console.error(usage);
  process.exitCode = 2;
} else if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error("VERA_OLLAMA_PORT must be an integer between 1 and 65535.");
  process.exitCode = 2;
} else {
  try {
    const context = execFileSync(process.execPath, [contextScript, language], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    });
    const sourceAccess = language === "de"
      ? "In diesem Lauf liegen dir das Profil und der Erkenntnisprompt vor. Verlinkte Dokumente und der Veröffentlichungsstand sind für dich hier nicht abrufbar."
      : "This run provides the profile and inquiry prompt. You cannot retrieve linked documents or verify publication here.";
    const answer = await askOllama(port, model, [
      { role: "system", content: `${context}\n${sourceAccess}` },
      { role: "user", content: question }
    ]);
    const revisionLabel = context.split("\n", 1)[0];
    console.error(`${language === "de" ? "KI-Entwurf" : "AI draft"} · ${revisionLabel} · ${JSON.stringify(model)}`);
    console.log(answer);
  } catch (error) {
    const detail = error.stderr?.trim() || error.message;
    console.error(`Vera: ${detail}`);
    process.exitCode = 1;
  }
}
