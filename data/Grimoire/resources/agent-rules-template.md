# AGENTS.md starter template

Adapted from Ludwigia's `AGENTS.md`. Replace the bracketed text with your project's actual paths and contracts; delete sections that do not apply.

## Project boundary

- This project is [one-sentence description].
- The source of truth for [content or data] is [path]. Generated [output] comes from [command]. Never edit both by hand.
- Keep the core workflow usable with [minimal toolchain]. Additional apps may have their own build steps.

## Non-regression rules

- [User-visible behavior] must keep working on [desktop/mobile/file or hosted URL].
- [Draft or private content] must not appear in public listings.
- If shared navigation or design tokens change, update the single source at [path] and regenerate dependent pages.
- Do not add a second hand-maintained copy of [metadata, index, or data].

## Verification

- Run [test command] after code changes.
- Regenerate [output] with [command] and check that it is reproducible.
- Review [critical interaction] on desktop and mobile when its appearance changes.

## Where to look

- Setup and everyday commands: `README.md`
- System contracts: [spec path]
- Design decisions: [design path]
- Current tasks: [task list]

Keep this file focused on rules that must remain true. Put tutorials and long explanations elsewhere.
