'use strict';

const axios = require('axios');

const NEOXR_BASE = 'https://api.neoxr.eu/api';
const NEOXR_KEY  = process.env.NEOXR_APIKEY || 'yMb35i';

module.exports = {
  id:          'info-cuaca',
  name:        'Cuaca',
  category:    'Info',
  path:        '/api/info/cuaca',
  method:      'GET',
  description: 'Cek cuaca berdasarkan nama subdistrict.',

  params: [
    { name: 'subdistrict', required: true, example: 'batang', description: 'Nama subdistrict / kecamatan' },
  ],

  handler: async (req, getInput) => {
    const subdistrict = getInput(req, 'subdistrict');
    if (!subdistrict) return { ok: false, status: 400, message: "Parameter 'subdistrict' wajib diisi." };

    try {
      const { data } = await axios.get(`${NEOXR_BASE}/cuaca`, {
        params:  { subdistrict, apikey: NEOXR_KEY },
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
