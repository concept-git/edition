# Changelog

## 1.7.0 - 2026-11-20

### Features

- Align the management console with the Logto light and dark appearance: system type, shell, controls, and navigation icons. Saved porcelain, cinnabar, and scarlet choices fall back to light. (by @AgenticWeb4)
- Refresh the public homepage sky and motion, and describe the site as research notes on concept design, software ontology, AI programming, and software architecture. (by @AgenticWeb4)

### Fixes

- Report Index heartbeats stored as `space-worker` as `space-index`, and keep the delivery OpenAPI operation tags. (by @AgenticWeb4)
- Use a lighter dark-mode error color and an opaque selected-group background so status text and icons meet the contrast floor. (by @AgenticWeb4)

### Validation status

- `node infra/space.ts repository` passed: 124 documents, 20 PRD edges; BDD 36 features, 209 scenarios.
- Console `pnpm check` passed. Appearance and console-shell unit tests passed. Desktop visual specs for themes, style primitives, and navigation passed. Full browser acceptance and the backend coverage gate were not rerun.

## 1.6.0 - 2026-11-20

### Breaking changes

- Rename the running processes to Control, Content, and Index. Directories, Gradle projects, and jars are `control` / `space-control`, `content` / `space-content`, and `index` / `space-index`. The identity application is removed. Edge configuration uses `CONTENT_UPSTREAM` and `READING_UPSTREAM`. HTTP paths, `delivery-openapi.json`, the reader permission role, and published database role names stay unchanged. (by @AgenticWeb4)
- Move the management UI to `console/` and the Astro reading site to `reading/`. (by @AgenticWeb4)

### Fixes

- Keep the public homepage mascot and dotted rainbow inside the viewport, show the site name as Shuai.Stuff without the IP head, and remove the duplicate reading list. (by @AgenticWeb4)

### Validation status

- `node infra/space.ts repository` passed: 124 documents, 20 PRD edges; BDD 36 features, 209 scenarios. Full browser acceptance and the backend coverage gate were not rerun.

## 1.5.0 - 2026-11-20

### Breaking changes

- Reader no longer returns HTML pages, login forms, or `/_static` assets. The separate Astro reading frontend renders pages. Reader still serves content JSON, search JSON, sitemap, robots, `llms.txt`, `?view=markdown`, and `?view=source`. (by @AgenticWeb4)
- Reader sign-in no longer uses `POST /_auth/login`, `/_auth/refresh`, or `/_auth/logout`. Sessions use `/_auth/session` and `POST /_auth/session/refresh`. A same-origin form refresh redirects to a path on the site. The refresh cookie path stays `/_auth`. (by @AgenticWeb4)

### Features

- Add site, page, and reading-event JSON, and render public and private reading in reader-web, including header search, session continuation, logout, and content plugins. (by @AgenticWeb4)
- Route the deployment and acceptance edge so pages go to the reading frontend, `/api/content` and machine-readable resources stay on Reader, and `/_auth` stays on Control. (by @AgenticWeb4)

### Validation status

- `:reader:check` (43 tests) and `:worker:check` (2 tests) passed. `:control:check` finished 453 tests with 10 failures, all because `quay.io/minio/minio:RELEASE.2025-09-07T16-13-09Z` could not be pulled.
- `node infra/space.ts repository` passed. Infra tests (48) and reader-web tests (105) passed.
- Delivery (4), private (10, normal and short-reader), and vfs (110) passed. Console passed 199 scenarios in the full run; the full-browser journey then failed on the removed search link. After that step followed the header search box, `@case-full-browser-journey-001` passed. The other console profiles were not rerun after that step.
- The 90% coverage gate was not rerun. The reading frontend does not call `/_auth/history`, so it does not record recent reading on its own.

## 1.4.0 - 2026-11-16

### Features

- Place each concept beside the four applications, and split it into `api`, `application`, `domain`, and `adapters`. HTTP calls an action use case directly; scheduled and completion follow-ups are separate listeners. Rule identity stays the sync name and its claim string. (by @AgenticWeb4)

### Fixes

- Keep zip manifest checks in the bundle export concept and import adaptation checks in Control, and put Control concept tests in directories that match their packages. (by @AgenticWeb4)

### Validation status

- `node infra/space.ts repository` passed. Bundle zip manifest tests and the Control export/import round trip passed. Full backend coverage and browser acceptance were not rerun for this release.

## 1.3.0 - 2026-11-03

### Breaking changes

- Remove the bundled `space-control` skill entry. The previous skill installer cannot install that entry from this source tree; use the CLI help, schema, and usage guide for management workflows.

### Features

- Organize the backend as four applications, 39 independently built concepts, and technical libraries under `backend/src`, with explicit composition rules and assembly boundaries.
- Refine console navigation, forms, status feedback, and visual hierarchy across management workflows.

### Fixes

- Enforce concept, SQL ownership, runtime isolation, and synchronization boundaries across the actual build units; retain the published database migrations and HTTP contracts.
- Update deployment, quality checks, documentation, and acceptance fixtures for the new backend paths.

### Validation status

- Backend `check` and application builds passed; the optional Huawei Cloud reference import was verified separately in both the concept and Control tests. Delivery acceptance passed all four scenarios.
- Frontend type checking, lint, production build, and 765 unit and architecture tests passed. Earlier Console, Private Reader, and VFS acceptance passed before the final directory move.
- The 90% backend coverage gate was not rerun for this release; an earlier measurement found 43 production projects below the threshold. This is not a full coverage-gate pass.
- 2026-11-07 isolated acceptance against commit `3ef2b4378cff86d503151062c55dcc9a848f04f8` passed. The run used the existing 1.3.0 JARs, `SPACE_COMPOSE_PROJECT=dw-e2e-20261107`, `E2E_STORAGE_NAMESPACE=dw-e2e-20261107`, and `E2E_PORT_OFFSET=1000`. `node infra/acceptance/verify.ts console`, `delivery`, `private`, and `vfs` each exited 0. Console covered normal, short-access, short-clock, and serial; private covered normal and short-reader. The coverage gate was not part of this run.

## 1.2.0 - 2026-10-23

### Features

- Add explicit draft-only and hotfix edit intents, content snapshots with strong ETags, bounded batch page reads, and transactional batch publish/unpublish operations.
- Expose release/import completion outcomes and Reader delivery status separately, with matching console actions and feedback.
- Migrate spacectl to non-interactive Aesh, add compact schema discovery, selected-profile diagnostics, and bounded read-only waiting.
- Refine the Space management skill into task-specific guidance and add reproducible real Pi Agent evaluation tools.

### Fixes

- Share validation, typed results, redaction, and invocation metadata across CLI, MCP, and batch execution; preserve safe recovery for uncertain writes.
- Require complete profile replacement fields and align console API transport, error handling, and generated contracts.
- Remove obsolete parser compatibility, skill migration, and receipt-format repair code while retaining current input and credential protections.

### CLI usage changes

- Use the current help/schema contract for this fresh-project baseline. The short version option is now `-v`; typed values, Path conversion, and inherited options follow Aesh. Repeated scalar options are rejected.
- Editing through CLI, MCP, or batch requires an explicit `intent` of `draft_only` or `hotfix`; previews do not authorize execution or prove server acceptance.

### Validation status

- CLI functional tests (83 Java and 21 Python), packaging, and real CLI/MCP checks pass. The 90% coverage gate remains unmet: line coverage is 86.3% and branch coverage is 71.6%; this is not a full quality-gate pass.
- Backend validation ran 828 tests, with four skips and one stale CLI fixture failure; after correction, all 29 tests in the affected acceptance class and the remaining management checks pass.
- Console lint, types, peer checks, build, and API generation pass. Test failures in old profile mocks, cache ownership, and the operation inventory were corrected and rechecked.
- Full browser acceptance was not rerun for this release.

## 1.1.0 - 2026-10-20

### Features

- Refresh console forms, lists, navigation, status panels, and reader pages with clearer layouts and more consistent interaction states.
- Organize executable acceptance scenarios by product area, add stable scenario identifiers, and run the matching browser steps through isolated suites.
- Add unified quality checks and coverage reporting for repository tools, backend, frontend, and Python clients.

### Fixes

- Correct JSON value size accounting and strengthen delivery store, Control CLI, installer, and SpaceVFS edge-case handling.
- Improve reader search, login, error, and page presentation across screen sizes.

## 1.0.1 - 2026-10-18

### Features

- Establish Document Space with the complete application source, tests, API contracts, deployment tools, Control CLI, and SpaceVFS client.
- Manage tenant-scoped sites, spaces, pages, permissions, revisions, imports, immutable releases, and independent Reader delivery.
- Support versioned content types, reusable editors/renderers, generic Schema admission, and isolated plugin development and verification.
- Provide responsive console lists, explicit filters, release labels, themes, and usage and operations views.

### Documentation

- Consolidate current PRD, architecture decisions, deployment and testing guides; exclude task records, review reports, screenshots, and research archives.
- Keep independent plugin packages and MCP Apps integration in the future requirements; they are not delivered in this release.

### Baseline

- Start the new repository version line at 1.0.1. VERSION identifies the project release; component and protocol versions retain their own meaning.
- Install on fresh databases using the documented deployment procedure. Published database migrations are immutable from this baseline onward.
