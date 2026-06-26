'use strict';

const axios = require('axios');

const NEOXR_BASE = 'https://api.neoxr.eu/api';
const NEOXR_KEY  = process.env.NEOXR_APIKEY || 'yMb35i';

module.exports = {
  id:          'info-sholat',
  name:        'Jadwal Sholat',
  category:    'Info',
  path:        '/api/info/sholat',
  method:      'GET',
  description: 'Ambil jadwal sholat berdasarkan nama kota / wilayah.',

  params: [
    { name: 'q', required: true, example: 'bandung', description: 'Nama kota / wilayah' },
  ],

  handler: async (req, getInput) => {
    const q = getInput(req, 'q');
    if (!q) return { ok: false, status: 400, message: "Parameter 'q' wajib diisi." };

    try {
      const { data } = await axios.get(`${NEOXR_BASE}/sholat`, {
        params:  { q, apikey: NEOXR_KEY },
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
