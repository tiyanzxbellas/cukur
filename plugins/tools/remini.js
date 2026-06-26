'use strict';

const axios = require('axios');

const NEOXR_BASE = 'https://api.neoxr.eu/api';
const NEOXR_KEY  = process.env.NEOXR_APIKEY || 'yMb35i';

module.exports = {
  id:          'tools-remini',
  name:        'Remini',
  category:    'Tools',
  path:        '/api/tools/remini',
  method:      'GET',
  description: 'Remini via Neoxr API.',

  params: [
    { name: 'image', required: true, example: 'https://telegra.ph/file/6e51933b965b7586bc096.jpg', description: 'URL gambar', isMedia: true, isImage: true },
  ],

  handler: async (req, getInput) => {
    const image = getInput(req, 'image');
    if (!image) return { ok: false, status: 400, message: "Parameter 'image' wajib diisi." };

    try {
      const { data } = await axios.get(`${NEOXR_BASE}/remini`, {
        params:  { image, apikey: NEOXR_KEY },
        timeout: 35000,
        headers: { Accept: 'application/json', 'User-Agent': 'ElynnAPI/1.0' },
      });

      if (!data?.status) return { ok: false, status: 502, message: data?.message || 'Upstream API error.' };
      return { ok: true, result: data.data };
    } catch (err) {
      return { ok: false, status: 500, message: err?.message || 'Terjadi kesalahan internal.' };
    }
  },
};
