import { readFileSync } from 'node:fs';
import { createCorrectionWave } from '../src/lib/correction-wave.mjs';
import { createParticipationQueue } from '../src/lib/participation-queue.mjs';

function snapshot(wave, inspect) {
  return inspect.map((claim) => ({
    claim,
    derived: wave.has(claim),
    ...wave.explain(claim),
  }));
}

function runScenario({ initial, revisions, inspect = [] }) {
  const wave = createCorrectionWave(initial);
  return {
    before: snapshot(wave, inspect),
    revisions: revisions.map(({ label, ...patch }) => ({
      label,
      ...wave.revise(patch),
    })),
    after: snapshot(wave, inspect),
  };
}

function demo() {
  const queue = createParticipationQueue({ lanes: ['de', 'en'] });
  const approvals = 10_000;
  for (let i = 1; i <= approvals; i += 1) {
    queue.submit({ id: `approval-${i}`, lane: 'de', text: 'Das Verfahren ist für alle zugänglich.' });
  }
  const objectionId = 'access-objection';
  queue.submit({
    id: objectionId,
    lane: 'en',
    text: 'I qualify. Registration requires a smartphone, and I have no alternative.',
  });

  const wave = createCorrectionWave({
    facts: ['universal-access', 'feedback-channel'],
    rules: [
      { id: 'one-route-suffices', premises: ['universal-access'], conclusion: 'single-route-suffices' },
      { id: 'current-route-covers-all', premises: ['single-route-suffices'], conclusion: 'no-alternative-needed' },
      { id: 'feedback-from-registration', premises: ['universal-access'], conclusion: 'feedback-possible' },
      { id: 'feedback-through-separate-channel', premises: ['feedback-channel'], conclusion: 'feedback-possible' },
    ],
  });
  const inspect = ['single-route-suffices', 'no-alternative-needed', 'feedback-possible', 'review-alternative-routes'];
  const before = snapshot(wave, inspect);
  const revisions = [];
  let checked = 0;
  let objectionPosition;
  for (let receipt = queue.next(); receipt; receipt = queue.next()) {
    checked += 1;
    if (receipt.id === objectionId) {
      objectionPosition = checked;
      queue.complete(receipt.id, {
        outcome: 'objection',
        reason: 'The fixture supplies a confirmed case of an eligible person excluded from registration.',
      });
      // The scenario supplies the checked finding. Receipt text itself cannot revise a rule.
      revisions.push({
        label: receipt.id,
        ...wave.revise({
          removeFacts: ['universal-access'],
          addFacts: ['verified-access-gap'],
          addRules: [
            { id: 'investigate-access-routes', premises: ['verified-access-gap'], conclusion: 'review-alternative-routes' },
          ],
        }),
      });
    } else if (receipt.id === 'approval-1') {
      queue.complete(receipt.id, { outcome: 'recorded', reason: 'Representative endorsement of the access claim.' });
    } else {
      queue.complete(receipt.id, { outcome: 'grouped', reason: 'Same claim as approval-1.' });
    }
  }

  return {
    synthetic: true,
    intake: { approvals, checked, objectionPosition, objection: queue.get(objectionId) },
    before,
    revisions,
    after: snapshot(wave, inspect),
  };
}

try {
  if (process.argv.length > 3) throw new Error('Usage: node scripts/vera-correction-wave.mjs [scenario.json]');
  const input = process.argv[2];
  const result = input ? runScenario(JSON.parse(readFileSync(input, 'utf8'))) : demo();
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
