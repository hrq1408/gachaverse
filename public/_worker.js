const eligibilityPath = '/_publicidade/elegibilidade';

const worker = {
  fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== eligibilityPath) return env.ASSETS.fetch(request);
    const headers = { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' };
    if (request.method !== 'GET') {
      return new Response(null, { status: 405, headers: { ...headers, Allow: 'GET' } });
    }
    const eligible = url.hostname === 'gachaverse.pages.dev'
      && request.cf?.country === 'BR' && request.headers.get('Sec-GPC') !== '1';
    return Response.json({ eligible }, { headers });
  },
};

export default worker;
