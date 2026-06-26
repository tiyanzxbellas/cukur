// File: plugins/image/bacapetra-search.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'image-bacapetra-search',
  name:        'Bacapetra-search',
  category:    'Image',
  path:        '/api/image/bacapetra-search',
  method:      'GET',
  description: 'Search results image',

  params: [
    {
      name: 'q',
      required: true,
      example: 'malam',
      description: 'Input q',
    },
    {
      name: 'page',
      required: true,
      example: '1',
      description: 'Input page',
    }
  ],

  handler: async (req, getInput, res) => {
    const q = getInput(req, 'q');
    const page = getInput(req, 'page');
    if (!q) return { ok: false, status: 400, message: "Parameter 'q' wajib diisi." };
    if (!page) return { ok: false, status: 400, message: "Parameter 'page' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/bacapetra-search', {
        params: {
          q,
          page,
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
