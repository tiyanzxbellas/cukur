'use strict';

const axios = require('axios');

const NEOXR_BASE = 'https://api.neoxr.eu/api';
const NEOXR_KEY  = process.env.NEOXR_APIKEY || 'yMb35i';

module.exports = {
  id:          'tools-cekresi',
  name:        'Cek Resi',
  category:    'Tools',
  path:        '/api/tools/cekresi',
  method:      'GET',
  description: 'Cek status pengiriman paket berdasarkan nomor resi dan ekspedisi.',

  params: [
    { name: 'resi', required: true, example: 'SPXID05417299871C', description: 'Nomor resi' },
    { name: 'ekspedisi', required: true, example: 'spx', description: 'Nama ekspedisi (spx, jne, jnt, dll)' },
  ],

  handler: async (req, getInput) => {
    const resi      = getInput(req, 'resi');
    const ekspedisi = getInput(req, 'ekspedisi');
    if (!resi || !ekspedisi) return { ok: false, status: 400, message: "Parameter 'resi' dan 'ekspedisi' wajib diisi." };

    try {
      const { data } = await axios.get(`${NEOXR_BASE}/cekresi`, {
        params:  { resi, ekspedisi, apikey: NEOXR_KEY },
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
