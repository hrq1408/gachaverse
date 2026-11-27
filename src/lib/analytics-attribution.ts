const campaignKeys = ['utm_id', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;

export function entryAttribution(origin: string, navigationUrl: string, referrer: string) {
  const campaign = new URLSearchParams();
  if (URL.canParse(navigationUrl)) {
    const entry = new URL(navigationUrl);
    if (entry.origin === origin) {
      for (const key of campaignKeys) {
        const values = entry.searchParams.getAll(key);
        const value = values[0];
        // Campaign slugs only. Exclude ambiguous duplicates, free text, URLs and long numeric identifiers.
        if (values.length === 1 && /^[a-z0-9][a-z0-9_-]{0,63}$/i.test(value) && !/\d{7}/.test(value)) {
          campaign.set(key, value);
        }
      }
    }
  }

  const external = URL.canParse(referrer) ? new URL(referrer) : null;
  const referringOrigin = external && ['http:', 'https:'].includes(external.protocol) &&
    external.origin !== origin && !external.username && !external.password ? external.origin + '/' : '';
  return { campaign: campaign.size ? '?' + campaign.toString() : '', referrer: referringOrigin };
}
