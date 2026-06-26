// File: plugins/islamic/muslim-central-series.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'islamic-muslim-central-series',
  name:        'Muslim Central Series',
  category:    'Islamic',
  path:        '/api/islamic/muslim-central-series',
  method:      'GET',
  description: 'Daftar semua seri podcast yang tersedia di Muslim Central.',

  params: [],

  handler: async (req, getInput, res) => {
    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/muslim-central-series', {
        params:  { apikey: 'yMb35i' },
        timeout: 20000,
        headers: { Accept: 'application/json', 'User-Agent': 'ElynnAPI/1.0' },
      });
      if (!data?.status) return { ok: false, status: 502, message: data?.message || 'Upstream error.' };
      return { ok: true, result: data.data };
    } catch (err) {
      return { ok: false, status: 500, message: err.message || 'Internal server error.' };
    }
  },
};
