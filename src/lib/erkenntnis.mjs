export const tests = Object.freeze(["build", "publication", "live"]);

// One fictional release, from left to right. Each row predicts all three tests.
const states = [
  { id: "unbuilt", predictions: [false, false, false] },
  { id: "built", predictions: [true, false, false] },
  { id: "published", predictions: [true, true, false] },
  { id: "visible", predictions: [true, true, true] }
];

export function assessErkenntnis(observations) {
  if (!Array.isArray(observations)) throw new TypeError("Expected an array of observations");
  const evidence = Array.from(observations, (observation) => {
    const index = tests.indexOf(observation?.test);
    if (index < 0 || typeof observation.value !== "boolean") {
      throw new TypeError("Each observation needs a known test and a boolean result");
    }
    return { index, value: observation.value };
  });
  const possible = states.filter(state =>
    evidence.every(({ index, value }) => state.predictions[index] === value)
  );

  const comparison = tests.map((test, index) => {
    const yes = possible.filter(state => state.predictions[index]).length;
    const no = possible.length - yes;
    return { test, yes, no, worst: Math.max(yes, no) };
  });

  let next = null;
  for (const candidate of comparison) {
    if (candidate.worst < (next?.worst ?? possible.length)) next = candidate;
  }

  const status = possible.length === 0 ? "conflict" : possible.length === 1 ? "resolved" : "open";
  return { status, possible: possible.map(state => state.id), comparison, next };
}
