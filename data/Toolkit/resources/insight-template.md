# [Project, model, or component] — Research Notes

> (Template note — remove before saving `INSIGHT.md`: This file holds conclusions that outlive a single run; the dated record of what was run lives in the sibling `experiment-log.md`. Place one at the repository root for cross-cutting notes and, when a model or component grows its own findings, another beside it, for example `Recall/TIGER/INSIGHT.md`. At the root, split each section into scope subsections such as `### General`, `### [Stage]`, `### [Model]`; in a model-level file, drop the subsections.)

Research notes for [scope]. Keep facts and hypotheses apart, and cite the source of every result: data version, split, model settings, metric, and the `experiment-log.md` entry or run where it came from.

*Created: [YYYY-MM-DD]; last updated: [YYYY-MM-DD]. Experiment log: [experiment-log.md](experiment-log.md).*

## Insights

Interpretations drawn from data or experiments that change how the work should proceed.

- [Insight, with the evidence it rests on and how far it can be trusted]

## Facts

Confirmed data properties, implementation details, and run results.

- [Fact, with numbers and source: experiment-log date and experiment name, run ID, or file]

## Limitations

Known weaknesses of the current data, implementation, or evaluation that restrict what results can claim.

- [Limitation and what it prevents you from concluding]

## Hypothesis

Claims awaiting verification. Number them and keep IDs stable; cite them from other files as `[path] H[n]`.

- **H1 — [Short claim]:** [prediction, why you expect it, and how it would be tested]

## Discussion

Open design choices and trade-offs still being weighed.

- **[Topic]:** [options and current leaning]

## Problems to solve

Concrete blockers or unknowns to resolve. Once a problem becomes scheduled work, track it in `TODO.md`.

- [Problem and what resolving it would unlock]

> (Template note — remove before saving: When an experiment confirms or rejects a hypothesis, update its entry (status and link to the experiment) instead of deleting it, and move the result into Facts or Insights. Write "None yet" for sections with nothing verified rather than leaving them empty.)
