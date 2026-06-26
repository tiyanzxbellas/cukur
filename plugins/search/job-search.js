// File: plugins/search/job-search.js
'use strict';

const axios = require('axios');

const BASE_URL = 'https://api.neoxr.eu/api';
const API_KEY  = 'yMb35i';

module.exports = {
  id:          'search-job',
  name:        'Jobstreet Search',
  category:    'Search',
  path:        '/api/search/job',
  method:      'GET',
  description: 'Jobstreet Search via Neoxr API.',

  params: [
    {
      name:        'q',
      required:    true,
      example:     'programmer',
      description: 'Query pencarian lowongan kerja di Jobstreet',
    },
  ],

  handler: async (req, getInput) => {
    const q = getInput(req, 'q');

    const missing = [];
    if (!q) missing.push('q');
    if (missing.length) return { ok: false, status: 400, message: `Parameter wajib: ${missing.join(', ')}` };

    const rawParams = { q };
    const params = Object.fromEntries(
      Object.entries(rawParams).filter(([, v]) => v !== null && v !== undefined && v !== '')
    );

    try {
      const { data } = await axios.get(`${BASE_URL}/job`, {
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
