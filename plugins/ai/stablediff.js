// File: plugins/ai/stablediff.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'ai-stablediff',
  name:        'Stablediff',
  category:    'Ai',
  path:        '/api/ai/stablediff',
  method:      'GET',
  description: 'Stable Diffusion image generation',

  params: [
    {
      name: 'prompt',
      required: true,
      example: 'a black cat on the chair',
      description: 'Input prompt',
    },
    {
      name: 'model',
      required: true,
      example: 'origami',
      description: 'Input model',
    },
    {
      name: 'orientation',
      required: true,
      example: 'potrait',
      description: 'Input orientation',
    }
  ],

  handler: async (req, getInput, res) => {
    const prompt = getInput(req, 'prompt');
    const model = getInput(req, 'model');
    const orientation = getInput(req, 'orientation');
    if (!prompt) return { ok: false, status: 400, message: "Parameter 'prompt' wajib diisi." };
    if (!model) return { ok: false, status: 400, message: "Parameter 'model' wajib diisi." };
    if (!orientation) return { ok: false, status: 400, message: "Parameter 'orientation' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/stablediff', {
        params: {
          prompt,
          model,
          orientation,
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
