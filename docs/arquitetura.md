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

 Para builds e tier lists, inclua jogo, versão, contexto e limitações da análise. Em resgates, informe a fonte, a data de verificação e o vencimento com fuso quando a fonte publicar essa informação. A expiração é avaliada no build e atualizada pelo navegador nas páginas de resgate.

As listagens vazias recebem `noindex` e ficam fora do sitemap. Com `SITE_URL` configurado, o Next.js publica canônicas, Open Graph, Twitter Cards, sitemap e robots.txt. Sem a variável, o sitemap é vazio e o site emite `noindex`.

## Publicidade

O layout global inclui a metatag google-adsense-account no HTML estático para verificação de propriedade. O componente `AdBanner` mantém os espaços inline e leaderboard desativados até a aprovação. A configuração dos anúncios automáticos pertence ao painel do AdSense.

Antes de veicular anúncios personalizados no EEE, Reino Unido ou Suíça, configure uma CMP certificada pelo Google integrada ao IAB TCF. Teste a aceitação, a recusa e a alteração posterior das preferências. Para o Brasil, avalie as finalidades e bases legais e mantenha desativados por padrão os cookies que dependem de consentimento. A política publicada descreve a integração atual. Revise-a quando o tratamento mudar.

Referências: [requisitos do AdSense](https://support.google.com/adsense/answer/13554116?hl=pt-BR) e [guia da ANPD sobre cookies](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-cookies-e-protecao-de-dados-pessoais.pdf/@@display-file/file).


## Medição de audiência

O build lê NEXT_PUBLIC_GA_MEASUREMENT_ID de .env.production. O identificador é público. O consentimento básico bloqueia o carregamento da tag até a aceitação. A escolha fica no armazenamento local e pode ser revista pelo rodapé. O banner próprio controla a audiência e não é uma CMP certificada pelo Google.

A tag roda em um documento isolado do histórico do App Router. O portal emite page_view uma vez por mudança de caminho público, game_click ao selecionar um jogo, article_read quando o fim do texto entra na área visível e redemption_click ao abrir um canal oficial de resgate. O endereço enviado usa apenas caminhos do catálogo. Os sinais de publicidade permanecem negados.

## Calendário, personagens e equipes

Além das categorias originais, o front matter aceita `calendario`, `personagens` e `equipes`. Para um banner, informe `periodo.inicio` e `periodo.fim` em ISO 8601 com fuso e vincule a fonte oficial. O calendário ordena as publicações pelo início e exibe os horários em UTC. Perfis podem informar `personagem`, builds podem detalhar `equipamentos` (nome e motivo) e composições aceitam `equipe` (personagem e função). Use `relacionados` para ligar um perfil às builds e equipes revisadas.

A busca em `/busca/` consulta somente publicações revisadas. Resultados de busca e seções sem publicações ficam fora do sitemap. As páginas de resgate com instruções oficiais continuam acessíveis mesmo sem códigos registrados.

## Central de códigos

Os registros ficam em content/resgates/catalogo.json e são validados por src/content/redemption.ts. Cada entrada inclui jogo, código público, recompensas em destaque, data UTC de verificação das fontes e fontes rotuladas por proveniência. Quando o anúncio publica um prazo, informe o horário ISO 8601 com fuso. Use uma fonte oficial ou, na falta dela, duas referências distintas. Uma postagem de usuário no HoYoLAB conta como fonte comunitária. A data de conferência se refere às fontes. Um código sem vencimento publicado pode parar de funcionar a qualquer momento.

Para adicionar ou atualizar um código, edite apenas o JSON e rode pnpm exec tsx scripts/check-redemption.ts. A auditoria diária lista registros fora do prazo e itens com pelo menos sete dias sem conferência. O relatório fica no resumo do GitHub Actions. Ele não testa contas, não faz scraping de portais autenticados e não altera dados nem dispara deploy. A coleta oficial gera candidatos em uma proposta separada para revisão humana. Publique um novo build depois de atualizar o catálogo.

As URLs continuam em /conteudo/codigos/ e /jogos/[game]/codigos/. Os filtros são locais e não criam URLs indexáveis. O GA4 registra visualização da central, seleção de jogo, cópia bem-sucedida e clique no canal oficial após o consentimento existente. Os eventos usam somente o slug público do jogo, quando aplicável.

### Atualização automatizada

A auditoria programada consulta uma vez por dia os feeds Atom públicos dos quatro canais oficiais do YouTube, no endpoint documentado pelo Google. As listas editoriais e a comunidade são fontes para conferência humana. O workflow não consulta automaticamente Pocket Tactics, Icy Veins ou Reddit. Ele extrai somente códigos explicitamente rotulados nas descrições, valores de moeda reconhecíveis e prazos ISO com fuso. Recompensas em imagens, falas, eventos privados e textos com datas ambíguas exigem revisão manual. Se um feed falhar, o relatório informa o jogo e a proposta automática fica suspensa naquela execução.

A proposta, quando houver diferença, fica em docs/propostas/codigos.json em um PR de rascunho da branch automacao/revisao-codigos. O PR contém evidências separadas do catálogo. A auditoria relata também vencimentos, incluindo registros que venceram após a conferência. As permissões do job são contents: write e pull-requests: write. A criação de PR pelo token exige que o repositório ou a organização permita essa ação em Settings, Actions, General, Workflow permissions. Sem essa permissão, o relatório da etapa continua disponível para revisão. Nenhuma chave paga é necessária. A automação não renova datas editoriais, nem envia credenciais de jogo ou publica códigos.

Os selos usam a data pública do anúncio, quando disponível, e o prazo oficial confirmado. A contagem regressiva só aparece para vencimento oficial com fuso. Marcas de uso e a opção de ocultá-las ficam no navegador e não são enviadas ao Analytics.

[Feeds públicos do YouTube](https://developers.google.com/youtube/data/guides/push_notifications)

Se o feed Atom recusar acesso no ambiente do runner, configure o secret opcional YOUTUBE_DATA_API_KEY. Ele deve pertencer a um projeto Google com YouTube Data API v3 habilitada e restrita à API, dentro da cota gratuita. O fallback lê os 15 uploads mais recentes de cada canal indisponível em até nove chamadas por execução. Sem chave, o workflow continua emitindo a auditoria do catálogo e informa quais fontes não pôde consultar. O script não registra a chave nem os URLs autenticados.

## Notícias

Publique uma notícia pelo mesmo carregador de artigos, com noticia: true no front matter do original. O índice em /noticias/, /en/news/ e /es/noticias/ usa os cards editoriais compartilhados. Um índice sem notícias publicadas naquele idioma fica fora do sitemap. As matérias preservam os caminhos de artigos e participam dos feeds existentes. A seção não precisa de CSS ou de um fluxo de publicação próprios.
