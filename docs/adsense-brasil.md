# AdSense em produção durante a análise

A configuração da tag oficial é independente do estado de aprovação do Google. Em produção, o build prepara Auto ads sem consultar `ADSENSE_RELEASE_VERIFIED` ou declarar a CMP validada. O AdSense decide se o site pode veicular. Com Auto ads salvo no painel, a aprovação do Google não exige outro deploy do GachaVerse.

O portal carrega a tag somente na home e em guias publicados. A preferência publicitária fica desmarcada até a autorização em **Preferências de cookies → Personalizar**. A decisão é separada do Analytics. A verificação regional usa os metadados internos do Cloudflare Pages. O navegador recebe só uma decisão booleana sem cache. Falha, região desconhecida, acesso fora do Brasil ou sinal GPC bloqueiam a tag. IndexedDB indisponível ou a existência do banco legado também bloqueiam a tag.

A revogação recarrega o documento sem a tag e é propagada entre abas. A navegação para páginas fora da lista de publicidade troca o documento quando a tag está carregada. O tracker tem outra origem e outro artefato, sem código publicitário. Os anúncios manuais continuam desativados.

As mensagens europeias e americanas configuradas no AdSense foram preservadas. A integração atual não envia sinais TCF/GPP nem tenta inicializar anúncios nas regiões onde esse fluxo não foi validado. O Brasil usa a autorização publicitária local; isso não representa uma certificação da CMP. IP geográfico pode divergir da localização real, por exemplo com VPN; situações sem classificação válida permanecem fechadas.

## Painel AdSense

Abra **Anúncios → Por site → Editar gachaverse.pages.dev → Anúncios automáticos**. Ative a opção e use **Aplicar ao site → Aplicar agora → Salvar**. Confirme também as exclusões da calculadora e da migração. Se a opção já estiver ligada, preserve a configuração. Em caso de incidente, desligue Auto ads no painel. O portal não edita essas configurações remotamente.

[Recomendação durante a configuração](https://support.google.com/adsense/answer/7402256) · [Configuração de Auto ads](https://support.google.com/adsense/answer/9261307) · [LGPD e AdSense](https://support.google.com/adsense/answer/9928203?hl=pt-BR) · [Requisitos europeus](https://support.google.com/adsense/answer/13554116) · [API de mensagens](https://developers.google.com/funding-choices/fc-api-docs) · [Rotas do Cloudflare Pages](https://developers.cloudflare.com/pages/functions/routing/)
