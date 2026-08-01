# [CHECKIN] Especificação de Requisitos: Check-ins, Histórico e Streaks

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
| **0.1.0** | 2026-07-29 | Em Revisão | Extração inicial dos requisitos de Check-ins e Streaks. | Agente de Requisitos IREB |
| **1.0.0** | 2026-07-30 | Aprovado | Requisitos validados e aprovados pelo usuário. | Usuário |

## 1. Visão Geral e Contexto

O Check-in registra explicitamente que houve estudo em um dia. Ele é independente do progresso dos Recursos e sustenta histórico, streak atual e melhor streak.

---

## 2. Regras de Negócio (RN)

- **[CHECKIN-RN-001] Calendário oficial**: Datas e limites diários usam `America/Sao_Paulo`.
- **[CHECKIN-RN-002] Um registro por data**: Existe no máximo um Check-in por data.
- **[CHECKIN-RN-003] Cadastro no dia atual**: Cadastro manual somente pode ocorrer para a data atual; datas passadas e futuras são rejeitadas.
- **[CHECKIN-RN-004] Duração opcional**: `durationMinutes` pode ser omitido; quando informado, é inteiro entre 1 e 1.440.
- **[CHECKIN-RN-005] Independência**: Duração e progresso de Recursos não alteram a validade do Check-in nem o streak.
- **[CHECKIN-RN-006] Escrita idempotente**: A primeira escrita do dia cria o registro; escritas posteriores atualizam nota e duração no mesmo registro.
- **[CHECKIN-RN-007] Mutabilidade diária**: O Check-in atual pode ser editado ou excluído até o encerramento do dia; depois torna-se somente leitura.
- **[CHECKIN-RN-008] Exceção de importação**: Snapshot válido pode restaurar Check-ins históricos, que ficam imediatamente somente leitura.
- **[CHECKIN-RN-009] Streak atual**: Com Check-in hoje, conta-se regressivamente desde hoje; sem Check-in hoje e com Check-in ontem, conta-se desde ontem; sem Check-in hoje e ontem, o valor é zero.
- **[CHECKIN-RN-010] Melhor streak**: É a maior sequência histórica de datas consecutivas com Check-in.

---

## 3. Modalidade e Prioridade

- **DEVE / Must Have / Alta**: comportamento obrigatório para o MVP.
- **NÃO DEVE / Must Have / Alta**: comportamento proibido no MVP.

---

## 4. Requisitos Funcionais (RF)

- **[CHECKIN-RF-001] Registrar Check-in atual**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** A plataforma DEVE registrar Check-in para a data atual em `America/Sao_Paulo`, com nota e duração opcionais.
  - **Critério de Aceite:** A primeira chamada cria um único registro na data; nota e duração podem ser omitidas.

- **[CHECKIN-RF-002] Atualizar Check-in atual**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** A plataforma DEVE atualizar nota e duração do Check-in atual sem criar duplicidade.
  - **Critério de Aceite:** Escritas repetidas na mesma data mantêm um registro e retornam os últimos valores.

- **[CHECKIN-RF-003] Validar duração**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** A plataforma DEVE converter a entrada de horas e minutos para minutos inteiros e validar `CHECKIN-RN-004`.
  - **Critério de Aceite:** Omissão, 1 e 1.440 são aceitos; zero, negativo, fração e 1.441 são rejeitados.

- **[CHECKIN-RF-004] Excluir Check-in atual**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** A plataforma DEVE exigir confirmação antes de excluir o Check-in atual.
  - **Critério de Aceite:** Cancelar mantém o registro; confirmar remove o registro, recalcula streaks e permite novo Check-in no mesmo dia.

- **[CHECKIN-RF-005] Rejeitar datas inválidas**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** A plataforma DEVE rejeitar cadastro manual em data passada ou futura.
  - **Critério de Aceite:** Requisição com data diferente da atual em `America/Sao_Paulo` não altera dados.

- **[CHECKIN-RF-006] Proteger histórico**
  - **Obrigatoriedade:** NÃO DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** A plataforma NÃO DEVE permitir editar ou excluir Check-in anterior à data atual.
  - **Critério de Aceite:** Tentativas sobre registros passados falham e preservam os dados.

- **[CHECKIN-RF-007] Listar histórico**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** A plataforma DEVE listar o histórico de Check-ins com data, nota e duração registradas.
  - **Critério de Aceite:** A listagem contém os registros persistidos e não oferece edição para datas passadas.

- **[CHECKIN-RF-008] Calcular streak atual**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** A plataforma DEVE calcular streak atual conforme `CHECKIN-RN-009`.
  - **Critério de Aceite:** Check-in ontem mantém o streak durante o dia atual; um dia completo perdido resulta em zero.

- **[CHECKIN-RF-009] Calcular melhor streak**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** A plataforma DEVE calcular o maior intervalo histórico consecutivo de Check-ins.
  - **Critério de Aceite:** Entre duas sequências, o valor retornado corresponde ao comprimento da maior.

- **[CHECKIN-RF-010] Recalcular após mudança**
  - **Obrigatoriedade:** DEVE
  - **Prioridade de Negócio:** Alta (Must Have)
  - **Requisito:** A plataforma DEVE recalcular streak atual, melhor streak e último Check-in após exclusão ou importação.
  - **Critério de Aceite:** Os indicadores seguintes à operação correspondem ao histórico resultante.

---

## 5. Requisitos de Qualidade (RNF)

- **[CHECKIN-RNF-001] Independência do runtime**: Resultados de data DEVEM ser os mesmos quando o servidor executa em fuso diferente de `America/Sao_Paulo`.
- **[CHECKIN-RNF-002] Responsividade**: Criar, editar e excluir o Check-in atual DEVE ser possível em Chromium atual nos viewports `1366x768` e `390x844`.
- **[CHECKIN-RNF-003] Preservação de entrada**: Falha de gravação DEVE manter nota e duração preenchidas.

---

## 6. Restrições Técnicas e de Projeto (CT)

- **[CHECKIN-CT-001]**: Timestamps são instantes; a data local do Check-in é armazenada separadamente.
- **[CHECKIN-CT-002]**: A API DEVE impor unicidade por data.
- **[CHECKIN-CT-003]**: Check-in não depende de autenticação no MVP.

---

## 7. Lacunas e Questões de Elicitação

Nenhuma lacuna aberta. O documento foi aprovado pelo usuário.

### Checklist de Qualidade IREB (Autoavaliação)
- [x] **Necessário**: Os requisitos sustentam continuidade diária e histórico.
- [x] **Não-ambíguo**: Data, mutabilidade, duração e fórmulas estão definidas.
- [x] **Completo**: Cadastro, edição, exclusão, histórico e streaks foram cobertos.
- [x] **Consistente**: A exceção de importação não permite edição histórica.
- [x] **Verificável**: Limites e cenários temporais são determinísticos.
- [x] **Viável**: As regras usam um calendário fixo.
- [x] **Priorizado**: Requisitos do MVP estão como DEVE/Must Have/Alta.
- [x] **Rastreável e Versionado**: IDs, origem, versão e histórico estão presentes.

> **Status da Validação**: Aprovado, sem conflitos detectados.
