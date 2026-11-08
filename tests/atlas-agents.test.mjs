import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {fields, topics} from "../src/lib/tree.mjs";

const registry = JSON.parse(
  await readFile(new URL("../public/ai/atlas-agents.v0.json", import.meta.url), "utf8")
);

test("specialist role registry matches all current Atlas topics and field mappings", () => {
  assert.equal(registry.status, "unreviewed_design");
  assert.equal(registry.enabled, false);
  assert.equal(registry.atlas.expected_topic_count, topics.length);
  assert.deepEqual([...registry.atlas.fields].sort(), fields.map(f => f.id).sort());
  assert.deepEqual(
    registry.specialist_roles.map(r => r.topic_id).sort(),
    topics.map(t => t.id).sort()
  );
  for (const topic of topics) {
    const role = registry.specialist_roles.find(r => r.topic_id === topic.id);
    assert.ok(role);
    assert.equal(role.id, "AFA-" + topic.id);
    assert.deepEqual([...role.atlas_fields].sort(), [...topic.fields].sort());
    for (const lang of ["de", "en"]) {
      assert.equal(role.label[lang], topic.name[lang]);
      assert.ok(role.focus[lang].trim().length > 15);
    }
  }
});

test("the design is inert and cannot counterfeit human consensus or expertise", () => {
  assert.equal(registry.boundaries.live_api, false);
  assert.equal(registry.boundaries.no_autonomous_github_posts, true);
  assert.equal(registry.boundaries.no_status_updates, true);
  assert.equal(registry.boundaries.human_review_required, true);
  assert.equal(registry.boundaries.independent_human_review_not_satisfied_by_agents, true);
  assert.equal(registry.boundaries.consensus_from_agent_votes, "forbidden");
  assert.equal(registry.boundaries.broad_moral_score_from_agent_outputs, "forbidden");
  for (const role of registry.specialist_roles) {
    assert.equal(role.enabled, false);
    assert.equal(role.may_publish, false);
    assert.equal(role.may_promote_claims, false);
    assert.equal(role.professional_qualification_claimed, false);
    assert.equal(role.can_veto, false);
  }
  for (const role of registry.cross_check_roles) {
    assert.equal(role.enabled, false);
    assert.equal(role.may_vote, false);
    assert.equal(role.may_publish, false);
    assert.equal(role.may_promote_claims, false);
  }
});

test("role ids, methodologies and cross checks remain unambiguous", () => {
  const roleIds = [...registry.specialist_roles, ...registry.cross_check_roles].map(r => r.id);
  assert.equal(new Set(roleIds).size, roleIds.length);
  const allowed = new Set(registry.allowed_claim_types);
  for (const role of registry.specialist_roles) {
    assert.ok(role.applicable_claim_types.length > 0);
    assert.ok(role.applicable_claim_types.every(t => allowed.has(t)));
    assert.ok(role.atlas_fields.every(f => registry.atlas.fields.includes(f)));
  }
  const crossIds = new Set(registry.cross_check_roles.map(r => r.id));
  for (const required of ["source_audit", "adversarial_review", "affected_perspectives", "translation_scope", "synthesis_moderator"]) {
    assert.ok(crossIds.has(required));
  }
  assert.equal(registry.routing_proposal.independent_first_pass, true);
  assert.equal(registry.routing_proposal.high_risk_professional_human_gate, true);
  assert.ok(registry.routing_proposal.max_debate_rounds_pilot <= 2);
});

test("draft contracts require provenance, uncertainty, dissent and pending human review", () => {
  const agentFields = new Set(registry.proposed_agent_draft_required_fields);
  const synthFields = new Set(registry.proposed_synthesis_required_fields);
  for (const name of ["role_id","model_id","model_version","input_source_ids","strongest_objection","uncertainty","revision_trigger","sources","status"]) {
    assert.ok(agentFields.has(name), name);
  }
  for (const name of ["supported_core","dissent","missing_evidence","normative_tradeoffs","proposed_tests","human_review_status"]) {
    assert.ok(synthFields.has(name), name);
  }
  assert.equal(registry.allowed_synthesis_status, "ai_draft");
  assert.equal(registry.allowed_human_review_status, "pending");
});
