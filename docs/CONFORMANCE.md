# Adapter Conformance

A provider adapter is conformant when it:

1. Emits RAL Session Spec 1.0 documents that pass validation.
2. Preserves event ordering and provider identifiers.
3. Maps connection failures, interruptions, user turns, agent turns, and tool results when present.
4. Adds no credentials or raw private payloads to normalized output.
5. Includes synthetic tests for every supported event mapping.

Conformance is about event normalization, not model quality. A provider can conform to the event format and still receive a low reliability score on a fixture.
