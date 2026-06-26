'use strict';

const axios = require('axios');

const NEOXR_BASE = 'https://api.neoxr.eu/api';
const NEOXR_KEY  = process.env.NEOXR_APIKEY || 'yMb35i';

module.exports = {
  id:          'stalk-discord',
  name:        'Discord Stalk',
  category:    'Stalk',
  path:        '/api/stalk/discord',
  method:      'GET',
  description: 'Discord Stalk via Neoxr API.',

  params: [
    { name: 'id', required: true, example: '297574907510784000', description: 'Discord user ID' },
  ],

  handler: async (req, getInput) => {
    const id = getInput(req, 'id');
    if (!id) return { ok: false, status: 400, message: "Parameter 'id' wajib diisi." };

    try {
      const { data } = await axios.get(`${NEOXR_BASE}/dcstalk`, {
        params:  { id, apikey: NEOXR_KEY },
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
