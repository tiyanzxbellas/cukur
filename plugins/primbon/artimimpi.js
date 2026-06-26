// File: plugins/primbon/artimimpi.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'primbon-artimimpi',
  name:        'Artimimpi',
  category:    'Primbon',
  path:        '/api/primbon/artimimpi',
  method:      'GET',
  description: 'Generate Artimimpi text image.',

  params: [
    {
      name: 'q',
      required: true,
      example: 'belanja',
      description: 'Input q',
    }
  ],

  handler: async (req, getInput, res) => {
    const q = getInput(req, 'q');
    if (!q) return { ok: false, status: 400, message: "Parameter 'q' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/artimimpi', {
        params: {
          q,
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
