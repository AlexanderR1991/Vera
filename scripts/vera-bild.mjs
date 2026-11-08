import { constants } from "node:fs";
import { open } from "node:fs/promises";
import { parseArgs } from "node:util";
import { readWithOllama } from "../src/lib/bild-vision.mjs";
import { buildImageDraft, describeImage, imageReadingPrompt } from "../src/lib/vera-bild.mjs";

const usage = `Usage:
  node scripts/vera-bild.mjs --prompt
  node scripts/vera-bild.mjs <image.png|jpg|jpeg|webp> --reading <analysis.json>
  node scripts/vera-bild.mjs <image.png|jpg|jpeg|webp> --model <local Ollama model>`;

async function readLocalFile(path, maxBytes) {
  const handle = await open(path, constants.O_RDONLY | constants.O_NONBLOCK);
  try {
    const stat = await handle.stat();
    if (!stat.isFile()) throw new Error("Expected a regular file.");
    if (stat.size > maxBytes) throw new Error(`File exceeds the ${maxBytes}-byte limit.`);
    const chunks = [];
    for await (const chunk of handle.createReadStream({ end: maxBytes, autoClose: false })) {
      chunks.push(chunk);
    }
    const bytes = Buffer.concat(chunks);
    if (bytes.length > maxBytes) throw new Error(`File exceeds the ${maxBytes}-byte limit.`);
    return bytes;
  } finally {
    await handle.close();
  }
}

async function readSuppliedAnalysis(path) {
  const bytes = await readLocalFile(path, 128 * 1024);
  try {
    return JSON.parse(bytes.toString("utf8"));
  } catch {
    throw new Error("The supplied analysis is not valid JSON.");
  }
}

try {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      help: { type: "boolean" },
      prompt: { type: "boolean" },
      reading: { type: "string" },
      model: { type: "string" }
    }
  });
  if (values.help) {
    console.log(usage);
  } else if (values.prompt && Object.keys(values).length === 1 && positionals.length === 0) {
    console.log(imageReadingPrompt());
  } else if (!values.prompt && positionals.length === 1 && Object.keys(values).length === 1 && (values.reading || values.model)) {
    const image = await readLocalFile(positionals[0], 8 * 1024 * 1024);
    const source = describeImage(image);
    const readingOrigin = values.reading ? { method: "supplied" } : { method: "ollama", model: values.model };
    const reading = values.reading
      ? await readSuppliedAnalysis(values.reading)
      : await readWithOllama({ model: values.model, image, prompt: imageReadingPrompt() });
    console.log(JSON.stringify(buildImageDraft(source, reading, readingOrigin), null, 2));
  } else {
    throw new Error(usage);
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
