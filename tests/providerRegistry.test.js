'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
    listProviders,
    getProvider,
    findProviders,
} = require('../src/utils/providerRegistry');

test('provider registry returns defensive copies', () => {
    const providers = listProviders();
    assert.ok(providers.length >= 4);
    providers[0].label = 'changed';
    assert.notEqual(listProviders()[0].label, 'changed');
});

test('provider capability filtering works', () => {
    const realtime = findProviders({ realtimeAudio: true });
    assert.ok(realtime.some(provider => provider.id === 'gemini_live'));
    assert.ok(realtime.some(provider => provider.id === 'openai_realtime'));
    assert.equal(getProvider('anthropic').status, 'planned');
});
