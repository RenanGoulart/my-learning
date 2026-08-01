# My Learning

Aplicacao local para organizar trilhas de estudo, recursos, praticas e historico.

## Requisitos

- Node.js 24 (>=24 e <25)
- Corepack habilitado
- pnpm 11.18.0

## Inicio local

1. Habilite o Corepack: `corepack enable`.
2. Instale as dependencias: `pnpm install`.
3. Crie o arquivo local de ambiente: `Copy-Item .env.example .env` no PowerShell, ou copie `.env.example` para `.env` pelo gerenciador de arquivos.
4. Crie ou atualize o banco SQLite: `pnpm db:setup`.
5. Inicie a aplicacao: `pnpm dev`.

Com a aplicacao em execucao:

- Web: `http://localhost:3000`
- API: `http://127.0.0.1:3001`
- Banco SQLite: `data/my-learning.db`

O Dashboard e a primeira tela da aplicacao. O arquivo `.env` nao deve ser versionado; use `.env.example` como referencia.

## Qualidade

```powershell
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e -- --project=chromium
```

O teste E2E abre o Dashboard em `1366x768` e `390x844`, validando a navegacao e a ausencia de rolagem horizontal da pagina.

## Fluxo de Entrega

Cada tarefa e realizada em um worktree isolado. Depois que as gates aplicaveis forem aprovadas, a tarefa DEVE ser commitada, enviada ao repositorio remoto e aberta em um pull request para `main`. A integracao ocorre somente apos o merge desse PR.
