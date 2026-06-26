// File: plugins/tools/pddikti.js
'use strict';

const axios = require('axios');

const BASE_URL = 'https://api.neoxr.eu/api';
const API_KEY  = 'yMb35i';

module.exports = {
  id:          'tools-pddikti',
  name:        'PDDIKTI Search',
  category:    'Tools',
  path:        '/api/tools/pddikti',
  method:      'GET',
  description: 'PDDIKTI Search via Neoxr API.',

  params: [
    {
      name:        'q',
      required:    true,
      example:     'jokowi',
      description: 'Nama mahasiswa atau dosen',
    },
    {
      name:        'type',
      required:    false,
      example:     'mahasiswa',
      description: 'Tipe: mahasiswa atau dosen',
    },
  ],

  handler: async (req, getInput) => {
    const q = getInput(req, 'q');
    const type = getInput(req, 'type');

    const missing = [];
    if (!q) missing.push('q');
    if (missing.length) return { ok: false, status: 400, message: `Parameter wajib: ${missing.join(', ')}` };

    const rawParams = { q, type };
    const params = Object.fromEntries(
      Object.entries(rawParams).filter(([, v]) => v !== null && v !== undefined && v !== '')
    );

    try {
      const { data } = await axios.get(`${BASE_URL}/pddikti`, {
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
