# Maintainer Guide

## Weekly

- triage new issues;
- reproduce bugs before labeling;
- review dependency alerts;
- close reports containing secrets or personal recordings after removing exposed material.

## Releases

1. Run `npm test` and `npm run check`.
2. Update `CHANGELOG.md`.
3. Bump the version.
4. Create a signed tag when signing is available.
5. Publish release notes with platform limitations and security changes.

## Pull requests

Require tests for behavior changes. Pay special attention to IPC, filesystem access, external URLs, credential handling, and native audio helpers.
