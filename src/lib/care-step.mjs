// One voluntary invitation. Participant labels identify local turns on one device.
export function createCareStep(people, wording) {
  if (!Array.isArray(people) || !people.length || new Set(people).size !== people.length) {
    throw new TypeError("Provide at least one participant, with distinct labels.");
  }
  const replies = Object.fromEntries(Array.from(people, person => {
    if (typeof person !== "string" || !person.trim()) throw new TypeError("Expected a participant label.");
    return [person, "pending"];
  }));
  if (typeof wording !== "string" || !wording.trim()) throw new TypeError("Name one specific step.");
  return { wording: wording.trim(), replies, tried: false, effects: { ...replies } };
}

export function assessCareStep(state) {
  const replies = Object.values(state.replies);
  const effects = Object.values(state.effects);
  if (replies.includes("unsafe")) return { status: "unsafe" };
  if (replies.includes("decline")) return { status: "stopped" };
  if (effects.includes("worse")) return { status: "review" };
  if (replies.includes("correct")) return { status: "revise" };
  if (state.tried) return { status: effects.includes("pending") ? "trying" : "reported" };
  return { status: replies.every(reply => reply === "try") ? "ready" : "waiting" };
}

export function updateCareStep(state, event) {
  const { type, person, value } = event;
  const { status } = assessCareStep(state);
  const closed = ["unsafe", "stopped", "review"].includes(status);
  if (type === "rewrite") {
    if (closed) throw new Error("This invitation has ended.");
    const next = createCareStep(Object.keys(state.replies), event.wording);
    return next.wording === state.wording ? state : next;
  }
  if (type === "tried") {
    if (status !== "ready") throw new Error("Everyone must first accept this wording.");
    return { ...state, tried: true };
  }
  if (typeof person !== "string" || !Object.hasOwn(state.replies, person)) {
    throw new TypeError("An affected participant must answer for themselves.");
  }
  if (type === "reply") {
    if (!["try", "correct", "decline", "unsafe"].includes(value)) throw new RangeError("Unknown reply.");
    if (state.replies[person] === value) return state;
    // A withdrawal or report of pressure can still arrive after the trial.
    if (state.replies[person] === "unsafe" || (closed && !["decline", "unsafe"].includes(value))) {
      throw new Error("A stop cannot be overwritten.");
    }
    if (value === "try" && (state.tried || status === "revise")) throw new Error("Revise the wording first.");
    return { ...state, replies: { ...state.replies, [person]: value } };
  }
  if (type === "effect") {
    if (!state.tried) throw new Error("Record the actual trial before reporting its effects.");
    if (!["helped", "unchanged", "worse"].includes(value)) throw new RangeError("Unknown effect.");
    if (state.effects[person] === "worse" && value !== "worse") throw new Error("A reported harm requires review.");
    return { ...state, effects: { ...state.effects, [person]: value } };
  }
  throw new TypeError("Unknown care-step event.");
}
