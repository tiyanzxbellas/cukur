// File: plugins/image/bacapetra.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'image-bacapetra',
  name:        'Bacapetra',
  category:    'Image',
  path:        '/api/image/bacapetra',
  method:      'GET',
  description: 'Category based image results',

  params: [
    {
      name: 'category',
      required: true,
      example: 'cerpen',
      description: 'Input category',
    },
    {
      name: 'page',
      required: true,
      example: '1',
      description: 'Input page',
    }
  ],

  handler: async (req, getInput, res) => {
    const category = getInput(req, 'category');
    const page = getInput(req, 'page');
    if (!category) return { ok: false, status: 400, message: "Parameter 'category' wajib diisi." };
    if (!page) return { ok: false, status: 400, message: "Parameter 'page' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/bacapetra', {
        params: {
          category,
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
