Status: Active public development.

# Realtime Agent Lab

Realtime Agent Lab is an open-source desktop harness for capturing, replaying, and evaluating real-time multimodal AI-agent sessions.

It is designed for maintainers who need reproducible evidence about live-agent behavior across audio, screen context, streaming responses, interruptions, duplicate outputs, provider failures, and consent boundaries—not just ordinary text-chat benchmarks.

## What it provides

- **Session evaluation:** deterministic metrics for latency, duplicate responses, interruptions, errors, and completion behavior.
- **Replayable fixtures:** JSON session traces that can be inspected locally and used in regression tests.
- **Provider-neutral architecture:** adapters and roadmap support for OpenAI, Anthropic, Gemini, and local runtimes.
- **Consent controls:** explicit checks before screen or audio capture.
- **Privacy-first defaults:** local storage, redacted diagnostics, and no bundled API keys.
- **Maintainer tooling:** automated tests, CI, security policy, issue templates, contribution guidance, and release documentation.

## Quick start

```bash
npm install
npm test
npm run check
npm run analyze:sample
npm start
```

## Sample evaluation

The repository includes `fixtures/sample-session.json` and a CLI analyzer:

```bash
npm run analyze:sample
```

Use the fixture format to reproduce regressions involving:

- first-response latency;
- duplicate assistant outputs;
- interrupted responses;
- provider and transport errors;
- consent state;
- session completion.

## Project status

Realtime Agent Lab is early-stage. Version `0.1.x` establishes the evaluation model, consent controls, provider registry, fixtures, tests, CI, security process, and maintainer workflow. See [`ROADMAP.md`](ROADMAP.md) for planned work.

## Security and privacy

The application can interact with microphones, screen capture, API credentials, local storage, Electron IPC, native helpers, and external model providers. Review [`SECURITY.md`](SECURITY.md) before testing or contributing. Never commit recordings, transcripts, API keys, customer data, or other personal information.

## Contributing

Issues and pull requests are welcome. Start with:

- [`CONTRIBUTING.md`](CONTRIBUTING.md)
- [`docs/FIRST_ISSUES.md`](docs/FIRST_ISSUES.md)
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`ACCEPTABLE_USE.md`](ACCEPTABLE_USE.md)

## Acceptable use

This project is for authorized testing, accessibility, meetings, presentations, research, and agent-quality evaluation. It must not be used for covert recording, prohibited exam or interview assistance, unauthorized surveillance, or processing data without consent.

## Provenance and license

Realtime Agent Lab is a substantially modified GPL-3.0-or-later fork built from the open-source `sohzm/cheating-daddy` codebase. Upstream notices and licensing information are preserved in [`NOTICE`](NOTICE) and [`LICENSE`](LICENSE). The project is independently maintained and is not endorsed by the upstream maintainers.
