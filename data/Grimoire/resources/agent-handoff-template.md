# HANDOFF.md starter template

Save as `HANDOFF.md` at the project root and replace brackets with verified facts. Record where the previous agent stopped so the next agent can resume immediately. The task tracker owns the overall and long-term backlog; do not copy unassigned tasks here. Aim for at most 2,000 tokens and enforce a 6 KiB UTF-8 hard limit. Replace stale details instead of appending a log.

## Snapshot

- Updated: [date]. Branch or environment: [only if relevant].
- Stopping point: [last completed action, verification evidence, and exactly what remains unfinished].
- Working tree: [only local changes the next agent must preserve]. Verify with `git status --short`; this handoff may be stale.

## In-progress work

### [Short task title]

- **Context**: [why this work matters; link the source request or decision].
- **Status**: [what is done and verified; name the exact check or artifact].
- **Open issue**: [what is unknown, broken, or still unverified].
- **Next action**: [the first concrete step and its expected result].
- **Blocker**: [only if external input or a dependency truly prevents progress; otherwise omit].

Repeat the task block only for unfinished work that the next agent should resume. If none remains, write "None" and wait for the next request; do not promote long-term backlog items into this file. Never include secrets or paste long logs, diffs, or transcripts.
