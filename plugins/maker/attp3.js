// File: plugins/maker/attp3.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'maker-attp3',
  name:        'Attp3',
  category:    'Maker',
  path:        '/api/maker/attp3',
  method:      'GET',
  description: 'Variant text meme image',

  params: [
    {
      name: 'text',
      required: true,
      example: 'forget about where we are and let go?',
      description: 'Input text',
    },
    {
      name: 'color',
      required: true,
      example: '2B1D0E',
      description: 'Input color',
    }
  ],

  handler: async (req, getInput, res) => {
    const text = getInput(req, 'text');
    const color = getInput(req, 'color');
    if (!text) return { ok: false, status: 400, message: "Parameter 'text' wajib diisi." };
    if (!color) return { ok: false, status: 400, message: "Parameter 'color' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/attp3', {
        params: {
          text,
          color,
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
