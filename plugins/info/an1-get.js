// File: plugins/info/an1-get.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'info-an1-get',
  name:        'An1-get',
  category:    'Info',
  path:        '/api/info/an1-get',
  method:      'GET',
  description: 'Fetch data by URL',

  params: [
    {
      name: 'url',
      required: true,
      example: 'https://an1.com/3748-drift-max-mod.html',
      description: 'Input url',
    }
  ],

  handler: async (req, getInput, res) => {
    const url = getInput(req, 'url');
    if (!url) return { ok: false, status: 400, message: "Parameter 'url' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/an1-get', {
        params: {
          url,
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
