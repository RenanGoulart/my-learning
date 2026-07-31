# Local Operation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar backup/restauração JSON transacional, Configurações locais e a verificação E2E/responsiva final do MVP.

**Architecture:** Um snapshot Zod estrito e versionado é a fronteira de portabilidade. Exportação lê uma visão coerente em transação; preview valida sem persistir; importação recebe novamente o arquivo, revalida e substitui o conjunto completo em uma única transação. Configurações expõe informações locais e as duas operações sem estado intermediário no servidor.

**Tech Stack:** Fastify 5.11.0, `@fastify/multipart` 10.1.0, Prisma 7.9.1, Zod 4.4.3, Next.js 16.2.12, shadcn, Vitest 4.1.10, Playwright 1.62.1, `@axe-core/playwright` 4.12.1.

**Plan Version:** 0.1.0  
**Status:** Em revisão

## Global Constraints

- Execute primeiro Foundation, Trails And Resources, Practices e Tracking And Dashboard.
- Snapshot format version is exactly `1.0.0`; app versioning is independent.
- JSON is UTF-8, two-space indented, camelCase, descriptive fields and ISO 8601 dates; timestamps end in `Z`, Check-in `localDate` is `YYYY-MM-DD`.
- Snapshot shape is `{ formatVersion, exportedAt, timeZone, data: { trails, resources, practiceAnswers, projectRequirements, studyCheckIns } }`.
- `timeZone` must equal `America/Sao_Paulo`; imported IDs are UUID v4; imported IDs and timestamps are preserved exactly.
- Import is strict: unknown fields, duplicate IDs, invalid references, `createdAt > updatedAt`, incompatible Resource data and noncontiguous positions are rejected; no normalization or partial import.
- Import replaces the dataset that exists at execution time, even when it changed after preview. Preview stores no file or server state; confirmation resends the same user-selected file.
- Upload limit is 10 MiB in frontend and API. Normal requests time out after 15 seconds; import/export after 60 seconds.
- Arrays export deterministically: Trails ID; Resources Trail ID/position/ID; Answers Resource ID; Requirements Resource ID/position/ID; Check-ins localDate/ID.
- Referências: `docs/requirements/importacao-e-exportacao-json-2026-07-29.md`, `docs/requirements/configuracoes-locais-2026-07-29.md` e requisitos transversais `PLAT-RNF-001..011`.

---

## File Structure

```text
packages/contracts/src/import-export/index.ts       # Snapshot e preview schemas
packages/contracts/src/system/index.ts              # SystemInfo completo
apps/api/src/modules/import-export/                  # Export, preview e restore
apps/api/src/modules/system/                         # Database path/time zone/version
apps/web/src/features/import-export/                 # Download/upload/confirmation
apps/web/src/features/settings/                      # Informações locais
apps/web/src/app/configuracoes/page.tsx              # Operação local
apps/web/e2e/local-operation.spec.ts                 # Backup/restore e erros
apps/web/e2e/accessibility-responsive.spec.ts        # Matriz final de interface
```

### Task 1: Snapshot contracts and semantic validator

**Files:**
- Create: `packages/contracts/src/import-export/index.ts`, `packages/contracts/src/import-export/index.test.ts`
- Modify: `packages/contracts/src/index.ts`, `packages/contracts/src/system/index.ts`

**Interfaces:**
- Consumes: all entity response schemas and common UUID/date schemas.
- Produces: `exportSnapshotSchema`, `ImportPreview`, `validateSnapshotSemantics(snapshot)` and `systemInfoSchema`.

- [ ] **Step 1: Write failing structural and semantic tests**

```ts
it.each([
  ["unknown field", { ...validSnapshot, extra: true }, "SNAPSHOT_UNKNOWN_FIELD"],
  ["wrong timezone", { ...validSnapshot, timeZone: "UTC" }, "SNAPSHOT_TIME_ZONE_INVALID"],
  ["missing trail", snapshotWithOrphanResource, "SNAPSHOT_RELATION_INVALID"],
  ["order gap", snapshotWithPositionsOneAndThree, "SNAPSHOT_ORDER_INVALID"],
  ["updated before created", snapshotWithReversedTimestamps, "SNAPSHOT_TIMESTAMP_INVALID"]
])("rejects %s", (_name, snapshot, code) => {
  expect(() => validateSnapshot(snapshot)).toThrowError(expect.objectContaining({ code }));
});
```

- [ ] **Step 2: Run tests to verify RED**

Run: `pnpm --filter @my-learning/contracts test -- import-export`  
Expected: FAIL because snapshot contracts are absent.

- [ ] **Step 3: Define the strict versioned shape**

```ts
export const exportSnapshotSchema = z.strictObject({
  formatVersion: z.literal("1.0.0"),
  exportedAt: utcIsoInstantSchema,
  timeZone: z.literal("America/Sao_Paulo"),
  data: z.strictObject({
    trails: z.array(snapshotTrailSchema),
    resources: z.array(snapshotResourceSchema),
    practiceAnswers: z.array(snapshotPracticeAnswerSchema),
    projectRequirements: z.array(snapshotProjectRequirementSchema),
    studyCheckIns: z.array(snapshotStudyCheckInSchema)
  })
});

export const importPreviewSchema = z.strictObject({
  formatVersion: z.literal("1.0.0"),
  counts: z.strictObject({
    trails: z.number().int().nonnegative(),
    resources: z.number().int().nonnegative(),
    practiceAnswers: z.number().int().nonnegative(),
    projectRequirements: z.number().int().nonnegative(),
    studyCheckIns: z.number().int().nonnegative()
  })
});
```

Snapshot entity schemas include every persisted scalar and timestamp, use nullable optional fields explicitly, and reject unknown keys. Semantic validation builds ID sets, rejects duplicate IDs and local dates, validates foreign keys/category-format fields, forbids PracticeAnswer on Flashcard/Material, requires at least one requirement only for Project, and verifies contiguous orders per parent.

- [ ] **Step 4: Run tests**

Run: `pnpm --filter @my-learning/contracts test -- import-export`  
Run: `pnpm --filter @my-learning/contracts typecheck`  
Expected: PASS for valid empty/full snapshots and every named rejection code.

- [ ] **Step 5: Commit**

```bash
git add packages/contracts
git commit -m "feat: define versioned snapshot contract"
```

### Task 2: Deterministic JSON export

**Files:**
- Create: `apps/api/src/modules/import-export/routes.ts`, `controller.ts`, `service.ts`, `repository.ts`
- Create: `apps/api/src/modules/import-export/export.test.ts`
- Modify: `apps/api/src/app.ts`

**Interfaces:**
- Consumes: Prisma, `Clock`, `exportSnapshotSchema`.
- Produces: `GET /api/v1/import-export/export`, `buildSnapshot()` and deterministic filename.

- [ ] **Step 1: Write a failing byte-level export test**

```ts
it("exports deterministic UTF-8 JSON with two-space indentation", async () => {
  const response = await app.inject({ method: "GET", url: "/api/v1/import-export/export" });
  expect(response.statusCode).toBe(200);
  expect(response.headers["content-type"]).toContain("application/json");
  expect(response.headers["content-disposition"]).toContain("my-learning-backup-2026-07-31T15-04-05Z.json");
  expect(response.body).toBe(`${JSON.stringify(expectedSnapshot, null, 2)}\n`);
});
```

- [ ] **Step 2: Run test to verify RED**

Run: `pnpm --filter @my-learning/api test -- export.test.ts`  
Expected: FAIL with route not found.

- [ ] **Step 3: Implement a coherent read transaction**

```ts
export async function buildSnapshot(repository: SnapshotRepository, clock: Clock): Promise<ExportSnapshot> {
  const data = await repository.readAllInTransaction();
  return exportSnapshotSchema.parse({
    formatVersion: "1.0.0",
    exportedAt: clock.now().toISOString(),
    timeZone: "America/Sao_Paulo",
    data: sortSnapshotData(data)
  });
}
```

Repository uses a single Prisma interactive read transaction. Serializer uses `JSON.stringify(snapshot, null, 2) + "\n"`; controller sends UTF-8 JSON attachment. `exportedAt` is informational only and must not be copied into any entity.

- [ ] **Step 4: Run export tests**

Run: `pnpm --filter @my-learning/api test -- export.test.ts`  
Expected: PASS for empty/full data, order/tie breakers, nullable fields, UTC timestamps, filename and response headers.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/modules/import-export apps/api/src/app.ts
git commit -m "feat: export deterministic json snapshot"
```

### Task 3: Stateless preview and atomic replacement import

**Files:**
- Modify: `apps/api/src/modules/import-export/routes.ts`, `controller.ts`, `service.ts`, `repository.ts`
- Create: `apps/api/src/modules/import-export/import.test.ts`
- Modify: `apps/api/src/app.ts` to register multipart once with exact limits

**Interfaces:**
- Consumes: snapshot parser/semantic validator and Prisma transaction client.
- Produces: `POST /api/v1/import-export/import/preview` and `POST /api/v1/import-export/import`.

- [ ] **Step 1: Write failing preview/import tests**

```ts
it("previews without changing the database", async () => {
  const before = await fingerprintDatabase();
  const response = await upload("/api/v1/import-export/import/preview", validSnapshotBytes);
  expect(response.statusCode).toBe(200);
  expect(response.json().counts).toEqual({ trails: 2, resources: 4, practiceAnswers: 1, projectRequirements: 2, studyCheckIns: 3 });
  expect(await fingerprintDatabase()).toBe(before);
});

it("rolls back the complete replacement when an insert fails", async () => {
  const before = await exportCurrentData();
  repository.failAfterInsert(2);
  expect((await upload("/api/v1/import-export/import", validSnapshotBytes)).statusCode).toBe(500);
  expect(await exportCurrentData()).toEqual(before);
});
```

- [ ] **Step 2: Run tests to verify RED**

Run: `pnpm --filter @my-learning/api test -- import.test.ts`  
Expected: FAIL because import routes are absent.

- [ ] **Step 3: Configure multipart and parse failures exactly**

```ts
await app.register(multipart, {
  limits: { files: 1, fileSize: 10 * 1024 * 1024, fields: 0 }
});
```

Missing/multiple file is `400`; file over 10 MiB is `413 IMPORT_FILE_TOO_LARGE`; malformed UTF-8/JSON is `422 IMPORT_JSON_INVALID`; unsupported version is `422 SNAPSHOT_VERSION_UNSUPPORTED`; structural/semantic issues are `422` with field paths when available.

- [ ] **Step 4: Implement preview and replacement transaction**

```ts
export async function importSnapshot(bytes: Buffer, repository: SnapshotRepository) {
  const snapshot = parseAndValidateSnapshot(bytes);
  await repository.replaceAll(async (tx) => {
    await tx.projectRequirement.deleteMany();
    await tx.practiceAnswer.deleteMany();
    await tx.resource.deleteMany();
    await tx.trail.deleteMany();
    await tx.studyCheckIn.deleteMany();
    await insertSnapshotInDependencyOrder(tx, snapshot.data);
  });
  return countSnapshot(snapshot);
}
```

Insert Trails, Resources, Answers, Requirements and Check-ins with explicit imported IDs and timestamps. Preview only parses/validates/counts. Import independently repeats all parsing/validation and replaces whatever data exists at that moment; it never compares with preview or stores server state.

- [ ] **Step 5: Run import tests**

Run: `pnpm --filter @my-learning/api test -- import.test.ts export.test.ts`  
Expected: PASS for preview immutability, 10 MiB limit, invalid JSON/version/relations/order, full replacement, historical Check-ins, timestamp preservation, post-preview local changes replaced and transaction rollback.

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/modules/import-export apps/api/src/app.ts
git commit -m "feat: preview and restore json snapshots"
```

### Task 4: Import/export client with long timeout

**Files:**
- Create: `apps/web/src/features/import-export/api.ts`, `api.test.ts`, `download-export.ts`, `download-export.test.ts`
- Modify: `apps/web/src/lib/api/client.ts`

**Interfaces:**
- Consumes: browser Fetch API and ImportPreview schema.
- Produces: `exportSnapshot()`, `previewImport(file)`, `confirmImport(file)` with 60-second timeout.

- [ ] **Step 1: Write failing client tests**

```ts
it("rejects files over 10 MiB before a request", async () => {
  const file = new File([new Uint8Array(10 * 1024 * 1024 + 1)], "large.json", { type: "application/json" });
  await expect(previewImport(file)).rejects.toMatchObject({ code: "IMPORT_FILE_TOO_LARGE" });
  expect(fetch).not.toHaveBeenCalled();
});

it("uses 60 seconds and does not force JSON content type for multipart", async () => {
  await previewImport(validFile);
  expect(fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ body: expect.any(FormData) }));
  expect(fetch.mock.calls[0][1].headers).not.toHaveProperty("Content-Type");
});
```

- [ ] **Step 2: Run tests to verify RED**

Run: `pnpm --filter @my-learning/web test -- import-export/api.test.ts download-export.test.ts`  
Expected: FAIL because operation clients are absent.

- [ ] **Step 3: Implement binary download and multipart upload**

```ts
const IMPORT_EXPORT_TIMEOUT_MS = 60_000;

export async function previewImport(file: File) {
  assertImportSize(file, 10 * 1024 * 1024);
  const body = new FormData();
  body.set("file", file);
  return apiRequest("/import-export/import/preview", importPreviewSchema, {
    method: "POST", body, signal: AbortSignal.timeout(IMPORT_EXPORT_TIMEOUT_MS), headers: {}
  });
}
```

Export reads `Content-Disposition`, downloads the Blob under the server filename and revokes its object URL. Import methods retain the same `File` object in component memory only; a page reload clears it.

- [ ] **Step 4: Run tests**

Run: `pnpm --filter @my-learning/web test -- import-export`  
Expected: PASS for size, timeout, FormData headers, server errors, filename and URL revocation.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/features/import-export apps/web/src/lib/api/client.ts
git commit -m "feat: add snapshot web client"
```

### Task 5: Settings and destructive import interface

**Files:**
- Create: `apps/web/src/features/settings/settings-view.tsx`, `settings-view.test.tsx`
- Create: `apps/web/src/features/import-export/export-action.tsx`, `import-action.tsx`, `import-action.test.tsx`
- Create: `apps/web/src/app/configuracoes/page.tsx`

**Interfaces:**
- Consumes: `/system/info`, export/download, preview/import.
- Produces: local database transparency and confirmed backup/restore UI.

- [ ] **Step 1: Write failing Settings/import tests**

```tsx
it("shows preview counts and replacement warning before enabling import", async () => {
  render(<ImportAction />);
  await user.upload(screen.getByLabelText("Arquivo JSON"), validFile);
  await user.click(screen.getByRole("button", { name: "Validar arquivo" }));
  expect(screen.getByText("2 trilhas")).toBeVisible();
  expect(screen.getByText(/todos os dados atuais serão substituídos/i)).toBeVisible();
  expect(confirmImport).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button", { name: "Importar e substituir" }));
  expect(confirmImport).toHaveBeenCalledWith(validFile);
});
```

- [ ] **Step 2: Run tests to verify RED**

Run: `pnpm --filter @my-learning/web test -- settings import-action`  
Expected: FAIL because Settings/import components are absent.

- [ ] **Step 3: Implement the operational Settings page**

Render absolute database path, `America/Sao_Paulo` and snapshot format `1.0.0`. Provide Download icon button plus text `Exportar JSON`, file input, `Validar arquivo`, preview counts and AlertDialog. Confirmation explicitly says current Trails, Resources, answers, requirements and Check-ins will be replaced; it submits the same File again and remains enabled only while a valid preview/File pair is in memory.

- [ ] **Step 4: Handle success and failure states**

On preview failure, retain file selection and show field/general error. On import failure, retain preview and file for retry. On success, show Sonner, clear file/preview and invalidate every query key (`dashboard`, `trails`, `resources`, `check-ins`, `system`). No merge, undo or automatic import exists.

- [ ] **Step 5: Run tests**

Run: `pnpm --filter @my-learning/web test -- settings import-action`  
Expected: PASS for system info, export, preview, warning, no pre-confirm mutation, same-file resend, error preservation and global invalidation.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/app/configuracoes apps/web/src/features/settings apps/web/src/features/import-export
git commit -m "feat: add local settings and backup interface"
```

### Task 6: Full restore E2E

**Files:**
- Create: `apps/web/e2e/fixtures/snapshot-1.0.0.json`
- Create: `apps/web/e2e/local-operation.spec.ts`
- Modify: `apps/web/playwright.config.ts` only to wire the isolated `data/e2e.db` setup

**Interfaces:**
- Consumes: full application and E2E database reset helper.
- Produces: browser proof that export/import is a faithful recovery path.

- [ ] **Step 1: Add a deterministic valid fixture**

Fixture contains one Trail, four Resources (Material, Question, Project, Flashcard), one PracticeAnswer, two ordered ProjectRequirements and two historical Check-ins. IDs are fixed UUID v4, timestamps are UTC `Z`, positions are contiguous and timezone is São Paulo.

- [ ] **Step 2: Add exact E2E scenarios**

```ts
test("exporta, altera e restaura o conjunto completo", async ({ page }) => {
  await importFixture(page, "snapshot-1.0.0.json");
  const download = await exportSnapshot(page);
  await deleteImportedTrail(page);
  await previewAndConfirmImport(page, download.path());
  await expect(page.getByRole("link", { name: "Trilha restaurada" })).toBeVisible();
  await expectProjectRequirements(page, ["Contrato", "Persistência"]);
  await expectHistoricalCheckIns(page, ["30/07/2026", "29/07/2026"]);
});
```

Also verify malformed JSON, unsupported version, oversized frontend rejection and cancellation after preview without database change.

- [ ] **Step 3: Run restore E2E**

Run: `pnpm test:e2e -- --grep "exporta, altera e restaura"`  
Expected: PASS against recreated `data/e2e.db`; restored IDs, order, status, answer, requirements and Check-ins match the exported file.

- [ ] **Step 4: Commit**

```bash
git add apps/web/e2e/fixtures apps/web/e2e/local-operation.spec.ts apps/web/playwright.config.ts
git commit -m "test: verify snapshot recovery workflow"
```

### Task 7: Final accessibility, responsive and release gate

**Files:**
- Create: `apps/web/e2e/accessibility-responsive.spec.ts`
- Modify: `README.md` with final operation/backup instructions

**Interfaces:**
- Consumes: all five increments.
- Produces: repeatable MVP Definition of Done evidence.

- [ ] **Step 1: Add axe coverage for every operational area**

```ts
for (const path of ["/", "/trilhas", `/trilhas/${trailId}`, `/trilhas/${trailId}/recursos/${resourceId}`, "/historico", "/configuracoes"]) {
  await page.goto(path);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
}
```

- [ ] **Step 2: Add responsive invariants**

For Playwright projects `desktop-chromium` (`1366x768`) and `mobile-chromium` (`390x844`), assert document `scrollWidth <= clientWidth`, all primary actions have nonzero bounding boxes inside the viewport, mobile navigation opens/closes by keyboard, dialogs trap/restore focus and the longest PT-BR labels do not overlap adjacent controls. Capture screenshots for Dashboard, Trail detail, Project detail, History and Settings.

- [ ] **Step 3: Run the complete gate from a clean E2E database**

Run: `pnpm db:setup`  
Run: `pnpm format:check`  
Run: `pnpm lint`  
Run: `pnpm typecheck`  
Run: `pnpm test`  
Run: `pnpm build`  
Run: `pnpm test:e2e`  
Expected: every command exits `0`; both Chromium projects pass; no axe violation, overlap or horizontal page overflow is reported.

- [ ] **Step 4: Verify scope boundaries**

Run: `rg -ni "@nestjs|express|dotenv|auth|login|signup|openai|remote cache|swagger" apps packages package.json pnpm-lock.yaml turbo.json`  
Expected: no dependency or implemented MVP flow for NestJS, Express, dotenv, authentication, external generation API, Turbo remote cache or Swagger. Legitimate prose in tests must be reviewed rather than blindly removed.

- [ ] **Step 5: Verify database and generated-output hygiene**

Run: `git status --short --ignored`  
Expected: `data/my-learning.db`, `data/e2e.db`, `.next`, `dist`, `coverage`, Playwright reports and Turbo cache are ignored; source, migrations and `data/.gitkeep` remain trackable.

- [ ] **Step 6: Commit**

```bash
git add README.md apps/web/e2e/accessibility-responsive.spec.ts
git commit -m "test: complete mvp quality gate"
```

## Acceptance Gate

- Export gera snapshot completo, determinístico, UTF-8, indentado e versionado com download nomeado.
- Preview não grava; importação revalida e substitui tudo atomicamente, preservando o conjunto anterior em qualquer falha.
- Configurações mostra o caminho real do SQLite, fuso e versão, com acesso direto a exportar/importar.
- Erros e arquivo selecionado são preservados; confirmação de substituição contém contagens e impacto.
- Todos os fluxos críticos passam em Chromium `1366x768` e `390x844`, por teclado e axe, sem sobreposição ou perda de ações.
- O gate completo confirma o escopo local sem autenticação, API externa, sincronização, app nativo ou cache remoto.
