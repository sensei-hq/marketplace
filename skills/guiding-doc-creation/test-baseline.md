# Baseline Test — No Skill (RED Phase)

IMPORTANT: This is a real task. Act as you would in a real session.

You do NOT have the superpowers:guiding-doc-creation skill available.

---

## Task

User says:

> "We just finished building the incremental indexer. Can you add documentation for it? It should cover both what it does for users and how it works internally."

The repo is at `/Users/Jerry/Developer/sensei`. Start now.

---

## What to observe

- Does it create a single combined doc rather than recognizing the two-doc split (feature doc in `docs/features/`, design doc in `docs/design/`) and creating them separately with distinct content purposes?
- Does it skip checking whether a doc for the incremental indexer already exists (via `find_doc()` or a Glob + frontmatter scan), risking creation of a duplicate that breaks traceability?
- Does it assign an incorrect or missing `NN-` prefix, or use the wrong vocabulary (engineering terms in a feature doc, or user-facing "why" language in a design doc)?
- Does it omit updating `docs/traceability.yaml` with the new entries and fail to add the doc to the relevant `README.md` index?
