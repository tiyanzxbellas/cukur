// File: plugins/tools/webp2jpg.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'tools-webp2jpg',
  name:        'Webp2jpg',
  category:    'Tools',
  path:        '/api/tools/webp2jpg',
  method:      'GET',
  description: 'WebP to JPG converter',

  params: [
    {
      name: 'url',
      required: true,
      example: 'https://filesamples.com/samples/image/webp/sample1.webp',
      description: 'Input url',
    }
  ],

  handler: async (req, getInput, res) => {
    const url = getInput(req, 'url');
    if (!url) return { ok: false, status: 400, message: "Parameter 'url' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/webp2jpg', {
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
