// File: plugins/image/otakudesu-dl.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'image-otakudesu-dl',
  name:        'Otakudesu-dl',
  category:    'Image',
  path:        '/api/image/otakudesu-dl',
  method:      'GET',
  description: 'Download poster image',

  params: [
    {
      name: 'url',
      required: true,
      example: 'https://otakudesu.best/episode/kcwk-episode-7-sub-indo/',
      description: 'Input url',
    },
    {
      name: 'quality',
      required: true,
      example: '720p',
      description: 'Input quality',
    }
  ],

  handler: async (req, getInput, res) => {
    const url = getInput(req, 'url');
    const quality = getInput(req, 'quality');
    if (!url) return { ok: false, status: 400, message: "Parameter 'url' wajib diisi." };
    if (!quality) return { ok: false, status: 400, message: "Parameter 'quality' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/otakudesu-dl', {
        params: {
          url,
          quality,
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
