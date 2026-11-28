# GachaVerse Editorial Engine

O MVP prepara matérias completas a partir de uma pauta e de seções em Markdown. Ele usa o catálogo publicado para verificar slugs, links internos e possíveis duplicatas de título, além de compatibilidade com o carregador do portal. Fontes da pauta precisam apontar para páginas específicas de domínios oficiais. A equipe registra a data real de leitura e o que cada fonte sustenta. O código valida o registro e a estrutura; a revisão humana confere os fatos, a tradução e o contexto.

## Matérias em revisão

| Pauta | Decisão | Capa original |
| --- | --- | --- |
| [Cross-save em Genshin Impact](revisao/genshin-impact-cross-save.md) | Novo guia. Diagnóstico de conta, método de login e servidor, com foco na vinculação de PSN. | [Ponte entre uma tela e um celular](capas/genshin-impact-cross-save.jpg) |
| [Relíquias em Honkai: Star Rail](revisao/honkai-star-rail-reliquias.md) | Atualização. Preserva a URL existente e acrescenta a síntese personalizada e a tabela de custos documentados. | [Cristal em anel de calibração](capas/honkai-star-rail-reliquias-editorial.jpg) |
| [Recompensas da Hollow Zero](revisao/zenless-zone-zero-hollow-zero-recompensas.md) | Novo guia. Distingue recompensas semanais e progresso de Policromos, com checklist de resgate. | [Scanner em estação subterrânea](capas/zenless-zone-zero-hollow-zero-recompensas.jpg) |

As três pautas respondem a dúvidas editoriais, sem estimativas de volume de busca. A [fila de revisão arquivada](revisao/fila.json) registra o estado que antecedeu a publicação, com fontes, afirmações, palavras-chave, capas e hashes da revisão. Os [textos para Instagram, TikTok e X](revisao/divulgacao.md) podem receber as URLs canônicas após a publicação. As capas foram geradas com ImageGen integrado e exportadas em JPEG de 1200 × 675.

## Preparar e revisar

1. Para uma oportunidade do relatório privado, escolha o ID da pauta na fila de Editorial Intelligence e use-o em `intelligenceId`. O Engine confere ID, jogo, slug e se a recomendação é uma nova pauta ou atualização. As pautas de exemplo foram selecionadas editorialmente e ficam sem `intelligenceId`. O fluxo não copia as métricas do relatório.
2. Crie um par `<id>.json` e `<id>.md` com base nos exemplos da pasta `pautas/`. Para atualizações, acrescente seções ao artigo existente ou use `revisionMode: substituir` para revisar o corpo inteiro, mantendo o slug e a data original. Confirme as fontes, use links internos publicados e coloque a pauta em `em-revisao` quando estiver pronta. Marque como `publicada` após aplicar a revisão para impedir que a próxima execução regenere a pauta. As opções `--briefs` e `--covers` permitem trabalhar em diretórios privados.
3. Rode `pnpm exec tsx scripts/editorial-engine.ts` para regenerar a amostra local. Ao importar o relatório, use `--report CAMINHO_DO_JSON --out DIRETORIO_ABSOLUTO_PRIVADO`. Use um diretório existente, fora do checkout e sem sincronização pública. A saída comum usa `status: rascunho` e `revisado: false`. Editar os arquivos de saída não altera a pauta original. Faça correções nos insumos e gere novamente.
4. Revise cada afirmação, exemplo, link, nome localizado e imagem. Selecione a versão com o hash exato da fila. Para preparar uma publicação, registre uma aprovação explícita com os seguintes campos.

   ```json
   {
     "id": "ID_DA_PAUTA",
     "digest": "HASH_DA_FILA",
     "reviewer": "Nome real do revisor",
     "date": "AAAA-MM-DD",
     "status": "aprovada",
     "sourcesChecked": true,
     "coverChecked": true
   }
   ```

5. Rode `pnpm exec tsx scripts/editorial-engine.ts --approval CAMINHO_DA_APROVACAO --out DIRETORIO_ABSOLUTO_PRIVADO`. Se a pauta veio do Intelligence, inclua o mesmo `--report`. O hash inclui a pauta, a redação, a capa e o artigo publicado anterior, quando aplicável. Mudanças invalidam a aprovação. A data deve ser o dia efetivo da publicação em Brasília. O comando gera um candidato com `status: publicado` fora do checkout, preserva a data original de uma atualização e valida a saída no carregador do Next.js. A integração do candidato ao portal é um ato separado e manual, sujeito a diff, revisão e build. Não há push nem deploy nessa etapa.

## Produção de texto sem custo adicional contratado

- **ChatGPT Plus ou Codex autenticado com a conta existente.** Use o produto dentro dos limites incluídos para converter as notas verificadas em texto. Para automação local, a CLI oficial oferece o modo não interativo `codex exec`. Valide a autenticação e a disponibilidade da sua conta antes de usá-lo, com os mesmos limites de uso. O uso autenticado com a assinatura e a cobrança da API são separados. O Plus não deve ser tratado como cota gratuita de API. Não repasse cookies, tokens da sessão ou arquivos de autenticação para GitHub Actions. [Uso do Codex com o plano ChatGPT](https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan) · [Modo não interativo](https://learn.chatgpt.com/docs/non-interactive-mode) · [Créditos e elegibilidade para API](https://help.openai.com/en/articles/20001626-api-credits-benefit-for-eligible-chatgpt-subscriptions)
- **Modelo local com Ollama.** Pode gerar sugestões sem chamadas pagas a um provedor, condicionado ao hardware disponível e à licença do modelo escolhido. Use modelos locais, mantenha o serviço em loopback e desabilite os recursos de nuvem com `OLLAMA_NO_CLOUD=1`. Verifique a qualidade em português antes de usar. Esta opção foi pesquisada e não instalada. [Documentação oficial do Ollama](https://docs.ollama.com/faq)
- **Entrada manual.** O MVP funciona com os mesmos arquivos sem IA ou credenciais. Uma sessão de escrita assistida deve receber a pauta, o que cada fonte sustenta, os links permitidos e a orientação para deixar lacunas explícitas. Peça Markdown em português, sem H1, sem inventar valores, recompensas ou nomes de menus, e com um exemplo claramente hipotético quando útil. Revise a saída como qualquer outro original editorial.

O [guia de automação no Windows e na nuvem](automacao-codex.md) explica autenticação, agendamento, logs, limites e como evitar duplicidades.

## Uma coleta do YouTube para os dois fluxos

A auditoria existente de códigos e banners continua dona da chave e da coleta. Ela passa a gerar um artifact público de curta duração contendo somente jogo, ID, título e horário de vídeos oficiais, horário da coleta e canais indisponíveis. O snapshot não contém descrições, códigos extraídos, métricas do Search Console ou credenciais. Ele expira em três dias e os consumidores recusam dados com mais de 48 horas. [Políticas de armazenamento da API do YouTube](https://developers.google.com/youtube/terms/developer-policies)

Os dois workflows consumiram o mesmo artifact em produção usando apenas o `GITHUB_TOKEN` padrão de cada repositório. A solicitação anônima de download retornou HTTP 401. Se o GitHub rejeitar o acesso entre repositórios no futuro, use a opção `EDITORIAL_YOUTUBE_ARTIFACT_TOKEN` no repositório privado. Restrinja um token fine-grained ao produtor `hrq1408/gachaverse`, com **Actions: Read-only**, expiração e somente o acesso obrigatório de metadados. O token é usado apenas no download, antes da troca OIDC. A chave `YOUTUBE_DATA_API_KEY` fica no produtor. [Permissão para baixar artifacts](https://docs.github.com/en/rest/actions/artifacts#download-an-artifact)

Na implantação inicial, o produtor criou `youtube-publico` e os dois consumidores registraram `youtube.mode: snapshot` com 60 vídeos. Ao atualizar a integração, confirme primeiro a criação do artifact em `codigos.yml` na `main` pública. Depois atualize a cópia do workflow na `main` privada e o SHA revisado em `GACHAVERSE_SOURCE_SHA`. Execute manualmente o workflow privado e confira os campos de coleta. Sem artifact ou sem autorização, a coleta do Search Console continua e o YouTube fica indisponível naquela execução. A URL do workflow e as condições OIDC permanecem iguais.

## Publicação com revisão pelo Codex

O Codex pode assumir a revisão antes da publicação. Confira cada afirmação na fonte indicada, registre quais fatos cada fonte sustenta, compare as traduções com os textos oficiais localizados e documente a origem e os direitos da capa. Gere o registro de aprovação para o digest exato depois dessa conferência. Use mode codex e preencha evidence.verifiedFacts, evidence.coverRights e evidence.languageReview. Aplique os mesmos critérios a cada tradução. Uma tradução incompleta fica em rascunho.

A rotina do Windows prepara e apresenta candidatos para revisão pelo Codex ou mantenedor. Ela mantém a exigência de fatos e fontes conferidos para redigir e de original revisado para traduzir. O agendamento não preenche evidências, aprova candidatos nem publica. Quando uma tarefa do Codex assume a revisão, ela pode concluir essas etapas, rodar as validações e publicar pelo workflow oficial. O digest protege contra troca do conteúdo depois da revisão. Ele não comprova os fatos sozinho.
