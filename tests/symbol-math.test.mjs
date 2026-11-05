import test from 'node:test';
import assert from 'node:assert/strict';
import {binaryWord, linesBottomUp, flipLine, hammingDistance, binomialUpperTail, createWorksheet, worksheetKeys} from '../src/lib/symbol-math.mjs';

const near = (a, b, tolerance = 1e-10) => assert.ok(Math.abs(a - b) <= tolerance, `${a} != ${b}`);

test('all 64 line patterns map bijectively, bottom line is least significant', () => {
  const words = new Set();
  for (let value = 0; value < 64; value++) {
    words.add(binaryWord(value));
    assert.equal(linesBottomUp(value).reduce((sum, bit, i) => sum + bit * 2 ** i, 0), value);
    const neighbours = new Set();
    for (let i = 0; i < 6; i++) {
      const next = flipLine(value, i);
      assert.equal(flipLine(next, i), value);
      assert.equal(hammingDistance(value, next), 1);
      neighbours.add(next);
    }
    assert.equal(neighbours.size, 6);
    assert.equal(hammingDistance(value, 63 ^ value), 6);
  }
  assert.equal(words.size, 64);
  assert.deepEqual(linesBottomUp(1), [1, 0, 0, 0, 0, 0]);
  assert.equal(binaryWord(32), '100000');
});

test('binomial tail agrees with enumerating every outcome of a short fair-coin experiment', () => {
  for (let n = 1; n <= 10; n++) {
    for (let k = 0; k <= n; k++) {
      let count = 0;
      for (let outcome = 0; outcome < 2 ** n; outcome++) {
        if (outcome.toString(2).replaceAll('0', '').length >= k) count++;
      }
      near(binomialUpperTail(n, k, .5).tail, count / 2 ** n);
    }
  }
});

test('asymmetric cases, known example and Bonferroni family correction', () => {
  near(binomialUpperTail(3, 2, .2).tail, .104);
  near(binomialUpperTail(20, 15, .5).tail, 21700 / 1048576);
  near(binomialUpperTail(20, 15, .5, 3).adjusted, 3 * 21700 / 1048576);
  assert.equal(binomialUpperTail(20, 15, .5, 100).adjusted, 1);
  assert.equal(binomialUpperTail(100, 0, .2).tail, 1);
});

test('log tails remain finite for rare outcomes and large samples', () => {
  near(binomialUpperTail(10000, 10000, .5).logTail, 10000 * Math.log(.5));
  near(binomialUpperTail(10000, 1, .00001).tail, -Math.expm1(10000 * Math.log1p(-.00001)), 1e-9);
  near(binomialUpperTail(10000, 9999, .99999).tail, .995321568054844, 1e-8);
  const tail = binomialUpperTail(10000, 5000, .5).tail;
  assert.ok(tail > .503 && tail < .505);
});

test('invalid statistical and binary inputs fail closed', () => {
  for (const args of [[0,0,.5], [10001,0,.5], [3,4,.5], [3,-1,.5], [3,1.1,.5], [3,1,0], [3,1,1], [3,1,NaN], [3,1,.5,0], [3,1,.5,1.5]]) {
    assert.throws(() => binomialUpperTail(...args), RangeError);
  }
  for (const value of [-1, 64, 1.5, NaN]) assert.throws(() => binaryWord(value), RangeError);
  assert.throws(() => flipLine(0, 6), RangeError);
});

test('worksheet retains draft status, explicit assumptions and unverified timestamp', () => {
  const values = Object.fromEntries(worksheetKeys.map(key => [key, '  example  ']));
  values.claimType = 'empirical';
  const sheet = createWorksheet(values, 'de', '2026-11-05T12:00:00.000Z');
  assert.equal(sheet.registered, false);
  assert.equal(sheet.status, 'unreviewed_draft');
  assert.equal(sheet.fields.symbol, 'example');
  assert.equal(sheet.timestampAuthority, 'user_device_unverified');
  assert.throws(() => createWorksheet({...values, test: ' '}, 'de', sheet.createdAt), RangeError);
  assert.throws(() => createWorksheet({...values, claimType: 'proven'}, 'de', sheet.createdAt), RangeError);
});
