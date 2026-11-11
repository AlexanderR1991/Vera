import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import '../research/beweisraum/room.test.mjs';
import { checkDraftFiles, loadRoom } from '../research/beweisraum/room.mjs';

test('the repository proof room and its stored drafts pass structural checks together', () => {
  const directory = fileURLToPath(new URL('../research/beweisraum/', import.meta.url));
  const { room, hash } = loadRoom(directory);
  const result = checkDraftFiles(directory, room, hash);
  assert.deepEqual(result.errors, []);
});
