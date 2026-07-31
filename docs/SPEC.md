# RAL Session Spec 1.0

A session is a deterministic, ordered event stream. `at` is milliseconds from session start. The spec is transport-independent and does not prescribe WebRTC, WebSocket, SIP, or provider APIs.

## Required session fields

- `specVersion`: `"1.0"`
- `id`: stable session identifier
- `startedAt`: ISO-8601 timestamp
- `events`: ordered event array

## Core event groups

- Consent: `consent.granted`, `consent.revoked`
- Capture: `capture.audio.*`, `capture.screen.*`
- User: `user.speech.*`, `user.interruption`
- Agent: `agent.response.*`
- Tools: `tool.call`, `tool.result`
- Transport: `connection.*`
- Safety: `privacy.violation`, `security.secret_detected`

Unknown extensions should use a reverse-domain prefix in metadata until standardized.
