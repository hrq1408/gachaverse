# Auditoria dos 31 artigos

Conferência em 26 de novembro de 2026. O HTML público dos 31 artigos retornou HTTP 200, canonical individual, título e descrição exclusivos e metadados Open Graph do tipo `article`. As 31 capas do Open Graph responderam com sucesso. Todos os artigos tinham breadcrumbs visuais. Nenhum tinha os dados estruturados `Article` e `BreadcrumbList`.

A versão local acrescenta os dois tipos de dados estruturados a cada artigo. Usa a mesma trilha exibida, imagens públicas, autor editorial e datas efetivas já registradas. O RSS inclui o catálogo publicado em ordem de publicação. Os títulos e descrições foram preservados nesta etapa. Títulos longos como os de evolução de personagens, reações de Genshin e habilidades de equipe de Zenless são candidatos a teste de clareza após observar CTR por consulta e dispositivo.

## Oportunidades por artigo

| Slug | Dúvida de cauda longa ou melhoria |
| --- | --- |
| honkai-star-rail-cones-de-luz | Cone de outro Caminho ativa a passiva? Levar a resposta ao início. |
| honkai-star-rail-evoluir-personagens | O que subir primeiro: nível, rastros ou equipamento? Resumir por função. |
| honkai-star-rail-guia-iniciantes | O que fazer no começo? Dar uma lista curta por bloqueio de progressão. |
| honkai-star-rail-jades-estelares | Onde juntar Jades sem gastar? Separar saldo atual de recompensas temporárias. |
| honkai-star-rail-montar-equipes | Como evitar faltar Pontos de Perícia? Dar um exemplo por função. |
| honkai-star-rail-pity-50-50 | O pity passa do personagem para o Cone? Ligar a família correta à calculadora. |
| honkai-star-rail-planejar-banners-f2p | Quantos Saltos guardar? Usar exemplo com reserva e prazo do calendário. |
| honkai-star-rail-poder-desbravamento | Onde gastar Poder de Desbravamento primeiro? Organizar por material que falta. |
| honkai-star-rail-quebra-fraqueza | Quando reduzir Tenacidade? Mostrar a diferença entre elemento, momento e efeito. |
| honkai-star-rail-reliquias | Qual atributo priorizar antes do conjunto? Separar por função. |
| onde-resgatar-codigos | Onde colocar o código em cada jogo? Destacar navegação para as quatro páginas. |
| genshin-impact-artefatos-iniciantes | Atributo principal ou conjunto? Antecipar a decisão prática no primeiro parágrafo. |
| genshin-impact-evoluir-armas | Quando vale refinar uma arma? Ligar a tabela à rota de materiais. |
| genshin-impact-evoluir-personagens-talentos | Onde farmar livros de talento? Destacar a consulta do dia e da recompensa. |
| genshin-impact-gemas-essenciais | Quais Gemas ainda consigo antes do banner? Remeter aos prazos e resgates. |
| genshin-impact-guia-iniciantes | Rank de Aventura não sobe: o que conferir? Dar um subtítulo para a dúvida. |
| genshin-impact-pity-oracoes | A garantia passa entre as duas Orações de personagem? Distinguir armas e Registro. |
| genshin-impact-planejar-oracoes-f2p | Quanto falta para a próxima Oração? Fazer a conta por categoria e prazo. |
| genshin-impact-primeira-equipe | Como montar equipe com o que já tenho? Usar funções antes de listas de personagens. |
| genshin-impact-reacoes-elementais | Como saber quem ativou a reação? Destacar o exercício observado pelo leitor. |
| genshin-impact-resina-original | Onde gastar Resina quando o domínio está fechado? Criar uma ordem alternativa. |
| zenless-zone-zero-canais-garantia | Pity do Canal Exclusivo passa para Motor-W? Usar ambos os nomes na abertura. |
| zenless-zone-zero-guia-iniciantes | Onde fica o Guia para Proxies Iniciantes? Incluir a localização no subtítulo. |
| zenless-zone-zero-montar-equipe | Por que a Habilidade Adicional não ativa? Destacar como ler a condição. |
| zenless-zone-zero-policromos | Onde consultar Policromos pendentes? Ligar recompensas, requisitos e códigos. |
| zenless-zone-zero-w-engines-discos | Motor-W ou Disco primeiro? Usar o problema da rotação como critério prático. |
| wuthering-waves-astrites | Onde conseguir Astrites antes do próximo banner? Separar eventos e progresso. |
| wuthering-waves-banners-garantias | O pity do ressonador passa para armas? Explicar a família e a moeda. |
| wuthering-waves-escolher-ecos | Como decidir se um Eco cabe no limite de custo? Destacar a ordem de checagem. |
| wuthering-waves-guia-iniciantes | Por que a Convocação não aparece? Distinguir desbloqueio e elegibilidade. |
| wuthering-waves-montar-equipe | Quem recebe o efeito de saída? Destacar a troca direta e a Energia de Concerto. |

Priorize pares com intenção distinta. O guia de pity deve explicar a regra, a calculadora deve responder ao orçamento local e o calendário deve responder às datas. Após publicar o markup, use o Rich Results Test e a inspeção das URLs para conferir o processamento. No Search Console, compare páginas e consultas em janelas equivalentes de 28 dias. A conferência pública não dá acesso a impressões, CTR, posições ou cobertura do índice.

[Article no Google Search](https://developers.google.com/search/docs/appearance/structured-data/article) · [BreadcrumbList](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb) · [Datas de conteúdo](https://developers.google.com/search/docs/appearance/publication-dates)
