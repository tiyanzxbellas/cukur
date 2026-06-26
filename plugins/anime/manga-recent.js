// File: plugins/anime/manga-recent.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'anime-manga-recent',
  name:        'Manga-recent',
  category:    'Anime',
  path:        '/api/anime/manga-recent',
  method:      'GET',
  description: 'Recent manga updates',

  params: [

  ],

  handler: async (req, getInput, res) => {



    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/manga-recent', {
        params: {

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
