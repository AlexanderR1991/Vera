import test from "node:test";
import assert from "node:assert/strict";
import {createInquiry, inquiryFields, parseInquiry} from "../src/lib/inquiry.mjs";
import {inquiryTools} from "../src/lib/inquiry-tools.mjs";

test("each tool has a stable entry point, existing worksheet fields and bilingual instructions", () => {
  const ids = inquiryTools.map(tool => tool.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ["observe", "compare", "perspectives", "experiment"]) assert.ok(ids.includes(id));
  for (const tool of inquiryTools) {
    assert.ok(inquiryFields.includes(tool.input), tool.id);
    assert.ok(inquiryFields.includes(tool.output), tool.id);
    for (const key of ["title", "question", "example", "input", "output"]) {
      assert.ok(tool.de[key]?.trim(), tool.id + " de." + key);
      assert.ok(tool.en[key]?.trim(), tool.id + " en." + key);
      assert.notEqual(tool.de[key], tool.en[key], tool.id + "." + key);
    }
    if (tool.next) assert.ok(ids.includes(tool.next), tool.id);
  }
});

test("a comparison can feed a trial through an exported and reopened worksheet", () => {
  const comparison = inquiryTools.find(tool => tool.id === "compare");
  const trial = inquiryTools.find(tool => tool.id === comparison.next);
  assert.equal(trial.id, "experiment");
  assert.equal(comparison.output, "support");
  const note = createInquiry({question: "Welcher Raum passt?", [comparison.output]: "Raum B bleibt offen."});
  const reopened = parseInquiry(JSON.stringify(note));
  assert.equal(reopened[trial.input], "Raum B bleibt offen.");
  const updated = createInquiry({...reopened, [trial.output]: "Eingang von Raum B besichtigen."});
  assert.equal(updated.action, "Eingang von Raum B besichtigen.");
  assert.equal(updated.question, note.question);
  assert.equal(updated.support, note.support);
});
