// File: plugins/islamic/muslim-central-latest-podcast.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'islamic-muslim-central-latest-podcast',
  name:        'Muslim Central Latest Podcast',
  category:    'Islamic',
  path:        '/api/islamic/muslim-central-latest-podcast',
  method:      'GET',
  description: 'Daftar pembicara terbaru berdasarkan gender (male/female).',

  params: [
    { name: 'type', required: false, example: 'male', description: 'Gender: male atau female (default: male)' },
  ],

  handler: async (req, getInput, res) => {
    const type = getInput(req, 'type') || 'male';

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/muslim-central-latest-podcast', {
        params:  { type, apikey: 'yMb35i' },
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
