# Agent Evals

> (Template note — remove before saving `docs/agents/evals.md`: Define verifiable acceptance criteria and regression gates before running any agent workflow unattended.)

Explicit acceptance criteria and verification gates for agent-driven edits and automated workflows in [Project name].

## Baseline Engineering Gates

- `[test command]` — All unit and integration tests pass without relaxed assertions.
- `[typecheck / lint command]` — Zero static check or schema errors.
- `[build / index command]` — Generated outputs rebuild cleanly from source.

## Workflow Eval Criteria

1. **[Correctness / Schema]**: [Output conforms to expected schema or frontmatter contract.]
2. **[Boundary safety]**: [Read-only sources remain untouched; diffs are bounded to allowed paths.]
3. **[Degradation & Reviewability]**: [Failures surface clearly without silent corruption; outputs land in a reviewable location.]
