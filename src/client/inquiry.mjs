import {createInquiry, parseInquiry, inquiryFields, inquiryMarkdown, maxInquiryFileSize, nextInquiryQuestion} from "../lib/inquiry.mjs";
import {assessDirection, directionChecks, directionCopy} from "../lib/inquiry-direction.mjs";

const root = document.querySelector("[data-inquiry-workbench]");
if (root) {
  const lang = root.dataset.lang;
  const en = lang === "en";
  const form = root.querySelector("[data-inquiry-form]");
  const status = root.querySelector("[data-inquiry-status]");
  const preview = root.querySelector("[data-inquiry-preview]");
  const curiosity = root.querySelector("[data-inquiry-curiosity]");
  const directionPanel = root.querySelector("[data-inquiry-direction]");
  const directionResult = root.querySelector("[data-direction-result]");
  const directionInputs = directionChecks.map(key => [key, form.elements.namedItem(`direction-${key}`)]);
  const storeKey = "wirklich.inquiry.v1";
  const t = (de, english) => en ? english : de;
  const readAction = () => form.elements.namedItem("action").value.trim();
  let previousAction = readAction();
  const update = () => {
    const action = readAction();
    if (action !== previousAction) {
      const hadChecks = directionInputs.some(([, input]) => input.value !== "open");
      directionInputs.forEach(([, input]) => { input.value = "open"; });
      previousAction = action;
      if (hadChecks) report(t("Der nächste Schritt hat sich geändert. Prüfe ihn erneut.", "The next step changed. Review it again."));
    }
    const direction = Object.fromEntries(directionInputs.map(([key, input]) => [key, input.value]));
    const note = createInquiry({...Object.fromEntries(new FormData(form)), direction}, lang);
    const message = action ? directionCopy[lang].results[assessDirection(note.direction)] :
      t("Trage zuerst oben einen nächsten Schritt ein.", "Enter a next step above first.");
    directionInputs.forEach(([, input]) => { input.disabled = !action; });
    if (directionResult.textContent !== message) directionResult.textContent = message;
    preview.textContent = inquiryMarkdown(note);
    root.querySelector("[data-inquiry-completion]").textContent = t("Du entscheidest, was offen bleibt. Deine Notizen sind noch kein geprüfter Befund.", "You decide what to leave open. Your notes are not a reviewed finding.");
    const guide = root.querySelector(`[data-type-guide="${note.type}"]`);
    root.querySelector("[data-inquiry-types]").textContent = guide.querySelector("p").textContent;
    const question = nextInquiryQuestion(note);
    const suggestion = question ? `${t("Vorschlag für deine nächste Prüffrage", "Suggested next question")}. ${question}` : "";
    curiosity.hidden = !suggestion;
    if (curiosity.textContent !== suggestion) curiosity.textContent = suggestion;
    return note;
  };
  const write = note => {
    form.elements.namedItem("type").value = note.type;
    inquiryFields.forEach(key => { form.elements.namedItem(key).value = note[key]; });
    directionInputs.forEach(([key, input]) => { input.value = note.direction?.[key] ?? "open"; });
    directionPanel.open = Boolean(note.direction);
    previousAction = readAction();
    // Reveal imported detail rather than silently hiding existing work.
    root.querySelector("[data-inquiry-deeper]").open = note.type !== "unclassified" || ["claim", "scope", "support", "positions", "revision"].some(key => note[key]);
    update();
    root.dispatchEvent(new Event("inquiry-sheet-change"));
  };
  const report = message => { status.textContent = message; };
  const download = (contents, extension, mime, basename = "wirklich-pruefblatt") => {
    const url = URL.createObjectURL(new Blob([contents], {type: mime}));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${basename}.${extension}`;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  form.addEventListener("submit", event => { event.preventDefault(); update(); report(t("Prüfblatt aktualisiert. Es wurde nichts veröffentlicht.", "Worksheet updated. Nothing has been published.")); });
  form.addEventListener("input", update);
  form.addEventListener("change", update);
  root.querySelector("[data-export-json]").addEventListener("click", () => {
    download(JSON.stringify(update(), null, 2) + "\n", "json", "application/json");
    report(t("JSON-Export erstellt. Er lässt sich hier wieder öffnen.", "JSON export created. You can reopen it here."));
  });
  root.querySelector("[data-export-text]").addEventListener("click", () => {
    download(inquiryMarkdown(update()), "txt", "text/plain;charset=utf-8");
    report(t("Text zum Weiterarbeiten exportiert.", "Text exported for further work."));
  });
  root.querySelector("[data-export-ai]").addEventListener("click", () => {
    const rules = JSON.parse(root.querySelector("[data-inquiry-rules]").textContent);
    const task = t(
      "Prüfe mit diesen Regeln mein Prüfblatt am Ende der Datei. Meine Einträge sind vorläufig. Lass fehlende Angaben offen. Prüfe gegebenenfalls auch meine Einschätzung zum nächsten Schritt. Sie ersetzt weder Belege noch Zustimmung.",
      "Use these rules to examine my worksheet at the end of the file. My notes are provisional. Leave missing information open. Examine my assessment of the next step if I included one. It does not establish evidence or consent."
    );
    download([task, rules.trimEnd(), inquiryMarkdown(update())].join("\n\n"), "txt", "text/plain;charset=utf-8", "wirklich-ki-" + lang);
    report(t("Deine Datei ist bereit. Du entscheidest, was du in deinem KI-Chat teilst.", "Your file is ready. You decide what to share in your AI chat."));
  });
  root.querySelector("[data-local-save]").addEventListener("click", () => {
    try { localStorage.setItem(storeKey, JSON.stringify(update())); report(t("Entwurf in diesem Browser gespeichert. Du kannst ihn löschen oder als Datei exportieren.", "Draft saved in this browser. You can delete it or export a file.")); }
    catch { report(t("Speichern im Browser ist nicht möglich. Nutze den Dateiexport.", "Browser storage is unavailable. Use the file export.")); }
  });
  root.querySelector("[data-local-load]").addEventListener("click", () => {
    try {
      const raw = localStorage.getItem(storeKey);
      if (!raw) { report(t("Kein gespeicherter Entwurf vorhanden.", "No saved draft found.")); return; }
      write(parseInquiry(raw));
      report(t("Gespeicherten Entwurf geöffnet.", "Saved draft opened."));
    } catch { report(t("Dieser Entwurf konnte nicht geöffnet werden. Versuche einen JSON-Import.", "This draft could not be opened. Try importing a JSON file.")); }
  });
  root.querySelector("[data-local-clear]").addEventListener("click", () => {
    try {
      localStorage.removeItem(storeKey);
      form.reset();
      previousAction = readAction();
      update();
      root.dispatchEvent(new Event("inquiry-sheet-change"));
      report(t("Gespeicherten Entwurf gelöscht und Felder geleert.", "Saved draft deleted and fields cleared."));
    }
    catch { report(t("Browserspeicher konnte nicht gelöscht werden. Die Felder bleiben erhalten.", "Browser storage could not be cleared. Your fields are preserved.")); }
  });
  root.querySelector("[data-import]").addEventListener("change", async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      if (file.size > maxInquiryFileSize) throw new Error("Too large");
      const note = parseInquiry(await file.text());
      write(note);
      report(t("Prüfblatt importiert. Eigene Prüfung und öffentliche Einreichung bleiben getrennte Schritte.", "Worksheet imported. Your review and public submission remain separate steps."));
    } catch { report(t("Import nicht möglich: Verwende einen Vera-JSON-Export bis 1 MiB. Dein bisheriger Entwurf bleibt erhalten.", "Use a worksheet exported as JSON, up to 1 MiB. Your existing draft is preserved.")); }
    event.target.value = "";
  });
  root.querySelector("[data-load-example]").addEventListener("click", () => {
    const example = JSON.parse(root.querySelector("[data-inquiry-example]").textContent);
    write(createInquiry(example, lang));
    report(t("Erfundenes Beispiel geladen. Es beschreibt keine tatsächlichen Busfahrten.", "Fictional example loaded. It does not describe actual bus journeys."));
  });
  // Persistence and importing require an explicit user action. No automatic restore.
  if (window.location.hash === "#richtung") directionPanel.open = true;
  update();
  root.querySelectorAll("[data-js-control]").forEach(control => { control.disabled = false; });
}
