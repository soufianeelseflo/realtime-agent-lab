'use strict';

function percentile(values, p) {
    if (!Array.isArray(values) || values.length === 0) return null;
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(p * sorted.length) - 1));
    return sorted[index];
}

function evaluateSession(events) {
    if (!Array.isArray(events)) {
        throw new TypeError('events must be an array');
    }

    const latencies = [];
    let duplicateResponses = 0;
    let errors = 0;
    let interruptions = 0;
    let responses = 0;
    const responseIds = new Set();

    for (const event of events) {
        if (!event || typeof event !== 'object') continue;

        if (event.type === 'response') {
            responses++;
            if (Number.isFinite(event.latencyMs) && event.latencyMs >= 0) {
                latencies.push(event.latencyMs);
            }
            if (event.responseId) {
                if (responseIds.has(event.responseId)) duplicateResponses++;
                responseIds.add(event.responseId);
            }
        }

        if (event.type === 'error') errors++;
        if (event.type === 'interruption') interruptions++;
    }

    const meanLatencyMs = latencies.length
        ? Math.round(latencies.reduce((sum, value) => sum + value, 0) / latencies.length)
        : null;

    return {
        eventCount: events.length,
        responses,
        errors,
        interruptions,
        duplicateResponses,
        latency: {
            samples: latencies.length,
            meanMs: meanLatencyMs,
            p50Ms: percentile(latencies, 0.5),
            p95Ms: percentile(latencies, 0.95),
            maxMs: latencies.length ? Math.max(...latencies) : null,
        },
        reliability: {
            errorRate: responses + errors === 0 ? 0 : errors / (responses + errors),
            duplicateRate: responses === 0 ? 0 : duplicateResponses / responses,
        },
    };
}

module.exports = {
    percentile,
    evaluateSession,
};
