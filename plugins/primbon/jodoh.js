// File: plugins/primbon/jodoh.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'primbon-jodoh',
  name:        'Jodoh',
  category:    'Primbon',
  path:        '/api/primbon/jodoh',
  method:      'GET',
  description: 'Generate Jodoh text image.',

  params: [
    {
      name: 'name1',
      required: true,
      example: 'jokowi',
      description: 'Input name1',
    },
    {
      name: 'name2',
      required: true,
      example: 'megawati',
      description: 'Input name2',
    }
  ],

  handler: async (req, getInput, res) => {
    const name1 = getInput(req, 'name1');
    const name2 = getInput(req, 'name2');
    if (!name1) return { ok: false, status: 400, message: "Parameter 'name1' wajib diisi." };
    if (!name2) return { ok: false, status: 400, message: "Parameter 'name2' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/jodoh', {
        params: {
          name1,
          name2,
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
