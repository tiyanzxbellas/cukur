// File: plugins/info/anoboy-episode.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'info-anoboy-episode',
  name:        'Anoboy-episode',
  category:    'Info',
  path:        '/api/info/anoboy-episode',
  method:      'GET',
  description: 'Fetch episode data',

  params: [
    {
      name: 'url',
      required: true,
      example: 'https://anoboy.neoxr.eu/yarinaoshi-reijou-wa-ryuutei-heika-wo-kouryakuchuu-episode-2-subtitle-indonesia/',
      description: 'Input url',
    }
  ],

  handler: async (req, getInput, res) => {
    const url = getInput(req, 'url');
    if (!url) return { ok: false, status: 400, message: "Parameter 'url' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/anoboy-episode', {
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
