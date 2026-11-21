import { createDialogue, updateDialogue } from "./mediated-dialogue.mjs";

function emptyPair() {
  return { original: "", reflection: "", review: "open", correction: "", rejectedReflection: null };
}

export function createMirror() {
  return { session: createDialogue(), pairs: { A: emptyPair(), B: emptyPair() } };
}

function requireText(text) {
  if (typeof text !== "string") throw new TypeError("Expected wording as text.");
  return text;
}

function changePair(pair, event) {
  switch (event.type) {
    case "original": {
      const original = requireText(event.text);
      return original === pair.original ? pair : { ...emptyPair(), original };
    }
    case "reflect": {
      if (!pair.original.trim()) throw new Error("The other person must state their own position first.");
      const reflection = requireText(event.text);
      if (reflection === pair.reflection) return pair;
      const review = reflection.trim() === pair.rejectedReflection ? "changes_requested" : "open";
      return { ...pair, reflection, review };
    }
    case "request": {
      if (!pair.reflection.trim()) throw new Error("There is no reflection to review.");
      const correction = requireText(event.text === undefined ? "" : event.text);
      return { ...pair, review: "changes_requested", correction, rejectedReflection: pair.reflection.trim() };
    }
    case "confirm":
      if (!pair.reflection.trim()) throw new Error("There is no reflection to review.");
      if (pair.review === "changes_requested") throw new Error("Revise the reflection or withdraw the request first.");
      return { ...pair, review: "confirmed", correction: "", rejectedReflection: null };
    case "reopen":
      return { ...pair, review: "open", correction: "", rejectedReflection: null };
    default:
      throw new TypeError("Unknown mirror action.");
  }
}

// Roles identify turns at a shared device. Only the original speaker's turn
// can review their pair. A reflection always belongs to the opposite speaker.
export function updateMirror(state, event) {
  if (["ready", "pause", "uncertain", "stop"].includes(event.type)) {
    const session = updateDialogue(state.session, event);
    if (event.type === "stop") return { session, pairs: { A: emptyPair(), B: emptyPair() } };
    return session === state.session ? state : { ...state, session };
  }
  if (state.session.participation !== "together") throw new Error("Both people must choose to take part.");
  const { actor } = event;
  if (actor !== "A" && actor !== "B") throw new TypeError("Choose a participant turn.");
  const other = actor === "A" ? "B" : "A";
  const speaker = event.type === "reflect" ? other : actor;
  const pair = changePair(state.pairs[speaker], event);
  if (pair === state.pairs[speaker]) return state;
  return { ...state, pairs: { ...state.pairs, [speaker]: pair } };
}

function assessPair(pair) {
  if (!pair.original.trim()) return "needs_original";
  if (!pair.reflection.trim()) return "needs_reflection";
  return pair.review === "open" ? "needs_review" : pair.review;
}

export function assessMirror(state) {
  const status = state.session.participation;
  const pairs = status === "together"
    ? { A: assessPair(state.pairs.A), B: assessPair(state.pairs.B) }
    : { A: "unassessed", B: "unassessed" };
  return { status, pairs, bothConfirmed: pairs.A === "confirmed" && pairs.B === "confirmed" };
}
