// File: plugins/islamic/quran-audio.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'islamic-quran-audio',
  name:        'Quran Audio (Full Surah)',
  category:    'Islamic',
  path:        '/api/islamic/quran-audio',
  method:      'GET',
  description: 'Mendapatkan audio dan teks lengkap suatu surah Al-Quran.',

  params: [
    { name: 'surah', required: true, example: '1', description: 'Nomor surah (1-114)' },
  ],

  handler: async (req, getInput, res) => {
    const surah = getInput(req, 'surah');
    if (!surah) return { ok: false, status: 400, message: "Parameter 'surah' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/quran-audio', {
        params:  { surah, apikey: 'yMb35i' },
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
