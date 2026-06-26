// File: plugins/music/spotify-new.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'music-spotify-new',
  name:        'Spotify-new',
  category:    'Music',
  path:        '/api/music/spotify-new',
  method:      'GET',
  description: 'Spotify new releases images',

  params: [
    {
      name: 'limit',
      required: true,
      example: '10',
      description: 'Input limit',
    }
  ],

  handler: async (req, getInput, res) => {
    const limit = getInput(req, 'limit');
    if (!limit) return { ok: false, status: 400, message: "Parameter 'limit' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/spotify-new', {
        params: {
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
