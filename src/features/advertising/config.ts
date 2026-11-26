const publisherIdPattern = /^ca-pub-\d{16}$/;
export const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? 'ca-pub-6914991641652412';
export const autoAdsEnabled = process.env.NEXT_PUBLIC_ADSENSE_AUTO_ADS === 'true';
export const placements = {
  home: { format: 'leaderboard', unit: process.env.NEXT_PUBLIC_AD_UNIT_HOME },
  articleBody: { format: 'inline', unit: process.env.NEXT_PUBLIC_AD_UNIT_ARTICLE },
  articleSidebar: { format: 'sidebar', unit: process.env.NEXT_PUBLIC_AD_UNIT_SIDEBAR },
  game: { format: 'inline', unit: process.env.NEXT_PUBLIC_AD_UNIT_GAME },
  calculatorGuide: { format: 'inline', unit: process.env.NEXT_PUBLIC_AD_UNIT_CALCULATOR },
  trackerGuide: { format: 'inline', unit: process.env.NEXT_PUBLIC_AD_UNIT_TRACKER_GUIDE },
} as const;
export type Placement = keyof typeof placements;
export const advertisingPolicy = {
  enabled: process.env.NEXT_PUBLIC_ADS_ENABLED === 'true',
  publisherApproved: false,
  certifiedConsent: process.env.NEXT_PUBLIC_ADSENSE_CMP_VERIFIED === 'true',
  privateOriginIsolated: true,
};

export function autoAdsSource(policy: typeof advertisingPolicy, automatic: boolean, clientId: string) {
  // The Google site review controls serving. Bootstrap still requires the
  // validated CMP and a separate, per-browser legacy check and opt-in.
  if (!policy.enabled || !automatic ||
      !policy.certifiedConsent || !policy.privateOriginIsolated ||
      !publisherIdPattern.test(clientId)) return null;

  return 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + clientId;
}

export function eligible(policy: typeof advertisingPolicy, unit?: string) {
  return policy.enabled && policy.publisherApproved && policy.certifiedConsent && policy.privateOriginIsolated && /^\d{10}$/.test(unit ?? '');
}
