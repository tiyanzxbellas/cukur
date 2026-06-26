// File: plugins/maker/memegenvid.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'maker-memegenvid',
  name:        'Memegenvid',
  category:    'Maker',
  path:        '/api/maker/memegenvid',
  method:      'GET',
  description: 'Meme video with text',

  params: [
    {
      name: 'image',
      required: true,
      example: 'https://cdn.neoxr.eu/images/spongebob.jpg',
      description: 'Input image',
      isImage: true,
      isMedia: true,
    },
    {
      name: 'top',
      required: true,
      example: 'mas anies',
      description: 'Input top',
    },
    {
      name: 'bottom',
      required: true,
      example: 'mas anies 😂',
      description: 'Input bottom',
    }
  ],

  handler: async (req, getInput, res) => {
    const image = getInput(req, 'image');
    const top = getInput(req, 'top');
    const bottom = getInput(req, 'bottom');
    if (!image) return { ok: false, status: 400, message: "Parameter 'image' wajib diisi." };
    if (!top) return { ok: false, status: 400, message: "Parameter 'top' wajib diisi." };
    if (!bottom) return { ok: false, status: 400, message: "Parameter 'bottom' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/memegenvid', {
        params: {
          image,
          top,
          bottom,
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
