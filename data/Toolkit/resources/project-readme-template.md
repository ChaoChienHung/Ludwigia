# [Project name]

> (Template note — remove before saving `README.md`: Replace bracketed placeholders with project-specific facts. Delete sections that do not apply. Keep this root README scannable — put deep tutorials, long command recipes, and exhaustive specs in linked `docs/guide/` or `docs/specs/` files rather than growing a single monolithic file.)

[One or two sentences describing what the project is, who it serves, and its core architecture.]

## Quick start

1. Install [requirements, e.g., Python 3.11+ / Node 20+].
2. Run `[local server or dev command]`.
3. Open [local URL or entry point].

## Terminology

Shared vocabulary for humans and agents (keep exact schemas in `docs/specs/`):

- **[Term 1]**: [Short definition and where it lives.]
- **[Term 2]**: [Short definition and how it differs from similar terms.]

## Repository Map

Shared folder-level map for readers and agents. Describe directory responsibilities rather than listing every file; update only when a directory's role changes.

```text
[project-name]/
├── [src-or-content]/          # Single source of truth ([source files])
│   └── [sub-area]/            # [Specific responsibility]
│
├── [shared-or-core]/          # Shared code, styles, and design tokens
├── [data-or-config]/          # Structured data and configuration
├── [generated-output]/        # Generated outputs (produced by `[build command]`)
├── [tools-or-scripts]/        # Build, migration, and helper scripts
├── docs/                      # Specs, guides, rules, design decisions, and feature guide
│   └── README.md              # Feature-to-folder routing entry point
│
├── tests/                     # Automated tests (`[test command]`)
├── AGENTS.md                  # Root agent instructions and repo-wide invariants
├── HANDOFF.md                 # Latest stopping point for agent handoff
├── TODO.md                    # Unfinished and long-term tasks
├── REVIEW.md                  # Completed work awaiting human review
└── README.md                  # Project entry point and everyday workflow
```

## Make one change

1. Edit [single source of truth].
2. Run `[build command]`.
3. Run `[test command]`.
4. Verify [affected page or interaction].

### Common commands

```bash
[build command]     # Rebuild outputs from source
[test command]      # Run automated test suite
[check command]     # Verify generated files / lint / formatting
[serve command]     # Run local preview
```

For full authoring workflows, advanced CLI options, and edge cases, see `[docs/guide/workflow-guide.md]`.

## Deploy

- Deployment target: [host]
- Trigger: [push or manual command]
- Required generated files (committed whitelist): [list]

## Documentation ownership

- `README.md`: Shared entry point (quick start, terminology, repository map, everyday commands).
- `docs/README.md`: Feature-to-folder routes and starting documentation.
- `AGENTS.md` (and delegated subsystem contracts in nested `AGENTS.md` / `docs/rules/`): Agent rules and non-regression invariants.
- `docs/specs/`, `docs/guide/`, `docs/design/`: Exact contracts, step-by-step guides, and design rationale.
- `HANDOFF.md` / `TODO.md` / `REVIEW.md`: Stopping point, backlog, and completed items awaiting review.

> (Template note — remove before saving: Link instead of duplicating. When a README section grows past a quick reference, extract it into `docs/guide/` and leave a concise summary plus link here.)
