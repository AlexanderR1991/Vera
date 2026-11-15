import assert from "node:assert/strict";
import { test } from "node:test";
import { runInquiry } from "../runtime/inquiry.mjs";
import { createInquiryDraftRecord } from "../runtime/recorded-inquiry.mjs";

const at="2026-11-15T05:00:00Z";
const question="Synthetic: what is known?";
const makeDraft=content=>runInquiry({messages:[{role:"user",content:question}],
  adapter:{generate:async()=>({message:{role:"assistant",content},finishReason:"stop"})}});
const record=draft=>createInquiryDraftRecord({id:"TEXT-CHECK",at,draft});

test("recording rejects disagreement among answer text, raw message and final conversation entry",async()=>{
  const original=await makeDraft("The evidence remains uncertain.  ");
  for(const change of [
    d=>{d.content="The evidence is conclusive.";},
    d=>{d.message.content="A different raw answer.";},
    d=>{d.messages.at(-1).content="A different conversation answer.";}
  ]) {
    const changed=structuredClone(original);
    change(changed);
    const snapshot=structuredClone(changed);
    assert.throws(()=>record(changed),/answer text.*match/);
    assert.deepEqual(changed,snapshot);
  }
});

test("recording preserves raw whitespace while accepting the runtime and ledger normalizations",async()=>{
  const raw="  Original synthetic answer.  \n";
  const draft=await makeDraft(raw);
  const snapshot=structuredClone(draft);
  const wrapper=record(draft);
  assert.equal(draft.content,raw.trimEnd());
  assert.equal(wrapper.draft.message.content,raw);
  assert.equal(wrapper.draft.messages.at(-1).content,raw);
  assert.equal(wrapper.record.versions[0].statement,raw.trim());
  assert.equal(wrapper.record.events[0].text,raw.trim());
  assert.deepEqual(wrapper.draft,snapshot);
  assert.deepEqual(draft,snapshot);
  assert.equal(wrapper.provenance.authenticated,false);
});

test("present conversation must end with the raw assistant answer; explicit unverified question remains supported",async()=>{
  const draft=await makeDraft("Original answer.");
  for(const message of [null,{content:null},{content:12}]) {
    assert.throws(()=>record({...draft,message}),/answer text.*match/);
  }
  for(const messages of [null,[],"not a conversation",[{role:"user",content:draft.message.content}],
    [{role:"assistant",content:"Another answer."}]]) {
    assert.throws(()=>record({...draft,messages}),/answer text.*match/);
  }
  for(const messages of [undefined,[{role:"assistant",content:draft.message.content}]]) {
    const wrapper=createInquiryDraftRecord({id:"IMPORT-TEXT",at,question,draft:{...draft,messages}});
    assert.equal(wrapper.provenance.question_binding,"operator_supplied_unverified");
    assert.equal(wrapper.provenance.authenticated,false);
    assert.deepEqual(wrapper.authority,{publish:false,humanDecision:false,updateWeights:false});
  }
  const noMessage=structuredClone(draft);
  delete noMessage.message;
  assert.equal(record(noMessage).record.events[0].text,draft.content);
  delete noMessage.messages;
  const minimal=createInquiryDraftRecord({id:"MINIMAL-TEXT",at,question,draft:noMessage});
  assert.equal(minimal.provenance.question_binding,"operator_supplied_unverified");
  assert.equal(minimal.provenance.authenticated,false);
});
