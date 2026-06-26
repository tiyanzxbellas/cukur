// File: plugins/info/bola-league.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'info-bola-league',
  name:        'Bola-league',
  category:    'Info',
  path:        '/api/info/bola-league',
  method:      'GET',
  description: 'Football leagues info',

  params: [
    {
      name: 'league',
      required: true,
      example: 'champions',
      description: 'Input league',
    }
  ],

  handler: async (req, getInput, res) => {
    const league = getInput(req, 'league');
    if (!league) return { ok: false, status: 400, message: "Parameter 'league' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/bola-league', {
        params: {
          league,
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
