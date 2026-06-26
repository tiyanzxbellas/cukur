// File: plugins/tools/pddikti-fetch.js
'use strict';

const axios = require('axios');

const BASE_URL = 'https://api.neoxr.eu/api';
const API_KEY  = 'yMb35i';

module.exports = {
  id:          'tools-pddikti-fetch',
  name:        'PDDIKTI Detail',
  category:    'Tools',
  path:        '/api/tools/pddikti-fetch',
  method:      'GET',
  description: 'PDDIKTI Detail via Neoxr API.',

  params: [
    {
      name:        'id',
      required:    true,
      example:     'cxjy4jBL1aw...',
      description: 'ID dari hasil PDDIKTI Search',
    },
    {
      name:        'type',
      required:    true,
      example:     'mahasiswa',
      description: 'Tipe: mahasiswa atau dosen',
    },
  ],

  handler: async (req, getInput) => {
    const id = getInput(req, 'id');
    const type = getInput(req, 'type');

    const missing = [];
    if (!id) missing.push('id');
    if (!type) missing.push('type');
    if (missing.length) return { ok: false, status: 400, message: `Parameter wajib: ${missing.join(', ')}` };

    const rawParams = { id, type };
    const params = Object.fromEntries(
      Object.entries(rawParams).filter(([, v]) => v !== null && v !== undefined && v !== '')
    );

    try {
      const { data } = await axios.get(`${BASE_URL}/pddikti-fetch`, {
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
