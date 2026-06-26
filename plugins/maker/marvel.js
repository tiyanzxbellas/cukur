// File: plugins/maker/marvel.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'maker-marvel',
  name:        'Marvel',
  category:    'Maker',
  path:        '/api/maker/marvel',
  method:      'GET',
  description: 'Generate Marvel text image.',

  params: [
    {
      name: 'text1',
      required: true,
      example: 'neoxr',
      description: 'Input text1',
      // isImage: true — result returns image URL
    },
    {
      name: 'text2',
      required: true,
      example: 'api',
      description: 'Input text2',
      // isImage: true — result returns image URL
    }
  ],

  handler: async (req, getInput, res) => {
    const text1 = getInput(req, 'text1');
    const text2 = getInput(req, 'text2');
    if (!text1) return { ok: false, status: 400, message: "Parameter 'text1' wajib diisi." };
    if (!text2) return { ok: false, status: 400, message: "Parameter 'text2' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/marvel', {
        params: {
          text1,
          text2,
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
