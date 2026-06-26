// File: plugins/islamic/quran-verse.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'islamic-quran-verse',
  name:        'Quran (Ayat Tunggal)',
  category:    'Islamic',
  path:        '/api/islamic/quran',
  method:      'GET',
  description: 'Mendapatkan satu ayat Al-Quran berdasarkan surah dan nomor ayat.',

  params: [
    { name: 'surah', required: true, example: '114', description: 'Nomor surah (1-114)' },
    { name: 'verse', required: true, example: '2', description: 'Nomor ayat' },
  ],

  handler: async (req, getInput, res) => {
    const surah = getInput(req, 'surah');
    const verse = getInput(req, 'verse');
    if (!surah || !verse) return { ok: false, status: 400, message: "Parameter 'surah' dan 'verse' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/quran', {
        params:  { surah, verse, apikey: 'yMb35i' },
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
