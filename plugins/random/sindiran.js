'use strict';

const axios = require('axios');

module.exports = {
  id:          'random-sindiran',
  name:        'Sindiran',
  category:    'Random',
  path:        '/api/random/sindiran',
  method:      'GET',
  description: 'Sindiran.',

  params: [],

  handler: async (req, getInput, res) => {
    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/sindiran', {
        params:  { apikey: 'yMb35i' },
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
