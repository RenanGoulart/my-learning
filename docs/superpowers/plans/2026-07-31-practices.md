# Practices Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar autoria e estudo manual de Questões, Problemas, Projetos com requisitos ordenáveis e Flashcards, sem geração, correção ou histórico de tentativas.

**Architecture:** O módulo `practices` concentra respostas e requisitos vinculados ao agregado Resource. Regras de formato são validadas nos contratos e no serviço; mutações atualizam também a recência do Resource e da Trail em uma transação. A UI reutiliza o detalhe/editor de Resource e acrescenta superfícies específicas por formato.

**Tech Stack:** Fastify 5.11.0, Prisma 7.9.1, Zod 4.4.3, Next.js 16.2.12, React Hook Form 7.83.0, TanStack Query 5.101.4, dnd-kit, shadcn, Vitest 4.1.10, Playwright 1.62.1.

**Plan Version:** 0.1.0  
**Status:** Em revisão

## Global Constraints

- Execute primeiro os planos Foundation e Trails And Resources.
- Questão, Problema e Projeto exigem `prompt` não vazio; Flashcard exige `flashcardFront` e `flashcardBack` não vazios.
- Toda autoria é manual. Não implemente geração por IA, avaliação, nota, correção ou histórico de tentativas.
- `PracticeAnswer` armazena somente a resposta atual de práticas que não são Flashcard; resposta nula ou em branco remove a linha.
- Projeto representa também mini-case; não crie formato, entidade, rótulo ou rota `MINI_CASE`.
- Projeto possui pelo menos um requisito não vazio, posição contígua iniciando em `1` e conclusão independente do status do Resource.
- Revelar Flashcard é estado local, inicia oculto a cada abertura/reload e nunca persiste recordação nem altera status.
- Atualizações de resposta/requisitos usam um único `Clock.now()` para `updatedAt` do agregado Resource e Trail.
- Referências: `docs/requirements/questoes-e-problemas-2026-07-29.md`, `docs/requirements/projetos-e-requisitos-2026-07-29.md` e `docs/requirements/flashcards-2026-07-29.md`.

---

## File Structure

```text
packages/contracts/src/practices/index.ts       # Answer e ProjectRequirement contracts
apps/api/src/modules/practices/routes.ts        # Todas as rotas de prática
apps/api/src/modules/practices/controller.ts    # Adaptação HTTP
apps/api/src/modules/practices/service.ts       # Regras por formato
apps/api/src/modules/practices/repository.ts    # Transações Prisma
apps/web/src/features/practices/                # Answer, Project e Flashcard UI
apps/web/e2e/practices.spec.ts                   # Fluxos manuais completos
```

### Task 1: Contratos de respostas e requisitos

**Files:**
- Create: `packages/contracts/src/practices/index.ts`, `packages/contracts/src/practices/index.test.ts`
- Modify: `packages/contracts/src/resources/index.ts`, `packages/contracts/src/index.ts`

**Interfaces:**
- Consumes: `uuidV4Schema`, nullable text helpers and `projectRequirementSchema` from Resource contracts.
- Produces: `savePracticeAnswerInputSchema`, `createProjectRequirementInputSchema`, `patchProjectRequirementInputSchema`, `reorderProjectRequirementsInputSchema`, `updateRequirementCompletionInputSchema`.

- [ ] **Step 1: Write failing schema tests**

```ts
it("normalizes a blank answer to null", () => {
  expect(savePracticeAnswerInputSchema.parse({ answer: " \n " })).toEqual({ answer: null });
});

it("rejects an empty requirement and unknown properties", () => {
  expect(createProjectRequirementInputSchema.safeParse({ text: "  " }).success).toBe(false);
  expect(createProjectRequirementInputSchema.safeParse({ text: "API", checked: true }).success).toBe(false);
});
```

- [ ] **Step 2: Run tests to verify RED**

Run: `pnpm --filter @my-learning/contracts test -- practices`  
Expected: FAIL because practice contracts are absent.

- [ ] **Step 3: Implement the exact schemas**

```ts
export const reorderProjectRequirementsInputSchema = z.strictObject({
  requirementIds: z.array(uuidV4Schema).min(1)
}).superRefine(rejectDuplicateIds("requirementIds"));
```

Extend `ResourceDetail` so `practiceAnswer` is `string | null` and `projectRequirements` is an ordered array; nonapplicable formats return `null` and `[]` respectively.

- [ ] **Step 4: Run tests**

Run: `pnpm --filter @my-learning/contracts test`  
Run: `pnpm --filter @my-learning/contracts typecheck`  
Expected: PASS for whitespace, strictness, UUID v4 and duplicate order IDs.

- [ ] **Step 5: Commit**

```bash
git add packages/contracts
git commit -m "feat: define practice contracts"
```

### Task 2: Current answer API

**Files:**
- Create: `apps/api/src/modules/practices/routes.ts`, `controller.ts`, `service.ts`, `repository.ts`
- Create: `apps/api/src/modules/practices/practice-answers.test.ts`
- Modify: `apps/api/src/app.ts`

**Interfaces:**
- Consumes: `PracticeAnswer` Prisma type, `ResourceDetail`, `Clock`.
- Produces: `PUT /api/v1/practices/:resourceId/answer` and `saveAnswer(resourceId, answer)`.

- [ ] **Step 1: Write failing answer tests**

```ts
it("upserts one current answer and deletes it for blank input", async () => {
  await putAnswer(resourceId, "Primeira");
  const updated = await putAnswer(resourceId, "Segunda");
  expect(updated.practiceAnswer).toBe("Segunda");
  expect(await answerCount(resourceId)).toBe(1);
  const cleared = await putAnswer(resourceId, "   ");
  expect(cleared.practiceAnswer).toBeNull();
  expect(await answerCount(resourceId)).toBe(0);
});
```

- [ ] **Step 2: Run tests to verify RED**

Run: `pnpm --filter @my-learning/api test -- practice-answers.test.ts`  
Expected: FAIL with route not found.

- [ ] **Step 3: Implement format guard and transactional write**

```ts
const answerableFormats = new Set<ResourceFormat>(["QUESTION", "PROBLEM", "PROJECT"]);
if (resource.category !== "PRACTICE" || !answerableFormats.has(resource.format)) {
  throw new AppError({ code: "PRACTICE_ANSWER_NOT_ALLOWED", message: "Este recurso não aceita resposta.", statusCode: 409 });
}
```

Within one transaction, delete on `null`, otherwise upsert by unique `resourceId`; pass explicit `createdAt`/`updatedAt`, update Resource and Trail with the same instant, then return fresh `ResourceDetail`.

- [ ] **Step 4: Run tests**

Run: `pnpm --filter @my-learning/api test -- practice-answers.test.ts`  
Expected: PASS for Question/Problem/Project, one-row invariant, clear, Flashcard rejection, Material rejection and unchanged status.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/modules/practices apps/api/src/app.ts
git commit -m "feat: persist current practice answers"
```

### Task 3: Project requirement API

**Files:**
- Modify: `apps/api/src/modules/practices/routes.ts`, `controller.ts`, `service.ts`, `repository.ts`
- Create: `apps/api/src/modules/practices/project-requirements.test.ts`

**Interfaces:**
- Consumes: ProjectRequirement contracts and existing practice module factories.
- Produces: create, edit, order, completion and delete operations for Project requirements.

- [ ] **Step 1: Write failing aggregate tests**

```ts
it("rejects deletion of the final requirement", async () => {
  const requirement = await onlyRequirement(projectId);
  const response = await app.inject({ method: "DELETE", url: `/api/v1/project-requirements/${requirement.id}` });
  expect(response.statusCode).toBe(409);
  expect(response.json().error.code).toBe("FINAL_PROJECT_REQUIREMENT");
});

it("does not complete the project when all requirements are checked", async () => {
  const detail = await toggleRequirement(requirementId, true);
  expect(detail.status).toBe("IN_PROGRESS");
});
```

- [ ] **Step 2: Run tests to verify RED**

Run: `pnpm --filter @my-learning/api test -- project-requirements.test.ts`  
Expected: FAIL because requirement routes are absent.

- [ ] **Step 3: Implement guarded transactions**

```ts
export interface ProjectRequirementOperations {
  create(resourceId: string, input: { text: string }): Promise<ResourceDetail>;
  update(requirementId: string, input: { text: string }): Promise<ResourceDetail>;
  reorder(resourceId: string, requirementIds: string[]): Promise<ResourceDetail>;
  setCompletion(requirementId: string, isCompleted: boolean): Promise<ResourceDetail>;
  remove(requirementId: string): Promise<void>;
}
```

Every operation first verifies `category=PRACTICE` and `format=PROJECT`. Create appends at `count + 1`; reorder requires the complete unique ID set and uses temporary negatives; delete counts inside the transaction and rejects count `1`. Completion never updates Resource status. Every successful mutation updates Resource/Trail recency.

- [ ] **Step 4: Register exact routes**

```text
POST   /api/v1/projects/:resourceId/requirements
PUT    /api/v1/projects/:resourceId/requirements/order
PATCH  /api/v1/project-requirements/:requirementId
PATCH  /api/v1/project-requirements/:requirementId/completion
DELETE /api/v1/project-requirements/:requirementId
```

- [ ] **Step 5: Run tests**

Run: `pnpm --filter @my-learning/api test -- project-requirements.test.ts resources.test.ts`  
Expected: PASS for create/edit/reorder/check/delete, final protection, contiguous order, rollback, Project-only guard and independent status.

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/modules/practices
git commit -m "feat: manage project requirements"
```

### Task 4: Question and Problem authoring/study UI

**Files:**
- Create: `apps/web/src/features/practices/practice-answer.tsx`, `practice-answer.test.tsx`, `question-problem-detail.tsx`, `question-problem-detail.test.tsx`
- Modify: `apps/web/src/features/resources/resource-form.tsx`, `resource-detail.tsx`, `api.ts`, `queries.ts`

**Interfaces:**
- Consumes: Resource create/edit API and answer PUT endpoint.
- Produces: manual Question/Problem forms, prompt display and explicit answer save.

- [ ] **Step 1: Write failing UI tests**

```tsx
it.each(["QUESTION", "PROBLEM"] as const)("requires prompt for %s", async (format) => {
  render(<ResourceForm initialCategory="PRACTICE" initialFormat={format} />);
  await user.click(screen.getByRole("button", { name: "Salvar" }));
  expect(screen.getByLabelText("Enunciado")).toHaveAccessibleErrorMessage("Informe o enunciado.");
});

it("saves only after the explicit answer action", async () => {
  render(<PracticeAnswer resource={question} />);
  await user.type(screen.getByLabelText("Resposta atual"), "Minha resposta");
  expect(saveAnswer).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button", { name: "Salvar resposta" }));
  expect(saveAnswer).toHaveBeenCalledWith("Minha resposta");
});
```

- [ ] **Step 2: Run tests to verify RED**

Run: `pnpm --filter @my-learning/web test -- question-problem practice-answer`  
Expected: FAIL because practice components do not exist.

- [ ] **Step 3: Implement manual authoring and answer state**

Show category/format labels in PT-BR, require prompt, preserve failed form values and render the answer textarea only on detail. Save answer pessimistically, replace query cache with returned `ResourceDetail`, show Sonner on success and inline Alert on general failure; clearing and saving sends `{ answer: null }`.

- [ ] **Step 4: Run tests**

Run: `pnpm --filter @my-learning/web test -- question-problem practice-answer`  
Expected: PASS for required prompt, explicit save, clear, preserved failure and no grading/attempt UI.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/features/practices apps/web/src/features/resources
git commit -m "feat: add question and problem workflows"
```

### Task 5: Project checklist UI

**Files:**
- Create: `apps/web/src/features/practices/project-editor.tsx`, `project-editor.test.tsx`, `project-requirements.tsx`, `project-requirements.test.tsx`
- Modify: `apps/web/src/features/resources/resource-form.tsx`, `resource-detail.tsx`

**Interfaces:**
- Consumes: Project requirement endpoints and dnd-kit.
- Produces: Project creation with initial requirement and detail checklist operations.

- [ ] **Step 1: Write failing editor and checklist tests**

```tsx
it("starts with one required row and never removes the final row", async () => {
  render(<ProjectEditor />);
  expect(screen.getAllByLabelText(/Requisito/)).toHaveLength(1);
  expect(screen.getByRole("button", { name: "Remover requisito 1" })).toBeDisabled();
  await user.click(screen.getByRole("button", { name: "Salvar" }));
  expect(screen.getByLabelText("Requisito 1")).toHaveAccessibleErrorMessage("Informe o requisito.");
});
```

- [ ] **Step 2: Run tests to verify RED**

Run: `pnpm --filter @my-learning/web test -- project-editor project-requirements`  
Expected: FAIL because Project UI does not exist.

- [ ] **Step 3: Implement create/edit and immediate checklist actions**

Extract the Project fields already present in `ResourceForm` into `ProjectEditor`: it starts with one empty requirement, allows append, disables removal of the last row and submits only when every visible row is nonempty. On detail, create/edit use explicit Save; completion checkbox and order persist immediately. Optimistically update only completion and order, rollback on failure, and provide dnd-kit plus Up/Down icon buttons with accessible names.

- [ ] **Step 4: Implement delete confirmation**

Deleting a requirement uses AlertDialog showing its text. Disable delete when only one remains; still handle API `FINAL_PROJECT_REQUIREMENT` in an inline Alert because another client may have changed the aggregate.

- [ ] **Step 5: Run tests**

Run: `pnpm --filter @my-learning/web test -- project`  
Expected: PASS for first row, validation, add/edit/delete, final protection, reorder rollback, completion rollback and unchanged Resource status.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/features/practices apps/web/src/features/resources
git commit -m "feat: add project requirement interface"
```

### Task 6: Flashcard authoring and reveal

**Files:**
- Create: `apps/web/src/features/practices/flashcard-review.tsx`, `flashcard-review.test.tsx`
- Modify: `apps/web/src/features/resources/resource-form.tsx`, `resource-detail.tsx`
- Create: `apps/api/src/modules/practices/flashcards.test.ts`

**Interfaces:**
- Consumes: Resource CRUD/conversion contracts.
- Produces: required front/back validation and local reveal behavior.

- [ ] **Step 1: Write failing API and UI tests**

```tsx
it("hides the back on mount and reveals it without a mutation", async () => {
  render(<FlashcardReview front="O que é idempotência?" back="Repetir mantém o mesmo efeito." />);
  expect(screen.queryByText("Repetir mantém o mesmo efeito.")).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Revelar resposta" }));
  expect(screen.getByText("Repetir mantém o mesmo efeito.")).toBeVisible();
  expect(fetch).not.toHaveBeenCalled();
});
```

- [ ] **Step 2: Run tests to verify RED**

Run: `pnpm --filter @my-learning/web test -- flashcard`  
Run: `pnpm --filter @my-learning/api test -- flashcards.test.ts`  
Expected: FAIL for absent review component and missing format assertions.

- [ ] **Step 3: Implement Flashcard rules and UI**

Require trimmed front/back in create, edit and conversion schemas. Return `practiceAnswer: null` and `projectRequirements: []`. The reveal button toggles component state only; remount starts hidden and no request, persistence field or status mutation occurs.

- [ ] **Step 4: Run tests**

Run: `pnpm --filter @my-learning/web test -- flashcard`  
Run: `pnpm --filter @my-learning/api test -- flashcards.test.ts`  
Expected: PASS for create/retrieve/edit, empty field rejection, hidden-on-open/reload, reveal and unchanged status.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/modules/practices/flashcards.test.ts apps/web/src/features/practices apps/web/src/features/resources
git commit -m "feat: add manual flashcards"
```

### Task 7: Practices E2E and increment verification

**Files:**
- Create: `apps/web/e2e/practices.spec.ts`
- Modify: no production file unless a failing test demonstrates a defect

**Interfaces:**
- Consumes: Tasks 1-6.
- Produces: end-to-end proof for every Practice format.

- [ ] **Step 1: Add exact browser scenarios**

```ts
test("práticas manuais", async ({ page }) => {
  await createQuestion(page, "Quando usar cache?", "Quando a leitura se repete.");
  await createProblem(page, "Modele uma fila", "Usar estados explícitos.");
  await createProject(page, "API local", ["Criar rota", "Validar entrada"]);
  await reorderAndCompleteRequirement(page, "Validar entrada");
  await createFlashcard(page, "HTTP 204", "Sucesso sem corpo");
  await expectFlashcardRevealDoesNotChangeStatus(page);
});
```

- [ ] **Step 2: Run all gates**

Run: `pnpm format:check`  
Run: `pnpm lint`  
Run: `pnpm typecheck`  
Run: `pnpm test`  
Run: `pnpm build`  
Expected: cada comando sai com código `0`.

Run: `pnpm test:e2e -- --grep "práticas manuais"`  
Expected: PASS at `1366x768` and `390x844`; axe reports no violations on Resource detail/editor.

- [ ] **Step 3: Verify forbidden product behavior**

Run: `rg -ni "mini.case|generate|gerar com ia|nota|corrigir|tentativas" apps packages`  
Expected: no product behavior or persisted identifier for generation, grading, attempt history or mini-case; requirement/spec text is outside this search.

- [ ] **Step 4: Commit**

```bash
git add apps/web/e2e/practices.spec.ts
git commit -m "test: cover manual practice workflows"
```

## Acceptance Gate

- Questão, Problema e Projeto exigem enunciado e aceitam uma resposta atual opcional.
- Resposta em branco remove `PracticeAnswer`; Flashcard nunca cria essa entidade.
- Projeto cobre mini-case, exige ao menos um requisito e oferece ordem/conclusão independentes do status.
- Flashcard exige frente/verso, começa oculto e revela localmente sem persistir recordação.
- Não existe geração, correção, pontuação ou histórico de tentativas.
- Contratos, API, componentes e E2E de todos os formatos passam.
