'use strict';

const axios  = require('axios');
const config = require('../../config');

const SUPA_URL    = (config.supabase?.url    || '').replace(/\/$/, '');
const SUPA_KEY    = config.supabase?.serviceKey || '';
const SUPA_BUCKET = config.supabase?.bucket     || 'elynn-media';

function generateFilename() {
  const n = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return `elynn${n}.jpg`;
}

function getBaseUrl(req) {
  const host  = req?.headers?.['x-forwarded-host'] || req?.headers?.host || 'api.elynn.my.id';
  const proto = (req?.headers?.['x-forwarded-proto'] || 'https').split(',')[0].trim();
  return `${proto}://${host}`;
}

async function uploadSupabase(buffer, filename) {
  const url = `${SUPA_URL}/storage/v1/object/${SUPA_BUCKET}/${filename}`;
  const res  = await axios.post(url, buffer, {
    headers: {
      'Authorization': `Bearer ${SUPA_KEY}`,
      'Content-Type':  'image/jpeg',
      'x-upsert':      'true',
    },
    maxContentLength: Infinity,
    maxBodyLength:    Infinity,
    validateStatus:   s => s < 500,
  });
  if (res.status >= 400) throw new Error(`Supabase upload failed: HTTP ${res.status}`);
}

module.exports = {
  id:          'tools-ssweb',
  name:        'Screenshot Website',
  category:    'Tools',
  path:        '/api/tools/ssweb',
  method:      'GET',
  description: 'Screenshot sebuah website dan return link gambar lokal (api.elynn.my.id/elynn(angka).jpg). Support mode desktop/mobile, tema light/dark, dan full page.',

  params: [
    { name: 'url',      required: true,  example: 'https://google.com',      description: 'URL website yang akan di-screenshot' },
    { name: 'device',   required: false, example: 'desktop',                 description: 'Perangkat: desktop | mobile (default: desktop)' },
    { name: 'theme',    required: false, example: 'dark',                    description: 'Tema: light | dark (default: light)' },
    { name: 'fullPage', required: false, example: 'false',                   description: 'Capture full page: true | false (default: false)' },
  ],

  handler: async (req, getInput) => {
    const url      = getInput(req, 'url');
    const device   = getInput(req, 'device')   || 'desktop';
    const theme    = getInput(req, 'theme')    || 'light';
    const fullPage = getInput(req, 'fullPage') || 'false';

    if (!url || !/^https?:\/\//i.test(url)) {
      return { ok: false, status: 400, message: "Parameter 'url' wajib diisi dengan URL valid (http/https)." };
    }

    if (!SUPA_URL || !SUPA_KEY) {
      return { ok: false, status: 503, message: 'Supabase belum dikonfigurasi di config.js.' };
    }

    const validDevices = ['desktop', 'mobile'];
    const validThemes  = ['light', 'dark'];
    const dev  = validDevices.includes(device.toLowerCase())  ? device.toLowerCase()  : 'desktop';
    const thm  = validThemes.includes(theme.toLowerCase())    ? theme.toLowerCase()   : 'light';
    const full = fullPage === 'true' ? 'true' : 'false';

    let buffer;
    try {
      const upstream = await axios.get('https://api.siputzx.my.id/api/tools/ssweb', {
        params:       { url, device: dev, theme: thm, fullPage: full },
        responseType: 'arraybuffer',
        timeout:      40000,
        headers:      { 'User-Agent': 'ElynnAPI/1.0' },
      });
      buffer = Buffer.from(upstream.data);
    } catch (err) {
      return { ok: false, status: 502, message: `Gagal mengambil screenshot: ${err.message}` };
    }

    const filename = generateFilename();

    try {
      await uploadSupabase(buffer, filename);
    } catch (err) {
      return { ok: false, status: 500, message: `Gagal upload ke storage: ${err.message}` };
    }

    return {
      ok:     true,
      result: {
        url:        `${getBaseUrl(req)}/${filename}`,
        filename,
        size_bytes: buffer.length,
        target_url: url,
        device:     dev,
        theme:      thm,
        full_page:  full === 'true',
      },
    };
  },
};
