// File: plugins/ai/gpt4-session.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'ai-gpt4-session',
  name:        'Gpt4-session',
  category:    'Ai',
  path:        '/api/ai/gpt4-session',
  method:      'GET',
  description: 'GPT-4 session support',

  params: [
    {
      name: 'q',
      required: true,
      example: 'tanggal berapa sekarang?',
      description: 'Input q',
    },
    {
      name: 'session',
      required: true,
      example: '1727468410446638',
      description: 'Input session',
    }
  ],

  handler: async (req, getInput, res) => {
    const q = getInput(req, 'q');
    const session = getInput(req, 'session');
    if (!q) return { ok: false, status: 400, message: "Parameter 'q' wajib diisi." };
    if (!session) return { ok: false, status: 400, message: "Parameter 'session' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/gpt4-session', {
        params: {
          q,
          session,
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
