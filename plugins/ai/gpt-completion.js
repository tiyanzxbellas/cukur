// File: plugins/ai/gpt-completion.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'ai-gpt-completion',
  name:        'Gpt-completion',
  category:    'Ai',
  path:        '/api/ai/gpt-completion',
  method:      'GET',
  description: 'GPT completion endpoint',

  params: [
    {
      name: 'message',
      required: true,
      example: '[{"content":"hai","role":"user"},{"content":"Hi, can I assist you today?","role":"assistant"},{"content":"apa itu kucing","role":"user"}]',
      description: 'Input message',
    }
  ],

  handler: async (req, getInput, res) => {
    const message = getInput(req, 'message');
    if (!message) return { ok: false, status: 400, message: "Parameter 'message' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/gpt-completion', {
        params: {
          message,
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
