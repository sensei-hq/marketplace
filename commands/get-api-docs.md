---
description: Fetch documentation for a third-party library before writing code that uses it
argument-hint: <library-name> [component]
---

# Get API / Library Docs

When you need documentation for a library, SDK, or API — fetch it from the sensei
index rather than guessing from training data. This gives you current, correct docs.

## Step 1 — Check if docs are already indexed

Use the sensei MCP tool:

```
get_lib_docs(name="<library-name>")
```

This returns the index/overview for that library. If it returns content, skip to Step 3.

## Step 2 — If not indexed, search or add it

**Search** across all indexed docs first:

```
search_lib_docs(query="<library-name>")
```

If nothing found, **index it**:

```
add_library(name="<library-name>")
```

This auto-discovers the library's `llms.txt` from common URLs (npm, PyPI, GitHub,
official sites). If auto-discovery fails, ask the user for the docs URL and pass it:

```
add_library(name="<library-name>", url="https://example.com/llms.txt")
```

## Step 3 — Get specific component docs

If you need docs for a specific part of the library (e.g. a component, module, or API):

```
get_lib_docs(name="<library-name>", component="<component>")
```

Examples:
- `get_lib_docs(name="rokkit", component="list")` — Rokkit list component
- `get_lib_docs(name="stripe", component="webhooks")` — Stripe webhooks
- `get_lib_docs(name="kavach", component="auth-guard")` — Kavach auth guard

## Step 4 — Use the docs

Read the fetched content and use it to write accurate code. Do not rely on memorized
API shapes — use what the docs say.

## Quick reference

| Goal | MCP Tool Call |
|------|---------------|
| Library overview | `get_lib_docs(name="react")` |
| Specific component | `get_lib_docs(name="rokkit", component="select")` |
| Search all docs | `search_lib_docs(query="authentication")` |
| Index new library | `add_library(name="openai")` |
| Index with URL | `add_library(name="mylib", url="https://...")` |

## Notes

- Always check indexed docs before searching the web
- The index persists across sessions — once indexed, docs are always available
- Component names use suffix matching: `"list"` matches `rokkit-list`, `list-component`, etc.
- If a library was auto-indexed from your project's dependencies, it may already be available
