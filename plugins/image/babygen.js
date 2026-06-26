// File: plugins/image/babygen.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'image-babygen',
  name:        'Babygen',
  category:    'Image',
  path:        '/api/image/babygen',
  method:      'GET',
  description: 'Generate baby image from parents',

  params: [
    {
      name: 'father',
      required: true,
      example: 'https://i.pinimg.com/1200x/37/45/d6/3745d6a88795eb713001d4131f1e9aeb.jpg',
      description: 'Input father',
    },
    {
      name: 'mother',
      required: true,
      example: 'https://i.pinimg.com/1200x/ae/a7/f6/aea7f6f126fce7cb074bd310ff643fe2.jpg',
      description: 'Input mother',
    },
    {
      name: 'gender',
      required: true,
      example: 'boy',
      description: 'Input gender',
    }
  ],

  handler: async (req, getInput, res) => {
    const father = getInput(req, 'father');
    const mother = getInput(req, 'mother');
    const gender = getInput(req, 'gender');
    if (!father) return { ok: false, status: 400, message: "Parameter 'father' wajib diisi." };
    if (!mother) return { ok: false, status: 400, message: "Parameter 'mother' wajib diisi." };
    if (!gender) return { ok: false, status: 400, message: "Parameter 'gender' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/babygen', {
        params: {
          father,
          mother,
          gender,
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
