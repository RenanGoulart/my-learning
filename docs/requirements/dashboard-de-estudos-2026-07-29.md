# [DASH] Especificação de Requisitos: Dashboard de Estudos

> **Metadados do Documento**
> * **Versão:** 1.0.0
> * **Data de Criação/Atualização:** 2026-07-30
> * **Status:** Aprovado
> * **Autor/Agente:** Agente de Requisitos IREB
> * **Rastreabilidade / Issue:** [Learning Platform MVP Design](../superpowers/specs/2026-07-29-learning-platform-mvp-design.md) | Issue: N/A

---

### Histórico de Alterações
| Versão | Data | Status | Descrição do Ajuste | Autor |
| :--- | :--- | :--- | :--- | :--- |
| **0.1.0** | 2026-07-29 | Em Revisão | Extração inicial dos requisitos do Dashboard. | Agente de Requisitos IREB |
| **1.0.0** | 2026-07-30 | Aprovado | Requisitos validados e aprovados pelo usuário. | Usuário |

## 1. Visão Geral e Contexto

O Dashboard é a primeira tela operacional da plataforma. Ele centraliza o check-in do dia, indicadores de streak, progresso das Trilhas ativas e atalhos determinísticos para continuar os estudos.

---

## 2. Regras de Negócio (RN)

- **[DASH-RN-001] Trilha ativa**: Uma Trilha ativa possui ao menos um Recurso e não está concluída.
- **[DASH-RN-002] Limite de continuidade**: A seleção `Continuar estudando` contém no máximo cinco Recursos.
- **[DASH-RN-003] Seleção principal**: Havendo Recursos `Em andamento`, a seleção contém até cinco deles, ordenados por atualização mais recente.
- **[DASH-RN-004] Seleção alternativa**: Não havendo Recurso `Em andamento`, são consideradas até cinco Trilhas ativas por atualização mais recente e selecionado o primeiro Recurso `Não iniciado` de cada uma conforme a ordem manual.
- **[DASH-RN-005] Atualização significativa**: Alterações em campos, status, resposta de Prática ou requisitos de Projeto atualizam o `updatedAt` do Recurso e da Trilha associada.
- **[DASH-RN-006] Ausência de rastreamento**: A plataforma não registra visualizações de página nem eventos de último acesso para compor `Continuar estudando`.

---

## 3. Modalidade e Prioridade

- **DEVE / Must Have / Alta**: comportamento obrigatório para o MVP.
- **NÃO DEVE / Must Have / Alta**: comportamento proibido no MVP.

---

## 4. Requisitos Funcionais (RF)

- **[DASH-RF-001] Exibir Dashboard como primeira tela**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** A plataforma DEVE abrir o Dashboard como primeira tela funcional.
  - **Critério de Aceite:** Ao acessar a aplicação, o usuário visualiza diretamente o Dashboard, sem passar por landing page.

- **[DASH-RF-002] Disponibilizar check-in atual**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** O Dashboard DEVE permitir criar, editar e excluir, mediante confirmação, o Check-in da data atual em `America/Sao_Paulo`.
  - **Critério de Aceite:** Sem Check-in no dia, a ação cria um; com Check-in existente, nota e duração podem ser alteradas; a exclusão exige confirmação.

- **[DASH-RF-003] Exibir indicadores de continuidade**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** O Dashboard DEVE exibir streak atual, melhor streak e data do último Check-in.
  - **Critério de Aceite:** Os três valores exibidos correspondem aos valores calculados a partir do histórico de Check-ins.

- **[DASH-RF-004] Exibir Trilhas ativas**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** O Dashboard DEVE exibir as Trilhas ativas com seu progresso derivado.
  - **Critério de Aceite:** Trilhas vazias e concluídas não aparecem na lista; cada Trilha exibida contém ao menos um Recurso e não está concluída.

- **[DASH-RF-005] Exibir Continuar estudando**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** O Dashboard DEVE calcular e exibir `Continuar estudando` conforme `DASH-RN-002` a `DASH-RN-004`.
  - **Critério de Aceite:** A seleção nunca excede cinco itens e produz o mesmo resultado para o mesmo conjunto de Recursos, status, ordens e datas de atualização.

- **[DASH-RF-006] Acessar Recurso selecionado**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** Cada item de `Continuar estudando` DEVE fornecer acesso direto ao respectivo Recurso.
  - **Critério de Aceite:** Ao acionar um item, a aplicação apresenta o Recurso identificado pelo atalho.

- **[DASH-RF-007] Não usar histórico de visualização**
  - **Obrigatoriedade:** NÃO DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** O Dashboard NÃO DEVE depender de visualizações ou último acesso para ordenar `Continuar estudando`.
  - **Critério de Aceite:** Abrir um Recurso sem alterá-lo não modifica a seleção nem sua ordem.

---

## 5. Requisitos de Qualidade (RNF)

- **[DASH-RNF-001] Responsividade verificável**: O Dashboard DEVE permanecer utilizável em Chromium atual nos viewports `1366x768` e `390x844`, sem sobreposição de controles ou perda das ações de Check-in.
- **[DASH-RNF-002] Operação direta**: O Dashboard NÃO DEVE apresentar landing page, hero de marketing ou etapa intermediária antes das operações.

---

## 6. Restrições Técnicas e de Projeto (CT)

- **[DASH-CT-001]**: Os dados exibidos DEVEM ser obtidos pela API; o frontend não pode acessar Prisma ou SQLite diretamente.
- **[DASH-CT-002]**: Os limites diários DEVEM usar o fuso `America/Sao_Paulo`.
- **[DASH-CT-003]**: O Dashboard depende das funcionalidades de Trilhas, Recursos e Check-ins.

---

## 7. Lacunas e Questões de Elicitação

Nenhuma lacuna aberta. O documento foi aprovado pelo usuário.

### Checklist de Qualidade IREB (Autoavaliação)
- [x] **Necessário**: Todos os requisitos derivam do objetivo de retomada rápida dos estudos.
- [x] **Não-ambíguo**: Limites, filtros e ordenações estão definidos.
- [x] **Completo**: Fluxos principal e alternativo de seleção foram cobertos.
- [x] **Consistente**: As regras são compatíveis com Trilhas, Recursos e Check-ins.
- [x] **Verificável**: Cada RF possui critério de aceite determinístico.
- [x] **Viável**: A seleção usa dados já previstos no MVP.
- [x] **Priorizado**: Modalidade e prioridade foram aplicadas.
- [x] **Rastreável e Versionado**: IDs, origem, versão e histórico estão presentes.

> **Status da Validação**: Aprovado, sem conflitos detectados.
