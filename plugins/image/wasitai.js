// File: plugins/image/wasitai.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'image-wasitai',
  name:        'Wasitai',
  category:    'Image',
  path:        '/api/image/wasitai',
  method:      'GET',
  description: 'Transform an image creatively',

  params: [
    {
      name: 'image',
      required: true,
      example: 'https://i.pinimg.com/736x/ce/00/b2/ce00b24a3beb3effa43a476eb21e4311.jpg',
      description: 'Input image',
      isImage: true,
      isMedia: true,
    }
  ],

  handler: async (req, getInput, res) => {
    const image = getInput(req, 'image');
    if (!image) return { ok: false, status: 400, message: "Parameter 'image' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/wasitai', {
        params: {
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
