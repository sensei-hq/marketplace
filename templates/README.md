---
name: Templates
description: Document templates for each workflow phase — output contracts for commands
---

# Templates

Each template defines the output contract for a workflow phase. Commands use these to produce consistent, traceable documents.

| Template | Phase | Key frontmatter | Key sections |
|----------|-------|-----------------|-------------|
| [idea.md](./idea.md) | 01 Ideate | name, description, date, status, origin | Problem, Current state, What this covers, Open questions |
| [analysis.md](./analysis.md) | 02 Analyze | + origin (traces to idea) | Purpose, Current state, Feasibility, Approaches (2-3), Recommendation, Impact |
| [blueprint.md](./blueprint.md) | 03 Blueprint | + origin, analysis | Overview, Architecture, Components, Data flow, Integration, Dependencies, Implementation order |
| [experiment.md](./experiment.md) | 04 Experiment | + origin, branch | Hypothesis, Approach, Constraints, Findings, Recommendation, Artifacts |
| [plan.md](./plan.md) | 05 Plan | + origin, blueprint, milestone | Overview, Principles, Features (with layers, acceptance criteria, test scenarios), Dependency graph, Progress |

## Usage

Commands read the user's configured template (from `.sensei/config.yaml`) or fall back to these defaults. The AI fills in the placeholders and removes the HTML comments.

## Traceability

Every template includes an `origin:` frontmatter field that traces back to the parent phase document. This creates a chain: idea → analysis → blueprint → plan → code.
