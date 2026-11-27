# Agent Workflows

> (Template note — remove before saving `docs/agents/workflows.md`: Follow Scope → Build → Eval → Schedule before enabling recurring or autonomous agent runs.)

Tool-agnostic workflow lifecycle (`Scope → Build → Eval → Schedule`) for designing, grading, and scheduling recurring agent tasks in [Project name].

## Scope → Build → Eval → Schedule

1. **Scope**: Define a minimal v0 boundary—target inputs, allowed write paths, read-only sources, and explicit non-goals.
2. **Build**: Reuse existing shared modules, schemas, and single-source pipelines rather than ad-hoc scripts.
3. **Eval**: Verify manually against [evals.md](evals.md) criteria before automating.
4. **Schedule**: Only after manual runs pass Eval consistently, attach a schedule or batch cadence and route summaries to a reviewable output folder.

## Candidate Workflows & Next Directions

- **[Workflow 1]**: [Inputs, expected output, and Eval gate.]
- **[Workflow 2]**: [Inputs, expected output, and Eval gate.]
- **Next Directions**: [Golden eval fixtures or v1 → v2 upgrades to add once v0 is stable.]
