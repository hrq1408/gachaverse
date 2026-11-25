# Warp Tracker · revisão técnica de 25/11/2026

## Dois builds no mesmo repositório

| Aplicação | Comando na raiz | Artefato | Destino previsto |
| --- | --- | --- | --- |
| Portal editorial e calculadora | `pnpm build` com `SITE_URL=https://gachaverse.pages.dev` | `out/` | gachaverse.pages.dev |
| Diário privado | `pnpm build:tracker` | `tracker-out/` | gachaverse-tracker.pages.dev |

O tracker importa somente os módulos de domínio que utiliza e empacota React, validação e ícones localmente. Seu ponto de entrada, CSS, documento HTML e cabeçalhos são independentes do layout Next.js. O portal continua com exportação estática. O build do portal usa Webpack no Windows devido à falha do worker de CSS do Turbopack observada neste ambiente; o runner Linux conserva o padrão do Next.js.

O workflow usa dois jobs sequenciais. O primeiro valida lint e testes, gera exclusivamente tracker-out/, envia para gachaverse-tracker e verifica o conteúdo publicado, HTTPS, CSP, isolamento e o fluxo do diário com dados sintéticos. O segundo depende do sucesso dessas verificações. Só então o build do portal recebe NEXT_PUBLIC_TRACKER_RELEASED=true e publica out/ no projeto gachaverse. A concorrência é compartilhada pela sequência para impedir que releases diferentes se intercalem. Os secrets do Pages ficam restritos às etapas de envio.

Em 25/11/2026, antes da beta, as rotas públicas do guia e do painel retornaram 404 no domínio principal e em cada um dos nove deployments de produção disponíveis do portal. Nenhum commit anterior no histórico consultado continha as rotas. Não há evidência de históricos legados armazenados por visitantes em produção. A migração manual permanece disponível para eventuais cópias antigas acessadas na respectiva origem. A probabilidade promocional avançada fica para uma versão futura.
## Formatos e recuperação

O importador lê apenas hkrpg em arquivos UIGF. As versões 4.1 e 4.2 permitem famílias de colaboração. O parser guarda a hora de servidor original, fuso, identificadores textuais, item e metadados disponíveis. A ordenação usa o instante e o ID como desempate. O arquivo GachaVerse v1 usa um perfil nomeado pelo jogador, pois não identifica conta. A chave de deduplicação é o par conta–ID. IDs iguais em contas distintas são válidos. Uma colisão com dados incompatíveis cancela a transação inteira no IndexedDB. A prévia não grava registros.

O exportador gera um arquivo da conta selecionada. O backup GachaVerse 2 preserva anotações e os campos padronizados conhecidos. Campos de extensões privadas e dados de outros jogos ficam fora do escopo. Para exportar em SRGF é necessário idioma; para intercâmbio padrão são necessários UID, fuso e campos originais do registro. Converter para v1 conserva apenas os campos que aquele formato suporta. A demonstração é sintética, existe em memória e não se mistura com o banco real. Limite por arquivo e por backup de conta de 32 MB.

[UIGF 4.0](https://uigf.org/en/standards/uigf-legacy-v4.0.html) · [UIGF 4.1](https://uigf.org/en/standards/uigf-legacy-v4.1.html) · [UIGF 4.2](https://uigf.org/en/standards/uigf.html) · [SRGF 1.0](https://uigf.org/en/standards/srgf.html)

## Pity, garantia e estimativa

As seis famílias mantêm contadores distintos. Os limites e taxas base para personagem e Cone de Luz convencionais vêm da mesma configuração da calculadora. Um cinco estrelas ancora o contador. O gráfico de ciclos descarta o primeiro intervalo truncado. Raridade ausente invalida a âncora até o próximo cinco estrelas. Registros agrupados ou um intervalo impossível desabilitam a estimativa. A diferença entre IDs não comprova perda de registros. Mesmo após uma âncora, o arquivo por si só não comprova continuidade.

O jogador pode conferir e anotar o resultado do último cinco estrelas. Com continuidade presumida, um resultado fora do destaque ativa a garantia; obter o destaque a consome. Um cinco estrelas subsequente a uma perda conhecida também consome a garantia. Sem essas evidências o resultado permanece indeterminado. As famílias especiais não herdam regras promocionais por semelhança.

O modelo estima a chance de ao menos um cinco estrelas nos próximos n Saltos. Usa 1 − (1 − p)ⁿ antes do teto e 100% ao alcançá-lo. Assume ensaios independentes com taxa base constante de 0,6% ou 0,8% antes da garantia. Não modela soft pity, não estima a chance individual real do jogador e não calcula a chance de obter um destaque específico. [Regras oficiais da HoYoverse](https://support.hoyoverse.com/hc/en-us/articles/50913710696217-How-does-the-pity-system-work-for-different-banners-and-reruns)

## Importação direta e segurança

A consulta oficial de Warp Records no HoYoLAB é uma opção para o jogador conferir seu diário. A documentação consultada não estabelece um fluxo público delegado que autorize este portal a baixar o histórico. O painel aceita apenas arquivos locais. Não solicita cookies, tokens, senhas, links de sessão nem executa comandos no computador do jogador. [Ferramenta oficial Warp Records](https://www.hoyolab.com/article/46452547)

A origem privada usa IndexedDB, scripts e CSS locais, sem GA4, SDK de anúncios, fontes remotas ou upload. A CSP declara script-src e style-src self, connect-src none, frame-src none, form-action none e base-uri none. O cabeçalho do Pages também impede incorporação em frames. A separação por origem impede que JavaScript do portal abra o banco privado. O isolamento não protege contra extensões privilegiadas, alguém com acesso ao perfil do navegador ou código comprometido no próprio build do tracker.

Na origem anterior, a tela de migração permite exportação e exclusão explícita. O jogador importa o arquivo na origem nova, confere conta, contagens e registros e só então exclui a cópia antiga. Não há transferência automática entre origens. Históricos que permanecerem na origem antiga continuam expostos a scripts daquela origem. Manter a publicidade bloqueada e tratar esse risco antes da ativação. A CMP certificada e a aprovação do AdSense também continuam pendentes.

## Validação local

O teste de navegador serve o portal e o tracker em portas distintas de loopback no mesmo perfil temporário do Edge. Importa um arquivo sintético com duas contas compartilhando o mesmo ID, cancela uma prévia, confirma outra, repete a importação, recarrega o painel e exclui uma conta com confirmação. O teste verifica que o banco do tracker aparece apenas na origem privada e que nenhuma requisição HTTP vai para fora dela durante o fluxo do tracker. As larguras verificadas são 320, 390, 768 e 1440 px. As capturas usam somente a demonstração. O teste local não certifica as políticas de um domínio de produção ainda não provisionado.
