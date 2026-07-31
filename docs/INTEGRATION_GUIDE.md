# Integration Guide

## Export logs
Record timestamps relative to the start of the session. Do not export credentials, raw authentication headers, or real customer media.

## Normalize
Use a provider adapter or emit RAL events directly.

## Evaluate

```bash
ral evaluate session.json --output report.json --fail-under 80
```

## Gate pull requests
Use the root GitHub Action. Keep synthetic fixtures in a dedicated directory and choose a threshold that reflects your production standard.

## Compare releases
Generate reports for a baseline and candidate implementation, then run `ral compare` to detect score regression.
