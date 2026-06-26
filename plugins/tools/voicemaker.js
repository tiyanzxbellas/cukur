// File: plugins/tools/voicemaker.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'tools-voicemaker',
  name:        'Voicemaker',
  category:    'Tools',
  path:        '/api/tools/voicemaker',
  method:      'GET',
  description: 'Voice image generated from text',

  params: [
    {
      name: 'text',
      required: true,
      example: 'elynn API adalah layanan rest API gratis dan berbayar dengan harga yang sangat terjangkau.',
      description: 'Input text',
    },
    {
      name: 'gender',
      required: true,
      example: 'male',
      description: 'Input gender',
    }
  ],

  handler: async (req, getInput, res) => {
    const text = getInput(req, 'text');
    const gender = getInput(req, 'gender');
    if (!text) return { ok: false, status: 400, message: "Parameter 'text' wajib diisi." };
    if (!gender) return { ok: false, status: 400, message: "Parameter 'gender' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/voicemaker', {
        params: {
          text,
          gender,
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
