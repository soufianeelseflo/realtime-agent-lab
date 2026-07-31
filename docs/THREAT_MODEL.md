# Threat Model

## Protected assets
API credentials, audio, screen content, transcripts, tool arguments, customer data, and benchmark integrity.

## Principal threats
- secrets committed in fixtures;
- malicious JSON causing resource exhaustion;
- path traversal in output handling;
- unsafe provider-log normalization;
- false tool-success claims;
- capture without active consent;
- benchmark tampering;
- supply-chain compromise in GitHub Actions.

## Controls
- synthetic fixtures only;
- bounded JSON parsing by host process;
- no dynamic code execution;
- secret scanning and redaction;
- deterministic scoring;
- least-privilege workflow permissions;
- CodeQL, dependency review, and OpenSSF Scorecard workflows.
