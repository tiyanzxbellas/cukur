'use strict';

const axios = require('axios');

const NEOXR_BASE = 'https://api.neoxr.eu/api';
const NEOXR_KEY  = process.env.NEOXR_APIKEY || 'yMb35i';

module.exports = {
  id:          'tools-faceswap',
  name:        'Face Swap',
  category:    'Tools',
  path:        '/api/tools/faceswap',
  method:      'GET',
  description: 'Face Swap via Neoxr API.',

  params: [
    { name: 'source', required: true, example: 'https://i.pinimg.com/736x/18/ab/a5/18aba58f780da1d83f4e227c53aa4ea3.jpg', description: 'URL wajah sumber', isMedia: true, isImage: true },
    { name: 'target', required: true, example: 'https://i.pinimg.com/736x/1c/c7/37/1cc7377c5712d36904fd8e91ba521005.jpg', description: 'URL wajah target', isMedia: true, isImage: true },
  ],

  handler: async (req, getInput) => {
    const source = getInput(req, 'source');
    const target = getInput(req, 'target');
    if (!source || !target) return { ok: false, status: 400, message: "Parameter 'source' dan 'target' wajib diisi." };

    try {
      const { data } = await axios.get(`${NEOXR_BASE}/faceswap`, {
        params:  { source, target, apikey: NEOXR_KEY },
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
