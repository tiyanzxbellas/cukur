'use strict';

const axios = require('axios');

const NEOXR_BASE = 'https://api.neoxr.eu/api';
const NEOXR_KEY  = process.env.NEOXR_APIKEY || 'yMb35i';

module.exports = {
  id:          'stalk-tiktok',
  name:        'TikTok Stalk',
  category:    'Stalk',
  path:        '/api/stalk/tiktok',
  method:      'GET',
  description: 'TikTok Stalk via Neoxr API.',

  params: [
    { name: 'username', required: true, example: 'hosico_cat', description: 'Username TikTok' },
  ],

  handler: async (req, getInput) => {
    const username = getInput(req, 'username');
    if (!username) return { ok: false, status: 400, message: "Parameter 'username' wajib diisi." };

    try {
      const { data } = await axios.get(`${NEOXR_BASE}/ttstalk`, {
        params:  { username, apikey: NEOXR_KEY },
        timeout: 20000,
        headers: { Accept: 'application/json', 'User-Agent': 'ElynnAPI/1.0' },
      });

      if (!data?.status) return { ok: false, status: 502, message: data?.message || 'Upstream API error.' };
      return { ok: true, result: data.data };
    } catch (err) {
      return { ok: false, status: 500, message: err?.message || 'Terjadi kesalahan internal.' };
    }
  },
};
