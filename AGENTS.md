# AGENTS.md

## Purpose

This repository is an iPhone app built with React Native and Expo.

The project follows a document-driven development process.
All implementation must be aligned with product and engineering documents before code changes are made.

Always read and follow the relevant documents in `docs/` before implementing, reviewing, or refactoring.

Primary documents:

- `docs/PRD.md`
- `docs/SRS.md`
- `docs/TECH_SPEC.md`
- `docs/UI_FLOW.md`
- `docs/API_SPEC.md` (if present)
- `docs/DB_SCHEMA.md` (if present)
- `docs/TASKS.md` (if present)

This repository also contains reusable task workflows under `skills/`.
When a task matches one of those workflows, apply the relevant skill before acting.

---

## Core Principles

1. Document-first, code-second.
2. Do not invent user-facing behavior when the specification is explicit.
3. If requirements are unclear, make the smallest safe assumption and list it explicitly.
4. Keep changes scoped to the requested task.
5. Prefer incremental delivery over large all-in-one changes.
6. Preserve architecture, naming, and directory conventions.
7. Separate UI, state, and service logic as much as practical.
8. Always consider mobile-specific behaviors such as:
   - navigation
   - keyboard behavior
   - safe area
   - loading / empty / error states
   - permission handling
   - offline / retry behavior when applicable
9. Do not silently skip edge cases.
10. Do not mark a task complete unless it is verifiable.

---

## Skill Routing Rules

Use the following skills when applicable:

- For converting documents into milestones and engineering tasks, read:
  - `skills/prd-to-tasks/SKILL.md`

- For implementing an Expo / React Native feature, read:
  - `skills/expo-feature-implementation/SKILL.md`

- For comparing implementation against specifications, read:
  - `skills/spec-review/SKILL.md`

- For generating Medium article drafts from PRD/SRS, read:
  - `skills/prd-srs-to-medium/SKILL.md`

When a task clearly matches one of these categories, apply the relevant skill workflow before acting.

---

## Required Workflow For Non-Trivial Tasks

For any task that is more than a tiny edit, follow this order:

1. Read relevant files in `docs/`
2. Read the relevant `skills/*/SKILL.md` if applicable
3. Restate the task scope internally
4. Identify impacted modules, screens, routes, services, and state
5. Identify assumptions, gaps, and risks
6. Make a plan
7. Implement in small steps
8. Run available checks
9. Summarize:
   - what changed
   - what was verified
   - assumptions
   - remaining gaps

For complex tasks, plan before editing.

---

## Repo Expectations

### Routing

- Use Expo Router conventions.
- Keep route structure aligned with `docs/UI_FLOW.md`.
- Prefer clear, shallow routing unless deeper nesting is required.
- Do not introduce route structures inconsistent with existing app navigation.

### Screens

For each screen, check all applicable items:

- user goal
- required data
- loading state
- empty state
- error state
- retry behavior
- input validation
- navigation behavior
- keyboard behavior
- safe area
- accessibility basics
- permission prompts and denied state, if needed

### Components

- Prefer reusable components for repeated patterns.
- Keep presentational components separate from data-fetching or persistence logic when practical.
- Avoid duplicating form, status, and feedback UI patterns.

### State Management

When implementing state:

- keep UI state separate from data state where reasonable
- avoid hidden cross-screen coupling
- keep state transitions understandable
- document inferred assumptions if state shape is not fully specified

### Services / API

When implementing network or service logic:

- keep request logic separate from screens/components
- follow `docs/API_SPEC.md`
- use typed request/response models where possible
- handle error mapping consistently
- avoid spreading endpoint strings across many files
- if backend is unavailable, use a mock service with a clear swap boundary

### Local Persistence

If local persistence is used:

- isolate storage/database access in dedicated modules
- document persistence behavior
- avoid mixing storage details directly into screens
- keep migration / initialization logic explicit if applicable

### Validation

When forms or user input are involved:

- enforce validation rules from `docs/SRS.md`
- handle invalid input states in UI
- do not rely on UI-only validation when service validation is also needed

### Permissions / Device Features

For camera, photo library, notifications, location, microphone, or sensors:

- explicitly handle permission request flow
- explicitly handle denied/restricted states
- do not assume permission is already granted
- reflect permission-related UX in the screen flow

---

## Cross-Layer Checklist

Whenever implementing or changing a feature, check all applicable layers:

- route / navigation
- screen UI
- reusable components
- feature module
- state
- service / API
- local persistence
- validation
- permissions
- tests
- docs

Do not stop at the visible UI layer if the feature depends on deeper layers.

---

## Definition of Done

A task is not complete unless all applicable items below are satisfied:

1. Implementation matches:
   - `docs/PRD.md`
   - `docs/SRS.md`
   - `docs/TECH_SPEC.md`
   - `docs/UI_FLOW.md`
2. Required screens/routes/components/services/state changes are included
3. Validation and edge cases are handled
4. Loading / empty / error states are handled
5. Permission logic is handled when applicable
6. Relevant tests are added or updated if the project supports them
7. Assumptions and unresolved issues are explicitly listed
8. Documentation is updated if behavior or usage changed
9. Local verification steps are provided

Do not report completion if only static UI was added where behavior was required.

---

## Output Format After Each Task

At the end of each meaningful task, provide:

1. Implemented scope
2. Files created / modified
3. Spec coverage
4. Assumptions made
5. Remaining gaps / TODOs
6. Local verification steps

If checks were run, report:

- command
- result
- notable failures, if any

---

## Constraints

- Do not delete unrelated code.
- Do not refactor unrelated modules unless necessary for the task.
- Do not silently change route conventions.
- Do not change naming conventions without reason.
- Do not mix API logic into presentation components unless the repo already uses that pattern consistently.
- Do not claim compliance with specs without actually comparing against them.
- Do not skip loading / empty / error / denied states where relevant.
- Do not introduce new dependencies unless necessary.

---

## Priority Order

If there is a conflict, use this order:

1. Explicit instruction in the current user task
2. `AGENTS.md`
3. Relevant `skills/*/SKILL.md`
4. `docs/SRS.md`
5. `docs/TECH_SPEC.md`
6. `docs/UI_FLOW.md`
7. `docs/PRD.md`
8. existing codebase conventions

If documents conflict, report the conflict before implementation.

---

## Recommended Task Pattern

When asked to implement a feature:

1. Read relevant docs
2. Read the matching skill
3. Restate the exact scope
4. List impacted files/modules
5. Implement only the requested scope
6. Verify locally if possible
7. Report result, assumptions, and gaps

When asked to review implementation:

1. Read relevant docs
2. Read the review skill
3. Inspect the related code
4. Compare implementation vs spec
5. Identify:
   - completed items
   - missing items
   - mismatches
   - edge-case gaps
   - test gaps
6. Recommend the safest fix order

---

## Preferred Behavior

- Be precise
- Be structured
- Be implementation-oriented
- Be transparent about assumptions
- Prefer copy-paste-ready output
- Prefer small verifiable changes
- Prefer engineering-complete slices over surface-level snippets
