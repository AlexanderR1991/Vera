import test from "node:test";
import assert from "node:assert/strict";
import {assessOption, comparisonNote, appendComparison} from "../src/lib/inquiry-comparison.mjs";
import {maxFieldLength} from "../src/lib/inquiry.mjs";

const check = (criterion, name, answer) => {
  const initial = assessOption(criterion, name, "open", null);
  return assessOption(criterion, name, answer, initial);
};

test("one requirement yields a separate, self-reported result for each option", () => {
  const rooms = [check("Stufenloser Eingang", "Saal", "no"), check("Stufenloser Eingang", "Aula", "open")];
  assert.equal(comparisonNote(rooms, "de"), "Meine Einschätzung zur Bedingung „Stufenloser Eingang“\nSaal — Erfüllt die Bedingung nicht.\nAula — Noch offen.");
  const formats = [check("Preserves dimensions", "STEP", "open"), check("Preserves dimensions", "DXF", "yes")];
  assert.equal(comparisonNote(formats, "en"), "My assessment of the requirement “Preserves dimensions”\nSTEP — Still open.\nDXF — Meets the requirement.");
});

test("editing a criterion or option reopens just the assessments it invalidates", () => {
  const options = [check("Stufenlos", "Saal", "yes"), check("Stufenlos", "Aula", "no")];
  const recheck = (option, criterion, name) => assessOption(criterion, name, option.answer, option).answer;
  assert.deepEqual(options.map(option => recheck(option, "Breite Tür", option.name)), ["open", "open"]);
  assert.deepEqual(options.map((option, index) => recheck(option, "Stufenlos", index ? option.name : "Forum")), ["open", "no"]);
  assert.equal(recheck(options[0], " Stufenlos ", " Saal "), "yes");
  assert.equal(assessOption("Stufenlos", "Saal", "maybe", options[0]).answer, "open");
});

test("blank inputs and mismatched requirements cannot produce a worksheet entry", () => {
  const room = check("Stufenlos", "Aula", "yes");
  for (const option of [check("", "Saal", "yes"), check("Stufenlos", "  ", "yes")]) {
    assert.equal(option.answer, "open");
    assert.equal(comparisonNote([room, option], "de"), "");
  }
  assert.equal(comparisonNote([room, check("Barrierefreies WC", "Saal", "yes")], "de"), "");
});

test("transfer is additive, repeatable without duplicates and respects remaining space", () => {
  const note = comparisonNote([check("Stufenlos", "Aula", "yes"), check("Stufenlos", "Zelt", "no")], "de");
  const existing = "Eigene Notizen.\n ";
  const added = appendComparison(existing, note, maxFieldLength);
  assert.deepEqual(added, {status: "added", value: existing + "\n\n" + note});
  const withLaterNotes = added.value + "\nNoch einmal nachsehen.";
  assert.deepEqual(appendComparison(withLaterNotes, note, maxFieldLength), {status: "duplicate", value: withLaterNotes});
  assert.deepEqual(appendComparison(existing, "", maxFieldLength), {status: "incomplete", value: existing});
  assert.equal(appendComparison("", note, maxFieldLength).value, note);
  const exact = "a".repeat(maxFieldLength - 2 - note.length);
  assert.equal(appendComparison(exact, note, maxFieldLength).value.length, maxFieldLength);
  assert.deepEqual(appendComparison(exact + "a", note, maxFieldLength), {status: "full", value: exact + "a"});
});
