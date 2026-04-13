---
name: identify-unknown-libs
description: "Use when get_lib_docs returns sections: [] for a library you're about to use — detects missing indexed docs and guides you through registering them without hallucinating."
---

# Identifying and Registering Unknown Libraries

## When to Use

Before using any library, call `get_lib_docs` to check for indexed documentation. If `sections: []` is returned, follow this protocol before proceeding with any implementation.

**Do not guess or hallucinate API details.** Unknown library = stop and ask.

## Protocol

### Step 1 — Stop

Do not invent function signatures, component names, or configuration options. Hallucinated API usage will compile but fail at runtime.

### Step 2 — Ask the user

> "I don't have indexed docs for `{lib}`. Can you point me to the documentation? I can accept:
> - An `llms.txt` URL (e.g. `https://rokkit.dev/llms.txt`)
> - An HTTP docs page URL (e.g. `https://kavach.dev/docs`)
> - A raw `.md` file or README URL (e.g. `https://raw.githubusercontent.com/user/repo/main/README.md`)
> - A local path to a markdown file or directory"

### Step 3 — Determine source_type (first match wins)

| User input | source_type | config field |
|------------|-------------|--------------|
| URL whose path ends with `/llms.txt` | `llms.txt` | `base_url` |
| Any other `https://` or `http://` URL | `http` | `base_url` |
| File or directory path | `local` | `local_path` |

### Step 4 — Edit `.sensei/config.yaml`

Add the entry under `custom_libs`. If `custom_libs` doesn't exist yet, create the section:

```yaml
custom_libs:
  - name: {lib}
    source_type: llms.txt     # or: http / local
    base_url: {url}           # for llms.txt and http
    # local_path: {path}      # for local (replace base_url with this)
```

### Step 5 — Index

Run:
```bash
sensei update-registry --lib {lib}
```

### Step 6 — Retry

Call `get_lib_docs` again with the original query.

### Step 7 — If still empty

Tell the user:
> "Indexing may have failed. Try running `sensei update-registry --lib {lib}` manually to see the error output."

### Step 8 — If user says skip

Proceed, but note in your response that you are working without indexed docs and your knowledge may be incomplete or outdated.
