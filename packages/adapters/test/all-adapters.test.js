import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeGeminiLive, normalizeTwilioMediaStream, normalizeGenericWebSocket } from '../src/index.js';
import { validateSession } from '../../spec/src/index.js';

test('Gemini Live normalizer creates a valid session', () => {
  const result = normalizeGeminiLive([{ at: 10, kind: 'connected' }, { at: 20, kind: 'input-start', turnId: 'u1' }]);
  assert.equal(validateSession(result).valid, true);
});

test('Twilio normalizer creates a valid session', () => {
  const result = normalizeTwilioMediaStream([{ at: 10, event: 'start' }, { at: 20, event: 'mark', mark: { name: 'user-speech-start' }, turnId: 'u1' }]);
  assert.equal(validateSession(result).valid, true);
});

test('generic WebSocket normalizer preserves event data', () => {
  const result = normalizeGenericWebSocket([{ at: 10, type: 'session.note', data: { text: 'hello' } }]);
  assert.equal(result.events.at(-1).text, 'hello');
});
