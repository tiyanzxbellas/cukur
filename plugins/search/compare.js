'use strict';

const axios = require('axios');

const BASE_URL = 'https://api.neoxr.eu/api';
const API_KEY = 'yMb35i';

module.exports = {
  id:          'search-compare-detail',
  name: 'Compare Detail',
  category:    'Search',
  path:        '/api/search/compare',
  method: 'GET',
  description: 'Bandingkan dua perangkat secara detail (skor, spesifikasi, benchmark).',
  params: [
    { name: 'item1', required: true, example: 'Samsung Galaxy S24 Ultra', description: 'Perangkat pertama' },
    { name: 'item2', required: true, example: 'Apple iPhone 17 Pro Max', description: 'Perangkat kedua' },
    { name: 'type', required: false, example: 'phone', description: 'Tipe perangkat' }
  ],
  handler: async (req, res) => {
    const query = req.query || {};
    const item1 = query.item1 || null;
    const item2 = query.item2 || null;
    const type = query.type || null;
    if (!item1 || !item2) {
      return { ok: false, status: 400, message: 'Parameter wajib: item1, item2' };
    }
    const params = Object.fromEntries(Object.entries({ item1, item2, type }).filter(([_, v]) => v !== null && v !== undefined));
    try {
      const response = await axios.get(`${BASE_URL}/compare`, {
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
