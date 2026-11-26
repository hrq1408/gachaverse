# Auditoria de SEO e crescimento

Conferência pública em 26 de novembro de 2026.

| Verificação | Resultado |
| --- | --- |
| Sitemap em produção | HTTP 200, `application/xml`, 35 URLs, 11 artigos individuais e nenhum calendário. |
| `robots.txt` | HTTP 200 e referência ao sitemap. |
| Home | HTTP 200, canonical presente e indexação permitida. |
| Índice de calendário em produção | HTTP 200, canonical presente e `noindex`. Na versão local, a entrada passa a ter conteúdo verificado. |
| Busca interna | HTTP 200, canonical presente e `noindex`. Deve continuar fora do sitemap. |
| Cobertura | Os dez guias especializados são de Honkai: Star Rail. Os outros três jogos possuem hubs e resgate, com oportunidade de expansão editorial. |

## Prioridades

1. Publicar os calendários verificados com títulos específicos por jogo, fontes no corpo e links da home e dos hubs. Medir impressões e cliques de buscas por banners e horários. Priorizar a revisão dos anúncios nos dias de transição.
2. Publicar primeiro os guias de iniciantes, pity e moeda de Genshin Impact, Zenless Zone Zero e Wuthering Waves. Ligar cada guia a seu hub, ao calendário e aos códigos quando a ligação ajudar o leitor. Usar a [fila das 20 pautas](plano-editorial-expansao.md) para evitar sobreposição.
3. Separar páginas perenes de atualizações rápidas. Manter a URL do calendário por jogo, registrar datas conferidas e atualizar o conteúdo com o anúncio oficial. Preservar a exclusão de listagens vazias, rascunhos e busca.
4. Após publicação, comparar períodos de 28 dias no Search Console por página e consulta. Separar cliques e impressões de calendário, códigos, guias e ferramentas. Revisar título e descrição de páginas com impressões e CTR baixo quando o relatório oferecer dados suficientes.

A auditoria usou o HTML e os recursos públicos. Cliques, impressões, consultas, cobertura efetiva do índice e Core Web Vitals de campo dependem de dados da propriedade. A contagem do sitemap representa URLs declaradas.
