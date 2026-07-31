# Security Policy

## Reporting

Do not open public issues for vulnerabilities involving credential exposure, arbitrary code execution, unsafe IPC, recording leakage, or local-file disclosure.

Report privately through GitHub's **Report a vulnerability** feature when enabled.

Include:

- affected version and platform;
- reproduction steps;
- impact;
- proof of concept with secrets and personal data removed;
- suggested mitigation, if known.

## Maintainer priorities

1. credential storage and redaction;
2. Electron IPC validation;
3. local recording and transcript protection;
4. external URL handling;
5. native audio helper integrity;
6. dependency and packaging security.
