# Provider Adapters

Adapters convert provider-specific logs into the open RAL event stream. They do not send network requests and do not require credentials.

Current normalizers:
- OpenAI Realtime event logs
- Gemini Live event logs
- Twilio Media Streams logs
- Generic WebSocket event logs

A new adapter must include synthetic input, expected normalized output, and validation tests.
