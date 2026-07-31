# [JSON] Especificação de Requisitos: Importação e Exportação JSON

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
| **0.1.0** | 2026-07-29 | Em Revisão | Extração inicial dos requisitos de backup JSON. | Agente de Requisitos IREB |
| **1.0.0** | 2026-07-30 | Aprovado | Requisitos validados e aprovados pelo usuário. | Usuário |

## 1. Visão Geral e Contexto

Exportação e importação JSON fornecem segurança e portabilidade dos dados locais. O snapshot é completo e versionado; a importação substitui integralmente o conjunto atual, sem mesclagem.

---

## 2. Regras de Negócio (RN)

- **[JSON-RN-001] Snapshot completo**: O snapshot contém Trilhas, Recursos, Respostas de prática, requisitos de Projeto e Check-ins.
- **[JSON-RN-002] Restauração fiel**: Identificadores, relacionamentos, ordem manual e timestamps são preservados.
- **[JSON-RN-003] Substituição total**: Importação substitui o conjunto local atual; não existe mesclagem no MVP.
- **[JSON-RN-004] Confirmação obrigatória**: Nenhuma substituição ocorre sem validação, resumo e confirmação explícita.
- **[JSON-RN-005] Atomicidade**: Importação conclui integralmente ou preserva integralmente os dados anteriores.
- **[JSON-RN-006] Histórico permitido**: Snapshot válido pode conter Check-ins históricos.

---

## 3. Modalidade e Prioridade

- **DEVE / Must Have / Alta**: comportamento obrigatório para o MVP.
- **NÃO DEVE / Must Have / Alta**: comportamento proibido no MVP.

---

## 4. Requisitos Funcionais (RF)

- **[JSON-RF-001] Exportar snapshot**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** A plataforma DEVE produzir manualmente um snapshot JSON com versão de formato e todos os dados de `JSON-RN-001` e `JSON-RN-002`.
  - **Critério de Aceite:** O arquivo exportado contém a versão e permite reconstruir entidades, vínculos, ordens e timestamps.

- **[JSON-RF-002] Formatar JSON legível**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** O snapshot DEVE usar UTF-8, indentação de dois espaços, nomes de campos alinhados aos contratos compartilhados e datas ISO 8601.
  - **Critério de Aceite:** O arquivo decodifica como UTF-8, usa dois espaços por nível, mantém os nomes dos contratos e todas as datas passam por validação ISO 8601.

- **[JSON-RF-003] Validar antes de importar**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** A plataforma DEVE validar sintaxe, estrutura, versão, registros, relacionamentos e regras de negócio antes de escrever.
  - **Critério de Aceite:** JSON inválido, versão não suportada ou registro inválido não altera o banco.

- **[JSON-RF-004] Resumir impacto**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** Após validação, a plataforma DEVE apresentar resumo dos grupos de dados presentes e avisar que os dados atuais serão substituídos.
  - **Critério de Aceite:** Antes da confirmação, o usuário visualiza os grupos incluídos e a advertência de substituição total.

- **[JSON-RF-005] Exigir confirmação**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** A plataforma DEVE exigir ação explícita de confirmação antes de iniciar a escrita.
  - **Critério de Aceite:** Cancelar a confirmação mantém o banco inalterado.

- **[JSON-RF-006] Revalidar e substituir**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** Após confirmação, a API DEVE revalidar o snapshot e substituir os dados em uma única transação.
  - **Critério de Aceite:** Snapshot válido substitui integralmente os dados; qualquer falha faz rollback completo.

- **[JSON-RF-007] Restaurar histórico**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** A importação DEVE restaurar Check-ins históricos válidos e torná-los imediatamente somente leitura.
  - **Critério de Aceite:** Após importação, histórico e streaks refletem os registros restaurados e não permitem edição passada.

- **[JSON-RF-008] Informar erro**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** A plataforma DEVE informar erro de JSON inválido, versão não suportada, registro inválido ou falha de banco sem substituir dados.
  - **Critério de Aceite:** Cada classe de falha retorna código de máquina e mensagem ao usuário; o conjunto anterior permanece consultável.

- **[JSON-RF-009] Não mesclar**
  - **Obrigatoriedade:** NÃO DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** O MVP NÃO DEVE combinar registros do snapshot com registros atuais.
  - **Critério de Aceite:** Após importação válida, somente o conjunto descrito pelo snapshot permanece.

---

## 5. Requisitos de Qualidade (RNF)

- **[JSON-RNF-001] Integridade transacional**: Falha em qualquer etapa de escrita DEVE resultar em rollback completo.
- **[JSON-RNF-002] Portabilidade textual**: O arquivo DEVE poder ser aberto por editor compatível com UTF-8 sem transformação adicional.
- **[JSON-RNF-003] Compatibilidade versionada**: Versão não suportada DEVE ser rejeitada antes de qualquer exclusão.

---

## 6. Restrições Técnicas e de Projeto (CT)

- **[JSON-CT-001]**: Identificadores de categoria, formato e status usam valores ASCII dos contratos.
- **[JSON-CT-002]**: Importação e exportação são manuais no MVP.
- **[JSON-CT-003]**: O snapshot não é mecanismo de sincronização entre máquinas.

---

## 7. Lacunas e Questões de Elicitação

Nenhuma lacuna aberta. O documento foi aprovado pelo usuário.

### Checklist de Qualidade IREB (Autoavaliação)
- [x] **Necessário**: O recurso protege e transporta dados locais.
- [x] **Não-ambíguo**: Conteúdo, formato, substituição e rollback estão definidos.
- [x] **Completo**: Exportação, validação, confirmação, importação e erros foram cobertos.
- [x] **Consistente**: A restauração histórica respeita a imutabilidade posterior.
- [x] **Verificável**: Formatação e cenários transacionais são testáveis.
- [x] **Viável**: O fluxo usa JSON e transação local.
- [x] **Priorizado**: Requisitos do MVP estão como DEVE/Must Have/Alta.
- [x] **Rastreável e Versionado**: IDs, origem, versão e histórico estão presentes.

> **Status da Validação**: Aprovado, sem conflitos detectados.
