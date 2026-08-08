# Vibrant UI Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Repaginar toda a interface web do My Learning com a direção visual “Foco vibrante”, priorizando desktop, mantendo os fluxos atuais e reduzindo estilos duplicados.

**Architecture:** Centralizar cores, raios e estados semânticos em tokens Tailwind; construir primitivos shadcn pequenos e padrões compartilhados; manter os hooks React Query e as regras de domínio dentro das features existentes. Migrar cada área de forma incremental, com testes de semântica e interação antes de cada alteração visual.

**Tech Stack:** Next.js 16.2.12, React 19.2.8, TypeScript, Tailwind CSS 4.3.3, shadcn 4.16.1/Base UI, Lucide React 1.28.0, TanStack Query 5.101.4, Vitest 4.1.10, Testing Library, Playwright 1.62.1 e Axe.

## Global Constraints

- Não alterar API, contratos compartilhados, banco de dados ou regras de domínio.
- Não adicionar dependências; usar apenas Tailwind, shadcn/Base UI e Lucide já instalados.
- Manter Geist como fonte única da aplicação.
- Usar violeta como cor primária, âmbar para `Em andamento`, verde para `Concluído` e cinza para `Não iniciado`.
- Usar ícones Lucide; botões somente com ícone precisam de `aria-label` e tooltip.
- Desktop em `1366×768` é a experiência principal; mobile em `390×844` deve continuar funcional e sem rolagem horizontal.
- Preservar modo claro, modo escuro, navegação por teclado, foco visível e verificações Axe.
- Manter React Query como responsável por carregamento, erro, cache e invalidação.
- Manter o arquivo não relacionado `docs/superpowers/plans/2026-08-07-bug-remediation.md` fora de todos os commits desta implementação.

## Planned File Structure

| Área | Arquivos | Responsabilidade |
| --- | --- | --- |
| Tokens | `apps/web/src/app/globals.css` | Cores, estados, sidebar, foco, raios e superfícies dos temas claro e escuro. |
| Primitivos | `apps/web/src/components/ui/{input,textarea,native-select,progress,skeleton}.tsx` | Controles e feedback sem conhecimento do domínio. |
| Padrões | `apps/web/src/components/shared/{form-field,page-header,empty-state,stat-card,status-badge}.tsx` | Composições reutilizáveis com interfaces pequenas. |
| Shell | `apps/web/src/components/layout/*` e `apps/web/src/features/dashboard/sidebar-shortcut.tsx` | Sidebar desktop, navegação móvel, rota ativa, tema e atalho contextual. |
| Dashboard | `apps/web/src/features/dashboard/dashboard-view.tsx`, `apps/web/src/features/check-ins/check-in-form.tsx` | Hierarquia operacional, métricas, continuidade, check-in e trilhas ativas. |
| Trilhas | `apps/web/src/features/trails/*`, `apps/web/src/features/resources/resource-order-list.tsx` | Lista, detalhe, progresso, estado vazio e ordenação de recursos. |
| Formulários | Pages de criação/edição e formulários de trilha/recurso | Campos shadcn, cabeçalhos, descrições, erros e estados de envio. |
| Recursos | `resource-detail.tsx`, `resource-status.tsx`, `resource-conversion.tsx`, `practice-answer.tsx` | Detalhe em cards, status semântico e ações existentes. |
| Histórico/configurações | `check-in-history.tsx`, `settings-view.tsx` e pages | Timeline, cards de operação local, skeletons e estados vazios. |
| Qualidade | `apps/web/e2e/*.spec.ts` | Viewports, tema, navegação, fluxos críticos, overflow e Axe. |

---

### Task 1: Establish visual tokens and UI primitives

**Files:**
- Modify: `apps/web/src/app/globals.css`
- Modify: `apps/web/src/app/layout.tsx`
- Create: `apps/web/src/components/ui/input.tsx`
- Create: `apps/web/src/components/ui/textarea.tsx`
- Create: `apps/web/src/components/ui/native-select.tsx`
- Create: `apps/web/src/components/ui/progress.tsx`
- Create: `apps/web/src/components/ui/skeleton.tsx`
- Create: `apps/web/src/components/ui/primitives.test.tsx`

**Interfaces:**
- Produces: `Input`, `Textarea`, `NativeSelect`, `Progress({ value, label, className })` e `Skeleton`.
- Produces: classes Tailwind `bg-status-in-progress`, `text-status-in-progress-foreground`, `border-status-in-progress-border` e equivalentes para os três status.

- [ ] **Step 1: Write the failing primitive semantics test**

```tsx
import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { Input } from "./input";
import { NativeSelect } from "./native-select";
import { Progress } from "./progress";
import { Textarea } from "./textarea";

it("forwards form semantics and exposes progress accessibly", () => {
  render(
    <>
      <Input aria-label="Título" aria-invalid />
      <Textarea aria-label="Descrição" />
      <NativeSelect aria-label="Categoria" defaultValue="MATERIAL">
        <option value="MATERIAL">Material</option>
      </NativeSelect>
      <Progress label="Progresso da trilha" value={68} />
    </>,
  );

  expect(screen.getByLabelText("Título")).toHaveAttribute("aria-invalid", "true");
  expect(screen.getByLabelText("Descrição").tagName).toBe("TEXTAREA");
  expect(screen.getByLabelText("Categoria")).toHaveValue("MATERIAL");
  expect(screen.getByRole("progressbar", { name: "Progresso da trilha" })).toHaveAttribute("aria-valuenow", "68");
});
```

- [ ] **Step 2: Run the test and verify the modules are missing**

Run: `rtk pnpm --filter @my-learning/web exec vitest run src/components/ui/primitives.test.tsx`

Expected: FAIL because `./input`, `./native-select`, `./progress` and `./textarea` do not exist.

- [ ] **Step 3: Add the typed primitives**

Use the same `cn` pattern already used by `Button` and `Card`:

```tsx
// input.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return <input type={type} data-slot="input" className={cn("h-9 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 aria-invalid:border-destructive aria-invalid:ring-destructive/20 disabled:cursor-not-allowed disabled:opacity-50", className)} {...props} />;
}

export { Input };
```

```tsx
// textarea.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea data-slot="textarea" className={cn("min-h-24 w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 aria-invalid:border-destructive aria-invalid:ring-destructive/20 disabled:cursor-not-allowed disabled:opacity-50", className)} {...props} />;
}

export { Textarea };
```

`NativeSelect` must render a real `<select>` so React Hook Form registration and Playwright `selectOption` remain unchanged. `Progress` must clamp values from 0 through 100 and render `role="progressbar"`. `Skeleton` must render `aria-hidden="true"` with `animate-pulse rounded-lg bg-muted`.

```tsx
export function NativeSelect({ className, ...props }: React.ComponentProps<"select">) {
  return <select data-slot="native-select" className={cn("h-9 w-full appearance-none rounded-lg border border-input bg-background px-3 pr-9 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 disabled:opacity-50", className)} {...props} />;
}

export function Progress({ value, label, className }: { value: number; label: string; className?: string }) {
  const normalized = Math.min(100, Math.max(0, value));
  return <div aria-label={label} aria-valuemax={100} aria-valuemin={0} aria-valuenow={normalized} className={cn("h-2 overflow-hidden rounded-full bg-primary/10", className)} role="progressbar"><div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${normalized}%` }} /></div>;
}

export function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <div aria-hidden="true" data-slot="skeleton" className={cn("animate-pulse rounded-lg bg-muted", className)} {...props} />;
}
```

- [ ] **Step 4: Replace the neutral palette with Foco vibrante tokens**

Add semantic variables to both `:root` and `.dark`, then expose them through `@theme inline`:

```css
:root {
  --primary: oklch(0.541 0.281 293.009);
  --primary-foreground: oklch(0.985 0 0);
  --background: oklch(0.982 0.004 286.32);
  --status-not-started: oklch(0.968 0.007 247.896);
  --status-not-started-foreground: oklch(0.372 0.044 257.287);
  --status-not-started-border: oklch(0.869 0.022 252.894);
  --status-in-progress: oklch(0.962 0.059 95.617);
  --status-in-progress-foreground: oklch(0.414 0.112 45.904);
  --status-in-progress-border: oklch(0.828 0.189 84.429);
  --status-completed: oklch(0.962 0.044 156.743);
  --status-completed-foreground: oklch(0.393 0.095 152.535);
  --status-completed-border: oklch(0.845 0.143 164.978);
  --radius: 0.75rem;
}

.dark {
  --primary: oklch(0.702 0.183 293.541);
  --primary-foreground: oklch(0.21 0.034 264.665);
  --background: oklch(0.145 0.018 285.82);
  --status-not-started: oklch(0.279 0.041 260.031);
  --status-not-started-foreground: oklch(0.869 0.022 252.894);
  --status-not-started-border: oklch(0.446 0.043 257.281);
  --status-in-progress: oklch(0.279 0.077 45.635);
  --status-in-progress-foreground: oklch(0.924 0.12 95.746);
  --status-in-progress-border: oklch(0.555 0.163 48.998);
  --status-completed: oklch(0.266 0.065 152.934);
  --status-completed-foreground: oklch(0.905 0.093 164.15);
  --status-completed-border: oklch(0.527 0.154 150.069);
}

@theme inline {
  --color-status-not-started: var(--status-not-started);
  --color-status-not-started-foreground: var(--status-not-started-foreground);
  --color-status-not-started-border: var(--status-not-started-border);
  --color-status-in-progress: var(--status-in-progress);
  --color-status-in-progress-foreground: var(--status-in-progress-foreground);
  --color-status-in-progress-border: var(--status-in-progress-border);
  --color-status-completed: var(--status-completed);
  --color-status-completed-foreground: var(--status-completed-foreground);
  --color-status-completed-border: var(--status-completed-border);
}
```

Remove the global `input`, `select` and `textarea` element rules so feature widths are controlled by the primitives. Keep only base body, border and color-scheme rules. Change the Sonner theme in `layout.tsx` from `light` to `system` and add `suppressHydrationWarning` to `<html>`.

- [ ] **Step 5: Run focused verification**

Run: `rtk pnpm --filter @my-learning/web exec vitest run src/components/ui/primitives.test.tsx`

Expected: PASS with 1 test.

Run: `rtk pnpm --filter @my-learning/web typecheck`

Expected: exit 0.

- [ ] **Step 6: Commit the foundation**

```powershell
rtk git add -- apps/web/src/app/globals.css apps/web/src/app/layout.tsx apps/web/src/components/ui
rtk git commit -m "feat(web): add vibrant visual foundation"
```

---

### Task 2: Build shared interface patterns

**Files:**
- Create: `apps/web/src/components/shared/form-field.tsx`
- Create: `apps/web/src/components/shared/page-header.tsx`
- Create: `apps/web/src/components/shared/empty-state.tsx`
- Create: `apps/web/src/components/shared/stat-card.tsx`
- Create: `apps/web/src/components/shared/status-badge.tsx`
- Create: `apps/web/src/components/shared/interface-patterns.test.tsx`

**Interfaces:**
- Produces: `FormField({ id, label, description?, error?, children })`.
- Produces: `PageHeader({ eyebrow, title, description?, icon, status?, actions?, breadcrumbs? })`.
- Produces: `EmptyState({ icon, title, description, action? })`.
- Produces: `StatCard({ icon, label, value, tone? })` where `tone` is `primary | info | success`.
- Produces: `StatusBadge({ status })` and `getStatusPresentation(status)` for `ResourceSummary["status"]`.

- [ ] **Step 1: Write failing tests for shared semantics**

```tsx
import { Map, Plus } from "lucide-react";
import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { Button } from "@/components/ui/button";
import { EmptyState } from "./empty-state";
import { PageHeader } from "./page-header";
import { StatusBadge } from "./status-badge";

it("renders page hierarchy, empty action and semantic status text", () => {
  render(
    <>
      <PageHeader eyebrow="Trilha" title="React avançado" description="Arquitetura" icon={Map} actions={<Button><Plus />Novo recurso</Button>} />
      <EmptyState icon={Map} title="Nenhum recurso ainda" description="Adicione o primeiro recurso." action={<Button>Adicionar recurso</Button>} />
      <StatusBadge status="NOT_STARTED" />
      <StatusBadge status="IN_PROGRESS" />
      <StatusBadge status="COMPLETED" />
    </>,
  );

  expect(screen.getByRole("heading", { level: 1, name: "React avançado" })).toBeVisible();
  expect(screen.getByRole("button", { name: "Adicionar recurso" })).toBeVisible();
  expect(screen.getByText("Não iniciado")).toBeVisible();
  expect(screen.getByText("Em andamento")).toBeVisible();
  expect(screen.getByText("Concluído")).toBeVisible();
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `rtk pnpm --filter @my-learning/web exec vitest run src/components/shared/interface-patterns.test.tsx`

Expected: FAIL because the shared modules do not exist.

- [ ] **Step 3: Implement the status mapping and shared layouts**

Use this single status mapping everywhere:

```tsx
const presentations = {
  NOT_STARTED: { label: "Não iniciado", className: "border-status-not-started-border bg-status-not-started text-status-not-started-foreground" },
  IN_PROGRESS: { label: "Em andamento", className: "border-status-in-progress-border bg-status-in-progress text-status-in-progress-foreground" },
  COMPLETED: { label: "Concluído", className: "border-status-completed-border bg-status-completed text-status-completed-foreground" },
} satisfies Record<ResourceSummary["status"], { label: string; className: string }>;

export function StatusBadge({ status }: { status: ResourceSummary["status"] }) {
  const item = getStatusPresentation(status);
  return <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold", item.className)}><span aria-hidden className="size-1.5 rounded-full bg-current" />{item.label}</span>;
}

export function getStatusPresentation(status: ResourceSummary["status"]) {
  return presentations[status];
}
```

`PageHeader` must render a tinted `rounded-2xl border border-primary/15 bg-gradient-to-r from-primary/10 via-primary/5 to-card` surface, one `<h1>`, optional breadcrumb `<nav aria-label="Breadcrumb">`, and a wrapping action area. `EmptyState` must use `flex min-h-48 flex-col items-center justify-center text-center`. `FormField` must join description and error IDs in `aria-describedby` and set `aria-invalid` on its cloned control.

```tsx
const descriptionId = description ? `${id}-description` : undefined;
const errorId = error ? `${id}-error` : undefined;
const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;
const control = cloneElement(children, { id, "aria-describedby": describedBy, "aria-invalid": Boolean(error) });
```

- [ ] **Step 4: Add the compact metric card**

```tsx
export function StatCard({ icon: Icon, label, value, tone = "primary" }: StatCardProps) {
  const tones = { primary: "bg-primary/10 text-primary", info: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300", success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" };
  return <Card><CardContent className="flex items-center gap-3 p-4"><span className={cn("grid size-10 place-items-center rounded-xl", tones[tone])}><Icon aria-hidden className="size-5" /></span><div><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-xl font-semibold tracking-tight">{value}</p></div></CardContent></Card>;
}
```

- [ ] **Step 5: Run focused and frontend tests**

Run: `rtk pnpm --filter @my-learning/web exec vitest run src/components/shared/interface-patterns.test.tsx`

Expected: PASS with 1 test.

Run: `rtk pnpm --filter @my-learning/web test`

Expected: all current frontend tests pass.

- [ ] **Step 6: Commit the shared patterns**

```powershell
rtk git add -- apps/web/src/components/shared
rtk git commit -m "feat(web): add shared interface patterns"
```

---

### Task 3: Rebuild the desktop-first application shell

**Files:**
- Modify: `apps/web/src/components/layout/app-shell.tsx`
- Modify: `apps/web/src/components/layout/sidebar.tsx`
- Modify: `apps/web/src/components/layout/mobile-navigation.tsx`
- Modify: `apps/web/src/components/layout/app-shell.test.tsx`
- Create: `apps/web/src/features/dashboard/sidebar-shortcut.tsx`

**Interfaces:**
- Consumes: `Card`, `Button`, `ThemeToggle` and `useDashboard()`.
- Produces: `NavigationLinks({ onNavigate? })` with route-derived `aria-current="page"`.
- Produces: `ContinueStudyingShortcut()` that renders only when Dashboard has a next resource.

- [ ] **Step 1: Extend the shell test with route state and shortcut behavior**

Mock `usePathname` as `/trilhas` and `useDashboard` with one `continueStudying` item, then assert:

```tsx
expect(screen.getByRole("link", { name: "Trilhas" })).toHaveAttribute("aria-current", "page");
expect(screen.getByRole("link", { name: /Continuar HTTP/ })).toHaveAttribute("href", "/recursos/550e8400-e29b-41d4-a716-446655440001");
```

Keep the existing mobile open, Escape and close-on-navigation tests. Wrap `AppShell` with `QueryClientProvider` only if the mocked hook still requires a client.

- [ ] **Step 2: Run the shell test and verify the new assertions fail**

Run: `rtk pnpm --filter @my-learning/web exec vitest run src/components/layout/app-shell.test.tsx`

Expected: FAIL because links do not expose route state and no shortcut exists.

- [ ] **Step 3: Add icon-aware route navigation**

Use one destination definition and exact active matching:

```tsx
const destinations = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/trilhas", label: "Trilhas", icon: Map },
  { href: "/historico", label: "Histórico", icon: History },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
] as const;

const isActive = (pathname: string, href: string) => href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
```

Each link renders its Lucide icon with `aria-hidden`, uses `aria-current` when active, and applies `bg-sidebar-accent text-sidebar-accent-foreground` only to the active route.

- [ ] **Step 4: Implement the conditional study shortcut**

```tsx
export function ContinueStudyingShortcut() {
  const dashboard = useDashboard();
  const next = dashboard.data?.continueStudying[0];
  if (!next) return null;
  return <div className="rounded-xl border border-primary/15 bg-primary/5 p-3"><p className="text-sm font-semibold">Pronto para estudar?</p><p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{next.resourceTitle}</p><Button className="mt-3 w-full" nativeButton={false} render={<Link href={`/recursos/${next.resourceId}`} aria-label={`Continuar ${next.resourceTitle}`} />} size="sm">Continuar estudando</Button></div>;
}
```

The desktop sidebar is fixed at `w-64`; the main wrapper uses `lg:ml-64`, `max-w-7xl` and responsive padding. Preserve the mobile `Sheet`, focus behavior and theme control.

- [ ] **Step 5: Run shell, type and accessibility-unit verification**

Run: `rtk pnpm --filter @my-learning/web exec vitest run src/components/layout/app-shell.test.tsx`

Expected: all shell tests pass.

Run: `rtk pnpm --filter @my-learning/web typecheck`

Expected: exit 0.

- [ ] **Step 6: Commit the shell**

```powershell
rtk git add -- apps/web/src/components/layout apps/web/src/features/dashboard/sidebar-shortcut.tsx
rtk git commit -m "feat(web): redesign application shell"
```

---

### Task 4: Recompose the Dashboard and daily check-in

**Files:**
- Modify: `apps/web/src/app/page.tsx`
- Modify: `apps/web/src/features/dashboard/dashboard-view.tsx`
- Modify: `apps/web/src/features/dashboard/dashboard-view.test.tsx`
- Modify: `apps/web/src/features/check-ins/check-in-form.tsx`
- Modify: `apps/web/src/features/check-ins/check-in-form.test.tsx`
- Create: `apps/web/src/features/resources/resource-icon.tsx`

**Interfaces:**
- Consumes: `PageHeader`, `StatCard`, `StatusBadge`, `Progress`, `Skeleton`, `Card` and `EmptyState`.
- Produces: `ResourceIcon({ format, className? })` shared by Dashboard, Trail and Resource screens.
- Preserves: `DashboardView({ dashboard: DashboardResponse })` and `CheckInForm(CurrentCheckInResponse)`.

- [ ] **Step 1: Expand Dashboard expectations before changing JSX**

Use a fixture containing one active trail and one resource, then assert:

```tsx
expect(screen.getByRole("heading", { level: 1, name: "Seu aprendizado, em movimento." })).toBeVisible();
expect(screen.getByText("2 dias")).toBeVisible();
expect(screen.getByText("4 dias")).toBeVisible();
expect(screen.getByRole("link", { name: /HTTP/ })).toHaveAttribute("href", "/recursos/550e8400-e29b-41d4-a716-446655440001");
expect(screen.getByRole("progressbar", { name: "Progresso de Web" })).toHaveAttribute("aria-valuenow", "50");
expect(screen.getByRole("heading", { name: "Check-in de hoje" })).toBeVisible();
```

Add a second test with empty arrays and assert the two useful empty-state messages rather than blank sections.

- [ ] **Step 2: Run Dashboard tests and verify the new hierarchy fails**

Run: `rtk pnpm --filter @my-learning/web exec vitest run src/features/dashboard/dashboard-view.test.tsx src/features/check-ins/check-in-form.test.tsx`

Expected: FAIL on the new heading, progressbar and empty-state messages.

- [ ] **Step 3: Implement the Dashboard grid**

Compose, in order:

```tsx
<PageHeader eyebrow="Visão geral" title="Seu aprendizado, em movimento." description="Acompanhe sua consistência e retome o próximo conteúdo." icon={Sparkles} actions={<NewTrailButton />} />
<section aria-label="Resumo" className="grid gap-3 md:grid-cols-3">
  <StatCard icon={Flame} label="Streak atual" value={`${dashboard.currentStreak} dias`} />
  <StatCard icon={Trophy} label="Melhor streak" value={`${dashboard.bestStreak} dias`} tone="info" />
  <StatCard icon={Map} label="Trilhas ativas" value={String(dashboard.activeTrails.length)} tone="success" />
</section>
<div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(20rem,.8fr)]">
  <ContinueStudyingCard items={dashboard.continueStudying} />
  <CheckInForm currentLocalDate={dashboard.currentLocalDate} checkIn={dashboard.checkIn} />
</div>
<ActiveTrailsCard trails={dashboard.activeTrails} />
```

Keep `ContinueStudyingCard` and `ActiveTrailsCard` private in `dashboard-view.tsx`; they receive arrays and do not call hooks. Render real links, resource icons, status text and accessible progress labels.

Implement the resource-icon mapping explicitly:

```tsx
const formatIcons = {
  COURSE: GraduationCap,
  DOCUMENTATION: BookOpenCheck,
  ARTICLE: Newspaper,
  VIDEO: Video,
  BOOK: BookOpen,
  OTHER: File,
  QUESTION: CircleHelp,
  PROBLEM: Puzzle,
  PROJECT: ListChecks,
  FLASHCARD: GalleryHorizontal,
} satisfies Record<ResourceSummary["format"], LucideIcon>;

export function ResourceIcon({ format, className }: { format: ResourceSummary["format"]; className?: string }) {
  const Icon = formatIcons[format];
  return <span className={cn("grid size-10 place-items-center rounded-xl bg-primary/10 text-primary", className)}><Icon aria-hidden className="size-5" /></span>;
}
```

- [ ] **Step 4: Restyle CheckInForm without changing its fields**

Wrap the existing duration, note and actions in a violet `Card`. Use `Input` for hours/minutes and `Textarea` for the note. Keep both fields visible. Preserve delete confirmation and field errors. In `page.tsx`, replace the loose loading paragraph with a three-card `Skeleton` layout and keep the existing `Alert` error.

- [ ] **Step 5: Run Dashboard regression tests**

Run: `rtk pnpm --filter @my-learning/web exec vitest run src/features/dashboard/dashboard-view.test.tsx src/features/check-ins/check-in-form.test.tsx`

Expected: all focused tests pass.

Run: `rtk pnpm --filter @my-learning/web test`

Expected: all frontend tests pass.

- [ ] **Step 6: Commit the Dashboard**

```powershell
rtk git add -- apps/web/src/app/page.tsx apps/web/src/features/dashboard apps/web/src/features/check-ins/check-in-form.tsx apps/web/src/features/check-ins/check-in-form.test.tsx apps/web/src/features/resources/resource-icon.tsx
rtk git commit -m "feat(web): redesign dashboard experience"
```

---

### Task 5: Redesign Trail list and detail screens

**Files:**
- Modify: `apps/web/src/app/trilhas/page.tsx`
- Modify: `apps/web/src/features/trails/trail-list.tsx`
- Create: `apps/web/src/features/trails/trail-list.test.tsx`
- Modify: `apps/web/src/features/trails/trail-detail.tsx`
- Modify: `apps/web/src/features/trails/trail-detail.test.tsx`
- Modify: `apps/web/src/features/resources/resource-order-list.tsx`
- Modify: `apps/web/src/features/resources/resource-order-list.test.tsx`

**Interfaces:**
- Consumes: `PageHeader`, `EmptyState`, `StatusBadge`, `Progress`, `ResourceIcon` and existing delete/reorder mutations.
- Changes internal `ResourceOrderList` item type to `Pick<ResourceSummary, "id" | "title" | "position" | "category" | "format" | "status">`.

- [ ] **Step 1: Add failing list and detail presentation tests**

Mock `getTrails` with one trail and assert a named progressbar and status text. Add the empty case and assert the `Criar trilha` link. For `TrailDetail`, mock `getTrail` and assert `Novo recurso`, `Progresso da trilha`, resource status text and the objective card.

```tsx
expect(screen.getByRole("progressbar", { name: "Progresso de React" })).toHaveAttribute("aria-valuenow", "68");
expect(screen.getByText("Em andamento")).toBeVisible();
expect(screen.getByRole("link", { name: "Criar trilha" })).toHaveAttribute("href", "/trilhas/nova");
```

- [ ] **Step 2: Run the Trail tests and verify failures**

Run: `rtk pnpm --filter @my-learning/web exec vitest run src/features/trails/trail-list.test.tsx src/features/trails/trail-detail.test.tsx src/features/resources/resource-order-list.test.tsx`

Expected: FAIL because cards, progressbars and the actionable empty state are absent.

- [ ] **Step 3: Implement the Trail index**

Move the page title and action into `PageHeader` with the `Map` icon. `TrailList` must render:

```tsx
const status = trail.isComplete ? "COMPLETED" : trail.isActive ? "IN_PROGRESS" : "NOT_STARTED";

<li className="rounded-xl border bg-card p-4 shadow-xs transition hover:border-primary/25 hover:shadow-sm">
  <Link className="block focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30" href={`/trilhas/${trail.id}`}>
    <div className="flex items-start justify-between gap-4"><div><h2 className="font-semibold">{trail.title}</h2><p className="mt-1 text-sm text-muted-foreground">{trail.goal ?? "Sem objetivo"}</p></div><StatusBadge status={status} /></div>
    <Progress className="mt-4" label={`Progresso de ${trail.title}`} value={trail.progress.percentage} />
  </Link>
</li>
```

Map `isComplete` to `COMPLETED`, `isActive` to `IN_PROGRESS`, and the remaining case to `NOT_STARTED`. Pending state uses three `Skeleton` rows; empty state uses `EmptyState` with `Criar trilha`.

- [ ] **Step 4: Implement Trail detail and resource rows**

Use `PageHeader` with breadcrumbs, derived status, `Editar`, `Novo recurso` and existing delete action. Render one summary card for progress/count and one context card for goal/description. `ResourceOrderList` keeps DnD and keyboard move buttons, but each row adds `ResourceIcon`, metadata and `StatusBadge`; all existing accessible move labels remain unchanged.

- [ ] **Step 5: Update resource-order fixtures and run regression**

Add `category`, `format` and `status` to every `ResourceOrderList` test item. Then run:

Run: `rtk pnpm --filter @my-learning/web exec vitest run src/features/trails src/features/resources/resource-order-list.test.tsx`

Expected: all focused tests pass, including reorder failure rollback and pending-state protection.

- [ ] **Step 6: Commit Trail screens**

```powershell
rtk git add -- apps/web/src/app/trilhas/page.tsx apps/web/src/features/trails apps/web/src/features/resources/resource-order-list.tsx apps/web/src/features/resources/resource-order-list.test.tsx
rtk git commit -m "feat(web): redesign trail screens"
```

---

### Task 6: Standardize creation and editing forms

**Files:**
- Modify: `apps/web/src/app/trilhas/nova/page.tsx`
- Modify: `apps/web/src/features/trails/trail-edit.tsx`
- Modify: `apps/web/src/features/trails/trail-form.tsx`
- Modify: `apps/web/src/features/trails/trail-form.test.tsx`
- Modify: `apps/web/src/app/trilhas/[trailId]/recursos/novo/page.tsx`
- Modify: `apps/web/src/app/recursos/[resourceId]/editar/page.tsx`
- Modify: `apps/web/src/features/resources/resource-form.tsx`
- Modify: `apps/web/src/features/resources/resource-form.test.tsx`
- Modify: `apps/web/src/features/check-ins/check-in-form.tsx`
- Modify: `apps/web/src/features/check-ins/check-in-form.test.tsx`

**Interfaces:**
- Consumes: `FormField`, `Input`, `Textarea`, `NativeSelect`, `PageHeader`, `Card` and `Skeleton`.
- Preserves: React Hook Form field names, Zod schemas, API error mapping, dirty-form guard and route destinations.

- [ ] **Step 1: Add failing pending-state and field-description tests**

In `trail-form.test.tsx`, make `createTrail` return a pending promise after a valid submission and assert:

```tsx
expect(screen.getByRole("button", { name: "Salvando..." })).toBeDisabled();
expect(screen.getByLabelText("Título")).toHaveAttribute("aria-describedby", "title-description");
```

Add the same pending label expectation to `resource-form.test.tsx`. In `check-in-form.test.tsx`, mock a pending `saveCheckIn` and assert `Salvando...` is disabled after clicking `Registrar check-in`.

- [ ] **Step 2: Run the form tests and verify failures**

Run: `rtk pnpm --filter @my-learning/web exec vitest run src/features/trails/trail-form.test.tsx src/features/resources/resource-form.test.tsx src/features/check-ins/check-in-form.test.tsx`

Expected: FAIL because buttons keep the `Salvar` label and title has no description ID.

- [ ] **Step 3: Replace duplicated field helpers**

Delete the private `Field` functions from `trail-form.tsx` and `resource-form.tsx`. Import `FormField` and render controls like this:

```tsx
<FormField id="title" label="Título" description="Use um nome curto e fácil de reconhecer." error={form.formState.errors.title?.message}>
  <Input {...form.register("title")} />
</FormField>
```

Use `Textarea` for description, goal, prompt and flashcard faces. Use `NativeSelect` for category and format so the existing `register`, `watch`, reset and `selectOption` flows remain intact. Use `Input` for URL and project requirements.

- [ ] **Step 4: Add PageHeader and card surfaces to form routes**

Use `PageHeader` for `Nova trilha`, `Editar trilha`, `Novo recurso` and `Editar recurso`. Replace nested `<main>` elements with `<div>` because `AppShell` already owns the main landmark. Wrap each form in a `Card` with `CardContent className="p-5 sm:p-6"`. Pending edit queries use skeletons; errors keep `Alert`.

- [ ] **Step 5: Expose mutation progress in button text**

Trail and Resource forms render `Salvando...` while pending. Add `isSaving` to `CheckInForm`, set it before `saveCheckIn`, clear it in `finally`, disable its primary button and render `Salvando...`. Do not change the delete-dialog flow.

- [ ] **Step 6: Run focused and full frontend tests**

Run: `rtk pnpm --filter @my-learning/web exec vitest run src/features/trails/trail-form.test.tsx src/features/resources/resource-form.test.tsx src/features/check-ins/check-in-form.test.tsx`

Expected: all focused tests pass.

Run: `rtk pnpm --filter @my-learning/web test`

Expected: all frontend tests pass.

- [ ] **Step 7: Commit form standardization**

```powershell
rtk git add -- apps/web/src/app/trilhas apps/web/src/app/recursos apps/web/src/features/trails/trail-edit.tsx apps/web/src/features/trails/trail-form.tsx apps/web/src/features/trails/trail-form.test.tsx apps/web/src/features/resources/resource-form.tsx apps/web/src/features/resources/resource-form.test.tsx apps/web/src/features/check-ins/check-in-form.tsx apps/web/src/features/check-ins/check-in-form.test.tsx
rtk git commit -m "feat(web): standardize study forms"
```

---

### Task 7: Redesign Resource detail, status and practice content

**Files:**
- Modify: `apps/web/src/app/recursos/[resourceId]/page.tsx`
- Modify: `apps/web/src/features/resources/resource-detail.tsx`
- Create: `apps/web/src/features/resources/resource-detail.test.tsx`
- Modify: `apps/web/src/features/resources/resource-status.tsx`
- Modify: `apps/web/src/features/resources/resource-status.test.tsx`
- Modify: `apps/web/src/features/resources/resource-conversion.tsx`
- Modify: `apps/web/src/features/resources/resource-conversion.test.tsx`
- Modify: `apps/web/src/features/practices/practice-answer.tsx`
- Modify: `apps/web/src/features/practices/practice-answer.test.tsx`

**Interfaces:**
- Consumes: `PageHeader`, `StatusBadge`, `ResourceIcon`, `FormField`, UI primitives and cards.
- Preserves: allowed status transitions, optimistic rollback, conversion preview/confirmation and answer persistence.

- [ ] **Step 1: Add a failing Resource detail composition test**

Mock `getResource` with a material in progress and assert:

```tsx
expect(screen.getByRole("heading", { level: 1, name: "Material A" })).toBeVisible();
expect(screen.getByText("Em andamento")).toBeVisible();
expect(screen.getByRole("link", { name: "Abrir material" })).toHaveAttribute("target", "_blank");
expect(screen.getByRole("heading", { name: "Converter recurso" })).toBeVisible();
```

Keep existing ResourceStatus rollback/pending tests and add an assertion that the selected label contains the amber status text.

- [ ] **Step 2: Run Resource tests and verify presentation failures**

Run: `rtk pnpm --filter @my-learning/web exec vitest run src/features/resources/resource-detail.test.tsx src/features/resources/resource-status.test.tsx src/features/resources/resource-conversion.test.tsx src/features/practices/practice-answer.test.tsx`

Expected: FAIL because the detail mock test and semantic visual composition do not exist yet.

- [ ] **Step 3: Compose Resource detail with bounded cards**

Remove the nested page `<main>`. Use `PageHeader` with resource icon, format/category copy, `StatusBadge`, edit and delete actions. Wrap each applicable content block in `Card`: external link, prompt, answer, requirements, flashcard and conversion. Preserve conditional rendering exactly by format.

- [ ] **Step 4: Restyle status transitions without changing radio semantics**

Keep native radio inputs and the `transitions` map. Each label becomes a selectable card containing its text and status dot:

```tsx
const selectStatus = (value: ResourceSummary["status"]) => {
  const previous = current;
  setCurrent(value);
  setError(false);
  mutation.mutate(value, { onError: () => { setCurrent(previous); setError(true); } });
};

{options.filter(([value]) => (transitions[current] as readonly string[]).includes(value)).map(([value, label]) => {
  const presentation = getStatusPresentation(value);
  return <label key={value} className={cn("flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm", current === value && presentation.className)}>
    <input className="sr-only" disabled={mutation.isPending} type="radio" name={`status-${resourceId}`} checked={current === value} onChange={() => selectStatus(value)} />
    <span aria-hidden className="size-2 rounded-full bg-current" />
    {label}
  </label>;
})}
```

Do not remove the error rollback or pending disable behavior.

- [ ] **Step 5: Apply shared fields to conversion and practice answer**

Use `NativeSelect`, `Input`, `Textarea` and `FormField` in `ResourceConversion`. Preserve labels consumed by E2E: `Nova categoria`, `Novo formato`, `Enunciado da conversão`, `Frente da conversão`, `Verso da conversão` and requirement labels. `PracticeAnswer` uses `Textarea`; its button renders `Salvando...` while `isSaving`.

- [ ] **Step 6: Run all Resource and Practice tests**

Run: `rtk pnpm --filter @my-learning/web exec vitest run src/features/resources src/features/practices`

Expected: all focused tests pass.

- [ ] **Step 7: Commit Resource screens**

```powershell
rtk git add -- apps/web/src/app/recursos apps/web/src/features/resources apps/web/src/features/practices
rtk git commit -m "feat(web): redesign resource experience"
```

---

### Task 8: Finish History and Settings surfaces

**Files:**
- Modify: `apps/web/src/app/historico/page.tsx`
- Modify: `apps/web/src/features/check-ins/check-in-history.tsx`
- Modify: `apps/web/src/features/check-ins/check-in-history.test.tsx`
- Modify: `apps/web/src/features/settings/settings-view.tsx`
- Modify: `apps/web/src/features/settings/settings-view.test.tsx`

**Interfaces:**
- Consumes: `PageHeader`, `EmptyState`, `Skeleton`, `Input`, cards and Lucide icons.
- Preserves: date/duration formatting, system query, export URL, import preview and destructive confirmation.

- [ ] **Step 1: Add empty/history and settings hierarchy tests**

Extend `check-in-history.test.tsx`:

```tsx
it("offers a useful empty history state", () => {
  render(<CheckInHistory checkIns={[]} />);
  expect(screen.getByText("Nenhum check-in registrado")).toBeVisible();
  expect(screen.getByText("Seus registros diários aparecerão aqui.")).toBeVisible();
});
```

Extend `settings-view.test.tsx` to assert a level-one `Configurações` heading and the three named regions `Armazenamento local`, `Exportar backup` and `Restaurar backup` while retaining the import-warning test.

- [ ] **Step 2: Run tests and verify the new structure fails**

Run: `rtk pnpm --filter @my-learning/web exec vitest run src/features/check-ins/check-in-history.test.tsx src/features/settings/settings-view.test.tsx`

Expected: FAIL on the new empty-state description and renamed export region.

- [ ] **Step 3: Implement the History timeline**

Use `PageHeader` with `History` icon in `CheckInHistory`. Render check-ins as a vertical list of cards with `CalendarDays`, formatted date, `Clock`, duration and optional note. Use `EmptyState` with no action when empty. In the page-level pending state, render a header skeleton and three row skeletons; errors use `Alert`.

```tsx
const formatLocalDate = (localDate: string) => format(`${localDate}T12:00:00`, "dd/MM/yyyy", { locale: ptBR });

<section className="space-y-6">
  <PageHeader eyebrow="Atividade" title="Histórico" description="Revise sua consistência diária de estudos." icon={History} />
  {checkIns.length === 0 ? <EmptyState icon={CalendarDays} title="Nenhum check-in registrado" description="Seus registros diários aparecerão aqui." /> : <ol className="space-y-3">{checkIns.map((checkIn) => <li key={checkIn.id}><Card><CardContent className="flex gap-3 p-4"><CalendarDays aria-hidden /><div><p className="font-medium">{formatLocalDate(checkIn.localDate)}</p><p className="text-sm text-muted-foreground">{formatDuration(checkIn.durationMinutes)}</p>{checkIn.note ? <p className="mt-2 text-sm">{checkIn.note}</p> : null}</div></CardContent></Card></li>)}</ol>}
</section>
```

- [ ] **Step 4: Implement Settings hierarchy and state feedback**

Use one `PageHeader` and three cards with `Database`, `Download` and `Upload` icons. Render system pending data with skeleton rows. Use `Input type="file"` while preserving the `Arquivo JSON` label. Keep preview counts, destructive warning, button pending labels, toast and `AlertDialog` logic unchanged.

```tsx
<div className="space-y-6">
  <PageHeader eyebrow="Preferências" title="Configurações" description="Dados e backup da instalação local." icon={Settings} />
  <div className="grid gap-4 xl:grid-cols-2">
    <Card aria-labelledby="storage-title"><CardHeader><Database aria-hidden /><CardTitle id="storage-title">Armazenamento local</CardTitle></CardHeader><CardContent>{system.isPending ? <Skeleton className="h-20" /> : system.isError ? <Alert variant="destructive"><AlertDescription>Não foi possível carregar as configurações locais.</AlertDescription></Alert> : system.data ? <dl className="grid gap-2 text-sm sm:grid-cols-[10rem_1fr]"><dt>Banco SQLite</dt><dd>{system.data.databasePath}</dd><dt>Fuso horário</dt><dd>{system.data.timeZone}</dd><dt>Formato do backup</dt><dd>{system.data.snapshotFormatVersion}</dd></dl> : null}</CardContent></Card>
    <Card aria-labelledby="export-title"><CardHeader><Download aria-hidden /><CardTitle id="export-title">Exportar backup</CardTitle></CardHeader><CardContent><Button onClick={download} type="button"><Download aria-hidden />Exportar JSON</Button></CardContent></Card>
    <Card className="xl:col-span-2" aria-labelledby="restore-title"><CardHeader><Upload aria-hidden /><CardTitle id="restore-title">Restaurar backup</CardTitle></CardHeader><CardContent className="space-y-4"><label htmlFor="backup-file">Arquivo JSON</label><Input id="backup-file" accept="application/json,.json" onChange={selectFile} type="file" /><Button disabled={!file || isPreviewing} onClick={() => void validate()} type="button" variant="outline">{isPreviewing ? "Validando..." : "Validar arquivo"}</Button>{preview ? <BackupPreview preview={preview} onConfirm={() => setConfirmOpen(true)} /> : null}</CardContent></Card>
  </div>
</div>
```

Keep the existing `<dl>` fields inline. Extract only the already-rendered preview block into a private `BackupPreview({ preview, onConfirm })` component in `settings-view.tsx`; it renders all five count labels, the destructive warning and the `Importar e substituir` button.

- [ ] **Step 5: Run focused and full tests**

Run: `rtk pnpm --filter @my-learning/web exec vitest run src/features/check-ins/check-in-history.test.tsx src/features/settings/settings-view.test.tsx`

Expected: all focused tests pass.

Run: `rtk pnpm --filter @my-learning/web test`

Expected: all frontend tests pass.

- [ ] **Step 6: Commit History and Settings**

```powershell
rtk git add -- apps/web/src/app/historico/page.tsx apps/web/src/features/check-ins/check-in-history.tsx apps/web/src/features/check-ins/check-in-history.test.tsx apps/web/src/features/settings
rtk git commit -m "feat(web): polish history and settings"
```

---

### Task 9: Verify responsive behavior, themes and accessibility

**Files:**
- Modify: `apps/web/e2e/foundation.spec.ts`
- Modify: `apps/web/e2e/tracking-dashboard.spec.ts`
- Modify: `apps/web/e2e/trails-resources.spec.ts`
- Create: `docs/qa/2026-08-07-vibrant-ui-responsividade-e-acessibilidade.md`

**Interfaces:**
- Consumes: completed interface and existing `expectNoAccessibilityViolations(page)` helper.
- Produces: automated evidence for desktop, mobile, light/dark theme, no horizontal overflow and critical flows.

- [ ] **Step 1: Update E2E assertions for the approved hierarchy**

In `foundation.spec.ts`, replace the old `Dashboard` heading assertion with:

```ts
await expect(page.getByRole("heading", { level: 1, name: "Seu aprendizado, em movimento." })).toBeVisible();
if (viewport.name === "desktop") {
  await expect(page.getByRole("navigation", { name: "Navegação principal" })).toBeVisible();
} else {
  await page.getByRole("button", { name: /Abrir navega/ }).click();
  await expect(page.getByRole("dialog").getByRole("navigation", { name: "Navegação principal" })).toBeVisible();
}
```

For mobile, keep the menu-dialog focus checks. For desktop, assert the `Trilhas` link has the active state after navigating to `/trilhas`.

- [ ] **Step 2: Add a failing theme accessibility check**

Add a test in `foundation.spec.ts`:

```ts
test("keeps the vibrant palette accessible in dark mode", async ({ page }) => {
  await page.goto("/trilhas/nova");
  await page.getByLabel("Título").fill("Tema escuro");
  await page.getByRole("button", { name: "Salvar" }).click();
  await page.getByRole("button", { name: "Novo recurso" }).click();
  await page.getByLabel("Título").fill("Contraste âmbar");
  await page.getByLabel("Categoria").selectOption("MATERIAL");
  await page.getByLabel("Formato").selectOption("COURSE");
  await page.getByRole("button", { name: "Salvar" }).click();
  await page.getByRole("radio", { name: "Em andamento" }).click();
  await page.getByRole("button", { name: "Usar tema escuro" }).first().click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(page.getByText("Em andamento").first()).toBeVisible();
  await expectNoAccessibilityViolations(page);
});
```

- [ ] **Step 3: Run E2E and fix only observed regressions**

Run: `rtk pnpm test:e2e`

Expected: all Playwright tests pass in desktop and mobile projects with zero Axe violations. If a locator changed because visible copy was intentionally approved, update the locator to the new accessible name; do not add test IDs to bypass semantic locators.

- [ ] **Step 4: Run the complete verification matrix**

Run each command separately and require exit 0:

```powershell
rtk pnpm format:check
rtk pnpm lint
rtk pnpm typecheck
rtk pnpm test
rtk pnpm build
rtk pnpm test:e2e
```

Expected: formatting clean, zero lint errors, zero type errors, all unit/integration tests pass, production build succeeds and all E2E projects pass.

- [ ] **Step 5: Update the QA evidence**

Create `docs/qa/2026-08-07-vibrant-ui-responsividade-e-acessibilidade.md` and record the verification date, both viewports, light/dark checks, sidebar/sheet behavior, status contrast, no-overflow result and Axe result. Do not claim formal WCAG certification.

- [ ] **Step 6: Commit final verification changes**

```powershell
rtk git add -- apps/web/e2e docs/qa/2026-08-07-vibrant-ui-responsividade-e-acessibilidade.md
rtk git commit -m "test(web): verify vibrant interface accessibility"
```

## Final Review Checklist

- [ ] Compare every changed screen against `docs/superpowers/specs/2026-08-07-vibrant-ui-refresh-design.md`.
- [ ] Confirm `git diff --check` returns no whitespace errors.
- [ ] Confirm only files belonging to this repaginação appear in `git status --short`.
- [ ] Confirm the unrelated `docs/superpowers/plans/2026-08-07-bug-remediation.md` remains untracked and unmodified.
- [ ] Run the complete verification matrix from Task 9 again immediately before declaring completion.
