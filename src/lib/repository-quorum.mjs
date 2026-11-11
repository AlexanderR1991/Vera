/** Local set-threshold analysis; does not authenticate, count votes or authorize actions. */
export function analyzeRepositoryQuorum(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError("Expected {n, f, q} with safe integer counts.");
  }
  const {n, f, q} = input;
  for (const [name, value] of Object.entries({n, f, q})) {
    if (!Number.isSafeInteger(value)) throw new TypeError(`${name} must be a safe integer.`);
  }
  if (n < 1 || f < 0 || f >= n || q < 1 || q > n) {
    throw new RangeError("Require n >= 1, 0 <= f < n and 1 <= q <= n.");
  }
  // Intermediate sums can exceed Number.MAX_SAFE_INTEGER even for valid inputs.
  const N = BigInt(n), F = BigInt(f), Q = BigInt(q);
  const overlap = 2n * Q - N;
  const minimumQuorumIntersection = overlap > 0n ? overlap : 0n;
  const nonfaulty = minimumQuorumIntersection - F;
  const minimumNonfaultyIntersection = nonfaulty > 0n ? nonfaulty : 0n;
  return Object.freeze({
    n, f, q,
    scope: "threshold_analysis_only",
    faultyAloneCannotApprove: Q > F,
    othersCanApproveWithoutFaulty: Q <= N - F,
    quorumsMustShareNonfaulty: minimumNonfaultyIntersection > 0n,
    minimumQuorumIntersection: Number(minimumQuorumIntersection),
    minimumNonfaultyIntersection: Number(minimumNonfaultyIntersection)
  });
}
