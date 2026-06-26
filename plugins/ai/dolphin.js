// File: plugins/ai/dolphin.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'ai-dolphin',
  name:        'Dolphin',
  category:    'Ai',
  path:        '/api/ai/dolphin',
  method:      'GET',
  description: 'AI image generation',

  params: [
    {
      name: 'prompt',
      required: true,
      example: 'Hai',
      description: 'Input prompt',
    },
    {
      name: 'model',
      required: true,
      example: 'Dolphin 24B',
      description: 'Input model',
    },
    {
      name: 'session',
      required: true,
      example: '1907da94-5025-476e-af7b-e29029191d6a',
      description: 'Input session',
    }
  ],

  handler: async (req, getInput, res) => {
    const prompt = getInput(req, 'prompt');
    const model = getInput(req, 'model');
    const session = getInput(req, 'session');
    if (!prompt) return { ok: false, status: 400, message: "Parameter 'prompt' wajib diisi." };
    if (!model) return { ok: false, status: 400, message: "Parameter 'model' wajib diisi." };
    if (!session) return { ok: false, status: 400, message: "Parameter 'session' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/dolphin', {
        params: {
          prompt,
          model,
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
