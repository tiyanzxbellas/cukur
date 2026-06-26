// File: plugins/image/rexdl-get.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'image-rexdl-get',
  name:        'Rexdl-get',
  category:    'Image',
  path:        '/api/image/rexdl-get',
  method:      'GET',
  description: 'Get image from URL',

  params: [
    {
      name: 'url',
      required: true,
      example: 'https://rexdl.com/android/race-rocket-arena-car-extreme-apk.html/',
      description: 'Input url',
    }
  ],

  handler: async (req, getInput, res) => {
    const url = getInput(req, 'url');
    if (!url) return { ok: false, status: 400, message: "Parameter 'url' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/rexdl-get', {
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
