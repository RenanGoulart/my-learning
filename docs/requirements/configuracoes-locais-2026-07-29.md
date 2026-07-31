# [CONFIG] Especificação de Requisitos: Configurações Locais

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
| **0.1.0** | 2026-07-29 | Em Revisão | Extração inicial dos requisitos de operação local. | Agente de Requisitos IREB |
| **1.0.0** | 2026-07-30 | Aprovado | Requisitos validados e aprovados pelo usuário. | Usuário |

## 1. Visão Geral e Contexto

A área de Configurações Locais informa como os dados do MVP são armazenados e fornece acesso às operações manuais de importação e exportação.

---

## 2. Regras de Negócio (RN)

- **[CONFIG-RN-001] Operação local**: O MVP usa banco SQLite local.
- **[CONFIG-RN-002] Transparência de armazenamento**: O usuário deve conseguir identificar onde o arquivo SQLite está localizado.

---

## 3. Modalidade e Prioridade

- **DEVE / Must Have / Alta**: comportamento obrigatório para o MVP.

---

## 4. Requisitos Funcionais (RF)

- **[CONFIG-RF-001] Exibir localização do banco**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** A plataforma DEVE exibir a localização efetiva do arquivo SQLite usado pela instância local.
  - **Critério de Aceite:** O caminho apresentado corresponde ao arquivo utilizado pela API em execução.

- **[CONFIG-RF-002] Acessar exportação**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** A área DEVE oferecer acesso à exportação manual do snapshot JSON.
  - **Critério de Aceite:** A ação inicia o fluxo definido em `JSON-RF-001`.

- **[CONFIG-RF-003] Acessar importação**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** A área DEVE oferecer acesso à importação manual do snapshot JSON.
  - **Critério de Aceite:** A ação inicia validação, resumo e confirmação definidos na especificação JSON.

---

## 5. Requisitos de Qualidade (RNF)

- **[CONFIG-RNF-001] Fidelidade da informação**: O caminho exibido DEVE refletir a configuração efetivamente carregada pela API.
- **[CONFIG-RNF-002] Responsividade**: As informações e ações DEVEM permanecer utilizáveis em Chromium atual nos viewports `1366x768` e `390x844`.

---

## 6. Restrições Técnicas e de Projeto (CT)

- **[CONFIG-CT-001]**: O arquivo SQLite DEVE permanecer fora de saídas de build geradas.
- **[CONFIG-CT-002]**: A área não configura autenticação, usuários ou sincronização no MVP.
- **[CONFIG-CT-003]**: Importação e exportação seguem o documento `[JSON]`.

---

## 7. Lacunas e Questões de Elicitação

Nenhuma lacuna aberta. O documento foi aprovado pelo usuário.

### Checklist de Qualidade IREB (Autoavaliação)
- [x] **Necessário**: A informação permite operar e proteger a instalação local.
- [x] **Não-ambíguo**: O dado exibido é o caminho efetivamente utilizado.
- [x] **Completo**: Localização, importação e exportação foram cobertas.
- [x] **Consistente**: Não introduz configurações fora do MVP.
- [x] **Verificável**: O caminho pode ser comparado à configuração da API.
- [x] **Viável**: A API conhece a localização do SQLite.
- [x] **Priorizado**: Requisitos do MVP estão como DEVE/Must Have/Alta.
- [x] **Rastreável e Versionado**: IDs, origem, versão e histórico estão presentes.

> **Status da Validação**: Aprovado, sem conflitos detectados.
