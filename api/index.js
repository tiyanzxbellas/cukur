'use strict';

const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const axiosModuleInstance = require('axios');
const _SaurusConfig = require('../config');
const FormDataModule = (() => {
  try { return require('form-data'); } catch { return null; }
})();
const cheerio = (() => {
  try { return require('cheerio'); } catch { return null; }
})();

const PTERO_DOMAIN = process.env.PTERO_DOMAIN || 'https://Saurusserver.fiffbackend.online';
const PTERO_API_KEY = process.env.PTERO_API_KEY || '';
const PTERO_NEST_ID = parseInt(process.env.PTERO_NEST_ID || '5');
const PTERO_EGG_ID = parseInt(process.env.PTERO_EGG_ID || '15');
const PTERO_LOC_ID = parseInt(process.env.PTERO_LOC_ID || '1');

const chalk = (() => {
  try { return require('chalk'); } catch { return null; }
})();

const c = chalk || {
  cyan: (s) => s,
  green: (s) => s,
  yellow: (s) => s,
  red: (s) => s,
  magenta: (s) => s,
  gray: (s) => s,
  bold: (s) => s,
};

function makeSpinner(label) {
  process.stdout.write(`\n${c.cyan('[Saurus]')} ${c.magenta('~')} ${label}\n`);
  return {
    stop(message, color = 'green') {
      const colorFn = c[color] || ((s) => s);
      process.stdout.write(`${c.cyan('[Saurus]')} ${colorFn(message)}\n`);
    }
  };
}

function logInfo(message) {
  console.log(`${c.cyan('[Saurus]')} ${message}`);
}

function logWarn(message) {
  console.warn(`${c.yellow('[Saurus]')} ${message}`);
}

function logError(message) {
  console.error(`${c.red('[Saurus]')} ${message}`);
}

const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'zexzzo';
const FIREBASE_STORAGE_BUCKET = process.env.FIREBASE_STORAGE_BUCKET || 'zexzzo.firebasestorage.app';

let db = null;
let storageBucket = null;
let rtdb = null;
let firebaseReady = false;
let adminInstance = null;

const DONGHUA_KEYWORD_TRIE = [
  'Battle Through the Heavens',
  'Soul Land',
  'Perfect World',
  'Throne of Seal',
  'Martial Universe',
  'A Will Eternal',
  'A Record of a Mortal Journey to Immortality',
  'Swallowed Star',
  'The Demon Hunter',
  'Shrouding the Heavens',
  'Stellar Transformations',
  'Against the Gods'
];

try {
  if (FIREBASE_PROJECT_ID) {
    const admin = require('firebase-admin');
    if (!admin.apps.length) {
      const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID || 'zexzzo',
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || '',
        private_key: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL || '',
        client_id: process.env.FIREBASE_CLIENT_ID || '',
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.FIREBASE_CLIENT_EMAIL || '')}`,
        universe_domain: "googleapis.com"
      };
      const initCfg = {
        projectId: FIREBASE_PROJECT_ID,
        storageBucket: FIREBASE_STORAGE_BUCKET,
        credential: admin.credential.cert(serviceAccount)
      };
      admin.initializeApp(initCfg);
    }
    adminInstance = admin;
    db = admin.firestore();
    try {
      storageBucket = admin.storage().bucket();
    } catch (storageError) {}
    firebaseReady = true;
  }
} catch (err) {
  firebaseReady = false;
  db = null;
  storageBucket = null;
}

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');

const antiScraper = require('../middleware/antiScraper');
app.use(antiScraper);

const multer = (() => {
  try { return require('multer'); } catch { return null; }
})();
const uploadMiddleware = multer ? multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } }) : null;

app.use((req, res, next) => {
  if (req.body !== undefined) return next();
  const contentTypeHeaderString = req.headers['content-type'] || '';
  if (contentTypeHeaderString.includes('multipart/form-data')) return next();
  let raw = '';
  req.on('data', chunk => { raw += chunk.toString(); });
  req.on('end', () => {
    if (raw) {
      if (contentTypeHeaderString.includes('application/json')) {
        try { req.body = JSON.parse(raw); } catch { req.body = {}; }
      } else if (contentTypeHeaderString.includes('urlencoded')) {
        req.body = Object.fromEntries(new URLSearchParams(raw));
      } else {
        req.body = {};
      }
    } else {
      req.body = {};
    }
    next();
  });
  req.on('error', () => { req.body = {}; next(); });
});

const publicDir = path.join(__dirname, '..', 'public');
const pageMap = {
  '/': 'index.html',
  '/docs': 'docs.html',
  '/profile': 'profile.html',
  '/otp': 'otp.html',
  '/snippet': 'snippet.html',
  '/anime': 'anime.html',
  '/donghua': 'donghua.html',
  '/manga': 'manga.html',
  '/manhwa': 'manhwa.html',
  '/panel': 'panel.html',
  '/apk': 'apk.html',
  '/tourl': 'tourl.html',
  '/film': 'film.html',
  '/music': 'music.html',
  '/ai': 'ai.html',
  '/cs': 'cs.html',
  '/tv': 'tv.html',
  '/dramabox': 'dramabox.html'
};

function safeSend(res, filePath) {
  if (fs.existsSync(filePath)) return res.sendFile(filePath);
  return res.status(404).json({ ok: false, message: 'Not Found' });
}

for (const [route, file] of Object.entries(pageMap)) {
  app.get(route, (_req, res) => safeSend(res, path.join(publicDir, file)));
}

app.get('/:page.html', (req, res, next) => {
  const page = req.params.page;
  const cleanRoute = Object.entries(pageMap).find(([, f]) => f === page + '.html');
  if (cleanRoute) {
    return res.redirect(301, cleanRoute[0]);
  }
  return next();
});

app.use(express.static(publicDir, { index: false }));

app.get('/sw.js', (_req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'no-cache');
  safeSend(res, require('path').join(publicDir, 'sw.js'));
});
app.get('/manifest.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/manifest+json');
  safeSend(res, require('path').join(publicDir, 'manifest.json'));
});

function getClientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (xff) return xff.split(',')[0].trim();
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || req.connection?.remoteAddress || 'unknown';
}

function getDynamicBaseUrl(req) {
  if (process.env.BASE_URL) return process.env.BASE_URL.replace(/\/$/, '');
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'api.Saurus.my.id';
  const proto = req.headers['x-forwarded-proto'] || 'https';
  return `${proto}://${host}`;
}

const OTAKUDESU_DOMAINS = [
  'otakudesu.fit',
  'otakudesu.blog',
  'otakudesu.io',
  'otakudesu.cloud',
  'otakudesu.video',
  'otakudesu.mom'
];

function getCloudinaryResourceType(filename = '', mimeType = '') {
  const extension = (path.extname(filename) || '').toLowerCase();
  const normalizedMime = String(mimeType || '').toLowerCase();

  if (normalizedMime.startsWith('image/') || ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.avif', '.svg', '.tif', '.tiff'].includes(extension)) {
    return 'image';
  }

  if (
    normalizedMime.startsWith('video/') ||
    normalizedMime.startsWith('audio/') ||
    ['.mp4', '.mkv', '.mov', '.webm', '.avi', '.flv', '.wmv', '.m4v', '.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac'].includes(extension)
  ) {
    return 'video';
  }

  return 'raw';
}

function buildCloudinaryDeliveryUrl(filename, mimeType = '') {
  const cloudName = String(process.env.CLOUDINARY_CLOUD_NAME || '').trim();
  if (!cloudName) return null;
  const resourceType = getCloudinaryResourceType(filename, mimeType);
  return `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/${filename}`;
}

function guessContentTypeFromFilename(filename = '') {
  const ext = (path.extname(filename) || '').toLowerCase();

  const map = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.bmp': 'image/bmp',
    '.avif': 'image/avif',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.mkv': 'video/x-matroska',
    '.mov': 'video/quicktime',
    '.webm': 'video/webm',
    '.avi': 'video/x-msvideo',
    '.flv': 'video/x-flv',
    '.wmv': 'video/x-ms-wmv',
    '.m4v': 'video/x-m4v',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.m4a': 'audio/mp4',
    '.aac': 'audio/aac',
    '.flac': 'audio/flac',
    '.pdf': 'application/pdf',
    '.txt': 'text/plain; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.zip': 'application/zip',
    '.rar': 'application/vnd.rar',
    '.7z': 'application/x-7z-compressed',
  };

  return map[ext] || 'application/octet-stream';
}

function _mimeToExt(mimeType) {
  const m = (mimeType || '').split(';')[0].trim().toLowerCase();
  const map = {
    'image/jpeg': '.jpg', 'image/jpg': '.jpg', 'image/png': '.png',
    'image/gif': '.gif', 'image/webp': '.webp', 'image/bmp': '.bmp',
    'image/avif': '.avif', 'image/svg+xml': '.svg', 'image/x-icon': '.ico',
    'image/ico': '.ico', 'image/tiff': '.tiff', 'image/heic': '.heic',
    'image/heif': '.heif', 'image/jxl': '.jxl',
    'video/mp4': '.mp4', 'video/x-matroska': '.mkv', 'video/quicktime': '.mov',
    'video/webm': '.webm', 'video/x-msvideo': '.avi', 'video/x-flv': '.flv',
    'video/x-ms-wmv': '.wmv', 'video/x-m4v': '.m4v', 'video/3gpp': '.3gp',
    'video/3gpp2': '.3g2', 'video/mp2t': '.ts', 'video/ogg': '.ogv',
    'audio/mpeg': '.mp3', 'audio/mp3': '.mp3', 'audio/wav': '.wav',
    'audio/x-wav': '.wav', 'audio/ogg': '.ogg', 'audio/mp4': '.m4a',
    'audio/aac': '.aac', 'audio/flac': '.flac', 'audio/opus': '.opus',
    'audio/webm': '.weba', 'audio/x-ms-wma': '.wma', 'audio/amr': '.amr',
    'application/pdf': '.pdf', 'application/zip': '.zip',
    'application/x-rar-compressed': '.rar', 'application/vnd.rar': '.rar',
    'application/x-7z-compressed': '.7z',
    'application/vnd.android.package-archive': '.apk',
    'application/x-apk': '.apk',
    'text/plain': '.txt', 'text/csv': '.csv', 'application/json': '.json',
    'application/xml': '.xml', 'text/xml': '.xml', 'text/html': '.html',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.ms-powerpoint': '.ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
  };
  return map[m] || null;
}

function _detectExtFromBuffer(buf) {
  if (!buf || buf.length < 4) return null;
  if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) return '.jpg';
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) return '.png';
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return '.gif';
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 && buf[8] === 0x57) return '.webp';
  if (buf[0] === 0x42 && buf[1] === 0x4D) return '.bmp';
  if (buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70) return '.mp4';
  if (buf[0] === 0x1A && buf[1] === 0x45 && buf[2] === 0xDF && buf[3] === 0xA3) return '.mkv';
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 && buf[8] === 0x41) return '.wav';
  if (buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33) return '.mp3';
  if (buf[0] === 0xFF && (buf[1] & 0xE0) === 0xE0) return '.mp3';
  if (buf[0] === 0x4F && buf[1] === 0x67 && buf[2] === 0x67 && buf[3] === 0x53) return '.ogg';
  if (buf[0] === 0x66 && buf[1] === 0x4C && buf[2] === 0x61 && buf[3] === 0x43) return '.flac';
  if (buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46) return '.pdf';
  if (buf[0] === 0x50 && buf[1] === 0x4B && buf[2] === 0x03 && buf[3] === 0x04) return '.zip';
  if (buf[0] === 0x52 && buf[1] === 0x61 && buf[2] === 0x72 && buf[3] === 0x21) return '.rar';
  if (buf[0] === 0x37 && buf[1] === 0x7A && buf[2] === 0xBC && buf[3] === 0xAF) return '.7z';
  return null;
}

function cloudinaryUploadSignature(params = {}, apiSecret = '') {
  const serialized = Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null && params[key] !== '')
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  return crypto.createHash('sha1').update(serialized + apiSecret).digest('hex');
}

async function fetchOtakudesuPath(pathname, userAgent) {
  const requestPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const failures = [];

  for (const domain of OTAKUDESU_DOMAINS) {
    try {
      const response = await axiosModuleInstance.get(`https://${domain}${requestPath}`, {
        headers: { 'User-Agent': userAgent },
        timeout: 15000,
        maxRedirects: 5,
        validateStatus: (status) => status >= 200 && status < 400
      });

      const html = typeof response.data === 'string' ? response.data : String(response.data || '');
      if (html.length > 500) {
        return {
          html,
          domain,
          url: response.request?.res?.responseUrl || `https://${domain}${requestPath}`
        };
      }
      failures.push(`${domain}: respons terlalu pendek`);
    } catch (error) {
      failures.push(`${domain}: ${error.message}`);
    }
  }

  throw new Error(`Semua domain otakudesu tidak dapat diakses. ${failures.slice(0, 3).join(' | ')}`);
}

async function fetchOtakudesuUrl(targetUrl, userAgent) {
  const attempts = [];
  const seen = new Set();

  const pushAttempt = (url) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    attempts.push(url);
  };

  pushAttempt(targetUrl);

  try {
    const parsed = new URL(targetUrl);
    const pathWithQuery = `${parsed.pathname || '/' }${parsed.search || ''}`;
    for (const domain of OTAKUDESU_DOMAINS) {
      pushAttempt(`https://${domain}${pathWithQuery}`);
    }
  } catch (_) {}

  const failures = [];

  for (const url of attempts) {
    try {
      const response = await axiosModuleInstance.get(url, {
        headers: { 'User-Agent': userAgent },
        timeout: 15000,
        maxRedirects: 5,
        validateStatus: (status) => status >= 200 && status < 400
      });

      const html = typeof response.data === 'string' ? response.data : String(response.data || '');
      if (html.length > 500) {
        return {
          html,
          url: response.request?.res?.responseUrl || url
        };
      }
      failures.push(`${url}: respons terlalu pendek`);
    } catch (error) {
      failures.push(`${url}: ${error.message}`);
    }
  }

  throw new Error(`Semua domain otakudesu tidak dapat diakses. ${failures.slice(0, 3).join(' | ')}`);
}

function parseOtakudesuLatest($) {
  const selectors = ['.venz ul li', '.venz > ul > li', '.venz li'];
  const data = [];

  for (const selector of selectors) {
    const nodes = $(selector);
    if (!nodes.length) continue;

    nodes.each((_, el) => {
      const item = $(el);
      const titleAnchor = item.find('a').first();
      const url = titleAnchor.attr('href') || item.find('h2 a').attr('href') || item.find('a').attr('href') || '';
      const title = item.find('.jdlflm').text().trim() || titleAnchor.text().trim() || item.find('h2 a').text().trim() || item.text().trim();
      if (!title && !url) return;

          data.push({
            title,
            url,
            thumbnail: item.find('img').attr('src') || item.find('img').attr('data-src') || '',
            episode: item.find('.epz').text().trim() || item.find('.eps').text().trim() || '',
            day: item.find('.epztipe').text().trim() || item.find('.epztipe, .epinfo').text().trim() || '',
            date: item.find('.newnime').text().trim() || item.find('.newnime, .newnimee').text().trim() || ''
          });
        });

    if (data.length) break;
  }

  return data;
}

function parseOtakudesuSearch($) {
  const selectors = ['.chivsrc li', '.chivsrc > li', '.chivsrc .result', '.chivsrc .chivsrc-result li'];
  const data = [];

  for (const selector of selectors) {
    const nodes = $(selector);
    if (!nodes.length) continue;

    nodes.each((_, el) => {
      const item = $(el);
      const titleAnchor = item.find('h2 a').first().length ? item.find('h2 a').first() : item.find('a').first();
      const url = titleAnchor.attr('href') || '';
      const title = titleAnchor.text().trim() || item.find('h2').text().trim() || item.text().trim();
      if (!title && !url) return;

      const metaBlocks = item.find('.set, .seti, .setline');
      const metaText = metaBlocks.map((__, node) => $(node).text().trim()).get();

      data.push({
        title,
        url,
        thumbnail: item.find('img').attr('src') || item.find('img').attr('data-src') || '',
        genres: metaText[0] ? metaText[0].replace(/^Genres?\s*:\s*/i, '').trim() : '',
        status: metaText[1] ? metaText[1].replace(/^Status\s*:\s*/i, '').trim() : '',
        rating: metaText[2] ? metaText[2].replace(/^Rating\s*:\s*/i, '').trim() : ''
      });
    });

    if (data.length) break;
  }

  return data;
}

function parseOtakudesuDetail($) {
  const data = {
    title: '',
    thumbnail: '',
    synopsis: '',
    japanese: '',
    score: '',
    producer: '',
    type: '',
    status: '',
    total_episode: '',
    duration: '',
    release_date: '',
    studio: '',
    genres: '',
    episode_list: []
  };

  const titleSelectors = ['.jdlrx h1', '.jdlrx h1, .jdlrx h2', '.infozingle h1'];
  for (const selector of titleSelectors) {
    const text = $(selector).first().text().trim();
    if (text) {
      data.title = text;
      break;
    }
  }

  const thumbSelectors = ['.fotoanime img', '.fotoanime img, .anime-thumbnail img', '.thumb img'];
  for (const selector of thumbSelectors) {
    const src = $(selector).first().attr('src') || $(selector).first().attr('data-src');
    if (src) {
      data.thumbnail = src;
      break;
    }
  }

  const synopsisSelectors = ['.sinopc', '.sinopsis', '.sinopsi', '.desc .entry-content', '.entry-content p'];
  for (const selector of synopsisSelectors) {
    const text = $(selector).first().text().trim();
    if (text) {
      data.synopsis = text;
      break;
    }
  }

  const infoSelectors = ['.infozingle p', '.infozingle li', '.animeinfo p', '.anime-info p'];
  const infoLines = [];
  for (const selector of infoSelectors) {
    const nodes = $(selector);
    if (!nodes.length) continue;
    nodes.each((_, el) => {
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      if (text) infoLines.push(text);
    });
    if (infoLines.length) break;
  }

  for (const text of infoLines) {
    if (/Japanese/i.test(text)) data.japanese = text.split(':').slice(1).join(':').trim();
    if (/Skor|Score/i.test(text)) data.score = text.split(':').slice(1).join(':').trim();
    if (/Produser|Producer/i.test(text)) data.producer = text.split(':').slice(1).join(':').trim();
    if (/Tipe|Type/i.test(text)) data.type = text.split(':').slice(1).join(':').trim();
    if (/Status/i.test(text)) data.status = text.split(':').slice(1).join(':').trim();
    if (/Total Episode|Episodes?/i.test(text)) data.total_episode = text.split(':').slice(1).join(':').trim();
    if (/Durasi|Duration/i.test(text)) data.duration = text.split(':').slice(1).join(':').trim();
    if (/Tanggal Rilis|Released/i.test(text)) data.release_date = text.split(':').slice(1).join(':').trim();
    if (/Studio/i.test(text)) data.studio = text.split(':').slice(1).join(':').trim();
    if (/Genre/i.test(text)) data.genres = text.split(':').slice(1).join(':').trim();
  }

  const episodeSelectors = ['.episodelist ul li', '.episodelist li', '.list-episode li', '.eps-list li'];
  for (const selector of episodeSelectors) {
    const nodes = $(selector);
    if (!nodes.length) continue;

    nodes.each((_, el) => {
      const item = $(el);
      const link = item.find('a').attr('href') || item.find('a').first().attr('href') || '';
      const text = item.find('a').text().trim() || item.text().trim();
      if (!link || !/episode/i.test(link + ' ' + text)) return;
      data.episode_list.push({
        title: text,
        url: link,
        date: item.find('.zeebr, .zeebr, .date, .updated').text().trim() || ''
      });
    });

    if (data.episode_list.length) break;
  }

  return data;
}

function parseOtakudesuStream($) {
  const data = {
    stream_links: [],
    downloads: []
  };

  const iframe = $('#lightsVideo iframe').attr('src') || $('.videocontent iframe').attr('src') || $('.player iframe').attr('src');
  if (iframe) {
    data.stream_links.push({ quality: 'Default', url: iframe });
  }

  $('.mirrorstream ul li, .mirrorstream li, .mirror ul li').each((_, el) => {
    const item = $(el);
    const quality = item.text().trim();
    const embedUrl = item.find('a').attr('data-content') || item.find('a').attr('href');
    if (!embedUrl) return;

    try {
      const decoded = Buffer.from(embedUrl, 'base64').toString('utf-8');
      const $decoded = cheerio.load(decoded);
      const decodedIframe = $decoded('iframe').attr('src');
      if (decodedIframe) {
        data.stream_links.push({ quality: quality || 'Mirror', url: decodedIframe });
        return;
      }
    } catch (_) {}

    if (/^https?:\/\//i.test(embedUrl)) {
      data.stream_links.push({ quality: quality || 'Mirror', url: embedUrl });
    }
  });

  $('.download ul li, .download li, .mirrorstream-download li').each((_, el) => {
    const item = $(el);
    const quality = item.find('strong').text().trim() || item.find('span').first().text().trim() || item.text().trim();
    const links = [];

    item.find('a').each((__, a) => {
      const link = $(a).attr('href');
      if (!link) return;
      links.push({
        server: $(a).text().trim() || 'Link',
        url: link
      });
    });

    if (links.length) {
      data.downloads.push({ quality, links });
    }
  });

  return data;
}

async function validateApiKey(req) {
  const providedApiKey = req.query?.apikey || req.body?.apikey || null;
  if (!providedApiKey) {
    return { ok: false, status: 401, message: 'API Key diperlukan. Login dan dapatkan API Key di halaman profil.' };
  }
  const isFreeKey = providedApiKey === 'Saurus';
  if (isFreeKey) return { ok: true, isFreeKey: true, plan: 'free' };
  if (!firebaseReady || !db) {
    return { ok: false, status: 503, message: 'Firebase belum siap untuk validasi API Key.' };
  }
  try {
    const snap = await db.collection('users').where('apiKey', '==', providedApiKey).limit(1).get();
    if (snap.empty) return { ok: false, status: 403, message: 'API Key tidak valid atau telah dicabut.' };
    const userDoc = snap.docs[0];
    const userRef = userDoc.ref;
    const userData = userDoc.data();
    const today = new Date().toISOString().split('T')[0];
    const dailyRef = userRef.collection('dailyUsage').doc(today);
    const ip = getClientIp(req);
    const endpoint = getPath(req);
    const ua = (req.headers['user-agent'] || '').slice(0, 120);
    const ts = new Date().toISOString();

    await db.runTransaction(async (tx) => {
      const [uDoc, dailyDoc] = await Promise.all([tx.get(userRef), tx.get(dailyRef)]);
      const prev = uDoc.data() || {};
      tx.update(userRef, { totalRequests: (prev.totalRequests || 0) + 1, lastUsedAt: ts });
      if (dailyDoc.exists) {
        const dd = dailyDoc.data();
        const ips = dd.ips || [];
        if (!ips.includes(ip)) ips.push(ip);
        tx.update(dailyRef, { count: (dd.count || 0) + 1, ips, lastEndpoint: endpoint, lastAt: ts });
      } else {
        tx.set(dailyRef, { count: 1, date: today, ips: [ip], lastEndpoint: endpoint, lastAt: ts });
      }
    });

    const logRef = userRef.collection('requestLogs').doc();
    logRef.set({ ip, endpoint, ua, ts, method: req.method || 'GET', status: 200 }).catch(() => {});

    userRef.get().then(d => {
      if (!d.exists) return;
      const ipLog = d.data().ipLog || [];
      const existing = ipLog.find(e => e.ip === ip);
      if (existing) {
        existing.lastSeen = ts;
        existing.count = (existing.count || 1) + 1;
        existing.lastEndpoint = endpoint;
      } else {
        ipLog.unshift({ ip, firstSeen: ts, lastSeen: ts, count: 1, ua: ua.slice(0,80), lastEndpoint: endpoint });
      }
      const trimmed = ipLog.slice(0, 20);
      userRef.update({ ipLog: trimmed }).catch(() => {});
    }).catch(() => {});

    return { ok: true, isFreeKey: false, uid: userDoc.id, plan: userData.plan || 'free' };
  } catch (err) {
    return { ok: false, status: 500, message: 'Kesalahan internal saat memvalidasi API Key: ' + err.message };
  }
}

function getPath(req) {
  try {
    return new URL(req.url, 'https://example.com').pathname;
  } catch {
    return String(req.url || '').split('?')[0];
  }
}

function getInput(req, key, fallback = null) {
  const q = req.query?.[key];
  if (q !== undefined && q !== null && q !== '') return q;
  const b = req.body?.[key];
  if (b !== undefined && b !== null && b !== '') return b;
  return fallback;
}

const Saurus_ALLOWED_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.avif']);

const Saurus_ALL_MEDIA_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.avif', '.svg', '.tiff', '.tif', '.ico',
  '.mp4', '.mkv', '.mov', '.webm', '.avi', '.flv', '.wmv', '.m4v', '.3gp', '.ts',
  '.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac', '.opus', '.weba',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.csv',
  '.zip', '.rar', '.7z', '.tar', '.gz',
  '.apk', '.json', '.xml',
]);

const Saurus_IMAGE_KEYWORDS = [
  'image', 'image_url', 'imageurl', 'img', 'img_url', 'thumbnail', 'thumb', 'thumb_url',
  'avatar', 'avatar_url', 'profile', 'profile_url', 'photo', 'photo_url', 'picture',
  'picture_url', 'cover', 'cover_url', 'poster', 'poster_url', 'banner', 'banner_url',
  'wallpaper', 'wallpaper_url', 'preview', 'preview_url', 'screenshot', 'icon', 'icon_url',
  'url'
];

const Saurus_MEDIA_KEYWORDS = [
  'url', 'video', 'video_url', 'videourl', 'media', 'media_url', 'download', 'download_url',
  'audio', 'audio_url', 'file', 'file_url', 'link', 'src', 'source', 'stream', 'stream_url',
  'attachment', 'document', 'doc', 'zip', 'archive',
];

function getExtFromUrl(urlStr) {
  try {
    const u = new URL(urlStr);
    const ext = path.extname(u.pathname).toLowerCase();
    return ext || null;
  } catch { return null; }
}

function isMediaUrl(urlStr) {
  const ext = getExtFromUrl(urlStr);
  return ext ? Saurus_ALL_MEDIA_EXTENSIONS.has(ext) : false;
}

function isImageUrl(urlStr) {
  const ext = getExtFromUrl(urlStr);
  return ext ? Saurus_ALLOWED_IMAGE_EXTENSIONS.has(ext) : false;
}

function hasMediaLikeKey(keyStr) {
  const leaf = String(keyStr).split('.').pop().toLowerCase();
  return Saurus_MEDIA_KEYWORDS.some(k => leaf.includes(k));
}

const _SUPA_CFG = _SaurusConfig.supabase || {};
const _SUPA_URL = (_SUPA_CFG.url || '').replace(/\/$/, '');
const _SUPA_KEY = _SUPA_CFG.serviceKey || '';
const _SUPA_BUCKET = _SUPA_CFG.bucket || 'Saurus-media';

function _generateSaurusFilename(ext) {
  const rand = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return `Saurus${rand}${ext}`;
}

function _guessMimeFromExt(ext) {
  const map = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
    '.webp': 'image/webp', '.gif': 'image/gif', '.bmp': 'image/bmp',
    '.avif': 'image/avif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
    '.mp4': 'video/mp4', '.mkv': 'video/x-matroska', '.mov': 'video/quicktime',
    '.webm': 'video/webm', '.avi': 'video/x-msvideo', '.flv': 'video/x-flv',
    '.wmv': 'video/x-ms-wmv', '.m4v': 'video/x-m4v', '.3gp': 'video/3gpp',
    '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg',
    '.m4a': 'audio/mp4', '.aac': 'audio/aac', '.flac': 'audio/flac',
    '.opus': 'audio/opus', '.weba': 'audio/webm',
    '.pdf': 'application/pdf', '.zip': 'application/zip',
    '.rar': 'application/x-rar-compressed', '.7z': 'application/x-7z-compressed',
    '.apk': 'application/vnd.android.package-archive',
    '.txt': 'text/plain', '.csv': 'text/csv', '.json': 'application/json',
  };
  return map[ext] || 'application/octet-stream';
}

async function _downloadBuffer(urlStr) {
  const controller = new AbortController();
  const timer = setTimeout(function () {
    controller.abort();
  }, 30000);
  try {
    const response = await axiosModuleInstance.get(urlStr, {
      responseType: 'arraybuffer',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/116.0.0.0 Mobile Safari/537.36',
        'Referer': new URL(urlStr).origin + '/'
      },
      maxRedirects: 10,
      validateStatus: function (status) {
        return status >= 200 && status < 400;
      }
    });
    clearTimeout(timer);
    return {
      buffer: Buffer.from(response.data),
      contentType: response.headers['content-type'] || ''
    };
  } catch (error) {
    clearTimeout(timer);
    throw error;
  }
}

async function uploadToSupabase(urlStr, req) {
  if (!_SUPA_URL || !_SUPA_KEY) {
    return null;
  }
  try {
    const downloadResult = await _downloadBuffer(urlStr);
    const buffer = downloadResult.buffer;
    const rawContentType = (downloadResult.contentType || '').split(';')[0].trim().toLowerCase();
    let ext = _mimeToExt(rawContentType) || getExtFromUrl(urlStr) || _detectExtFromBuffer(buffer) || '.bin';
    const filename = _generateSaurusFilename(ext);
    const mime = rawContentType && rawContentType !== 'application/octet-stream' ? rawContentType : _guessMimeFromExt(ext);
    const uploadUrl = `${_SUPA_URL}/storage/v1/object/${_SUPA_BUCKET}/${filename}`;
    const uploadResponse = await axiosModuleInstance.post(uploadUrl, buffer, {
      headers: {
        'Authorization': `Bearer ${_SUPA_KEY}`,
        'Content-Type': mime,
        'x-upsert': 'true'
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      validateStatus: function (status) {
        return status >= 200 && status < 500;
      }
    });
    if (uploadResponse.status >= 400) {
      let errorMessage = 'Unknown error';
      if (uploadResponse.data) {
        if (Buffer.isBuffer(uploadResponse.data)) {
          errorMessage = uploadResponse.data.toString('utf-8');
        } else if (typeof uploadResponse.data === 'object') {
          errorMessage = JSON.stringify(uploadResponse.data);
        } else {
          errorMessage = String(uploadResponse.data);
        }
      }
      throw new Error(`Supabase upload gagal: ${errorMessage}`);
    }
    const base = getDynamicBaseUrl(req);
    return `${base}/${filename}`;
  } catch (error) {
    return null;
  }
}

async function _serveFromSupabase(filename, res) {
  if (!_SUPA_URL || !_SUPA_KEY) return false;
  try {
    const fileUrl = `${_SUPA_URL}/storage/v1/object/${_SUPA_BUCKET}/${filename}`;
    const r = await fetch(fileUrl, {
      headers: { 'Authorization': `Bearer ${_SUPA_KEY}` }
    });
    if (!r.ok) return false;
    const ct = r.headers.get('content-type') || 'application/octet-stream';
    const buf = Buffer.from(await r.arrayBuffer());
    res.setHeader('Content-Type', ct);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.status(200).send(buf);
    return true;
  } catch { return false; }
}

function normalizeImageUrlCandidate(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return null;
}

function hasImageLikeKey(pathString) {
  if (!pathString) return false;
  const leaf = String(pathString).split('.').pop().toLowerCase();
  return Saurus_IMAGE_KEYWORDS.includes(leaf) || /(?:image|img|thumb|thumbnail|avatar|photo|picture|cover|poster|banner|wallpaper|preview|screenshot|icon)/i.test(leaf);
}

// Beberapa upstream (cth. Neoxr) mengembalikan field "page" berupa link
// hasil generate sementara, contoh: "https://s.neoxr.eu/file/mmA575".
// Link semacam ini tidak punya ekstensi file sehingga lolos dari
// pengecekan isImageUrl/isMediaUrl. Field dengan key "page" (atau variannya)
// tetap perlu di-rehost ke Supabase agar hasil akhirnya selalu domain sendiri.
const Saurus_PAGE_KEYWORDS = ['page', 'page_url', 'pageurl', 'result_page', 'view_page'];

function isPageLikeKey(keyStr) {
  const leaf = String(keyStr).split('.').pop().toLowerCase();
  return Saurus_PAGE_KEYWORDS.includes(leaf);
}

function generateProxyImageUrl(targetUrlString, req) {
  const safeUrl = normalizeImageUrlCandidate(targetUrlString);
  if (!safeUrl) return null;
  const parsedUrl = new URL(safeUrl);
  if (parsedUrl.pathname.includes('/api/image-proxy')) return safeUrl;
  const baseUrl = getDynamicBaseUrl(req);
  return `${baseUrl}/api/image-proxy?url=${encodeURIComponent(safeUrl)}`;
}

async function executeDirectImageStreamRouting(targetUrl) {
  if (!targetUrl || typeof targetUrl !== 'string') {
    throw new Error('URL target tidak valid untuk routing image stream.');
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);
  try {
    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Infinix X6831) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Referer': new URL(targetUrl).origin + '/',
      }
    });
    clearTimeout(timeout);
    if (!response.ok) {
      throw new Error(`Upstream menolak: HTTP ${response.status}`);
    }
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = Buffer.from(await response.arrayBuffer());
    return { buffer, contentType };
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

async function interceptAndEnrichMangaDataWithNativeCoverRetrieval(dataArray, req) {
  if (!Array.isArray(dataArray)) return dataArray;
  const baseUrl = getDynamicBaseUrl(req);

  const isMangaDexFormat = dataArray.some(
    item => item && item.relationships && Array.isArray(item.relationships)
  );

  if (!isMangaDexFormat) {
    const COVER_KEYS = ['cover_image','image_url','cover_url','cover','thumb','thumbnail','image','poster','banner','img'];
    return Promise.all(dataArray.map(async (item) => {
      if (!item || typeof item !== 'object') return item;
      const copy = { ...item };
      for (const key of COVER_KEYS) {
        if (typeof copy[key] === 'string' && copy[key].startsWith('http')) {
          copy.thumb = `${baseUrl}/api/image-proxy?url=${encodeURIComponent(copy[key])}`;
          break;
        }
      }
      return copy;
    }));
  }

  const coverArtIdToMangaId = new Map();
  for (const item of dataArray) {
    if (!item || !item.id || !Array.isArray(item.relationships)) continue;
    for (const rel of item.relationships) {
      if (rel.type === 'cover_art' && rel.id) {
        coverArtIdToMangaId.set(rel.id, item.id);
      }
    }
  }

  if (coverArtIdToMangaId.size === 0) return dataArray;

  const mangaIdToCoverUrl = new Map();
  const coverIds = [...coverArtIdToMangaId.keys()];
  const BATCH_SIZE = 100;

  for (let i = 0; i < coverIds.length; i += BATCH_SIZE) {
    const batch = coverIds.slice(i, i + BATCH_SIZE);
    try {
      const qs = batch.map(id => `ids[]=${encodeURIComponent(id)}`).join('&');
      const resp = await fetch(`https://api.mangadex.org/cover?${qs}&limit=${BATCH_SIZE}`, {
        headers: { 'User-Agent': 'api-Saurus/2.0 (+https://api.Saurus.my.id)' },
        signal: AbortSignal.timeout(10000)
      });
      if (!resp.ok) continue;
      const json = await resp.json();
      if (!json.data || !Array.isArray(json.data)) continue;
      for (const cover of json.data) {
        const fileName = cover?.attributes?.fileName;
        if (!fileName) continue;
        const mangaId = coverArtIdToMangaId.get(cover.id);
        if (!mangaId) continue;
        const rawUrl = `https://uploads.mangadex.org/covers/${mangaId}/${fileName}.512.jpg`;
        mangaIdToCoverUrl.set(mangaId, `${baseUrl}/api/image-proxy?url=${encodeURIComponent(rawUrl)}`);
      }
    } catch (_err) {}
  }

  return dataArray.map(item => {
    if (!item || !item.id) return item;
    const coverUrl = mangaIdToCoverUrl.get(item.id);
    if (!coverUrl) return item;
    return { ...item, thumb: coverUrl };
  });
}

async function rehostImageFields(value, contextPath = '', req) {
  if (value === null || value === undefined) return value;

  if (typeof value === 'string') {
    const candidate = normalizeImageUrlCandidate(value);
    if (!candidate) return value;
    if (isMediaUrl(candidate) || isImageUrl(candidate)) {
      const local = await uploadToSupabase(candidate, req);
      return local || candidate;
    }
    return value;
  }

  if (Array.isArray(value)) {
    const output = [];
    for (let i = 0; i < value.length; i++) {
      output.push(await rehostImageFields(value[i], `${contextPath}[${i}]`, req));
    }
    return output;
  }

  if (typeof value === 'object') {
    const output = {};
    for (const [key, childValue] of Object.entries(value)) {
      const nextPath = contextPath ? `${contextPath}.${key}` : key;
      if (typeof childValue === 'string') {
        const candidate = normalizeImageUrlCandidate(childValue);
        if (candidate) {
          const isImg = isImageUrl(candidate);
          const isMedia = !isImg && isMediaUrl(candidate);
          const isPage = !isImg && !isMedia && isPageLikeKey(key);
          if (isImg || isMedia || isPage) {
            const local = await uploadToSupabase(candidate, req);
            output[key] = local || childValue;
            continue;
          }
        }
      }
      output[key] = await rehostImageFields(childValue, nextPath, req);
    }
    return output;
  }

  return value;
}

async function sendJson(res, status, payload, context = '', req) {
  let finalPayload = payload;
  try {
    if (payload && typeof payload === 'object' && !Array.isArray(payload) && payload.ok === true) {
      finalPayload = await rehostImageFields(payload, context, req);
    }
  } catch (error) {
    finalPayload = payload;
  }

  let responsePayload;
  if (finalPayload && typeof finalPayload === 'object' && !Array.isArray(finalPayload)) {
    const { ok: okField, creator: _ignoredCreator, ...rest } = finalPayload;
    responsePayload = { ok: okField !== undefined ? okField : true, creator: 'Saurus', ...rest };
  } else {
    responsePayload = { ok: true, creator: 'Saurus', result: finalPayload };
  }

  const body = JSON.stringify(responsePayload);
  try {
    if (typeof res.status === 'function' && typeof res.json === 'function') {
      return res.status(status).json(responsePayload);
    }
  } catch {}
  try {
    res.statusCode = status;
    if (typeof res.setHeader === 'function') {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
    }
    if (typeof res.end === 'function') {
      return res.end(body);
    }
  } catch {}
  return body;
}

const PLUGINS_DIR = path.join(__dirname, '..', 'plugins');
const plugins = [];
let _cachedDocsPayload = null;
const bootSpinner = makeSpinner('Memuat plugin dan sistem serverless runtime...');

function collectPluginFiles(dir) {
  const result = [];
  if (!fs.existsSync(dir)) return result;
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      result.push(...collectPluginFiles(full));
    } else if (entry.endsWith('.js')) {
      result.push(full);
    }
  }
  return result;
}

try {
  const pluginFiles = collectPluginFiles(PLUGINS_DIR);
  for (const filePath of pluginFiles) {
    const rel = path.relative(PLUGINS_DIR, filePath);
    try {
      const plugin = require(filePath);
      if (plugin.id && plugin.path && typeof plugin.handler === 'function') {
        plugins.push(plugin);
        logInfo(`plugin siap ${c.gray(rel)} ${c.green('✓')}`);
      } else {
        logWarn(`plugin dilewati ${c.gray(rel)}`);
      }
    } catch (e) {
      logError(`plugin load gagal ${c.gray(`(${rel})`)}: ${e?.stack || e?.message || e}`);
    }
  }
} catch (pluginDirError) {
  logError(`Direktori plugin tidak ditemukan pada struktur serverless: ${pluginDirError.message}`);
}
bootSpinner.stop(`siap memuat ${plugins.length} plugin dalam siklus eksekusi`, 'green');

const RAM_SPECS = {
  "1gb": { ram: 1024, cpu: 70, disk: 1024 },
  "2gb": { ram: 2048, cpu: 80, disk: 2048 },
  "3gb": { ram: 3072, cpu: 90, disk: 2048 },
  "4gb": { ram: 4096, cpu: 100, disk: 4096 },
  "5gb": { ram: 5120, cpu: 110, disk: 5120 },
  "6gb": { ram: 6144, cpu: 120, disk: 6144 },
  "7gb": { ram: 7168, cpu: 130, disk: 7168 },
  "8gb": { ram: 8192, cpu: 140, disk: 8192 },
  "9gb": { ram: 9216, cpu: 150, disk: 9216 },
  "10gb": { ram: 10240, cpu: 160, disk: 10240 },
  "unli": { ram: 0, cpu: 0, disk: 0 },
  "unlimited": { ram: 0, cpu: 0, disk: 0 },
};

async function handler(req, res) {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      res.statusCode = 200;
      if (typeof res.setHeader === 'function') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      }
      return typeof res.end === 'function' ? res.end() : null;
    }

    const pathname = getPath(req);
    const parts = pathname.split('/').filter(Boolean);

    if (parts[0] !== 'api') {
      const filenameCandidate = parts[0];
      const hasExt = /\.[a-z0-9]{1,6}$/i.test(filenameCandidate);

      if (hasExt && req.method === 'GET' && /^Saurus[a-z0-9]+\.[a-z0-9]{1,6}$/i.test(filenameCandidate)) {
        const guessedContentType = guessContentTypeFromFilename(filenameCandidate);
        const cloudinaryCandidates = [];
        const extensionLower = (path.extname(filenameCandidate) || '').toLowerCase();
        const basenameWithoutExtension = filenameCandidate.replace(/\.[^.]+$/, '');

        if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.avif', '.svg', '.tif', '.tiff'].includes(extensionLower)) {
          cloudinaryCandidates.push(`image/upload/${filenameCandidate}`);
          cloudinaryCandidates.push(`raw/upload/${filenameCandidate}`);
        } else if (['.mp4', '.mkv', '.mov', '.webm', '.avi', '.flv', '.wmv', '.m4v', '.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac'].includes(extensionLower)) {
          cloudinaryCandidates.push(`video/upload/${filenameCandidate}`);
          cloudinaryCandidates.push(`raw/upload/${filenameCandidate}`);
        } else {
          cloudinaryCandidates.push(`raw/upload/${filenameCandidate}`);
          cloudinaryCandidates.push(`image/upload/${filenameCandidate}`);
          cloudinaryCandidates.push(`video/upload/${filenameCandidate}`);
        }

        if (firebaseReady && storageBucket) {
          try {
            const legacyFileRef = storageBucket.file(`uploads/${filenameCandidate}`);
            const [exists] = await legacyFileRef.exists();
            if (exists) {
              const [meta] = await legacyFileRef.getMetadata();
              const contentType = meta.contentType || guessedContentType;
              const [buffer] = await legacyFileRef.download();
              res.setHeader('Content-Type', contentType);
              res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
              res.setHeader('Content-Disposition', 'inline; filename="' + filenameCandidate + '"');
              return res.status(200).send(buffer);
            }
          } catch (legacyServeErr) {
            logWarn('Gagal serve file Firebase legacy: ' + legacyServeErr.message);
          }
        }

        try {
          for (const deliveryPath of cloudinaryCandidates) {
            const cloudinaryUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/${deliveryPath}`;
            if (!process.env.CLOUDINARY_CLOUD_NAME) break;

            try {
              const upstream = await axiosModuleInstance.get(cloudinaryUrl, {
                responseType: 'stream',
                timeout: 15000,
                maxRedirects: 5,
                validateStatus: (status) => status >= 200 && status < 500
              });

              if (upstream.status >= 200 && upstream.status < 300) {
                res.status(upstream.status);
                res.setHeader('Content-Type', upstream.headers['content-type'] || guessedContentType);
                res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
                res.setHeader('Content-Disposition', 'inline; filename="' + filenameCandidate + '"');
                if (upstream.headers['content-length']) {
                  res.setHeader('Content-Length', upstream.headers['content-length']);
                }

                await new Promise((resolve, reject) => {
                  upstream.data.on('error', reject);
                  res.on('close', resolve);
                  upstream.data.pipe(res);
                  upstream.data.on('end', resolve);
                });
                return;
              }
            } catch (cloudinaryServeErr) {
              logWarn(`Gagal serve file dari Cloudinary (${deliveryPath}): ` + cloudinaryServeErr.message);
            }
          }
        } catch (serveErr) {
          logWarn('Gagal serve file Cloudinary: ' + serveErr.message);
        }

        const servedFromSupa = await _serveFromSupabase(filenameCandidate, res);
        if (servedFromSupa) return;

        return res.status(404).json({ ok: false, message: 'File tidak ditemukan.' });
      }

      if (hasExt && req.method === 'GET') {
        try {
          const snap = rtdb
            ? await rtdb.ref('snippets').orderByChild('filename').equalTo(filenameCandidate).limitToFirst(1).once('value')
            : null;
          if (snap.exists()) {
            const entries = snap.val();
            const snippetId = Object.keys(entries)[0];
            return res.redirect(302, '/snippet?id=' + snippetId);
          }
        } catch (_) {}
      }
      return res.status(404).json({ ok: false, message: 'Not Found' });
    }

    if (parts[1] === 'create-panel' && req.method === 'POST') {
        const keyCheck = await validateApiKey(req);
        if (!keyCheck.ok) {
            return res.status(keyCheck.status || 401).json({ ok: false, message: keyCheck.message || 'API Key tidak valid.' });
        }

        const username = getInput(req, 'username');
        let ram = getInput(req, 'ram');

        if (!username || !ram) {
            return res.status(400).json({ ok: false, message: 'Parameter username dan ram diperlukan.' });
        }

        ram = String(ram).toLowerCase();
        if (!/^[a-z0-9_]{3,16}$/.test(username)) {
            return res.status(400).json({ ok: false, message: 'Username hanya boleh huruf kecil, angka, underscore (3-16 karakter).' });
        }

        const specs = RAM_SPECS[ram];
        if (!specs) {
            return res.status(400).json({ ok: false, message: 'Paket RAM tidak valid.' });
        }

        const clientIp = getClientIp(req);
        const safeIp = clientIp.replace(/[.\:]/g, '_');

        if (firebaseReady && db) {
            const limitRef = db.collection('panelLimits').doc(safeIp);
            try {
                await db.runTransaction(async (t) => {
                    const doc = await t.get(limitRef);
                    const currentCount = doc.exists ? (doc.data().count || 0) : 0;
                    if (currentCount >= 2 && keyCheck.plan !== 'owner') {
                        throw new Error('Limit limit_reached');
                    }
                    t.set(limitRef, { count: currentCount + 1, lastUsed: new Date().toISOString() }, { merge: true });
                });
            } catch (err) {
                if (err.message === 'Limit limit_reached') {
                    return res.status(429).json({ ok: false, message: 'Limit tercapai. Maksimal 2 free panel per perangkat/IP.' });
                }
            }
        }

        const email = `${username}@Saurus.dev`;
        const name = username.charAt(0).toUpperCase() + username.slice(1).toLowerCase() + " Server";
        const password = username + crypto.randomBytes(3).toString("hex");

        try {
            // Cek dulu apakah user dengan email/username ini udah exist di Pterodactyl
            let user = null;

            // Cek via email
            try {
                const checkEmail = await axiosModuleInstance.get(
                    `${PTERO_DOMAIN}/api/application/users?filter[email]=${encodeURIComponent(email)}`,
                    {
                        headers: {
                            Authorization: `Bearer ${PTERO_API_KEY}`,
                            "Content-Type": "application/json",
                            Accept: "Application/vnd.pterodactyl.v1+json",
                        },
                        timeout: 10000
                    }
                );
                const existingByEmail = checkEmail.data?.data;
                if (existingByEmail && existingByEmail.length > 0) {
                    user = existingByEmail[0].attributes;
                }
            } catch (_) {}

            // Kalau belum ketemu via email, cek via username
            if (!user) {
                try {
                    const checkUser = await axiosModuleInstance.get(
                        `${PTERO_DOMAIN}/api/application/users?filter[username]=${encodeURIComponent(username)}`,
                        {
                            headers: {
                                Authorization: `Bearer ${PTERO_API_KEY}`,
                                "Content-Type": "application/json",
                                Accept: "Application/vnd.pterodactyl.v1+json",
                            },
                            timeout: 10000
                        }
                    );
                    const existingByUser = checkUser.data?.data;
                    if (existingByUser && existingByUser.length > 0) {
                        // Pastiin username-nya exact match (filter Ptero bisa partial)
                        const exact = existingByUser.find(u => u.attributes.username === username);
                        if (exact) user = exact.attributes;
                    }
                } catch (_) {}
            }

            // Kalau belum exist, baru create user baru
            if (!user) {
                const userRes = await axiosModuleInstance.post(
                    `${PTERO_DOMAIN}/api/application/users`,
                    {
                        email,
                        username,
                        first_name: name,
                        last_name: "Panel",
                        language: "en",
                        password,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${PTERO_API_KEY}`,
                            "Content-Type": "application/json",
                            Accept: "Application/vnd.pterodactyl.v1+json",
                        },
                        timeout: 15000
                    }
                );
                user = userRes.data.attributes;
            }

            const eggRes = await axiosModuleInstance.get(
                `${PTERO_DOMAIN}/api/application/nests/${PTERO_NEST_ID}/eggs/${PTERO_EGG_ID}`,
                {
                    headers: {
                        Authorization: `Bearer ${PTERO_API_KEY}`,
                        "Content-Type": "application/json",
                        Accept: "Application/vnd.pterodactyl.v1+json",
                    },
                    timeout: 15000
                }
            );

            const startupCmd = eggRes.data.attributes.startup;

            const serverRes = await axiosModuleInstance.post(
                `${PTERO_DOMAIN}/api/application/servers`,
                {
                    name,
                    description: `Created via Saurus API [${new Date().toISOString()}]`,
                    user: user.id,
                    egg: parseInt(PTERO_EGG_ID),
                    docker_image: "ghcr.io/parkervcp/yolks:nodejs_18",
                    startup: startupCmd,
                    environment: {
                        INST: "npm",
                        USER_UPLOAD: "0",
                        AUTO_UPDATE: "0",
                        CMD_RUN: "npm start",
                        JS_FILE: "index.js",
                    },
                    limits: {
                        memory: specs.ram,
                        swap: 0,
                        disk: specs.disk,
                        io: 500,
                        cpu: specs.cpu,
                    },
                    feature_limits: {
                        databases: 5,
                        backups: 5,
                        allocations: 5,
                    },
                    deploy: {
                        locations: [parseInt(PTERO_LOC_ID)],
                        dedicated_ip: false,
                        port_range: [],
                    },
                },
                {
                    headers: {
                        Authorization: `Bearer ${PTERO_API_KEY}`,
                        "Content-Type": "application/json",
                        Accept: "Application/vnd.pterodactyl.v1+json",
                    },
                    timeout: 10000
                }
            );

            const serverAttr = serverRes.data.attributes;

            const panelData = {
                domain: PTERO_DOMAIN,
                username: user.username,
                password: password,
                email: email,
                ram: specs.ram === 0 ? "Unlimited" : `${specs.ram / 1000} GB`,
                server_id: serverAttr.id,
                server_name: serverAttr.name
            };

            // Simpan ke Firestore supaya panel muncul di semua device
            if (firebaseReady && db && keyCheck.uid) {
                try {
                    await db.collection('userPanels').doc(String(serverAttr.id)).set({
                        uid: keyCheck.uid,
                        ...panelData,
                        createdAt: new Date().toISOString()
                    });
                } catch(e) { /* Firestore gagal, tetap lanjut */ }
            }

            return res.status(200).json({
                ok: true,
                message: 'Panel berhasil dibuat',
                data: panelData
            });

        } catch (err) {
            const rawMsg = err?.response?.data?.errors?.[0]?.detail || err?.response?.data?.message || err.message;
            if (firebaseReady && db) {
                try {
                    const limitRef = db.collection('panelLimits').doc(safeIp);
                    await db.runTransaction(async (t) => {
                        const doc = await t.get(limitRef);
                        if (doc.exists && doc.data().count > 0) {
                            t.update(limitRef, { count: doc.data().count - 1 });
                        }
                    });
                } catch(e){}
            }
            return res.status(500).json({ ok: false, message: `Gagal membuat panel: ${rawMsg}` });
        }
    }

    if (parts[1] === 'my-panels' && req.method === 'GET') {
        const keyCheck = await validateApiKey(req);
        if (!keyCheck.ok) {
            return res.status(keyCheck.status || 401).json({ ok: false, message: keyCheck.message || 'API Key tidak valid.' });
        }
        if (!firebaseReady || !db || !keyCheck.uid) {
            return res.status(200).json({ ok: true, data: [] });
        }
        try {
            const snap = await db.collection('userPanels').where('uid', '==', keyCheck.uid).get();
            const panels = [];
            snap.forEach(doc => panels.push(doc.data()));
            return res.status(200).json({ ok: true, data: panels });
        } catch(e) {
            return res.status(500).json({ ok: false, message: 'Gagal membaca data panel.' });
        }
    }

    if (parts[1] === 'delete-panel' && req.method === 'POST') {
        const keyCheck = await validateApiKey(req);
        if (!keyCheck.ok) {
            return res.status(keyCheck.status || 401).json({ ok: false, message: keyCheck.message || 'API Key tidak valid.' });
        }

        const server_id = getInput(req, 'server_id');

        if (!server_id) {
            return res.status(400).json({ ok: false, message: 'Parameter server_id diperlukan.' });
        }

        const clientIp = getClientIp(req);
        const safeIp = clientIp.replace(/[.\:]/g, '_');

        try {
            await axiosModuleInstance.delete(
                `${PTERO_DOMAIN}/api/application/servers/${server_id}`,
                {
                    headers: {
                        Authorization: `Bearer ${PTERO_API_KEY}`,
                        "Content-Type": "application/json",
                        Accept: "Application/vnd.pterodactyl.v1+json",
                    },
                    timeout: 10000
                }
            );

            if (firebaseReady && db) {
                try {
                    const limitRef = db.collection('panelLimits').doc(safeIp);
                    await db.runTransaction(async (t) => {
                        const doc = await t.get(limitRef);
                        if (doc.exists && doc.data().count > 0) {
                            t.update(limitRef, { count: doc.data().count - 1 });
                        }
                    });
                } catch(e){}
                // Hapus dari Firestore userPanels
                try {
                    await db.collection('userPanels').doc(String(server_id)).delete();
                } catch(e){}
            }

            return res.status(200).json({
                ok: true,
                message: 'Instansi server berhasil diterminasi.'
            });

        } catch (err) {
            const rawMsg = err?.response?.data?.errors?.[0]?.detail || err?.response?.data?.message || err.message;
            if (err?.response?.status === 404) {
                return res.status(200).json({ ok: true, message: 'Instansi server tidak ditemukan atau sudah diterminasi sebelumnya.' });
            }
            return res.status(500).json({ ok: false, message: `Gagal menghapus panel: ${rawMsg}` });
        }
    }

    if (parts[1] === 'manga-proxy' || parts[1] === 'image-proxy') {
        if (req.method !== 'GET') return res.status(405).json({ ok: false, message: 'Method tidak diizinkan.' });
        const targetUrl = req.query?.url;
        if (!targetUrl) return res.status(400).json({ ok: false, message: 'Parameter url diperlukan.' });
        
        try {
            const proxyResult = await executeDirectImageStreamRouting(targetUrl);
            res.setHeader('Content-Type', proxyResult.contentType);
            res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800');
            return res.status(200).send(proxyResult.buffer);
        } catch (error) {
            return res.status(502).json({ ok: false, message: 'Reverse proxy gagal memuat aset: ' + error.message });
        }
    }

    if (parts[1] === 'apk') {
        if (req.method !== 'GET') return res.status(405).json({ ok: false, message: 'Method tidak diizinkan.' });
        const q = req.query?.q || 'random';
        try {
            const upstream = await fetch(`https://api.neoxr.eu/api/apk?q=${encodeURIComponent(q)}&apikey=yMb35i`, { signal: AbortSignal.timeout(10000) });
            const json = await upstream.json();

            if (json.status && json.data) {
                const limitedDataArray = json.data.slice(0, 15);
                json.data = await Promise.all(limitedDataArray.map(async (item) => {
                    let sanitizedName = item.name.replace(/[^a-zA-Z0-9 ]/g, '').trim();
                    let dynamicAvatarFallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(sanitizedName)}&background=random&color=fff&size=256&font-size=0.4&bold=true`;
                    
                    if (!item.thumbnail && item.url) {
                        try {
                            const htmlRes = await axiosModuleInstance.get(item.url, {
                                timeout: 4000,
                                headers: {
                                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
                                }
                            });
                            
                            const ogImageMatch = htmlRes.data.match(/<meta\s+(?:property|name)="og:image"\s+content="([^"]+)"/i);
                            if (ogImageMatch && ogImageMatch[1]) {
                                dynamicAvatarFallbackUrl = ogImageMatch[1];
                            } else {
                                const classImageMatch = htmlRes.data.match(/<img[^>]+src="([^"]+)"[^>]*class="[^"]*(?:icon|logo|thumb)[^"]*"[^>]*>/i);
                                if (classImageMatch && classImageMatch[1]) {
                                    dynamicAvatarFallbackUrl = classImageMatch[1];
                                }
                            }
                        } catch (scrapingTimeoutError) {}
                    }
                    
                    item.thumbnail = item.thumbnail || dynamicAvatarFallbackUrl;
                    return item;
                }));
            }
            return res.status(upstream.ok ? 200 : upstream.status).json(json);
        } catch (e) { return res.status(500).json({ ok: false, message: e.message }); }
    }

    if (parts[1] === 'apk-detail') {
      if (req.method !== 'GET') return res.status(405).json({ ok: false, message: 'Method tidak diizinkan.' });
      const q = req.query?.q || '';
      const no = req.query?.no || '';
      if (!q || !no) return res.status(400).json({ ok: false, message: 'Parameter q dan no diperlukan.' });
      try {
        const upstream = await fetch(`https://api.neoxr.eu/api/apk?q=${encodeURIComponent(q)}&no=${encodeURIComponent(no)}&apikey=yMb35i`, { signal: AbortSignal.timeout(10000) });
        const data = await upstream.json();
        return res.status(upstream.ok ? 200 : upstream.status).json(data);
      } catch (e) { return res.status(500).json({ ok: false, message: e.message }); }
    }

const SIPUTZX_ANIME_BASE = 'https://api.siputzx.my.id/api/anime/samehadaku';
const SIPUTZX_ANIME_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

function animeActionFromParts(parts) {
  if (parts[1] !== 'anime') return null;
  if (parts[2] === 'samehadaku') return parts[3] || '';
  return parts[2] || '';
}

function cleanText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined) return [];
  return [value];
}

function firstMatch(value, regex) {
  const text = String(value || '');
  const match = text.match(regex);
  return match ? match[1] : '';
}

function isPlayableStreamUrl(url) {
  if (!url) return false;
  const normalized = String(url).trim();
  if (/\.(mp4|mkv|webm|mov)(?:$|[?#])/i.test(normalized)) return true;
  if (/wibufile\.com\/video/i.test(normalized)) return true;
  if (/api\.wibufile\.com\/embed/i.test(normalized)) return true;
  if (/blogger\.com\/video\.g/i.test(normalized)) return true;
  if (/youtube\.com\/embed|youtu\.be/i.test(normalized)) return true;
  if (/pixeldrain\.com\/(u|api\/file)\//i.test(normalized)) return true;
  return false;
}

function convertPixeldrainUrl(url) {
  const match = String(url || '').match(/pixeldrain\.com\/u\/([a-zA-Z0-9_-]+)/i);
  if (match) return `https://pixeldrain.com/api/file/${match[1]}?download`;
  return url;
}

function normalizeSamehadakuLatestItem(item = {}) {
  const title = cleanText(item.title);
  const link = cleanText(item.link);
  const episode = cleanText(item.episode);
  const release = cleanText(item.release);
  return {
    title,
    url: link,
    thumbnail: cleanText(item.thumbnail),
    episode: episode ? `Episode ${episode}` : release,
    day: cleanText(item.postedBy) || release || 'ONGOING',
    date: release,
    score: episode ? `Episode ${episode}` : release || 'N/A',
  };
}

function normalizeSamehadakuSearchItem(item = {}) {
  const genres = toArray(item.genre).map(cleanText).filter(Boolean).join(', ');
  const types = toArray(item.type).map(cleanText).filter(Boolean).join(' / ');
  return {
    title: cleanText(item.title),
    url: cleanText(item.link),
    thumbnail: cleanText(item.thumbnail),
    rating: cleanText(item.star) || 'N/A',
    status: types || 'ANIME',
    genres,
    description: cleanText(item.description),
    views: cleanText(item.views),
  };
}

function normalizeSamehadakuDetailItem(item = {}) {
  const episodes = toArray(item.episodes).map((ep) => ({
    title: cleanText(ep.title),
    url: cleanText(ep.link),
    date: cleanText(ep.date),
  })).filter((ep) => ep.url || ep.title);

  return {
    title: cleanText(item.title),
    thumbnail: cleanText(item.thumbnail),
    synopsis: cleanText(item.description),
    score: cleanText(item.rating),
    rating: cleanText(item.rating),
    published: cleanText(item.published),
    genres: toArray(item.genres).map(cleanText).filter(Boolean).join(', '),
    episode_list: episodes,
  };
}

function normalizeSamehadakuDownloads(raw = {}) {
  const rawDownloads = toArray(raw.downloads);
  const grouped = new Map();
  const streamCandidates = [];
  const seenUrls = new Set();

  for (const dl of rawDownloads) {
    const name = cleanText(dl?.name || dl?.quality || dl?.host);
    const url = cleanText(dl?.link || dl?.url);
    if (!url || seenUrls.has(url)) continue;
    seenUrls.add(url);

    const quality = firstMatch(name, /(\d{3,4}p)/i) || 'Default';
    const server = cleanText(name.replace(/(\d{3,4}p)/i, '').replace(/[\s\-•–—:]+/g, ' ')) || 'Link';

    if (!grouped.has(quality)) grouped.set(quality, []);
    grouped.get(quality).push({ server, url });

    if (isPlayableStreamUrl(url)) {
      const playUrl = /pixeldrain\.com\/u\//i.test(url) ? convertPixeldrainUrl(url) : url;
      streamCandidates.push({
        quality: name || quality,
        url: playUrl,
      });
    }
  }

  streamCandidates.sort((a, b) => {
    const score = (u) => {
      const url = String(u.url || '');
      if (/\.(mp4|mkv|webm|mov)(?:$|[?#])/i.test(url)) return 0;
      if (/wibufile\.com\/video/i.test(url)) return 1;
      if (/blogger\.com\/video\.g/i.test(url)) return 2;
      if (/api\.wibufile\.com\/embed/i.test(url)) return 3;
      if (/pixeldrain\.com\/u\//i.test(url)) return 4;
      return 9;
    };
    return score(a) - score(b);
  });

  if (!streamCandidates.length) {
    for (const dl of rawDownloads.slice(0, 5)) {
      const url = cleanText(dl?.link || dl?.url);
      if (!url || seenUrls.has(url)) continue;
      streamCandidates.push({
        quality: cleanText(dl?.name || dl?.quality || 'Server'),
        url,
      });
    }
  }

  return {
    title: cleanText(raw.title),
    stream_links: streamCandidates,
    downloads: [...grouped.entries()].map(([quality, links]) => ({ quality, links })),
  };
}

async function siputzxAnimeRequest(endpoint, params = {}) {
  const url = new URL(`${SIPUTZX_ANIME_BASE}/${endpoint}`);
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    url.searchParams.set(key, String(value));
  }

  const response = await axiosModuleInstance.get(url.toString(), {
    headers: { 'User-Agent': SIPUTZX_ANIME_UA },
    timeout: 15000,
    maxRedirects: 5,
    validateStatus: (status) => status >= 200 && status < 500,
  });

  return response.data;
}

if (parts[1] === 'anime') {
  if (req.method !== 'GET') return res.status(405).json({ ok: false, message: 'Method tidak diizinkan.' });

  // Cek dulu apakah ada plugin yang match (e.g. /api/anime/bilibili, /api/anime/pixiv)
  const _animePlugin = plugins.find((p) => p.path === pathname);
  if (_animePlugin) {
    const keyCheck = await validateApiKey(req);
    if (!keyCheck.ok) return sendJson(res, keyCheck.status || 401, { ok: false, message: keyCheck.message || 'API Key tidak valid.' }, '', req);
    try {
      const result = await _animePlugin.handler(req, getInput, res);
      if (result === null || result?.__handled === true) return;
      const httpStatus = (result?.ok === false && typeof result.status === 'number') ? result.status : result?.ok === false ? 400 : 200;
      const { status: _s, __handled: _h, ...payload } = result;
      return sendJson(res, httpStatus, payload, _animePlugin.path || _animePlugin.id || 'unknown', req);
    } catch (e) {
      return sendJson(res, 500, { ok: false, message: e.message }, '', req);
    }
  }

  const action = animeActionFromParts(parts);
  if (!action) return res.status(404).json({ ok: false, message: 'Endpoint anime tidak ditemukan.' });

  try {
    if (action === 'latest') {
      const payload = await siputzxAnimeRequest('latest');
      const rawList = toArray(payload?.data?.anime || payload?.data || []);
      const data = rawList.map(normalizeSamehadakuLatestItem).filter((item) => item.title && item.url);
      return res.status(200).json({ ok: true, data });
    }

    if (action === 'search') {
      const q = (req.query?.q || req.query?.query || '').trim();
      if (!q) return res.status(400).json({ ok: false, message: 'Parameter q / query diperlukan.' });

      const payload = await siputzxAnimeRequest('search', { query: q });
      const rawList = toArray(payload?.data || []);
      const data = rawList.map(normalizeSamehadakuSearchItem).filter((item) => item.title && item.url);
      return res.status(200).json({ ok: true, data });
    }

    if (action === 'detail') {
      const targetUrl = (req.query?.url || req.query?.link || '').trim();
      if (!targetUrl) return res.status(400).json({ ok: false, message: 'Parameter url / link diperlukan.' });

      const payload = await siputzxAnimeRequest('detail', { link: targetUrl });
      const data = normalizeSamehadakuDetailItem(payload?.data || {});
      return res.status(200).json({ ok: true, data });
    }

    if (action === 'stream') {
      const targetUrl = (req.query?.url || req.query?.link || '').trim();
      if (!targetUrl) return res.status(400).json({ ok: false, message: 'Parameter url / link diperlukan.' });

      const payload = await siputzxAnimeRequest('download', { url: targetUrl });
      const data = normalizeSamehadakuDownloads(payload?.data || {});
      return res.status(200).json({ ok: true, data });
    }

    return res.status(404).json({ ok: false, message: 'Endpoint anime tidak ditemukan.' });
  } catch (e) {
    return res.status(500).json({ ok: false, message: e.message || 'Gagal memuat data anime.' });
  }
}

    if (parts[1] === 'donghua-search') {
      if (req.method !== 'GET') return res.status(405).json({ ok: false, message: 'Method tidak diizinkan.' });
      const q = req.query?.q || '';
      if (!q) return res.status(400).json({ ok: false, message: 'Parameter q diperlukan.' });
      try {
        const upstream = await fetch(`https://api-nanas.my.id/api/nonton/donghub/search.php?query=${encodeURIComponent(q)}`, { signal: AbortSignal.timeout(10000) });
        const data = await upstream.json();
        return res.status(upstream.ok ? 200 : upstream.status).json(data);
      } catch (e) { return res.status(500).json({ ok: false, message: e.message }); }
    }

    if (parts[1] === 'donghua-detail') {
      if (req.method !== 'GET') return res.status(405).json({ ok: false, message: 'Method tidak diizinkan.' });
      const slug = req.query?.slug || '';
      if (!slug) return res.status(400).json({ ok: false, message: 'Parameter slug diperlukan.' });
      try {
        const upstream = await fetch(`https://api-nanas.my.id/api/nonton/donghub/detail.php?slug=${encodeURIComponent(slug)}`, { signal: AbortSignal.timeout(10000) });
        const data = await upstream.json();
        return res.status(upstream.ok ? 200 : upstream.status).json(data);
      } catch (e) { return res.status(500).json({ ok: false, message: e.message }); }
    }

    if (parts[1] === 'donghua-episode') {
      if (req.method !== 'GET') return res.status(405).json({ ok: false, message: 'Method tidak diizinkan.' });
      const slug = req.query?.slug || '';
      if (!slug) return res.status(400).json({ ok: false, message: 'Parameter slug diperlukan.' });
      try {
        const upstream = await fetch(`https://api-nanas.my.id/api/nonton/donghub/stream%20dan%20download.php?slug=${encodeURIComponent(slug)}`, { signal: AbortSignal.timeout(10000) });
        const data = await upstream.json();
        return res.status(upstream.ok ? 200 : upstream.status).json(data);
      } catch (e) { return res.status(500).json({ ok: false, message: e.message }); }
    }

    if (parts[1] === 'donghua-list') {
      if (req.method !== 'GET') return res.status(405).json({ ok: false, message: 'Method tidak diizinkan.' });
      const page = req.query?.page || '1';
      try {
        const upstream = await fetch(`https://api-nanas.my.id/api/nonton/donghub/list.php?page=${encodeURIComponent(page)}`, { signal: AbortSignal.timeout(10000) });
        const data = await upstream.json();
        return res.status(upstream.ok ? 200 : upstream.status).json(data);
      } catch (e) { return res.status(500).json({ ok: false, message: e.message }); }
    }

    if (parts[1] === 'donghua-popular') {
      if (req.method !== 'GET') return res.status(405).json({ ok: false, message: 'Method tidak diizinkan.' });
      try {
        const upstream = await fetch(`https://api-nanas.my.id/api/nonton/donghub/pupular.php`, { signal: AbortSignal.timeout(10000) });
        const data = await upstream.json();
        return res.status(upstream.ok ? 200 : upstream.status).json(data);
      } catch (e) { return res.status(500).json({ ok: false, message: e.message }); }
    }

    if (parts[1] === 'donghua-movie') {
      if (req.method !== 'GET') return res.status(405).json({ ok: false, message: 'Method tidak diizinkan.' });
      const page = req.query?.page || '1';
      try {
        const upstream = await fetch(`https://api-nanas.my.id/api/nonton/donghub/movie.php?page=${encodeURIComponent(page)}`, { signal: AbortSignal.timeout(10000) });
        const data = await upstream.json();
        return res.status(upstream.ok ? 200 : upstream.status).json(data);
      } catch (e) { return res.status(500).json({ ok: false, message: e.message }); }
    }

    if (parts[1] === 'donghua-schedule') {
      if (req.method !== 'GET') return res.status(405).json({ ok: false, message: 'Method tidak diizinkan.' });
      try {
        const upstream = await fetch(`https://api-nanas.my.id/api/nonton/donghub/schedule.php`, { signal: AbortSignal.timeout(10000) });
        const data = await upstream.json();
        return res.status(upstream.ok ? 200 : upstream.status).json(data);
      } catch (e) { return res.status(500).json({ ok: false, message: e.message }); }
    }

    if (parts[1] === 'donghua-genre') {
      if (req.method !== 'GET') return res.status(405).json({ ok: false, message: 'Method tidak diizinkan.' });
      const slug = req.query?.slug || '';
      if (!slug) return res.status(400).json({ ok: false, message: 'Parameter slug diperlukan.' });
      try {
        const upstream = await fetch(`https://api-nanas.my.id/api/nonton/donghub/genre.php?slug=${encodeURIComponent(slug)}`, { signal: AbortSignal.timeout(10000) });
        const data = await upstream.json();
        return res.status(upstream.ok ? 200 : upstream.status).json(data);
      } catch (e) { return res.status(500).json({ ok: false, message: e.message }); }
    }
    
        if (parts[1] === 'tv') {
      if (req.method !== 'GET') return res.status(405).json({ ok: false, message: 'Method tidak diizinkan.' });
      const channel = req.query?.channel || '';
      try {
        const upstream = await fetch(`https://api-nanas.my.id/api/nonton//nonton-tv.php?channel=${encodeURIComponent(channel)}`, { signal: AbortSignal.timeout(15000) });
        const data = await upstream.json();
        return res.status(upstream.ok ? 200 : upstream.status).json(data);
      } catch (e) {
        return res.status(500).json({ ok: false, message: e.message });
      }
    }   

    if (parts[1] === 'manga-recent') {
      if (req.method !== 'GET') return res.status(405).json({ ok: false, message: 'Method tidak diizinkan.' });
      try {
        const upstream = await fetch(`https://api.mangadex.org/manga?limit=20&contentRating[]=safe&contentRating[]=suggestive&originalLanguage[]=ja&order[latestUploadedChapter]=desc&includes[]=cover_art`, {
          headers: { 'User-Agent': 'api-Saurus/2.0 (+https://api.Saurus.my.id)' },
          signal: AbortSignal.timeout(10000)
        });
        const json = await upstream.json();
        if (json.result === 'ok' && json.data) {
          json.status = true;
          json.data = await interceptAndEnrichMangaDataWithNativeCoverRetrieval(json.data, req);
        }
        return res.status(upstream.ok ? 200 : upstream.status).json(json);
      } catch (e) { return res.status(500).json({ ok: false, message: e.message }); }
    }

    if (parts[1] === 'manga') {
      if (req.method !== 'GET') return res.status(405).json({ ok: false, message: 'Method tidak diizinkan.' });
      const q = req.query?.q || '';
      if (!q) return res.status(400).json({ ok: false, message: 'Parameter q diperlukan.' });
      try {
        const upstream = await fetch(`https://api.mangadex.org/manga?title=${encodeURIComponent(q)}&limit=20&originalLanguage[]=ja&contentRating[]=safe&contentRating[]=suggestive&includes[]=cover_art`, {
          headers: { 'User-Agent': 'api-Saurus/2.0 (+https://api.Saurus.my.id)' },
          signal: AbortSignal.timeout(10000)
        });
        const json = await upstream.json();
        if (json.result === 'ok' && json.data) {
          json.status = true;
          json.data = await interceptAndEnrichMangaDataWithNativeCoverRetrieval(json.data, req);
        }
        return res.status(upstream.ok ? 200 : upstream.status).json(json);
      } catch (e) { return res.status(500).json({ ok: false, message: e.message }); }
    }

    if (parts[1] === 'manga-detail') {
      if (req.method !== 'GET') return res.status(405).json({ ok: false, message: 'Method tidak diizinkan.' });
      const id = req.query?.id || '';
      if (!id) return res.status(400).json({ ok: false, message: 'Parameter id diperlukan.' });
      try {
        const upstream = await fetch(`https://api.mangadex.org/manga/${encodeURIComponent(id)}?includes[]=cover_art&includes[]=author&includes[]=artist`, {
          headers: { 'User-Agent': 'api-Saurus/2.0 (+https://api.Saurus.my.id)' },
          signal: AbortSignal.timeout(10000)
        });
        const json = await upstream.json();
        if (json.result === 'ok' && json.data) {
          json.status = true;
          const enrichedArray = await interceptAndEnrichMangaDataWithNativeCoverRetrieval([json.data], req);
          json.data = enrichedArray[0];
          
          const feedRes = await fetch(`https://api.mangadex.org/manga/${encodeURIComponent(id)}/feed?limit=500&translatedLanguage[]=id&translatedLanguage[]=en&order[chapter]=desc`, {
            headers: { 'User-Agent': 'api-Saurus/2.0 (+https://api.Saurus.my.id)' },
            signal: AbortSignal.timeout(10000)
          });
          const feedJson = await feedRes.json();
          if (feedJson.result === 'ok') {
            json.data.chapters = (feedJson.data || []).map(ch => ({
              id: ch.id,
              chapter: `Chapter ${ch.attributes?.chapter || '?'}`,
              date: new Date(ch.attributes?.publishAt || 0).toLocaleDateString('id-ID')
            }));
          }
        }
        return res.status(upstream.ok ? 200 : upstream.status).json(json);
      } catch (e) { return res.status(500).json({ ok: false, message: e.message }); }
    }

    if (parts[1] === 'manga-render') {
      if (req.method !== 'GET') return res.status(405).json({ ok: false, message: 'Method tidak diizinkan.' });
      const chapter_id = req.query?.chapter_id || '';
      if (!chapter_id) return res.status(400).json({ ok: false, message: 'Parameter chapter_id diperlukan.' });
      try {
        const ahRes = await fetch(`https://api.mangadex.org/at-home/server/${encodeURIComponent(chapter_id)}`, {
          headers: { 'User-Agent': 'api-Saurus/2.0 (+https://api.Saurus.my.id)' },
          signal: AbortSignal.timeout(10000)
        });
        const ahData = await ahRes.json();
        if (ahData.result !== 'ok') throw new Error(ahData.errors?.[0]?.detail || 'MangaDex error');
        const { baseUrl, chapter } = ahData;
        const pages = (chapter.data || []).map(f => `${baseUrl}/data/${chapter.hash}/${f}`);
        return res.status(200).json({ ok: true, status: true, data: pages });
      } catch (e) { return res.status(500).json({ ok: false, message: e.message }); }
    }

    if (parts[1] === 'manhwa-recent') {
      if (req.method !== 'GET') return res.status(405).json({ ok: false, message: 'Method tidak diizinkan.' });
      try {
        const upstream = await fetch(`https://api.mangadex.org/manga?limit=20&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica&originalLanguage[]=ko&order[latestUploadedChapter]=desc&includes[]=cover_art`, {
          headers: { 'User-Agent': 'api-Saurus/2.0 (+https://api.Saurus.my.id)' },
          signal: AbortSignal.timeout(10000)
        });
        const json = await upstream.json();
        if (json.result === 'ok' && json.data) {
          json.status = true;
          json.data = await interceptAndEnrichMangaDataWithNativeCoverRetrieval(json.data, req);
        }
        return res.status(upstream.ok ? 200 : upstream.status).json(json);
      } catch (e) { return res.status(500).json({ ok: false, message: e.message }); }
    }

    if (parts[1] === 'manhwa') {
      if (req.method !== 'GET') return res.status(405).json({ ok: false, message: 'Method tidak diizinkan.' });
      const q = req.query?.q || '';
      if (!q) return res.status(400).json({ ok: false, message: 'Parameter q diperlukan.' });
      try {
        const upstream = await fetch(`https://api.mangadex.org/manga?title=${encodeURIComponent(q)}&limit=20&originalLanguage[]=ko&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica&includes[]=cover_art`, {
          headers: { 'User-Agent': 'api-Saurus/2.0 (+https://api-Saurus.my.id)' },
          signal: AbortSignal.timeout(10000)
        });
        const json = await upstream.json();
        if (json.result === 'ok' && json.data) {
          json.status = true;
          json.data = await interceptAndEnrichMangaDataWithNativeCoverRetrieval(json.data, req);
        }
        return res.status(upstream.ok ? 200 : upstream.status).json(json);
      } catch (e) { return res.status(500).json({ ok: false, message: e.message }); }
    }

    if (parts[1] === 'manhwa-detail') {
      if (req.method !== 'GET') return res.status(405).json({ ok: false, message: 'Method tidak diizinkan.' });
      const id = req.query?.id || '';
      if (!id) return res.status(400).json({ ok: false, message: 'Parameter id diperlukan.' });
      try {
        const upstream = await fetch(`https://api.mangadex.org/manga/${encodeURIComponent(id)}?includes[]=cover_art&includes[]=author&includes[]=artist`, {
          headers: { 'User-Agent': 'api-Saurus/2.0 (+https://api.Saurus.my.id)' },
          signal: AbortSignal.timeout(10000)
        });
        const json = await upstream.json();
        if (json.result === 'ok' && json.data) {
          json.status = true;
          const enrichedArray = await interceptAndEnrichMangaDataWithNativeCoverRetrieval([json.data], req);
          json.data = enrichedArray[0];
        }
        return res.status(upstream.ok ? 200 : upstream.status).json(json);
      } catch (e) { return res.status(500).json({ ok: false, message: e.message }); }
    }

    if (parts[1] === 'manhwa-popular') {
      if (req.method !== 'GET') return res.status(405).json({ ok: false, message: 'Method tidak diizinkan.' });
      const genre = req.query?.genre || '';
      try {
        let url = `https://api.mangadex.org/manga?limit=18&originalLanguage[]=ko&contentRating[]=safe&contentRating[]=suggestive&order[followedCount]=desc&includes[]=cover_art`;
        if (genre) {
          const tagRes = await fetch(`https://api.mangadex.org/manga/tag`, {
            headers: { 'User-Agent': 'api-Saurus/2.0 (+https://api.Saurus.my.id)' },
            signal: AbortSignal.timeout(10000)
          });
          const tagJson = await tagRes.json();
          const tag = (tagJson.data || []).find(t => t.attributes?.name?.en === genre);
          if (tag) url += `&includedTags[]=${tag.id}`;
        }
        const upstream = await fetch(url, {
          headers: { 'User-Agent': 'api-Saurus/2.0 (+https://api.Saurus.my.id)' },
          signal: AbortSignal.timeout(10000)
        });
        const json = await upstream.json();
        if (json.result === 'ok' && json.data) {
          json.status = true;
          json.data = await interceptAndEnrichMangaDataWithNativeCoverRetrieval(json.data, req);
        }
        return res.status(upstream.ok ? 200 : upstream.status).json(json);
      } catch (e) { return res.status(500).json({ ok: false, message: e.message }); }
    }

    if (parts[1] === 'manhwa-chapters') {
      if (req.method !== 'GET') return res.status(405).json({ ok: false, message: 'Method tidak diizinkan.' });
      const id = req.query?.id || '';
      if (!id) return res.status(400).json({ ok: false, message: 'Parameter id diperlukan.' });
      try {
        const allChapters = [];
        const limit = 500;
        const firstR = await fetch(
          `https://api.mangadex.org/manga/${encodeURIComponent(id)}/feed?limit=${limit}&offset=0&translatedLanguage[]=en&order[chapter]=desc&includes[]=scanlation_group`,
          { headers: { 'User-Agent': 'api-Saurus/2.0 (+https://api.Saurus.my.id)' }, signal: AbortSignal.timeout(10000) }
        );
        const firstJ = await firstR.json();
        if (!firstR.ok || firstJ.result !== 'ok') throw new Error(firstJ.errors?.[0]?.detail || 'MangaDex error');
        const total = firstJ.total || 0;
        allChapters.push(...(firstJ.data || []));
        if (total > limit) {
          const batchCount = Math.ceil((total - limit) / limit);
          const batches = Array.from({ length: batchCount }, (_, i) => i + 1);
          const results = await Promise.all(batches.map(b =>
            fetch(
              `https://api.mangadex.org/manga/${encodeURIComponent(id)}/feed?limit=${limit}&offset=${b * limit}&translatedLanguage[]=en&order[chapter]=desc&includes[]=scanlation_group`,
              { headers: { 'User-Agent': 'api-Saurus/2.0 (+https://api.Saurus.my.id)' }, signal: AbortSignal.timeout(10000) }
            ).then(r => r.json()).catch(() => ({ data: [] }))
          ));
          for (const j of results) allChapters.push(...(j.data || []));
        }
        const chMap = new Map();
        for (const ch of allChapters) {
          const num = ch.attributes?.chapter ?? 'extra';
          const existing = chMap.get(num);
          if (!existing) {
            chMap.set(num, ch);
          } else {
            const newDate = new Date(ch.attributes?.publishAt || 0);
            const oldDate = new Date(existing.attributes?.publishAt || 0);
            if (newDate > oldDate) chMap.set(num, ch);
          }
        }
        const sorted = Array.from(chMap.values()).sort((a, b) => {
          const na = parseFloat(a.attributes?.chapter) || 0;
          const nb = parseFloat(b.attributes?.chapter) || 0;
          return nb - na;
        });
        return res.status(200).json({ result: 'ok', data: sorted, total: sorted.length });
      } catch (e) { return res.status(500).json({ ok: false, message: e.message }); }
    }

    if (parts[1] === 'manhwa-render') {
      if (req.method !== 'GET') return res.status(405).json({ ok: false, message: 'Method tidak diizinkan.' });
      const chapter_id = req.query?.chapter_id || '';
      if (!chapter_id) return res.status(400).json({ ok: false, message: 'Parameter chapter_id diperlukan.' });
      try {
        const ahRes = await fetch(`https://api.mangadex.org/at-home/server/${encodeURIComponent(chapter_id)}`, {
          headers: { 'User-Agent': 'api-Saurus/2.0 (+https://api.Saurus.my.id)' },
          signal: AbortSignal.timeout(10000)
        });
        const ahData = await ahRes.json();
        if (ahData.result !== 'ok') throw new Error(ahData.errors?.[0]?.detail || 'MangaDex error');
        const { baseUrl, chapter } = ahData;
        const pages = (chapter.data || []).map(f => `${baseUrl}/data/${chapter.hash}/${f}`);
        const pagesSaver = (chapter.dataSaver || []).map(f => `${baseUrl}/data-saver/${chapter.hash}/${f}`);
        return res.status(200).json({
          ok: true,
          status: true,
          chapter_id,
          pages,
          pagesSaver,
          baseUrl,
          hash: chapter.hash
        });
      } catch (e) { return res.status(500).json({ ok: false, message: e.message }); }
    }
    
    if (parts[1] === 'play') {
      if (req.method !== 'GET') return res.status(405).json({ ok: false, message: 'Method tidak diizinkan.' });
      
      const q = req.query?.q || '';
      if (!q) return res.status(400).json({ ok: false, message: 'Parameter q diperlukan.' });
      
      try {
        const searchUpstream = await fetch(`https://api.siputzx.my.id/api/s/soundcloud?query=${encodeURIComponent(q)}`, { 
          signal: AbortSignal.timeout(15000) 
        });
        const searchData = await searchUpstream.json();
        
        if (!searchData.status || !Array.isArray(searchData.data) || searchData.data.length === 0) {
          return res.status(404).json({ ok: false, message: 'Lagu tidak ditemukan dari kata kunci yang diberikan.' });
        }
        
        const targetUrl = searchData.data[0].permalink_url;
        const playCount = searchData.data[0].playback_count;
        const originalCreatedAt = searchData.data[0].created_at;
        
        const detailUpstream = await fetch(`https://api.siputzx.my.id/api/d/soundcloud?url=${encodeURIComponent(targetUrl)}`, { 
          signal: AbortSignal.timeout(15000) 
        });
        const detailData = await detailUpstream.json();
        
        if (!detailData.status || !detailData.data || !detailData.data.url) {
          return res.status(404).json({ ok: false, message: 'Gagal mengambil url stream audio untuk lagu ini.' });
        }
        
        return res.status(200).json({
          ok: true,
          creator: 'Saurus',
          data: {
            title: detailData.data.title,
            artist: detailData.data.user,
            thumbnail: detailData.data.thumbnail,
            url: detailData.data.url,
            duration_ms: detailData.data.duration,
            playback_count: playCount,
            published_at: originalCreatedAt,
            source_url: targetUrl
          }
        });
        
      } catch (e) {
        return res.status(500).json({ ok: false, message: e.message });
      }
    }

    if (parts[1] === 'health') {
      return res.status(200).json({
        ok: true,
        message: 'alive',
        data: {
          uptime: process.uptime(),
          time: new Date().toISOString(),
          platform: process.platform,
          arch: process.arch,
          memoryUsage: process.memoryUsage().rss,
          firebase: firebaseReady,
          nodeVersion: process.version,
          totalApis: plugins.length,
          environment: process.env.VERCEL ? 'vercel-serverless' : 'local-node',
        },
      });
    }
    
        if (parts[1] === 'dramabox-search') {
      if (req.method !== 'GET') return res.status(405).json({ ok: false, message: 'Method tidak diizinkan.' });
      const q = req.query?.q || '';
      if (!q) return res.status(400).json({ ok: false, message: 'Parameter q diperlukan.' });
      try {
        const upstream = await fetch(`https://api-nanas.my.id/api/nonton/dramabox/search.php?q=${encodeURIComponent(q)}`, { signal: AbortSignal.timeout(15000) });
        const data = await upstream.json();
        return res.status(upstream.ok ? 200 : upstream.status).json(data);
      } catch (e) {
        return res.status(500).json({ ok: false, message: e.message });
      }
    }

    if (parts[1] === 'dramabox-detail') {
      if (req.method !== 'GET') return res.status(405).json({ ok: false, message: 'Method tidak diizinkan.' });
      const id = req.query?.id || '';
      const slug = req.query?.slug || '';
      if (!id || !slug) return res.status(400).json({ ok: false, message: 'Parameter id dan slug diperlukan.' });
      try {
        const upstream = await fetch(`https://api-nanas.my.id/api/nonton/dramabox/detail.php?id=${encodeURIComponent(id)}&slug=${encodeURIComponent(slug)}`, { signal: AbortSignal.timeout(15000) });
        const data = await upstream.json();
        return res.status(upstream.ok ? 200 : upstream.status).json(data);
      } catch (e) {
        return res.status(500).json({ ok: false, message: e.message });
      }
    }

    if (parts[1] === 'dramabox-download') {
      if (req.method !== 'GET') return res.status(405).json({ ok: false, message: 'Method tidak diizinkan.' });
      const id = req.query?.id || '';
      const slug = req.query?.slug || '';
      if (!id || !slug) return res.status(400).json({ ok: false, message: 'Parameter id dan slug diperlukan.' });
      try {
        const upstream = await fetch(`https://api-nanas.my.id/api/nonton/dramabox/download.php?id=${encodeURIComponent(id)}&slug=${encodeURIComponent(slug)}`, { signal: AbortSignal.timeout(15000) });
        const data = await upstream.json();
        return res.status(upstream.ok ? 200 : upstream.status).json(data);
      } catch (e) {
        return res.status(500).json({ ok: false, message: e.message });
      }
    }
    
        if (parts[1] === 'spotify-search') {
      if (req.method !== 'GET') return res.status(405).json({ ok: false, message: 'Method tidak diizinkan.' });
      const q = req.query?.q || '';
      if (!q) return res.status(400).json({ ok: false, message: 'Parameter q diperlukan.' });
      try {
        const upstream = await fetch(`https://api.nexray.eu.cc/search/spotify?q=${encodeURIComponent(q)}`, { signal: AbortSignal.timeout(15000) });
        const data = await upstream.json();
        return res.status(upstream.ok ? 200 : upstream.status).json(data);
      } catch (e) {
        return res.status(500).json({ ok: false, message: e.message });
      }
    }

    if (parts[1] === 'spotify-play') {
      if (req.method !== 'GET') return res.status(405).json({ ok: false, message: 'Method tidak diizinkan.' });
      const q = req.query?.q || '';
      if (!q) return res.status(400).json({ ok: false, message: 'Parameter q diperlukan.' });
      try {
        const upstream = await fetch(`https://api.nexray.eu.cc/downloader/spotifyplay?q=${encodeURIComponent(q)}`, { signal: AbortSignal.timeout(15000) });
        const data = await upstream.json();
        return res.status(upstream.ok ? 200 : upstream.status).json(data);
      } catch (e) {
        return res.status(500).json({ ok: false, message: e.message });
      }
    }
    
    
    if (parts[1] === 'lyric') {
      if (req.method !== 'GET') return res.status(405).json({ ok: false, message: 'Method tidak diizinkan.' });
      
      const q = req.query?.q || '';
      if (!q) return res.status(400).json({ ok: false, message: 'Parameter q diperlukan.' });
      
      try {
        const searchUpstream = await fetch(`https://api.neoxr.eu/api/lyric?q=${encodeURIComponent(q)}&apikey=yMb35i`, { 
          signal: AbortSignal.timeout(15000) 
        });
        const searchData = await searchUpstream.json();
        
        if (!searchData.status || !Array.isArray(searchData.data) || searchData.data.length === 0) {
          return res.status(404).json({ ok: false, message: 'Lirik tidak ditemukan untuk lagu ini.' });
        }
        
        const detailUrl = searchData.data[0].url;
        const detailUpstream = await fetch(`https://api.neoxr.eu/api/lyric?q=${encodeURIComponent(detailUrl)}&apikey=yMb35i`, { 
          signal: AbortSignal.timeout(15000) 
        });
        const detailData = await detailUpstream.json();
        
        if (!detailData.status || !detailData.data) {
          return res.status(404).json({ ok: false, message: 'Gagal mengambil detail teks lirik.' });
        }
        
        return res.status(200).json({
          ok: true,
          creator: 'Saurus',
          data: detailData.data
        });
        
      } catch (e) {
        return res.status(500).json({ ok: false, message: e.message });
      }
    }

    if (parts[1] === 'key-info') {
      if (!firebaseReady || !db) return res.status(503).json({ ok: false, message: 'DB belum siap.' });
      const apikey = req.query?.apikey || req.body?.apikey;
      if (!apikey) return res.status(401).json({ ok: false, message: 'apikey diperlukan.' });
      if (apikey === 'Saurus') {
        return res.status(200).json({ ok: true, data: {
          type: 'free', plan: 'FREE TRIAL', totalRequests: '-', ipLog: [],
          recentLogs: [], dailyUsage: [], lastUsedAt: null
        }});
      }
      try {
        const snap = await db.collection('users').where('apiKey', '==', apikey).limit(1).get();
        if (snap.empty) return res.status(403).json({ ok: false, message: 'API Key tidak valid.' });
        const userDoc = snap.docs[0];
        const data = userDoc.data();
        const userRef = userDoc.ref;

        // dailyUsage: coba orderBy dulu, fallback ke tanpa orderBy kalau index belum ada
        let dailyUsage = [];
        try {
          const dailySnap = await userRef.collection('dailyUsage').orderBy('date','desc').limit(10).get();
          dailyUsage = dailySnap.docs.map(d => ({ date: d.id, ...d.data(), ips: undefined }));
        } catch {
          try {
            const dailySnap2 = await userRef.collection('dailyUsage').limit(10).get();
            dailyUsage = dailySnap2.docs.map(d => ({ date: d.id, ...d.data(), ips: undefined }))
              .sort((a,b) => (b.date||'').localeCompare(a.date||''));
          } catch {}
        }

        // requestLogs: coba orderBy ts, fallback tanpa orderBy
        let recentLogs = [];
        try {
          const logSnap = await userRef.collection('requestLogs').orderBy('ts','desc').limit(20).get();
          recentLogs = logSnap.docs.map(d => d.data());
        } catch {
          try {
            const logSnap2 = await userRef.collection('requestLogs').limit(20).get();
            recentLogs = logSnap2.docs.map(d => d.data())
              .sort((a,b) => (b.ts||'').localeCompare(a.ts||''));
          } catch {}
        }

        return res.status(200).json({ ok: true, data: {
          type: 'user',
          plan: data.plan || 'FREE',
          totalRequests: data.totalRequests || 0,
          lastUsedAt: data.lastUsedAt || null,
          ipLog: data.ipLog || [],
          recentLogs,
          dailyUsage,
          name: data.name || null,
          email: data.email || null,
          createdAt: data.createdAt || null,
        }});
      } catch(e) { return res.status(500).json({ ok: false, message: e.message }); }
    }

    if (parts[1] === 'update-profile' && req.method === 'POST') {
      if (!firebaseReady || !db) return res.status(503).json({ ok: false, message: 'DB belum siap.' });
      const { apikey, name, photoURL } = req.body || {};
      if (!apikey) return res.status(401).json({ ok: false, message: 'apikey diperlukan.' });
      try {
        const snap = await db.collection('users').where('apiKey', '==', apikey).limit(1).get();
        if (snap.empty) return res.status(403).json({ ok: false, message: 'API Key tidak valid.' });
        const ref = snap.docs[0].ref;
        const updateData = {};
        if (name !== undefined) updateData.name = String(name).slice(0, 80);
        if (photoURL !== undefined) updateData.photoURL = String(photoURL).slice(0, 500);
        if (!Object.keys(updateData).length) return res.status(400).json({ ok: false, message: 'Tidak ada data yang diperbarui.' });
        await ref.update(updateData);
        return res.status(200).json({ ok: true, message: 'Profil diperbarui.', data: updateData });
      } catch(e) { return res.status(500).json({ ok: false, message: e.message }); }
    }

    if (parts[1] === 'revoke-ip' && req.method === 'POST') {
      if (!firebaseReady || !db) return res.status(503).json({ ok: false, message: 'DB belum siap.' });
      const { apikey, ip } = req.body || {};
      if (!apikey || !ip) return res.status(400).json({ ok: false, message: 'apikey dan ip diperlukan.' });
      try {
        const snap = await db.collection('users').where('apiKey', '==', apikey).limit(1).get();
        if (snap.empty) return res.status(403).json({ ok: false, message: 'API Key tidak valid.' });
        const ref = snap.docs[0].ref;
        const data = snap.docs[0].data();
        const ipLog = (data.ipLog || []).filter(e => e.ip !== ip);
        await ref.update({ ipLog });
        return res.status(200).json({ ok: true, message: `IP ${ip} dihapus dari log.` });
      } catch(e) { return res.status(500).json({ ok: false, message: e.message }); }
    }

    if (parts[1] === 'clear-logs' && req.method === 'POST') {
      if (!firebaseReady || !db) return res.status(503).json({ ok: false, message: 'DB belum siap.' });
      const { apikey } = req.body || {};
      if (!apikey) return res.status(400).json({ ok: false, message: 'apikey diperlukan.' });
      try {
        const snap = await db.collection('users').where('apiKey', '==', apikey).limit(1).get();
        if (snap.empty) return res.status(403).json({ ok: false, message: 'API Key tidak valid.' });
        const ref = snap.docs[0].ref;
        const logs = await ref.collection('requestLogs').limit(500).get();
        const batch = db.batch();
        logs.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();
        await ref.update({ ipLog: [] });
        return res.status(200).json({ ok: true, message: 'Log dibersihkan.' });
      } catch(e) { return res.status(500).json({ ok: false, message: e.message }); }
    }

    if (parts[1] === 'snippet') {
      if (!firebaseReady || !db) {
        return res.status(503).json({ ok: false, message: 'Database belum siap.' });
      }
      const snippetsCol = db.collection('snippets');

      if (req.method === 'GET' && !parts[2]) {
        try {
          const snap = await snippetsCol.where('visibility', '==', 'public').limit(200).get();
          let snippets = snap.docs.map(d => ({ id: d.id, ...d.data(), password: undefined }));
          snippets.sort((a, b) => {
              const d1 = new Date(a.createdAt || 0).getTime();
              const d2 = new Date(b.createdAt || 0).getTime();
              return d2 - d1;
          });
          return res.status(200).json({ ok: true, data: snippets });
        } catch (e) { return res.status(500).json({ ok: false, message: e.message }); }
      }

      if (req.method === 'POST' && !parts[2]) {
        const { name, language, visibility, code, password, author, authorPhoto, authorUid } = req.body || {};
        if (!name || !code) return res.status(400).json({ ok: false, message: 'name dan code wajib diisi.' });
        const extMap = { javascript:'.js', typescript:'.ts', python:'.py', php:'.php', 'shell/curl':'.sh', html:'.html', css:'.css', json:'.json' };
        const ext = extMap[(language||'').toLowerCase()] || '.txt';
        const filename = name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9\-]/g,'') + ext;
        try {
          const doc = await snippetsCol.add({
            name, language: language || 'JavaScript',
            visibility: visibility || 'public',
            code,
            filename,
            author: author || 'Anonim',
            authorPhoto: authorPhoto || 'https://files.catbox.moe/9y8310.jpg',
            authorUid: authorUid || null,
            password: visibility === 'private' ? (password || null) : null,
            createdAt: new Date().toISOString(),
          });
          return res.status(200).json({ ok: true, id: doc.id, message: 'Snippet disimpan.' });
        } catch (e) { return res.status(500).json({ ok: false, message: e.message }); }
      }

      if (req.method === 'GET' && parts[2]) {
        try {
          const doc = await snippetsCol.doc(parts[2]).get();
          if (!doc.exists) return res.status(404).json({ ok: false, message: 'Snippet tidak ditemukan.' });
          const data = doc.data();
          if (data.visibility === 'private') {
            const pw = req.query?.password || req.body?.password;
            if (pw !== data.password) return res.status(403).json({ ok: false, message: 'Sandi salah atau akses ditolak.' });
          }
          return res.status(200).json({ ok: true, data: { id: doc.id, ...data, password: undefined } });
        } catch (e) { return res.status(500).json({ ok: false, message: e.message }); }
      }

      if (req.method === 'DELETE' && parts[2]) {
        const pw = req.query?.password || req.body?.password;
        try {
          const doc = await snippetsCol.doc(parts[2]).get();
          if (!doc.exists) return res.status(404).json({ ok: false, message: 'Tidak ditemukan.' });
          const data = doc.data();
          if (data.visibility === 'private' && data.password && pw !== data.password) return res.status(403).json({ ok: false, message: 'Sandi salah atau akses ditolak.' });
          await snippetsCol.doc(parts[2]).delete();
          return res.status(200).json({ ok: true, message: 'Snippet dihapus.' });
        } catch (e) { return res.status(500).json({ ok: false, message: e.message }); }
      }

      return res.status(405).json({ ok: false, message: 'Method tidak diizinkan.' });
    }

    if (parts[1] === 'docs') {
      if (_cachedDocsPayload) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=30');
        return res.status(200).json(_cachedDocsPayload);
      }
      const categories = {};
      plugins.forEach((p) => {
        if (!categories[p.category]) categories[p.category] = [];
        categories[p.category].push({
          id: p.id,
          name: p.name,
          method: p.method,
          path: p.path,
          description: p.description,
          params: (p.params || []).map(param => ({
            name: param.name,
            required: param.required,
            example: param.example,
            isImage: !!param.isImage,
            isVideo: !!param.isVideo,
            isAudio: !!param.isAudio,
            isDoc: !!param.isDoc,
            isMedia: !!param.isMedia
          })),
        });
      });
      _cachedDocsPayload = { ok: true, creator: 'Saurus', data: { categories } };
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=30');
      return res.status(200).json(_cachedDocsPayload);
    }

    // ─── /api/ai-agent ─────────────────────────────────────────────────────────
    // Endpoint khusus untuk AI agents (Claude, GPT, Gemini, dll) yang bisa
    // baca docs + langsung test/jalankan endpoint secara otomatis.
    // Format: plain text (AI lebih mudah baca daripada JSON nested)
    // Usage: GET /api/ai-agent?apikey=YOURKEY
    //        GET /api/ai-agent?apikey=YOURKEY&run=/api/ai/chat&q=hello
    //        GET /api/ai-agent?apikey=YOURKEY&run=/api/ai/chat&method=POST&body={"q":"hello"}
    if (parts[1] === 'ai-agent') {
      const apikey = req.query?.apikey || 'Saurus';
      const runPath = req.query?.run || null;
      const baseUrl = `https://${req.headers.host || 'api.Saurus.my.id'}`;

      // Jika ada parameter ?run= → eksekusi endpoint dan return hasilnya
      if (runPath) {
        try {
          const method = (req.query.method || 'GET').toUpperCase();
          let targetUrl = `${baseUrl}${runPath}`;
          let fetchOpts = { method, signal: AbortSignal.timeout(15000), headers: { 'Content-Type': 'application/json' } };

          if (method === 'GET') {
            const qp = new URLSearchParams({ apikey, ...Object.fromEntries(
              Object.entries(req.query).filter(([k]) => !['apikey','run','method','body'].includes(k))
            )});
            targetUrl += '?' + qp.toString();
          } else {
            let bodyObj = {};
            try { bodyObj = JSON.parse(req.query.body || '{}'); } catch {}
            fetchOpts.body = JSON.stringify({ apikey, ...bodyObj });
          }

          const upstream = await fetch(targetUrl, fetchOpts);
          const result = await upstream.json();
          const statusText = upstream.ok ? 'SUCCESS' : 'FAILED';

          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          return res.status(200).send([
            `=== Saurus API AGENT: EXECUTION RESULT ===`,
            `Endpoint : ${runPath}`,
            `Method   : ${method}`,
            `Status   : ${upstream.status} ${statusText}`,
            ``,
            `--- RESPONSE JSON ---`,
            JSON.stringify(result, null, 2),
            ``,
            `--- VERDICT ---`,
            result.ok === true || upstream.ok ? '✅ ENDPOINT BERFUNGSI NORMAL' : '❌ ENDPOINT RETURN ERROR',
            result.message ? `Message: ${result.message}` : '',
          ].filter(l => l !== undefined).join('\n'));
        } catch (e) {
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          return res.status(200).send([
            `=== Saurus API AGENT: EXECUTION RESULT ===`,
            `Endpoint : ${runPath}`,
            `Status   : ERROR`,
            ``,
            `❌ GAGAL EKSEKUSI: ${e.message}`,
          ].join('\n'));
        }
      }

      // Tanpa ?run= → kembalikan docs dalam format teks yang mudah dibaca AI
      const lines = [
        `=== Saurus API - AI AGENT DOCUMENTATION ===`,
        `Base URL : ${baseUrl}`,
        `API Key  : ${apikey}`,
        ``,
        `CARA PAKAI ENDPOINT INI:`,
        `• Baca docs: GET ${baseUrl}/api/ai-agent?apikey=${apikey}`,
        `• Test endpoint (GET): GET ${baseUrl}/api/ai-agent?apikey=${apikey}&run=/api/PATH&param1=value1`,
        `• Test endpoint (POST): GET ${baseUrl}/api/ai-agent?apikey=${apikey}&run=/api/PATH&method=POST&body={"param":"value"}`,
        ``,
        `SEMUA ENDPOINT TERSEDIA:`,
        `${'─'.repeat(60)}`,
      ];

      let idx = 1;
      plugins.forEach(p => {
        lines.push(`[${idx++}] ${p.name.toUpperCase()}`);
        lines.push(`    Path     : ${p.path}`);
        lines.push(`    Method   : ${p.method || 'GET'}`);
        lines.push(`    Category : ${p.category}`);
        if (p.description) lines.push(`    Desc     : ${p.description}`);
        if (p.params && p.params.length) {
          const paramStr = p.params.map(pr =>
            `${pr.name}${pr.required ? '*' : ''}=${pr.example || '...'}`
          ).join(', ');
          lines.push(`    Params   : ${paramStr}  (* = wajib)`);
        }

        // Contoh langsung siap pakai
        const exampleParams = (p.params || []).reduce((acc, pr) => {
          if (pr.example) acc[pr.name] = pr.example;
          return acc;
        }, {});
        if (p.method === 'GET' || !p.method) {
          const qp = new URLSearchParams({ apikey, ...exampleParams });
          lines.push(`    Example  : GET ${baseUrl}/api/ai-agent?apikey=${apikey}&run=${p.path}&${new URLSearchParams(exampleParams).toString()}`);
        } else {
          lines.push(`    Example  : GET ${baseUrl}/api/ai-agent?apikey=${apikey}&run=${p.path}&method=POST&body=${encodeURIComponent(JSON.stringify({ ...exampleParams }))}`);
        }
        lines.push('');
      });

      lines.push(`${'─'.repeat(60)}`);
      lines.push(`Total endpoint: ${plugins.length}`);
      lines.push(`Untuk test endpoint, gunakan parameter ?run= seperti contoh di atas.`);

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=60');
      return res.status(200).send(lines.join('\n'));
    }
    // ─── END /api/ai-agent ─────────────────────────────────────────────────────

if (parts[1] === 'tourl' && parts[2] === 'upload' && req.method === 'POST') {
  if (!uploadMiddleware) {
    return res.status(503).json({ ok: false, message: 'Modul unggahan tidak tersedia pada konfigurasi sistem.' });
  }

  const TOURL_IMGBB_KEY = process.env.IMGBB_KEY || '557e46ee9f36d779fed49ed25b5b3dd0';
  const TOURL_IMGBB_ENDPOINT = 'https://api.imgbb.com/1/upload';
  const TOURL_CATBOX_ENDPOINT = 'https://catbox.moe/user/api.php';
  const TOURL_LITTERBOX_ENDPOINT = 'https://litterbox.catbox.moe/resources/internals/api.php';

  async function _tourlImgbb(buffer, filename, mime) {
    if (!/^image\//i.test(mime)) throw new Error('imgbb hanya support image');
    const form = new FormDataModule();
    form.append('key', TOURL_IMGBB_KEY);
    form.append('name', filename.replace(/\.[^.]+$/, ''));
    form.append('image', buffer.toString('base64'));
    const r = await axiosModuleInstance.post(TOURL_IMGBB_ENDPOINT, form, {
      headers: { ...form.getHeaders(), 'User-Agent': 'SaurusAPI/2.0' },
      timeout: 30000, maxContentLength: Infinity, maxBodyLength: Infinity, validateStatus: () => true
    });
    const url = r.data?.data?.url || r.data?.data?.display_url || '';
    if (!url) throw new Error(r.data?.error?.message || `imgbb status ${r.status}`);
    return { url, source: 'imgbb' };
  }

  async function _tourlCatbox(buffer, filename, mime) {
    const form = new FormDataModule();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', buffer, { filename, contentType: mime, knownLength: buffer.length });
    const headers = { ...form.getHeaders(), 'User-Agent': 'SaurusAPI/2.0' };
    const r = await axiosModuleInstance.post(TOURL_CATBOX_ENDPOINT, form, {
      headers, timeout: 60000, maxContentLength: Infinity, maxBodyLength: Infinity, validateStatus: () => true
    });
    const text = typeof r.data === 'string' ? r.data.trim() : String(r.data || '').trim();
    if (!/^https?:\/\//i.test(text)) throw new Error('Catbox: ' + text.slice(0, 200));
    return { url: text, source: 'catbox' };
  }

  async function _tourlLitterbox(buffer, filename, mime) {
    const form = new FormDataModule();
    form.append('reqtype', 'fileupload');
    form.append('time', '72h');
    form.append('fileToUpload', buffer, { filename, contentType: mime, knownLength: buffer.length });
    const headers = { ...form.getHeaders(), 'User-Agent': 'SaurusAPI/2.0' };
    const r = await axiosModuleInstance.post(TOURL_LITTERBOX_ENDPOINT, form, {
      headers, timeout: 60000, maxContentLength: Infinity, maxBodyLength: Infinity, validateStatus: () => true
    });
    const text = typeof r.data === 'string' ? r.data.trim() : String(r.data || '').trim();
    if (!/^https?:\/\//i.test(text)) throw new Error('Litterbox: ' + text.slice(0, 200));
    return { url: text, source: 'litterbox' };
  }

  return new Promise((resolve) => {
    uploadMiddleware.single('file')(req, res, async (err) => {
      if (err) {
        resolve(res.status(400).json({ ok: false, message: 'Kegagalan modul unggahan: ' + err.message }));
        return;
      }

      const fileBufferData = req.file?.buffer;
      const mimeTypeString = req.file?.mimetype || 'application/octet-stream';
      const originalFilenameString = req.file?.originalname || 'upload';

      if (!fileBufferData) {
        resolve(res.status(400).json({ ok: false, message: 'Berkas tidak ditemukan dalam struktur muatan permintaan.' }));
        return;
      }

      const providerParam = String(req.body?.provider || req.query?.provider || '').toLowerCase().trim();
      const isImageFile = /^image\//i.test(mimeTypeString);
      const fileExtString = path.extname(originalFilenameString).toLowerCase() || _mimeToExt(mimeTypeString) || _detectExtFromBuffer(fileBufferData) || '.bin';
      const generatedFilename = `Saurus${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}${fileExtString}`;

      try {
        let result;
        const preferImgbb = providerParam === 'imgbb' || (providerParam !== 'catbox' && isImageFile);

        if (preferImgbb && isImageFile) {
          try {
            result = await _tourlImgbb(fileBufferData, generatedFilename, mimeTypeString);
          } catch (e1) {
            try {
              result = await _tourlCatbox(fileBufferData, generatedFilename, mimeTypeString);
            } catch (e2) {
              result = await _tourlLitterbox(fileBufferData, generatedFilename, mimeTypeString);
            }
          }
        } else {
          try {
            result = await _tourlCatbox(fileBufferData, generatedFilename, mimeTypeString);
          } catch (e1) {
            if (isImageFile) {
              try {
                result = await _tourlImgbb(fileBufferData, generatedFilename, mimeTypeString);
              } catch (e2) {
                result = await _tourlLitterbox(fileBufferData, generatedFilename, mimeTypeString);
              }
            } else {
              result = await _tourlLitterbox(fileBufferData, generatedFilename, mimeTypeString);
            }
          }
        }

        return resolve(res.status(200).json({
          ok: true,
          creator: 'Saurus',
          data: {
            url: result.url,
            filename: result.url.split('/').pop() || generatedFilename,
            size_bytes: fileBufferData.length,
            mime_type: mimeTypeString,
            provider: result.source
          }
        }));
      } catch (executionError) {
        resolve(res.status(500).json({ ok: false, message: 'Upload gagal semua provider: ' + executionError.message }));
      }
    });
  });
}

if (pathname === '/api/tools/encrypt' && req.method === 'POST') {
      if (!uploadMiddleware) {
        return res.status(503).json({ ok: false, message: 'Upload middleware tidak tersedia.' });
      }
      return new Promise((resolve) => {
        uploadMiddleware.single('file')(req, res, async (err) => {
          if (err) return resolve(res.status(400).json({ ok: false, message: 'Upload error: ' + err.message }));
          const encPlugin = plugins.find(p => p.path === '/api/tools/encrypt');
          if (!encPlugin) return resolve(res.status(404).json({ ok: false, message: 'Encrypt plugin tidak ditemukan.' }));
          const keyCheck = await validateApiKey(req);
          if (!keyCheck.ok) return resolve(res.status(keyCheck.status || 401).json({ ok: false, message: keyCheck.message }));
          try {
            const result = await encPlugin.handler(req, getInput, res);
            if (result === null || result?.__handled === true) return resolve();
            resolve(res.status(result?.ok === false ? 400 : 200).json(result));
          } catch (e) {
            resolve(res.status(500).json({ ok: false, message: e.message }));
          }
        });
      });
    }

    const matchedPlugin = plugins.find((p) => p.path === pathname);

    if (parts[1] === 'fb') {
      if (!firebaseReady || !db) return res.status(503).json({ ok: false, message: 'DB tidak tersedia.' });
      const action = parts[2];
      const admin = require('firebase-admin');

      async function verifyToken(expectedUid = null, fallbackUid = null) {
        const authHeader = req.headers['authorization'] || '';
        const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
        if (idToken) {
          try {
            const decoded = await admin.auth().verifyIdToken(idToken);
            if (expectedUid && decoded.uid !== expectedUid) {
              return { ok: false, status: 403, message: 'Akses ditolak. UID tidak cocok.' };
            }
            return { ok: true, uid: decoded.uid, guest: false };
          } catch (e) {
            return { ok: false, status: 401, message: 'Token tidak valid atau sudah expired.' };
          }
        }
        if (fallbackUid) {
          if (expectedUid && fallbackUid !== expectedUid) {
            return { ok: false, status: 403, message: 'Akses ditolak. UID tidak cocok.' };
          }
          return { ok: true, uid: fallbackUid, guest: true };
        }
        return { ok: false, status: 401, message: 'Token autentikasi diperlukan.' };
      }

      if (action === 'comments' && req.method === 'GET') {
        const { collection: col, slug } = req.query;
        if (!col || !slug) return res.status(400).json({ ok: false, message: 'collection & slug wajib.' });
        try {
          const snap = await db.collection(col).doc(slug).collection('chats')
            .orderBy('ts', 'desc').limit(100).get();
          const docs = snap.docs.map(d => ({ id: d.id, ...d.data(), ts: d.data().ts?.toMillis?.() || null }));
          return res.json({ ok: true, data: docs });
        } catch (e) { return res.status(500).json({ ok: false, message: e.message }); }
      }

      if (action === 'comment' && req.method === 'POST') {
        const { collection: col, slug, name, photo, text, parentId, replyToName } = req.body || {};
        if (!col || !slug || !text) return res.status(400).json({ ok: false, message: 'Parameter tidak lengkap.' });
        const auth = await verifyToken(null, req.body?.uid || null);
        if (!auth.ok) return res.status(auth.status).json({ ok: false, message: auth.message });
        try {
          const payload = { uid: auth.uid, name: name || 'Anonim', photo: photo || '', text,
            likes: [], ts: admin.firestore.FieldValue.serverTimestamp() };
          if (parentId) { payload.parentId = parentId; payload.replyToName = replyToName || ''; }
          const ref = await db.collection(col).doc(slug).collection('chats').add(payload);
          return res.json({ ok: true, id: ref.id });
        } catch (e) { return res.status(500).json({ ok: false, message: e.message }); }
      }

      if (action === 'like' && req.method === 'POST') {
        const { collection: col, slug, cid, remove } = req.body || {};
        if (!col || !slug || !cid) return res.status(400).json({ ok: false, message: 'Parameter tidak lengkap.' });
        const auth = await verifyToken(null, req.body?.uid || null);
        if (!auth.ok) return res.status(auth.status).json({ ok: false, message: auth.message });
        try {
          const ref = db.collection(col).doc(slug).collection('chats').doc(cid);
          if (remove) {
            await ref.update({ likes: admin.firestore.FieldValue.arrayRemove(auth.uid) });
          } else {
            await ref.update({ likes: admin.firestore.FieldValue.arrayUnion(auth.uid) });
          }
          return res.json({ ok: true });
        } catch (e) { return res.status(500).json({ ok: false, message: e.message }); }
      }

      if (action === 'delete-comment' && req.method === 'POST') {
        const { collection: col, slug, cid } = req.body || {};
        if (!col || !slug || !cid) return res.status(400).json({ ok: false, message: 'Parameter tidak lengkap.' });
        const auth = await verifyToken(null, req.body?.uid || null);
        if (!auth.ok) return res.status(auth.status).json({ ok: false, message: auth.message });
        try {
          const commentRef = db.collection(col).doc(slug).collection('chats').doc(cid);
          const commentDoc = await commentRef.get();
          if (!commentDoc.exists) return res.status(404).json({ ok: false, message: 'Komentar tidak ditemukan.' });
          if (commentDoc.data().uid !== auth.uid) return res.status(403).json({ ok: false, message: 'Tidak bisa hapus komentar orang lain.' });
          await commentRef.delete();
          return res.json({ ok: true });
        } catch (e) { return res.status(500).json({ ok: false, message: e.message }); }
      }

      if (action === 'notif' && req.method === 'GET') {
        const { uid } = req.query;
        if (!uid) return res.status(400).json({ ok: false, message: 'uid wajib.' });
        const authCheck = await verifyToken(uid, uid);
        if (!authCheck.ok) return res.status(authCheck.status).json({ ok: false, message: authCheck.message });
        try {
          const snap = await db.collection('notifications').doc(uid).collection('items')
            .orderBy('ts', 'desc').limit(20).get();
          const docs = snap.docs.map(d => ({ id: d.id, ...d.data(), ts: d.data().ts?.toMillis?.() || null }));
          return res.json({ ok: true, data: docs });
        } catch (e) { return res.status(500).json({ ok: false, message: e.message }); }
      }

      if (action === 'push-notif' && req.method === 'POST') {
        const { targetUid, msg, type } = req.body || {};
        if (!targetUid || !msg) return res.status(400).json({ ok: false, message: 'targetUid & msg wajib.' });
        const authCheck = await verifyToken(null, req.body?.uid || null);
        if (!authCheck.ok) return res.status(authCheck.status).json({ ok: false, message: authCheck.message });
        try {
          await db.collection('notifications').doc(targetUid).collection('items').add({
            msg, type: type || 'info', read: false, ts: admin.firestore.FieldValue.serverTimestamp()
          });
          return res.json({ ok: true });
        } catch (e) { return res.status(500).json({ ok: false, message: e.message }); }
      }

      if (action === 'user-profile' && req.method === 'GET') {
        const { uid } = req.query;
        if (!uid) return res.status(400).json({ ok: false, message: 'uid wajib.' });
        const authCheck = await verifyToken(uid, uid);
        if (!authCheck.ok) return res.status(authCheck.status).json({ ok: false, message: authCheck.message });
        try {
          const doc = await db.collection('users').doc(uid).get();
          if (!doc.exists) return res.json({ ok: true, data: null });
          const d = doc.data();
          return res.json({ ok: true, data: { apiKey: d.apiKey, plan: d.plan || 'FREE', name: d.name, photoURL: d.photoURL, totalRequests: d.totalRequests || 0 } });
        } catch (e) { return res.status(500).json({ ok: false, message: e.message }); }
      }

      if (action === 'user-upsert' && req.method === 'POST') {
        const { uid, email, name, apiKey, totalRequests } = req.body || {};
        if (!uid) return res.status(400).json({ ok: false, message: 'uid wajib.' });
        const authCheck = await verifyToken(uid, uid);
        if (!authCheck.ok) return res.status(authCheck.status).json({ ok: false, message: authCheck.message });
        try {
          const payload = {};
          if (email !== undefined) payload.email = email;
          if (name !== undefined) payload.name = name;
          if (apiKey !== undefined) payload.apiKey = apiKey;
          if (totalRequests !== undefined) payload.totalRequests = totalRequests;
          payload.updatedAt = admin.firestore.FieldValue.serverTimestamp();
          await db.collection('users').doc(uid).set(payload, { merge: true });
          return res.json({ ok: true });
        } catch (e) { return res.status(500).json({ ok: false, message: e.message }); }
      }

      // ─── Firebase Client Config (aman di-expose, ini public key) ──────────
      if (action === 'client-config' && req.method === 'GET') {
        return res.json({
          ok: true,
          data: {
            apiKey: process.env.FIREBASE_API_KEY || '',
            authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
            projectId: process.env.FIREBASE_PROJECT_ID_CLIENT || FIREBASE_PROJECT_ID,
          }
        });
      }

      // ─── OTP: Kirim kode verifikasi ke email ───────────────────────────────
      if (action === 'send-otp' && req.method === 'POST') {
        const { email, uid } = req.body || {};
        if (!email || !uid) return res.status(400).json({ ok: false, message: 'email & uid wajib.' });
        try {
          const otp = Math.floor(100000 + Math.random() * 900000).toString();
          const expireAt = Date.now() + 5 * 60 * 1000; // 5 menit
          await db.collection('otpStore').doc(uid).set({ otp, email, expireAt, used: false });

          const nodemailer = require('nodemailer');
          const _cfg = require('../config');
          const smtpUser = process.env.SMTP_USER || _cfg.smtp?.user || '';
          const smtpPass = process.env.SMTP_PASS || _cfg.smtp?.pass || '';
          if (!smtpUser || !smtpPass) {
            return res.json({ ok: true, dev_otp: otp, message: 'SMTP belum dikonfigurasi.' });
          }
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: smtpUser, pass: smtpPass }
          });
          // OTP sebagai satu string utuh — bisa di-select & copy normal
          const htmlBody = '<!DOCTYPE html>' +
'<html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Kode OTP Saurus API</title></head>' +
'<body style="margin:0;padding:0;background:#0a0a0a;">' +
'<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 16px;">' +
'<tr><td align="center">' +
'<table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#111111;border-radius:16px;overflow:hidden;border:1px solid #2a2a2a;font-family:Arial,Helvetica,sans-serif;">' +

'' +
'<tr><td style="padding:32px 32px 28px;border-bottom:1px solid #1f1f1f;">' +
'<div style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:4px;color:#52525b;margin-bottom:10px;">Saurus API</div>' +
'<div style="font-size:22px;font-weight:900;letter-spacing:2px;color:#f4f4f5;">VERIFIKASI LOGIN</div>' +
'</td></tr>' +

'' +
'<tr><td style="padding:28px 32px;">' +
'<p style="color:#71717a;font-size:13px;margin:0 0 24px;line-height:1.8;">Ada permintaan login ke akun <span style="color:#f4f4f5;font-weight:700;">Saurus API</span> kamu. Gunakan kode di bawah untuk melanjutkan. Berlaku <span style="color:#f4f4f5;font-weight:700;">5 menit</span>.</p>' +

'' +
'<div style="background:#0a0a0a;border:1px solid #2a2a2a;border-radius:12px;padding:24px;text-align:center;margin-bottom:20px;">' +
'<div style="font-size:10px;letter-spacing:4px;color:#52525b;font-weight:700;margin-bottom:14px;">KODE OTP KAMU</div>' +
'<div style="font-family:Courier New,Courier,monospace;font-size:40px;font-weight:900;letter-spacing:12px;color:#f4f4f5;line-height:1;user-select:all;-webkit-user-select:all;">' + otp + '</div>' +
'<div style="font-size:11px;color:#52525b;margin-top:12px;">Tekan &amp; tahan kode → Pilih Semua → Salin</div>' +
'</div>' +

'' +
'<table width="100%" cellpadding="0" cellspacing="0" style="border-left:3px solid #3f3f46;border-radius:0 8px 8px 0;">' +
'<tr><td style="padding:12px 16px;">' +
'<div style="color:#52525b;font-size:11px;line-height:1.7;">Bukan kamu yang request? Abaikan email ini. Jangan bagikan kode ke siapapun.</div>' +
'</td></tr>' +
'</table>' +

'</td></tr>' +

'' +
'<tr><td style="padding:20px 32px;border-top:1px solid #1f1f1f;text-align:center;">' +
'<p style="color:#3f3f46;font-size:11px;margin:0;">&#169; 2025 Saurus API &middot; api.Saurus.my.id</p>' +
'</td></tr>' +

'</table>' +
'</td></tr>' +
'</table>' +
'</body></html>';

          await transporter.sendMail({
            from: '"Saurus API" <' + smtpUser + '>',
            to: email,
            subject: '[Saurus API] Kode OTP Verifikasi Login',
            html: htmlBody,
            text: 'Kode OTP kamu: ' + otp + '. Berlaku 5 menit. Jangan bagikan ke siapapun.',
            headers: {
              'X-Mailer': 'Saurus API Mailer',
              'X-Priority': '1',
              'Precedence': 'transactional',
              'List-Unsubscribe': '<mailto:' + smtpUser + '>',
            }
          });
                    return res.json({ ok: true, message: 'OTP terkirim ke email.' });
        } catch (e) { return res.status(500).json({ ok: false, message: e.message }); }
      }

      // ─── OTP: Verifikasi kode OTP ──────────────────────────────────────────
      if (action === 'verify-otp' && req.method === 'POST') {
        const { uid, otp } = req.body || {};
        if (!uid || !otp) return res.status(400).json({ ok: false, message: 'uid & otp wajib.' });
        try {
          const doc = await db.collection('otpStore').doc(uid).get();
          if (!doc.exists) return res.status(400).json({ ok: false, message: 'OTP tidak ditemukan. Coba request ulang.' });
          const data = doc.data();
          if (data.used) return res.status(400).json({ ok: false, message: 'OTP sudah dipakai.' });
          if (Date.now() > data.expireAt) return res.status(400).json({ ok: false, message: 'OTP sudah expired. Coba request ulang.' });
          if (data.otp !== otp.toString().trim()) return res.status(400).json({ ok: false, message: 'OTP salah.' });
          await db.collection('otpStore').doc(uid).update({ used: true });
          return res.json({ ok: true, message: 'OTP valid.' });
        } catch (e) { return res.status(500).json({ ok: false, message: e.message }); }
      }

      return res.status(404).json({ ok: false, message: 'Firebase proxy action tidak dikenal.' });
    }

    if (matchedPlugin) {
      const keyCheck = await validateApiKey(req);
      if (!keyCheck.ok) {
        return sendJson(res, keyCheck.status || 401, { ok: false, message: keyCheck.message || 'API Key tidak valid.' }, '', req);
      }

      try {
        const result = await matchedPlugin.handler(req, getInput, res);
        if (result === null || result?.__handled === true) return;
        const httpStatus = (result?.ok === false && typeof result.status === 'number') ? result.status : result?.ok === false ? 400 : 200;
        const { status: _s, __handled: _h, ...payload } = result;
        return sendJson(res, httpStatus, payload, matchedPlugin.path || matchedPlugin.id || 'unknown-plugin', req);
      } catch (e) {
        return sendJson(res, 500, { ok: false, message: e.message }, '', req);
      }
    }

    return res.status(404).json({ ok: false, message: 'Endpoint tidak ditemukan.' });
  } catch (error) {
    const status = error?.statusCode || error?.status || 500;
    return res.status(status).json({
      ok: false,
      message: error?.message || 'Internal Server Error',
    });
  }
}

app.use(handler);
module.exports = app;
