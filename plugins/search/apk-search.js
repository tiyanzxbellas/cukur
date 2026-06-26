'use strict';

const axios = require('axios');

const BASE_URL = 'https://api.neoxr.eu/api';
const API_KEY = 'yMb35i';

module.exports = {
  id:          'search-apk',
  name: 'APK Search',
  category:    'Search',
  path:        '/api/search/apk',
  method: 'GET',
  description: 'Cari APK dari 9Apps. Tambahkan &no=1 untuk detail + link download APK.',
  params: [
    { name: 'q', required: true, example: 'whatsapp', description: 'Nama aplikasi yang dicari' },
    { name: 'no', required: false, example: '1', description: 'Nomor urut untuk detail + link download' }
  ],
  handler: async (req, res) => {
    const query = req.query || {};
    const q = query.q || null;
    const no = query.no || null;
    if (!q) {
      return { ok: false, status: 400, message: 'Parameter wajib: q' };
    }
    const params = Object.fromEntries(Object.entries({ q, no }).filter(([_, v]) => v !== null && v !== undefined));
    try {
      const response = await axios.get(`${BASE_URL}/apk`, {
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
        data: json.data, ...(json.file ? { file: json.file } : {})
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
