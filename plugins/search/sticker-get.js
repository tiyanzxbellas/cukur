'use strict';

const axios = require('axios');

const BASE_URL = 'https://api.neoxr.eu/api';
const API_KEY = 'yMb35i';

module.exports = {
  id:          'search-sticker-get',
  name: 'Sticker Get',
  category:    'Search',
  path:        '/api/search/sticker-get',
  method: 'GET',
  description: 'Ambil semua gambar/GIF dari sebuah sticker pack.',
  params: [
    { name: 'url', required: true, example: 'https://getstickerpack.com/stickers/brown-bear', description: 'URL sticker pack dari GetStickerPack' }
  ],
  handler: async (req, res) => {
    const query = req.query || {};
    const url = query.url || null;
    if (!url) {
      return { ok: false, status: 400, message: 'Parameter wajib: url' };
    }
    const params = Object.fromEntries(Object.entries({ url }).filter(([_, v]) => v !== null && v !== undefined));
    try {
      const response = await axios.get(`${BASE_URL}/sticker-get`, {
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
