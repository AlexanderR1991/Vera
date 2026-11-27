const button = document.querySelector("button[data-copy-inquiry]");
const field = document.querySelector("textarea#inquiry-prompt");
const status = document.querySelector("[data-copy-status]");

if (button && field && status) {
  button.hidden = false;
  let latestCopy;
  button.addEventListener("click", async () => {
    const attempt = {};
    latestCopy = attempt;
    status.textContent = "";
    try {
      await navigator.clipboard.writeText(field.value);
      if (latestCopy !== attempt) return;
      status.textContent = button.dataset.copied;
    } catch {
      if (latestCopy !== attempt) return;
      const preview = field.closest("details");
      if (preview) preview.open = true;
      field.focus();
      field.select();
      status.textContent = document.documentElement.lang === "en"
        ? "The text is selected. Use your device’s Copy command."
        : "Der Text ist markiert. Nutze die Kopierfunktion deines Geräts.";
    }
  });
}
