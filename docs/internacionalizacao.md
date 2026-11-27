# Internacionalização do GachaVerse

## Rotas e indexação

O português brasileiro conserva as URLs existentes e o atributo HTML `lang="pt-BR"`. O App Router usa dois layouts raiz. O grupo `(pt)` não acrescenta segmentos e o segmento `[lang]` exporta `/en/` e `/es/` com `lang` no HTML inicial. Os índices traduzidos ficam em `/en/guides/` e `/es/guias/`. Os slugs das matérias são localizados. O seletor usa links HTML e lembra a última escolha no navegador. A URL visitada determina o idioma da página, sem redirecionamento.

A home de cada idioma tem canônica própria e declara as três versões, com `x-default` na raiz em português. Matérias e índices só participam dos grupos de `hreflang` quando há versões publicadas e indexáveis. Os índices vazios levam à coleção em português e usam `noindex`. Entradas localizadas publicadas aparecem no mapa de URLs e em `/en/rss.xml` ou `/es/rss.xml`. Cada matéria publicada recebe JSON-LD Article e BreadcrumbList no idioma da própria versão. O RSS em português continua em `/rss.xml`. A busca, os códigos, o calendário, a calculadora e as páginas institucionais têm rotas próprias em inglês e espanhol. A busca continua com noindex. Os hubs dos jogos continuam em português. Recompensas e observações editoriais do catálogo compartilhado mantêm o idioma de origem identificado no HTML.

As páginas localizadas mantêm o mesmo armazenamento e controles de consentimento com textos traduzidos. A configuração de publicidade e suas rotas elegíveis são as existentes. O tracker em origem separada não usa estes layouts.

## Revisão editorial

O primeiro lote contém cinco originais e dez traduções em `content/traducoes/en/` e `content/traducoes/es/`. As pautas são cross-save de Genshin Impact, Relíquias e Cones de Luz de Honkai: Star Rail, recompensas da Hollow Zero em Zenless Zone Zero e seleção de Ecos em Wuthering Waves. Foram escolhidas por utilidade duradoura e cobertura dos quatro jogos. Nenhum volume de busca foi presumido.

| Guia | Inglês | Espanhol |
| --- | --- | --- |
| Cross-save em Genshin Impact | [EN](../content/traducoes/en/genshin-impact-cross-save.md) | [ES](../content/traducoes/es/genshin-impact-guardado-cruzado.md) |
| Relíquias em Honkai: Star Rail | [EN](../content/traducoes/en/honkai-star-rail-relics.md) | [ES](../content/traducoes/es/honkai-star-rail-reliquias.md) |
| Cones de Luz em Honkai: Star Rail | [EN](../content/traducoes/en/honkai-star-rail-light-cones.md) | [ES](../content/traducoes/es/honkai-star-rail-conos-de-luz.md) |
| Hollow Zero em Zenless Zone Zero | [EN](../content/traducoes/en/zenless-zone-zero-hollow-zero-rewards.md) | [ES](../content/traducoes/es/zenless-zone-zero-recompensas-cavidad-cero.md) |
| Ecos em Wuthering Waves | [EN](../content/traducoes/en/wuthering-waves-choosing-echoes.md) | [ES](../content/traducoes/es/wuthering-waves-elegir-ecos.md) |

O `editorialId` é o slug permanente do original. Traduções preservam autoria, referências, imagem, datas e versão do original. Datas de publicação e atualização representam o original editorial, inclusive em RSS e JSON-LD. As capas selecionadas não exigem texto localizado. Preserve termos oficiais de cada idioma quando confirmados. Se o nome de um menu ou item em espanhol não puder ser confirmado, use uma descrição em espanhol e identifique o nome original em inglês.

1. Gere a fila dos originais com `pnpm exec tsx scripts/editorial-engine.ts --translations`. Cada idioma registra slug original, caminho, estado e hash atual. Use `pnpm exec tsx scripts/editorial-engine.ts --translation-batches` para organizar os próximos lotes por prioridade. A fila de novas pautas inclui propostas EN e ES. Quando o original é aprovado, o pacote de publicação inclui `traducoes.json` com a revisão exata que cada proposta deve usar.
2. Trabalhe em um Markdown por idioma seguindo os exemplos. Use o ID e o `sourceRevision` informados na fila, um slug único por idioma, título, descrição, texto alternativo e conteúdo com subtítulos a partir de H2. Use links HTML para destinos existentes. O corpo pode apontar para artigos em português marcados com `hreflang`. As recomendações ao fim do artigo usam correspondências publicadas no mesmo idioma quando disponíveis.
3. Revise o texto, as referências, os termos do jogo, links e imagem contra a edição original. Depois da aprovação humana, mude `status` para `published` e `reviewed` para `true`. O Engine calcula o hash do original a partir de conteúdo e metadados. Uma tradução cujo original mudou fica desatualizada e sai da exportação padrão, dos alternates e dos feeds até revisão e atualização do hash.
4. Para prévia local, configure `SITE_URL=https://gachaverse.pages.dev` e `I18N_REVIEW_BUILD=true` apenas na sessão de teste, e execute `pnpm build`. As páginas de revisão são geradas com `noindex` e ficam fora do sitemap, RSS e grupos `hreflang`. **Use o build padrão para qualquer publicação.** Limpe `I18N_REVIEW_BUILD` e gere novamente o diretório `out` antes de publicar.

Terminologia cotejada com o material oficial em espanhol. [Cavidad Cero e Películas](https://zenless.hoyoverse.com/es-es/news/166963?catchSpider=1) · [Ecos e Efecto de Sonata](https://wutheringwaves.kurogames.com/es/main/news/detail/5568)

## Inteligência SEO

A coleta em português para o Brasil mantém as janelas de 7, 28 e 90 dias. O novo campo privado `international` compara dois períodos consecutivos de 28 dias, com totais, consultas, páginas e pares consulta–página. São incluídos EN e ES globalmente, EN nos EUA e ES no México por padrão. Para escolher países, use `--markets en:gbr,es:esp,pt-br:prt` na execução privada. O país usa códigos alfa-3. Cada recorte acrescenta oito consultas à API, com limite de oito recortes incluídos os dois globais.

Idioma é a versão da página, identificada pelo caminho no filtro da API. O texto da consulta pode estar em qualquer idioma. Relatórios sem linhas não recebem estimativas. O workflow público nunca acessa Search Console e os relatórios detalhados continuam no armazenamento privado existente. A coleta internacional foi validada com respostas simuladas. [Filtros da Search Analytics API](https://developers.google.com/webmaster-tools/v1/searchanalytics/query)

## Warp Tracker

A localização do Tracker deve ser implementada no próprio build e na própria origem. Extraia os textos de navegação, tutoriais, formulários e gráficos para dicionários locais. Preserve esquemas de importação, nomes do IndexedDB e identificadores persistidos. Valide exportação, exclusão e ausência de conexões externas nos três idiomas. O portal deve manter apenas links para o Tracker.
