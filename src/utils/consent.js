'use strict';

const VALID_STATES = new Set(['unknown', 'granted', 'denied', 'revoked']);

function createConsentRecord({ sessionId, participants = [], purpose = '' } = {}) {
    if (!sessionId || typeof sessionId !== 'string') {
        throw new Error('sessionId is required');
    }

    return {
        sessionId,
        participants: participants.map(String),
        purpose: String(purpose),
        state: 'unknown',
        updatedAt: new Date().toISOString(),
        history: [],
    };
}

function updateConsent(record, nextState, actor = 'user') {
    if (!record || typeof record !== 'object') {
        throw new Error('A consent record is required');
    }
    if (!VALID_STATES.has(nextState) || nextState === 'unknown') {
        throw new Error(`Invalid consent state: ${String(nextState)}`);
    }

    const event = {
        from: record.state,
        to: nextState,
        actor: String(actor),
        at: new Date().toISOString(),
    };

    return {
        ...record,
        state: nextState,
        updatedAt: event.at,
        history: [...record.history, event],
    };
}

function assertCaptureAllowed(record) {
    if (!record || record.state !== 'granted') {
        throw new Error('Capture blocked: informed consent has not been granted');
    }
    return true;
}

module.exports = {
    VALID_STATES,
    createConsentRecord,
    updateConsent,
    assertCaptureAllowed,
};
