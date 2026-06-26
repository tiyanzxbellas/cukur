// File: plugins/maker/nulis.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'maker-nulis',
  name:        'Nulis',
  category:    'Maker',
  path:        '/api/maker/nulis',
  method:      'GET',
  description: 'Handwritten text image',

  params: [
    {
      name: 'text',
      required: true,
      example: 'Node.js adalah sebuah platform runtime JavaScript yang dibangun di atas engine JavaScript V8 dari Google Chrome. Node.js memungkinkan Anda untuk menjalankan kode JavaScript di sisi server dan digunakan secara luas untuk membangun aplikasi web dan backend. Node.js juga memiliki kemampuan untuk melakukan operasi input/output secara asinkron, sehingga sangat cocok untuk aplikasi yang membutuhkan koneksi jaringan atau operasi disk yang intensif.',
      description: 'Input text',
    }
  ],

  handler: async (req, getInput, res) => {
    const text = getInput(req, 'text');
    if (!text) return { ok: false, status: 400, message: "Parameter 'text' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/nulis', {
        params: {
          text,
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
