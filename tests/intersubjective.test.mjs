import test from "node:test";
import assert from "node:assert/strict";
import {normalizedDistance, restatementAccuracy, positionAgreement, bridgeSnapshot, bridgeChange} from "../src/lib/intersubjective.mjs";

test("M-02.1: accurate restatements permit maximum disagreement", () => {
  const s = bridgeSnapshot({a:[0],b:[4],aEstimatesB:[4],bEstimatesA:[0]});
  assert.deepEqual(s,{fromBtoA:1,fromAtoB:1,agreement:0,mutualFloor:1});
});

test("M-02.1: identical opinions do not imply accurate restatement", () => {
  const s = bridgeSnapshot({a:[4],b:[4],aEstimatesB:[0],bEstimatesA:[0]});
  assert.deepEqual(s,{fromBtoA:0,fromAtoB:0,agreement:1,mutualFloor:0});
});

test("preserves both directions when only one accurately understands the other", () => {
  const s = bridgeSnapshot({a:[0,1],b:[4,3],aEstimatesB:[4,3],bEstimatesA:[4,4]});
  assert.equal(s.fromAtoB,1);
  assert.equal(s.fromBtoA,1 - 7/8);
  assert.equal(s.mutualFloor,s.fromBtoA);
});

test("distance respects extremes and an average over equal, anchored items", () => {
  assert.equal(normalizedDistance([0,4],[4,0]),1);
  assert.equal(normalizedDistance([0,2],[0,4]),0.25);
  assert.equal(restatementAccuracy([0,2],[0,4]),0.75);
  assert.equal(positionAgreement([1],[1]),1);
});

test("a better restatement does not require improved agreement", () => {
  const before = bridgeSnapshot({a:[0],b:[4],aEstimatesB:[0],bEstimatesA:[4]});
  const after = bridgeSnapshot({a:[0],b:[4],aEstimatesB:[4],bEstimatesA:[0]});
  assert.deepEqual(bridgeChange(before,after),{fromBtoA:1,fromAtoB:1,agreement:0});
});

test("rejects missing, incomparable, out-of-range and imprecise responses", () => {
  for(const [a,b] of [[[],[]],[[1],[1,2]],[[-1],[1]],[[1],[5]],[[1.1],[2]],[[NaN],[2]],[["1"],[1]]]) {
    assert.throws(()=>normalizedDistance(a,b),RangeError);
  }
  assert.throws(()=>bridgeSnapshot({a:[1],b:[2,3],aEstimatesB:[2],bEstimatesA:[1]}),RangeError);
});
