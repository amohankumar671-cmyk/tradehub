/**
 * TradeHub — NSE Data Proxy (Cloudflare Worker)
 *
 * Deploy this as a separate Cloudflare Worker to get reliable
 * NSE API access without CORS issues.
 *
 * HOW TO DEPLOY:
 *   1. Go to https://dash.cloudflare.com → Workers & Pages → Create Worker
 *   2. Paste this entire file
 *   3. Deploy → copy your worker URL (e.g. https://nse-proxy.YOUR_NAME.workers.dev)
 *   4. Set REACT_APP_NSE_PROXY_URL=https://nse-proxy.YOUR_NAME.workers.dev/proxy?url=
 *      in your .env.local and in Cloudflare Pages environment variables
 *
 * The worker:
 *  - Adds required NSE headers (User-Agent, Referer, Accept)
 *  - Sets a warm-up cookie on first request
 *  - Returns raw JSON from NSE
 *  - Free plan: 100,000 requests/day — more than enough
 */

const NSE_HEADERS = {
  'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Accept':          'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Referer':         'https://www.nseindia.com/',
  'Origin':          'https://www.nseindia.com',
  'Connection':      'keep-alive',
  'Cache-Control':   'no-cache',
};

export default {
  async fetch(request) {
    const url    = new URL(request.url);
    const target = url.searchParams.get('url');

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin':  '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (!target) {
      return new Response(JSON.stringify({ error: 'No url parameter provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Only allow NSE domains
    const targetUrl = new URL(target);
    if (!targetUrl.hostname.endsWith('nseindia.com')) {
      return new Response(JSON.stringify({ error: 'Only NSE domains allowed' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    try {
      // Warm up NSE session cookie if needed
      const warmUp = await fetch('https://www.nseindia.com/', { headers: NSE_HEADERS });
      const cookies = warmUp.headers.get('set-cookie') || '';

      // Fetch the actual API endpoint
      const resp = await fetch(target, {
        headers: { ...NSE_HEADERS, 'Cookie': cookies },
      });

      const body = await resp.text();

      return new Response(body, {
        status: resp.status,
        headers: {
          'Content-Type':                'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control':               'no-cache, max-age=0',
        },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }
  },
};
