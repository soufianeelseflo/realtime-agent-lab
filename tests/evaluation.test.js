'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { percentile, evaluateSession } = require('../src/utils/evaluation');

test('percentile returns nearest-rank values', () => {
    assert.equal(percentile([10, 20, 30, 40], 0.5), 20);
    assert.equal(percentile([10, 20, 30, 40], 0.95), 40);
    assert.equal(percentile([], 0.5), null);
});

test('evaluateSession reports latency and reliability failures', () => {
    const report = evaluateSession([
        { type: 'response', responseId: 'a', latencyMs: 100 },
        { type: 'response', responseId: 'a', latencyMs: 300 },
        { type: 'error' },
        { type: 'interruption' },
    ]);

    assert.equal(report.responses, 2);
    assert.equal(report.errors, 1);
    assert.equal(report.interruptions, 1);
    assert.equal(report.duplicateResponses, 1);
    assert.equal(report.latency.meanMs, 200);
    assert.equal(report.latency.p95Ms, 300);
});
