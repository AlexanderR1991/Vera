import test from "node:test";
import assert from "node:assert/strict";
import {createProposalState, reviseProposal, respondToProposal} from "../src/client/conversation-proposal.mjs";

const initial = () => createProposalState({text: "Test deliveries from 7 to 10, with step-free access.", roleIds: ["mara", "sam", "ari"]});

test("fictional roles start unanswered and one reply cannot imply agreement by others", () => {
  const start = initial();
  const reply = respondToProposal(start, "mara", "agree");
  assert.deepEqual(reply.responses, {mara: "agree", sam: "pending", ari: "pending"});
  assert.deepEqual(start.responses, {mara: "pending", sam: "pending", ari: "pending"});
  assert.deepEqual(reply.history, []);
});

test("rewording resets all responses and retains the previous wording and objections", () => {
  const accepted = respondToProposal(initial(), "mara", "agree");
  const rejected = respondToProposal(accepted, "ari", "decline");
  const next = reviseProposal(rejected, "  First clarify step-free access, then propose delivery hours.  ");
  assert.equal(next.revision, 2);
  assert.equal(next.text, "First clarify step-free access, then propose delivery hours.");
  assert.deepEqual(next.responses, {mara: "pending", sam: "pending", ari: "pending"});
  assert.equal(next.history[0].text, rejected.text);
  assert.deepEqual(next.history[0].responses, {mara: "agree", sam: "pending", ari: "decline"});
  assert.equal(rejected.revision, 1);
  assert.deepEqual(rejected.history, []);
  assert.equal(rejected.responses.ari, "decline");
});

test("unchanged wording and repeated responses do not create a new version", () => {
  const start = initial();
  assert.equal(reviseProposal(start, ` ${start.text}\n`), start);
  const answered = respondToProposal(start, "sam", "pause");
  assert.equal(respondToProposal(answered, "sam", "pause"), answered);
  assert.equal(reviseProposal(answered, answered.text), answered);
});

test("one role's dissent and harm remain visible when other roles agree", () => {
  const no = respondToProposal(initial(), "ari", "decline");
  const partial = respondToProposal(no, "mara", "agree");
  assert.equal(partial.responses.ari, "decline");
  const harmed = respondToProposal(partial, "ari", "worse");
  const othersAgree = respondToProposal(harmed, "sam", "agree");
  assert.deepEqual(othersAgree.responses, {mara: "agree", sam: "agree", ari: "worse"});
  assert.throws(() => respondToProposal(othersAgree, "ari", "agree"), /harm/);
  const newVersion = reviseProposal(othersAgree, "Pause the trial and review Ari's access concern first.");
  assert.equal(newVersion.history[0].responses.ari, "worse");
  const third = reviseProposal(newVersion, "Ask Ari what a usable route requires before any trial.");
  assert.equal(third.history[0].responses.ari, "worse");
  assert.equal(third.history[1].revision, 2);
  assert.equal(othersAgree.revision, 1);
  assert.deepEqual(othersAgree.history, []);
});

test("a fictional role can explicitly reconsider a decline or pause", () => {
  const no = respondToProposal(initial(), "ari", "decline");
  const reconsidered = respondToProposal(no, "ari", "pause");
  assert.equal(reconsidered.responses.ari, "pause");
  assert.equal(no.responses.ari, "decline");
});

test("invalid wording, unknown roles and invalid responses cannot update the proposal", () => {
  for (const roleIds of [[], ["a", "a"], ["a", " a "], [""], [null], "a"]) {
    assert.throws(() => createProposalState({text: "A test", roleIds}));
  }
  for (const text of ["", "  ", null, 42]) {
    assert.throws(() => createProposalState({text, roleIds: ["a"]}));
    assert.throws(() => reviseProposal(initial(), text));
  }
  assert.throws(() => respondToProposal(initial(), "unrepresented", "agree"));
  assert.throws(() => respondToProposal(initial(), "mara", "pending"));
  assert.throws(() => respondToProposal(initial(), "mara", "unanimous"));
  assert.throws(() => reviseProposal({...initial(), revision: 0}, "Changed"));
  assert.throws(() => reviseProposal({...initial(), revision: Number.MAX_SAFE_INTEGER}, "Changed"));
});
