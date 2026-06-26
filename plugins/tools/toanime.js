'use strict';

const axios = require('axios');

const NEOXR_BASE = 'https://api.neoxr.eu/api';
const NEOXR_KEY  = process.env.NEOXR_APIKEY || 'yMb35i';

module.exports = {
  id:          'tools-toanime',
  name:        'To Anime',
  category:    'Tools',
  path:        '/api/tools/toanime',
  method:      'GET',
  description: 'To Anime via Neoxr API.',

  params: [
    { name: 'image', required: true, example: 'https://i.pinimg.com/736x/ce/d3/f6/ced3f60e524c26e354f87a38d7bf06be.jpg', description: 'URL gambar', isMedia: true, isImage: true },
  ],

  handler: async (req, getInput) => {
    const image = getInput(req, 'image');
    if (!image) return { ok: false, status: 400, message: "Parameter 'image' wajib diisi." };

    try {
      const { data } = await axios.get(`${NEOXR_BASE}/toanime`, {
        params:  { image, apikey: NEOXR_KEY },
        timeout: 30000,
        headers: { Accept: 'application/json', 'User-Agent': 'ElynnAPI/1.0' },
      });

      if (!data?.status) return { ok: false, status: 502, message: data?.message || 'Upstream API error.' };
      return { ok: true, result: data.data };
    } catch (err) {
      return { ok: false, status: 500, message: err?.message || 'Terjadi kesalahan internal.' };
    }
  },
};
