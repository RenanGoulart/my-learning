# [TRILHA] Especificação de Requisitos: Gestão de Trilhas

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
| **0.1.0** | 2026-07-29 | Em Revisão | Extração inicial dos requisitos de Trilhas. | Agente de Requisitos IREB |
| **1.0.0** | 2026-07-30 | Aprovado | Requisitos validados e aprovados pelo usuário. | Usuário |

## 1. Visão Geral e Contexto

Uma Trilha organiza um objetivo de aprendizagem por meio de Recursos manualmente ordenados. A ordem orienta o estudo, mas não bloqueia acesso nem alteração de progresso.

---

## 2. Regras de Negócio (RN)

- **[TRILHA-RN-001] Progresso derivado**: O progresso corresponde à proporção de Recursos com status `Concluído`.
- **[TRILHA-RN-002] Trilha vazia**: Uma Trilha sem Recursos possui progresso de 0% e não está concluída.
- **[TRILHA-RN-003] Conclusão**: Uma Trilha está concluída somente quando possui ao menos um Recurso e todos estão `Concluído`.
- **[TRILHA-RN-004] Recálculo**: Adicionar, remover ou alterar o status de um Recurso recalcula progresso e conclusão.
- **[TRILHA-RN-005] Reabertura**: Adicionar Recurso incompleto ou retirar um Recurso de `Concluído` reabre a Trilha.
- **[TRILHA-RN-006] Ordem consultiva**: A ordem manual orienta o estudo e não constitui pré-requisito ou bloqueio.
- **[TRILHA-RN-007] Títulos repetidos**: Trilhas podem possuir títulos iguais e são diferenciadas por seus identificadores.

---

## 3. Modalidade e Prioridade

- **DEVE / Must Have / Alta**: comportamento obrigatório para o MVP.
- **NÃO DEVE / Must Have / Alta**: comportamento proibido no MVP.

---

## 4. Requisitos Funcionais (RF)

- **[TRILHA-RF-001] Criar Trilha**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** A plataforma DEVE permitir criar uma Trilha com título obrigatório e descrição e objetivo opcionais.
  - **Critério de Aceite:** Uma entrada válida cria uma Trilha identificável; descrição e objetivo podem ser omitidos.

- **[TRILHA-RF-002] Listar e consultar Trilhas**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** A plataforma DEVE listar Trilhas e apresentar seus dados, Recursos ordenados, progresso e conclusão.
  - **Critério de Aceite:** A consulta de uma Trilha retorna os dados persistidos e Recursos em ordem manual.

- **[TRILHA-RF-003] Editar Trilha**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** A plataforma DEVE permitir alterar título, descrição e objetivo de uma Trilha.
  - **Critério de Aceite:** Após salvar dados válidos, uma nova consulta retorna os valores alterados.

- **[TRILHA-RF-004] Calcular progresso**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** A plataforma DEVE calcular o progresso conforme `TRILHA-RN-001` a `TRILHA-RN-005`.
  - **Critério de Aceite:** Com dois Recursos e um concluído, a proporção é 1/2; sem Recursos, o progresso é 0% e a Trilha não está concluída.

- **[TRILHA-RF-005] Reordenar Recursos**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** A plataforma DEVE permitir reorganizar manualmente os Recursos de uma Trilha.
  - **Critério de Aceite:** Após salvar uma nova ordem, consultas posteriores retornam a mesma sequência.

- **[TRILHA-RF-006] Manter acesso independente da ordem**
  - **Obrigatoriedade:** NÃO DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** A plataforma NÃO DEVE bloquear acesso ou mudança de status de um Recurso por causa de sua posição.
  - **Critério de Aceite:** Qualquer Recurso da Trilha pode ser acessado e atualizado independentemente dos anteriores.

- **[TRILHA-RF-007] Excluir Trilha em cascata**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** A plataforma DEVE mostrar quantos Recursos serão removidos, exigir confirmação e excluir atomicamente a Trilha, seus Recursos, Respostas de prática e requisitos de Projeto.
  - **Critério de Aceite:** Cancelar mantém todos os dados; confirmar remove todo o agregado; falha de persistência mantém o agregado original.

- **[TRILHA-RF-008] Não fornecer lixeira**
  - **Obrigatoriedade:** NÃO DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** O MVP NÃO DEVE fornecer lixeira ou desfazer para exclusão de Trilha.
  - **Critério de Aceite:** Após exclusão confirmada, a recuperação somente é possível por importação de snapshot previamente exportado.

---

## 5. Requisitos de Qualidade (RNF)

- **[TRILHA-RNF-001] Atomicidade**: A exclusão em cascata DEVE ser concluída integralmente ou não alterar nenhum registro.
- **[TRILHA-RNF-002] Consistência derivada**: Progresso, conclusão e classificação ativa DEVEM refletir o estado atual dos Recursos em toda consulta.

---

## 6. Restrições Técnicas e de Projeto (CT)

- **[TRILHA-CT-001]**: Progresso, conclusão e classificação ativa NÃO DEVEM ser armazenados como estados manualmente atribuídos.
- **[TRILHA-CT-002]**: A Trilha DEVE possuir identificador estável e timestamps.
- **[TRILHA-CT-003]**: A persistência DEVE ocorrer exclusivamente pela API.

---

## 7. Lacunas e Questões de Elicitação

Nenhuma lacuna aberta. O documento foi aprovado pelo usuário.

### Checklist de Qualidade IREB (Autoavaliação)
- [x] **Necessário**: Os requisitos sustentam a unidade principal de organização dos estudos.
- [x] **Não-ambíguo**: Estados vazio, completo, reaberto e ativo estão definidos.
- [x] **Completo**: CRUD, ordem, progresso e exclusão foram cobertos.
- [x] **Consistente**: Não há status manual de Trilha conflitante com o progresso derivado.
- [x] **Verificável**: Os critérios permitem testes determinísticos.
- [x] **Viável**: As operações são compatíveis com o modelo definido.
- [x] **Priorizado**: Requisitos do MVP estão como DEVE/Must Have/Alta.
- [x] **Rastreável e Versionado**: IDs, origem, versão e histórico estão presentes.

> **Status da Validação**: Aprovado, sem conflitos detectados.
