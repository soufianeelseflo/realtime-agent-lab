import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateSession } from '../src/index.js';

function session(events, id = 'metric-test') {
  return {
    specVersion: '1.0',
    id,
    startedAt: '2026-08-01T00:00:00.000Z',
    events: [{ at: 0, type: 'consent.granted' }, ...events]
  };
}

test('latency score falls for slow response start', () => {
  const report = evaluateSession(session([
    { at: 10, type: 'user.speech.start' },
    { at: 100, type: 'user.speech.end', turnId: 'u1' },
    { at: 2600, type: 'agent.response.start', inReplyTo: 'u1' }
  ]));
  assert.ok(report.metrics.latency.score < 50);
});

test('successful interruption within one second scores 100', () => {
  const report = evaluateSession(session([
    { at: 100, type: 'user.interruption' },
    { at: 700, type: 'agent.response.stop' }
  ]));
  assert.equal(report.metrics.interruption.score, 100);
});

test('missing interruption stop scores zero', () => {
  const report = evaluateSession(session([{ at: 100, type: 'user.interruption' }]));
  assert.equal(report.metrics.interruption.score, 0);
});

test('duplicate output is detected', () => {
  const report = evaluateSession(session([
    { at: 100, type: 'agent.response.end', text: 'same' },
    { at: 200, type: 'agent.response.end', text: 'same' }
  ]));
  assert.equal(report.metrics.duplication.duplicates, 1);
});

test('connection recovery within five seconds scores 100', () => {
  const report = evaluateSession(session([
    { at: 100, type: 'connection.error' },
    { at: 1000, type: 'connection.opened' }
  ]));
  assert.equal(report.metrics.reconnect.score, 100);
});

test('explicit privacy violation creates critical finding', () => {
  const report = evaluateSession(session([{ at: 100, type: 'privacy.violation' }]));
  assert.ok(report.findings.some(finding => finding.code === 'privacy.leak'));
});
