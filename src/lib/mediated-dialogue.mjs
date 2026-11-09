// One proposal and one participant-named condition per local exchange.
// A/B identify turns on a shared device, not authenticated identities.
function emptyRound() {
  return { listen: { A: "open", B: "open" }, support: { A: "open", B: "open" } };
}

export function createDialogue() {
  return {
    participation: "waiting", ready: { A: false, B: false },
    proposal: "", condition: "", owner: null,
    observations: { A: false, B: false }, observed: false,
    responses: { today: emptyRound(), ifChanged: emptyRound(), afterChange: emptyRound() }
  };
}

function isParticipant(actor) {
  return actor === "A" || actor === "B";
}

function hasFrame(state) {
  return Boolean(state.owner && state.proposal.trim() && state.condition.trim());
}

export function updateDialogue(state, event) {
  if (state.participation === "stopped") throw new Error("This dialogue has ended.");
  const { actor } = event;
  if (actor !== undefined && !isParticipant(actor)) throw new TypeError("Unknown participant.");

  // Anyone holding the device can stop or suspend the exchange without identifying themselves.
  if (event.type === "stop") return { ...createDialogue(), participation: "stopped" };
  if (event.type === "pause" || event.type === "uncertain") {
    const paused = event.type === "pause" || state.participation === "paused";
    return { ...state, participation: paused ? "paused" : "uncertain", ready: { A: false, B: false } };
  }
  if (event.type === "ready") {
    if (!isParticipant(actor)) throw new TypeError("Only A or B can opt in.");
    if (state.ready[actor]) return state;
    const ready = { ...state.ready, [actor]: true };
    return { ...state, ready, participation: ready.A && ready.B ? "together" : state.participation };
  }
  if (state.participation !== "together") throw new Error("Both people must choose to take part.");
  if (event.type === "frame") {
    const { proposal = state.proposal, condition = state.condition } = event;
    // A rewritten condition needs someone to claim the new wording.
    const { owner = condition === state.condition ? state.owner : null } = event;
    if (typeof proposal !== "string" || typeof condition !== "string" || (owner !== null && !isParticipant(owner))) {
      throw new TypeError("Expected proposal and condition text and a participant or null.");
    }
    if (proposal === state.proposal && condition === state.condition && owner === state.owner) return state;
    return { ...createDialogue(), participation: state.participation, ready: state.ready, proposal, condition, owner };
  }

  if (!isParticipant(actor)) throw new TypeError("A participant turn is required.");
  if (!hasFrame(state)) throw new Error("Name a proposal, condition and its speaker first.");

  if (event.type === "observe") {
    const observations = { ...state.observations, [actor]: true };
    return { ...state, observations, observed: observations.A && observations.B };
  }
  if (event.type === "unobserve") {
    return {
      ...state, observations: { A: false, B: false }, observed: false,
      responses: { ...state.responses, afterChange: emptyRound() }
    };
  }
  if (event.type !== "answer") throw new TypeError("Unknown dialogue event.");
  const { phase, kind, value } = event;
  if (!Object.hasOwn(state.responses, phase) || !Object.hasOwn(state.responses[phase], kind)
    || !["yes", "no", "open", "abstain"].includes(value)) {
    throw new RangeError("Unknown phase, question or response.");
  }
  if (phase === "afterChange") {
    if (!state.observed) throw new Error("Both participants must report the change before answering again.");
  } else if (state.observations.A || state.observations.B) {
    throw new Error("Earlier answers are closed once either person reports the change.");
  }
  const round = state.responses[phase];
  return {
    ...state,
    responses: {
      ...state.responses,
      [phase]: { ...round, [kind]: { ...round[kind], [actor]: value } }
    }
  };
}

function pairResult({ A, B }) {
  if (A === "yes" && B === "yes") return "agreed";
  if (A === "no" || B === "no") return "objected";
  if (A === "abstain" || B === "abstain") return "abstained";
  return "open";
}

// A local contrast on a single question. No path composition or cause inference.
function possibleBridge({ today, ifChanged }, kind) {
  return pairResult(today[kind]) === "objected" && pairResult(ifChanged[kind]) === "agreed";
}

export function assessDialogue(state) {
  if (state.participation !== "together") {
    return { status: state.participation, listeningBridge: false, supportBridge: false, afterChange: "unassessed" };
  }
  return {
    status: hasFrame(state) ? "active" : "unframed",
    listeningBridge: possibleBridge(state.responses, "listen"),
    supportBridge: possibleBridge(state.responses, "support"),
    afterChange: state.observed ? pairResult(state.responses.afterChange.support) : "unobserved"
  };
}
