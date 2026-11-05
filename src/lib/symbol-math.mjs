// Original program logic: MIT. This module has no DOM or network dependencies.
function state(value) {
  if (!Number.isInteger(value) || value < 0 || value > 63) throw new RangeError('state');
  return value;
}

export const binaryWord = value => state(value).toString(2).padStart(6, '0');
export const linesBottomUp = value => Array.from({length: 6}, (_, i) => (state(value) >> i) & 1);
export function flipLine(value, index) {
  state(value);
  if (!Number.isInteger(index) || index < 0 || index > 5) throw new RangeError('line');
  return value ^ (1 << index);
}
export function hammingDistance(a, b) {
  return linesBottomUp(state(a) ^ state(b)).reduce((sum, bit) => sum + bit, 0);
}

// Exact upper-tail binomial model, evaluated in log space (floating-point arithmetic).
// A small tail must not become a displayed zero or a claimed probability of a hypothesis.
export function binomialUpperTail(n, k, p0, comparisons = 1) {
  if (!Number.isInteger(n) || n < 1 || n > 10000) throw new RangeError('n');
  if (!Number.isInteger(k) || k < 0 || k > n) throw new RangeError('k');
  if (!Number.isFinite(p0) || p0 <= 0 || p0 >= 1) throw new RangeError('p0');
  if (!Number.isInteger(comparisons) || comparisons < 1 || comparisons > 1000000) throw new RangeError('m');
  let logTail = 0;
  if (k > 0) {
    let logChoose = 0;
    for (let i = 1; i <= Math.min(k, n - k); i++) logChoose += Math.log(n - i + 1) - Math.log(i);
    let term = logChoose + k * Math.log(p0) + (n - k) * Math.log1p(-p0);
    let peak = term;
    let scaledSum = 1;
    for (let j = k; j < n; j++) {
      term += Math.log(n - j) - Math.log(j + 1) + Math.log(p0) - Math.log1p(-p0);
      if (term > peak) {
        scaledSum = scaledSum * Math.exp(peak - term) + 1;
        peak = term;
      } else scaledSum += Math.exp(term - peak);
    }
    logTail = Math.min(0, peak + Math.log(scaledSum));
  }
  const logAdjusted = Math.min(0, logTail + Math.log(comparisons));
  return {n, k, p0, comparisons, expected: n * p0, observed: k / n,
    difference: k / n - p0, logTail, logAdjusted,
    tail: Math.exp(logTail), adjusted: Math.exp(logAdjusted)};
}

export const worksheetKeys = ['symbol', 'meaning', 'variables', 'rule', 'prediction', 'alternative', 'test', 'revision', 'source'];
export function createWorksheet(values, language, createdAt) {
  if (!['de', 'en'].includes(language)) throw new RangeError('language');
  if (!['analogy', 'formal', 'empirical'].includes(values.claimType)) throw new RangeError('claimType');
  const fields = Object.fromEntries(worksheetKeys.map(key => [key, String(values[key] ?? '').trim()]));
  if (Object.values(fields).some(value => !value || value.length > 4000)) throw new RangeError('fields');
  if (typeof createdAt !== 'string' || !Number.isFinite(Date.parse(createdAt))) throw new RangeError('createdAt');
  return {schema: 'symbol-math-worksheet/v1', language, status: 'unreviewed_draft',
    createdAt, timestampAuthority: 'user_device_unverified', registered: false,
    claimType: values.claimType, fields};
}
