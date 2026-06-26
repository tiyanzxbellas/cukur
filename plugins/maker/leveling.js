// File: plugins/maker/leveling.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'maker-leveling',
  name:        'Leveling',
  category:    'Maker',
  path:        '/api/maker/leveling',
  method:      'GET',
  description: 'Leveling card image',

  params: [
    {
      name: 'rank',
      required: true,
      example: '2',
      description: 'Input rank',
    },
    {
      name: 'level',
      required: true,
      example: '10',
      description: 'Input level',
    },
    {
      name: 'picture',
      required: true,
      example: 'https://telegra.ph/file/7cc74d27d652ae29ce2ca.jpg',
      description: 'Input picture',
      isImage: true,
      isMedia: true,
    },
    {
      name: 'currentXp',
      required: true,
      example: '7560',
      description: 'Input currentXp',
    },
    {
      name: 'requiredXp',
      required: true,
      example: '250',
      description: 'Input requiredXp',
    },
    {
      name: 'name',
      required: true,
      example: 'Jokowi',
      description: 'Input name',
    }
  ],

  handler: async (req, getInput, res) => {
    const rank = getInput(req, 'rank');
    const level = getInput(req, 'level');
    const picture = getInput(req, 'picture');
    const currentXp = getInput(req, 'currentXp');
    const requiredXp = getInput(req, 'requiredXp');
    const name = getInput(req, 'name');
    if (!rank) return { ok: false, status: 400, message: "Parameter 'rank' wajib diisi." };
    if (!level) return { ok: false, status: 400, message: "Parameter 'level' wajib diisi." };
    if (!picture) return { ok: false, status: 400, message: "Parameter 'picture' wajib diisi." };
    if (!currentXp) return { ok: false, status: 400, message: "Parameter 'currentXp' wajib diisi." };
    if (!requiredXp) return { ok: false, status: 400, message: "Parameter 'requiredXp' wajib diisi." };
    if (!name) return { ok: false, status: 400, message: "Parameter 'name' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/leveling', {
        params: {
          rank,
          level,
          picture,
          currentXp,
          requiredXp,
          name,
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
