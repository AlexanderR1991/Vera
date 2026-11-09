const edgeStatuses = ["verified", "unknown", "unavailable"];

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function readCheck(check, index, ids) {
  const label = `checks[${index}]`;
  if (!isRecord(check)) throw new TypeError(`${label} must be an object.`);

  const { id, actor, capability, scenario, start, targets, edges } = check;
  for (const [field, value] of Object.entries({ id, actor, capability, scenario, start })) {
    if (!isText(value)) throw new TypeError(`${label}.${field} must be a nonempty string.`);
  }
  if (ids.has(id)) throw new TypeError(`${label}.id must be unique.`);
  ids.add(id);

  if (!Array.isArray(targets) || targets.length === 0 || !Array.from(targets).every(isText)) {
    throw new TypeError(`${label}.targets must be a nonempty array of nonempty strings.`);
  }
  if (!Array.isArray(edges)) throw new TypeError(`${label}.edges must be an array.`);

  const outgoing = new Map();
  for (const [edgeIndex, edge] of edges.entries()) {
    const edgeLabel = `${label}.edges[${edgeIndex}]`;
    if (!isRecord(edge)) throw new TypeError(`${edgeLabel} must be an object.`);
    const { from, to, status, evidence } = edge;
    if (!isText(from) || !isText(to)) {
      throw new TypeError(`${edgeLabel}.from and .to must be nonempty strings.`);
    }
    if (!edgeStatuses.includes(status)) throw new TypeError(`${edgeLabel}.status is invalid.`);
    if ((status === "verified" || evidence !== undefined) && !isText(evidence)) {
      throw new TypeError(`${edgeLabel}.evidence must be a nonempty reference.`);
    }

    if (status === "unavailable") continue;
    if (!outgoing.has(from)) outgoing.set(from, []);
    outgoing.get(from).push(evidence === undefined ? { from, to, status } : { from, to, status, evidence });
  }

  return { id, actor, capability, scenario, start, targets: new Set(targets), outgoing };
}

function findPath(start, targets, outgoing, allowUnknown) {
  const parents = new Map([[start, null]]);
  const queue = [start];

  for (let i = 0; i < queue.length; i += 1) {
    const node = queue[i];
    if (targets.has(node)) {
      const nodes = [node];
      const edges = [];
      for (let edge = parents.get(node); edge !== null; edge = parents.get(edge.from)) {
        nodes.push(edge.from);
        edges.push(edge);
      }
      return { nodes: nodes.reverse(), edges: edges.reverse() };
    }

    for (const edge of outgoing.get(node) ?? []) {
      if ((!allowUnknown && edge.status === "unknown") || parents.has(edge.to)) continue;
      parents.set(edge.to, edge);
      queue.push(edge.to);
    }
  }

  return null;
}

export function assessVeraHorizon(input) {
  if (!isRecord(input) || !Array.isArray(input.checks) || input.checks.length === 0) {
    throw new TypeError("checks must be a nonempty array.");
  }

  const ids = new Set();
  const checks = Array.from(input.checks, (check, index) => {
    const { id, actor, capability, scenario, start, targets, outgoing } = readCheck(check, index, ids);
    const context = { id, actor, capability, scenario };
    const verifiedPath = findPath(start, targets, outgoing, false);
    if (verifiedPath) return { ...context, status: "verified", path: verifiedPath };

    const possiblePath = findPath(start, targets, outgoing, true);
    if (possiblePath) return { ...context, status: "unverified", path: possiblePath };
    return { ...context, status: "blocked", path: null };
  });

  const status = ["blocked", "unverified"].find((state) => checks.some((check) => check.status === state)) ?? "verified";
  return { status, checks };
}
