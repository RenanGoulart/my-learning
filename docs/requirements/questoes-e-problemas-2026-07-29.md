# [QP] Especificação de Requisitos: Questões e Problemas

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
| **0.1.0** | 2026-07-29 | Em Revisão | Extração inicial dos requisitos de Questões e Problemas. | Agente de Requisitos IREB |
| **1.0.0** | 2026-07-30 | Aprovado | Requisitos validados e aprovados pelo usuário. | Usuário |

## 1. Visão Geral e Contexto

Questão e Problema são formatos de Prática manualmente elaborados. Ambos possuem enunciado obrigatório e uma única resposta atual opcional, sem correção automática ou histórico de tentativas.

---

## 2. Regras de Negócio (RN)

- **[QP-RN-001] Autoria manual**: Questões e Problemas são cadastrados manualmente pelo usuário.
- **[QP-RN-002] Enunciado obrigatório**: Cada Questão ou Problema possui enunciado não vazio.
- **[QP-RN-003] Resposta única atual**: A resposta é opcional e somente seu valor atual é mantido.
- **[QP-RN-004] Conclusão manual**: O status da Prática é alterado manualmente e não deriva da existência da resposta.

---

## 3. Modalidade e Prioridade

- **DEVE / Must Have / Alta**: comportamento obrigatório para o MVP.
- **NÃO DEVE / Must Have / Alta**: comportamento proibido no MVP.

---

## 4. Requisitos Funcionais (RF)

- **[QP-RF-001] Criar Questão ou Problema**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** A plataforma DEVE permitir criar Prática no formato `Questão` ou `Problema` com título e enunciado não vazio.
  - **Critério de Aceite:** Dados válidos criam o Recurso; enunciado vazio é rejeitado junto ao campo.

- **[QP-RF-002] Consultar e editar enunciado**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** A plataforma DEVE exibir e permitir alterar o enunciado de Questão ou Problema.
  - **Critério de Aceite:** Após alteração válida, a consulta retorna o novo enunciado.

- **[QP-RF-003] Salvar resposta atual**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** A plataforma DEVE permitir salvar, alterar ou remover a resposta livre atual.
  - **Critério de Aceite:** Cada salvamento substitui o valor anterior; remover a resposta deixa o campo sem valor.

- **[QP-RF-004] Manter status independente**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** A plataforma DEVE manter o status do Recurso independente da presença ou conteúdo da resposta.
  - **Critério de Aceite:** Salvar ou remover uma resposta não altera o status; o usuário pode alterar o status separadamente.

- **[QP-RF-005] Não gerar conteúdo**
  - **Obrigatoriedade:** NÃO DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** O MVP NÃO DEVE gerar Questões, Problemas, enunciados ou respostas por IA ou API externa.
  - **Critério de Aceite:** Não existe ação ou integração que gere automaticamente esses conteúdos.

- **[QP-RF-006] Não corrigir resposta**
  - **Obrigatoriedade:** NÃO DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** O MVP NÃO DEVE corrigir, pontuar ou classificar a resposta.
  - **Critério de Aceite:** Salvar resposta não produz nota, acerto, erro ou feedback automático.

- **[QP-RF-007] Não manter tentativas**
  - **Obrigatoriedade:** NÃO DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** O MVP NÃO DEVE manter histórico de versões ou tentativas de resposta.
  - **Critério de Aceite:** Após substituir a resposta, somente o valor atual é recuperável pela aplicação e pelo snapshot.

---

## 5. Requisitos de Qualidade (RNF)

- **[QP-RNF-001] Preservação de entrada**: Falha ao salvar DEVE manter enunciado e resposta preenchidos.
- **[QP-RNF-002] Validação localizada**: Enunciado vazio DEVE produzir mensagem junto ao campo correspondente.

---

## 6. Restrições Técnicas e de Projeto (CT)

- **[QP-CT-001]**: Os identificadores persistidos são `QUESTION` e `PROBLEM`.
- **[QP-CT-002]**: A resposta atual usa `PracticeAnswer` e não possui coleção de tentativas.
- **[QP-CT-003]**: Exclusão e conversão seguem a especificação de Recursos.

---

## 7. Lacunas e Questões de Elicitação

Nenhuma lacuna aberta. O documento foi aprovado pelo usuário.

### Checklist de Qualidade IREB (Autoavaliação)
- [x] **Necessário**: Os requisitos cobrem a prática por resposta livre.
- [x] **Não-ambíguo**: Obrigatoriedade do enunciado e cardinalidade da resposta estão definidas.
- [x] **Completo**: Autoria, edição, resposta e proibições foram cobertas.
- [x] **Consistente**: A conclusão permanece manual.
- [x] **Verificável**: Critérios distinguem entrada válida, vazia e substituição.
- [x] **Viável**: Uma única resposta atual reduz complexidade.
- [x] **Priorizado**: Modalidade e prioridade foram aplicadas.
- [x] **Rastreável e Versionado**: IDs, origem, versão e histórico estão presentes.

> **Status da Validação**: Aprovado, sem conflitos detectados.
