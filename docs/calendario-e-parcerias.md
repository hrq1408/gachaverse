# Operação do calendário e das parcerias

## Calendário

As entradas vivem em `src/content/banners.ts` e são validadas no build. Cada registro indica jogo, versão, categoria, destaques e janela anunciada. Os anúncios desta revisão são Rev. 4.7 de Honkai: Star Rail, 7.2 de Genshin Impact, 3.3 de Zenless Zone Zero e 3.8 de Wuthering Waves. Antes de mudar uma fonte, confira as datas, o servidor e as regras da família. A listagem é uma seleção editorial de anúncios verificados.

Quando o anúncio usa hora de servidor, mantenha o horário publicado. As transições próximas aos limites pedem confirmação no jogo. A home mostra apenas destaques cujo período em andamento pode ser afirmado com margem para os fusos. O navegador reavalia o estado por minuto. O estado inicial usa a data do build.

A integração de pity usa somente famílias de Honkai: Star Rail cobertas pelo modelo atual. Um link ajusta a seleção inicial sem sobrescrever o saldo ou o contador. Eventos especiais e os outros três jogos permanecem somente no calendário até terem modelos verificados.

## Ofertas de parceiros

O catálogo de `src/features/partners/catalog.ts` começa vazio. A chave de build `NEXT_PUBLIC_PARTNER_OFFERS_ENABLED=true` e a aprovação por registro são necessárias para inserir uma oferta no portal. A chave não está configurada no workflow.

Antes de aprovar, confira o destino HTTPS, o nome real do parceiro, a relação comercial, as condições apresentadas ao visitante e a elegibilidade por região. Uma recarga exige comprovação pública do publicador para o comerciante e o jogo. A propriedade `authorizationUrl` registra a evidência. A checagem técnica valida a presença da URL e a revisão editorial verifica a autorização.

O componente exibe a identificação comercial junto ao link e usa `rel="sponsored noopener"`. O evento `commercial_offer_click` exige consentimento de audiência e envia o ID público da oferta e o tipo de relação comercial, junto do contexto de navegação já usado pelo Analytics. O recurso não depende do AdSense e não é importado pelo tracker.
