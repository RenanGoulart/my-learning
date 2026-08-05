# Verificacao Manual de Responsividade e Acessibilidade

**Data:** 2026-08-05

**Escopo:** Dashboard do MVP local, em estado sem Trilhas ou Recursos cadastrados.

## Ambiente

- Chromium local.
- Web em `http://127.0.0.1:3000` e API em `http://127.0.0.1:3001`.
- Banco SQLite inicializado pelo comando documentado `pnpm db:setup`.
- Viewports verificados: `1366x768` e `390x844`.

## Resultado

| Verificacao | 1366x768 | 390x844 |
| --- | --- | --- |
| Dashboard abre diretamente | Aprovado | Aprovado |
| Controles permanecem visiveis e acionaveis | Aprovado | Aprovado |
| Navegacao principal permanece disponivel | Aprovado, na barra lateral | Aprovado, pelo botao de menu |
| Sem sobreposicao incoerente de controles ou texto | Aprovado | Aprovado |
| Sem rolagem horizontal | Aprovado | Aprovado |
| Foco do menu movel permanece no dialogo | Nao aplicavel | Aprovado pelo E2E |

## Observacoes

- A verificacao automatizada do mesmo fluxo e dos demais fluxos criticos usa Axe e Playwright em ambos os projetos configurados.
- Esta evidencia cobre a verificacao manual exigida para os viewports definidos. O MVP nao declara certificacao formal de conformidade WCAG.
