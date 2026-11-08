import assert from "node:assert/strict";
import {access} from "node:fs/promises";
import test from "node:test";
import collection from "../public/knowledge/art-works.v1.json" with {type:"json"};
import {artInquiry, artSubmission, artWorksheet} from "../src/lib/art-inquiry.mjs";

test("works have unique anchors, localized inquiry fields and public source links", async () => {
  assert.equal(collection.schema_version, 1);
  assert.equal(collection.reading_status, "editorial_draft");
  assert.ok(collection.works.length);
  const ids = new Set();
  for (const work of collection.works) {
    assert.match(work.id, /^art-\d{2,}$/);
    assert.ok(!ids.has(work.id), "duplicate work ID " + work.id);
    ids.add(work.id);
    for (const lang of ["de", "en"]) {
      for (const key of ["title", "credit", ...Object.keys(artInquiry[lang].fields)]) {
        assert.ok(work[key]?.[lang]?.trim(), [work.id, key, lang].join("/"));
      }
      assert.ok(work.sources.length && work.sources.every(source => source.label[lang]?.trim()));
    }
    for (const source of work.sources) assert.equal(new URL(source.url).protocol, "https:");
    if (work.image) {
      assert.ok(work.image.credit && work.image.alt.de && work.image.alt.en);
      assert.ok(work.image.width > 0 && work.image.height > 0);
      await access(new URL("../public/" + work.image.path, import.meta.url));
    }
  }
});

test("a new or existing work produces a reviewable worksheet in either language", () => {
  for (const lang of ["de", "en"]) {
    const empty = artWorksheet(lang);
    assert.ok(empty.includes(artInquiry[lang].proposal));
    assert.ok(empty.includes(artSubmission));
    for (const work of collection.works) {
      const worksheet = artWorksheet(lang, work);
      for (const field of ["title", "observation", "reading", "counterreading", "transfer", "test"]) {
        assert.ok(worksheet.includes(work[field][lang]));
      }
      for (const source of work.sources) assert.ok(worksheet.includes(source.url));
      assert.ok(worksheet.includes(artInquiry[lang].draft));
    }
  }
});
