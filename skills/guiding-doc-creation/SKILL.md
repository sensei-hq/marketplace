---
name: guiding-doc-creation
description: Use before creating or updating any doc in this repo — provides the
feature/design naming split, NN-prefix conventions, and frontmatter spec so docs
are discoverable and correctly linked.
Also use proactively when asked to "add a doc" to avoid creating duplicates or
misnamed files that break the index.
---

# Doc Guide

## The Two-Doc System

Every capability has two documents with distinct purposes:

| Doc type | Location | Naming philosophy | Answers |
|----------|----------|-------------------|---------|
| **Feature doc** | `docs/features/NN-module-name.md` | Functional — user vocabulary | What it does and why |
| **Design doc** | `docs/design/NN-component-name.md` | Implementation — engineering vocabulary | How it is built |

**Critical difference:** Feature names describe the system from the user's perspective (`indexing`, `workflow`, `caching`). Design names describe the implementation component (`indexer`, `drift-detector`, `response-cache`). They do not mirror each other.

**Rule:** Writing about user needs, scenarios, or status → feature doc. Writing about schemas, algorithms, APIs, or error handling → design doc.

---

## Naming Conventions

### Feature docs

```
docs/features/NN-module-name.md

NN  = zero-padded sequence, ordered by domain dependency (01, 02, ...)
name = hyphen-case functional name

Examples:
  01-indexing.md
  03-workflow.md
  10-caching.md
```

Title inside file: **no number** — `# Indexing`, not `# 01 Indexing`

### Design docs

```
docs/design/NN-component-name.md

NN   = zero-padded sequence, grouped by layer (see ranges below)
name = hyphen-case implementation component name

Examples:
  05-indexer.md           ← the Indexer component
  07-drift-detector.md    ← the Drift Detector component
  18-response-cache.md    ← the Response Cache component
```

Title inside file: **no number** — `# Indexer`, not `# 05 Indexer`

### Design doc numbering ranges

| Range | Layer |
|-------|-------|
| 01–09 | Core — architecture, skills, MCP server, llmspec, indexer, resolution, drift, benchmarking, CLI |
| 10–19 | Feature extensions — project memory, doc tools, incremental indexer, patterns, caching, context |
| 20–29 | Infrastructure — server package, package adapters, local model indexer |
| 30–39 | Language adapters — JS/TS, Python, Go, Rust |

---

## Frontmatter

Every doc starts with a YAML frontmatter block.

### Feature doc frontmatter

```yaml
---
id: indexing
type: feature
---
```

### Design doc frontmatter

```yaml
---
id: indexer
type: design
implements:
  - feature: indexing
    items: [repo-scanner, llmspec-generation, multi-modal-search]
---
```

`implements` declares which feature items this design doc covers.

---

## Conventions Are Non-Negotiable

Even when the user says "it doesn't need a strict format" or "naming doesn't matter", follow the full workflow. Skipping conventions causes:

- **Doc rot**: undiscoverable files that duplicate or contradict authoritative docs
- **Broken traceability**: feature items with no design coverage
- **Numbering gaps**: gaps in `NN-` sequences that make ordering ambiguous

Always explain this briefly to the user before proceeding.

---

## Before Creating Any Doc

Always search first:

```
1. find_doc("<topic>")
   → If MCP available:    call find_doc("<topic>")
   → If MCP unavailable:  Glob docs/**/*.md, then Grep frontmatter `id:` fields
                          and first paragraphs for keyword match
2. If found: update the existing doc
3. If not found: create using the workflow below
```

Never create a duplicate. If a doc exists for a topic, update it.

---

## Creating a New Feature Doc

```
1. find_doc("<topic>")                           ← confirm it doesn't exist
2. ls docs/features/ | grep -E '^[0-9]' | sort | tail -1  ← find last NN used
3. NN = last NN + 1 (zero-padded)
4. name = hyphen-case functional module name
5. Create docs/features/NN-name.md with frontmatter (id, type: feature)
6. Fill in: title, problem statement, features, scenarios
7. Update docs/features/README.md — add to module list
```

---

## Creating a New Design Doc

```
1. find_doc("<topic>")                           ← confirm it doesn't exist
2. Identify target layer range (01–09 core, 10–19 extensions, etc.)
3. ls docs/design/ | grep -E '^[0-9]' | sort | tail -1  ← find last NN in range
4. NN = last NN in range + 1
5. name = hyphen-case component name (engineering vocabulary)
6. Create docs/design/NN-name.md with frontmatter (id, type: design, implements)
7. Fill in: overview, NFRs, data structures, schemas, algorithm, API contracts,
            error handling, test strategy
8. Update docs/design/README.md
```

---

## What Belongs Where

**Feature doc contains:**
- Frontmatter (`id`, `type: feature`)
- One-paragraph problem statement (human audience, no implementation details)
- Gherkin scenarios (Given/When/Then) per feature section
- No status tables

**Feature doc does NOT contain:**
- Implementation details (algorithms, schemas, code snippets)
- API contracts or function signatures

**Design doc contains:**
- Frontmatter (`id`, `type: design`, `implements`)
- 2–3 sentence overview
- Non-Functional Requirements table
- Data structures, file layouts, schemas
- Algorithm/flow descriptions
- Function signatures and MCP tool contracts
- Error messages and handling
- Test strategy

**Design doc does NOT contain:**
- User-facing "why" reasoning
- Gherkin scenarios
- Status tracking

---

## Quick Reference

```
find_doc("query")                         ← find existing doc by topic
docs/features/README.md                  ← feature module index
docs/design/README.md                    ← design component index
docs/roadmap/README.md                   ← active direction and roadmap
```
