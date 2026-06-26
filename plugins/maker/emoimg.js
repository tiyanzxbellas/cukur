// File: plugins/maker/emoimg.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'maker-emoimg',
  name:        'Emoimg',
  category:    'Maker',
  path:        '/api/maker/emoimg',
  method:      'GET',
  description: 'Styled image from text query',

  params: [
    {
      name: 'q',
      required: true,
      example: '😳',
      description: 'Input q',
    },
    {
      name: 'style',
      required: true,
      example: 'apple',
      description: 'Input style',
    }
  ],

  handler: async (req, getInput, res) => {
    const q = getInput(req, 'q');
    const style = getInput(req, 'style');
    if (!q) return { ok: false, status: 400, message: "Parameter 'q' wajib diisi." };
    if (!style) return { ok: false, status: 400, message: "Parameter 'style' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/emoimg', {
        params: {
          q,
          style,
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
