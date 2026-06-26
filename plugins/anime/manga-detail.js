// File: plugins/anime/manga-detail.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'anime-manga-detail',
  name:        'Manga-detail',
  category:    'Anime',
  path:        '/api/anime/manga-detail',
  method:      'GET',
  description: 'Manga detail info',

  params: [
    {
      name: 'id',
      required: true,
      example: '2b5a3b43-effb-4f54-aa9b-d6093d523452',
      description: 'Input id',
    }
  ],

  handler: async (req, getInput, res) => {
    const id = getInput(req, 'id');
    if (!id) return { ok: false, status: 400, message: "Parameter 'id' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/manga-detail', {
        params: {
          id,
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
