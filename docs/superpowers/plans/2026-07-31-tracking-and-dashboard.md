# Tracking And Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar Check-in diário, histórico, streak atual/melhor e Dashboard agregado com Trilhas ativas e seleção determinística de continuidade.

**Architecture:** Regras de calendário e streak ficam puras em `@my-learning/domain`, usando `date-fns` e `@date-fns/tz` com um `Clock` injetável. A API é a autoridade para a data atual de São Paulo e agrega Check-ins, Trilhas e Recursos; a UI usa essa data sem confiar no fuso do navegador.

**Tech Stack:** date-fns 4.4.0, `@date-fns/tz` 1.5.0, Fastify 5.11.0, Prisma 7.9.1, Next.js 16.2.12, TanStack Query 5.101.4, shadcn, Vitest 4.1.10, Playwright 1.62.1.

**Plan Version:** 0.1.0  
**Status:** Em revisão

## Global Constraints

- Execute primeiro Foundation, Trails And Resources e Practices.
- O fuso fixo é `America/Sao_Paulo`; runtime, navegador e UTC não podem alterar a data oficial.
- `localDate` é `YYYY-MM-DD`; timestamps são instantes UTC ISO 8601; a API fornece `currentLocalDate`.
- Existe no máximo um Check-in por data. Escrita da data atual é idempotente; datas passadas/futuras e mutação de histórico são rejeitadas.
- Duração é opcional, inteira entre `1` e `1440`; UI aceita horas `0..24` e minutos `0..59`, ambos vazios omitem, e `24h` exige `0min`.
- Streak não depende de duração nem de status/progresso. Exclusão do Check-in atual recalcula imediatamente.
- Trilha ativa tem pelo menos um Resource e não está completa. Dashboard não mostra Trilhas vazias ou completas como ativas.
- `Continuar estudando` limita cinco itens: primeiro Resources `IN_PROGRESS` por `updatedAt DESC, id ASC`; sem nenhum, primeira Resource `NOT_STARTED` de cada Trail ativa por ordem manual, com Trails `updatedAt DESC, id ASC`.
- Referências: `docs/requirements/check-ins-historico-e-streaks-2026-07-29.md` e `docs/requirements/dashboard-de-estudos-2026-07-29.md`.

---

## File Structure

```text
packages/domain/src/check-ins/calendar.ts          # Data oficial de São Paulo
packages/domain/src/check-ins/streak.ts            # Streak atual e melhor
packages/domain/src/dashboard/continue-studying.ts # Seleção de até cinco recursos
packages/contracts/src/check-ins/index.ts           # Check-in HTTP schemas
packages/contracts/src/dashboard/index.ts           # Dashboard response schema
apps/api/src/modules/check-ins/                     # CRUD diário e histórico
apps/api/src/modules/dashboard/                     # Agregação read-only
apps/web/src/features/check-ins/                    # Formulário e histórico
apps/web/src/features/dashboard/                    # Primeira tela operacional
apps/web/e2e/tracking-dashboard.spec.ts             # Fluxo temporal integrado
```

### Task 1: Calendário e streak puros

**Files:**
- Create: `packages/domain/src/check-ins/calendar.ts`, `calendar.test.ts`, `streak.ts`, `streak.test.ts`
- Modify: `packages/domain/src/index.ts`, `packages/domain/package.json`

**Interfaces:**
- Consumes: `Clock`, date-fns and `@date-fns/tz`.
- Produces: `toSaoPauloLocalDate(instant)`, `previousLocalDate(localDate)`, `calculateStreaks(localDates, currentLocalDate)`.

- [ ] **Step 1: Write failing boundary tests**

```ts
it.each([
  ["2026-08-01T02:59:59.999Z", "2026-07-31"],
  ["2026-08-01T03:00:00.000Z", "2026-08-01"]
])("uses the São Paulo day boundary", (instant, expected) => {
  expect(toSaoPauloLocalDate(new Date(instant))).toBe(expected);
});

it("keeps current streak alive until the current day ends", () => {
  expect(calculateStreaks(["2026-07-29", "2026-07-30"], "2026-07-31"))
    .toEqual({ currentStreak: 2, bestStreak: 2, lastCheckInDate: "2026-07-30" });
  expect(calculateStreaks(["2026-07-29"], "2026-07-31").currentStreak).toBe(0);
});
```

- [ ] **Step 2: Run tests to verify RED**

Run: `pnpm --filter @my-learning/domain test -- calendar.test.ts streak.test.ts`  
Expected: FAIL because calendar/streak modules are absent.

- [ ] **Step 3: Implement date-fns-based rules**

```ts
import { TZDate } from "@date-fns/tz";
import { addDays, format } from "date-fns";

export const CALENDAR_TIME_ZONE = "America/Sao_Paulo";
export const toSaoPauloLocalDate = (instant: Date) =>
  format(new TZDate(instant.getTime(), CALENDAR_TIME_ZONE), "yyyy-MM-dd");
export function previousLocalDate(localDate: string) {
  const [year, month, day] = localDate.split("-").map(Number);
  return format(addDays(new TZDate(year, month - 1, day, 12, CALENDAR_TIME_ZONE), -1), "yyyy-MM-dd");
}
```

`calculateStreaks` deduplicates and sorts valid dates, finds the longest consecutive sequence, and anchors current streak on today if present, otherwise yesterday if present, otherwise zero.

- [ ] **Step 4: Run tests**

Run: `pnpm --filter @my-learning/domain test -- calendar.test.ts streak.test.ts`  
Expected: PASS for UTC boundary, month/year changes, leap day, duplicate dates, empty history, today, yesterday, missed day and best streak.

- [ ] **Step 5: Commit**

```bash
git add packages/domain
git commit -m "feat: add sao paulo calendar and streak rules"
```

### Task 2: Check-in contracts and duration conversion

**Files:**
- Create: `packages/contracts/src/check-ins/index.ts`, `packages/contracts/src/check-ins/index.test.ts`
- Create: `apps/web/src/features/check-ins/duration.ts`, `duration.test.ts`
- Modify: `packages/contracts/src/index.ts`

**Interfaces:**
- Consumes: common date/instant schemas.
- Produces: `studyCheckInSchema`, `upsertCheckInInputSchema`, `currentCheckInResponseSchema`, `durationFieldsToMinutes()`.

- [ ] **Step 1: Write failing contract and form conversion tests**

```ts
it.each([
  [{ hours: "", minutes: "" }, undefined],
  [{ hours: "0", minutes: "45" }, 45],
  [{ hours: "1", minutes: "30" }, 90],
  [{ hours: "24", minutes: "0" }, 1440]
])("converts duration fields", (input, expected) => {
  expect(durationFieldsToMinutes(input)).toBe(expected);
});

it.each([{ hours: "0", minutes: "0" }, { hours: "24", minutes: "1" }, { hours: "1", minutes: "60" }])
  ("rejects invalid duration", (input) => expect(() => durationFieldsToMinutes(input)).toThrow());
```

- [ ] **Step 2: Run tests to verify RED**

Run: `pnpm --filter @my-learning/contracts test -- check-ins`  
Run: `pnpm --filter @my-learning/web test -- duration.test.ts`  
Expected: FAIL because schemas/converter are absent.

- [ ] **Step 3: Define exact contracts**

```ts
export const studyCheckInSchema = z.strictObject({
  id: uuidV4Schema,
  localDate: localDateSchema,
  note: z.string().nullable(),
  durationMinutes: z.number().int().min(1).max(1440).nullable(),
  createdAt: isoInstantSchema,
  updatedAt: isoInstantSchema
});

export const currentCheckInResponseSchema = z.strictObject({
  currentLocalDate: localDateSchema,
  checkIn: studyCheckInSchema.nullable()
});
```

`upsertCheckInInputSchema` is strict with optional nullable note and duration; empty note normalizes to null. `durationFieldsToMinutes` implements exactly the cases above and emits PT-BR field errors for `hours`/`minutes`.

- [ ] **Step 4: Run tests**

Run: `pnpm --filter @my-learning/contracts test -- check-ins`  
Run: `pnpm --filter @my-learning/web test -- duration.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/contracts apps/web/src/features/check-ins/duration.ts apps/web/src/features/check-ins/duration.test.ts
git commit -m "feat: define check-in contracts and duration rules"
```

### Task 3: Check-in API and protected history

**Files:**
- Create: `apps/api/src/modules/check-ins/routes.ts`, `controller.ts`, `service.ts`, `repository.ts`
- Create: `apps/api/src/modules/check-ins/check-ins.test.ts`
- Modify: `apps/api/src/app.ts`

**Interfaces:**
- Consumes: Check-in contracts, `Clock`, calendar/streak functions, Prisma.
- Produces: Check-in list/current/upsert/delete routes and derived streak data for Dashboard.

- [ ] **Step 1: Write failing temporal integration tests**

```ts
it("upserts one record for the API-authoritative current date", async () => {
  const app = await buildTestApp({ now: "2026-08-01T02:59:59.999Z" });
  await putCheckIn(app, "2026-07-31", { note: "Primeiro", durationMinutes: 45 });
  const updated = await putCheckIn(app, "2026-07-31", { note: "Editado", durationMinutes: null });
  expect(updated.note).toBe("Editado");
  expect(await checkInCount()).toBe(1);
});

it.each(["2026-07-30", "2026-08-01"])("rejects non-current date %s", async (localDate) => {
  const response = await putCheckIn(app, localDate, {});
  expect(response.statusCode).toBe(409);
  expect(response.json().error.code).toBe("CHECK_IN_DATE_NOT_CURRENT");
});
```

- [ ] **Step 2: Run tests to verify RED**

Run: `pnpm --filter @my-learning/api test -- check-ins.test.ts`  
Expected: FAIL with route not found.

- [ ] **Step 3: Implement service rules and transactions**

```ts
export function assertCurrentLocalDate(requested: string, clock: Clock) {
  const current = toSaoPauloLocalDate(clock.now());
  if (requested !== current) {
    throw new AppError({ code: "CHECK_IN_DATE_NOT_CURRENT", message: "Só é possível alterar o Check-in de hoje.", statusCode: 409 });
  }
  return current;
}
```

PUT upserts by `localDate` with explicit timestamps; DELETE verifies current date before deleting. GET list orders `localDate DESC, id ASC`. GET current returns authoritative date plus nullable record. Imported history is readable but cannot pass mutation guard.

- [ ] **Step 4: Register exact routes**

```text
GET    /api/v1/check-ins
GET    /api/v1/check-ins/current
PUT    /api/v1/check-ins/:localDate
DELETE /api/v1/check-ins/:localDate
```

- [ ] **Step 5: Run tests**

Run: `pnpm --filter @my-learning/api test -- check-ins.test.ts`  
Expected: PASS for create/update idempotency, optional duration, boundaries 1/1440, invalid duration, delete/recreate, historical protection and runtime-timezone independence.

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/modules/check-ins apps/api/src/app.ts
git commit -m "feat: add daily check-in api"
```

### Task 4: Continue-studying rule and Dashboard contract

**Files:**
- Create: `packages/domain/src/dashboard/continue-studying.ts`, `continue-studying.test.ts`
- Create: `packages/contracts/src/dashboard/index.ts`, `packages/contracts/src/dashboard/index.test.ts`
- Modify: `packages/domain/src/index.ts`, `packages/contracts/src/index.ts`

**Interfaces:**
- Consumes: Resource statuses and Trail activity/progress.
- Produces: `selectContinueStudying(input, limit)`, `dashboardResponseSchema`, `DashboardResponse`.

- [ ] **Step 1: Write failing selection tests**

```ts
it("prefers five most recently updated in-progress resources", () => {
  expect(selectContinueStudying(dataset, 5).map((item) => item.resourceId))
    .toEqual(["00000000-0000-4000-8000-000000000006", "00000000-0000-4000-8000-000000000005", "00000000-0000-4000-8000-000000000004", "00000000-0000-4000-8000-000000000003", "00000000-0000-4000-8000-000000000002"]);
});

it("falls back to the first not-started resource of each active trail", () => {
  expect(selectContinueStudying(noInProgressDataset, 5).map((item) => item.position)).toEqual([1, 2]);
});
```

- [ ] **Step 2: Run tests to verify RED**

Run: `pnpm --filter @my-learning/domain test -- continue-studying.test.ts`  
Expected: FAIL because selector is absent.

- [ ] **Step 3: Implement deterministic selector and schema**

```ts
export type ContinueStudyingItem = {
  trailId: string;
  trailTitle: string;
  resourceId: string;
  resourceTitle: string;
  category: ResourceCategory;
  format: ResourceFormat;
  status: ResourceStatus;
  position: number;
  updatedAt: string;
};
```

If any `IN_PROGRESS` exists globally, sort them by updatedAt descending then resource ID ascending and take five. Otherwise sort active Trails by updatedAt descending/ID ascending, select their first `NOT_STARTED` by position/ID and take five. Do not consume page-view or last-opened data.

`DashboardResponse` contains `currentLocalDate`, nullable current Check-in, `currentStreak`, `bestStreak`, nullable `lastCheckInDate`, active Trail summaries and `continueStudying` with at most five items.

- [ ] **Step 4: Run tests**

Run: `pnpm --filter @my-learning/domain test -- continue-studying.test.ts`  
Run: `pnpm --filter @my-learning/contracts test -- dashboard`  
Expected: PASS for priority, fallback, tie breakers, empty result, completed/empty Trail exclusion and limit.

- [ ] **Step 5: Commit**

```bash
git add packages/domain packages/contracts
git commit -m "feat: define dashboard aggregation rules"
```

### Task 5: Dashboard API aggregation

**Files:**
- Create: `apps/api/src/modules/dashboard/routes.ts`, `controller.ts`, `service.ts`, `repository.ts`
- Create: `apps/api/src/modules/dashboard/dashboard.test.ts`
- Modify: `apps/api/src/app.ts`

**Interfaces:**
- Consumes: Check-in repository, progress/activity/streak/continue rules, Dashboard contract.
- Produces: `GET /api/v1/dashboard`.

- [ ] **Step 1: Write a failing aggregate test**

```ts
it("returns one coherent dashboard projection", async () => {
  const response = await app.inject({ method: "GET", url: "/api/v1/dashboard" });
  expect(response.statusCode).toBe(200);
  expect(response.json()).toMatchObject({
    currentLocalDate: "2026-07-31",
    currentStreak: 2,
    bestStreak: 4,
    lastCheckInDate: "2026-07-30"
  });
  expect(response.json().activeTrails.every((trail: { isActive: boolean }) => trail.isActive)).toBe(true);
  expect(response.json().continueStudying).toHaveLength(5);
});
```

- [ ] **Step 2: Run test to verify RED**

Run: `pnpm --filter @my-learning/api test -- dashboard.test.ts`  
Expected: FAIL with route not found.

- [ ] **Step 3: Implement one read projection**

Repository reads Check-ins plus Trails/Resources ordered with documented tie breakers. Service captures `now` once, derives `currentLocalDate`, streaks, progress/activity and continue items, and validates the outgoing object against `dashboardResponseSchema` through the Fastify type provider.

- [ ] **Step 4: Run API tests**

Run: `pnpm --filter @my-learning/api test -- dashboard.test.ts check-ins.test.ts`  
Expected: PASS for empty dataset, current/yesterday/missed streak, active exclusions, in-progress priority, fallback and five-item limit.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/modules/dashboard apps/api/src/app.ts
git commit -m "feat: add dashboard api"
```

### Task 6: Check-in form and History page

**Files:**
- Create: `apps/web/src/features/check-ins/api.ts`, `queries.ts`, `check-in-form.tsx`, `check-in-form.test.tsx`, `check-in-history.tsx`, `check-in-history.test.tsx`
- Create: `apps/web/src/app/historico/page.tsx`

**Interfaces:**
- Consumes: Check-in endpoints and API-authoritative current date.
- Produces: explicit create/edit/delete form and read-only descending history.

- [ ] **Step 1: Write failing form behavior tests**

```tsx
it("uses the API date and asks before deleting today's check-in", async () => {
  render(<CheckInForm currentLocalDate="2026-07-31" checkIn={todayCheckIn} />);
  expect(screen.getByText("31/07/2026")).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Excluir check-in" }));
  expect(screen.getByRole("alertdialog")).toHaveTextContent("seu streak será recalculado");
});
```

- [ ] **Step 2: Run tests to verify RED**

Run: `pnpm --filter @my-learning/web test -- check-in`  
Expected: FAIL because components are absent.

- [ ] **Step 3: Implement form and history**

Use labels `Horas`, `Minutos`, `Observação`; initial blanks represent omitted duration. Button text is `Registrar check-in` when absent and `Salvar alterações` when present. Preserve values on failures and show field/general errors. Delete uses AlertDialog containing date and streak warning, invalidates check-in/dashboard/history queries, and has no undo. History orders dates descending and formats dates with date-fns as `dd/MM/yyyy`, durations as `45min`, `1h 30min` or `24h`.

- [ ] **Step 4: Run tests**

Run: `pnpm --filter @my-learning/web test -- check-in`  
Expected: PASS for omitted/valid/invalid duration, explicit save, edit, delete confirmation, preserved input, history order and read-only rows.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/features/check-ins apps/web/src/app/historico
git commit -m "feat: add check-in and history interface"
```

### Task 7: Operational Dashboard UI and E2E

**Files:**
- Create: `apps/web/src/features/dashboard/api.ts`, `queries.ts`, `dashboard-view.tsx`, `dashboard-view.test.tsx`
- Modify: `apps/web/src/app/page.tsx`
- Create: `apps/web/e2e/tracking-dashboard.spec.ts`

**Interfaces:**
- Consumes: Dashboard endpoint and Check-in form.
- Produces: first-screen daily operation with streaks, active Trails and continue links.

- [ ] **Step 1: Write failing Dashboard tests**

```tsx
it("renders streaks and links continue items to Resource detail", () => {
  render(<DashboardView dashboard={dashboardFixture} />);
  expect(screen.getByText("Streak atual")).toHaveTextContent("2 dias");
  expect(screen.getByText("Melhor streak")).toHaveTextContent("4 dias");
  expect(screen.getByRole("link", { name: /HTTP/ })).toHaveAttribute("href", `/trilhas/${trailId}/recursos/${resourceId}`);
});
```

- [ ] **Step 2: Run tests to verify RED**

Run: `pnpm --filter @my-learning/web test -- dashboard-view.test.tsx`  
Expected: FAIL because Dashboard feature is absent.

- [ ] **Step 3: Implement compact operational layout**

Render Check-in action first, then current/best streak and last Check-in, active Trails with progress, and up to five Continue links. Use full-width unframed sections and cards only for repeated Trail/Resource items; use proper heading levels and no feature-explanation copy. Empty states link directly to create Trail or begin Check-in.

- [ ] **Step 4: Add E2E temporal scenario and axe checks**

E2E creates a Trail with two Resources, marks one in progress, registers Check-in, verifies progress/streak/continue, edits duration, deletes current Check-in and verifies recalculation. Run axe on Dashboard and History and keyboard through all controls in desktop/mobile projects.

- [ ] **Step 5: Run the increment gate**

Run: `pnpm format:check`  
Run: `pnpm lint`  
Run: `pnpm typecheck`  
Run: `pnpm test`  
Run: `pnpm build`  
Expected: cada comando sai com código `0`.

Run: `pnpm test:e2e -- --grep "acompanhamento e dashboard"`  
Expected: PASS at `1366x768` and `390x844`, no axe violations, visible focus and no overlap/overflow.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/app/page.tsx apps/web/src/features/dashboard apps/web/e2e/tracking-dashboard.spec.ts
git commit -m "feat: add study dashboard"
```

## Acceptance Gate

- A API determina corretamente a data de São Paulo em fronteiras UTC e aceita mutação somente do dia atual.
- Check-in é idempotente, duração é opcional/validada, histórico é read-only e exclusão atual recalcula streak.
- Streak atual e melhor cobrem hoje, ontem, dia perdido, viradas de mês/ano e importação histórica.
- Dashboard omite Trilhas vazias/completas e seleciona continuidade com prioridade, desempate e limite aprovados.
- UI formata datas/duração em PT-BR, preserva entrada e funciona com teclado nos dois viewports.
- Testes de domínio, contratos, API, componentes, E2E e axe passam.
