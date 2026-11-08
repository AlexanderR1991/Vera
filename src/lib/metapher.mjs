// Each route lists all its fallible dependencies between two protected endpoints.
// [] is no route at the outer level and a route without fallible dependencies inside.
const rules = {
  "any-route": routes => routes.length > 0,
  "two-routes": routes => routes.length >= 2,
  "disjoint-pair": routes => routes.some((a, index) =>
    routes.slice(index + 1).some(b => a.every(part => !b.includes(part)))),
  "single-failure": routes => routes.length > 0 &&
    !routes[0].some(part => routes.every(route => route.includes(part)))
};
export const ruleIds = Object.freeze(Object.keys(rules));

// Explicit fault simulation, independent of the intersection test in single-failure.
export function survivesFailure(routes, failed) {
  return routes.some(route => route.every(part => !failed.includes(part)));
}

function validateCase(item, training) {
  if (!item || typeof item.id !== "string" || !item.id.trim() || !Array.isArray(item.routes)) {
    throw new TypeError("Each case needs an id and a routes array.");
  }
  for (const route of item.routes) {
    if (!Array.isArray(route) || route.some(id => typeof id !== "string" || !id.trim() || id !== id.trim()) ||
        new Set(route).size !== route.length) {
      throw new TypeError(`Each route in ${item.id} must list distinct nonempty dependency names.`);
    }
  }
  if (training && ![true, false, null].includes(item.observed)) {
    throw new TypeError(`Observation ${item.id} needs observed: true, false or null.`);
  }
}

// Keep every rule consistent with the observations, in a fixed preference order.
export function learnMetaphor(observations, cases) {
  if (!Array.isArray(observations) || !Array.isArray(cases)) {
    throw new TypeError("Expected observations and cases arrays.");
  }
  let candidates = [...ruleIds];
  const history = observations.map(item => {
    validateCase(item, true);
    const { id, observed, routes } = item;
    const eliminated = candidates.filter(rule => observed !== null && rules[rule](routes) !== observed);
    candidates = candidates.filter(rule => !eliminated.includes(rule));
    return { id, observed, eliminated, candidates: [...candidates] };
  });
  const workingRule = candidates[0] ?? null;
  const predictions = cases.map(item => {
    validateCase(item, false);
    const answers = candidates.map(rule => rules[rule](item.routes));
    const agreed = new Set(answers).size === 1;
    return {
      id: item.id,
      workingPrediction: answers[0] ?? null,
      prediction: agreed ? answers[0] : null,
      status: agreed ? "agreed" : workingRule === null ? "no-compatible-rule" : "undetermined"
    };
  });
  return { candidates, workingRule, history, predictions };
}

// Synthetic teaching observations are supplied labels, never derived by the learner.
const observations = [
  { id: "musik-ein-kabel", metaphor: "Ein Kabel trägt die einzige Stimme.",
    routes: [["kabel"]], observed: false },
  { id: "verkehr-zwei-buslinien", metaphor: "Zwei Linien, eine Brücke.",
    routes: [["nordstrasse", "bruecke"], ["suedstrasse", "bruecke"]], observed: false },
  { id: "it-drei-datenwege", metaphor: "Drei Wege bilden ein Dreieck.",
    routes: [["a", "b"], ["b", "c"], ["c", "a"]], observed: true }
];

// Deliberately constructed transfer cases. Their labels are hidden from the learner.
const cases = [
  { id: "medien-drei-sender", routes: [["mast", "sender-1"], ["mast", "sender-2"], ["mast", "sender-3"]] },
  { id: "archiv-zwei-kopien", routes: [["lesegeraet", "platte"], ["schluessel", "papier"]] },
  { id: "bildung-ein-zugang", routes: [["portal", "konto"]] },
  { id: "logistik-kein-weg", routes: [] },
  { id: "technik-direktverbindung", routes: [[]] },
  { id: "buehne-lichtwege", routes: [["rot", "gruen", "blau"], ["gruen", "blau", "gelb"],
    ["blau", "gelb", "rot"], ["gelb", "rot", "gruen"]] }
];

export function demoMetaphor() {
  const before = learnMetaphor([], cases);
  const after = learnMetaphor(observations, cases);
  const withoutImage = learnMetaphor(observations.map(({ id, routes, observed }) =>
    ({ id, routes, observed })), cases);
  const comparisons = cases.map(({ id, routes }, i) => {
    const dependencies = [...new Set(routes.flat())];
    const failed = [[], ...dependencies.map(part => [part])];
    const failureChecks = failed.map(parts => ({ failed: parts, survives: survivesFailure(routes, parts) }));
    return {
      id, routes, failureChecks, expected: failureChecks.every(check => check.survives),
      before: before.predictions[i].workingPrediction, after: after.predictions[i].workingPrediction,
      consensusBefore: before.predictions[i].prediction, consensusAfter: after.predictions[i].prediction,
      twoRoutes: rules["two-routes"](routes), literalRule: rules["single-failure"](routes)
    };
  });
  const correct = key => comparisons.filter(row => row[key] === row.expected).length;
  function consensusCounts(key) {
    const open = comparisons.filter(row => row[key] === null).length;
    const agreed = comparisons.length - open;
    const hits = correct(key);
    return { agreed, correct: hits, wrong: agreed - hits, open };
  }
  const archive = cases.find(item => item.id === "archiv-zwei-kopien");
  const coupledFailure = ["lesegeraet", "schluessel"];
  return {
    scope: "Synthetic, completely specified routes between protected endpoints. Baseline and every single listed dependency failure must leave at least one route.",
    observations, history: after.history, initialWorkingRule: before.workingRule,
    finalWorkingRule: after.workingRule, finalCandidates: after.candidates, comparisons,
    correct: { total: cases.length, before: correct("before"), after: correct("after"),
      twoRoutes: correct("twoRoutes"), literalRule: correct("literalRule") },
    consensus: { before: consensusCounts("consensusBefore"), after: consensusCounts("consensusAfter") },
    unchangedWithoutImage: after.predictions.every((row, i) =>
      row.prediction === withoutImage.predictions[i].prediction),
    boundary: { id: archive.id, singleFailurePrediction: rules["single-failure"](archive.routes),
      coupledFailure, survivesCoupledFailure: survivesFailure(archive.routes, coupledFailure) }
  };
}
