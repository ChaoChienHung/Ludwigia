# [Model or component] — Experiment Log

> (Template note — remove before saving `experiment-log.md`: Keep this file next to the model or component it covers, for example `Recall/TIGER/experiment-log.md`, not at the repository root. It is a dated lab journal of what was run each day. Durable conclusions move to the sibling `INSIGHT.md` as Facts, Insights, Limitations, or Hypotheses; follow-up work goes to `TODO.md`.)

Dated journal of experiments for [model or component]. Newest day at the bottom. Conclusions that hold beyond one run are promoted to [INSIGHT.md](INSIGHT.md).

## [YYYY-MM-DD]

### [Experiment name]

#### Motivation

[Why run this now: the question, the suspected problem, or the `INSIGHT.md` hypothesis it tests (for example H3).]

#### Details

- **Baseline:** [run name, commit, or config being compared against]
- **Change:** [what differs from the baseline; one variable at a time where possible]
- **Data:** [dataset, version, split]
- **Environment:** [machine or cluster job ID, hardware, seed]
- **Command:** `[command or script used to run it]`
- **Artifacts:** [run directory or log location]

#### Expectation

[What you expect to happen and why, written before the run and not edited afterwards.]

#### Key Metrics

- [Metric, split, and cutoff, e.g. validation Recall@10, NDCG@10]
- [What result would count as supporting or rejecting the expectation]

#### Results

| Run | [Metric] | [Metric] | Notes |
| --- | --- | --- | --- |
| Baseline | [value] | [value] | [run name] |
| [Variant] | [value] | [value] | [run name] |

- **Observations:** [what the numbers and logs show, including surprises and failed runs]
- **Hypotheses:** [new explanations the results suggest; mark them as unverified]

#### Conclusion

[Supported / rejected / inconclusive, and the decision: adopt, discard, or rerun with changes. Name what was promoted to `INSIGHT.md` and which `TODO.md` task follows, if any.]

> (Template note — remove before saving: Repeat `### [Experiment name]` under a date for each experiment that day, and add a new `## [YYYY-MM-DD]` for each new day. Separate validation from held-out test results. Link raw logs instead of pasting them, and do not include secrets.)
