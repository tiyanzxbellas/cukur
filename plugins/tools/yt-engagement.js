'use strict';

const axios = require('axios');

const NEOXR_BASE = 'https://api.neoxr.eu/api';
const NEOXR_KEY  = process.env.NEOXR_APIKEY || 'yMb35i';

module.exports = {
  id:          'tools-yt-engagement',
  name:        'YouTube Engagement',
  category:    'Tools',
  path:        '/api/tools/yt-engagement',
  method:      'GET',
  description: 'Ambil data engagement channel YouTube berdasarkan query.',

  params: [
    { name: 'q', required: true, example: 'MrBeast', description: 'Nama channel YouTube' },
  ],

  handler: async (req, getInput) => {
    const q = getInput(req, 'q');
    if (!q) return { ok: false, status: 400, message: "Parameter 'q' wajib diisi." };

    try {
      const { data } = await axios.get(`${NEOXR_BASE}/yt-engagement`, {
        params:  { q, apikey: NEOXR_KEY },
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
