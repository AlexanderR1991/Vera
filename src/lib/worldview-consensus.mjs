function addId(ids, id, label) {
  if (typeof id !== "string" || !id.trim() || ids.has(id)) {
    throw new TypeError(`Expected distinct nonblank ${label} IDs.`);
  }
  ids.add(id);
}

function isRecord(value) {
  if (value === null || typeof value !== "object") return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

// Private or hypothetical comparison. Each option ID names one exact wording and context.
// Only the supplied responses are counted. People, feasibility and rights are unverified.
export function evaluateWorldviewOptions(people, options) {
  if (!Array.isArray(people) || !Array.isArray(options)) {
    throw new TypeError("Expected arrays of people and options.");
  }
  const participants = new Set();
  for (const person of people) addId(participants, person, "participant");

  const optionIds = new Set();
  const results = [];
  for (const option of options) {
    if (!isRecord(option) || !Object.hasOwn(option, "id") || !Object.hasOwn(option, "responses")) {
      throw new TypeError("Each option needs an ID and a response record.");
    }
    const { id, responses } = option;
    addId(optionIds, id, "option");
    if (!isRecord(responses)) throw new TypeError("Expected a response record.");
    for (const person of Reflect.ownKeys(responses)) {
      if (!participants.has(person)) throw new TypeError("Response from an unknown participant.");
    }

    const groups = { agree: [], object: [], pass: [], pending: [] };
    for (const person of participants) {
      const response = Object.hasOwn(responses, person) ? responses[person] : "pending";
      if (typeof response !== "string" || !Object.hasOwn(groups, response)) {
        throw new TypeError("Expected agree, object, pass or pending.");
      }
      groups[response].push(person);
    }
    let state = "open";
    if (groups.object.length) state = "object";
    else if (participants.size > 0 && groups.agree.length === participants.size) state = "shared";
    results.push({ id, state, ...groups });
  }
  return results;
}
