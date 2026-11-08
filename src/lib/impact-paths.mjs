// Each edge points from a changed node to a potentially affected one. The
// optional start label lets typed callers keep their root in a separate ID space.
export function impactPaths(dependents, start, startLabel = start) {
  const seen = new Set([start]);
  const queue = [{id: start, path: [startLabel]}];
  for (let cursor = 0; cursor < queue.length; cursor++) {
    const {id, path} = queue[cursor];
    for (const next of [...(dependents.get(id) ?? [])].sort()) {
      if (seen.has(next)) continue;
      seen.add(next);
      queue.push({id: next, path: [...path, next]});
    }
  }
  return queue.slice(1);
}
