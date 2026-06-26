'use strict';

const axios = require('axios');

const BASE_URL = 'https://api.neoxr.eu/api';
const API_KEY = 'yMb35i';

module.exports = {
  id:          'search-bilibili',
  name: 'Bilibili Search',
  category:    'Search',
  path:        '/api/search/bilibili',
  method: 'GET',
  description: 'Cari anime atau konten di Bilibili.',
  params: [
    { name: 'q', required: true, example: 'naruto', description: 'Judul anime / konten yang dicari' }
  ],
  handler: async (req, res) => {
    const query = req.query || {};
    const q = query.q || null;
    if (!q) {
      return { ok: false, status: 400, message: 'Parameter wajib: q' };
    }
    const params = Object.fromEntries(Object.entries({ q }).filter(([_, v]) => v !== null && v !== undefined));
    try {
      const response = await axios.get(`${BASE_URL}/bilibili-search`, {
        params: {
          ...params,
          apikey: API_KEY
        },
        timeout: 20000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'ElynnAPI/1.0'
        }
      });

      const json = response.data;
      if (!json || !json.status) {
        return {
          ok: false,
          status: 502,
          message: json?.message || 'Upstream API error'
        };
      }

      return {
        ok: true,
        creator: 'elynn',
        data: json.data
      };
    } catch (err) {
      return {
        ok: false,
        status: 500,
        message: err.message || 'Internal server error'
      };
    }
  }
};
