// File: plugins/tools/iqc.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'tools-iqc',
  name:        'Iqc',
  category:    'Tools',
  path:        '/api/tools/iqc',
  method:      'GET',
  description: 'AI image quality check',

  params: [
    {
      name: 'text',
      required: true,
      example: 'ayo scroll fesnuk 😜',
      description: 'Input text',
    },
    {
      name: 'time',
      required: true,
      example: '12:40',
      description: 'Input time',
    },
    {
      name: 'chat_time',
      required: true,
      example: '10:15',
      description: 'Input chat_time',
    }
  ],

  handler: async (req, getInput, res) => {
    const text = getInput(req, 'text');
    const time = getInput(req, 'time');
    const chat_time = getInput(req, 'chat_time');
    if (!text) return { ok: false, status: 400, message: "Parameter 'text' wajib diisi." };
    if (!time) return { ok: false, status: 400, message: "Parameter 'time' wajib diisi." };
    if (!chat_time) return { ok: false, status: 400, message: "Parameter 'chat_time' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/iqc', {
        params: {
          text,
          time,
          chat_time,
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
