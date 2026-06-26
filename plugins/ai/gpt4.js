// File: plugins/ai/gpt4.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'ai-gpt4',
  name:        'Gpt4',
  category:    'Ai',
  path:        '/api/ai/gpt4',
  method:      'GET',
  description: 'GPT-4 chat endpoint',

  params: [
    {
      name: 'q',
      required: true,
      example: 'hi',
      description: 'Input q',
    }
  ],

  handler: async (req, getInput, res) => {
    const q = getInput(req, 'q');
    if (!q) return { ok: false, status: 400, message: "Parameter 'q' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/gpt4', {
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
