# AGENTS.md starter template

Replace bracketed text with your project's actual paths, commands, and contracts. Delete sections that do not apply.

## Project boundary

- This project is [one-sentence description].
- The source of truth for [content or data] is [path]. Generated [output] comes from [command]. Never edit both by hand.
- Keep the core workflow usable with [minimal toolchain]. Additional apps may have their own build steps.

## Documentation ownership

- Before working, read `README.md` sections [Terminology heading] and [Repository Map heading] for shared vocabulary and folder-level responsibilities. Then use [feature guide path] to find the relevant docs and implementation folders.
- Keep reader-facing navigation and workflow in `README.md`; use this file for agent-specific instructions and invariants. Keep exact contracts in [specs directory] and feature-to-folder routes in [feature guide path].
- Update the map only when a folder's responsibility changes, and the feature guide only when ownership or its starting documentation changes. Do not maintain a file-by-file map here.

## Do and don't

- Do follow [current component or module] and read [dependency manifest] before choosing a library or version.
- Do use design tokens from [token source] and data access through [client or data layer].
- Do keep changes focused and reuse existing components and state conventions.
- Don't hard-code [colors, URLs, or duplicated data] or add dependencies without checking the project's policy.

## Non-regression rules

- [User-visible behavior] must keep working on [desktop/mobile/file or hosted URL].
- [Draft or private content] must not appear in public listings.
- If shared navigation or design tokens change, update the single source at [path] and regenerate dependent pages.
- Do not add a second hand-maintained copy of [metadata, index, or data].

## Verification

- Run the smallest relevant check: [exact command for one test file or module].
- Run [exact formatting or type-check command, if supported].
- Run [full test/build command] when the change spans modules or a required gate calls for it.
- Regenerate [output] with [command] and check that it is reproducible.
- Review [critical interaction] on desktop and mobile when its appearance changes.
- When the same mistake recurs, reproduce it, improve [API or module boundary] to remove the bad path where feasible, and add [targeted automated check]. Keep prose rules for decisions that cannot be checked reliably.

## Safety and collaboration

- Routine read, edit, and targeted verification: [what the agent may do directly].
- Confirm scope before [dependency install, destructive change, push, or deploy], unless the task already authorizes it.
- If a contract or requirement is unclear, report what you found, propose the smallest workable next step, and ask only for the missing decision.

## Examples and review

- Follow [good example path] for [pattern]; avoid copying [outdated example path] because [reason].
- API docs: [path or URL]; call APIs through [client path] rather than duplicating requests in UI code.
- Before a PR, review the diff, relevant tests, generated files, and user-visible behavior; summarize any unverified area.
- For high-risk behavior changes, optionally write a regression test before implementation if it will catch a real failure mode.

## Where to look

- Shared terminology, repository map, setup, and everyday commands: `README.md`
- Feature-to-folder routes and starting docs: [feature guide path]
- System contracts: [spec path]
- Design decisions: [design path]
- Current tasks: [task list]

For a subsystem with distinct rules, add a nested `AGENTS.md` in that directory and state which rules it adds. Keep shared rules here.

Keep this file focused on rules that must remain true. Put tutorials and long explanations elsewhere.
