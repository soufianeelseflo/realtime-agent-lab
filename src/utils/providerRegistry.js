'use strict';

const PROVIDERS = Object.freeze({
    gemini_live: Object.freeze({
        id: 'gemini_live',
        label: 'Google Gemini Live',
        realtimeAudio: true,
        screenContext: true,
        tools: true,
        local: false,
        status: 'implemented',
    }),
    local_runtime: Object.freeze({
        id: 'local_runtime',
        label: 'Local runtime',
        realtimeAudio: false,
        screenContext: true,
        tools: false,
        local: true,
        status: 'experimental',
    }),
    openai_realtime: Object.freeze({
        id: 'openai_realtime',
        label: 'OpenAI Realtime',
        realtimeAudio: true,
        screenContext: false,
        tools: true,
        local: false,
        status: 'planned',
    }),
    anthropic: Object.freeze({
        id: 'anthropic',
        label: 'Anthropic',
        realtimeAudio: false,
        screenContext: true,
        tools: true,
        local: false,
        status: 'planned',
    }),
});

function listProviders() {
    return Object.values(PROVIDERS).map(provider => ({ ...provider }));
}

function getProvider(id) {
    if (typeof id !== 'string' || !PROVIDERS[id]) {
        throw new Error(`Unknown provider: ${String(id)}`);
    }
    return { ...PROVIDERS[id] };
}

function findProviders(requirements = {}) {
    const entries = Object.entries(requirements);
    return listProviders().filter(provider =>
        entries.every(([key, value]) => provider[key] === value)
    );
}

module.exports = {
    PROVIDERS,
    listProviders,
    getProvider,
    findProviders,
};
