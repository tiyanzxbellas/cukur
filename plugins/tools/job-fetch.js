// File: plugins/tools/job-fetch.js
'use strict';

const axios = require('axios');

const BASE_URL = 'https://api.neoxr.eu/api';
const API_KEY  = 'yMb35i';

module.exports = {
  id:          'tools-job-fetch',
  name:        'Jobstreet Detail',
  category:    'Tools',
  path:        '/api/tools/job-fetch',
  method:      'GET',
  description: 'Jobstreet Detail via Neoxr API.',

  params: [
    {
      name:        'url',
      required:    true,
      example:     'https://id.jobstreet.com/id/job/89927569',
      description: 'URL lowongan kerja dari Jobstreet',
    },
  ],

  handler: async (req, getInput) => {
    const url = getInput(req, 'url');

    const missing = [];
    if (!url) missing.push('url');
    if (missing.length) return { ok: false, status: 400, message: `Parameter wajib: ${missing.join(', ')}` };

    const rawParams = { url };
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
