---
name: blast-radius
description: Use before changing a shared type, table, column, or enum — enumerate every construction site, call site, FK, and consumer first, and fix them in the same change. Prevents compile breaks, silent FK/enum quirks, and half-applied migrations.
---

# Blast-radius sweep before a shared-symbol change

## Overview

A shared type/table/enum has more touch-points than the one you're editing. Changing it
without enumerating them ships a compile break (a new struct field breaks every literal that
didn't spread), a silent data quirk (an FK that isn't managed; an enum deployed in a surprising
order), or a half-applied migration.

## Procedure

1. **Find every touch-point of the symbol** before editing:
   - a struct field → every `Name { … }` literal (they must all set it, or use `..spread`);
     grep the type name, don't rely on the one you know.
   - a table/column → every reader/writer, and every FK in *both* directions.
   - an enum → every match/CASE, every stored string literal (grep the *values*, not just the
     type — hardcoded strings hide from symbol search), and any code relying on declared order.
2. **Know the tool's quirks** for schema changes: some migrators (dbd) don't manage FKs (add
   them manually after ADD COLUMN) and deploy enum variants alphabetically (rank in code, never
   by declared order); a "destructive" flag can fire on benign re-applies — read the diff.
3. **Change the symbol and all its touch-points in the same commit.** A dangling literal or an
   un-updated consumer is the defect.
4. **Compile/verify the whole affected surface**, not just the file you edited — the break is
   usually elsewhere (and see `verify-outcome`: read the real compiler output).

## Done when
Every construction/call site, FK, enum consumer, and order-dependency of the changed symbol is
accounted for and updated, and the full surface compiles.
