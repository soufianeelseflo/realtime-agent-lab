export const SPEC_VERSION = '1.0';

export const EVENT_TYPES = Object.freeze([
  'consent.granted', 'consent.revoked',
  'capture.audio.start', 'capture.audio.stop', 'capture.screen.start', 'capture.screen.stop',
  'user.speech.start', 'user.speech.end', 'user.interruption',
  'agent.response.start', 'agent.response.chunk', 'agent.response.stop', 'agent.response.end',
  'tool.call', 'tool.result',
  'connection.opened', 'connection.closed', 'connection.error',
  'privacy.violation', 'security.secret_detected', 'session.note'
]);

const eventSet = new Set(EVENT_TYPES);

export function validateSession(session) {
  const errors = [];
  if (!session || typeof session !== 'object' || Array.isArray(session)) return { valid: false, errors: ['Session must be an object.'] };
  if (session.specVersion !== SPEC_VERSION) errors.push(`specVersion must be ${SPEC_VERSION}.`);
  if (typeof session.id !== 'string' || !session.id.trim()) errors.push('id must be a non-empty string.');
  if (typeof session.startedAt !== 'string' || Number.isNaN(Date.parse(session.startedAt))) errors.push('startedAt must be an ISO-8601 date string.');
  if (!Array.isArray(session.events)) errors.push('events must be an array.');
  if (errors.length) return { valid: false, errors };

  let previous = -Infinity;
  let consent = false;
  const captureTypes = new Set(['capture.audio.start','capture.screen.start','user.speech.start','user.speech.end']);
  const ids = new Set();
  session.events.forEach((event, index) => {
    const p = `events[${index}]`;
    if (!event || typeof event !== 'object' || Array.isArray(event)) { errors.push(`${p} must be an object.`); return; }
    if (!Number.isFinite(event.at) || event.at < 0) errors.push(`${p}.at must be a non-negative number.`);
    if (Number.isFinite(event.at) && event.at < previous) errors.push(`${p}.at must be ordered.`);
    previous = Number.isFinite(event.at) ? event.at : previous;
    if (!eventSet.has(event.type)) errors.push(`${p}.type is unknown: ${event.type}`);
    if (event.id) {
      if (ids.has(event.id)) errors.push(`${p}.id must be unique.`);
      ids.add(event.id);
    }
    if (event.type === 'consent.granted') consent = true;
    if (event.type === 'consent.revoked') consent = false;
    if (captureTypes.has(event.type) && !consent) errors.push(`${p} records capture before active consent.`);
    if (event.type === 'tool.call' && !event.callId) errors.push(`${p}.callId is required for tool.call.`);
    if (event.type === 'tool.result' && !event.callId) errors.push(`${p}.callId is required for tool.result.`);
  });
  return { valid: errors.length === 0, errors };
}

export function assertValidSession(session) {
  const result = validateSession(session);
  if (!result.valid) throw new Error(result.errors.join('\n'));
  return session;
}

export function canonicalizeSession(session) {
  const copy = structuredClone(session);
  copy.events = [...copy.events].sort((a, b) => a.at - b.at || String(a.type).localeCompare(String(b.type)));
  return copy;
}
