// File: plugins/info/anime-get.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'info-anime-get',
  name:        'Anime-get',
  category:    'Info',
  path:        '/api/info/anime-get',
  method:      'GET',
  description: 'Fetch anime details',

  params: [
    {
      name: 'url',
      required: true,
      example: 'https://www.animebatch.id/jujutsu-kaisen-season-2-sub-indo/',
      description: 'Input url',
    }
  ],

  handler: async (req, getInput, res) => {
    const url = getInput(req, 'url');
    if (!url) return { ok: false, status: 400, message: "Parameter 'url' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/anime-get', {
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
