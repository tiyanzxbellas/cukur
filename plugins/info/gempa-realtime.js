'use strict';

const axios = require('axios');

const NEOXR_BASE = 'https://api.neoxr.eu/api';
const NEOXR_KEY  = process.env.NEOXR_APIKEY || 'yMb35i';

module.exports = {
  id:          'info-gempa-realtime',
  name:        'Gempa Realtime',
  category:    'Info',
  path:        '/api/info/gempa-realtime',
  method:      'GET',
  description: 'Ambil data gempa realtime dari BMKG.',

  params: [],

  handler: async () => {
    try {
      const { data } = await axios.get(`${NEOXR_BASE}/gempa-realtime`, {
        params:  { apikey: NEOXR_KEY },
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
