# Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar o monorepo executável, os pacotes compartilhados, o banco SQLite completo, a base Fastify e o shell Next.js/shadcn do My Learning.

**Architecture:** `pnpm` workspaces organiza os pacotes e Turborepo orquestra tarefas com cache apenas local. A API Fastify usa composição por factories, contratos Zod e Prisma/SQLite; o Next.js consome a API diretamente e começa no Dashboard operacional.

**Tech Stack:** Node.js 24 LTS, pnpm 11.18.0, Turborepo 2.10.6, TypeScript 7.0.2, Fastify 5.11.0, Prisma 7.9.1, SQLite, Next.js 16.2.12, React 19.2.8, shadcn 4.16.1, Tailwind CSS 4.3.3, Vitest 4.1.10.

**Plan Version:** 1.0.0  
**Status:** Aprovado

## Global Constraints

- Use TypeScript ESM com `strict: true`, `packageManager: pnpm@11.18.0`, `.nvmrc` igual a `24` e `engines.node` igual a `>=24 <25`.
- Grave todas as dependências com versão exata e mantenha `save-exact=true` e `pnpm-lock.yaml`.
- Use `apps/web`, `apps/api`, `packages/contracts`, `packages/domain` e `packages/database`; não crie arquivos vazios nem abstrações sem consumidor.
- Use Fastify puro; não instale NestJS, Express, contêiner de DI, Swagger ou gerador OpenAPI.
- Restrinja tipos Prisma a `apps/api` e `packages/database`; contratos HTTP são schemas Zod de `@my-learning/contracts`.
- Carregue o `.env` raiz com `process.loadEnvFile()`; não instale `dotenv`.
- Use `America/Sao_Paulo` para calendário e timestamps ISO 8601 UTC para instantes.
- Use shadcn com Base UI, estilo `base-nova`, cor base neutral, variáveis CSS, Lucide e sem modo escuro; preserve as classes geradas.
- A interface é PT-BR, abre no Dashboard, não possui landing page ou hero e deve funcionar em `1366x768` e `390x844`.
- Referências: `docs/superpowers/specs/2026-07-29-learning-platform-mvp-design.md`, `docs/requirements/requisitos-transversais-da-plataforma-2026-07-29.md` e `docs/adr/0001-monorepo-with-separate-web-and-api.md`.

## Exact Dependency Pins

| Área | Pacotes e versões |
| --- | --- |
| API | `fastify@5.11.0`, `@fastify/cors@11.3.0`, `@fastify/multipart@10.1.0`, `fastify-plugin@6.0.0`, `@fastify/type-provider-zod@1.0.0`, `pino-pretty@13.1.3` |
| Dados | `prisma@7.9.1`, `@prisma/client@7.9.1`, `@prisma/adapter-better-sqlite3@7.9.1`, `better-sqlite3@13.0.2`, `@types/better-sqlite3@7.6.13` |
| Contratos e tempo | `zod@4.4.3`, `date-fns@4.4.0`, `@date-fns/tz@1.5.0` |
| Web | `next@16.2.12`, `react@19.2.8`, `react-dom@19.2.8`, `@tanstack/react-query@5.101.4`, `react-hook-form@7.83.0`, `@hookform/resolvers@5.5.7` |
| UI | `tailwindcss@4.3.3`, `@tailwindcss/postcss@4.3.3`, `@base-ui/react@1.6.0`, `lucide-react@1.28.0`, `sonner@2.0.7`, `class-variance-authority@0.7.1`, `clsx@2.1.1`, `tailwind-merge@3.6.0`, `tw-animate-css@1.4.0` |
| Ordenação | `@dnd-kit/core@6.3.1`, `@dnd-kit/sortable@10.0.0`, `@dnd-kit/utilities@3.2.2` |
| Execução e qualidade | `tsx@4.23.1`, `typescript@7.0.2`, `turbo@2.10.6`, `eslint@10.8.0`, `@eslint/js@10.0.1`, `typescript-eslint@8.65.0`, `eslint-config-next@16.2.12`, `prettier@3.9.6` |
| Testes | `vitest@4.1.10`, `@vitest/coverage-v8@4.1.10`, `@vitejs/plugin-react@6.0.5`, `jsdom@30.0.1`, `@testing-library/react@16.3.2`, `@testing-library/user-event@14.6.1`, `@testing-library/jest-dom@7.0.0`, `@playwright/test@1.62.1`, `@axe-core/playwright@4.12.1` |
| Tipos | `@types/node@26.1.2`, `@types/react@19.2.18`, `@types/react-dom@19.2.4` |

Use `shadcn@4.16.1` apenas como CLI fixada. Distribua cada pacote no manifesto do workspace que o importa e confirme que todos os valores gravados permanecem exatos.

---

## File Structure

```text
.
├── .env.example                 # Variáveis locais documentadas
├── .gitignore                   # Exclui bancos e saídas geradas
├── .npmrc                       # Versões exatas e scripts nativos permitidos
├── .nvmrc                       # Node 24
├── eslint.config.mjs            # ESLint flat compartilhado
├── package.json                 # Scripts raiz e packageManager
├── pnpm-workspace.yaml          # apps/* e packages/*
├── turbo.json                   # Grafo de tarefas e cache local
├── tsconfig.base.json           # TypeScript estrito compartilhado
├── apps/api/src/app.ts          # Montagem testável do Fastify
├── apps/api/src/server.ts       # Listen e encerramento gracioso
├── apps/api/src/config.ts       # Ambiente validado
├── apps/api/src/plugins/        # Prisma, CORS e tratamento de erros
├── apps/api/src/modules/system/ # Health e informações locais
├── apps/web/src/app/            # App Router e Dashboard inicial
├── apps/web/src/components/     # Layout e componentes shadcn
├── apps/web/src/lib/            # Cliente HTTP e QueryClient
├── packages/contracts/src/      # Schemas HTTP públicos
├── packages/domain/src/         # Regras puras iniciais
└── packages/database/           # Prisma schema, migrations e cliente
```

### Task 1: Bootstrap do workspace e quality gates

**Files:**
- Create: `.nvmrc`, `.npmrc`, `.gitignore`, `.env.example`, `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`, `eslint.config.mjs`, `.prettierrc.json`, `.prettierignore`
- Create: `apps/api/package.json`, `apps/api/tsconfig.json`, `apps/web/package.json`, `apps/web/tsconfig.json`
- Create: `packages/contracts/package.json`, `packages/contracts/tsconfig.json`, `packages/domain/package.json`, `packages/domain/tsconfig.json`, `packages/database/package.json`, `packages/database/tsconfig.json`
- Test: package manager, Turbo graph, lint, formatting and typecheck commands

**Interfaces:**
- Consumes: nenhuma implementação anterior.
- Produces: scripts raiz `dev`, `build`, `test`, `test:e2e`, `lint`, `typecheck`, `format`, `format:check`, `db:setup`; pacotes `@my-learning/contracts`, `@my-learning/domain`, `@my-learning/database`.

- [ ] **Step 1: Write the workspace manifests**

```json
{
  "name": "my-learning",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@11.18.0",
  "engines": { "node": ">=24 <25" },
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "test": "turbo test",
    "test:e2e": "pnpm --filter @my-learning/web test:e2e",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "db:setup": "pnpm --filter @my-learning/database db:setup"
  },
  "devDependencies": {
    "@eslint/js": "10.0.1",
    "eslint": "10.8.0",
    "prettier": "3.9.6",
    "turbo": "2.10.6",
    "typescript": "7.0.2",
    "typescript-eslint": "8.65.0"
  },
  "pnpm": {
    "onlyBuiltDependencies": ["@prisma/engines", "better-sqlite3", "prisma"]
  }
}
```

```yaml
# pnpm-workspace.yaml
packages:
  - apps/*
  - packages/*
```

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "dev": { "dependsOn": ["^build"], "cache": false, "persistent": true },
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**", ".next/**", "!.next/cache/**"] },
    "test": { "dependsOn": ["^build"], "outputs": ["coverage/**"] },
    "lint": { "dependsOn": ["^build"] },
    "typecheck": { "dependsOn": ["^build"] }
  }
}
```

Workspace scripts are exact: shared packages use `dev: "tsc --watch"`, `build: "tsc"`, `test: "vitest run"`, `lint: "eslint src"`, `typecheck: "tsc --noEmit"`; API uses `dev: "tsx watch src/server.ts"` and the same build/test/lint/typecheck commands; web uses `dev: "next dev --port 3000"`, `build: "next build"`, `test: "vitest run"`, `test:e2e: "playwright test"`, `lint: "eslint src e2e"`, `typecheck: "tsc --noEmit"`. Each shared package exports only `{ "types": "./dist/index.d.ts", "import": "./dist/index.js" }` from `.`.

- [ ] **Step 2: Install the exact dependency graph**

Run: `pnpm install`  
Expected: `pnpm-lock.yaml` criado sem intervalos adicionados aos manifests.

- [ ] **Step 3: Verify the workspace graph**

Run: `pnpm turbo build --dry=json`  
Expected: cinco workspaces detectados e nenhuma referência a cache remoto.

- [ ] **Step 4: Run the initial quality gates**

Run: `pnpm format:check`  
Run: `pnpm lint`  
Run: `pnpm typecheck`  
Expected: cada comando sai com código `0`.

- [ ] **Step 5: Commit**

```bash
git add .nvmrc .npmrc .gitignore .env.example package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json eslint.config.mjs .prettierrc.json .prettierignore apps packages
git commit -m "build: bootstrap pnpm turbo workspace"
```

### Task 2: Pacotes de contratos e domínio

**Files:**
- Create: `packages/contracts/src/common/index.ts`, `packages/contracts/src/system/index.ts`, `packages/contracts/src/index.ts`
- Create: `packages/contracts/src/common/index.test.ts`, `packages/contracts/src/system/index.test.ts`
- Create: `packages/domain/src/resources/status.ts`, `packages/domain/src/trails/progress.ts`, `packages/domain/src/trails/active-trail.ts`, `packages/domain/src/index.ts`
- Create: `packages/domain/src/resources/status.test.ts`, `packages/domain/src/trails/progress.test.ts`, `packages/domain/src/trails/active-trail.test.ts`

**Interfaces:**
- Consumes: aliases de pacote e Vitest da Task 1.
- Produces: `resourceCategorySchema`, `resourceFormatSchema`, `resourceStatusSchema`, `apiErrorSchema`, `healthResponseSchema`, `calculateTrailProgress()`, `isActiveTrail()`, `assertStatusTransition()`.

- [ ] **Step 1: Write failing domain tests**

```ts
import { describe, expect, it } from "vitest";
import { calculateTrailProgress, type ResourceStatus, type TrailProgress } from "./progress.js";

describe("calculateTrailProgress", () => {
  const cases: Array<[ResourceStatus[], TrailProgress]> = [
    [[], { completedResources: 0, totalResources: 0, percentage: 0, isComplete: false }],
    [["COMPLETED", "IN_PROGRESS", "COMPLETED"], { completedResources: 2, totalResources: 3, percentage: 67, isComplete: false }],
    [["COMPLETED"], { completedResources: 1, totalResources: 1, percentage: 100, isComplete: true }]
  ];
  it.each(cases)("derives progress from statuses", (statuses, expected) => {
    expect(calculateTrailProgress(statuses)).toEqual(expected);
  });
});
```

- [ ] **Step 2: Run the test to verify RED**

Run: `pnpm --filter @my-learning/domain test -- progress.test.ts`  
Expected: FAIL because `calculateTrailProgress` is not exported.

- [ ] **Step 3: Implement schemas and pure rules**

```ts
export type ResourceStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
export type TrailProgress = {
  completedResources: number;
  totalResources: number;
  percentage: number;
  isComplete: boolean;
};

export function calculateTrailProgress(statuses: readonly ResourceStatus[]) {
  const completedResources = statuses.filter((status) => status === "COMPLETED").length;
  const totalResources = statuses.length;
  return {
    completedResources,
    totalResources,
    percentage: totalResources === 0 ? 0 : Math.round((completedResources / totalResources) * 100),
    isComplete: totalResources > 0 && completedResources === totalResources
  };
}
```

```ts
import { z } from "zod";

export const resourceCategorySchema = z.enum(["MATERIAL", "PRACTICE"]);
export const resourceStatusSchema = z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"]);
export const resourceFormatSchema = z.enum([
  "COURSE", "DOCUMENTATION", "ARTICLE", "VIDEO", "BOOK", "OTHER",
  "QUESTION", "PROBLEM", "PROJECT", "FLASHCARD"
]);
export const apiErrorSchema = z.strictObject({
  error: z.strictObject({
    code: z.string(),
    message: z.string(),
    fieldErrors: z.record(z.string(), z.array(z.string())).optional()
  })
});
```

- [ ] **Step 4: Run package tests and builds**

Run: `pnpm --filter @my-learning/contracts test`  
Run: `pnpm --filter @my-learning/domain test`  
Run: `pnpm --filter @my-learning/contracts build`  
Run: `pnpm --filter @my-learning/domain build`  
Expected: PASS and public declarations emitted under each `dist/`.

- [ ] **Step 5: Commit**

```bash
git add packages/contracts packages/domain
git commit -m "feat: add shared contracts and trail rules"
```

### Task 3: Prisma schema, migration and client lifecycle

**Files:**
- Create: `packages/database/prisma/schema.prisma`, `packages/database/prisma.config.ts`, `packages/database/src/client.ts`, `packages/database/src/index.ts`, `packages/database/scripts/setup.ts`, `packages/database/src/client.test.ts`
- Create: `packages/database/prisma/migrations/*_initial_schema/migration.sql`, `data/.gitkeep`
- Modify: `.gitignore`, `.env.example`

**Interfaces:**
- Consumes: root environment rules from Task 1.
- Produces: `createPrismaClient(databasePath: string): PrismaClient`, all five persisted entities and `pnpm db:setup`.

- [ ] **Step 1: Write a failing isolated database test**

```ts
it("enables foreign keys and cascades a trail", async () => {
  const db = await createTemporaryDatabase();
  const trail = await db.trail.create({ data: { title: "Backend" } });
  await db.resource.create({ data: { trailId: trail.id, title: "HTTP", category: "MATERIAL", format: "ARTICLE", status: "NOT_STARTED", position: 1 } });
  await db.trail.delete({ where: { id: trail.id } });
  await expect(db.resource.count()).resolves.toBe(0);
});
```

- [ ] **Step 2: Run the test to verify RED**

Run: `pnpm --filter @my-learning/database test -- client.test.ts`  
Expected: FAIL because the Prisma client and migration do not exist.

- [ ] **Step 3: Define the complete MVP schema**

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "sqlite"
}

enum ResourceCategory {
  MATERIAL
  PRACTICE
}

enum ResourceFormat {
  COURSE
  DOCUMENTATION
  ARTICLE
  VIDEO
  BOOK
  OTHER
  QUESTION
  PROBLEM
  PROJECT
  FLASHCARD
}

enum ResourceStatus {
  NOT_STARTED
  IN_PROGRESS
  COMPLETED
}

model Trail {
  id          String     @id @default(uuid())
  title       String
  description String?
  goal        String?
  resources   Resource[]
  createdAt   DateTime   @default(now()) @map("created_at")
  updatedAt   DateTime   @default(now()) @updatedAt @map("updated_at")
  @@index([updatedAt])
  @@map("trails")
}

model Resource {
  id             String               @id @default(uuid())
  trailId        String               @map("trail_id")
  trail          Trail                @relation(fields: [trailId], references: [id], onDelete: Cascade)
  title          String
  description    String?
  category       ResourceCategory
  format         ResourceFormat
  status         ResourceStatus       @default(NOT_STARTED)
  position       Int
  url            String?
  prompt         String?
  flashcardFront String?               @map("flashcard_front")
  flashcardBack  String?               @map("flashcard_back")
  answer         PracticeAnswer?
  requirements   ProjectRequirement[]
  createdAt      DateTime             @default(now()) @map("created_at")
  updatedAt      DateTime             @default(now()) @updatedAt @map("updated_at")
  @@unique([trailId, position])
  @@index([status, updatedAt])
  @@index([trailId, updatedAt])
  @@map("resources")
}

model PracticeAnswer {
  id        String   @id @default(uuid())
  resourceId String  @unique @map("resource_id")
  resource  Resource @relation(fields: [resourceId], references: [id], onDelete: Cascade)
  answer    String
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @default(now()) @updatedAt @map("updated_at")
  @@map("practice_answers")
}

model ProjectRequirement {
  id          String   @id @default(uuid())
  resourceId  String   @map("resource_id")
  resource    Resource @relation(fields: [resourceId], references: [id], onDelete: Cascade)
  text        String
  position    Int
  isCompleted Boolean  @default(false) @map("is_completed")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @default(now()) @updatedAt @map("updated_at")
  @@unique([resourceId, position])
  @@map("project_requirements")
}

model StudyCheckIn {
  id              String   @id @default(uuid())
  localDate       String   @unique @map("local_date")
  note            String?
  durationMinutes Int?     @map("duration_minutes")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @default(now()) @updatedAt @map("updated_at")
  @@map("study_check_ins")
}
```

Configure `@prisma/adapter-better-sqlite3` and execute `PRAGMA foreign_keys = ON`, `PRAGMA journal_mode = WAL` and `PRAGMA busy_timeout = 5000` when the client is created.

- [ ] **Step 4: Generate and apply the migration**

Run: `pnpm db:setup`  
Expected: `data/my-learning.db` created, migration applied and Prisma client generated; the database file remains ignored.

- [ ] **Step 5: Run the database test**

Run: `pnpm --filter @my-learning/database test -- client.test.ts`  
Expected: PASS using a temporary SQLite file, never `data/my-learning.db`.

- [ ] **Step 6: Commit**

```bash
git add .env.example .gitignore data/.gitkeep packages/database
git commit -m "feat: add sqlite prisma foundation"
```

### Task 4: Fastify application core and health endpoint

**Files:**
- Create: `apps/api/src/config.ts`, `apps/api/src/app.ts`, `apps/api/src/server.ts`
- Create: `apps/api/src/shared/clock.ts`, `apps/api/src/shared/errors/app-error.ts`
- Create: `apps/api/src/plugins/cors.ts`, `apps/api/src/plugins/prisma.ts`, `apps/api/src/plugins/error-handler.ts`
- Create: `apps/api/src/modules/system/routes.ts`, `controller.ts`, `service.ts`, `repository.ts`
- Test: `apps/api/src/modules/system/system.test.ts`, `apps/api/src/config.test.ts`

**Interfaces:**
- Consumes: `createPrismaClient()`, `healthResponseSchema`, root `.env`.
- Produces: `buildApp(options?)`, `Clock`, `AppError`, `GET /api/v1/health`, `GET /api/v1/system/info`.

- [ ] **Step 1: Write the failing health integration test**

```ts
it("returns health only after a SQLite probe", async () => {
  const app = await buildTestApp();
  const response = await app.inject({ method: "GET", url: "/api/v1/health" });
  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual({ status: "ok" });
  await app.close();
});
```

- [ ] **Step 2: Run the test to verify RED**

Run: `pnpm --filter @my-learning/api test -- system.test.ts`  
Expected: FAIL because `buildApp` is absent.

- [ ] **Step 3: Implement explicit composition and error handling**

```ts
export type Clock = { now(): Date };
export const systemClock: Clock = { now: () => new Date() };

export type AppErrorOptions = {
  code: string;
  message: string;
  statusCode: number;
  fieldErrors?: Record<string, string[]>;
};

export class AppError extends Error {
  constructor(readonly options: AppErrorOptions) {
    super(options.message);
  }
}
```

```ts
export async function buildApp(options: BuildAppOptions = {}) {
  const app = Fastify({ logger: options.logger ?? process.env.NODE_ENV !== "test" })
    .withTypeProvider<ZodTypeProvider>();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  await app.register(corsPlugin);
  await app.register(prismaPlugin, { databasePath: options.databasePath });
  await app.register(errorHandlerPlugin);
  await app.register(systemRoutes, { prefix: "/api/v1" });
  return app;
}
```

`server.ts` must call `process.loadEnvFile(rootEnvPath)`, listen using `API_HOST`/`API_PORT`, and call `app.close()` on `SIGINT` and `SIGTERM`. The global handler maps Zod/Fastify validation to `400` or `422`, `AppError` to its status, known Prisma conflicts to `409`, missing records to `404`, and unexpected failures to `500` without exposing Prisma details.

- [ ] **Step 4: Run API tests**

Run: `pnpm --filter @my-learning/api test`  
Expected: PASS for health, system info, strict environment validation and the standard error envelope.

- [ ] **Step 5: Commit**

```bash
git add apps/api packages/contracts
git commit -m "feat: add fastify application core"
```

### Task 5: Next.js, shadcn and operational shell

**Files:**
- Create: `apps/web/components.json`, `apps/web/postcss.config.mjs`, `apps/web/next.config.ts`, `apps/web/vitest.config.ts`
- Create: `apps/web/src/app/layout.tsx`, `apps/web/src/app/page.tsx`, `apps/web/src/app/globals.css`
- Create: `apps/web/src/components/layout/app-shell.tsx`, `apps/web/src/components/layout/sidebar.tsx`, `apps/web/src/components/layout/mobile-navigation.tsx`
- Create: `apps/web/src/components/ui/*` generated by shadcn for Button, Sheet, Tooltip, Alert, Card, Sonner
- Create: `apps/web/src/lib/api/client.ts`, `apps/web/src/lib/query/provider.tsx`, `apps/web/src/lib/utils.ts`
- Test: `apps/web/src/components/layout/app-shell.test.tsx`, `apps/web/src/lib/api/client.test.ts`

**Interfaces:**
- Consumes: `/api/v1/health`, `apiErrorSchema`, `NEXT_PUBLIC_API_URL`.
- Produces: `ApiClient`, `QueryProvider`, fixed desktop navigation and mobile Sheet navigation.

- [ ] **Step 1: Write failing shell and API client tests**

```tsx
it("renders the operational destinations", () => {
  render(<AppShell><main>Conteúdo</main></AppShell>);
  expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("href", "/");
  expect(screen.getByRole("link", { name: "Trilhas" })).toHaveAttribute("href", "/trilhas");
  expect(screen.getByRole("link", { name: "Histórico" })).toHaveAttribute("href", "/historico");
  expect(screen.getByRole("link", { name: "Configurações" })).toHaveAttribute("href", "/configuracoes");
});
```

- [ ] **Step 2: Run the tests to verify RED**

Run: `pnpm --filter @my-learning/web test -- app-shell.test.tsx client.test.ts`  
Expected: FAIL because the shell and client do not exist.

- [ ] **Step 3: Initialize and generate shadcn components**

Run from `apps/web`: `pnpm dlx shadcn@4.16.1 init --style base-nova --base-color neutral --css-variables`  
Expected: `components.json` uses `style: "base-nova"`, `iconLibrary: "lucide"`, `rsc: true`, alias `@/components`, and generated styles retain shadcn defaults.

Run from `apps/web`: `pnpm dlx shadcn@4.16.1 add button sheet tooltip alert card sonner`  
Expected: components generated only under `src/components/ui`.

- [ ] **Step 4: Implement the shell and validated client**

```ts
export async function apiRequest<T>(path: string, schema: z.ZodType<T>, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body !== undefined && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    ...init,
    signal: init?.signal ?? AbortSignal.timeout(15_000),
    headers
  });
  if (!response.ok) throw await parseApiError(response);
  return schema.parse(await response.json());
}
```

In `next.config.ts`, resolve the monorepo root and call `process.loadEnvFile(path.join(root, ".env"))` before exporting the Next configuration. Configure TanStack Query with `retry: 1`, `staleTime: 30_000`, `refetchOnWindowFocus: true` and mutations without retry. `page.tsx` renders heading `Dashboard`, a compact health state and operational empty states; it must not render marketing copy.

- [ ] **Step 5: Run component tests and responsive smoke**

Run: `pnpm --filter @my-learning/web test`  
Expected: PASS for desktop links, mobile menu accessible name, error parsing, 15-second timeout and QueryClient defaults.

- [ ] **Step 6: Commit**

```bash
git add apps/web packages/contracts
git commit -m "feat: add next shadcn application shell"
```

### Task 6: Foundation verification and local runbook

**Files:**
- Create: `README.md`
- Create: `apps/web/e2e/foundation.spec.ts`, `apps/web/playwright.config.ts`
- Modify: package manifests only if verification exposes a missing script

**Interfaces:**
- Consumes: all deliverables in Tasks 1-5.
- Produces: reproducible local setup and a browser-level health check.

- [ ] **Step 1: Add the failing browser smoke test**

```ts
test("opens directly on the operational Dashboard", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Trilhas" })).toBeVisible();
  await expect(page.locator("main")).not.toHaveCSS("overflow-x", "scroll");
});
```

- [ ] **Step 2: Document deterministic local startup**

Document Node 24, Corepack/pnpm 11.18.0, `pnpm install`, copy of `.env.example` to `.env`, `pnpm db:setup`, `pnpm dev`, web `http://localhost:3000`, API `http://127.0.0.1:3001`, database `data/my-learning.db`, and the root quality commands.

- [ ] **Step 3: Run every foundation gate**

Run: `pnpm format:check`  
Run: `pnpm lint`  
Run: `pnpm typecheck`  
Run: `pnpm test`  
Run: `pnpm build`  
Expected: cada comando sai com código `0`.

Run: `pnpm test:e2e -- --project=chromium`  
Expected: PASS at desktop `1366x768` and mobile `390x844`; screenshots show no overlap or horizontal page overflow.

- [ ] **Step 4: Verify forbidden dependencies and Prisma boundaries**

Run: `pnpm why nestjs express dotenv`  
Expected: no NestJS, Express or dotenv package.

Run: `rg -n "@prisma|@my-learning/database" apps/web packages/contracts packages/domain`  
Expected: no matches.

- [ ] **Step 5: Commit**

```bash
git add README.md apps/web/e2e apps/web/playwright.config.ts
git commit -m "test: verify local application foundation"
```

## Acceptance Gate

- `pnpm db:setup` creates a usable SQLite database from migrations.
- `pnpm dev` starts shared watchers, Fastify on port `3001` and Next.js on port `3000`.
- `/api/v1/health` performs a database probe and returns `{ "status": "ok" }`.
- `/api/v1/system/info` returns absolute `databasePath`, `timeZone: "America/Sao_Paulo"` and `snapshotFormatVersion: "1.0.0"`.
- Dashboard is the first screen; desktop sidebar and mobile navigation expose all four destinations.
- Lint, typecheck, unit/integration tests, build and foundation E2E pass.
