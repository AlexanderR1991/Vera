// Local intake for draft review. The host supplies routing and review outcomes.
const nonblank = value => typeof value === "string" && value.trim().length > 0;

function snapshot(record) {
  return {...record, history: record.history.map(event => ({...event}))};
}

export function createParticipationQueue({lanes = ["default"]} = {}) {
  if (!Array.isArray(lanes) || !lanes.length || !Array.from(lanes).every(nonblank) || new Set(lanes).size !== lanes.length) {
    throw new TypeError("Review lanes must be unique nonblank strings");
  }

  const queues = new Map(lanes.map(lane => [lane, {ids: [], offset: 0}]));
  const active = new Set();
  const records = new Map();

  function enqueue(record) {
    queues.get(record.lane).ids.push(record.id);
    active.add(record.lane);
  }

  function submit({id, lane = "default", text} = {}) {
    if (!nonblank(id) || !nonblank(text) || !queues.has(lane)) {
      throw new TypeError("Submission needs an ID, text, and a configured review lane");
    }
    const previous = records.get(id);
    if (previous) {
      if (previous.lane !== lane || previous.text !== text) throw new Error("Conflicting submission ID");
      return snapshot(previous);
    }

    const record = {id, lane, text, status: "pending", history: []};
    records.set(id, record);
    enqueue(record);
    return snapshot(record);
  }

  function next() {
    const {value: lane, done} = active.values().next();
    if (done) return null;

    // Rotate among backlogged lanes, taking one FIFO entry per turn.
    const queue = queues.get(lane);
    const record = records.get(queue.ids[queue.offset]);
    queue.offset++;
    active.delete(lane);
    if (queue.offset < queue.ids.length) active.add(lane);
    if (queue.offset * 2 >= queue.ids.length) {
      queue.ids = queue.ids.slice(queue.offset);
      queue.offset = 0;
    }

    record.status = "reviewing";
    return snapshot(record);
  }

  function complete(id, {outcome, reason} = {}) {
    const record = records.get(id);
    if (record?.status !== "reviewing") throw new Error("Submission must be reviewing");
    if (!nonblank(outcome) || !nonblank(reason)) throw new TypeError("Review needs an outcome and a reason");

    record.history.push({type: "completed", outcome, reason});
    record.status = "completed";
    return snapshot(record);
  }

  function appeal(id, reason) {
    const record = records.get(id);
    if (record?.status !== "completed") throw new Error("Submission must be completed");
    if (!nonblank(reason)) throw new TypeError("Appeal needs a reason");

    record.history.push({type: "appealed", reason});
    record.status = "pending";
    enqueue(record);
    return snapshot(record);
  }

  function get(id) {
    const record = records.get(id);
    return record ? snapshot(record) : null;
  }

  return {submit, next, complete, appeal, get};
}
