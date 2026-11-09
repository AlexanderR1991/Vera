import assert from "node:assert/strict";
import test from "node:test";
import {groupSourceReadings, worldviewSources} from "../src/lib/worldview-sources.mjs";

test("the meal pilot distinguishes textual support, editorial application and practice", () => {
  const {text, application, practice, contrary, open} = groupSourceReadings("shareFood");
  assert.equal(text.length, 6);
  assert.deepEqual(application.map(source => source.label.en), ["Modern humanism"]);
  assert.deepEqual(practice.map(source => source.label.en), ["Ngāi Tahu in Aotearoa"]);
  assert.deepEqual([...contrary, ...open], []);
});

test("only explicit annotations bear on a narrower proposition", () => {
  const gratitude = groupSourceReadings("expectNoThanks");
  const divine = groupSourceReadings("requiresDivineGround");
  assert.deepEqual(gratitude.text.map(source => source.label.en), ["Qur’an"]);
  assert.equal(gratitude.open.length, worldviewSources.length - 1);
  assert.deepEqual(divine.contrary.map(source => source.label.en), ["Modern humanism"]);
  assert.equal(divine.open.length, worldviewSources.length - 1);
  assert.deepEqual(groupSourceReadings("newQuestion").open, worldviewSources);
  const unannotated = {kind: "text"};
  assert.deepEqual(groupSourceReadings("shareFood", [unannotated]).open, [unannotated]);
});
