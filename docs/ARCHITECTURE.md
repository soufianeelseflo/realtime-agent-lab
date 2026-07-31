# Architecture

1. Provider logs are normalized by adapters into RAL Session Spec 1.0.
2. The validator rejects malformed or non-consensual event streams.
3. The evaluator calculates deterministic metrics without network access.
4. The CLI renders human and JSON reports.
5. The GitHub Action enforces a project-defined score threshold.
6. Benchmark output feeds the static documentation dashboard.

The evaluator is intentionally deterministic: the same session document produces the same metric values. `generatedAt` is informational and excluded from comparisons.
