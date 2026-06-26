// File: plugins/music/spotify.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'music-spotify',
  name:        'Spotify',
  category:    'Music',
  path:        '/api/music/spotify',
  method:      'GET',
  description: 'Spotify track image',

  params: [
    {
      name: 'url',
      required: true,
      example: 'https://open.spotify.com/playlist/1uvZC8F1FqDJdfrioNPyMV?si=kBUmkgsgT06s8uHVhwc9Iw',
      description: 'Input url',
    }
  ],

  handler: async (req, getInput, res) => {
    const url = getInput(req, 'url');
    if (!url) return { ok: false, status: 400, message: "Parameter 'url' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/spotify', {
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
