const publisherIdPattern = /^ca-pub-\d{16}$/;
export function adsenseSource(clientId: string) {
  return publisherIdPattern.test(clientId)
    ? 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + clientId
    : null;
}
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
  // This only configures the tag URL. The Brazil policy checks the route,
  // regional decision, explicit opt-in and legacy storage before insertion.
  if (!policy.enabled || !automatic || !policy.privateOriginIsolated) return null;

  return adsenseSource(clientId);
}

export function eligible(policy: typeof advertisingPolicy, unit?: string) {
  return policy.enabled && policy.publisherApproved && policy.certifiedConsent && policy.privateOriginIsolated && /^\d{10}$/.test(unit ?? '');
}
