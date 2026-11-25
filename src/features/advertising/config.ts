export const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || 'ca-pub-6914991641652412';
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
  publisherApproved: false, certifiedConsent: false, privateOriginIsolated: false,
};
export function eligible(policy: typeof advertisingPolicy, unit?: string) {
  return policy.enabled && policy.publisherApproved && policy.certifiedConsent && policy.privateOriginIsolated && /^\d{10}$/.test(unit ?? '');
}
