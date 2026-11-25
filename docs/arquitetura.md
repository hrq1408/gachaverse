# Arquitetura do GachaVerse

## Camadas

- `src/app` contém as rotas do App Router, o layout, os metadados e os estilos.
- `src/content` concentra jogos, categorias, artigos e registros de resgate. As rotas enumeram os slugs no build.
- `src/components` contém a navegação, os cards, os blocos editoriais e o espaço de publicidade.
- `src/lib/site.ts` centraliza a origem pública e os metadados sociais e de indexação.

## Rotas

| Caminho | Conteúdo |
| --- | --- |
| `/` | Página inicial |
| `/jogos/` | Catálogo |
| `/jogos/[game]/` | Página do jogo |
| `/jogos/[game]/[section]/` | Conteúdo de um jogo por categoria |
| `/conteudo/[section]/` | Índice da categoria |
| `/artigos/[slug]/` | Publicação editorial |
| `/sobre/` | Identidade e critérios editoriais |

## Publicação editorial

Cadastre a publicação em `src/content/editorial.ts` com slug único, resumo, texto e fontes oficiais. Para builds e tier lists, inclua jogo, versão, contexto e limitações da análise. Em resgates, informe a fonte, a data de verificação e o vencimento com fuso quando a fonte publicar essa informação. A expiração é avaliada no build. Reveja os registros e publique um novo build quando a lista mudar ou um código expirar.

As listagens vazias recebem `noindex` e ficam fora do sitemap. Com `SITE_URL` configurado, o Next.js publica canônicas, Open Graph, Twitter Cards, sitemap e robots.txt. Sem a variável, o sitemap é vazio e o site emite `noindex`.

## Publicidade

O layout global inclui o script assíncrono do AdSense no HTML estático para verificação de propriedade. O componente `AdBanner` mantém os espaços inline e leaderboard desativados até a aprovação. A configuração dos anúncios automáticos pertence ao painel do AdSense.

Antes de veicular anúncios personalizados no EEE, Reino Unido ou Suíça, configure uma CMP certificada pelo Google integrada ao IAB TCF. Teste a aceitação, a recusa e a alteração posterior das preferências. Para o Brasil, avalie as finalidades e bases legais e mantenha desativados por padrão os cookies que dependem de consentimento. A política publicada descreve a integração atual. Revise-a quando o tratamento mudar.

Referências: [requisitos do AdSense](https://support.google.com/adsense/answer/13554116?hl=pt-BR) e [guia da ANPD sobre cookies](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-cookies-e-protecao-de-dados-pessoais.pdf/@@display-file/file).

