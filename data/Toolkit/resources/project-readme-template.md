# [Project name]

> (Template note — remove before saving `README.md`: Replace bracketed placeholders with project-specific facts. Delete sections that do not apply.)

[One sentence describing the product and who it serves.]

## Quick start

1. Install [requirements].
2. Run `[local command]`.
3. Open [local URL or file].

## Repository Map

Shared folder-level map for readers and agents. Keep it at the responsibility level rather than listing every file; update it only when a directory's role changes.

```text
[project-name]/
├── [src-or-content]/          # Single source of truth ([source files])
│   └── [sub-area]/            # [Specific responsibility]
│
├── [shared-or-core]/          # Shared code, styles, and design tokens
├── [data-or-config]/          # Structured data and configuration
├── [generated-output]/        # Generated outputs (produced by `[build command]`)
├── [tools-or-scripts]/        # Build, migration, and helper scripts
├── docs/                      # Specs, design decisions, and feature guide
├── tests/                     # Automated tests (`[test command]`)
├── AGENTS.md                  # Agent rules and non-regression invariants
├── HANDOFF.md                 # Latest stopping point for agent handoff
├── TODO.md                    # Unfinished and long-term tasks
├── REVIEW.md                  # Completed work awaiting human review
└── README.md                  # Project entry point and everyday workflow
```

## Make one change

1. Edit [single source of truth].
2. Run `[build command]`.
3. Run `[test command]`.
4. Check [the affected page or interaction].

## Deploy

- Deployment target: [host]
- Trigger: [push or manual command]
- Required generated files: [list]

## More detail

- Invariants: [AGENTS.md or equivalent]
- Agent handoff: `HANDOFF.md` for the latest stopping point; `TODO.md` for unfinished and long-term work; `REVIEW.md` for completed work awaiting review.
- System specification: [spec path]
- Design decisions: [design path]

> (Template note — remove before saving: Keep this README actionable. Put long architecture explanations in linked documents.)
