// File: plugins/tools/gsmarena-get.js
'use strict';

const axios = require('axios');

const BASE_URL = 'https://api.neoxr.eu/api';
const API_KEY  = 'yMb35i';

module.exports = {
  id:          'tools-gsmarena-get',
  name:        'GSMArena Detail',
  category:    'Tools',
  path:        '/api/tools/gsmarena-get',
  method:      'GET',
  description: 'GSMArena Detail via Neoxr API.',

  params: [
    {
      name:        'id',
      required:    true,
      example:     'b3Bwb19hM3MtOTI2OQ==',
      description: 'ID dari hasil GSMArena Search',
    },
  ],

  handler: async (req, getInput) => {
    const id = getInput(req, 'id');

    const missing = [];
    if (!id) missing.push('id');
    if (missing.length) return { ok: false, status: 400, message: `Parameter wajib: ${missing.join(', ')}` };

    const rawParams = { id };
    const params = Object.fromEntries(
      Object.entries(rawParams).filter(([, v]) => v !== null && v !== undefined && v !== '')
    );

    try {
      const { data } = await axios.get(`${BASE_URL}/gsmarena-get`, {
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
