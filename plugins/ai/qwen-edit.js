// File: plugins/ai/qwen-edit.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'ai-qwen-edit',
  name:        'Qwen-edit',
  category:    'Ai',
  path:        '/api/ai/qwen-edit',
  method:      'GET',
  description: 'Image editing with prompts',

  params: [
    {
      name: 'image',
      required: true,
      example: 'https://telegra.ph/file/a02e8d6e5353d671a7e8c.jpg',
      description: 'Input image',
      isImage: true,
      isMedia: true,
    },
    {
      name: 'prompt',
      required: true,
      example: 'On a cluttered student desk filled with sketchbooks, coffee cups, and pens, a 1/7 figurine of the uploaded character stands naturally, as if part of the workspace. Its transparent acrylic base subtly reflects the warm desk lamp above. Behind it, a laptop shows ZBrush sculpting the figurine. To the side is a toy package with cheerful hand-drawn illustrations, resembling a casual artist\'s product release.',
      description: 'Input prompt',
    }
  ],

  handler: async (req, getInput, res) => {
    const image = getInput(req, 'image');
    const prompt = getInput(req, 'prompt');
    if (!image) return { ok: false, status: 400, message: "Parameter 'image' wajib diisi." };
    if (!prompt) return { ok: false, status: 400, message: "Parameter 'prompt' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/qwen-edit', {
        params: {
          image,
          prompt,
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
