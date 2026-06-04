---
name: reverse-engineering
description: Use when reverse-engineering an existing codebase into documentation — generating openspec/ product docs, per-feature specs, or a security/NFR audit with OWASP Top 10 coverage, DB schema analysis, and structured backlogs. Invoked by /sensei:spec with mode=product|feature|audit.
---

# INVOCATION CONTRACT

This skill is invoked by `/sensei:spec`, which maps its sub-actions to a `mode`. The invocation passes these parameters:

```
mode=<mode> [capability=<n>] [scope_paths=<path1,path2>] [root=<path>]
```

**Parameters:**
- `mode` — Required. One of: `product` | `feature` | `audit`
- `capability` — Optional for `mode=feature` (if omitted, interactive selection runs). Optional for `mode=audit` (omit to audit everything).
- `scope_paths` — Optional. Comma-separated paths. If omitted, resolved from `features.md` or per-stack fallback rules.
- `root` — Optional. Root directory. Defaults to `.`

**Examples** (parameters as passed by `/sensei:spec`):
```
mode=product
mode=product root=./apps/backend
mode=feature capability=auth
mode=feature capability=payments scope_paths=src/payments,src/api/billing
mode=feature
mode=audit capability=auth
mode=audit
```

**Validation Rules:**
- If `mode` is missing or invalid → STOP. Print valid syntax and ask user to re-invoke.
- If `mode=feature` and `capability` is omitted AND `product/features.md` does not exist → STOP. Instruct user to run `mode=product` first.
- If `mode=feature` and `capability` is omitted AND `product/features.md` exists → run Interactive Feature Selection.
- If `mode=feature` and `capability` is provided but product baseline does not exist → AUTO-EXECUTE `mode=product` first, log this action, then continue.
- If `mode=audit` and `capability` is omitted → audit ALL capabilities under `specs/` including `specs/common/` and all DB docs.

---

# GLOBAL RULES

- Do NOT modify source code.
- Only create/update documentation under `openspec/**`.
- Every meaningful claim MUST include evidence: `file::symbol/config + observation`.
- Every document MUST include at the end:
  - `## Evidence`
  - `## Update Log`
- This applies to ALL documents across `product/`, `specs/`, `specs/common/`, `product/db/`, and `backlog/`.
- Version compliance MUST use official documentation only (no blogs, no third-party articles).
- Never fabricate LOC, schema, or coverage metrics. If artifact is missing → mark `UNKNOWN` and create a backlog item.
- Overwrite protection MUST be enforced for ALL completed documents (see Overwrite Protection).
- Backlog item IDs MUST follow the defined schema (see Backlog ID Schema).
- `archive/` folder is created ONLY when the first item is archived. Never created upfront.

---

# DOCUMENT STRUCTURE (COMPLETE)

```
openspec/
  project.md                      ← stacks, db_applicable flag, run metadata

  product/
    features.md                   ← feature list, status, scope_paths, utilities section
    architecture.md               ← system design, layers, component boundaries
    stack.md                      ← detected stacks, versions, compliance report
    deployment.md                 ← environments, CI/CD, infra signals
    setup.md                      ← local development setup instructions
    flow-diagram.md               ← product-level user flows + Mermaid diagrams
    api-registry.md               ← owned endpoints / consumed endpoints / third-party APIs
    decisions.md                  ← open questions, assumptions, architectural decisions
    code-quality.md               ← health score, OWASP, NFR summary, DB health
    run-log.md                    ← history of every run

    db/                           ← generated only if db_applicable = true | local_only
      db-registry.md              ← all DBs, engines, ORM, health status
      <db-name>/                  ← one folder per detected DB engine
        summary.md                ← engine, ORM, config, migrations, PII summary + ER diagram
        schema.md                 ← tables/collections, columns, types, PII flags, relations
        er-diagram.md             ← Mermaid ER diagram per schema
        table-usage.md            ← used + unused tables, feature ownership, reference map

  specs/
    <capability>/                 ← one per feature
      proposal.md                 ← business intent (OpenSpec default name, never rename)
      spec.md                     ← GIVEN/WHEN/THEN scenarios
      design.md                   ← technical design, DB table ownership if applicable
      api.md                      ← capability-specific API details
      flow-diagram.md             ← user flows + Mermaid diagrams
      nfr.md                      ← NFR coverage across 6 dimensions

    common/                       ← unclaimed files auto-categorized as utilities
      <category>/                 ← e.g. helpers/, config/, db/, logging/
        proposal.md
        spec.md
        design.md
        api.md
        flow-diagram.md
        nfr.md

  backlog/                        ← all actionable findings, single source of truth
    product.md                    ← rolled-up backlog from all sources
    <capability>.md               ← per feature backlog (e.g. auth.md, payments.md)
    common.md                     ← utility categories backlog
    db.md                         ← cross-DB findings (if db_applicable)
    db-<name>.md                  ← per engine backlog (e.g. db-postgres.md, db-mongo.md)

  archive/                        ← created only when first item is archived
```

---

# OVERWRITE PROTECTION

Applies to ALL documents when they already exist for the target capability or DB:

**Specs documents:**
`proposal.md`, `spec.md`, `design.md`, `api.md`, `flow-diagram.md`, `nfr.md`

**DB documents:**
`summary.md`, `schema.md`, `er-diagram.md`, `table-usage.md`

**Rule:** If any of these files exist → print the list and ask:
```
⚠️  Existing docs found for '<capability | db-name>':
  - specs/<capability>/spec.md
  - specs/<capability>/nfr.md
  [...]
Overwrite all? (yes / selective / cancel)
  yes       → overwrite all listed files
  selective → ask per file
  cancel    → abort
```
Do not proceed until user responds.

---

# BACKLOG ID SCHEMA

All backlog items across ALL documents MUST use this format:

```
BL-<SCOPE>-<CATEGORY>-<SEQ>
```

- `<SCOPE>` — `PROD` | `<CAPABILITY>` uppercase | `COMMON` | `DB` | `DB-<DBNAME>` uppercase
- `<CATEGORY>` — One of: `SEC` | `PERF` | `REL` | `SCALE` | `MAINT` | `A11Y` | `VER` | `COV` | `ARCH` | `GEN` | `SCHEMA` | `OPT` | `PII`
- `<SEQ>` — Zero-padded 3-digit sequence, unique within scope+category

**Examples:**
```
BL-PROD-SEC-001           ← product-level security finding
BL-PROD-VER-001           ← product-level version compliance finding
BL-AUTH-SEC-001           ← auth capability security finding
BL-AUTH-PERF-001          ← auth capability performance finding
BL-COMMON-MAINT-001       ← utility category finding
BL-DB-ARCH-001            ← cross-DB architectural finding
BL-DB-POSTGRES-PII-001    ← PostgreSQL PII finding
BL-DB-MONGO-OPT-001       ← MongoDB optimization finding
```

**Rules:**
- IDs are permanent once assigned. Never reassign or reuse a retired ID.
- When rolling up into `backlog/product.md` retain original IDs — never re-ID.
- Sequence numbers are scoped per `SCOPE+CATEGORY` pair and increment monotonically.

---

# BACKLOG ITEM FORMAT

Every backlog item across ALL backlog files MUST use this format:

```
### BL-<SCOPE>-<CATEGORY>-<SEQ>
**Title:** <short descriptive title>
**Severity:** Mandatory | Important | Good to Have | Suggestion
**Source:** <what analysis stage produced this finding>
**Detail:** <what the issue is and why it matters>
**Recommendation:** <what to do to fix or address it>
**Evidence:** <file::symbol or N/A>
**Status:** Open | In Progress | Resolved
```

---

# STACK PROFILE AUTO-DETECTION (MANDATORY — MULTI-STACK)

Detect ALL matching stack profiles. Store as `stack_profiles[]` array.

**Detection Anchors (evaluate all, not first match):**

| Profile | Anchors |
|---|---|
| `next` | `next.config.*` + `app/` or `src/app/` |
| `node` | `package.json` + `server/` or `controllers/` or `routes/` (no Next anchor) |
| `react` | `package.json` + `src/` with React dependency, no Next anchor |
| `android` | `build.gradle(.kts)` + `settings.gradle(.kts)` + `AndroidManifest.xml` |
| `ios` | `Package.swift` or `.xcodeproj/.xcworkspace` + Swift sources |
| `generic` | Fallback if no anchors match |

**Monorepo Handling:**
- Record all detected profiles in `stack_profiles[]` each with `root_path` and evidence.
- All subsequent analysis runs per profile.
- Log in `openspec/project.md` with evidence per profile.

**scope_paths Fallback Rules:**

| Profile | Default scope_paths |
|---|---|
| `next` | `app/`, `src/app/`, `components/`, `lib/` |
| `node` | `src/`, `server/`, `controllers/`, `routes/`, `middleware/` |
| `react` | `src/`, `components/`, `hooks/`, `lib/` |
| `android` | `app/src/main/java/`, `app/src/main/kotlin/`, `app/src/main/res/` |
| `ios` | `Sources/`, `<AppName>/` (inferred from `.xcodeproj` name) |
| `generic` | `.` (project root, limited depth) |

If a path does not exist → log warning in `run-log.md` and skip.
If uncertain → mark as `UNKNOWN`, list missing evidence, add `BL-PROD-GEN-XXX`.

---

# DB AUTO-DETECTION (RUNS AS STAGE IN MODE=PRODUCT)

## DB Engine Detection

Scan for ALL DB engines present simultaneously.

**SQL Engines:**

| Engine | Detection Signals |
|---|---|
| PostgreSQL | `pg`, `postgres` in dependencies; `DATABASE_URL=postgres://` in `.env` |
| MySQL | `mysql`, `mysql2` dependency; `DATABASE_URL=mysql://` |
| SQLite | `sqlite`, `better-sqlite3`; `.db` / `.sqlite` files |
| MSSQL | `mssql`, `tedious`; connection strings with `sqlserver://` |
| Oracle | `oracledb`; `jdbc:oracle` in config |

**NoSQL Engines:**

| Engine | Detection Signals |
|---|---|
| MongoDB | `mongoose`, `mongodb`; `MONGO_URI` in `.env` |
| Redis | `redis`, `ioredis`; `REDIS_URL` in `.env` |
| Elasticsearch | `@elastic/elasticsearch`; `ELASTICSEARCH_URL` in `.env` |
| Firebase/Firestore | `firebase-admin`, `@firebase/firestore`; `firebase.json` |
| DynamoDB | `@aws-sdk/client-dynamodb`; `AWS_` env vars + DynamoDB client usage |
| Cassandra | `cassandra-driver` dependency |

**Mobile Local DBs:**

| Engine | Detection Signals |
|---|---|
| Room (Android) | `androidx.room` in `build.gradle(.kts)`; `@Database` annotation |
| CoreData (iOS) | `.xcdatamodeld` file; `NSPersistentContainer` in Swift |
| SQLite (mobile) | `SQLiteOpenHelper` (Android); `SQLite.swift` or FMDB (iOS) |
| Realm | `realm` in `build.gradle` or `Package.swift` |

**DB Applicability Flag (written to `project.md`):**
- `db_applicable = true` → one or more DB engines detected
- `db_applicable = local_only` → only mobile local DB detected
- `db_applicable = false` → no DB signals found

If `db_applicable = false`:
- Skip all DB stages entirely
- Omit `product/db/` folder
- Omit `backlog/db.md` and `backlog/db-<name>.md`
- Omit Section 8 from `code-quality.md`
- Suppress DB-related warnings in `mode=feature`
- Log `DB: Not Applicable` in `run-log.md`

## ORM / ODM Detection

| ORM/ODM | Detection Signals |
|---|---|
| Prisma | `prisma/schema.prisma`; `@prisma/client` |
| TypeORM | `typeorm`; `ormconfig.*` or `DataSource` config |
| Sequelize | `sequelize`; `sequelize-cli` config |
| Mongoose | `mongoose`; `mongoose.model()` calls |
| Drizzle | `drizzle-orm`; `drizzle.config.*` |
| Knex | `knex`; `knexfile.*` |
| Room (Android) | `@Dao`, `@Entity` annotations |
| CoreData (iOS) | `.xcdatamodeld` + `NSManagedObject` subclasses |
| Raw SQL | No ORM detected but DB engine found |

## Config Source Resolution (Priority Order)
1. ORM schema/config files (`prisma/schema.prisma`, `ormconfig.*`, `drizzle.config.*`)
2. Model files (primary schema source — see below)
3. Migration files
4. `.env` / `.env.*` files
5. `database.yml`, `database.json`, `db.config.*`
6. `build.gradle(.kts)` for Room
7. `.xcdatamodeld` for CoreData
8. App config files (`config/database.*`, `src/config/db.*`)

Never log credential values — log key names and source file paths only.

## Model File Parsing (Primary Schema Source)

| ORM/Engine | Model File Patterns |
|---|---|
| Prisma | `prisma/schema.prisma` — parse all `model` blocks |
| TypeORM | Files with `@Entity()` decorator; typically `*.entity.ts` |
| Sequelize | Files calling `sequelize.define()` or extending `Model`; `models/*.js/ts` |
| Mongoose | Files with `mongoose.Schema()` and `mongoose.model()`; `models/*.js/ts` |
| Drizzle | Files exporting `pgTable()`, `mysqlTable()`, `sqliteTable()` |
| Knex | Migration files; parse `createTable()` calls |
| Room (Android) | Kotlin/Java files with `@Entity` annotation |
| CoreData (iOS) | `.xcdatamodeld` XML — parse `<entity>` elements |
| Raw SQL | Migration files; `*.sql`; `CREATE TABLE` statements |
| Firebase/Firestore | Infer fields from `set()`, `update()`, `add()` call sites |
| DynamoDB | Infer from `PutItem`, `UpdateItem` shapes and table definition configs |
| Redis | Infer key patterns from `SET`, `HSET`, `LPUSH` call sites |

**Extraction Rules:**
- Extract: table/collection name, fields, types, nullability, defaults, PKs, FKs, indexes, unique constraints, relations
- Undetermined field type → mark `UNKNOWN`
- Fields sourced from call-site analysis (NoSQL) → mark `INFERRED`
- Log each model file as evidence in `schema.md`

## DB Static Code Scan

Walk all source files across all detected stack profiles.
Build a reference map: for each table/collection/column → list of files + reference count.

**Reference classification:**
- App code references → count as `Active`
- Migration/seed only references → classify as `Seed Only`
- Zero references → classify as `Unused`

**Confidence note (always include in `table-usage.md`):**
```
⚠️  Unused detection is based on static code scanning only.
Dynamic queries or runtime-generated references cannot be detected statically.
Manual verification recommended before dropping anything.
```

## PII Flagging

Scan all schema fields for PII pattern matches:
`email`, `phone`, `dob`, `ssn`, `password`, `token`, `address`, `name`, `ip_address`, `device_id`, `location`, `gender`, `nationality`, `passport`, `license`

- Flag in `schema.md` with ⚠️ PII marker
- Summarize in `summary.md`
- Link to OWASP A02 in `code-quality.md`
- Create `BL-DB-<DBNAME>-PII-XXX` per unprotected PII field in `backlog/db-<name>.md`

---

# DB DOCUMENT CONTENTS

## `db-registry.md`
- All detected DB engines with `db-name` folder references
- ORM/ODM per DB
- Config source files detected
- Model file count per DB
- DB Health status
- Links to each `<db-name>/summary.md`

## `summary.md` (per DB)
- Engine name and version (if detectable)
- ORM/ODM used
- Connection config source (file + env var names, NOT values)
- Connection pooling signals
- Environment variants (dev/staging/prod)
- Migration tool and migration file count
- Seed file presence
- PII column summary
- ER diagram (as final section — Mermaid)

## `schema.md` (per DB)
For each table/collection:
```
### <table_name>
Source: <model file path>
ORM: <orm name>

| Column/Field | Type | Nullable | Default | Constraints | PII Flag |
|---|---|---|---|---|---|
| id | uuid | No | gen_random_uuid() | PK | — |
| email | varchar(255) | No | — | UNIQUE | ⚠️ PII |

Indexes: <list>
Relations: <list with target table and cardinality>
Notes: <UNKNOWN fields, INFERRED fields, ambiguities>
```

## `er-diagram.md` (per DB)
- Mermaid `erDiagram` showing all tables, PKs, FK relationships, cardinality
- NoSQL → logical references (not enforced FK)
- If > 30 tables → split into domain cluster diagrams with a note

## `table-usage.md` (per DB)
Covers both used and unused tables in one document.

```
| Table | Owning Feature | Referenced In | Ref Count | Status |
|---|---|---|---|---|
| users | auth | src/auth/user.service.ts | 14 | Active |
| sessions | auth | src/auth/session.service.ts | 6 | Active |
| audit_logs | — | — | 0 | ⚠️ Unused |
| temp_imports | — | migrations/20230101.js | 1 | 🌱 Seed Only |
```

**Status values:** `Active` | `⚠️ Unused` | `🌱 Seed Only` | `INFERRED`

---

# API REGISTRY STRUCTURE

`product/api-registry.md` adapts based on project type:

| Project Type | Sections Generated |
|---|---|
| Backend / API | `## Owned Endpoints` |
| Frontend (React/Next/Mobile) | `## Consumed Endpoints` + `## Third-Party APIs` |
| Full-stack | All three sections |
| Component library / Static | File not generated |

**API Conflict Rule:**
If an incoming route conflicts (same method + path, different owner) → DO NOT overwrite.
- Log conflict with both owners
- Add `BL-PROD-ARCH-XXX`
- Mark entry with `[CONFLICT]` tag

---

# FEATURES.MD STRUCTURE

```markdown
## Features

| Feature | Description | Status | scope_paths | Spec |
|---|---|---|---|---|
| auth | User authentication | Not Started | src/auth/, src/middleware/ | — |
| payments | Payment processing | In Progress | src/payments/ | specs/payments/ |

## Utilities

| Category | Files | Description | Spec |
|---|---|---|---|
| helpers | 12 | Generic utility functions | specs/common/helpers/ |
| config | 4 | App config and env loaders | specs/common/config/ |
```

**Status values:** `Not Started` | `In Progress` | `Complete`

---

# DECISIONS.MD STRUCTURE

Tracks open questions, assumptions, and architectural decisions.

| State | Meaning | Trigger |
|---|---|---|
| `CLAIMED` | Identified, under investigation | Auto-set on creation |
| `RESOLVED` | Answer found, evidence recorded | Set when evidence confirmed |
| `CLOSED` | No further action needed | Manual or after audit confirms |

Entry format:
```
ID: DEC-<SEQ>
State: CLAIMED | RESOLVED | CLOSED
Title: <short title>
Detail: <description>
Evidence: <file::symbol or N/A>
Linked Backlog: <BL-IDs or none>
Updated: <date>
```

---

# UNCLAIMED FILE DETECTION & UTILITY CATEGORIZATION

Run during `mode=product` (Stage 6) and after every `mode=feature` pipeline (Stage G).

**Step 1 — Build claimed files set**
Collect all `scope_paths` from all features in `features.md`. Expand to actual file lists.

**Step 2 — Build full source files set**
Walk all `scope_paths` per detected stack profile.

**Step 3 — Diff**
Unclaimed = full source set − claimed pool.
If none → log "No unclaimed files detected" and skip.

**Step 4 — Categorize**

| Category | Signals |
|---|---|
| `helpers` | Generic utility functions, formatters, transformers |
| `config` | App config, environment loaders, feature flags |
| `constants` | Shared enums, constant definitions |
| `middleware` | Shared middleware not tied to a feature |
| `types` | Shared type/interface/schema definitions |
| `db` | DB connection, query builders, migrations, seeds |
| `logging` | Logger setup, monitoring hooks, telemetry |
| `testing` | Shared test fixtures, mocks, factories |

Unmatched → assign to `helpers`, flag for manual review in `backlog/common.md`.

**Step 5 — Run full feature pipeline per category**
Each utility category treated as a capability under `specs/common/<category>/`.
Use scope `COMMON` for all backlog IDs.

**Step 6 — Update `features.md`**
Add/update `## Utilities` section with category, file count, and spec link.

---

# NFR EVALUATION (6 DIMENSIONS)

Every capability AND every common utility category MUST evaluate all 6 dimensions in `nfr.md`:

1. Security
2. Performance
3. Reliability
4. Scalability
5. Maintainability
6. Accessibility

Coverage status per dimension: `Covered` | `Partial` | `Missing` + evidence + linked BL-IDs.

---

# VERSION COMPLIANCE (MANDATORY — PER STACK PROFILE)

Record all findings in `product/stack.md` under `## Version Compliance Report`.

| Profile | What to Check |
|---|---|
| `next` / `react` / `node` | Node.js LTS status, React version, Next.js version |
| `android` | AGP, Gradle, JDK, minSdk, targetSdk, compileSdk, buildTools |
| `ios` | iOS deployment target, Xcode compatibility, Swift version |
| `generic` | Any versioned runtime/toolchain in manifests |

- Official sources only (nodejs.org, developer.android.com, developer.apple.com)
- Unconfirmable versions → mark `UNKNOWN` + add `BL-PROD-VER-XXX`
- Cross-reference findings into `code-quality.md` Section 5

---

# CODE-QUALITY (Unified Health Model)

`product/code-quality.md` MUST include all sections.

## 1. Codebase Metrics
- Total LOC, Source Files, Test Files, Test-to-Code Ratio (per profile if monorepo)
- Claimed vs unclaimed file breakdown

## 2. Test Coverage Metrics
- Line Coverage, Branch Coverage, Covered/Uncovered LOC
- Coverage by Technology + by Capability + by Common Utility Category

## 3. Structural Quality
- Architecture layering, Modularity, Dependency boundaries, Complexity hotspots

## 4. Security — OWASP Top 10 (2021)
Reference: https://owasp.org/Top10/

### Security Hygiene
Authentication enforcement, Authorization enforcement, Input validation,
Dependency vulnerability signals, Secrets handling, Transport security

### OWASP Mapping
For each: `Covered` | `Partial` | `Missing` + Evidence + Linked BL-IDs

| # | Category |
|---|---|
| A01 | Broken Access Control |
| A02 | Cryptographic Failures |
| A03 | Injection |
| A04 | Insecure Design |
| A05 | Security Misconfiguration |
| A06 | Vulnerable and Outdated Components |
| A07 | Identification and Authentication Failures |
| A08 | Software and Data Integrity Failures |
| A09 | Security Logging and Monitoring Failures |
| A10 | Server-Side Request Forgery (SSRF) |

## 5. Version Compliance Summary
Outdated/EOL frameworks, required upgrades with severity, official source references.

## 6. NFR Coverage Summary (Aggregated)
Aggregated status across all capabilities and common utility categories for all 6 NFR dimensions.

## 7. Code Quality Rating

### Weighted Scoring Model

| Dimension | Weight |
|---|---|
| Test Coverage | 30% |
| Structural Quality | 20% |
| Security (incl. OWASP 2021) | 20% |
| Version Compliance | 15% |
| NFR Coverage | 15% |

### Rating Bands

| Weighted Score | Rating |
|---|---|
| 80–100 | Strong |
| 60–79 | Good |
| 40–59 | Moderate |
| 0–39 | Low |

### Confidence Level

| Condition | Confidence |
|---|---|
| ≥ 80% files analyzed + coverage artifact present + ≤ 2 UNKNOWNs | High |
| 50–79% files OR no coverage artifact OR 3–5 UNKNOWNs | Medium |
| < 50% files OR no coverage OR > 5 UNKNOWNs | Low |

Report as: `Good (Medium Confidence)`

## 8. DB Health (generated only if db_applicable = true | local_only)

Per detected DB:
- Total tables/collections documented
- Unused tables count + Seed-only tables count
- PII columns flagged count
- ER diagram coverage (% of tables in diagram)
- Schema source: Model Files | Migrations | Inferred | Mixed

Overall DB Health: `Healthy` | `Needs Attention` | `Critical`

## Evidence
## Update Log

---

# MODE: product

Stages (run in order):

**Stage 1 — Stack Detection**
- Detect ALL stack profiles → `stack_profiles[]` with `root_path` + evidence
- Record in `openspec/project.md`

**Stage 2 — Version Compliance**
- Validate detected versions against official docs per profile
- Record in `product/stack.md` under `## Version Compliance Report`
- Create `BL-PROD-VER-XXX` for required upgrades and missing proof

**Stage 3 — DB Detection & Analysis**
- Detect DB engines, ORM/ODM, config sources
- Set `db_applicable` flag in `project.md`
- If `db_applicable = false` → skip to Stage 4, log `DB: Not Applicable`
- If `db_applicable = true | local_only`:
  - Parse model files → primary schema source
  - Generate `product/db/db-registry.md`
  - Per detected DB engine generate:
    - `product/db/<db-name>/summary.md`
    - `product/db/<db-name>/schema.md`
    - `product/db/<db-name>/er-diagram.md`
    - `product/db/<db-name>/table-usage.md` (used + unused, status per table)
  - Run PII flagging across all schemas
  - Generate `backlog/db.md` (cross-DB findings)
  - Generate `backlog/db-<name>.md` per engine
  - Update `code-quality.md` Section 8 (DB Health)

**Stage 4 — Product Mapping**
- Generate:
  - `product/features.md` (Status, scope_paths, Spec columns populated best-effort)
  - `product/architecture.md`
  - `product/deployment.md`
  - `product/setup.md`
  - `product/flow-diagram.md`
  - `product/api-registry.md` (sections based on project type)
  - `product/decisions.md` (seed with CLAIMED items found during analysis)

**Stage 5 — Unclaimed File Detection**
- Detect unclaimed files, categorize into utility buckets
- Populate `## Utilities` in `features.md`
- Do NOT run full utility pipeline yet — runs during `mode=feature`
- Log unclaimed file counts and categories in `run-log.md`

**Stage 6 — Config Detection**
- Identify the Configuration details and Generate/update `config.yml` (all sections applicable to project type)

**Stage 7 — Code Quality Initialization**
- Generate `product/code-quality.md` (all sections applicable to project type)
- Mark unavailable metrics as `UNKNOWN` + create `BL-PROD-COV-XXX` items

**Stage 8 — Backlog Initialization**
- Generate `backlog/product.md` (aggregated from all stages above)
- Ensure all BL-IDs generated in Stages 1–6 are synced into `backlog/product.md`

**Stage 9 — Governance**
- Append first Run Entry to `product/run-log.md`

---

# MODE: feature

**Input:** `capability` (or via Interactive Feature Selection), `scope_paths` (or auto-resolved from `features.md`)
**Applies to:** Named capabilities AND `common/<category>` utility categories.
**Pre-flight:** Apply overwrite protection before any file is written.

**Interactive Feature Selection** (when `capability` not provided):

Step 1 — Read `features.md`, identify incomplete features (Status = `Not Started` or `In Progress`, no `specs/<capability>/` folder).

Step 2 — Present numbered list:
```
📋 Incomplete features found in features.md:

  [1] auth           → src/auth/, src/middleware/auth.js
  [2] payments       → src/payments/, src/api/billing/
  [3] notifications  → src/notifications/
  [4] (all)          → run all incomplete features

Select feature(s) to reverse engineer (e.g. 1 or 1,3 or all):
```
If no incomplete features → print:
```
✅ All features already have specs.
Use /sensei:spec audit to check for drift.
```
Then STOP.

Step 3 — If multiple selected:
```
▶ Multiple features selected: auth, payments, notifications
Run mode:
  [1] Sequentially — complete full pipeline for each before starting next
  [2] Ask me before each — pause and confirm before each feature starts
```
- Sequentially → run full pipeline per feature in order, one Run Entry each
- Ask before each → prompt per feature:
  ```
  ▶ Ready to process: <capability> (scope: <paths>)
  Proceed? (yes / skip / stop)
  ```

Step 4 — Auto-resolve `scope_paths` from `features.md` column. If empty → apply per-stack fallback rules.

**Pipeline Stages:**

**A) Proposal**
Generate/update `specs/<capability>/proposal.md` — business intent only, no implementation detail.

**B) Spec**
Generate/update `specs/<capability>/spec.md` — GIVEN/WHEN/THEN scenarios.

**C) Flow Diagram**
Generate/update `specs/<capability>/flow-diagram.md` — UI flows using real labels (buttons/tabs) + Mermaid diagrams.
For utility categories with no UI → document programmatic entry points and caller flows.

**D) Technical & API**
Generate/update:
- `specs/<capability>/design.md` — technical design. If `db_applicable = true`, include:
  - Owned tables (from `table-usage.md`)
  - Key columns and relations relevant to this capability
  - Query pattern signals
- `specs/<capability>/api.md` — capability-specific API details

**E) NFR Evaluation (ALWAYS RUN)**
Generate/update `specs/<capability>/nfr.md`.
All 6 NFR dimensions. `Covered` | `Partial` | `Missing` + evidence + linked BL-IDs.
If `db_applicable = true`:
- Security dimension → include PII findings for owned tables
- Performance dimension → include query pattern findings for owned tables

**F) Backlog Generation (ALWAYS RUN)**
Generate/update `backlog/<capability>.md`.
- Named capabilities: `BL-<CAPABILITY>-<CATEGORY>-<SEQ>`
- Utility categories: `BL-COMMON-<CATEGORY>-<SEQ>`
- Severity: `Mandatory` | `Important` | `Good to Have` | `Suggestion`
- Include DB-related findings for this capability's owned tables

**G) Product Sync (ALWAYS RUN)**
- Update `product/features.md` (Status → `Complete`; Spec link added)
- Update `product/flow-diagram.md`
- Update `product/api-registry.md` (apply conflict rules)
- Sync `backlog/<capability>.md` into `backlog/product.md` (retain IDs, no duplicates, recalculate counts)
- Re-run unclaimed file detection → update `## Utilities` in `features.md`
- If `db_applicable = true` → update `product/db/<db-name>/table-usage.md` with feature ownership for claimed tables

**H) Code Quality Update (ALWAYS RUN)**
- Recalculate all sections of `product/code-quality.md`
- Recalculate weighted score + rating band
- If coverage artifacts missing → mark `UNKNOWN` + add `BL-PROD-COV-XXX`

**I) Governance (ALWAYS RUN)**
- Update `product/decisions.md` (advance states where evidence now exists)
- Append Run Entry to `product/run-log.md`

---

# MODE: audit

**Input:** `capability` (optional — omit to audit all capabilities, common categories, and DB docs)

**Stage 1 — Scope Declaration**
- If `capability` provided → audit that capability only
- If omitted → enumerate all under `specs/` (including `specs/common/`) + all `product/db/` docs
- Print full scope before proceeding

**Stage 2 — Regenerate Truth**
Rebuild all docs against current source:
- `proposal.md`, `spec.md`, `design.md`, `api.md`, `flow-diagram.md`, `nfr.md`
- If `db_applicable = true` → re-parse model files and re-run static scan
  Compare against existing `schema.md` and `table-usage.md`

**Stage 3 — Drift Detection**
Classify each finding:
`SUPPORTED` | `PARTIALLY SUPPORTED` | `UNSUPPORTED` | `OUTDATED` | `UNKNOWN`

DB drift signals:
- New tables/columns in model files not in `schema.md`
- Dropped columns still documented in `schema.md`
- Table ownership changed (feature reassigned)
- New PII fields not yet flagged

**Stage 4 — Structured Audit Output (MANDATORY)**
```
## Scope Summary
## Verdict Table
## Drift Summary
## Required Patches
## Risk Assessment
## Confidence Rating (High / Medium / Low)
```

**Stage 5 — Code Quality Recalculation**
- Recompute all sections of `product/code-quality.md`
- Report: previous rating → new rating → delta

**Stage 6 — Governance (ALWAYS RUN)**
- Update all relevant `backlog/<capability>.md` files
- Sync into `backlog/product.md`
- Update `product/decisions.md` (advance states where drift findings provide resolution)
- Append Run Entry to `product/run-log.md`

---

# RUN LOG FORMAT

First run: initialize `product/run-log.md` with `# Run Log` header before appending.

```markdown
## Run Entry

- **Run ID:** RUN-<YYYYMMDD>-<SEQ>
- **Date:** <YYYY-MM-DD>
- **Mode:** product | feature | audit
- **Capability:** <name | common/<category> | N/A>
- **stack_profiles:** [next, android, ...]
- **root:** <path>
- **Files Analyzed:** <count>
- **Claimed Files:** <count>
- **Unclaimed Files:** <count> (→ <N> utility categories)
- **DB Applicable:** true | false | local_only
- **DB Engines Detected:** <list or N/A>
- **ORM/ODM Detected:** <list or N/A>
- **Model Files Parsed:** <count or N/A>
- **Tables/Collections Documented:** <count or N/A>
- **Unused Tables Flagged:** <count or N/A>
- **PII Columns Flagged:** <count or N/A>
- **Anchors Used:** <list>
- **Documents Created:** <list>
- **Documents Updated:** <list>
- **Backlog Items Added:** <count + ID range>
- **Backlog Items Closed:** <count + IDs>
- **API Conflicts Flagged:** <count or none>
- **Version Findings:** <summary>
- **Code Quality Rating:** <e.g. Good (Medium Confidence)>
- **Weighted Score:** <e.g. 67.5>
- **DB Health:** <Healthy | Needs Attention | Critical | N/A>
- **Notes:** <anomalies, skipped paths, overwrite decisions, multi-feature run order>
```

---

# FINAL RESPONSE FORMAT

After every run, always report:

```
✅ Documents Created: [list]
✅ Documents Updated: [list]
📋 Backlog Items Added: <count> | Closed: <count>
⚠️  API Conflicts: <count or none>
🔒 Version Compliance: <summary>
📦 Unclaimed Files: <count> across <N> utility categories → specs/common/
🗄️  DB: <Not Applicable | Engines: [list] | Tables: <count> | PII Flags: <count>>
📊 Code Quality: <Rating (Confidence)> | Score: <weighted score>
🏥 DB Health: <Healthy | Needs Attention | Critical | N/A>
🔍 Stacks Detected: [list with root_paths]
```
