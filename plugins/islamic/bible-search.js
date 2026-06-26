// File: plugins/islamic/bible-search.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'islamic-bible-search',
  name:        'Pencarian Alkitab',
  category:    'Islamic',
  path:        '/api/islamic/bible-search',
  method:      'GET',
  description: 'Mencari ayat di Alkitab berdasarkan kata kunci.',

  params: [
    { name: 'q', required: true, example: 'kiryat', description: 'Kata kunci pencarian' },
  ],

  handler: async (req, getInput, res) => {
    const q = getInput(req, 'q');
    if (!q) return { ok: false, status: 400, message: "Parameter 'q' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/bible-search', {
        params:  { q, apikey: 'yMb35i' },
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
