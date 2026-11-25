# Publicidade no GachaVerse

A verificação do editor utiliza metatag e ads.txt. AdProvider aplica a política no servidor. Se algum requisito estiver pendente, a exportação omite a unidade inteira. Esta versão não inclui um carregador de anúncios.

## Posicionamentos

| Chave | Contexto |
| --- | --- |
| home | Entre catálogo de jogos e guias recentes |
| articleBody | Entre texto e referências |
| articleSidebar | Coluna independente em telas largas |
| game | Entre as seções do jogo |
| calculatorGuide | Na explicação depois dos exemplos |
| trackerGuide | Dentro do guia público de importação |

O painel privado fica fora da lista. Cada unidade tem uma variável opcional no módulo de configuração. Os IDs ficam vazios até serem fornecidos pelo editor.

## Isolamento do histórico

Um script incluído por script src executa com a origem do documento. Um terceiro em qualquer página da origem que guarda o histórico pode abrir o IndexedDB dessa origem mesmo depois que o jogador fecha o dashboard. Rotas distintas e desmontar um componente ao navegar não isolam dados.

Antes de monetizar, hospedar o painel privado em uma origem dedicada, sem scripts publicitários. Abrir por navegação de documento completo. Manter arquivos e histórico nessa origem com CSP restritiva para scripts, conexões e frames. Verificar a ausência de dados em URLs, referrers e mensagens entre janelas. Tratar também os dados legados: testar migração ou exclusão consentida antes de introduzir tags publicitárias na origem atual.

## Critérios de ativação

1. Obter aprovação explícita do AdSense, registrar unidades reais e revisar a densidade editorial de cada página. Manter anúncios automáticos desligados para respeitar a lista de posições.
2. Avaliar a CMP do Google em Privacidade e mensagens do AdSense. Configurar mensagens regionais, recusa, personalização e revogação. Validar os sinais do TCF e as finalidades antes de implementar a autorização por visitante. O banner atual controla apenas o GA4.
3. Concluir o isolamento por origem e auditar requisições nos fluxos de importação, consulta e navegação. Testar ausência de consentimento, concessão e revogação.
4. Integrar o carregador assíncrono apenas em documentos públicos elegíveis, uma vez por documento e por unidade. Reservar dimensões por breakpoint e montar a lateral somente quando couber. Medir CLS e distâncias de botões.
5. Usar o placeholder local nos testes. Não gerar impressões artificiais nem clicar em anúncios próprios. Cálculos, filtros e importações não devem atualizar anúncios.

[Mensagens europeias do Google](https://support.google.com/adsense/answer/10961068) · [Requisitos de CMP](https://support.google.com/adsense/answer/13554116) · [Política de mesma origem](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy).
