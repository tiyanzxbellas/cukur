'use strict';

const axios = require('axios');

const NEOXR_BASE = 'https://api.neoxr.eu/api';
const NEOXR_KEY  = process.env.NEOXR_APIKEY || 'yMb35i';

module.exports = {
  id:          'random-tempmail-read',
  name:        'Temp Mail Read',
  category:    'Random',
  path:        '/api/random/tempmail-read',
  method:      'GET',
  description: 'Baca inbox dari email temporary.',

  params: [
    { name: 'email', required: true, example: 'xupaxu2244@guysmail.com', description: 'Alamat email temporary' },
  ],

  handler: async (req, getInput) => {
    const email = getInput(req, 'email');
    if (!email) return { ok: false, status: 400, message: "Parameter 'email' wajib diisi." };

    try {
      const { data } = await axios.get(`${NEOXR_BASE}/tempmail-read`, {
        params:  { email, apikey: NEOXR_KEY },
        timeout: 20000,
        headers: { Accept: 'application/json', 'User-Agent': 'ElynnAPI/1.0' },
      });

      if (!data?.status) return { ok: false, status: 502, message: data?.message || 'Upstream API error.' };
      return { ok: true, result: data.data };
    } catch (err) {
      return { ok: false, status: 500, message: err?.message || 'Terjadi kesalahan internal.' };
    }
  },
};
