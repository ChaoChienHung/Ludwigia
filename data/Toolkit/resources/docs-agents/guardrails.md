# Agent Guardrails

> (Template note — remove before saving `docs/agents/guardrails.md`: Replace bracketed placeholders with your project's actual paths and commands. Keep root `AGENTS.md` concise and separate prose soft rules from deterministic hard guardrails here.)

This document complements [AGENTS.md](../../AGENTS.md) with tool-agnostic boundaries across any AI coding agent (Antigravity, Claude Code, Codex, Cursor, etc.).

## Soft Rules vs. Hard Guardrails

Keep judgment-based preferences in Markdown prose; enforce non-negotiable invariants with deterministic scripts, schemas, hooks, or automated tests.

| Layer | Purpose | Where it lives in [Project name] |
| --- | --- | --- |
| **Soft Rules (Prose)** | Tone, writing style, design trade-offs, review habits | `AGENTS.md`, `[docs/guide/...]` |
| **Hard Guardrails (Deterministic)** | Catch regressions, schema drift, boundary leaks, and generated-output edits | `[test command]`, `[typecheck / lint command]`, `[schema or hook path]` |

## Non-Negotiable Boundaries

- **[Boundary 1 — e.g., SSOT & Generated Outputs]**: [Edit only source files; regenerate outputs via `[build command]`.]
- **[Boundary 2 — e.g., Data / Vault Isolation]**: [Keep private or read-only sources isolated from automated writes.]
