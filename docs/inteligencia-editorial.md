# GachaVerse Editorial Intelligence

O módulo roda fora do site. Lê o catálogo de artigos publicados e registra pautas pendentes com ID estável. A execução não muda o catálogo, abre PR, publica matéria ou dispara deploy. Consulte os links e as evidências da pauta antes de aprová-la.

## Executar sem credenciais

Após instalar as dependências, rode `pnpm exec tsx scripts/editorial-intelligence.ts --public`. O resumo contém apenas contagens e disponibilidade dos canais oficiais. Quando `YOUTUBE_DATA_API_KEY` já estiver configurada, a coleta usa YouTube Data API v3. Sem chave, usa os feeds públicos existentes. A API usa até nove chamadas de listagem por execução, sem `search.list`. A coleta editorial agrupa programas especiais, prévias, fases e anúncios de banners pela identificação explícita de jogo, versão e evento. Vídeos fora desses padrões, mais antigos que 21 dias ou cobertos pelo calendário exigem avaliação manual.

No GitHub público, o workflow **GachaVerse Editorial Intelligence** roda diariamente às 13h41 UTC ou via **Actions → GachaVerse Editorial Intelligence → Run workflow**, na branch `main`. Esse job não solicita identidade OIDC, não recebe credenciais do Search Console nem envia artifacts. Artifacts de repositório público podem ser baixados por usuários autenticados com acesso de leitura. [Acesso a artifacts no GitHub](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/download-workflow-artifacts)

## Habilitar coleta privada diária

1. Confirme que `hrq1408/gachaverse-intelligence` é **privado** (ID `1473633500`), com acesso apenas a mantenedores autorizados e branch padrão `main`. Publique nele apenas o workflow `.github/workflows/inteligencia-editorial.yml`. O runner busca o código do portal a partir de um commit público revisado fixado por SHA. Mantenha a visibilidade privada durante toda a retenção dos relatórios. Use o plano gratuito e os minutos incluídos, com gasto adicional bloqueado. A execução local também está disponível.
2. No **Google Cloud Console → APIs e serviços → Biblioteca**, habilite **Google Search Console API** (`searchconsole.googleapis.com`), **Security Token Service API** (`sts.googleapis.com`) e **IAM Service Account Credentials API** (`iamcredentials.googleapis.com`). Em **IAM e administrador → Contas de serviço**, crie uma conta dedicada à coleta. Deixe a conta sem papéis amplos no projeto e sem chave JSON.
3. No **Search Console**, selecione a propriedade com prefixo `https://gachaverse.pages.dev/`. Abra **Configurações → Usuários e permissões → Adicionar usuário**, informe o e-mail da conta de serviço e selecione **Restrito**. A automação pede somente o escopo OAuth `https://www.googleapis.com/auth/webmasters.readonly`. Se algum endpoint responder 403, confira primeiro a propriedade exata, o escopo e a permissão. Registre o endpoint que falhou antes de reavaliar o acesso. [Permissões do Search Console](https://support.google.com/webmasters/answer/7687615) · [Escopo de sitemaps](https://developers.google.com/webmaster-tools/v1/sitemaps/list)
4. Em **Google Cloud → IAM e administrador → Federação de Identidade de Carga de Trabalho**, confira o provedor OIDC com emissor `https://token.actions.githubusercontent.com`. Mapeie `google.subject=assertion.sub` e `attribute.repository_id=assertion.repository_id`. Restrinja a condição do provedor à visibilidade privada, aos IDs numéricos, à branch, ao arquivo do workflow e aos eventos autorizados.

   ```text
   assertion.repository_owner_id == '26346002' &&
   assertion.repository_id == '1473633500' &&
   assertion.repository_visibility == 'private' &&
   assertion.ref == 'refs/heads/main' &&
   assertion.workflow_ref == 'hrq1408/gachaverse-intelligence/.github/workflows/inteligencia-editorial.yml@refs/heads/main' &&
   assertion.event_name in ['schedule', 'workflow_dispatch']
   ```

5. Na política IAM da conta de serviço, conceda o papel **Workload Identity User** (`roles/iam.workloadIdentityUser`) somente ao principal `principalSet://iam.googleapis.com/projects/NUMERO_DO_PROJETO/locations/global/workloadIdentityPools/POOL_ID/attribute.repository_id/ID_DO_REPOSITORIO_PRIVADO`. O workflow emite um token com validade solicitada de 15 minutos. [Federação para GitHub Actions](https://cloud.google.com/iam/docs/workload-identity-federation-with-deployment-pipelines) · [Ação oficial de autenticação](https://github.com/google-github-actions/auth)
6. No **GitHub privado → Settings → Secrets and variables → Actions → Variables**, cadastre `GSC_WIF_PROVIDER` com o caminho completo do provedor, `GSC_SERVICE_ACCOUNT` com o e-mail da conta de serviço e `GACHAVERSE_SOURCE_SHA` com os 40 caracteres de um commit revisado de `hrq1408/gachaverse` que inclua este módulo. Atualize o SHA deliberadamente para incorporar alterações de catálogo ou de código. O workflow privado reutiliza o artifact do YouTube produzido na auditoria pública e a chave do YouTube fica no produtor. [Compartilhamento do artifact](editorial-engine/README.md#uma-coleta-do-youtube-para-os-dois-fluxos)
7. Rode o workflow manualmente na `main` privada. Confirme o sucesso da autenticação e da coleta e baixe o artifact **gachaverse-inteligencia-editorial** somente com uma conta autorizada. A retenção é de sete dias. Verifique no JSON a propriedade HTTPS, o país `BRA`, os seis períodos e os sitemaps. Períodos vazios podem ser legítimos. Um HTTP 401 aponta para autenticação, 403 pede conferência de acesso ou cota e 429 indica limitação de requisições. Mensagens de erro não incluem corpos de respostas.

## Execução local e Google Trends

Crie um diretório privado e absoluto fora do repositório e de pastas sincronizadas. Passe-o com `--out`. Cada execução gera uma subpasta com Markdown e JSON. Use `GSC_ACCESS_TOKEN` somente no ambiente do processo se você já tiver um token OAuth temporário autorizado com escopo de leitura. Apague a variável após executar. Sem token, o JSON registra `searchConsole: null`. Use `--skip-youtube` para validar os relatórios sem rede.

```powershell
pnpm exec tsx scripts/editorial-intelligence.ts --out 'C:\Privado\GachaVerse' --skip-youtube
pnpm exec tsx scripts/editorial-intelligence.ts --out 'C:\Privado\GachaVerse' --trends 'C:\Privado\GachaVerse\multiTimeline.csv'
```

No Google Trends, selecione **Brasil** e exporte o gráfico **Interesse ao longo do tempo** como CSV. O importador aceita séries diárias, semanais ou mensais com rótulos de Brasil, preserva células vazias e valores `<1`. O índice 0–100 é interesse relativo dentro da seleção do Trends. Um termo do CSV ajuda na triagem e não é contado como volume ou evidência do Search Console. [Exportação oficial do Google Trends](https://support.google.com/trends/answer/4365538?hl=pt-BR)

## Critérios de leitura

- Search Console usa Pesquisa Web, país `bra`, dados finalizados e último dia de análise três dias atrás no horário do Pacífico. Cada janela inclusiva de 7, 28 ou 90 dias compara o período imediatamente anterior de mesma duração. Diferenças por consulta ou página aparecem apenas quando existem linhas nos dois períodos.
- Cada coleta usa 24 requisições de Search Analytics e uma de sitemaps, em sequência e sem novas tentativas automáticas. Há até 5.000 linhas por recorte. A API pode omitir consultas anonimizadas e retornar apenas linhas principais. Uma resposta vazia não vira zero. Os campos de sitemaps reproduzem a API e não equivalem a uma contagem de páginas indexadas. [Search Analytics](https://developers.google.com/webmaster-tools/v1/searchanalytics/query) · [Cotas](https://developers.google.com/webmaster-tools/limits)
- Na janela de 28 dias, a triagem usa pelo menos 20 impressões para consultas em posição 5–20 e pelo menos 100 impressões para páginas com CTR abaixo de 2%. Uma possível sobreposição exige duas páginas de artigos com pelo menos 10 impressões cada e posição média até 30 para a mesma consulta normalizada. A pauta é um ponto de partida. Compare intenção, faixa de posição e conteúdo antes de alterar título, descrição ou links.
- Métricas observadas evidenciam visibilidade da propriedade. Anúncios oficiais indicam novidade, com demanda de pesquisa ainda hipotética. O módulo cruza slugs, títulos, descrições, jogo e referências do calendário para evitar pautas repetidas. Seções, capas e descrições sugeridas ficam pendentes de revisão. Os relatórios são snapshots e o ID estável permite registrar a decisão editorial fora do repositório público.
- Um relatório privado pode conter consultas ou URLs sensíveis. Mantenha-o fora de issues, PRs, logs e arquivos públicos. A integração real do Search Console ainda depende da primeira coleta autorizada.
