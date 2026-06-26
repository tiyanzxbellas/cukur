// File: plugins/anime/manga.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'anime-manga',
  name:        'Manga',
  category:    'Anime',
  path:        '/api/anime/manga',
  method:      'GET',
  description: 'Manga search results',

  params: [
    {
      name: 'q',
      required: true,
      example: 'chinmoku no',
      description: 'Input q',
    },
    {
      name: 'limit',
      required: true,
      example: '10',
      description: 'Input limit',
    }
  ],

  handler: async (req, getInput, res) => {
    const q = getInput(req, 'q');
    const limit = getInput(req, 'limit');
    if (!q) return { ok: false, status: 400, message: "Parameter 'q' wajib diisi." };
    if (!limit) return { ok: false, status: 400, message: "Parameter 'limit' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/manga', {
        params: {
          q,
          limit,
          apikey: 'yMb35i',
        },
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
