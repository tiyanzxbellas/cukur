// File: plugins/islamic/hadits-by-url.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'islamic-hadits-by-url',
  name:        'Hadits (Berdasarkan URL)',
  category:    'Islamic',
  path:        '/api/islamic/hadits-get',
  method:      'GET',
  description: 'Mendapatkan detail hadits dari URL spesifik (contoh: https://islam.neoxr.eu/hadits/tirmidzi/133).',

  params: [
    { name: 'url', required: true, example: 'https://islam.neoxr.eu/hadits/tirmidzi/133', description: 'URL lengkap hadits' },
  ],

  handler: async (req, getInput, res) => {
    let url = getInput(req, 'url');
    if (!url) return { ok: false, status: 400, message: "Parameter 'url' wajib diisi." };
    url = encodeURIComponent(url);

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/hadits-get', {
        params:  { url, apikey: 'yMb35i' },
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
