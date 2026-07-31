'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
    createConsentRecord,
    updateConsent,
    assertCaptureAllowed,
} = require('../src/utils/consent');

test('capture is blocked before consent', () => {
    const record = createConsentRecord({ sessionId: 's1' });
    assert.throws(() => assertCaptureAllowed(record), /consent/);
});

test('capture is allowed after consent and blocked after revocation', () => {
    let record = createConsentRecord({ sessionId: 's1', participants: ['A', 'B'] });
    record = updateConsent(record, 'granted', 'participant');
    assert.equal(assertCaptureAllowed(record), true);

    record = updateConsent(record, 'revoked', 'participant');
    assert.throws(() => assertCaptureAllowed(record), /consent/);
});
