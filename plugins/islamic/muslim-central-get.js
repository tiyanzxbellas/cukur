// File: plugins/islamic/muslim-central-get.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'islamic-muslim-central-get',
  name:        'Muslim Central Detail',
  category:    'Islamic',
  path:        '/api/islamic/muslim-central-get',
  method:      'GET',
  description: 'Mendapatkan detail suatu seri/playlist dari Muslim Central berdasarkan URL.',

  params: [
    { name: 'url', required: true, example: 'https://muslimcentral.com/series/mohammad-qutub-compiling-the-quran-and-bible', description: 'URL lengkap seri podcast' },
  ],

  handler: async (req, getInput, res) => {
    let url = getInput(req, 'url');
    if (!url) return { ok: false, status: 400, message: "Parameter 'url' wajib diisi." };
    url = encodeURIComponent(url);

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/muslim-central-get', {
        params:  { url, apikey: 'yMb35i' },
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
