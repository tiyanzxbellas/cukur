// File: plugins/ai/cai.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'ai-cai',
  name:        'Cai',
  category:    'Ai',
  path:        '/api/ai/cai',
  method:      'GET',
  description: 'Character-based AI chat',

  params: [
    {
      name: 'character_id',
      required: true,
      example: '333e7322-a95b-4a14-a051-1c24b8d67b31',
      description: 'Input character_id',
    },
    {
      name: 'message',
      required: true,
      example: 'want to fight?',
      description: 'Input message',
    }
  ],

  handler: async (req, getInput, res) => {
    const character_id = getInput(req, 'character_id');
    const message = getInput(req, 'message');
    if (!character_id) return { ok: false, status: 400, message: "Parameter 'character_id' wajib diisi." };
    if (!message) return { ok: false, status: 400, message: "Parameter 'message' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/cai', {
        params: {
          character_id,
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
