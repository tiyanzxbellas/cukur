// File: plugins/ai/photo-editor.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'ai-photo-editor',
  name:        'Photo-editor',
  category:    'Ai',
  path:        '/api/ai/photo-editor',
  method:      'GET',
  description: 'Photo editing tool',

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
      name: 'q',
      required: true,
      example: 'change the color of the hijab to blue',
      description: 'Input q',
    }
  ],

  handler: async (req, getInput, res) => {
    const image = getInput(req, 'image');
    const q = getInput(req, 'q');
    if (!image) return { ok: false, status: 400, message: "Parameter 'image' wajib diisi." };
    if (!q) return { ok: false, status: 400, message: "Parameter 'q' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/photo-editor', {
        params: {
          image,
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
