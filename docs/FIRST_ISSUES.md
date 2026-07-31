# First Public Issues

## 1. Define provider-neutral session event schema

Create a JSON schema covering user turns, model responses, interruptions, tool calls, errors, latency, and redaction metadata. Include fixtures and validation tests.

## 2. Encrypt credentials using native OS key stores

Replace plaintext/local credential storage with Keychain on macOS, Credential Manager on Windows, and Secret Service on Linux. Include migration and threat-model notes.

## 3. Add deterministic replay runner

Replay redacted session fixtures through evaluation logic and compare generated reports against golden outputs in CI.
