// File: plugins/tools/pdf2docx.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'tools-pdf2docx',
  name:        'Pdf2docx',
  category:    'Tools',
  path:        '/api/tools/pdf2docx',
  method:      'GET',
  description: 'PDF to Word converter',

  params: [
    {
      name: 'url',
      required: true,
      example: 'https://cdn.neoxr.my.id/assets/file/example.pdf',
      description: 'Input url',
    },
    {
      name: 'filename',
      required: true,
      example: 'example',
      description: 'Input filename',
      isMedia: true,
    },
    {
      name: 'to',
      required: true,
      example: 'docx',
      description: 'Input to',
    }
  ],

  handler: async (req, getInput, res) => {
    const url = getInput(req, 'url');
    const filename = getInput(req, 'filename');
    const to = getInput(req, 'to');
    if (!url) return { ok: false, status: 400, message: "Parameter 'url' wajib diisi." };
    if (!filename) return { ok: false, status: 400, message: "Parameter 'filename' wajib diisi." };
    if (!to) return { ok: false, status: 400, message: "Parameter 'to' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/pdf2docx', {
        params: {
          url,
          filename,
          to,
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
