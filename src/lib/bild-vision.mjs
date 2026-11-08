import { request } from 'node:http';

const responseLimit = 1024 * 1024;
const timeoutMs = 120_000;

async function readJson(response) {
  if (response.statusCode !== 200) {
    response.destroy();
    throw new Error(`Ollama meldet HTTP ${response.statusCode}. Prüfe den lokalen Server und den Modellnamen.`);
  }

  const chunks = [];
  let size = 0;
  for await (const chunk of response) {
    size += chunk.length;
    if (size > responseLimit) throw new Error('Die Ollama-Antwort überschreitet 1 MiB.');
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new Error('Der lokale Ollama-Server hat kein gültiges JSON geliefert.');
  }
}

function postLocal(path, payload, signal) {
  const body = JSON.stringify(payload);
  return new Promise((resolve, reject) => {
    const req = request({
      hostname: '127.0.0.1',
      port: 11434,
      path,
      method: 'POST',
      // Use a one-off agent so global proxy settings cannot route image bytes elsewhere.
      agent: false,
      signal,
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, (response) => readJson(response).then(resolve, reject));
    req.once('error', reject);
    req.end(body);
  });
}

export async function readWithOllama({ model, image, prompt }) {
  if (typeof model !== 'string' || !/^[\w./-]+(?::[\w.-]+)?$/.test(model) || /(?:[:-]cloud)(?:$|:)/i.test(model)) {
    throw new Error('Gib den Namen eines lokal installierten Ollama-Bildmodells an.');
  }

  const signal = AbortSignal.timeout(timeoutMs);
  try {
    // Check capabilities and cloud aliases before sending image bytes.
    const info = await postLocal('/api/show', { model }, signal);
    if (info?.remote_host || info?.remote_model) throw new Error('Ollama meldet ein Cloud-Modell.');
    if (!Array.isArray(info?.capabilities) || !info.capabilities.includes('vision')) {
      throw new Error('Das lokale Ollama-Modell muss Bilder verarbeiten können.');
    }

    const result = await postLocal('/api/generate', {
      model,
      prompt,
      images: [image.toString('base64')],
      format: 'json',
      stream: false,
      options: { num_predict: 2048 },
    }, signal);
    try {
      if (typeof result?.response !== 'string') throw new Error();
      return JSON.parse(result.response);
    } catch {
      throw new Error('Das Bildmodell hat keine gültige JSON-Auswertung geliefert.');
    }
  } catch (error) {
    if (signal.aborted) throw new Error('Ollama hat innerhalb von 120 Sekunden nicht geantwortet.');
    if (error.code === 'ECONNREFUSED') throw new Error('Ollama ist unter 127.0.0.1:11434 nicht erreichbar.');
    throw error;
  }
}
