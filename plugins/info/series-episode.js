// File: plugins/info/series-episode.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'info-series-episode',
  name:        'Series-episode',
  category:    'Info',
  path:        '/api/info/series-episode',
  method:      'GET',
  description: 'Fetch series episode data',

  params: [
    {
      name: 'url',
      required: true,
      example: 'https://tv.neoxr.eu/series/mr-robot-season-1-episode-1-2015',
      description: 'Input url',
    }
  ],

  handler: async (req, getInput, res) => {
    const url = getInput(req, 'url');
    if (!url) return { ok: false, status: 400, message: "Parameter 'url' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/series-episode', {
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
