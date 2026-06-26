// File: plugins/info/wpread.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'info-wpread',
  name:        'Wpread',
  category:    'Info',
  path:        '/api/info/wpread',
  method:      'GET',
  description: 'Read WordPress content',

  params: [
    {
      name: 'part',
      required: true,
      example: 'https://www.wattpad.com/777740155-maripossa-prologue/',
      description: 'Input part',
    }
  ],

  handler: async (req, getInput, res) => {
    const part = getInput(req, 'part');
    if (!part) return { ok: false, status: 400, message: "Parameter 'part' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/wpread', {
        params: {
          part,
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
