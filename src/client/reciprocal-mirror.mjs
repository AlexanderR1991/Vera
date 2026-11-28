import { assessMirror, createMirror, updateMirror } from "../lib/reciprocal-mirror.mjs";

const otherPerson = person => person === "A" ? "B" : "A";

export function mountReciprocalMirror(root) {
  const get = selector => root.querySelector(selector);
  const messages = JSON.parse(root.dataset.copy);
  const words = (key, person) => messages[key]
    .replaceAll("{person}", person).replaceAll("{other}", otherPerson(person));
  const gate = get("[data-gate]");
  const workspace = get("[data-workspace]");
  const ended = get("[data-ended]");
  const nextExercise = get("[data-next-exercise]");
  const readyButtons = [...root.querySelectorAll("[data-ready]")];
  const panels = [...root.querySelectorAll("[data-pair]")];
  let state = createMirror();
  let actor = null;

  function setText(element, value) {
    if (element.textContent !== value) element.textContent = value;
  }

  function showField(panel, name, value, editable) {
    const editor = panel.querySelector(`[data-${name}]`);
    const reading = panel.querySelector(`[data-${name}-value]`);
    // A new value assignment moves the caret in some browsers even during ordinary typing.
    if (editor.value !== value) editor.value = value;
    editor.hidden = !editable;
    editor.disabled = !editable;
    reading.hidden = editable;
    setText(reading, value);
  }

  function renderPanel(panel, assessment, active) {
    const person = panel.dataset.pair;
    const ownTurn = active && actor === person;
    const pair = state.pairs[person];
    const original = active ? pair.original : "";
    const reflection = active ? pair.reflection : "";
    const correction = active ? pair.correction : "";
    panel.toggleAttribute("data-current", ownTurn);
    setText(panel.querySelector("[data-status]"), active ? words(assessment.pairs[person], person) : "");

    panel.querySelector(".statement").hidden = !ownTurn && !original.trim();
    showField(panel, "original", original, ownTurn);
    panel.querySelector("[data-edit-hint]").hidden = !ownTurn || !reflection.trim();
    panel.querySelector("[data-restatement]").hidden = !original.trim() || (ownTurn && !reflection.trim());
    showField(panel, "reflection", reflection, active && !ownTurn && Boolean(original.trim()));
    panel.querySelector("[data-feedback]").hidden = !correction.trim();
    setText(panel.querySelector("[data-note-label]"), words("note", person));
    setText(panel.querySelector("[data-note-value]"), correction);

    const reviewable = ownTurn && Boolean(reflection.trim());
    const open = pair.review === "open";
    panel.querySelector("[data-review]").hidden = !reviewable;
    const noteBox = panel.querySelector("[data-note-box]");
    noteBox.hidden = !reviewable || !open;
    if (!reviewable || !open) noteBox.open = false;
    panel.querySelector("[data-confirm]").hidden = !open;
    panel.querySelector("[data-request]").hidden = !open;
    panel.querySelector("[data-reopen]").hidden = open;
  }

  function render() {
    const assessment = assessMirror(state);
    const active = assessment.status === "together";
    const paused = assessment.status === "paused";
    const stopped = assessment.status === "stopped";
    gate.hidden = active || stopped;
    workspace.hidden = !active;
    ended.hidden = !stopped;
    const readyPerson = ["A", "B"].find(person => state.session.ready[person]);
    setText(get("[data-gate-title]"), paused ? messages.paused : messages.waiting);
    setText(get("[data-gate-hint]"), paused ? messages.pausedHint : messages.choose);
    setText(get("[data-ready-status]"), readyPerson && !active ? words("pending", readyPerson) : "");
    for (const button of readyButtons) button.disabled = state.session.ready[button.dataset.ready];

    get("[data-boundaries]").hidden = stopped || (!active && !paused && !readyPerson);
    get("[data-pause]").hidden = !active;
    setText(get("[data-turn-title]"), active ? words("turn", actor) : "");
    setText(get("[data-turn]"), active ? words("handoff", actor) : "");
    for (const panel of panels) renderPanel(panel, assessment, active);
    setText(get("[data-outcome]"), assessment.bothConfirmed ? messages.confirmedBoth : "");
    if (nextExercise) nextExercise.hidden = !assessment.bothConfirmed;
  }

  function send(event) {
    state = updateMirror(state, event);
    render();
  }

  function clearNotes() {
    for (const panel of panels) {
      panel.querySelector("[data-note]").value = "";
      panel.querySelector("[data-note-box]").open = false;
    }
  }

  function reset() {
    actor = null;
    state = createMirror();
    clearNotes();
    render();
  }

  for (const button of readyButtons) {
    button.addEventListener("click", () => {
      actor = button.dataset.ready;
      send({ type: "ready", actor });
      get(workspace.hidden ? "[data-ready-status]" : "[data-turn-title]").focus();
    });
  }

  get("[data-turn]").addEventListener("click", () => {
    // A correction note becomes part of a turn only when its author requests a rewrite.
    actor = otherPerson(actor);
    render();
    get("[data-turn-title]").focus();
  });

  for (const panel of panels) {
    const note = panel.querySelector("[data-note]");
    panel.querySelector("[data-original]").addEventListener("input", event => {
      note.value = "";
      send({ type: "original", actor, text: event.target.value });
    });
    panel.querySelector("[data-reflection]").addEventListener("input", event => {
      note.value = "";
      send({ type: "reflect", actor, text: event.target.value });
    });
    for (const type of ["confirm", "request", "reopen"]) {
      panel.querySelector(`[data-${type}]`).addEventListener("click", () => {
        const event = type === "request" ? { type, actor, text: note.value } : { type, actor };
        send(event);
        note.value = "";
        panel.querySelector("[data-status]").focus();
      });
    }
  }

  get("[data-pause]").addEventListener("click", () => {
    actor = null;
    send({ type: "pause" });
    get("[data-gate-title]").focus();
  });
  get("[data-stop]").addEventListener("click", () => {
    actor = null;
    clearNotes();
    send({ type: "stop" });
    ended.querySelector("h3").focus();
  });
  get("[data-new]").addEventListener("click", () => {
    reset();
    get("[data-gate-title]").focus();
  });
  window.addEventListener("pagehide", reset);
  window.addEventListener("pageshow", event => { if (event.persisted) reset(); });
  reset();
  get("[data-interactive]").hidden = false;
}
