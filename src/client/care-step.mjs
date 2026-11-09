import { assessCareStep, createCareStep, updateCareStep } from "../lib/care-step.mjs";

export function mountCareStep(root) {
  const get = selector => root.querySelector(selector);
  const controls = get("[data-care-controls]");
  const wording = get("[data-wording]");
  const result = get("[data-care-result]");
  const tried = get("[data-tried]");
  const rewrite = get("[data-rewrite]");
  const replies = [...root.querySelectorAll("[data-reply]")];
  const effects = [...root.querySelectorAll("[data-effect]")];
  const messages = JSON.parse(root.dataset.messages);
  let state = createCareStep(replies.map(select => select.dataset.reply), wording.defaultValue);
  wording.value = state.wording;

  function render() {
    const { status } = assessCareStep(state);
    const closed = ["stopped", "unsafe", "review"].includes(status);
    if (closed) wording.value = state.wording;
    const editing = wording.value.trim() !== state.wording;
    const blank = !wording.value.trim();
    rewrite.hidden = !editing || blank;
    wording.readOnly = closed;
    for (const select of replies) {
      const reply = state.replies[select.dataset.reply];
      select.value = editing ? "pending" : reply;
      select.disabled = reply === "unsafe";
      select.querySelector('[value="try"]').disabled = editing || closed || state.tried || status === "revise";
      select.querySelector('[value="correct"]').disabled = editing || closed;
    }
    for (const select of effects) {
      select.closest("label").hidden = !state.tried || editing;
      select.value = state.effects[select.dataset.effect];
      select.disabled = select.value === "worse";
    }
    tried.hidden = editing || status !== "ready";
    result.textContent = messages[blank ? "empty" : editing ? "editing" : status];
  }

  function apply(event) {
    state = updateCareStep(state, event);
    render();
  }

  wording.addEventListener("input", render);
  rewrite.addEventListener("click", () => apply({ type: "rewrite", wording: wording.value }));
  for (const select of replies) {
    select.addEventListener("change", () => apply({ type: "reply", person: select.dataset.reply, value: select.value }));
  }
  for (const select of effects) {
    select.addEventListener("change", () => apply({ type: "effect", person: select.dataset.effect, value: select.value }));
  }
  tried.addEventListener("click", () => apply({ type: "tried" }));
  get("[data-end]").addEventListener("click", () => {
    state = null;
    wording.value = "";
    for (const select of [...replies, ...effects]) select.value = "pending";
    controls.remove();
    result.textContent = messages.ended;
    result.focus();
  });
  controls.addEventListener("toggle", () => {
    if (!state) return;
    if (controls.open) render();
    else result.textContent = "";
  });
  controls.hidden = false;
}
