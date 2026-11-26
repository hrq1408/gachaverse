# Diagnóstico do PR editorial #1

O [PR #1](https://github.com/hrq1408/gachaverse/pull/1) está em rascunho. O check que falhou é **Workers Builds: gachaverse**. O link de detalhes da API do GitHub aponta para `workers/services/view/gachaverse/production/builds/` e identifica o script `gachaverse`. Isso demonstra a existência de um build de Workers associado ao repositório. Os logs internos da Cloudflare são necessários para determinar o comando ou erro específico do build e para inventariar rotas e domínios do Worker.

A entrega oficial usa o GitHub Actions e `wrangler pages deploy` com destino aos projetos Pages `gachaverse` e `gachaverse-tracker`. Ela roda após push na `main` ou via disparo manual. O check de Workers no head do PR usa outra integração e não participa desse fluxo. Os dois endereços Pages responderam HTTP 200. A falha pode bloquear merge se houver uma regra exigindo esse check. A falha, por si só, não interrompe o deploy oficial.

## Desativar exclusivamente o build redundante

1. Na Cloudflare, abra **Workers & Pages → gachaverse** e identifique o item do tipo **Worker** pelo check. Confira seus **Domains & Routes** e os usos operacionais com a conta administradora.
2. Se os builds Git daquele Worker forem redundantes, selecione **Settings → Builds → Disconnect** somente nele. Preserve o Worker e seus vínculos necessários, o aplicativo GitHub da Cloudflare, os projetos Pages, tokens e secrets.
3. Se também houver builds Git duplicados em um projeto do tipo **Pages**, revise esse projeto separadamente. Em **Settings → Builds / Builds & deployments → Branch control**, desative os deploys Git de produção e selecione **None** nas prévias quando esses builds forem dispensáveis. O Wrangler continua suportado. Essa segunda alteração só se aplica se houver duplicação confirmada no próprio Pages.
4. No GitHub, confira a regra que protege a `main`. Se **Workers Builds: gachaverse** for obrigatório, faça a substituição pelo check **Lint, testes e proposta** somente depois de ele estar disponível e ter executado. Preserve os demais requisitos de revisão.

[Workers Builds e desconexão por projeto](https://developers.cloudflare.com/workers/ci-cd/builds/) · [Deploys automáticos no Pages](https://developers.cloudflare.com/pages/get-started/git-integration/#disable-automatic-deployments)

## Revisão do conteúdo

O catálogo de Zenless Zone Zero contém a versão 3.3. A versão 3.4 é um anúncio posterior, com lançamento em 2 de dezembro informado pela HoYoverse. Os oito links do PR são um programa especial e seus sete recortes, numerados de 1 a 7. Formam **um candidato editorial** de Zenless Zone Zero, versão 3.4, evento `programa-especial`. A chamada não confirma, por si só, cada janela de banner por servidor. O PR também não propõe novos códigos.

[Programa especial](https://www.youtube.com/watch?v=s1E6w6QrYZA) · [Anúncio do programa](https://zenless.hoyoverse.com/en-us/news/167352) · [Comunicado da versão](https://zenless.hoyoverse.com/en-us/news/167400)

A automação local agrega fontes por jogo, versão e evento, e compara a proposta com a `main` e com a branch do bot. Mudanças apenas na lista de vídeos do mesmo evento não geram commit nem reabertura. O bot valida a estrutura antes de gravar. A triagem por vídeo sinaliza versões acima da última publicada e ainda exige revisão das fases, datas e fontes antes de editar o calendário.

## Validação antes do merge

O workflow **Validar proposta editorial** executa lint, testes e validação da estrutura da proposta, em modo de leitura e sem deploy. O workflow de manutenção também executa lint e testes antes de gravar uma proposta, inclusive quando o GitHub exigir **Approve workflows to run** para o check do PR criado por `GITHUB_TOKEN`. Alterações na rotina de manutenção pela `main` disparam uma auditoria com as fontes reais, além do agendamento e do disparo manual. A validação técnica complementa a revisão das fontes. O merge permanece manual. [Comportamento do GITHUB_TOKEN](https://docs.github.com/en/actions/concepts/security/github_token)
