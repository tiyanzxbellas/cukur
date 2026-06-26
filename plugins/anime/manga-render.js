// File: plugins/anime/manga-render.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'anime-manga-render',
  name:        'Manga-render',
  category:    'Anime',
  path:        '/api/anime/manga-render',
  method:      'GET',
  description: 'Render manga chapter text',

  params: [
    {
      name: 'chapter_id',
      required: true,
      example: 'ff44ad89-cc2d-4806-a613-efe84d020f08',
      description: 'Input chapter_id',
    }
  ],

  handler: async (req, getInput, res) => {
    const chapter_id = getInput(req, 'chapter_id');
    if (!chapter_id) return { ok: false, status: 400, message: "Parameter 'chapter_id' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/manga-render', {
        params: {
          chapter_id,
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
