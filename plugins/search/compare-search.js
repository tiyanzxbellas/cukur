'use strict';

const axios = require('axios');

const BASE_URL = 'https://api.neoxr.eu/api';
const API_KEY = 'yMb35i';

module.exports = {
  id:          'search-compare',
  name: 'Compare Search',
  category:    'Search',
  path:        '/api/search/compare-search',
  method: 'GET',
  description: 'Cari perangkat untuk dibandingkan (phone, laptop, dll) via NanoReview.',
  params: [
    { name: 'q', required: true, example: 'samsung s24', description: 'Nama perangkat yang dicari' },
    { name: 'type', required: false, example: 'phone', description: 'Tipe perangkat (phone, laptop, dll)' }
  ],
  handler: async (req, res) => {
    const query = req.query || {};
    const q = query.q || null;
    const type = query.type || null;
    if (!q) {
      return { ok: false, status: 400, message: 'Parameter wajib: q' };
    }
    const params = Object.fromEntries(Object.entries({ q, type }).filter(([_, v]) => v !== null && v !== undefined));
    try {
      const response = await axios.get(`${BASE_URL}/compare-search`, {
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
