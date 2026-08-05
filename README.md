# My Learning

MVP local para organizar estudos em um unico lugar. A plataforma permite criar trilhas, centralizar recursos, registrar praticas manuais e acompanhar a consistencia diaria de estudo.

## Funcionalidades

- Trilhas de estudo com recursos ordenados.
- Materiais como cursos, documentacoes, artigos, videos e livros.
- Praticas manuais: questoes, problemas, projetos com requisitos e flashcards.
- Check-in diario, streak e Dashboard com resumo do estudo.

## Estrutura

O repositorio usa pnpm workspaces e Turborepo:

- `apps/web`: frontend Next.js, em `http://localhost:3000`.
- `apps/api`: API Fastify, em `http://127.0.0.1:3001`.
- `packages/contracts`: contratos e schemas compartilhados.
- `packages/database`: Prisma e banco SQLite local.
- `packages/domain`: regras de dominio compartilhadas.

## Requisitos

- Node.js 24 (>=24.15 e <25)
- Corepack habilitado
- pnpm 11.18.0

## Como rodar

1. Habilite o Corepack: `corepack enable`.
2. Instale as dependencias: `pnpm install`.
3. Crie o arquivo local de ambiente: `Copy-Item .env.example .env` no PowerShell, ou copie `.env.example` para `.env` pelo gerenciador de arquivos.
4. Crie ou atualize o banco SQLite: `pnpm db:setup`.
5. Inicie web e API: `pnpm dev`.

Com a aplicacao em execucao:

- Web: `http://localhost:3000`
- API: `http://127.0.0.1:3001`
- Banco SQLite: `data/my-learning.db`

O comando `pnpm dev` executa `turbo dev`, iniciando o frontend e a API ao mesmo tempo. Para iniciar apenas um servico:

```powershell
pnpm --filter @my-learning/web dev
pnpm --filter @my-learning/api dev
```

O Dashboard e a primeira tela da aplicacao. O arquivo `.env` nao deve ser versionado; use `.env.example` como referencia.

## Qualidade

```powershell
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Antes de executar o E2E, libere as portas usadas pelo ambiente de teste (`3000` para Web e `3001` para API) e confirme que nao ha processos escutando nelas. Isso evita que o Playwright reutilize servidores ou bancos de uma execucao anterior.

O teste E2E abre o Dashboard em `1366x768` e `390x844`, validando a navegacao e a ausencia de rolagem horizontal da pagina.

## Fluxo de Entrega

Cada tarefa e realizada em um worktree isolado. Depois que as gates aplicaveis forem aprovadas, a tarefa DEVE ser commitada, enviada ao repositorio remoto e aberta em um pull request para `main`. A integracao ocorre somente apos o merge desse PR.
