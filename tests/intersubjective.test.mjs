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
  const before = {a:[0],b:[4],aEstimatesB:[0],bEstimatesA:[4]};
  const after = {a:[0],b:[4],aEstimatesB:[4],bEstimatesA:[0]};
  assert.deepEqual(bridgeChange(before,after),{fromBtoA:1,fromAtoB:1,agreement:0});
});

test("unchanged estimates do not count as gains when their references move", () => {
  const before = {a:[0],b:[0],aEstimatesB:[4],bEstimatesA:[4]};
  const after = { ...before, a:[4], b:[4] };
  assert.deepEqual(bridgeChange(before,after),{fromBtoA:null,fromAtoB:null,agreement:0});
});

test("a moving reference suppresses only its own direction", () => {
  const before = {a:[0,4],b:[4,4],aEstimatesB:[0,4],bEstimatesA:[4,0]};
  const after = {a:[4,0],b:[4,4],aEstimatesB:[4,4],bEstimatesA:[4,4]};
  assert.deepEqual(bridgeChange(before,after),{fromBtoA:null,fromAtoB:0.5,agreement:0});
  const shorter = {a:[4],b:[4],aEstimatesB:[4],bEstimatesA:[4]};
  assert.throws(() => bridgeChange(before, shorter), RangeError);
});

test("one-item agreement and directed accuracies are constrained jointly", () => {
  // Zero accuracy in both directions forces both reference answers to be endpoints.
  for (const a of [0, 4]) {
    for (const b of [0, 4]) {
      const s = bridgeSnapshot({a:[a],b:[b],aEstimatesB:[4-b],bEstimatesA:[4-a]});
      assert.equal(s.fromBtoA, 0);
      assert.equal(s.fromAtoB, 0);
      assert.equal(s.agreement, a === b ? 1 : 0);
    }
  }
});

test("rejects missing, incomparable, out-of-range and imprecise responses", () => {
  for(const [a,b] of [[[],[]],[[1],[1,2]],[[-1],[1]],[[1],[5]],[[1.1],[2]],[[NaN],[2]],[["1"],[1]]]) {
    assert.throws(()=>normalizedDistance(a,b),RangeError);
  }
  assert.throws(()=>bridgeSnapshot({a:[1],b:[2,3],aEstimatesB:[2],bEstimatesA:[1]}),RangeError);
});
