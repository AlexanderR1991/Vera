import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { checkDraftFiles, impactNodes, makeBrief, premiseNodes, roomHash, runCli, validateDraft, validateRoom } from './room.mjs';

const tr = text => ({ de: text, en: text });
const node = (id, premises = []) => ({
  id, kind: 'claim', claim_type: 'formal', domain: 'logic', title: tr(id), statement: tr('conditional statement'),
  scope: tr('specified model only'), premises, objection: tr('a premise could be wrong'), next_test: tr('check each inference'),
  revision_trigger: tr('a countermodel'), sources: [], disposition: 'conditional_derivation',
  argument: { system: tr('specified propositional model'), steps: [tr('Apply the stated inference rule to the premises.')] },
  review_status: 'unreviewed_ai_draft', evidence_maturity: 'R0'
});
const fixture = () => ({
  schema_version: 1, status: 'unreviewed_research_draft',
  limits: { max_nodes: 80, max_edges: 160, max_batch_jobs: 8, max_drafts: 40 },
  domains: [{ id: 'logic', title: tr('Logic') }],
  nodes: [node('A-001'), node('C-001', ['A-001']), node('C-002', ['C-001'])],
  links: [{ from: 'C-002', to: 'A-001', relation: 'analogous_to', note: tr('not a proof edge') }]
});
const draftFixture = hash => ({
  schema_version: 1, review_status: 'unreviewed_ai_draft', evidence_maturity: 'R0',
  target: 'C-001', room_sha256: hash, role: 'adversary', origin_group: 'same model, separate context',
  finding: 'a conditional consequence only', objection: 'the premises may not describe the world',
  next_test: 'look for an explicit countermodel', revision_trigger: 'an invalid inference',
  proposed_disposition: 'open', source_checks: []
});

test('valid graph preserves non-proof links without introducing premise cycles', () => {
  const room = fixture();
  room.links.push({ from: 'A-001', to: 'C-002', relation: 'analogous_to', note: tr('reverse analogy') });
  assert.deepEqual(validateRoom(room), []);
  assert.deepEqual(premiseNodes(room, 'C-002').map(item => item.id), ['A-001', 'C-001']);
  assert.deepEqual(impactNodes(room, 'A-001').map(item => item.id), ['C-001', 'C-002']);
  assert.deepEqual(impactNodes(room, 'C-002'), []);
});

test('missing premises and circular derivation are rejected', () => {
  const missing = fixture();
  missing.nodes[1].premises.push('C-099');
  assert.ok(validateRoom(missing).some(error => error.includes('missing premise C-099')));
  const cycle = fixture();
  cycle.nodes[0].premises = ['C-002'];
  assert.ok(validateRoom(cycle).some(error => error.includes('premise cycle')));
});

test('normative conclusions cannot be marked as formal derivations', () => {
  const room = fixture();
  room.nodes[1].claim_type = 'normative';
  assert.ok(validateRoom(room).some(error => error.includes('reserved for formal claims')));
  room.nodes[1].disposition = 'open';
  assert.deepEqual(validateRoom(room), []);
});

test('formal derivations and counterexamples expose the argument and inference framework', () => {
  const room = fixture();
  delete room.nodes[1].argument;
  assert.ok(validateRoom(room).some(error => error.includes('C-001: formal derivations and counterexamples need argument')));
  room.nodes[1].disposition = 'counterexample';
  assert.ok(validateRoom(room).some(error => error.includes('C-001: formal derivations and counterexamples need argument')));
  room.nodes[1].argument = { system: tr('specified model'), steps: [] };
  assert.ok(validateRoom(room).some(error => error.includes('argument.steps')));
  room.nodes[1].argument.steps = [tr('Give the valuation that falsifies the universal claim.')];
  assert.deepEqual(validateRoom(room), []);
});

test('agent agreement cannot upgrade maturity or reviewer status', () => {
  const room = fixture();
  room.nodes[0].evidence_maturity = 'R4';
  room.nodes[0].review_status = 'human_verified';
  assert.ok(validateRoom(room).some(error => error.includes('must remain R0')));
  assert.ok(validateRoom(room).some(error => error.includes('must remain unreviewed_ai_draft')));
  const hash = roomHash('room');
  const draft = draftFixture(hash);
  draft.evidence_maturity = 'R3';
  draft.review_status = 'independent_review';
  assert.equal(validateDraft(draft, fixture(), hash).length, 2);
});

test('draft hashes bind exact bytes and stale drafts fail', () => {
  const hash = roomHash('room');
  const draft = draftFixture(hash);
  assert.deepEqual(validateDraft(draft, fixture(), hash), []);
  assert.notEqual(hash, roomHash('room\n'));
  assert.ok(validateDraft(draft, fixture(), roomHash('new room')).some(error => error.includes('stale draft')));
});

test('limits cannot be raised, duplicated IDs and invalid structures fail', () => {
  const room = fixture();
  room.limits.max_nodes = 100000;
  room.nodes.push(node('C-001'));
  assert.ok(validateRoom(room).some(error => error.includes('limits.max_nodes')));
  assert.ok(validateRoom(room).some(error => error.includes('duplicate node')));
  assert.deepEqual(validateRoom(null), ['room must be an object']);
  assert.ok(validateRoom({ schema_version: 1 }).length > 0);
});

test('brief includes premises and four bounded roles, not a consensus', () => {
  const room = fixture();
  const brief = makeBrief(room, roomHash('room'), 'C-002', 'en');
  assert.equal(brief.status, 'briefs_only');
  assert.deepEqual(brief.premise_nodes.map(item => item.id), ['A-001', 'C-001']);
  assert.deepEqual(brief.roles.map(item => item.role), ['constructor', 'adversary', 'source_checker', 'scope_checker']);
  assert.equal(brief.boundaries.evidence_maturity, 'R0');
  room.limits.max_batch_jobs = 3;
  assert.throws(() => makeBrief(room, roomHash('room'), 'C-002'), /exceeds max_batch_jobs/);
});

test('CLI reads bounded local files, rejects traversal and finds stale draft files', t => {
  const folder = mkdtempSync(join(tmpdir(), 'vera-room-'));
  t.after(() => rmSync(folder, { recursive: true, force: true }));
  const bytes = JSON.stringify(fixture());
  writeFileSync(join(folder, 'room.json'), bytes);
  assert.match(runCli(['check'], folder), /Structure checked/);
  assert.match(runCli(['map', 'en'], folder), /Proof room/);
  assert.deepEqual(JSON.parse(runCli(['impact', 'A-001'], folder)).dependent_nodes, ['C-001', 'C-002']);
  assert.throws(() => runCli(['brief', '../room.json'], folder), /Usage/);
  assert.throws(() => runCli(['check', 'extra'], folder), /Usage/);
  mkdirSync(join(folder, 'drafts'));
  writeFileSync(join(folder, 'drafts', 'a.json'), JSON.stringify(draftFixture(roomHash('old'))));
  const checked = checkDraftFiles(folder, fixture(), roomHash(bytes));
  assert.equal(checked.count, 1);
  assert.match(checked.errors.join('\n'), /stale draft/);
  assert.throws(() => runCli(['check'], folder), /stale draft/);
});

test('oversized room and draft files fail before parsing', t => {
  const folder = mkdtempSync(join(tmpdir(), 'vera-room-'));
  t.after(() => rmSync(folder, { recursive: true, force: true }));
  writeFileSync(join(folder, 'room.json'), ' '.repeat(512 * 1024 + 1));
  assert.throws(() => runCli(['check'], folder), /exceeds 524288 bytes/);
  mkdirSync(join(folder, 'drafts'));
  writeFileSync(join(folder, 'drafts', 'a.json'), ' '.repeat(32 * 1024 + 1));
  assert.match(checkDraftFiles(folder, fixture(), roomHash('room')).errors.join('\n'), /exceeds 32768 bytes/);
});
