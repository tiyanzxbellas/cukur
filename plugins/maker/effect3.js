// File: plugins/maker/effect3.js
// Available styles: greyscale, invert, trigger

'use strict';

const axios = require('axios');

module.exports = {
  id:          'maker-effect3',
  name:        'Effect3',
  category:    'Maker',
  path:        '/api/maker/effect3',
  method:      'GET',
  description: 'Image effect filter application',

  params: [
    {
      name: 'style',
      required: true,
      example: 'greyscale',
      description: 'Input style',
    },
    {
      name: 'image',
      required: true,
      example: 'https://telegra.ph/file/7cc74d27d652ae29ce2ca.jpg',
      description: 'Input image',
      isImage: true,
      isMedia: true,
    }
  ],

  handler: async (req, getInput, res) => {
    const style = getInput(req, 'style');
    const image = getInput(req, 'image');
    if (!style) return { ok: false, status: 400, message: "Parameter 'style' wajib diisi." };
    if (!image) return { ok: false, status: 400, message: "Parameter 'image' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/effect3', {
        params: {
          style,
          image,
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
