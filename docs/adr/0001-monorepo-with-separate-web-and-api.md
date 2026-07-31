# Monorepo with separate web and API applications

The platform will use a TypeScript monorepo with independently runnable web and API applications. The API application will use Fastify directly, without NestJS or Express, and will be organized by feature with explicit dependency factories. Package installation and local package linking will use `pnpm` workspaces, while Turborepo will orchestrate development, build, test, and lint tasks with local caching. This keeps the local MVP in one repository and allows shared contracts and domain code, while preserving an API boundary that a future native app can consume and allowing web and API deployments to evolve independently.

## Considered Options

- A single Next.js application would reduce initial setup but couple the browser client and backend deployment.
- A NestJS API using the Fastify adapter would provide framework-level modules and dependency injection but add conventions and generated structure that are not desired for this MVP.
- An Express API would not match the selected Fastify backend.
- Separate repositories would maximize isolation but add coordination and versioning overhead too early.
- Using only `pnpm` recursive commands would avoid an orchestration dependency but would not provide the selected task graph and local build cache.

## Consequences

- The monorepo will contain `apps/web`, `apps/api`, and narrowly scoped shared packages.
- The repository will use `pnpm-workspace.yaml` for workspace membership and the `workspace:` protocol for local package dependencies.
- Turborepo will orchestrate workspace tasks and use local caching; remote caching remains out of scope for the MVP.
- `apps/api` will use Fastify directly and only the HTTP plugins required by the MVP.
- API modules will contain routes, controllers, services, and repositories, with additional files created only for concrete responsibilities.
- Dependency injection will use explicit factory functions rather than a container or decorators.
- Prisma-generated types remain internal to `apps/api` and `packages/database`; HTTP contracts remain Zod schemas in `packages/contracts`.
- The web application will access persisted data only through the API.
- Authentication remains out of scope for the MVP, but the API boundary must allow it to be added later.
