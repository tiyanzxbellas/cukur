// File: plugins/anime/pixiv.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'anime-pixiv',
  name:        'Pixiv',
  category:    'Anime',
  path:        '/api/anime/pixiv',
  method:      'GET',
  description: 'Pixiv artwork fetch',

  params: [
    {
      name: 'url',
      required: true,
      example: 'https://www.pixiv.net/en/artworks/128990261',
      description: 'Input url',
    }
  ],

  handler: async (req, getInput, res) => {
    const url = getInput(req, 'url');
    if (!url) return { ok: false, status: 400, message: "Parameter 'url' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/pixiv', {
        params: {
          url,
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
