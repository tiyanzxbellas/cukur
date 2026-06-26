// File: plugins/search/lyric-search.js
'use strict';

const axios = require('axios');

const BASE_URL = 'https://api.neoxr.eu/api';
const API_KEY  = 'yMb35i';

module.exports = {
  id:          'search-lyric',
  name:        'Lyric Search',
  category:    'Search',
  path:        '/api/search/lyric',
  method:      'GET',
  description: 'Cari lirik lagu beserta tautan tampilannya via Neoxr API.',

  params: [
    {
      name:        'q',
      required:    true,
      example:     'komang',
      description: 'Judul lagu atau URL Genius untuk lirik',
    },
  ],

  handler: async (req, getInput) => {
    const q = getInput(req, 'q');
    if (!q) return { ok: false, status: 400, message: "Parameter 'q' wajib diisi." };

    try {
      const { data } = await axios.get(`${BASE_URL}/lyric`, {
        params: {
          q,
          apikey: API_KEY,
        },
        timeout: 20000,
        headers: { Accept: 'application/json', 'User-Agent': 'ElynnAPI/1.0' },
      });

      if (!data?.status) return { ok: false, status: 502, message: data?.message || 'Upstream API error.' };

      // Catatan: field "page" pada respons (link preview dari Neoxr) akan
      // otomatis di-rehost ke Supabase oleh sendJson(), jadi hasil akhirnya
      // tetap berdomain api.elynn.my.id tanpa perlu scrape manual di sini.
      return { ok: true, result: data.data };
    } catch (err) {
      return { ok: false, status: 500, message: err.message || 'Internal server error.' };
    }
  },
};
