// File: plugins/anime/bilibili.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'anime-bilibili',
  name:        'Bilibili',
  category:    'Anime',
  path:        '/api/anime/bilibili',
  method:      'GET',
  description: 'Bilibili image fetch',

  params: [
    {
      name: 'url',
      required: true,
      example: 'https://www.bilibili.tv/id/video/4797840692876800?bstar_from=bstar-web.homepage.trending.all',
      description: 'Input url',
    }
  ],

  handler: async (req, getInput, res) => {
    const url = getInput(req, 'url');
    if (!url) return { ok: false, status: 400, message: "Parameter 'url' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/bilibili', {
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
