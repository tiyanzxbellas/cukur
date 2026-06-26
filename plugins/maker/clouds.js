// File: plugins/maker/clouds.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'maker-clouds',
  name:        'Clouds',
  category:    'Maker',
  path:        '/api/maker/clouds',
  method:      'GET',
  description: 'Generate Clouds text image.',

  params: [
    {
      name: 'text',
      required: true,
      example: 'elynn',
      description: 'Input text',
      // isImage: true — result returns image URL
    }
  ],

  handler: async (req, getInput, res) => {
    const text = getInput(req, 'text');
    if (!text) return { ok: false, status: 400, message: "Parameter 'text' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/clouds', {
        params: {
          text,
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
