// File: plugins/islamic/muslim-central-search.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'islamic-muslim-central-search',
  name:        'Muslim Central Search',
  category:    'Islamic',
  path:        '/api/islamic/muslim-central-search',
  method:      'GET',
  description: 'Mencari episode podcast dari Muslim Central berdasarkan kata kunci.',

  params: [
    { name: 'q', required: true, example: 'riba', description: 'Kata kunci pencarian' },
    { name: 'type', required: false, example: 'episodes', description: 'Tipe pencarian (episodes, speakers, dll)' },
  ],

  handler: async (req, getInput, res) => {
    const q = getInput(req, 'q');
    if (!q) return { ok: false, status: 400, message: "Parameter 'q' wajib diisi." };
    const type = getInput(req, 'type') || 'episodes';

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/muslim-central-search', {
        params:  { q, type, apikey: 'yMb35i' },
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
