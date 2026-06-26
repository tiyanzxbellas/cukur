// File: plugins/download/youtube.js
// Available styles: video, audio

'use strict';

const axios = require('axios');

module.exports = {
  id:          'download-youtube',
  name:        'Youtube',
  category:    'Download',
  path:        '/api/download/youtube',
  method:      'GET',
  description: 'YouTube media preview image',

  params: [
    {
      name: 'url',
      required: true,
      example: 'https://www.youtube.com/watch?v=fKRtnMYMW08',
      description: 'Input url',
    },
    {
      name: 'type',
      required: true,
      example: 'video',
      description: 'Input type',
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
    const type = getInput(req, 'type');
    const quality = getInput(req, 'quality');
    if (!url) return { ok: false, status: 400, message: "Parameter 'url' wajib diisi." };
    if (!type) return { ok: false, status: 400, message: "Parameter 'type' wajib diisi." };
    if (!quality) return { ok: false, status: 400, message: "Parameter 'quality' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/youtube', {
        params: {
          url,
          type,
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
