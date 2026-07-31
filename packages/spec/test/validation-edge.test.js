import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSession } from '../src/index.js';

const make = events => ({ specVersion: '1.0', id: 'edge', startedAt: '2026-08-01T00:00:00.000Z', events });

test('rejects unordered timestamps', () => {
  const result = validateSession(make([{ at: 10, type: 'consent.granted' }, { at: 5, type: 'session.note' }]));
  assert.equal(result.valid, false);
});

test('rejects unknown event types', () => {
  const result = validateSession(make([{ at: 0, type: 'consent.granted' }, { at: 1, type: 'unknown.event' }]));
  assert.equal(result.valid, false);
});

test('requires callId for tool events', () => {
  const result = validateSession(make([{ at: 0, type: 'consent.granted' }, { at: 1, type: 'tool.call' }]));
  assert.equal(result.valid, false);
});
