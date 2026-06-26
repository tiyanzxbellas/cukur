// File: plugins/tools/resep.js
'use strict';

const axios = require('axios');

const BASE_URL = 'https://api.neoxr.eu/api';
const API_KEY  = 'yMb35i';

module.exports = {
  id:          'tools-resep',
  name:        'Resep Detail',
  category:    'Tools',
  path:        '/api/tools/resep',
  method:      'GET',
  description: 'Resep Detail via Neoxr API.',

  params: [
    {
      name:        'q',
      required:    false,
      example:     'ayam geprek',
      description: 'Nama resep (atau gunakan url)',
    },
    {
      name:        'url',
      required:    false,
      example:     'https://cookpad.com/id/resep/25251748',
      description: 'URL resep Cookpad langsung',
    },
  ],

  handler: async (req, getInput) => {
    const q = getInput(req, 'q');
    const url = getInput(req, 'url');

    const rawParams = { q, url };
    const params = Object.fromEntries(
      Object.entries(rawParams).filter(([, v]) => v !== null && v !== undefined && v !== '')
    );

    try {
      const { data } = await axios.get(`${BASE_URL}/resep`, {
        params: { ...params, apikey: API_KEY },
        timeout: 20000,
        headers: { Accept: 'application/json', 'User-Agent': 'ElynnAPI/1.0' },
      });

      if (!data?.status) return { ok: false, status: 502, message: data?.message || 'Upstream API error.' };
      return { ok: true, result: data.data };
    } catch (err) {
      return { ok: false, status: 500, message: err.message || 'Internal server error.' };
    }
  },
};
