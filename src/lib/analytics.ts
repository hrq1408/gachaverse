const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
export const preferenceKey = 'gachaverse:analytics:v1';
export type Preference = 'accepted' | 'declined';

export function readPreference(): Preference | null {
  try {
    const value = localStorage.getItem(preferenceKey);
    return value === 'accepted' || value === 'declined' ? value : null;
  } catch { return null; }
}

type TagWindow = Window & {
  JSON: JSON;
  gtag: (...args: unknown[]) => void;
};
let ready = false;
let pending: unknown[][] = [];
let frame: HTMLIFrameElement | undefined;
let lastPath = '';
let currentLocation = '';
let currentTitle = '';
let previousLocation = '';

function tracker() {
  return frame?.contentWindow as TagWindow | undefined;
}

function command(...args: unknown[]) {
  const win = tracker();
  if (win?.gtag && ready) win.gtag(...win.JSON.parse(JSON.stringify(args)));
  else if (frame) pending.push(args);
}

export function startAnalytics() {
  if (frame || !measurementId || !/^G-[A-Z0-9]+$/.test(measurementId)) return;
  // The tag gets its own document and history. Only approved App Router paths
  // are supplied to it, even when Enhanced Measurement observes history.
  frame = document.createElement('iframe');
  frame.hidden = true;
  frame.tabIndex = -1;
  frame.title = 'Medição de audiência';
  frame.referrerPolicy = 'no-referrer';
  frame.src = '/medicao.html';
  frame.addEventListener('load', initializeTag, { once: true });
  document.body.append(frame);
}

function initializeTag() {
  const win = tracker();
  if (!win || !measurementId) return;
  const doc = win.document;
  const policy = doc.createElement('meta');
  policy.name = 'referrer';
  policy.content = 'no-referrer';
  doc.head.append(policy);
  ready = true;
  command('set', 'send_page_view', false);
  command('consent', 'default', {
    analytics_storage: 'denied', ad_storage: 'denied',
    ad_user_data: 'denied', ad_personalization: 'denied',
  });
  command('consent', 'update', { analytics_storage: 'granted' });
  win.gtag('js', new Date());
  command('config', measurementId, {
    send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false,
    cookie_domain: location.hostname, page_location: location.origin + '/', page_referrer: '',
    page_title: 'GachaVerse', ignore_referrer: true,
  });
  const script = doc.createElement('script');
  script.async = true;
  script.referrerPolicy = 'no-referrer';
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
  for (const args of pending) command(...args);
  pending = [];
  doc.head.append(script);
}

export function stopAnalytics() {
  const win = tracker();
  if (win && measurementId) {
    Reflect.set(win, 'ga-disable-' + measurementId, true);
    win.gtag?.('consent', 'update', { analytics_storage: 'denied' });
  }
  frame?.remove();
  frame = undefined;
  ready = false;
  pending = [];
  lastPath = currentLocation = previousLocation = currentTitle = '';
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.trim().split('=')[0];
    if (name === '_ga' || name === '_ga_' + measurementId?.slice(2)) {
      document.cookie = name + '=; Max-Age=0; Path=/';
      document.cookie = name + '=; Max-Age=0; Path=/; Domain=' + location.hostname;
    }
  }
}

export function trackPage(path: string, allowedPaths: readonly string[]) {
  if (!tracker() || lastPath === path) return;
  lastPath = path;
  previousLocation = currentLocation;
  currentLocation = allowedPaths.includes(path) ? location.origin + path : '';
  if (!currentLocation) return;
  currentTitle = document.title;
  const fields = { page_location: currentLocation, page_title: currentTitle, page_referrer: previousLocation };
  command('set', fields);
  command('event', 'page_view', fields);
  if (previousLocation) {
    const previous = new URL(previousLocation).pathname;
    if ((previous.startsWith('/artigos/') && path.startsWith('/ferramentas/')) ||
        (previous.startsWith('/ferramentas/') && path.startsWith('/artigos/'))) {
      command('event', 'tool_article_navigation', fields);
    }
  }
  if (path === '/conteudo/codigos/') command('event', 'redemption_center_view', fields);
  if (path === '/ferramentas/calculadora-pity/') command('event', 'pity_calculator_open', fields);
}

export function trackAction(name: 'game_click' | 'article_read' | 'redemption_click' | 'redemption_code_copy' | 'redemption_game_select' | 'pity_calculation' | 'pity_banner_change' | 'pity_calculator_reset' | 'commercial_offer_click', fields: Record<string, string>) {
  if (currentLocation) command('event', name, {
    ...fields, page_location: currentLocation, page_title: currentTitle, page_referrer: previousLocation,
  });
}
