# Trails And Resources Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar o CRUD completo de Trilhas e Recursos, progresso derivado, ordem manual, status, exclusões em cascata e conversão segura de categoria/formato.

**Architecture:** Contratos Zod definem a fronteira REST; módulos Fastify usam `routes/controller/service/repository` e transações Prisma para ordem e conversão. A interface Next usa páginas dedicadas, TanStack Query, React Hook Form e dnd-kit com alternativa acessível por botões.

**Tech Stack:** Fastify 5.11.0, Prisma 7.9.1, Zod 4.4.3, `@fastify/type-provider-zod` 1.0.0, Next.js 16.2.12, TanStack Query 5.101.4, React Hook Form 7.83.0, dnd-kit 6.3.1/10.0.0/3.2.2, Vitest 4.1.10, Playwright 1.62.1.

**Plan Version:** 0.1.0  
**Status:** Em revisão

## Global Constraints

- Execute primeiro `docs/superpowers/plans/2026-07-31-foundation.md`.
- API base `/api/v1`; sucesso retorna objeto/array diretamente, criação `201`, leitura/edição `200`, exclusão `204`.
- Use erros PT-BR no envelope `{ error: { code, message, fieldErrors? } }`; caminhos aninhados usam notação como `requirements.0.text`.
- Campos de texto removem espaços externos; obrigatório só com espaços é inválido; opcional vazio vira `null`; preserve espaços internos e quebras de linha; não imponha tamanho máximo.
- POST pode omitir opcional; PATCH omitido mantém, `null` limpa; GET serializa opcionais como `null`.
- Títulos repetidos são válidos. IDs são UUID v4 gerados por Prisma. `Clock` injetado fornece todos os timestamps de aplicação.
- Recursos são ordenados por `position` ascendente com desempate por ID; posições são inteiros contíguos iniciando em `1`.
- Use otimista apenas para status e reordenação; em falha, restaure o cache e mostre Alert/Sonner conforme o caso.
- Referências: `docs/requirements/gestao-de-trilhas-2026-07-29.md` e `docs/requirements/gestao-de-recursos-e-materiais-2026-07-29.md`.

---

## File Structure

```text
packages/contracts/src/trails/       # TrailSummary, TrailDetail e mutações
packages/contracts/src/resources/    # ResourceSummary/Detail, status, ordem e conversão
apps/api/src/modules/trails/         # routes/controller/service/repository
apps/api/src/modules/resources/      # routes/controller/service/repository e conversion.ts
apps/web/src/features/trails/        # queries, formulário, lista e detalhe
apps/web/src/features/resources/     # formulário, detalhe, status, ordem e conversão
apps/web/src/app/trilhas/             # sete rotas aprovadas
apps/web/e2e/trails-resources.spec.ts # fluxo integrado e acessibilidade
```

### Task 1: Contratos públicos de Trilhas e Recursos

**Files:**
- Create: `packages/contracts/src/trails/index.ts`, `packages/contracts/src/trails/index.test.ts`
- Create: `packages/contracts/src/resources/index.ts`, `packages/contracts/src/resources/index.test.ts`
- Modify: `packages/contracts/src/index.ts`

**Interfaces:**
- Consumes: enums e `apiErrorSchema` de `packages/contracts/src/common/index.ts`.
- Produces: schemas e tipos `TrailSummary`, `TrailDetail`, `ResourceSummary`, `ResourceDetail`, `ProjectRequirement`, `CreateTrailInput`, `PatchTrailInput`, `CreateResourceInput`, `PatchResourceInput`, `ReorderResourcesInput`, `ConversionPreview`, `ConvertResourceInput`.

- [ ] **Step 1: Write failing strict-schema tests**

```ts
it("rejects an unknown field and normalizes optional blank text", () => {
  expect(createTrailInputSchema.safeParse({ title: " TypeScript ", extra: true }).success).toBe(false);
  expect(createTrailInputSchema.parse({ title: " TypeScript ", description: " " })).toEqual({
    title: "TypeScript",
    description: null
  });
});

it("rejects a material format in a practice", () => {
  const result = createResourceInputSchema.safeParse({
    title: "Exercício", category: "PRACTICE", format: "ARTICLE", prompt: "Resolva"
  });
  expect(result.success).toBe(false);
});
```

- [ ] **Step 2: Run tests to verify RED**

Run: `pnpm --filter @my-learning/contracts test -- trails resources`  
Expected: FAIL because the schemas are not exported.

- [ ] **Step 3: Define exact response shapes**

```ts
export const trailProgressSchema = z.strictObject({
  completedResources: z.number().int().nonnegative(),
  totalResources: z.number().int().nonnegative(),
  percentage: z.number().int().min(0).max(100)
});

export const trailSummarySchema = z.strictObject({
  id: uuidV4Schema,
  title: z.string(),
  description: z.string().nullable(),
  goal: z.string().nullable(),
  progress: trailProgressSchema,
  isComplete: z.boolean(),
  isActive: z.boolean(),
  createdAt: isoInstantSchema,
  updatedAt: isoInstantSchema
});
```

`ResourceSummary` contains common fields plus `url` for Material and no answer/requirements. `ResourceDetail` contains all common and applicable nullable fields plus `practiceAnswer` and ordered `projectRequirements`. `TrailDetail` extends summary with ordered `resources`.

```ts
export const projectRequirementSchema = z.strictObject({
  id: uuidV4Schema,
  resourceId: uuidV4Schema,
  text: z.string(),
  position: z.number().int().positive(),
  isCompleted: z.boolean(),
  createdAt: isoInstantSchema,
  updatedAt: isoInstantSchema
});
export const projectRequirementDraftSchema = z.strictObject({ text: requiredTrimmedTextSchema });
```

`CreateResourceInput` includes `requirements: projectRequirementDraftSchema.array().min(1).optional()`. It requires this field only for `PROJECT`, rejects it for every other format, requires prompt for Question/Problem/Project and front/back for Flashcard.

- [ ] **Step 4: Define mutation schemas and conversion concurrency**

```ts
export const conversionPreviewSchema = z.strictObject({
  resourceId: uuidV4Schema,
  resourceUpdatedAt: isoInstantSchema,
  targetCategory: resourceCategorySchema,
  targetFormat: resourceFormatSchema,
  discardedFields: z.array(z.enum(["url", "prompt", "practiceAnswer", "projectRequirements", "flashcardFront", "flashcardBack"]))
});

export const convertResourceInputSchema = z.strictObject({
  targetCategory: resourceCategorySchema,
  targetFormat: resourceFormatSchema,
  expectedUpdatedAt: isoInstantSchema,
  discardConfirmed: z.boolean(),
  url: optionalNullableHttpUrlSchema.optional(),
  prompt: optionalNullableTrimmedTextSchema.optional(),
  flashcardFront: optionalNullableTrimmedTextSchema.optional(),
  flashcardBack: optionalNullableTrimmedTextSchema.optional(),
  requirements: z.array(projectRequirementDraftSchema).min(1).optional()
});
```

- [ ] **Step 5: Run contract tests**

Run: `pnpm --filter @my-learning/contracts test`  
Run: `pnpm --filter @my-learning/contracts typecheck`  
Expected: PASS for strict objects, category/format matrix, HTTP(S) URL and nullable semantics.

- [ ] **Step 6: Commit**

```bash
git add packages/contracts
git commit -m "feat: define trail and resource contracts"
```

### Task 2: Trail module and derived progress

**Files:**
- Create: `apps/api/src/modules/trails/routes.ts`, `controller.ts`, `service.ts`, `repository.ts`
- Create: `apps/api/src/modules/trails/trails.test.ts`, `apps/api/src/modules/trails/trails.fixtures.ts`
- Modify: `apps/api/src/app.ts`

**Interfaces:**
- Consumes: `calculateTrailProgress()`, `isActiveTrail()`, Prisma client, `Clock`, Trail schemas.
- Produces: `createTrailRepository(prisma)`, `createTrailService({ repository, clock })`, `createTrailController(service)`, `trailRoutes`.

- [ ] **Step 1: Write failing CRUD and progress integration tests**

```ts
it("creates duplicate titles and derives empty progress", async () => {
  const first = await app.inject({ method: "POST", url: "/api/v1/trails", payload: { title: "Web" } });
  const second = await app.inject({ method: "POST", url: "/api/v1/trails", payload: { title: "Web" } });
  expect(first.statusCode).toBe(201);
  expect(second.statusCode).toBe(201);
  expect(first.json().progress).toEqual({ completedResources: 0, totalResources: 0, percentage: 0 });
  expect(first.json()).toMatchObject({ isComplete: false, isActive: false });
});
```

- [ ] **Step 2: Run tests to verify RED**

Run: `pnpm --filter @my-learning/api test -- trails.test.ts`  
Expected: FAIL with route not found.

- [ ] **Step 3: Implement repository and service contracts**

```ts
export type TrailRepository = ReturnType<typeof createTrailRepository>;

export function createTrailService(deps: { repository: TrailRepository; clock: Clock }) {
  return {
    list: () => deps.repository.findManyWithStatuses(),
    get: (id: string) => deps.repository.findDetail(id),
    create: (input: CreateTrailInput) => deps.repository.create({ ...input, now: deps.clock.now() }),
    update: (id: string, input: PatchTrailInput) => deps.repository.update({ id, input, now: deps.clock.now() }),
    remove: (id: string) => deps.repository.remove(id)
  };
}
```

Map list by `updatedAt DESC, id ASC`; map detail resources by `position ASC, id ASC`; derive progress and activity rather than storing them. Missing IDs throw `TRAIL_NOT_FOUND`/404. Delete executes one Prisma cascade operation.

- [ ] **Step 4: Register exact routes**

```text
GET    /api/v1/trails
POST   /api/v1/trails
GET    /api/v1/trails/:trailId
PATCH  /api/v1/trails/:trailId
DELETE /api/v1/trails/:trailId
```

- [ ] **Step 5: Run tests**

Run: `pnpm --filter @my-learning/api test -- trails.test.ts`  
Expected: PASS for create/list/detail/update/delete, duplicate title, order, 404, cascade and progress.

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/modules/trails apps/api/src/app.ts
git commit -m "feat: add trail api"
```

### Task 3: Resource CRUD, status and contiguous ordering

**Files:**
- Create: `apps/api/src/modules/resources/routes.ts`, `controller.ts`, `service.ts`, `repository.ts`
- Create: `apps/api/src/modules/resources/resources.test.ts`
- Modify: `apps/api/src/app.ts`

**Interfaces:**
- Consumes: Resource contracts, Prisma client, `Clock`, Trail repository existence check.
- Produces: resource CRUD, status mutation and transactional reorder endpoints.

- [ ] **Step 1: Write failing resource tests**

```ts
it("appends resources and persists a complete contiguous reorder", async () => {
  const a = await createMaterial(app, trailId, "A");
  const b = await createMaterial(app, trailId, "B");
  expect([a.position, b.position]).toEqual([1, 2]);
  const response = await app.inject({
    method: "PUT",
    url: `/api/v1/trails/${trailId}/resources/order`,
    payload: { resourceIds: [b.id, a.id] }
  });
  expect(response.json().map((item: { id: string; position: number }) => [item.id, item.position]))
    .toEqual([[b.id, 1], [a.id, 2]]);
});
```

- [ ] **Step 2: Run tests to verify RED**

Run: `pnpm --filter @my-learning/api test -- resources.test.ts`  
Expected: FAIL with route not found.

- [ ] **Step 3: Implement create/update/delete/status transactions**

```ts
export interface ResourceService {
  create(trailId: string, input: CreateResourceInput): Promise<ResourceDetail>;
  get(resourceId: string): Promise<ResourceDetail>;
  update(resourceId: string, input: PatchResourceInput): Promise<ResourceDetail>;
  updateStatus(resourceId: string, status: ResourceStatus): Promise<ResourceDetail>;
  reorder(trailId: string, resourceIds: string[]): Promise<ResourceSummary[]>;
  remove(resourceId: string): Promise<void>;
}
```

For every meaningful resource mutation, pass one `now` to the transaction and set both `resource.updatedAt` and parent `trail.updatedAt`. Creating a Project inserts its required ordered requirements in the same transaction; creating a Flashcard persists front/back and never creates `PracticeAnswer`. Reorder validates that the request contains every current Resource ID exactly once, uses temporary negative positions to avoid the unique constraint, then writes positions `1..n` in the same transaction.

- [ ] **Step 4: Register exact routes**

```text
POST   /api/v1/trails/:trailId/resources
PUT    /api/v1/trails/:trailId/resources/order
GET    /api/v1/resources/:resourceId
PATCH  /api/v1/resources/:resourceId
PATCH  /api/v1/resources/:resourceId/status
DELETE /api/v1/resources/:resourceId
```

- [ ] **Step 5: Run API tests**

Run: `pnpm --filter @my-learning/api test -- resources.test.ts trails.test.ts`  
Expected: PASS for append, validation, nullable updates, status, reorder rollback, delete cascade and Trail progress reopening.

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/modules/resources apps/api/src/app.ts
git commit -m "feat: add resource api and ordering"
```

### Task 4: Atomic Resource conversion

**Files:**
- Create: `apps/api/src/modules/resources/conversion.ts`, `apps/api/src/modules/resources/conversion.test.ts`
- Modify: `apps/api/src/modules/resources/routes.ts`, `controller.ts`, `service.ts`, `repository.ts`

**Interfaces:**
- Consumes: `ConversionPreview`, `ConvertResourceInput`, Resource repository.
- Produces: `previewConversion(resource, target)` and atomic conversion routes.

- [ ] **Step 1: Write failing conversion matrix tests**

```ts
it.each([
  ["MATERIAL", "ARTICLE", "PRACTICE", "QUESTION", ["url"]],
  ["PRACTICE", "PROJECT", "MATERIAL", "BOOK", ["prompt", "practiceAnswer", "projectRequirements"]],
  ["PRACTICE", "FLASHCARD", "PRACTICE", "QUESTION", ["flashcardFront", "flashcardBack"]]
])("reports discarded fields", async (_fromCategory, _fromFormat, targetCategory, targetFormat, discardedFields) => {
  const preview = await service.preview(resourceId, { targetCategory, targetFormat });
  expect(preview.discardedFields).toEqual(discardedFields);
});
```

- [ ] **Step 2: Run tests to verify RED**

Run: `pnpm --filter @my-learning/api test -- conversion.test.ts`  
Expected: FAIL because conversion functions are absent.

- [ ] **Step 3: Implement preview and optimistic concurrency**

```ts
if (resource.updatedAt.toISOString() !== input.expectedUpdatedAt) {
  throw new AppError({ code: "RESOURCE_CHANGED", message: "O recurso foi alterado. Revise a conversão novamente.", statusCode: 409 });
}
if (discardedFields.length > 0 && !input.discardConfirmed) {
  throw new AppError({ code: "DISCARD_CONFIRMATION_REQUIRED", message: "Confirme o descarte dos dados incompatíveis.", statusCode: 409 });
}
```

Validate all required target fields, including at least one nonempty requirement for Project, before opening the write transaction. In one transaction, update common/type fields, delete incompatible `PracticeAnswer`/`ProjectRequirement` rows, create ordered target requirements when entering Project, set one injected timestamp on Resource and Trail, and return `ResourceDetail`. A failed validation or write leaves the original aggregate unchanged.

- [ ] **Step 4: Register and verify routes**

```text
POST /api/v1/resources/:resourceId/conversion-preview
POST /api/v1/resources/:resourceId/convert
```

Run: `pnpm --filter @my-learning/api test -- conversion.test.ts`  
Expected: PASS for all discard rules, missing target fields `422`, absent confirmation `409`, stale timestamp `409` and transaction rollback.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/modules/resources
git commit -m "feat: add atomic resource conversion"
```

### Task 5: Trail pages and forms

**Files:**
- Create: `apps/web/src/features/trails/api.ts`, `queries.ts`, `trail-form.tsx`, `trail-list.tsx`, `trail-detail.tsx`, `delete-trail-button.tsx`
- Create: `apps/web/src/features/trails/trail-form.test.tsx`, `trail-detail.test.tsx`
- Create: `apps/web/src/app/trilhas/page.tsx`, `nova/page.tsx`, `[trailId]/page.tsx`, `[trailId]/editar/page.tsx`

**Interfaces:**
- Consumes: Trail REST API and shared schemas.
- Produces: list, create, detail, edit and impact-aware delete UI.

- [ ] **Step 1: Write failing form and delete tests**

```tsx
it("keeps entered values and associates a server field error", async () => {
  vi.mocked(createTrail).mockRejectedValue(new ApiClientError({ code: "VALIDATION_ERROR", message: "Revise os campos.", fieldErrors: { title: ["Informe o título."] } }));
  render(<TrailForm mode="create" />);
  await user.type(screen.getByLabelText("Título"), "Minha trilha");
  await user.click(screen.getByRole("button", { name: "Salvar" }));
  expect(screen.getByLabelText("Título")).toHaveValue("Minha trilha");
  expect(screen.getByLabelText("Título")).toHaveAccessibleErrorMessage("Informe o título.");
});
```

- [ ] **Step 2: Run component tests to verify RED**

Run: `pnpm --filter @my-learning/web test -- trail-form.test.tsx trail-detail.test.tsx`  
Expected: FAIL because feature components do not exist.

- [ ] **Step 3: Implement queries and dedicated pages**

Use React Hook Form with `zodResolver`, explicit Save, inline field errors and an Alert for general failure. List trails by API order and show title, goal, progress, completion and activity without decorative section cards. Detail fetches ordered Resources and progress. Edit/create pages install `beforeunload` only while form state is dirty.

- [ ] **Step 4: Implement fresh-count destructive confirmation**

On delete click, refetch `GET /trails/:trailId`, then open shadcn `AlertDialog` with Trail title and current Resource count. Confirm calls DELETE, invalidates trail lists and navigates to `/trilhas`; there is no undo or trash.

- [ ] **Step 5: Run tests**

Run: `pnpm --filter @my-learning/web test -- trails`  
Expected: PASS for empty/list/error states, preserved forms, duplicate titles, progress, fresh delete count and navigation.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/app/trilhas apps/web/src/features/trails
git commit -m "feat: add trail management interface"
```

### Task 6: Resource pages, status, reorder and conversion UI

**Files:**
- Create: `apps/web/src/features/resources/api.ts`, `queries.ts`, `resource-form.tsx`, `resource-detail.tsx`, `resource-status.tsx`, `resource-order-list.tsx`, `resource-conversion.tsx`, `delete-resource-button.tsx`
- Create: `apps/web/src/features/resources/*.test.tsx`
- Create: `apps/web/src/app/trilhas/[trailId]/recursos/novo/page.tsx`, `[resourceId]/page.tsx`, `[resourceId]/editar/page.tsx`
- Create: `apps/web/e2e/trails-resources.spec.ts`

**Interfaces:**
- Consumes: Resource REST API, dnd-kit, Trail detail cache.
- Produces: operational material/resource workflow with optimistic status and order.

- [ ] **Step 1: Write failing UI behavior tests**

```tsx
it("rolls back an optimistic status failure", async () => {
  renderResourceStatus({ status: "NOT_STARTED", failMutation: true });
  await user.click(screen.getByRole("radio", { name: "Em andamento" }));
  await waitFor(() => expect(screen.getByRole("radio", { name: "Não iniciado" })).toBeChecked());
  expect(screen.getByRole("alert")).toHaveTextContent("Não foi possível alterar o status.");
});
```

- [ ] **Step 2: Run component tests to verify RED**

Run: `pnpm --filter @my-learning/web test -- resources`  
Expected: FAIL because feature components do not exist.

- [ ] **Step 3: Implement Resource forms and detail**

Require explicit category and format selection; initialize status as `NOT_STARTED`. Show URL only for Material; prompt for Question/Problem/Project; one initial ordered requirement row for Project; front/back for Flashcard. Open valid Material links in a new tab with `rel="noopener noreferrer"`, and render format-specific detail regions. PATCH common fields never changes category/format; conversion uses its own flow.

- [ ] **Step 4: Implement accessible ordering and conversion**

Use dnd-kit after drop plus Up/Down icon buttons with tooltips and stable row dimensions. Optimistically reorder the Trail detail cache, send the complete ID list, then rollback on failure. Conversion calls preview, lists exact discarded fields, asks confirmation only when nonempty and sends the preview timestamp as `expectedUpdatedAt`.

- [ ] **Step 5: Add destructive and browser tests**

Resource delete dialog includes title and dependent Practice warning. E2E creates a Trail, adds two Materials, reorders them by keyboard buttons, changes status, observes rounded progress, converts a Material to Question with discard confirmation and deletes a Resource.

- [ ] **Step 6: Run the increment gate**

Run: `pnpm format:check`  
Run: `pnpm lint`  
Run: `pnpm typecheck`  
Run: `pnpm test`  
Run: `pnpm build`  
Expected: cada comando sai com código `0`.

Run: `pnpm test:e2e -- --grep "trilhas e recursos"`  
Expected: PASS at `1366x768` and `390x844`, including keyboard focus and no horizontal page overflow.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/app/trilhas apps/web/src/features/resources apps/web/e2e/trails-resources.spec.ts
git commit -m "feat: add resource management interface"
```

## Acceptance Gate

- CRUD de Trilhas e Recursos, status e ordem manual funcionam pela UI e REST.
- Progresso, conclusão, reabertura e atividade são derivados e cobertos por testes.
- Exclusões são permanentes, confirmadas e removem dependências em cascata.
- Conversões validam o destino, mostram descarte, exigem confirmação quando necessário e são atômicas.
- URL opcional aceita apenas `http`/`https`; títulos duplicados continuam válidos.
- Testes de contratos, domínio, API, componentes e E2E passam nos dois viewports.
