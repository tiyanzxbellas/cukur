// File: plugins/download/kraken.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'download-kraken',
  name:        'Kraken',
  category:    'Download',
  path:        '/api/download/kraken',
  method:      'GET',
  description: 'Kraken image fetch',

  params: [
    {
      name: 'url',
      required: true,
      example: 'https://krakenfiles.com/view/aN8mP27Ak6/file.html',
      description: 'Input url',
    }
  ],

  handler: async (req, getInput, res) => {
    const url = getInput(req, 'url');
    if (!url) return { ok: false, status: 400, message: "Parameter 'url' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/kraken', {
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
