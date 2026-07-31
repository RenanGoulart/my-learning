# [FLASH] Especificação de Requisitos: Flashcards

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
| **0.1.0** | 2026-07-29 | Em Revisão | Extração inicial dos requisitos de Flashcards. | Agente de Requisitos IREB |
| **1.0.0** | 2026-07-30 | Aprovado | Requisitos validados e aprovados pelo usuário. | Usuário |

## 1. Visão Geral e Contexto

Flashcard é uma Prática manualmente elaborada com frente e verso obrigatórios. A revisão revela o verso, mas não armazena a tentativa de recordação do usuário.

---

## 2. Regras de Negócio (RN)

- **[FLASH-RN-001] Autoria manual**: Frente e verso são cadastrados pelo usuário.
- **[FLASH-RN-002] Conteúdo obrigatório**: Frente e verso possuem conteúdo não vazio.
- **[FLASH-RN-003] Sem resposta de prática**: Flashcard não possui `PracticeAnswer`.
- **[FLASH-RN-004] Status manual**: Revelar o verso não altera o status do Recurso.

---

## 3. Modalidade e Prioridade

- **DEVE / Must Have / Alta**: comportamento obrigatório para o MVP.
- **NÃO DEVE / Must Have / Alta**: comportamento proibido no MVP.

---

## 4. Requisitos Funcionais (RF)

- **[FLASH-RF-001] Criar Flashcard**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** A plataforma DEVE permitir criar Flashcard com título, frente e verso não vazios.
  - **Critério de Aceite:** Dados válidos criam o Flashcard; frente ou verso vazio é rejeitado junto ao campo.

- **[FLASH-RF-002] Consultar e editar Flashcard**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** A plataforma DEVE permitir consultar e alterar frente e verso.
  - **Critério de Aceite:** Após salvar conteúdo válido, nova consulta retorna os valores alterados.

- **[FLASH-RF-003] Ocultar verso antes da revelação**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** Durante a revisão, a plataforma DEVE apresentar a frente sem exibir o verso antes da ação de revelação.
  - **Critério de Aceite:** Ao iniciar a revisão, a frente está visível e o verso não está apresentado.

- **[FLASH-RF-004] Revelar verso**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** A plataforma DEVE revelar o verso mediante ação explícita do usuário.
  - **Critério de Aceite:** Após a ação de revelar, o verso cadastrado é apresentado.

- **[FLASH-RF-005] Não persistir recordação**
  - **Obrigatoriedade:** NÃO DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** A plataforma NÃO DEVE solicitar ou persistir o que o usuário tentou recordar durante a revisão.
  - **Critério de Aceite:** Nenhum campo de tentativa é exibido ou incluído no banco e no snapshot.

- **[FLASH-RF-006] Não alterar status ao revelar**
  - **Obrigatoriedade:** NÃO DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** A revelação do verso NÃO DEVE alterar o status do Flashcard.
  - **Critério de Aceite:** O status antes e depois da revelação é o mesmo.

- **[FLASH-RF-007] Não gerar Flashcard**
  - **Obrigatoriedade:** NÃO DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** O MVP NÃO DEVE gerar frente ou verso por IA ou API externa.
  - **Critério de Aceite:** Não existe ação ou integração de geração automática.

---

## 5. Requisitos de Qualidade (RNF)

- **[FLASH-RNF-001] Integridade visual**: Em `1366x768` e `390x844`, frente, ação de revelar e verso revelado DEVEM permanecer legíveis e sem sobreposição.
- **[FLASH-RNF-002] Preservação de entrada**: Falha ao salvar DEVE manter frente e verso preenchidos.

---

## 6. Restrições Técnicas e de Projeto (CT)

- **[FLASH-CT-001]**: O identificador persistido do formato é `FLASHCARD`.
- **[FLASH-CT-002]**: Flashcard não possui entidade `PracticeAnswer`.
- **[FLASH-CT-003]**: Conversão para Flashcard remove prompt e resposta anterior após confirmação.

---

## 7. Lacunas e Questões de Elicitação

Nenhuma lacuna aberta. O documento foi aprovado pelo usuário.

### Checklist de Qualidade IREB (Autoavaliação)
- [x] **Necessário**: Os requisitos cobrem revisão manual por frente e verso.
- [x] **Não-ambíguo**: Conteúdo obrigatório e revelação estão definidos.
- [x] **Completo**: Criação, edição, revisão e proibições foram cobertas.
- [x] **Consistente**: Não há conflito com resposta livre ou status manual.
- [x] **Verificável**: Visibilidade e persistência possuem critérios observáveis.
- [x] **Viável**: O fluxo não depende de geração ou avaliação externa.
- [x] **Priorizado**: Modalidade e prioridade foram aplicadas.
- [x] **Rastreável e Versionado**: IDs, origem, versão e histórico estão presentes.

> **Status da Validação**: Aprovado, sem conflitos detectados.
