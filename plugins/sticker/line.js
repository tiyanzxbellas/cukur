'use strict';

const axios = require('axios');

const NEOXR_BASE = 'https://api.neoxr.eu/api';
const NEOXR_KEY  = process.env.NEOXR_APIKEY || 'yMb35i';

module.exports = {
  id:          'sticker-line',
  name:        'LINE Sticker',
  category:    'Sticker',
  path:        '/api/sticker/line',
  method:      'GET',
  description: 'LINE Sticker via Neoxr API.',

  params: [
    { name: 'url', required: true, example: 'https://store.line.me/stickershop/product/9801/en', description: 'URL LINE sticker store', isMedia: true },
  ],

  handler: async (req, getInput) => {
    const url = getInput(req, 'url');
    if (!url) return { ok: false, status: 400, message: "Parameter 'url' wajib diisi." };

    try {
      const { data } = await axios.get(`${NEOXR_BASE}/linesticker`, {
        params:  { url, apikey: NEOXR_KEY },
        timeout: 30000,
        headers: { Accept: 'application/json', 'User-Agent': 'ElynnAPI/1.0' },
      });

      if (!data?.status) return { ok: false, status: 502, message: data?.message || 'Upstream API error.' };
      return { ok: true, result: data.data };
    } catch (err) {
      return { ok: false, status: 500, message: err?.message || 'Terjadi kesalahan internal.' };
    }
  },
};
