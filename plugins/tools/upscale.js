'use strict';

const axios = require('axios');

const NEOXR_BASE = 'https://api.neoxr.eu/api';
const NEOXR_KEY  = process.env.NEOXR_APIKEY || 'yMb35i';

module.exports = {
  id:          'tools-upscale',
  name:        'Upscale',
  category:    'Tools',
  path:        '/api/tools/upscale',
  method:      'GET',
  description: 'Upscale via Neoxr API.',

  params: [
    { name: 'image', required: true, example: 'https://telegra.ph/file/76a2068122ed32c2c9b17.jpg', description: 'URL gambar', isMedia: true, isImage: true },
  ],

  handler: async (req, getInput) => {
    const image = getInput(req, 'image');
    if (!image) return { ok: false, status: 400, message: "Parameter 'image' wajib diisi." };

    try {
      const { data } = await axios.get(`${NEOXR_BASE}/upscale`, {
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
