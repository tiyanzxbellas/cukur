// File: plugins/ai/blackbox.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'ai-blackbox',
  name:        'Blackbox',
  category:    'Ai',
  path:        '/api/ai/blackbox',
  method:      'GET',
  description: 'Universal query interface',

  params: [
    {
      name: 'q',
      required: true,
      example: 'Hi',
      description: 'Input q',
    }
  ],

  handler: async (req, getInput, res) => {
    const q = getInput(req, 'q');
    if (!q) return { ok: false, status: 400, message: "Parameter 'q' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/blackbox', {
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
