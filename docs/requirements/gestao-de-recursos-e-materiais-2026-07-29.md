# [RECURSO] Especificação de Requisitos: Gestão de Recursos e Materiais

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
| **0.1.0** | 2026-07-29 | Em Revisão | Extração inicial dos requisitos de Recursos e Materiais. | Agente de Requisitos IREB |
| **1.0.0** | 2026-07-30 | Aprovado | Requisitos validados e aprovados pelo usuário. | Usuário |

## 1. Visão Geral e Contexto

Um Recurso pertence a uma Trilha e representa um Material ou uma Prática. Esta especificação cobre campos comuns, Materiais, status, ordem, conversão e exclusão; os formatos de Prática são detalhados em documentos próprios.

---

## 2. Regras de Negócio (RN)

- **[RECURSO-RN-001] Categorias**: Um Recurso pertence exatamente a `Material` ou `Prática`.
- **[RECURSO-RN-002] Status**: Os únicos status são `Não iniciado`, `Em andamento` e `Concluído`.
- **[RECURSO-RN-003] Formatos de Material**: Os formatos são `Curso`, `Documentação`, `Artigo`, `Vídeo`, `Livro` e `Outro`.
- **[RECURSO-RN-004] Formato compatível**: Formatos de Material não são válidos para Prática e formatos de Prática não são válidos para Material.
- **[RECURSO-RN-005] URL opcional**: A URL de Material pode ser omitida; quando informada, deve ser absoluta e usar `http` ou `https`.
- **[RECURSO-RN-006] Ordem manual**: Cada Recurso possui posição manual dentro de sua Trilha.
- **[RECURSO-RN-007] Títulos repetidos**: Recursos podem possuir títulos iguais e são diferenciados por seus identificadores.
- **[RECURSO-RN-008] Identificadores de máquina**: API, banco e JSON usam os identificadores ASCII definidos na spec de origem; a interface usa rótulos em português.

---

## 3. Modalidade e Prioridade

- **DEVE / Must Have / Alta**: comportamento obrigatório para o MVP.
- **NÃO DEVE / Must Have / Alta**: comportamento proibido no MVP.

---

## 4. Requisitos Funcionais (RF)

- **[RECURSO-RF-001] Criar Recurso**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** A plataforma DEVE criar um Recurso em uma Trilha com título, categoria, formato e status válidos, descrição opcional e posição manual.
  - **Critério de Aceite:** Dados válidos criam o Recurso associado à Trilha; categoria ou formato incompatível é rejeitado com erro de campo.

- **[RECURSO-RF-002] Criar Material**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** A plataforma DEVE permitir criar Material em qualquer formato de `RECURSO-RN-003`, com URL opcional.
  - **Critério de Aceite:** Material sem URL é aceito; URLs `https://example.com` e `http://example.com` são aceitas.

- **[RECURSO-RF-003] Validar URL**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** A plataforma DEVE rejeitar URL relativa, malformada, caminho local ou protocolo diferente de `http` e `https`.
  - **Critério de Aceite:** `file://`, `javascript:`, `/curso` e texto sem URL são rejeitados quando fornecidos no campo URL.

- **[RECURSO-RF-004] Consultar e editar Recurso**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** A plataforma DEVE apresentar e permitir alterar os campos válidos de um Recurso.
  - **Critério de Aceite:** Após salvar uma alteração válida, a consulta retorna os novos valores e atualiza `updatedAt` do Recurso e da Trilha.

- **[RECURSO-RF-005] Alterar status**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** A plataforma DEVE permitir transições manuais entre os três status de `RECURSO-RN-002`.
  - **Critério de Aceite:** Qualquer status válido pode substituir o atual e provoca recálculo da Trilha; outros valores são rejeitados.

- **[RECURSO-RF-006] Reordenar Recurso**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** A plataforma DEVE permitir mudar a posição do Recurso dentro de sua Trilha.
  - **Critério de Aceite:** A sequência persistida corresponde à ordem confirmada pelo usuário.

- **[RECURSO-RF-007] Converter categoria ou formato**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** A plataforma DEVE validar os campos obrigatórios do destino, preservar título, descrição, status e posição e listar dados incompatíveis antes da conversão.
  - **Critério de Aceite:** Sem dados obrigatórios, a conversão é rejeitada; havendo descarte, ela não ocorre sem confirmação.

- **[RECURSO-RF-008] Remover dados incompatíveis atomicamente**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** Após confirmação, a plataforma DEVE remover atomicamente URL ao sair de Material; prompt, resposta, requisitos e frente/verso ao sair de Prática para Material; requisitos ao sair de Projeto; frente/verso ao sair de Flashcard; e prompt e resposta ao entrar em Flashcard.
  - **Critério de Aceite:** A conversão concluída não mantém campos incompatíveis; falha ou cancelamento preserva integralmente o Recurso original.

- **[RECURSO-RF-009] Excluir Recurso**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** A plataforma DEVE exigir confirmação e excluir atomicamente o Recurso, sua Resposta de prática e seus requisitos de Projeto, quando existentes.
  - **Critério de Aceite:** Cancelar mantém os dados; confirmar remove o agregado e recalcula a Trilha.

- **[RECURSO-RF-010] Não fornecer recuperação local**
  - **Obrigatoriedade:** NÃO DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** O MVP NÃO DEVE fornecer lixeira ou desfazer para exclusão de Recurso.
  - **Critério de Aceite:** Recurso excluído somente pode ser recuperado por snapshot previamente exportado.

---

## 5. Requisitos de Qualidade (RNF)

- **[RECURSO-RNF-001] Atomicidade de conversão**: Conversões DEVEM concluir todas as remoções e alterações ou preservar o estado original.
- **[RECURSO-RNF-002] Erros preservando entrada**: Erros de campo DEVEM aparecer junto ao controle e manter os demais valores preenchidos.
- **[RECURSO-RNF-003] Localização estável**: Alterar rótulos da interface NÃO DEVE alterar identificadores persistidos ou exportados.

---

## 6. Restrições Técnicas e de Projeto (CT)

- **[RECURSO-CT-001]**: Categorias usam `MATERIAL` e `PRACTICE`.
- **[RECURSO-CT-002]**: Formatos de Material usam `COURSE`, `DOCUMENTATION`, `ARTICLE`, `VIDEO`, `BOOK` e `OTHER`.
- **[RECURSO-CT-003]**: Status usam `NOT_STARTED`, `IN_PROGRESS` e `COMPLETED`.
- **[RECURSO-CT-004]**: Persistência e validação DEVEM ocorrer pela API.

---

## 7. Lacunas e Questões de Elicitação

Nenhuma lacuna aberta. O documento foi aprovado pelo usuário.

### Checklist de Qualidade IREB (Autoavaliação)
- [x] **Necessário**: Os requisitos cobrem os itens centrais de estudo.
- [x] **Não-ambíguo**: Categorias, formatos, protocolos, status e conversões estão enumerados.
- [x] **Completo**: CRUD, URL, ordem, conversão e exclusão foram cobertos.
- [x] **Consistente**: Dados específicos são compatíveis com categoria e formato.
- [x] **Verificável**: Entradas válidas e inválidas possuem resultados determinísticos.
- [x] **Viável**: As operações são compatíveis com transações locais.
- [x] **Priorizado**: Requisitos do MVP estão como DEVE/Must Have/Alta.
- [x] **Rastreável e Versionado**: IDs, origem, versão e histórico estão presentes.

> **Status da Validação**: Aprovado, sem conflitos detectados.
