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

Cada artigo ocupa um arquivo Markdown em **content/artigos/**. A coleção é descoberta no build e comporta os 30 artigos iniciais sem cadastrar rotas nem alterar componentes. Use o front matter YAML do guia existente como referência.

1. Inicie com **status: rascunho** no front matter. O corpo pode estar incompleto. O build ignora o documento antes de construir páginas, cards, relacionados e sitemap. Mantenha material confidencial fora do repositório público.
2. Preencha titulo, slug, descricao, jogos (lista de slugs do catálogo), categoria (artigos, builds ou tier-lists), autor, publicacao e atualizacao (AAAA-MM-DD), imagem (caminho a partir de public), textoAlternativo e fontes (lista com titulo e url). Use versao quando aplicável e relacionados para indicar slugs preferenciais.
3. Comece os títulos do corpo em ##. O índice usa os mesmos IDs que o renderizador de Markdown. HTML bruto é escapado. Confira a atribuição, a imagem, os links e a redação na revisão editorial.
4. Somente após revisão, marque **revisado: true** e **status: publicado**. Valores ausentes ou inválidos em publicações interrompem o build. A home usa a data de publicação para ordenar os seis guias recentes. Relacionados usam apenas o catálogo publicado e priorizam a seleção editorial.

 Para builds e tier lists, inclua jogo, versão, contexto e limitações da análise. Em resgates, informe a fonte, a data de verificação e o vencimento com fuso quando a fonte publicar essa informação. A expiração é avaliada no build. Reveja os registros e publique um novo build quando a lista mudar ou um código expirar.

As listagens vazias recebem `noindex` e ficam fora do sitemap. Com `SITE_URL` configurado, o Next.js publica canônicas, Open Graph, Twitter Cards, sitemap e robots.txt. Sem a variável, o sitemap é vazio e o site emite `noindex`.

## Publicidade

O layout global inclui o script assíncrono do AdSense no HTML estático para verificação de propriedade. O componente `AdBanner` mantém os espaços inline e leaderboard desativados até a aprovação. A configuração dos anúncios automáticos pertence ao painel do AdSense.

Antes de veicular anúncios personalizados no EEE, Reino Unido ou Suíça, configure uma CMP certificada pelo Google integrada ao IAB TCF. Teste a aceitação, a recusa e a alteração posterior das preferências. Para o Brasil, avalie as finalidades e bases legais e mantenha desativados por padrão os cookies que dependem de consentimento. A política publicada descreve a integração atual. Revise-a quando o tratamento mudar.

Referências: [requisitos do AdSense](https://support.google.com/adsense/answer/13554116?hl=pt-BR) e [guia da ANPD sobre cookies](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-cookies-e-protecao-de-dados-pessoais.pdf/@@display-file/file).

