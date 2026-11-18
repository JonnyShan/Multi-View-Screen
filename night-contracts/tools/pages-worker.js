// Serves the Night Contracts single page from KV.
export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname !== '/' && pathname !== '/index.html') return new Response('Not found', { status: 404 });
    const body = await env.SITE.get('index.html', { type: 'stream', cacheTtl: 300 });
    if (!body) return new Response('Not found', { status: 404 });
    return new Response(body, {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=60',
        'x-robots-tag': 'noindex',
      },
    });
  },
};
