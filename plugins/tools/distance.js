'use strict';

const axios = require('axios');

const NEOXR_BASE = 'https://api.neoxr.eu/api';
const NEOXR_KEY  = process.env.NEOXR_APIKEY || 'yMb35i';

module.exports = {
  id:          'tools-distance',
  name:        'Distance',
  category:    'Tools',
  path:        '/api/tools/distance',
  method:      'GET',
  description: 'Hitung jarak dan estimasi waktu perjalanan antar lokasi.',

  params: [
    { name: 'from', required: true, example: 'bandung', description: 'Lokasi asal' },
    { name: 'to', required: true, example: 'jakarta', description: 'Lokasi tujuan' },
    { name: 'by', required: false, example: 'car', description: 'Mode perjalanan (car, motorcycle, dll)' },
  ],

  handler: async (req, getInput) => {
    const from = getInput(req, 'from');
    const to   = getInput(req, 'to');
    const by   = getInput(req, 'by') || 'car';
    if (!from || !to) return { ok: false, status: 400, message: "Parameter 'from' dan 'to' wajib diisi." };

    try {
      const { data } = await axios.get(`${NEOXR_BASE}/distance`, {
        params:  { from, to, by, apikey: NEOXR_KEY },
        timeout: 25000,
        headers: { Accept: 'application/json', 'User-Agent': 'ElynnAPI/1.0' },
      });

      if (!data?.status) return { ok: false, status: 502, message: data?.message || 'Upstream API error.' };
      return { ok: true, result: data.data };
    } catch (err) {
      return { ok: false, status: 500, message: err?.message || 'Terjadi kesalahan internal.' };
    }
  },
};
