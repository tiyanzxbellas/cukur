// File: plugins/primbon/nikah.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'primbon-nikah',
  name:        'Nikah',
  category:    'Primbon',
  path:        '/api/primbon/nikah',
  method:      'GET',
  description: 'Generate Nikah text image.',

  params: [
    {
      name: 'tanggal',
      required: true,
      example: '11',
      description: 'Input tanggal',
    },
    {
      name: 'bulan',
      required: true,
      example: '7',
      description: 'Input bulan',
    },
    {
      name: 'tahun',
      required: true,
      example: '2024',
      description: 'Input tahun',
    }
  ],

  handler: async (req, getInput, res) => {
    const tanggal = getInput(req, 'tanggal');
    const bulan = getInput(req, 'bulan');
    const tahun = getInput(req, 'tahun');
    if (!tanggal) return { ok: false, status: 400, message: "Parameter 'tanggal' wajib diisi." };
    if (!bulan) return { ok: false, status: 400, message: "Parameter 'bulan' wajib diisi." };
    if (!tahun) return { ok: false, status: 400, message: "Parameter 'tahun' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/nikah', {
        params: {
          tanggal,
          bulan,
          tahun,
          apikey: 'yMb35i',
        },
        timeout: 20000,
        headers: { Accept: 'application/json', 'User-Agent': 'ElynnAPI/1.0' },
      });

      if (!data?.status) return { ok: false, status: 502, message: data?.message || 'Upstream error.' };
      return { ok: true, result: data.data };
    } catch (err) {
      return { ok: false, status: 500, message: err.message || 'Internal server error.' };
    }
  },
};
