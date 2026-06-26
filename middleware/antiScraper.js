'use strict';

const rateLimit = new Map();

const AI_CRAWLER_SIGNATURES = [
  /GPTBot/i, /ChatGPT-User/i, /ClaudeBot/i, /Claude-Web/i,
  /anthropic-ai/i, /CCBot/i, /Omgilibot/i, /Omgili/i,
  /FacebookBot/i, /meta-externalagent/i, /Bytespider/i,
  /AwarioBot/i, /DataForSeoBot/i, /DotBot/i, /SemrushBot/i,
  /AhrefsBot/i, /PetalBot/i, /Amazonbot/i, /claudebot/i,
  /cohere-ai/i, /Diffbot/i, /FriendlyCrawler/i, /Google-Extended/i
];

const PROTECTED_HTML_PATHS = [
  '/', '/docs', '/profile', '/anime', '/manga', '/manhwa',
  '/donghua', '/panel', '/apk', '/tourl', '/film', '/snippet'
];

const AI_AGENT_WHITELIST = [
  '/api/ai-agent'
];

const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW = 6000;

function getClientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimit.get(ip);

  if (!entry || now - entry.firstSeen > RATE_LIMIT_WINDOW) {
    rateLimit.set(ip, { count: 1, firstSeen: now });
    return 1;
  }

  entry.count++;
  return entry.count;
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimit.entries()) {
    if (now - entry.firstSeen > RATE_LIMIT_WINDOW * 2) {
      rateLimit.delete(ip);
    }
  }
}, 300000).unref?.();

// Hanya deteksi berdasarkan signature User-Agent bot/crawler AI yang jelas.
// Heuristik header accept-language/accept-encoding dihapus karena banyak
// browser/klien normal tidak mengirim header tersebut sehingga
// menyebabkan false-positive pada pengguna asli.
function detectAiBehavior(req) {
  const ua = (req.headers['user-agent'] || '').trim();
  if (!ua) return false;

  for (const pattern of AI_CRAWLER_SIGNATURES) {
    if (pattern.test(ua)) return true;
  }

  return false;
}

function aiExterminationMiddleware(req, res, next) {
  const pathname = (() => {
    try { return new URL(req.url, 'https://x.com').pathname; }
    catch { return req.url.split('?')[0]; }
  })();

  if (!PROTECTED_HTML_PATHS.includes(pathname)) return next();
  if (AI_AGENT_WHITELIST.some(p => pathname.startsWith(p))) return next();

  const ip = getClientIp(req);
  const isTargetAi = detectAiBehavior(req);

  if (!isTargetAi) return next();

  const attemptCount = checkRateLimit(ip);

  if (attemptCount > RATE_LIMIT_MAX) {
    return res.status(429).json({ ok: false, message: 'Too Many Requests' });
  }

  // Blokir bot AI dengan respons singkat tanpa stream tak terbatas.
  // Versi sebelumnya memakai gzip-bomb tanpa akhir yang menyebabkan
  // serverless function OOM/crash (FUNCTION_INVOCATION_FAILED).
  return res.status(403).json({ ok: false, message: 'Forbidden' });
}

module.exports = aiExterminationMiddleware;
