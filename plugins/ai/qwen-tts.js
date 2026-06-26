// File: plugins/ai/qwen-tts.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'ai-qwen-tts',
  name:        'Qwen-tts',
  category:    'Ai',
  path:        '/api/ai/qwen-tts',
  method:      'GET',
  description: 'Text-to-speech synthesis',

  params: [
    {
      name: 'text',
      required: true,
      example: 'Hello, my name is Wildan Izzudin',
      description: 'Input text',
    },
    {
      name: 'voice',
      required: true,
      example: '0x1994',
      description: 'Input voice',
    }
  ],

  handler: async (req, getInput, res) => {
    const text = getInput(req, 'text');
    const voice = getInput(req, 'voice');
    if (!text) return { ok: false, status: 400, message: "Parameter 'text' wajib diisi." };
    if (!voice) return { ok: false, status: 400, message: "Parameter 'voice' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/qwen-tts', {
        params: {
          text,
          voice,
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
