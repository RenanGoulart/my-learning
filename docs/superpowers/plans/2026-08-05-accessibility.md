# Accessibility Verification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Verify critical MVP workflows against WCAG 2.2 AA automated rules and keyboard interaction in Chromium desktop and mobile viewports.

**Architecture:** Keep the Axe assertion in one Playwright helper. Existing E2E journeys use it after their stable operational screen; any violation is corrected only in the component that owns the markup, focus or accessible name.

**Tech Stack:** Next.js, Base UI/shadcn components, Playwright, `@axe-core/playwright`, TypeScript.

## Global Constraints

- Audit existing critical E2E flows at `1366x768` and `390x844` in Chromium.
- Use `@axe-core/playwright` `4.12.1`; do not add another accessibility library.
- Preserve current shadcn/Base UI patterns and leave API, database and domain behavior unchanged.
- Treat detected WCAG 2.2 AA violations as failures; do not globally disable Axe rules.
- Before publication, run `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm build` and `pnpm test:e2e` with ports `3000` and `3001` free.

---

### Task 1: Reusable Axe assertion

**Files:**
- Create: `apps/web/e2e/accessibility.ts`
- Modify: `apps/web/e2e/foundation.spec.ts`

**Interfaces:** Produces `expectNoAccessibilityViolations(page: Page): Promise<void>`.

- [ ] **Step 1: Write the failing dashboard assertion**

```ts
import { expectNoAccessibilityViolations } from "./accessibility";

await page.goto("/");
await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
await expectNoAccessibilityViolations(page);
```

- [ ] **Step 2: Verify RED**

Run `pnpm --filter @my-learning/web exec playwright test e2e/foundation.spec.ts --project=desktop`.
Expected: FAIL because `./accessibility` does not exist.

- [ ] **Step 3: Implement the common assertion**

```ts
import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

export async function expectNoAccessibilityViolations(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
}
```

- [ ] **Step 4: Verify GREEN**

Run the same focused E2E command. Expected: PASS with a Dashboard Axe audit.

- [ ] **Step 5: Commit**

Stage the helper and foundation test, then commit `test: audit dashboard accessibility`.

### Task 2: Critical workflow and keyboard coverage

**Files:**
- Modify: `apps/web/e2e/foundation.spec.ts`
- Modify: `apps/web/e2e/tracking-dashboard.spec.ts`
- Modify: `apps/web/e2e/trails-resources.spec.ts`
- Modify: `apps/web/e2e/local-operation.spec.ts`
- Modify only if an audit fails: its owner under `apps/web/src/components` or `apps/web/src/features`

**Interfaces:** Consumes `expectNoAccessibilityViolations(page)` and produces Axe coverage for Dashboard, Check-in history, resource management and backup restoration.

- [ ] **Step 1: Add the failing workflow and focus assertions**

```ts
await expectNoAccessibilityViolations(page);

await page.getByRole("button", { name: /Abrir navegação/ }).click();
await page.keyboard.press("Tab");
await expect(page.getByRole("link", { name: "Dashboard" })).toBeFocused();
```

Apply the helper after each journey's stable final state. In the mobile Dashboard journey, audit the open sheet too.

- [ ] **Step 2: Run the complete E2E suite to record violations**

Run `pnpm test:e2e`. Expected: every flow runs Axe; violations or focus defects fail the suite.

- [ ] **Step 3: Correct violations minimally at their owner**

Keep native/Base UI semantics, accessible names, dialog focus and field associations. Do not suppress rules globally.

- [ ] **Step 4: Run focused and complete E2E verification**

Run `pnpm --filter @my-learning/web exec playwright test e2e/foundation.spec.ts e2e/tracking-dashboard.spec.ts e2e/trails-resources.spec.ts e2e/local-operation.spec.ts`.
Expected: PASS in both configured Chromium projects with no Axe violations.

- [ ] **Step 5: Commit**

Stage affected E2E and UI files, then commit `test: cover critical accessibility flows`.

### Task 3: Documentation and final gates

**Files:**
- Modify: `README.md`

**Interfaces:** Documents `pnpm test:e2e` as including automated Axe checks.

- [ ] **Step 1: Document the check**

Add: `pnpm test:e2e` executes critical flows in Chromium desktop and mobile and checks detectable accessibility violations with Axe.

- [ ] **Step 2: Run static gates**

Run `pnpm exec prettier --check README.md apps/web/e2e`, `pnpm test`, `pnpm lint`, `pnpm typecheck` and `pnpm build`. Expected: exit code `0`.

- [ ] **Step 3: Clear ports and run final E2E**

Run `Get-NetTCPConnection -State Listen | Where-Object { $_.LocalPort -in 3000,3001 }`, then `pnpm test:e2e`. Expected: no listeners before the run and all tests pass.

- [ ] **Step 4: Commit, push and open PR**

Commit `test: enforce critical accessibility checks`, push `codex/accessibility`, then open a PR to `main`.

## Self-Review

- Coverage: directly covers PLAT-RNF-011's Axe and keyboard requirements in both required viewport projects.
- Scope: no product, API, persistence or domain expansion.
- Ambiguity: audits run on the stable screens reached by all four critical E2E journeys; violations are fixed rather than excluded.
- Placeholders: none.
