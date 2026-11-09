import test from "node:test";
import assert from "node:assert/strict";
import {selectBoardTrends} from "../src/lib/forum-trends.mjs";

const now = Date.parse("2026-11-09T12:00:00Z");
const ago = hours => new Date(now - hours * 60 * 60 * 1000).toISOString();
const snapshot = (trends, generatedAt = ago(1)) => ({version: 1, generatedAt, trends});
const pin = (cardId, issueNumber, expiresAt = Date.parse(ago(-7))) => ({cardId, issueNumber, expiresAt});
const topic = (placeId, issueNumber, extras = {}) => ({
  placeId, issueNumber, sectionId: "", participants: 2, lastActivityAt: ago(3), ...extras
});
const cards = [
  {id: "politics-garden", placeId: "politics", sectionId: "garden"},
  {id: "nutrition", placeId: "nutrition"},
  {id: "politics", placeId: "politics"},
  {id: "art", placeId: "art", sectionId: "artwork"},
  {id: "parenting", placeId: "parenting"}
];

test("pinboard selects at most three places by participants, recency, then issue number", () => {
  const feed = snapshot([
    topic("parenting", 8),
    topic("nutrition", 9, {lastActivityAt: ago(2)}),
    topic("art", 7),
    topic("politics", 10, {participants: 3, lastActivityAt: ago(48)}),
    topic("politics", 1),
    topic("unknown", 1, {participants: 6})
  ]);
  assert.deepEqual(selectBoardTrends(feed, cards, now), [
    pin("politics", 10), pin("nutrition", 9), pin("art", 7)
  ]);
  assert.deepEqual(cards.map(card => card.id), ["politics-garden", "nutrition", "politics", "art", "parenting"]);
});

test("pinboard prefers a section match, then the general tile, then the first tile for the place", () => {
  const feed = snapshot([
    topic("politics", 1, {sectionId: "garden"}),
    topic("art", 2, {sectionId: "other"})
  ]);
  assert.deepEqual(selectBoardTrends(feed, cards, now), [
    pin("politics-garden", 1), pin("art", 2)
  ]);
  assert.deepEqual(selectBoardTrends(snapshot([topic("politics", 3, {sectionId: "other"})]), cards, now), [
    pin("politics", 3)
  ]);
});

test("pinboard ignores blank, malformed, future and expired snapshots", () => {
  const trends = [topic("art", 1)];
  for (const feed of [
    undefined, snapshot([]), {...snapshot(trends), version: 2}, {...snapshot(trends), trends: {}},
    snapshot(trends, "2026-09-31T12:00:00Z"), snapshot(trends, "2026-11-09"),
    snapshot(trends, ago(8)), snapshot(trends, ago(-1))
  ]) {
    assert.deepEqual(selectBoardTrends(feed, cards, now), []);
  }
});

test("pinboard admits current integer counts and identifiers only", () => {
  const feed = snapshot([
    null,
    topic("parenting", 0),
    topic("parenting", "1"),
    topic("art", 2, {lastActivityAt: ago(73)}),
    topic("art", 3, {lastActivityAt: ago(0)}),
    topic("nutrition", 4, {participants: 1}),
    topic("nutrition", 5, {participants: 2.5}),
    topic("politics", 6, {sectionId: null}),
    topic("parenting", 7, {lastActivityAt: "2026-11-06T12:00:00Z"}),
    topic("parenting", 8, {lastActivityAt: "2026-11-06T13:00:00Z"})
  ]);
  assert.deepEqual(selectBoardTrends(feed, cards, now), [pin("parenting", 8, Date.parse(ago(-1)))]);
});
