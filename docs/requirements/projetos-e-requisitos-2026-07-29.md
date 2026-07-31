# [PROJ] Especificação de Requisitos: Projetos e Requisitos

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
| **0.1.0** | 2026-07-29 | Em Revisão | Extração inicial dos requisitos de Projetos. | Agente de Requisitos IREB |
| **1.0.0** | 2026-07-30 | Aprovado | Requisitos validados e aprovados pelo usuário. | Usuário |

## 1. Visão Geral e Contexto

Projeto é uma Prática com enunciado, resposta atual opcional e checklist ordenável de requisitos. Cenários curtos anteriormente denominados mini-cases são representados pelo mesmo formato.

---

## 2. Regras de Negócio (RN)

- **[PROJ-RN-001] Formato canônico**: `Mini-case` não é formato separado; exercícios baseados em cenário usam `Projeto`.
- **[PROJ-RN-002] Enunciado obrigatório**: Todo Projeto possui enunciado não vazio.
- **[PROJ-RN-003] Requisito mínimo**: Todo Projeto possui ao menos um requisito com texto não vazio.
- **[PROJ-RN-004] Checklist ordenável**: Cada requisito possui texto, ordem manual e marcação independente de conclusão.
- **[PROJ-RN-005] Último requisito protegido**: O último requisito não pode ser excluído enquanto o Recurso permanecer como Projeto.
- **[PROJ-RN-006] Status independente**: Marcar requisitos não altera automaticamente o status do Projeto.

---

## 3. Modalidade e Prioridade

- **DEVE / Must Have / Alta**: comportamento obrigatório para o MVP.
- **NÃO DEVE / Must Have / Alta**: comportamento proibido no MVP.

---

## 4. Requisitos Funcionais (RF)

- **[PROJ-RF-001] Criar Projeto**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** A plataforma DEVE criar Projeto somente com título, enunciado não vazio e ao menos um requisito não vazio.
  - **Critério de Aceite:** Projeto válido é criado; ausência de enunciado ou requisito produz erro no respectivo campo.

- **[PROJ-RF-002] Representar cenário curto**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** A plataforma DEVE usar o formato Projeto para exercícios curtos baseados em cenário.
  - **Critério de Aceite:** A lista de formatos não contém `Mini-case` e contém `Projeto`.

- **[PROJ-RF-003] Manter requisitos**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** A plataforma DEVE permitir criar, editar, excluir e consultar requisitos do Projeto.
  - **Critério de Aceite:** As operações persistem texto e vínculo ao Projeto; texto vazio é rejeitado.

- **[PROJ-RF-004] Reordenar requisitos**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** A plataforma DEVE permitir alterar a ordem manual dos requisitos.
  - **Critério de Aceite:** Após salvar, consultas posteriores retornam a sequência confirmada.

- **[PROJ-RF-005] Marcar requisito**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** A plataforma DEVE permitir marcar e desmarcar cada requisito independentemente.
  - **Critério de Aceite:** Alterar um requisito não modifica os demais nem o status do Recurso.

- **[PROJ-RF-006] Impedir exclusão do último requisito**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** A plataforma DEVE rejeitar a exclusão que deixaria o Projeto sem requisitos.
  - **Critério de Aceite:** Com um único requisito, a exclusão falha e preserva o requisito; com dois ou mais, a exclusão é permitida.

- **[PROJ-RF-007] Salvar resposta atual**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** A plataforma DEVE permitir salvar, substituir ou remover uma resposta livre atual do Projeto.
  - **Critério de Aceite:** Somente a resposta mais recente é retornada; a resposta pode ser omitida.

- **[PROJ-RF-008] Não concluir automaticamente**
  - **Obrigatoriedade:** NÃO DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** A plataforma NÃO DEVE alterar o status do Projeto em função das marcações do checklist.
  - **Critério de Aceite:** Marcar todos os requisitos mantém o status anterior até mudança manual.

- **[PROJ-RF-009] Não corrigir nem manter tentativas**
  - **Obrigatoriedade:** NÃO DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** O MVP NÃO DEVE corrigir respostas nem armazenar histórico de tentativas.
  - **Critério de Aceite:** Salvar resposta não gera avaliação e substitui o valor anterior.

---

## 5. Requisitos de Qualidade (RNF)

- **[PROJ-RNF-001] Consistência do agregado**: Reordenação, exclusão e marcação DEVEM preservar ao menos um requisito válido.
- **[PROJ-RNF-002] Preservação de entrada**: Falhas DEVEM manter enunciado, resposta e requisitos preenchidos.

---

## 6. Restrições Técnicas e de Projeto (CT)

- **[PROJ-CT-001]**: O identificador persistido do formato é `PROJECT`.
- **[PROJ-CT-002]**: Requisitos são entidades `ProjectRequirement` incluídas em exclusões em cascata e snapshots.
- **[PROJ-CT-003]**: Conversão para outro formato segue a especificação de Recursos e remove requisitos após confirmação.

---

## 7. Lacunas e Questões de Elicitação

Nenhuma lacuna aberta. O documento foi aprovado pelo usuário.

### Checklist de Qualidade IREB (Autoavaliação)
- [x] **Necessário**: Os requisitos suportam exercícios orientados por entregáveis.
- [x] **Não-ambíguo**: Cardinalidade, ordem e independência de status estão definidas.
- [x] **Completo**: CRUD, ordem, marcação, resposta e conversão foram cobertos.
- [x] **Consistente**: Checklist e status do Recurso permanecem independentes.
- [x] **Verificável**: Cada operação possui resultado observável.
- [x] **Viável**: O modelo corresponde às entidades definidas.
- [x] **Priorizado**: Requisitos do MVP estão como DEVE/Must Have/Alta.
- [x] **Rastreável e Versionado**: IDs, origem, versão e histórico estão presentes.

> **Status da Validação**: Aprovado, sem conflitos detectados.
