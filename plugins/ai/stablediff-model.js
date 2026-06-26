// File: plugins/ai/stablediff-model.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'ai-stablediff-model',
  name:        'Stablediff-model',
  category:    'Ai',
  path:        '/api/ai/stablediff-model',
  method:      'GET',
  description: 'Stable Diffusion model info',

  params: [

  ],

  handler: async (req, getInput, res) => {



    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/stablediff-model', {
        params: {

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
