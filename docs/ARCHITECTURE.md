# Architecture

Realtime Agent Lab has four logical layers:

1. **Capture:** Electron screen, microphone, and optional system-audio capture.
2. **Provider transport:** provider-specific session adapters.
3. **Session model:** normalized events for user turns, responses, interruptions, tool calls, and errors.
4. **Evaluation:** deterministic metrics, replay, regression fixtures, and reports.

The existing Gemini transport is the first provider implementation. New adapters should translate provider events into a provider-neutral schema rather than leaking provider-specific objects into the UI.

Security boundaries:

- renderer input must be validated before main-process use;
- API credentials must never be logged;
- external URLs require allow-list validation;
- recordings and transcripts are sensitive local data;
- consent state must gate capture.
