'use strict';

const axios = require('axios');

const NEOXR_BASE = 'https://api.neoxr.eu/api';
const NEOXR_KEY  = process.env.NEOXR_APIKEY || 'yMb35i';

module.exports = {
  id:          'tools-whatmusic',
  name:        'WhatMusic',
  category:    'Tools',
  path:        '/api/tools/whatmusic',
  method:      'GET',
  description: 'Identifikasi musik dari URL audio.',

  params: [
    { name: 'url', required: true, example: 'https://cdn.neoxr.eu/audio/song.mp3', description: 'URL audio', isMedia: true, isAudio: true },
  ],

  handler: async (req, getInput) => {
    const url = getInput(req, 'url');
    if (!url) return { ok: false, status: 400, message: "Parameter 'url' wajib diisi." };

    try {
      const { data } = await axios.get(`${NEOXR_BASE}/whatmusic`, {
        params:  { url, apikey: NEOXR_KEY },
        timeout: 30000,
        headers: { Accept: 'application/json', 'User-Agent': 'ElynnAPI/1.0' },
      });

      if (!data?.status) return { ok: false, status: 502, message: data?.message || 'Upstream API error.' };
      return { ok: true, result: data.data };
    } catch (err) {
      return { ok: false, status: 500, message: err?.message || 'Terjadi kesalahan internal.' };
    }
  },
};
