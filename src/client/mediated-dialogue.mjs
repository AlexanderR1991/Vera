import { assessDialogue, createDialogue, updateDialogue } from "../lib/mediated-dialogue.mjs";

export function mountMediation(root) {
  const get = selector => root.querySelector(selector);
  const texts = JSON.parse(root.dataset.copy);
  const session = get("[data-session]");
  const ended = get("[data-ended]");
  const workspace = get("[data-workspace]");
  const gate = get("[data-gate]");
  const gateTitle = get("[data-gate-title]");
  const optIn = get("[data-opt-in]");
  const readyStatus = get("[data-ready-status]");
  const readyButtons = [...root.querySelectorAll("[data-ready]")];
  const uncertain = get("[data-uncertain]");
  const actor = get("[data-actor]");
  const phase = get("[data-phase]");
  const frames = [...root.querySelectorAll("[data-frame]")];
  const answers = [...root.querySelectorAll("[data-answer]")];
  const records = [...root.querySelectorAll("[data-record]")];
  const labels = Object.fromEntries([...answers[0].options].map(option => [option.value, option.text]));
  const claim = get("[data-claim]");
  const observe = get("[data-observe]");
  const unobserve = get("[data-unobserve]");
  const result = get("[data-result]");
  let state = createDialogue();

  function render(revised = false) {
    const assessment = assessDialogue(state);
    const active = assessment.status === "active";
    const joined = active || assessment.status === "unframed";
    const resting = assessment.status === "paused" || assessment.status === "uncertain";
    const stopped = assessment.status === "stopped";
    session.hidden = stopped;
    ended.hidden = !stopped;
    workspace.hidden = !joined;
    gate.hidden = joined || stopped;
    uncertain.hidden = resting;
    get("[data-rest-note]").hidden = !resting;
    if (!gate.hidden) gateTitle.textContent = texts[assessment.status];
    for (const button of readyButtons) button.disabled = state.ready[button.dataset.ready];
    const firstReady = readyButtons.find(button => button.disabled);
    const progress = !gate.hidden && firstReady ? firstReady.dataset.ready + " " + texts.oneReady : "";
    if (readyStatus.textContent !== progress) readyStatus.textContent = progress;
    const hasReport = state.observations.A || state.observations.B;
    const responding = Boolean(actor.value) && active
      && (phase.value === "afterChange" ? state.observed : !hasReport);

    for (const field of frames) {
      field.disabled = !actor.value;
    }
    claim.disabled = !actor.value || !state.condition.trim() || state.owner === actor.value;
    get("[data-owner]").textContent = state.owner ? texts.owner + " " + state.owner + "." : texts.noOwner;
    phase.disabled = !active;
    phase.querySelector('[value="afterChange"]').disabled = !state.observed;
    for (const answer of answers) {
      answer.disabled = !responding;
      answer.value = actor.value ? state.responses[phase.value][answer.dataset.answer][actor.value] : "open";
    }
    const round = state.responses[phase.value];
    const followUp = get("[data-follow-up]");
    followUp.textContent = "";
    if (responding && phase.value === "ifChanged" && round.listen[actor.value] !== "no" && round.support[actor.value] === "no") followUp.textContent = texts.askRemaining;

    for (const cell of records) {
      cell.textContent = labels[state.responses[phase.value][cell.dataset.record][cell.dataset.person]];
    }
    observe.disabled = !active || !actor.value || state.observations[actor.value];
    unobserve.disabled = !actor.value || !hasReport;
    get("[data-observers]").textContent = hasReport
      ? texts.reported + " " + ["A", "B"].filter(person => state.observations[person]).join(", ") + "."
      : "";

    const lines = [];
    if (revised) lines.push(texts.revised);
    if (assessment.listeningBridge) lines.push(texts.listening);
    if (assessment.supportBridge) lines.push(texts.support);
    if (active && hasReport) lines.push(texts[assessment.afterChange]);
    if (!lines.length) lines.push(active ? texts.ready : texts.frame);
    const message = lines.join("\n");
    if (result.textContent !== message) result.textContent = message;
  }

  for (const button of readyButtons) {
    button.addEventListener("click", () => {
      state = updateDialogue(state, { type: "ready", actor: button.dataset.ready });
      actor.value = button.dataset.ready;
      render();
      if (workspace.hidden) readyStatus.focus();
      else actor.focus();
    });
  }
  function hold(type) {
    state = updateDialogue(state, { type });
    actor.value = "";
    optIn.open = false;
    render();
    gateTitle.focus();
  }
  get("[data-pause]").addEventListener("click", () => hold("pause"));
  uncertain.addEventListener("click", () => hold("uncertain"));
  actor.addEventListener("change", () => render());
  phase.addEventListener("change", () => render());
  for (const field of frames) {
    field.addEventListener("input", () => {
      const wasFramed = assessDialogue(state).status === "active";
      const key = field.dataset.frame;
      state = updateDialogue(state, { type: "frame", [key]: field.value, ...(key === "condition" ? { owner: null } : {}) });
      if (!state.observed && phase.value === "afterChange") phase.value = "today";
      render(wasFramed);
    });
  }
  claim.addEventListener("click", () => {
    const wasFramed = assessDialogue(state).status === "active";
    state = updateDialogue(state, { type: "frame", owner: actor.value });
    if (!state.observed && phase.value === "afterChange") phase.value = "today";
    render(wasFramed);
  });
  for (const answer of answers) {
    answer.addEventListener("change", () => {
      state = updateDialogue(state, { type: "answer", actor: actor.value, phase: phase.value, kind: answer.dataset.answer, value: answer.value });
      render();
    });
  }
  observe.addEventListener("click", () => {
    state = updateDialogue(state, { type: "observe", actor: actor.value });
    if (state.observed) phase.value = "afterChange";
    render();
  });
  unobserve.addEventListener("click", () => {
    state = updateDialogue(state, { type: "unobserve", actor: actor.value });
    phase.value = "today";
    render();
  });

  function clearControls() {
    for (const field of frames) field.value = "";
    actor.value = "";
    phase.value = "today";
    for (const details of root.querySelectorAll("details")) details.open = false;
    optIn.open = state.participation === "waiting";
    get("[data-copy-status]").textContent = "";
    render();
  }
  get("[data-stop]").addEventListener("click", () => {
    state = updateDialogue(state, { type: "stop" });
    clearControls();
    ended.querySelector("h3").focus();
  });
  // Clear the in-memory sheet even when the browser keeps the page in its back/forward cache.
  window.addEventListener("pagehide", () => {
    state = createDialogue();
    clearControls();
  });

  const copyButton = get("[data-copy-prompt]");
  copyButton.hidden = false;
  copyButton.addEventListener("click", async () => {
    const prompt = get("[data-prompt]").textContent;
    try {
      await navigator.clipboard.writeText(prompt);
      get("[data-copy-status]").textContent = texts.copied;
    } catch {
      get("[data-copy-status]").textContent = texts.selectCopy;
    }
  });
  clearControls();
}
