# AGENTS

> (Template note — remove before saving `AGENTS.md`: Replace bracketed placeholders with your project's actual paths, commands, and contracts. Keep this root file under ~150 lines / ~12 KiB so agent tools never truncate it. Instead of dropping rules to save space, delegate subsystem-specific contracts to nested `AGENTS.md` or focused `docs/rules/` files and route to them below.)

Root instructions and **repo-wide non-regression invariants** for [Project name] ([tech stack with versions, e.g., Python 3.11 + static HTML/JS]). Shared terminology, repository map, and everyday workflows live in `README.md`; feature-to-doc routes live in [feature guide path, e.g., `docs/README.md`].

## Commands

Run the smallest relevant check first; run the full gate before handoff or cross-module changes:

```bash
[exact targeted test command]     # Single module / unit test
[exact lint or check command]     # Lint, type-check, or generated-file check
[exact build command]             # Regenerate outputs from source
[exact full test command]         # Full test suite / release gate
```

## Boundaries

### Always

- Read `README.md` ([Terminology] and [Repository Map]) and [feature guide path] before editing; check `HANDOFF.md` and `git status --short` when resuming work.
- Read the matching subsystem contract (see table below) before editing files in that area; reuse existing components, clients, and design tokens from [token source].
- Keep documentation coherent as a whole: when editing any doc, read surrounding sections to prevent contradictions, duplication, or awkward local patches.
- Review your diff, relevant tests, generated outputs, and user-visible behavior (desktop and mobile when UI changes) before finishing; report what was verified and what was not.
- Update `HANDOFF.md` when in-progress state changes or when no work remains (target <= 2,000 tokens, hard limit 6 KiB UTF-8); never copy the backlog from `TODO.md`.

### Ask first

- Installing new dependencies, deleting data, pushing, or deploying (unless already authorized by the task).
- When a contract is ambiguous or a fix would cross subsystem boundaries into a large refactor: report verified facts and the smallest workable option, then ask for the missing decision.

### Never

- Commit secrets, API keys, tokens, credentials, or URLs containing sensitive parameters.
- Hand-edit generated outputs produced by [build command] or maintain a second manual copy of [metadata, index, or data].
- Treat unassigned items in `TODO.md` or `REVIEW.md` as active work to resume.
- Hard-code [colors, URLs, or duplicated data] or bypass [shared client / data layer].

## On-demand subsystem contracts

Delegate detailed subsystem rules to focused files so every rule is preserved without bloating the root prompt:

| Area / path | Contract file |
| --- | --- |
| `[subsystem-a/]` ([what it covers]) | `[subsystem-a/AGENTS.md or docs/rules/subsystem-a-contracts.md]` |
| `[subsystem-b/]` ([what it covers]) | `[docs/rules/subsystem-b-contracts.md]` |
| Feature-to-folder routes and specs | `[docs/README.md]` |

## Repo-wide non-regression invariants

- **Single source of truth**: [content or data] lives at [path]; generated [output] comes reproducibly from [command].
- **Visibility & safety**: [Draft or private content] must never appear in public listings.
- **Shared chrome & tokens**: Shared navigation/layout lives at [path]; regenerate dependent pages after edits.
- **Minimal toolchain & artifacts**: Core workflow runs with [minimal toolchain]. Only whitelisted deployment artifacts ([list]) are committed; all other build outputs stay in `.gitignore`.
- **Reference examples**: Follow [good example path] for [pattern]; call APIs through [client path].

## Engineering discipline & tracking

- **Turn repeated mistakes into executable constraints**: Reproduce recurring bugs or review findings, tighten [API or module boundary] where feasible, and add a targeted automated check. Reserve prose rules for judgments that cannot be checked reliably.
- **Documentation ownership**: Keep `README.md` for humans and shared navigation, `AGENTS.md` + delegated contract files for invariants, `HANDOFF.md` for the latest stopping point, `TODO.md` for unfinished tasks with acceptance criteria, and `REVIEW.md` for completed work awaiting human review. Do not duplicate file-by-file maps across files.

> (Template note — remove before saving: If a subsystem grows distinct rules, add a nested `AGENTS.md` in that directory or a dedicated file in `docs/rules/` and link it in the table above. Never let the root file grow past tool truncation limits.)
