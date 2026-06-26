// File: plugins/ai/chat.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'ai-chat',
  name:        'Chat',
  category:    'Ai',
  path:        '/api/ai/chat',
  method:      'GET',
  description: 'General chat interface',

  params: [
    {
      name: 'charId',
      required: true,
      example: 'karl-marx',
      description: 'Input charId',
    },
    {
      name: 'message',
      required: true,
      example: '[{"role":"user","content":"hai, siapa kamu?"}]',
      description: 'Input message',
    }
  ],

  handler: async (req, getInput, res) => {
    const charId = getInput(req, 'charId');
    const message = getInput(req, 'message');
    if (!charId) return { ok: false, status: 400, message: "Parameter 'charId' wajib diisi." };
    if (!message) return { ok: false, status: 400, message: "Parameter 'message' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/chat', {
        params: {
          charId,
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
