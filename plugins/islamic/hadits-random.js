// File: plugins/islamic/hadits-random.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'islamic-hadits-random',
  name:        'Hadits Random',
  category:    'Islamic',
  path:        '/api/islamic/hadits',
  method:      'GET',
  description: 'Mendapatkan satu hadits secara acak (default dari Shahih Al-Bukhari).',

  params: [],

  handler: async (req, getInput, res) => {
    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/hadits', {
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
