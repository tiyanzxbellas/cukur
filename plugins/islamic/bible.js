// File: plugins/islamic/bible.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'islamic-bible',
  name:        'Alkitab (Perjanjian Lama)',
  category:    'Islamic',
  path:        '/api/islamic/bible',
  method:      'GET',
  description: 'Mendapatkan pasal Alkitab berdasarkan kitab dan chapter.',

  params: [
    { name: 'book', required: true, example: 'Kejadian', description: 'Nama kitab' },
    { name: 'chapter', required: true, example: '1', description: 'Nomor pasal' },
  ],

  handler: async (req, getInput, res) => {
    const book = getInput(req, 'book');
    const chapter = getInput(req, 'chapter');
    if (!book || !chapter) return { ok: false, status: 400, message: "Parameter 'book' dan 'chapter' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/bible', {
        params:  { book, chapter, apikey: 'yMb35i' },
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
