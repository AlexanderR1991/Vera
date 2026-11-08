// M-02: Illustrative operational model, not a validated psychological instrument.
// All items must be explicitly agreed, anchored and comparable.
// Differences between ordinal numbers are treated as equally spaced by assumption.
const MAX = 4;

function checkPair(left, right) {
  if (!Array.isArray(left) || !Array.isArray(right) || left.length === 0 || left.length !== right.length) {
    throw new RangeError("Expected two non-empty equally sized response arrays");
  }
  for (const response of [...left, ...right]) {
    if (!Number.isInteger(response) || response < 0 || response > MAX) {
      throw new RangeError("Responses must be integers from 0 to 4");
    }
  }
}

export function normalizedDistance(left, right) {
  checkPair(left, right);
  return left.reduce((sum, value, index) => sum + Math.abs(value - right[index]), 0) / (MAX * left.length);
}

// Self-described positions and the other person's estimates on the same items.
export function restatementAccuracy(selfPosition, othersEstimate) {
  return 1 - normalizedDistance(selfPosition, othersEstimate);
}

export function positionAgreement(selfA, selfB) {
  return 1 - normalizedDistance(selfA, selfB);
}

export function bridgeSnapshot({a, b, aEstimatesB, bEstimatesA}) {
  // Check all pairs separately to enforce identical item length and valid entries.
  const fromBtoA = restatementAccuracy(a, bEstimatesA);
  const fromAtoB = restatementAccuracy(b, aEstimatesB);
  const agreement = positionAgreement(a, b);
  return {fromBtoA, fromAtoB, agreement, mutualFloor: Math.min(fromAtoB, fromBtoA)};
}

// Both observations must use the same anchored questions in the same order.
export function bridgeChange(before, after) {
  const first = bridgeSnapshot(before);
  const last = bridgeSnapshot(after);
  if (before.a.length !== after.a.length) {
    throw new RangeError("Expected the same number of items in both observations");
  }
  const sameA = before.a.every((answer, index) => answer === after.a[index]);
  const sameB = before.b.every((answer, index) => answer === after.b[index]);
  return {
    fromBtoA: sameA ? last.fromBtoA - first.fromBtoA : null,
    fromAtoB: sameB ? last.fromAtoB - first.fromAtoB : null,
    agreement: last.agreement - first.agreement
  };
}
