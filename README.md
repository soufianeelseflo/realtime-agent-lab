# Realtime Agent Lab

[![CI](https://github.com/soufianeelseflo/realtime-agent-lab/actions/workflows/ci.yml/badge.svg)](https://github.com/soufianeelseflo/realtime-agent-lab/actions/workflows/ci.yml)
[![CodeQL](https://github.com/soufianeelseflo/realtime-agent-lab/actions/workflows/codeql.yml/badge.svg)](https://github.com/soufianeelseflo/realtime-agent-lab/actions/workflows/codeql.yml)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/soufianeelseflo/realtime-agent-lab/badge)](https://scorecard.dev/viewer/?uri=github.com/soufianeelseflo/realtime-agent-lab)
[![License: GPL v3+](https://img.shields.io/badge/License-GPLv3%2B-blue.svg)](LICENSE)
[![Node 20+](https://img.shields.io/badge/Node-20%2B-green.svg)](package.json)

**The open reliability standard, benchmark suite, CLI, and CI gate for real-time voice and multimodal AI agents.**

Realtime agents fail differently from chatbots. They interrupt users, duplicate speech, lose tool results, reconnect badly, leak secrets, ignore consent, and regress under network pressure. Realtime Agent Lab turns those failures into deterministic, replayable tests.

## What ships in v1

- **RAL Session Spec 1.0** — provider-neutral JSON event format.
- **Deterministic evaluator** — latency, interruption, duplication, tool reliability, reconnect, consent, and privacy scores.
- **CLI** — validate, evaluate, benchmark, compare, redact, and initialize fixtures.
- **GitHub Action** — fail pull requests when reliability drops below a threshold.
- **Provider adapters** — OpenAI Realtime, Gemini Live, Twilio Media Streams, and generic WebSocket logs.
- **Multilingual fixtures** — English, French, Arabic, and Moroccan Darija.
- **Security scanner** — detects and redacts API keys, tokens, emails, and card-like values.
- **Public benchmark report** — generated from transparent fixtures and reproducible locally.

## Five-minute start

```bash
npm install
npm run check
node packages/cli/bin/ral.js evaluate fixtures/happy-path-en.json
```

Expected output:

```text
Score: 100/100 (A)
Latency p95: 420ms
Interruption recovery: 100%
Tool success: 100%
Consent compliance: 100%
Privacy score: 100%
```

## Use as a GitHub Action

Create `.github/workflows/realtime-agent-lab.yml`:

```yaml
name: Realtime Agent Reliability
on: [pull_request, push]

jobs:
  reliability:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: soufianeelseflo/realtime-agent-lab@v1
        with:
          fixtures: fixtures
          fail-under: '80'
          report: realtime-agent-report.json
```

## CLI

```bash
ral validate session.json
ral evaluate session.json --output report.json --fail-under 80
ral benchmark fixtures --output benchmark-results/latest.json
ral compare baseline.json candidate.json
ral redact raw-session.json --output safe-session.json
ral init my-session.json
```

## Reliability model

| Dimension | Weight | What it measures |
|---|---:|---|
| Latency | 20% | Response-start delay after a user turn |
| Interruption | 20% | Whether agent speech stops promptly when interrupted |
| Tool reliability | 20% | Tool calls that resolve successfully and truthfully |
| Duplication | 10% | Repeated agent output within a short window |
| Reconnect recovery | 10% | Recovery from dropped connections |
| Consent | 10% | Capture only while explicit consent is active |
| Privacy | 10% | Secret and PII leakage in logs or transcripts |

See [docs/METRICS.md](docs/METRICS.md) for exact formulas.

## Session Spec 1.0

A session is an ordered event stream:

```json
{
  "specVersion": "1.0",
  "id": "demo-call",
  "language": "en-US",
  "startedAt": "2026-08-01T00:00:00.000Z",
  "events": [
    { "at": 0, "type": "consent.granted" },
    { "at": 100, "type": "user.speech.start" },
    { "at": 900, "type": "user.speech.end", "turnId": "u1" },
    { "at": 1260, "type": "agent.response.start", "turnId": "a1", "inReplyTo": "u1" },
    { "at": 1800, "type": "agent.response.end", "turnId": "a1", "text": "Hello." }
  ]
}
```

Full specification: [docs/SPEC.md](docs/SPEC.md).

## Ecosystem gap

Text benchmarks score final answers. Realtime Agent Lab scores the operational behavior that determines whether a live agent is usable and safe: streaming latency, barge-in, duplicate output, tool completion, reconnect recovery, consent boundaries, and privacy leakage. The format is open and provider-neutral so teams can compare implementations without adopting a vendor-specific test harness.

## Repository map

```text
packages/spec       Session format and validation
packages/evaluator  Deterministic scoring engine
packages/cli        Command-line interface
packages/adapters   Provider log normalizers
packages/security   Secret detection and redaction
fixtures            Reproducible multilingual sessions
benchmark-results   Generated benchmark output
site                Static documentation dashboard
dist                Standalone GitHub Action runtime
```

## Security

Realtime Agent Lab processes sensitive event logs. Never commit real recordings, customer data, or API credentials. Use synthetic fixtures and run `ral redact` before sharing a session. See [SECURITY.md](SECURITY.md) and [docs/THREAT_MODEL.md](docs/THREAT_MODEL.md).

## Contributing

Small, testable contributions are welcome: new fixtures, provider adapters, metric improvements, docs, and security tests. Start with [CONTRIBUTING.md](CONTRIBUTING.md) and the [`good first issue`](https://github.com/soufianeelseflo/realtime-agent-lab/labels/good%20first%20issue) label.

## Governance

The project uses an open maintainer model documented in [GOVERNANCE.md](GOVERNANCE.md). Metric changes require fixtures, tests, and a changelog entry.
