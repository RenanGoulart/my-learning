# Learning Platform MVP Design

## Overview

Build a local-first personal study management platform for organizing learning paths, study resources, manual practice activities, and daily study continuity.

The MVP is for personal use on the user's machine. It should be a responsive web app, desktop-first, with a quick mobile-friendly check-in flow. The architecture must keep frontend and backend separated inside a TypeScript monorepo so the backend API can later serve a hosted VPS deployment and a future native app.

Out of scope for the MVP:

- Authentication and multi-user accounts.
- External APIs.
- AI-generated questions, exercises, or projects.
- Automatic grading, correction, or attempt history.
- Sync between machines.

## Architecture

Use a TypeScript monorepo with independently runnable frontend and backend apps.

Repository structure:

- `apps/web`: Next.js frontend.
- `apps/api`: Fastify REST API.
- `packages/contracts`: shared DTOs, schemas, and TypeScript types used by web and API.
- `packages/domain`: pure domain rules such as trail progress and streak calculations.
- `packages/database`: Prisma schema, migrations, and Prisma client setup used only by the API.

Package management:

- Use `pnpm` workspaces.
- Use Turborepo over the `pnpm` workspaces to orchestrate development, build, test, and lint tasks.
- Use Turborepo local caching in the MVP. Remote caching is out of scope.

Backend:

- Use Fastify directly, without NestJS or Express.
- Organize the API by feature under `apps/api/src/modules`, with modules for Trails, Resources, Practices, Check-ins, Dashboard, Import/Export, and System.
- Each module contains `routes.ts`, `controller.ts`, `service.ts`, and `repository.ts`. Additional files are created only when they have a concrete responsibility.
- Use explicit factory functions for dependency injection instead of a dependency injection container or decorators.
- Keep Prisma repositories beside their API modules. Prisma-generated types may be reused inside `apps/api` and `packages/database`, but they must not cross the HTTP contract boundary or be imported by the frontend.
- Use Zod schemas from `packages/contracts` with the Fastify Zod type provider for request and response validation and inference.
- Use only the Fastify plugins required by the MVP: CORS, multipart, and `fastify-plugin` for shared dependencies.
- Expose REST endpoints consumed by the web frontend.

Frontend:

- Use Next.js as a client of the API.
- The web app must access persisted data only through the API, never by importing Prisma/database code directly.
- Keep the UI operational and dense enough for repeated personal use: no landing page, no marketing hero, no decorative-first layout.

Database:

- Use SQLite for the local MVP.
- Use Prisma so a future PostgreSQL migration is more straightforward when hosting and multi-user support arrive.
- Keep the SQLite file outside generated build output and document where it lives.

Time handling:

- Use `America/Sao_Paulo` as the fixed calendar time zone for the MVP.
- Derive the current Check-in date and all streak day boundaries in that time zone, regardless of the browser or API server time zone.
- Store timestamps as instants while keeping the Check-in local date as an explicit calendar date.

## UX Scope

The MVP includes four primary areas.

### Dashboard

The first screen should help the user continue studying quickly.

It includes:

- Daily study check-in action for the current `America/Sao_Paulo` date.
- Optional check-in note.
- Optional study duration entered as hours and minutes.
- Ability to edit the current day's Check-in note and duration.
- Ability to delete the current day's Check-in with confirmation.
- Current streak, best streak, and last Check-in date.
- Active Trails with progress. An active Trail has at least one Resource and is not complete.
- A `Continue studying` section with up to five quick entry points.

`Continue studying` shows up to five Resources marked `Em andamento`, ordered by most recently updated. If no Resource is in progress, it considers up to five active Trails ordered by most recent update and shows the first `Não iniciado` Resource in each according to that Trail's manual Resource order. The MVP does not track Resource page views or last-opened events.

Resource `updatedAt` changes when its fields, status, current Practice answer, or Project requirements change. These meaningful study edits drive the `Continue studying` ordering.

Trail `updatedAt` changes when its own fields or any attached Resource data changes. This provides the deterministic recency ordering for active Trail fallback entries.

### Trails and Resources

The user can create, edit, view, and delete Trails.

Each Trail includes an ordered list of Resources. The order is manual and advisory. It guides study but does not lock access or progress.

Trail progress is derived from completed Resources. A Trail with no Resources has 0% progress and is not complete. A Trail with at least one Resource is complete when all its Resources are complete.

Progress and completion are recalculated whenever a Resource is added, removed, or changes status. Adding an incomplete Resource or changing a completed Resource to another status reopens the Trail. Removing the final Resource returns the Trail to 0% and not complete.

Deleting a Trail requires confirmation that shows how many Resources will also be removed. The deletion atomically removes the Trail, all its Resources, and all Practice answers and Project requirements belonging to those Resources.

Deleting a Resource requires confirmation. If it is a Practice, its current answer and Project requirements are removed with it. Trail and Resource deletion is permanent in the MVP; there is no trash or undo, so exported JSON is the recovery mechanism.

### Resource Editor

The user can manually create Resources attached to a Trail.

Resource category:

- `Material`
- `Prática`

Material formats:

- `Curso`
- `Documentação`
- `Artigo`
- `Vídeo`
- `Livro`
- `Outro`

Practice formats:

- `Questão`
- `Problema`
- `Projeto`
- `Flashcard`

Common Resource fields:

- Title.
- Optional description.
- Category.
- Format.
- Status: `Não iniciado`, `Em andamento`, `Concluído`.
- Manual order within the Trail.

Human-facing labels use correctly accented Portuguese. Contracts, API payloads, database values, and exported JSON use stable ASCII machine identifiers:

| Human label | Machine identifier |
| --- | --- |
| `Material` | `MATERIAL` |
| `Prática` | `PRACTICE` |
| `Curso` | `COURSE` |
| `Documentação` | `DOCUMENTATION` |
| `Artigo` | `ARTICLE` |
| `Vídeo` | `VIDEO` |
| `Livro` | `BOOK` |
| `Outro` | `OTHER` |
| `Questão` | `QUESTION` |
| `Problema` | `PROBLEM` |
| `Projeto` | `PROJECT` |
| `Flashcard` | `FLASHCARD` |
| `Não iniciado` | `NOT_STARTED` |
| `Em andamento` | `IN_PROGRESS` |
| `Concluído` | `COMPLETED` |

The frontend maps machine identifiers to localized labels. Changing a label must not change its persisted or exported identifier.

The user may change an existing Resource category or format. Before conversion, the target category and format are validated with all their required fields. Common fields, status, and manual Trail order are preserved.

If conversion would discard incompatible data, the UI lists those fields and requires explicit confirmation. The API then performs the conversion atomically:

- Converting from Material to Practice removes the Material URL.
- Converting from Practice to Material removes prompt, current answer, Project requirements, and Flashcard front and back.
- Leaving `Projeto` removes its requirements.
- Leaving `Flashcard` removes its front and back.
- Converting to `Flashcard` removes the prior prompt and any current Practice answer.

Canceling confirmation or failing validation leaves the original Resource unchanged.

Material-specific fields:

- Optional absolute external URL using only the `http` or `https` protocol.

Practice-specific fields:

- Required non-empty prompt or statement for `Questão`, `Problema`, and `Projeto`.
- A required ordered list containing at least one requirement when the format is `Projeto`. Each requirement has non-empty text, manual order, and an independent completion checkbox.
- Optional current free-text answer for every Practice format except `Flashcard`.
- Required non-empty front and back when the format is `Flashcard`.

For non-Flashcard Practices, the platform stores only the current answer. It does not store attempt history and does not grade or correct answers.

A `Projeto` also covers short scenario-based exercises that might otherwise be called mini-cases. Project requirements can be created, edited, deleted, reordered, and checked independently, but deleting the final requirement is rejected. Requirement completion is informational and never changes the Project Resource status automatically.

A Flashcard stores a manually authored front and back. During review, the user reveals the back manually. The platform does not persist what the user tried to recall.

### History and Settings

The MVP includes:

- Check-in history.
- Manual JSON export.
- Manual JSON import.
- Basic local operation information, such as where the SQLite database lives.

JSON export/import exists for local data safety and portability. Export creates a versioned snapshot of Trails, Resources, Practice answers, Project requirements, and Check-ins. Import replaces the complete local dataset with the snapshot contents. It does not merge records in the MVP.

## Data Model

Core entities:

- `Trail`: a learning path with title, optional description, optional goal, and timestamps.
- `Resource`: a study item attached to a Trail, with manual order, category, format, status, title, optional description, and optional URL/prompt fields depending on category.
- `PracticeAnswer`: the optional current free-text answer for a non-Flashcard Practice Resource.
- `ProjectRequirement`: an ordered requirement attached to a Project Resource, with text and an independent completion flag.
- `StudyCheckIn`: one explicit daily study record with an `America/Sao_Paulo` calendar date, optional note, optional integer `durationMinutes`, and timestamps.
- `ExportSnapshot`: versioned JSON shape used for backup and restore.

Important rules:

- Trail progress is derived, not manually assigned.
- A Trail with no Resources has 0% progress and is not complete.
- A Trail is complete only when it has at least one Resource and every Resource is complete.
- A Trail is active when it has at least one Resource and is not complete. Active is derived and is not a manually stored status.
- Resource status has exactly three states: `Não iniciado`, `Em andamento`, `Concluído`, represented by `NOT_STARTED`, `IN_PROGRESS`, and `COMPLETED`.
- Resource format must belong to its category; Material formats are invalid for a Practice and Practice formats are invalid for a Material.
- Resource category and format conversion preserves common fields, status, and manual order while atomically removing incompatible type-specific data after explicit confirmation.
- A Material URL is optional, but when present it must be an absolute `http` or `https` URL. Local paths and all other protocols are invalid.
- A Practice is manually authored by the user.
- `Mini-case` is not a separate Practice format; scenario-based exercises use `Projeto`.
- A Project must contain at least one requirement with non-empty text.
- The final Project requirement cannot be deleted while the Resource remains a Project.
- Project requirements are manually ordered and checked, but do not derive or change Resource status.
- Question, Problem, and Project prompts are required. Flashcard front and back are required. Current Practice answers are optional.
- Deleting a Trail cascades to its Resources, Practice answers, and Project requirements.
- Deleting a Resource cascades to its Practice answer and Project requirements, when present.
- A Study Check-in is independent of Resource progress.
- Check-in duration is optional and stored as a whole number of minutes from 1 through 1,440. It is informational and does not affect streak.
- A Study Check-in can only be registered for the current `America/Sao_Paulo` date. The MVP does not allow past or future Check-ins.
- Snapshot import may restore valid historical Check-ins; imported past Check-ins are immediately read-only.
- Writing the current day's Check-in is idempotent: the first write creates it, and later writes update its optional note and duration without creating another record.
- The current day's Check-in can be deleted after explicit confirmation. Deletion recalculates the current streak immediately and allows a new Check-in to be created that same day.
- After the current `America/Sao_Paulo` day ends, its Check-in becomes read-only and cannot be deleted.
- Streak is the number of consecutive `America/Sao_Paulo` calendar days with at least one Study Check-in.
- If today has a Check-in, the current streak counts backward from today. Otherwise, it counts backward from yesterday, so the streak remains active until the current day ends. If neither today nor yesterday has a Check-in, the current streak is zero.
- Best streak is the longest historical sequence of consecutive Check-in dates. Current and best streak are derived from Check-ins and are recalculated after Check-in deletion or snapshot import.
- The API should enforce one Check-in record per local date.

## API Flow

The frontend consumes REST endpoints from the API.

Expected route groups:

- Trails: create, list, get detail, update, delete.
- Resources: create, update, delete, reorder, change status, and convert category or format.
- Practices: save current answer and practice-specific fields; create, update, delete, reorder, and toggle Project requirements.
- Check-ins: create or update the current day's Check-in idempotently, delete it with confirmation, and list read-only history.
- Dashboard: return current streak, best streak, last Check-in, derived active Trails, and the deterministic `Continue studying` selection. Empty and completed Trails remain available in the Trails area but are omitted from the Dashboard's active list.
- Import/Export: export versioned JSON snapshot and import validated snapshot.

The API should return validation errors in a consistent shape with:

- User-facing message.
- Machine-readable code.
- Field-level details when applicable.

## Import And Export

Export:

- Produces a JSON snapshot with a format version.
- Includes Trails, Resources, Practice answers, Project requirements, and Check-ins.
- Includes stable record identifiers, relationships, manual ordering, and timestamps so the dataset can be restored faithfully.
- Should be human-readable enough for inspection.

Import:

- Validates JSON structure and version before writing.
- Shows a summary of the valid snapshot contents and warns that all current Trails, Resources, Practice answers, Project requirements, and Check-ins will be replaced.
- Requires explicit user confirmation before writing.
- Revalidates the snapshot, removes the current dataset, and restores the snapshot contents in a single transaction.
- Preserves the complete current dataset if any part of the transaction fails.
- Returns clear errors for invalid JSON, unsupported versions, or invalid records.

Merge behavior is out of scope for the MVP.

## Error Handling

The MVP must handle:

- Required fields missing.
- Material URL that is relative, malformed, or uses a protocol other than `http` or `https`.
- Invalid Resource category, format, or status.
- Project without requirements or with an empty requirement.
- Resource conversion missing required target fields.
- Check-in duration that is zero, negative, fractional, or greater than 1,440 minutes.
- Attempt to register a Check-in for a past or future date.
- Attempt to modify or delete a past Check-in.
- Import JSON with invalid structure.
- Import JSON with unsupported version.
- Database errors surfaced as clear user-facing failures.

Frontend behavior:

- Show inline validation where practical.
- Preserve user input when save fails.
- Show the exact incompatible fields and require confirmation before a Resource conversion discards data.
- Require an impact-aware confirmation before deleting a Trail or Resource.
- Require confirmation before deleting the current day's Check-in.
- Never execute a destructive import without showing its contents summary and receiving explicit confirmation.
- Do not provide trash or undo for deletions in the MVP.

## Testing

Use focused coverage that protects the core rules.

Unit tests:

- Trail progress calculation.
- Empty Trail progress and completion.
- Trail completion/reopening behavior.
- Trail recalculation after Resource addition, removal, or status change.
- Active Trail derivation, excluding empty and completed Trails.
- `Continue studying` selection for in-progress Resources and its not-started fallback.
- Current streak and best streak calculation.
- Current streak remains active during the current day when the latest Check-in was yesterday, and resets after a full missed day.
- Resource status validation.

API integration tests:

- Create/list/update/delete Trails.
- Create/update/delete/reorder Resources.
- Convert Resource category and format, preserve common fields, and remove incompatible data atomically after confirmation.
- Preserve the original Resource when conversion validation or persistence fails.
- Accept omitted Material URLs and reject relative, malformed, or non-HTTP(S) URLs.
- Verify cascade deletion of Trail Resources, Practice answers, and Project requirements.
- Verify cascade deletion of a Resource's Practice answer and Project requirements.
- Save Practice answers.
- Create, update, delete, reorder, and toggle Project requirements without changing Project status automatically.
- Reject a Project without at least one non-empty requirement.
- Reject deletion of a Project's final requirement.
- Create and retrieve Flashcards with front and back.
- Reject empty Practice prompts and empty Flashcard front or back fields.
- Create the current day's Check-in, update its note and duration, and retain a single record.
- Accept an omitted duration and validate `durationMinutes` from 1 through 1,440.
- Delete the current day's Check-in and recalculate streak.
- Reject past and future Check-ins.
- Reject modifications and deletions of past Check-ins.
- Calculate Check-in date boundaries using `America/Sao_Paulo`, independently of the runtime time zone.
- Export and import a valid JSON snapshot.
- Import over existing data and verify that the snapshot replaces it completely.
- Preserve existing data when an import transaction fails.
- Reject invalid import data.

Frontend/E2E smoke tests:

- Create a Trail.
- Add a Material and a Practice.
- Register a daily Check-in.
- Change Resource status and see Trail progress update.
- Export data, import it, and verify restored records.
- Run `@axe-core/playwright` on the critical Dashboard, Trail, Resource, History, and Settings flows without detected accessibility violations.

Manual responsive check:

- Desktop layout for daily operation.
- Small-screen check-in and Trail/resource consultation.
- Use WCAG 2.2 level AA as the implementation reference and verify keyboard operation, visible focus, accessible names, labels, field errors, and contrast in both required viewports. The MVP does not claim formal accessibility certification.

## Definition Of Done

The MVP is ready for local use when:

- `apps/web` and `apps/api` run locally through documented monorepo scripts orchestrated by Turborepo.
- The SQLite database is initialized and documented.
- The user can create Trails and Resources manually.
- Trail and Resource deletions require confirmation and remove dependent data atomically.
- The user can convert a Resource category or format with explicit confirmation before incompatible data is removed.
- The user can create Materials and Practices, including projects, questions, problems, and flashcards; scenario-based mini-cases are represented as projects.
- A Material may omit its URL, but any provided URL must be absolute and use `http` or `https`.
- The user can maintain an ordered checklist of requirements for a Project without automatically changing its Resource status.
- A Project cannot be saved without at least one non-empty requirement.
- The user can save a current free-text answer for every Practice format except `Flashcard`.
- The user can create a Flashcard with a front and back and reveal the back during review.
- The user can mark Resources as `Não iniciado`, `Em andamento`, or `Concluído`.
- Trail progress updates from Resource statuses.
- An empty Trail remains at 0% and is not complete.
- The user can register one Check-in for the current `America/Sao_Paulo` day, but cannot backdate or future-date it.
- The user can optionally record between one minute and 24 hours of study without changing streak calculation.
- The user can edit the current Check-in note and duration until the day ends; past Check-ins are read-only.
- The user can delete the current day's Check-in with confirmation and see streak recalculate.
- The Dashboard shows streak and active Trail progress.
- The Dashboard shows both current streak and best streak.
- The Dashboard excludes empty and completed Trails from its active list.
- The Dashboard shows up to five deterministic `Continue studying` entries without tracking page views.
- JSON export/import is verified.
- Import confirmation clearly states that current data will be replaced.
- Core tests pass.
- Basic mobile check-in remains usable.
