# Repaginação visual “Foco vibrante”

## Visão geral

Repaginar toda a interface web do My Learning para que ela pareça mais dinâmica, intuitiva e amigável, mantendo a simplicidade do produto e do código. A solução evolui a base existente de Next.js, Tailwind CSS, shadcn/Base UI e Lucide, sem trocar frameworks nem alterar regras de negócio, contratos HTTP ou persistência.

A experiência principal é desktop. A versão móvel continua responsiva, acessível e funcional, mas não determina a densidade nem a composição do layout desktop.

## Objetivos

- Dar personalidade ao produto sem transformar a interface em uma experiência decorativa.
- Melhorar hierarquia, escaneabilidade e localização das ações principais.
- Aplicar a linguagem visual do shadcn de forma consistente em todas as telas.
- Usar ícones Lucide como apoio semântico, nunca como substitutos ambíguos de texto.
- Reduzir estilos repetidos por meio de componentes pequenos e reutilizáveis.
- Preservar os fluxos, regras e dados existentes.
- Manter os modos claro e escuro, a navegação por teclado e os requisitos atuais de responsividade.

## Fora de escopo

- Novas funcionalidades de estudo ou novas entidades de domínio.
- Mudanças na API, nos contratos compartilhados ou no banco de dados.
- Autenticação, perfil de usuário ou personalização de avatar.
- Gráficos analíticos, metas, pontuação ou gamificação adicional.
- Um framework visual paralelo ao shadcn ou uma camada genérica de configuração de telas.
- Reformulação específica para mobile além da adaptação responsiva dos novos padrões.

## Direção visual aprovada

A direção escolhida é **Foco vibrante**:

- Base neutra e clara, com superfícies brancas e fundo levemente frio.
- Violeta como cor primária para navegação ativa e ações principais.
- Azul e verde usados em contextos informativos e de sucesso.
- Âmbar para o estado `Em andamento`.
- Bordas sutis, sombras leves e raios coerentes com os componentes shadcn.
- Tipografia Geist já existente, com títulos mais contrastantes e espaçamento mais deliberado.
- Ícones de traço da biblioteca Lucide, com tamanho e alinhamento padronizados.

O visual deve transmitir movimento pela hierarquia, pelas cores semânticas e pelos estados interativos. Animações, gradientes e sombras permanecem discretos para não competir com o conteúdo.

## Fundações do design system

### Tokens

Os tokens globais em `globals.css` serão a fonte de verdade para:

- cores de fundo, superfície, borda e texto;
- cor primária violeta e seus contrastes;
- cores semânticas de informação, atenção, sucesso e perigo;
- cores da sidebar e de seu item ativo;
- raios, anéis de foco e sombras de superfície;
- equivalentes dos modos claro e escuro.

As features devem consumir tokens por classes semânticas. Valores de cor específicos não serão repetidos em componentes de domínio.

### Status de recursos

Cada status usa texto, ponto indicador e cor. A cor nunca é o único sinal:

| Status | Tratamento visual |
| --- | --- |
| `Não iniciado` | cinza neutro, texto escuro e ponto cinza |
| `Em andamento` | fundo amarelo suave, borda âmbar, texto marrom-escuro e ponto âmbar |
| `Concluído` | fundo verde suave, borda verde, texto verde-escuro e ponto verde |

No tema claro, o estado `Em andamento` parte de fundo `#fef3c7`, texto `#713f12` e borda `#f6c84b`. O tema escuro receberá equivalentes ajustados por contraste, sem reutilizar esses valores literalmente.

### Iconografia

- Navegação, métricas, tipos de recurso e ações recorrentes usam Lucide.
- Botões com texto podem receber um ícone à esquerda quando ele acelera o reconhecimento.
- Botões somente com ícone são reservados para ações convencionais e recebem `aria-label` e tooltip.
- Ícones decorativos usam `aria-hidden`.
- Nenhum emoji será usado como ícone de produto.

## Shell da aplicação

### Desktop

O shell usa uma sidebar persistente de 16rem e uma área principal mais ampla, adequada ao uso diário em desktop.

A sidebar contém:

- marca My Learning com símbolo simples;
- links para Dashboard, Trilhas, Histórico e Configurações;
- ícone e estado ativo em superfície violeta suave;
- atalho contextual para continuar estudando quando houver um recurso disponível;
- controle de tema na região inferior.

A navegação ativa é derivada da rota atual. O conteúdo principal usa largura máxima maior que a atual e espaçamento responsivo, sem criar rolagem horizontal.

### Mobile

Em telas pequenas, a sidebar continua sendo apresentada por `Sheet`. O cabeçalho móvel mantém marca, botão de menu e controle de tema. Links, nomes acessíveis, foco contido no diálogo e fechamento após navegação são preservados.

## Cabeçalho de página

As telas internas compartilham um `PageHeader` com:

- breadcrumbs quando houver hierarquia útil;
- ícone contextual em superfície violeta;
- eyebrow curta que identifica o tipo de página;
- título e descrição;
- badge de status opcional;
- ações principais agrupadas à direita.

O cabeçalho usa fundo violeta suave, borda e contraste no conteúdo principal. A cor não fica limitada aos botões de ação. Em telas menores, conteúdo e ações quebram para linhas separadas.

## Dashboard

O Dashboard organiza o conteúdo na seguinte prioridade:

1. Cabeçalho com mensagem operacional e ação `Nova trilha`.
2. Métricas de streak atual, melhor streak e trilhas ativas.
3. `Continuar estudando`, com até cinco recursos e acesso claro ao detalhe.
4. Check-in diário em card violeta de destaque.
5. Trilhas ativas em cards compactos com progresso.

O check-in preserva duração opcional em horas e minutos, observação opcional, edição e exclusão do registro do dia. Sem um check-in no dia, o card exibe os campos e a ação `Registrar check-in`. Com um registro existente, os mesmos campos aparecem preenchidos com as ações `Salvar alterações` e `Excluir check-in`. Tudo permanece na própria área de check-in, sem modal e sem redução dos campos atuais.

O Dashboard continua consumindo a resposta existente. Métricas e listas não introduzem cálculos paralelos no frontend.

## Trilhas e recursos

### Lista de trilhas

- Cabeçalho com descrição e ação `Nova trilha`.
- Cada trilha aparece como uma linha-card clicável com título, objetivo, status, progresso e indicador de acesso.
- A lista continua sem busca, filtros ou ordenação adicional.
- O estado vazio explica o próximo passo e oferece a ação `Criar trilha`.

### Detalhe de trilha

- Cabeçalho contextual com status, ações `Editar`, `Novo recurso` e menu de ações secundárias.
- Resumo de progresso, quantidade de recursos e informações existentes da trilha.
- Recursos apresentados em uma lista ordenável com alça de arraste, ícone do tipo, metadados, badge de status e acesso ao detalhe.
- Objetivo e descrição permanecem visíveis em um card de contexto.
- A exclusão continua exigindo confirmação com o impacto existente.

### Detalhe de recurso

- Cabeçalho com tipo, formato, status e ações.
- Conteúdo separado em cards coerentes para link, enunciado, resposta, requisitos ou flashcard conforme o formato.
- Controle de status usa os três badges semânticos aprovados.
- Conversão e exclusão mantêm as confirmações atuais.

## Histórico e configurações

O Histórico usa cabeçalho compartilhado e uma lista temporal de check-ins. Data, duração e observação ganham hierarquia visual, sem criar agrupamentos ou filtros novos.

Configurações mantém os cards de armazenamento, exportação e restauração. Ícones distinguem as áreas; ações destrutivas continuam visual e semanticamente separadas das ações comuns.

## Formulários

Campos nativos estilizados diretamente em `globals.css` serão substituídos, onde aplicável, por componentes shadcn reutilizáveis:

- `Input`;
- `Textarea`;
- `Label`;
- `Select` do shadcn/Base UI para substituir os selects nativos existentes;
- composição de campo com descrição e mensagem de erro.

Formulários preservam React Hook Form, Zod e a lógica atual de envio. A largura segue o contexto: campos curtos não se expandem artificialmente e textos longos ocupam a largura disponível do card.

## Estados e feedback

### Carregamento

Consultas pendentes exibem skeletons com dimensões próximas ao conteúdo final. Isso evita saltos de layout e substitui mensagens soltas de `Carregando...` nas telas principais.

### Estado vazio

Estados vazios usam um componente centralizado nos dois eixos, com:

- ícone em superfície violeta suave;
- título curto;
- explicação útil;
- ação principal quando houver um próximo passo direto.

Ícone, textos e ação compartilham o mesmo eixo central e espaçamento previsível.

### Erros e sucesso

- Erros de consulta aparecem em `Alert` próximo ao conteúdo afetado.
- Erros de validação aparecem junto aos campos e preservam os valores digitados.
- Botões ficam desabilitados durante mutações e comunicam o estado de processamento no texto.
- Salvamentos bem-sucedidos usam toast quando não houver confirmação visual mais direta na própria tela.
- Ações destrutivas continuam usando `AlertDialog` com descrição de impacto.

## Arquitetura de componentes

A implementação reutiliza os componentes shadcn/Base UI existentes e adiciona apenas os primitivos necessários. A divisão proposta é:

- `components/ui`: primitivos shadcn sem conhecimento do domínio;
- `components/layout`: shell, sidebar, navegação móvel e tema;
- `components/shared`: `PageHeader`, `EmptyState`, `StatCard` e padrões visuais pequenos;
- `features/*`: composição por caso de uso e acesso aos hooks existentes.

Os componentes compartilhados recebem conteúdo e variantes simples por props. Não será criada uma configuração genérica de páginas, um schema visual ou um componente único com condicionais para todas as features.

## Fluxo de dados

- React Query permanece responsável por carregamento, erro, cache e invalidação.
- Componentes de feature continuam chamando os hooks e mutations existentes.
- Componentes visuais recebem dados preparados por props e não acessam a API.
- Contratos compartilhados e enums existentes continuam sendo a fonte dos estados.
- A repaginação não adiciona estado global nem duplica regras de progresso, streak ou seleção de recursos.

## Acessibilidade e responsividade

- Preservar landmarks e hierarquia correta de headings.
- Garantir foco visível em todos os controles interativos.
- Fornecer nomes acessíveis para botões somente com ícone.
- Usar tooltip como apoio, não como única fonte de informação crítica.
- Associar labels, descrições e mensagens de erro aos campos.
- Manter contraste suficiente nos temas claro e escuro, inclusive para o status âmbar.
- Não depender apenas de cor para status, sucesso ou erro.
- Preservar ausência de rolagem horizontal em `1366×768` e `390×844`.
- Manter o foco contido no menu móvel e nos diálogos.

## Estratégia de testes

### Testes de componentes

- Sidebar marca corretamente a rota ativa.
- Navegação móvel mantém seus nomes acessíveis e fecha após navegação.
- `PageHeader` renderiza título, contexto, status e ações sem quebrar a hierarquia.
- `EmptyState` associa texto e ação e permanece funcional sem ação.
- Badges mostram texto correto para os três status.
- Formulários mantêm labels, erros, valores e estados de envio.
- Dashboard mantém todos os dados e ações existentes após a reorganização.

### E2E e acessibilidade

- Executar os fluxos críticos existentes de Dashboard, Trilhas, Recursos, Histórico e Configurações.
- Manter verificações em Chromium desktop `1366×768` e mobile `390×844`.
- Verificar ausência de rolagem horizontal e disponibilidade da navegação.
- Executar Axe nos fluxos críticos em ambos os viewports.
- Verificar navegação por teclado, foco visível, diálogos e controles de tema.

Testes não devem afirmar classes Tailwind ou detalhes decorativos frágeis. Eles validam conteúdo, semântica, estados e interações.

## Critérios de aceite

- Toda a plataforma usa a direção Foco vibrante de forma coerente nos temas claro e escuro.
- Sidebar, cabeçalhos, cards, listas, formulários e estados compartilham os mesmos padrões.
- Dashboard prioriza métricas, continuidade, check-in e trilhas ativas na ordem definida.
- Trilhas e recursos exibem progresso e status de forma escaneável.
- `Em andamento` usa tratamento âmbar com texto de alto contraste.
- Estados vazios permanecem centralizados e apresentam próximo passo útil.
- Ícones Lucide melhoram o reconhecimento sem prejudicar nomes acessíveis.
- Fluxos e regras de negócio existentes continuam funcionando sem mudanças de contrato.
- Os testes de frontend, typecheck, lint e E2E aplicáveis passam.
- A interface não apresenta rolagem horizontal nos dois viewports exigidos.
- O código permanece dividido entre primitivos visuais, padrões compartilhados e componentes de feature, sem abstrações genéricas desnecessárias.
