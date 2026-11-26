# Publicidade no GachaVerse

A verificação continua pela metatag e pelo ads.txt. Auto ads usa a tag oficial assíncrona, sem ID de unidade manual e sem reservar espaço. O Google controla a veiculação e a aprovação do site. As unidades manuais têm liberação separada e continuam desativadas.

## Consentimento

O painel do AdSense já tem Auto ads e otimização ativos. A publicação da mensagem europeia e a configuração da mensagem dos EUA foram informadas pelo editor. A documentação do AdSense descreve alcance regional. O portal exige uma autorização publicitária própria, desmarcada por padrão, inclusive no Brasil. Essa escolha protege o carregamento da tag e permanece separada do GA4. No modo autorizado para anúncios, o portal oferece as duas escolhas por ação no rodapé e deixa à CMP do Google a apresentação automática das mensagens regionais. O link de revogação ou de opt-out da CMP fica sob controle do Google. A recusa da publicidade no rodapé recarrega o documento sem a tag e interrompe novos carregamentos nas outras abas.

A opção no rodapé não escreve sinais TCF ou GPP. Depois da autorização local e da verificação do banco legado, a própria tag inicia a CMP publicada, que aplica as regras regionais. Mantenha os controles nativos de revogação e opt-out e valide as mensagens no idioma e região aplicáveis. A escolha europeia ou dos EUA não substitui a do portal.

[API do Google](https://developers.google.com/funding-choices/fc-api-docs) · [Revogação no AdSense](https://support.google.com/adsense/answer/10959060) · [LGPD no AdSense](https://support.google.com/adsense/answer/9928203)

## Liberação e rollback

O workflow só arma a tag quando a variável de repositório ADSENSE_RELEASE_VERIFIED for true. Ela fornece os valores de NEXT_PUBLIC_ADS_ENABLED, NEXT_PUBLIC_ADSENSE_AUTO_ADS e NEXT_PUBLIC_ADSENSE_CMP_VERIFIED no build do portal. NEXT_PUBLIC_ADSENSE_CLIENT_ID identifica o editor pela configuração versionada. Os padrões locais estão desativados. A variável atesta a revisão real e não deve ser criada antes de confirmar os fluxos.

Em homologação, desative a veiculação de Auto ads no painel antes de usar a tag real. Confira o aviso europeu, a mensagem e o opt-out dos EUA, aceite e recusa no Brasil, links de revisão, revogação e as requisições por região em desktop e mobile. O Google documenta a prévia de mensagem com o parâmetro fc, que pressupõe mensagem publicada e tag presente. Confirme no painel a política de privacidade vinculada e revise exclusões da calculadora, migração e controles, a densidade e os formatos sobrepostos. Se for preciso desativar a integração, desligue Auto ads no painel e rode o workflow com a variável ausente ou false.

[Prévia de mensagens](https://support.google.com/adsense/answer/10924669) · [Configuração de Auto ads](https://support.google.com/adsense/answer/9261307)

## Isolamento e dados legados

As duas rotas antigas retornaram 404 nos nove deployments consultados antes da beta. O histórico Git confirma que a rota de painel publicada no portal já era a migração. Não há evidência de dados privados legados de visitantes. O portal verifica em cada documento se o banco legado ainda existe e bloqueia a tag se ele estiver presente ou se a verificação falhar. A migração exporta sem criar um banco e pode excluir o banco legado mediante confirmação. Antes de excluir, confira a cópia no tracker isolado. Nenhum registro é apagado automaticamente.

O tracker continua em build e origem independentes, com CSP e sem GA4, publicidade ou CMP. Um script de terceiros no portal teria acesso à origem do portal, motivo para manter o bloqueio por navegador. [Auditoria histórica](warp-tracker.md)
