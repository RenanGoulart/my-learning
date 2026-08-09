# QA — Responsividade e acessibilidade da interface vibrante

Data da verificação: 08-08-2026.

## Escopo verificado

| Área | Evidência automatizada | Resultado |
| --- | --- | --- |
| Desktop (1366×768) | Dashboard, trilhas, recursos, histórico, operação local e Axe | Aprovado |
| Mobile (390×844) | Os mesmos fluxos, menu em Sheet, foco no diálogo, overflow e Axe | Aprovado |
| Tema claro | Fluxos críticos e contraste de texto auxiliar e ações destrutivas | Aprovado pelo Axe nos fluxos exercitados |
| Tema escuro | Criação de trilha/recurso, status âmbar `Em andamento`, alternância de tema e Axe | Aprovado pelo Axe no fluxo exercitado |

## Evidências de comportamento

- A navegação principal permanece visível na sidebar desktop e o link `Trilhas` expõe `aria-current="page"` na rota correspondente.
- Em 390×844, o botão `Abrir navegação` abre o Sheet, a navegação principal fica dentro do diálogo e o foco permanece no diálogo durante a tabulação.
- Os testes confirmam ausência de overflow horizontal por `scrollWidth <= clientWidth` no Dashboard e por `body.scrollWidth <= window.innerWidth` no fluxo de recursos.
- O fluxo de tema escuro cria um recurso, seleciona `Em andamento`, aplica a classe `dark` no documento e confirma a visibilidade do status âmbar antes da análise do Axe.
- `expectNoAccessibilityViolations(page)` foi executado nos fluxos críticos em ambos os projetos Playwright, com zero violações na execução final.

## Execução final de E2E

Comando: `rtk pnpm test:e2e`

Resultado: 12 testes aprovados em 2,3 minutos — projetos `desktop` e `mobile`, incluindo Dashboard, operação local, acompanhamento/histórico, trilhas/recursos e o caso de tema escuro.

## Observações de correção confirmadas

- O servidor de testes Playwright usa `next dev --webpack`: no worktree aninhado, o Turbopack selecionava o `pnpm-workspace.yaml` do repositório pai e retornava 500 por manifesto RSC. A alternativa foi verificada por HTTP local antes de entrar somente na configuração de E2E; a configuração de produção não foi alterada.
- O controle de status preserva rádio nativo, estado `checked`/`disabled` e foco visível; o rádio é o alvo invisível de toda a label, evitando que elementos decorativos ou a própria label bloqueiem o clique.
- O token claro de texto auxiliar foi escurecido após o Axe reportar 4,38:1 sobre a superfície violeta, e botões destrutivos passaram a usar um foreground escuro dedicado após a detecção de 2,85:1 entre texto claro e fundo destrutivo.

Esta evidência registra verificações automatizadas dos fluxos exercitados. Ela não constitui certificação formal de WCAG.
