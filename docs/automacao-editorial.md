# Configurar a chave do YouTube para a auditoria editorial

## Google Cloud e GitHub

1. Na [biblioteca de APIs do Google Cloud](https://console.cloud.google.com/apis/library/youtube.googleapis.com), escolha ou crie um projeto e habilite **YouTube Data API v3**. A consulta de metadados públicos usa chave de API e a cota padrão. Não contrate um plano pago.
2. Em **APIs e serviços → Credenciais → Criar credenciais → Chave de API**, crie a chave. Em **Restrições de API**, permita apenas **YouTube Data API v3**. Os runners hospedados fazem a chamada no servidor, sem referenciador de site e sem IP fixo reservado para este workflow.
3. No [repositório do GachaVerse](https://github.com/hrq1408/gachaverse/settings/secrets/actions), abra **Settings → Secrets and variables → Actions → Secrets → New repository secret**. Use o nome `YOUTUBE_DATA_API_KEY`, cole a chave no valor e salve. Mantenha a chave no secret, fora de commits, mensagens e logs.

## Primeira execução com dados reais

Abra [Actions → Revisar códigos de resgate e calendário](https://github.com/hrq1408/gachaverse/actions/workflows/codigos.yml), clique em **Run workflow**, selecione a branch `main` e mantenha acionada a opção **Testar YouTube Data API nos quatro canais e gerar apenas relatório**. Abra o **Summary** da execução. O resultado deve listar a confirmação dos quatro canais e o total de vídeos consultados. Chave ausente, restrita incorretamente ou respostas incompletas fazem essa verificação falhar. Esse modo não cria branches, commits ou PRs.

## Autorizar propostas editoriais

O job declara `contents: write` para a branch de propostas e `pull-requests: write` para criar o PR em rascunho. Para permitir a criação pelo token existente, em **Settings → Actions → General → Workflow permissions** marque **Allow GitHub Actions to create and approve pull requests** e salve. O workflow só cria propostas. Ele não aprova nem mescla PRs. A configuração padrão de permissões pode ficar restrita, pois o job declara as permissões que usa. Se houver política da organização que impeça essa opção ou regras que bloqueiem a branch `automacao/revisao-codigos`, a criação da proposta falhará. O modo de relatório independe dessas permissões de escrita.

Com a consulta real validada, uma execução na `main` com a opção de teste desmarcada usa a rotina normal. O agendamento diário também usa essa rotina. O workflow consulta os feeds oficiais e usa a API como fallback. Abre ou atualiza um PR em rascunho apenas com mudanças candidatas, sem editar o catálogo público. Datas, fases dentro da mesma versão e disponibilidade de códigos continuam sob revisão editorial.

[Autorização da YouTube Data API](https://developers.google.com/youtube/data/guides/authentication) · [Permissões do GitHub Actions](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository)
