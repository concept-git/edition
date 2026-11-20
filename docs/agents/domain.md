# Domain Docs

Use `CONTEXT.md` for terminology, `docs/prd/README.md` for product scope, and `docs/adr/README.md` for architecture decisions. Keep detailed behavior in the source-adjacent `CONCEPT.md` and `SYNCS.md` files.

When output names a domain concept, use the term as defined in `CONTEXT.md`. Do not drift to synonyms the glossary avoids.

If output contradicts an existing ADR, surface it explicitly rather than silently overriding.

Append new decisions to `docs/adr/README.md`, starting with ADR-0031. Preserve existing numbered anchors and state which earlier clauses a decision supersedes.
