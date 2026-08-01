# [PLAT] Especificação de Requisitos: Requisitos Transversais da Plataforma

> **Metadados do Documento**
> * **Versão:** 1.3.0
> * **Data de Criação/Atualização:** 2026-07-31
> * **Status:** Aprovado
> * **Autor/Agente:** Agente de Requisitos IREB
> * **Rastreabilidade / Issue:** [Learning Platform MVP Design](../superpowers/specs/2026-07-29-learning-platform-mvp-design.md) | Issue: N/A

---

### Histórico de Alterações
| Versão | Data | Status | Descrição do Ajuste | Autor |
| :--- | :--- | :--- | :--- | :--- |
| **0.1.0** | 2026-07-29 | Em Revisão | Extração inicial das restrições e requisitos transversais. | Agente de Requisitos IREB |
| **0.2.0** | 2026-07-30 | Em Revisão | Definição do shadcn como biblioteca de componentes, adoção inicial de seu estilo padrão e preservação da personalização futura. | Agente de Requisitos IREB |
| **1.0.0** | 2026-07-30 | Aprovado | Requisitos validados e aprovados pelo usuário. | Usuário |
| **1.1.0** | 2026-07-31 | Aprovado | Adoção de Turborepo sobre pnpm workspaces para orquestração e cache local, mantendo cache remoto fora do MVP. | Usuário |
| **1.2.0** | 2026-07-31 | Aprovado | Substituição do NestJS por Fastify puro e definição da estrutura modular pragmática da API. | Usuário |
| **1.3.0** | 2026-07-31 | Aprovado | Adoção da WCAG 2.2 nível AA como referência de implementação e de verificações automatizadas e manuais de acessibilidade. | Usuário |

## 1. Visão Geral e Contexto

Este documento reúne requisitos de arquitetura, qualidade, integração e escopo aplicáveis às nove funcionalidades do MVP local. A separação entre frontend e backend deve permitir futura hospedagem em VPS e consumo da API por um projeto nativo separado.

---

## 2. Regras de Negócio (RN)

- **[PLAT-RN-001] Uso pessoal local**: O MVP é executado na máquina do usuário e atende uma única pessoa.
- **[PLAT-RN-002] Fronteira de API**: Toda persistência é acessada pelo frontend por meio da API.
- **[PLAT-RN-003] Identificadores estáveis**: Contratos, banco e snapshots usam valores ASCII; a interface apresenta rótulos em português corretamente acentuados.
- **[PLAT-RN-004] Calendário único**: Regras diárias usam `America/Sao_Paulo`, independentemente do fuso do navegador ou servidor.

---

## 3. Modalidade e Prioridade

- **DEVE / Must Have / Alta**: requisito obrigatório para integrar o MVP.
- **DEVERIA / Should Have / Média**: recomendação arquitetural adiável mediante aprovação formal.
- **NÃO DEVE / Must Have / Alta**: comportamento proibido no MVP.

---

## 4. Requisitos Funcionais (RF)

- **[PLAT-RF-001] Executar aplicações separadamente**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** O monorepo DEVE fornecer scripts documentados para executar `apps/web` e `apps/api` localmente.
  - **Critério de Aceite:** Os scripts documentados iniciam frontend e API como processos independentes.

- **[PLAT-RF-002] Expor API REST**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** A API DEVE expor endpoints REST para Trilhas, Recursos, Práticas, Check-ins, Dashboard e Importação/Exportação.
  - **Critério de Aceite:** Cada grupo funcional possui operação REST correspondente e é consumido pelo frontend.

- **[PLAT-RF-003] Padronizar erros da API**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** Erros de validação DEVEM retornar mensagem ao usuário, código de máquina e detalhes por campo quando aplicável.
  - **Critério de Aceite:** Erro de campo contém os três elementos aplicáveis; erro geral contém mensagem e código.

- **[PLAT-RF-004] Apresentar erros de campo**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** O frontend DEVE apresentar erros de campo junto ao respectivo controle.
  - **Critério de Aceite:** Ao receber detalhe de campo, a mensagem aparece associada ao controle correspondente.

- **[PLAT-RF-005] Apresentar falhas gerais**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** Falhas gerais de banco ou importação DEVEM ser apresentadas em alerta da operação.
  - **Critério de Aceite:** A falha é visível no contexto da ação e informa que a operação não foi concluída.

- **[PLAT-RF-006] Preservar entrada após falha**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** O frontend DEVE preservar os dados preenchidos quando uma gravação falhar.
  - **Critério de Aceite:** Após erro de validação, banco ou importação, campos não substituídos permanecem com os valores anteriores à tentativa.

- **[PLAT-RF-007] Abrir na experiência operacional**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** A aplicação DEVE abrir diretamente no Dashboard e fornecer acesso às operações do MVP.
  - **Critério de Aceite:** Não existe etapa de marketing antes do Dashboard.

---

## 5. Requisitos de Qualidade (RNF)

- **[PLAT-RNF-001] Responsividade**: Todas as operações essenciais DEVEM permanecer utilizáveis em Chromium atual nos viewports `1366x768` e `390x844`, sem sobreposição de controles ou perda de ações.
- **[PLAT-RNF-002] Interface operacional**: A interface NÃO DEVE conter landing page, hero de marketing ou composição decorativa como etapa principal.
- **[PLAT-RNF-003] Testes de domínio**: O MVP DEVE possuir testes unitários para progresso, conclusão e reabertura de Trilha, classificação ativa, seleção `Continuar estudando`, streak atual, melhor streak e validação de status.
- **[PLAT-RNF-004] Testes de API**: O MVP DEVE possuir testes de integração para os fluxos e erros definidos nos nove documentos funcionais.
- **[PLAT-RNF-005] Testes de interface**: O MVP DEVE possuir smoke tests para criar Trilha, adicionar Material e Prática, registrar Check-in, alterar status, observar progresso e exportar/importar dados.
- **[PLAT-RNF-006] Verificação responsiva**: O MVP DEVE passar por verificação manual nos dois viewports de `PLAT-RNF-001`.
- **[PLAT-RNF-007] Isolamento de domínio**: Regras puras de progresso e streak DEVEM permanecer independentes de frontend, HTTP e banco.
- **[PLAT-RNF-008] Plugins Fastify**: Plugins HTTP adicionais DEVERIAM ser compatíveis com Fastify. **Prioridade:** Média (Should Have).
- **[PLAT-RNF-009] Estilo inicial do shadcn**: Os componentes shadcn utilizados pelo frontend DEVEM manter inicialmente as classes e variantes de estilo padrão geradas para a versão instalada da biblioteca. **Prioridade:** Alta (Must Have). **Critério de Aceite:** A inspeção dos componentes compartilhados do frontend não identifica alterações próprias nas classes ou variantes geradas pelo shadcn.
- **[PLAT-RNF-010] Personalização visual futura**: A configuração do shadcn DEVERIA preservar a possibilidade de personalização futura por meio dos tokens de tema e das variantes suportadas pela biblioteca. **Prioridade:** Média (Should Have). **Critério de Aceite:** A configuração central do shadcn e os componentes compartilhados permitem alterar futuramente tokens de tema ou variantes sem substituir a biblioteca de componentes adotada.
- **[PLAT-RNF-011] Acessibilidade operacional**: As operações interativas do frontend DEVEM adotar a WCAG 2.2 nível AA como referência para nomes acessíveis, navegação por teclado, foco visível, contraste e associação entre controles, rótulos e erros. **Prioridade:** Alta (Must Have). **Critério de Aceite:** Os fluxos E2E críticos não apresentam violações detectadas por `@axe-core/playwright`, e a verificação manual confirma operação por teclado e foco visível nos viewports `1366x768` e `390x844`. O MVP não declara certificação formal de conformidade.

---

## 6. Restrições Técnicas e de Projeto (CT)

- **[PLAT-CT-001] Monorepo TypeScript**: A solução DEVE usar monorepo TypeScript com `pnpm` workspaces.
- **[PLAT-CT-002] Estrutura**: O monorepo DEVE conter `apps/web`, `apps/api`, `packages/contracts`, `packages/domain` e `packages/database`.
- **[PLAT-CT-003] Frontend**: `apps/web` DEVE usar Next.js.
- **[PLAT-CT-004] Backend Fastify puro**: `apps/api` DEVE usar Fastify diretamente. **Prioridade:** Alta (Must Have). **Critério de Aceite:** O manifesto de `apps/api` declara Fastify e sua inicialização cria uma instância Fastify sem adaptador de outro framework.
- **[PLAT-CT-005] Sem NestJS ou Express**: A API NÃO DEVE depender de NestJS, `@nestjs/platform-fastify` ou Express. **Prioridade:** Alta (Must Have). **Critério de Aceite:** Os manifestos e imports da API não contêm pacotes `@nestjs/*` nem `express`.
- **[PLAT-CT-006] Persistência**: `packages/database` DEVE usar Prisma com SQLite e ser consumido somente pela API.
- **[PLAT-CT-007] Banco local**: O arquivo SQLite DEVE permanecer fora das saídas de build e sua localização deve ser documentada.
- **[PLAT-CT-008] Contratos compartilhados**: DTOs, schemas e tipos compartilhados DEVEM residir em `packages/contracts`.
- **[PLAT-CT-009] Domínio compartilhado**: Regras puras DEVEM residir em `packages/domain`.
- **[PLAT-CT-010] Sem acesso direto ao banco**: O frontend NÃO DEVE importar Prisma ou código de banco.
- **[PLAT-CT-011] Orquestração com Turborepo**: O monorepo DEVE usar Turborepo sobre `pnpm` workspaces para orquestrar tarefas de desenvolvimento, build, teste e lint com cache local. **Prioridade:** Alta (Must Have). **Critério de Aceite:** A configuração do Turborepo declara as tarefas dos workspaces, respeita suas dependências e mantém o cache local habilitado nas tarefas compatíveis.
- **[PLAT-CT-012] Sem autenticação**: Autenticação e contas multiusuário NÃO DEVEM integrar o MVP.
- **[PLAT-CT-013] Sem integrações externas**: O MVP NÃO DEVE consumir APIs externas; URLs de Materiais não constituem integração.
- **[PLAT-CT-014] Sem geração automática**: O MVP NÃO DEVE gerar Questões, Problemas, Projetos ou Flashcards por IA.
- **[PLAT-CT-015] Sem avaliação automática**: O MVP NÃO DEVE corrigir respostas, atribuir nota ou manter histórico de tentativas.
- **[PLAT-CT-016] Sem sincronização**: O MVP NÃO DEVE sincronizar dados entre máquinas.
- **[PLAT-CT-017] Aplicativo futuro**: Um aplicativo nativo NÃO DEVE integrar este MVP; será projeto separado consumidor da API.
- **[PLAT-CT-018] Migração futura**: O uso de Prisma DEVERIA preservar a possibilidade de migração futura para PostgreSQL. **Prioridade:** Média (Should Have).
- **[PLAT-CT-019] Autenticação futura**: A fronteira da API DEVERIA permitir futura adição de autenticação sem acesso direto do frontend ao banco. **Prioridade:** Média (Should Have).
- **[PLAT-CT-020] Biblioteca de componentes do frontend**: `apps/web` DEVE utilizar shadcn como biblioteca de componentes e seguir a estrutura de componentes e o padrão de estilização fornecidos pela biblioteca. **Prioridade:** Alta (Must Have). **Critério de Aceite:** `apps/web` contém a configuração do shadcn e utiliza seus componentes compartilhados na implementação da interface.
- **[PLAT-CT-021] Sem cache remoto no MVP**: O MVP NÃO DEVE depender de cache remoto do Turborepo. **Prioridade:** Alta (Must Have). **Critério de Aceite:** As tarefas podem ser executadas integralmente na máquina local sem autenticação, serviço ou configuração de cache remoto.
- **[PLAT-CT-022] Estrutura modular da API**: Cada módulo funcional de `apps/api` DEVE possuir `routes.ts`, `controller.ts`, `service.ts` e `repository.ts`; arquivos adicionais somente podem ser criados para responsabilidades concretas. **Prioridade:** Alta (Must Have). **Critério de Aceite:** A inspeção dos módulos identifica os quatro arquivos definidos e não encontra arquivos vazios ou abstrações sem consumidor.
- **[PLAT-CT-023] Fronteira dos tipos Prisma**: Tipos gerados pelo Prisma PODEM ser reutilizados em `apps/api` e `packages/database`, mas NÃO DEVEM ser expostos como contratos HTTP nem importados por `apps/web` ou `packages/contracts`. **Prioridade:** Alta (Must Have). **Critério de Aceite:** Imports do Prisma ficam restritos ao backend e ao pacote de banco, enquanto requisições e respostas usam schemas de `packages/contracts`.
- **[PLAT-CT-024] Validação Zod no Fastify**: A API DEVE usar os schemas Zod de `packages/contracts` por meio do type provider Zod do Fastify para validar e inferir requisições e respostas. **Prioridade:** Alta (Must Have). **Critério de Aceite:** Rotas declaram schemas compartilhados para parâmetros, query, corpo e resposta aplicáveis, sem DTO equivalente duplicado na API.
- **[PLAT-CT-025] Injeção explícita**: A API DEVERIA compor repository, service e controller com funções factory e dependências explícitas, sem contêiner de injeção ou decorators. **Prioridade:** Média (Should Have). **Critério de Aceite:** A composição dos módulos instancia dependências por parâmetros visíveis e pode ser substituída diretamente nos testes.

---

## 7. Lacunas e Questões de Elicitação

Nenhuma lacuna aberta. O documento foi aprovado pelo usuário.

### Checklist de Qualidade IREB (Autoavaliação)
- [x] **Necessário**: Os requisitos sustentam execução, integração e manutenção do MVP.
- [x] **Não-ambíguo**: Stack, fronteiras, viewports e exclusões de escopo estão explícitos.
- [x] **Completo**: Arquitetura, erros, testes, responsividade e escopo foram classificados.
- [x] **Consistente**: Recomendações futuras não ampliam o MVP.
- [x] **Verificável**: Estrutura, dependências, viewports e testes são inspecionáveis.
- [x] **Viável**: A stack foi previamente decidida e registrada em ADR.
- [x] **Priorizado**: MVP e recomendações arquiteturais usam modalidades e prioridades distintas.
- [x] **Rastreável e Versionado**: IDs, origem, versão e histórico estão presentes.

> **Status da Validação**: Aprovado, sem conflitos detectados.
