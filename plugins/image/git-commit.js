// File: plugins/image/git-commit.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'image-git-commit',
  name:        'Git-commit',
  category:    'Image',
  path:        '/api/image/git-commit',
  method:      'GET',
  description: 'Image of git commit',

  params: [
    {
      name: 'username',
      required: true,
      example: 'neoxr',
      description: 'Input username',
    },
    {
      name: 'repository',
      required: true,
      example: 'neoxr-bot',
      description: 'Input repository',
    }
  ],

  handler: async (req, getInput, res) => {
    const username = getInput(req, 'username');
    const repository = getInput(req, 'repository');
    if (!username) return { ok: false, status: 400, message: "Parameter 'username' wajib diisi." };
    if (!repository) return { ok: false, status: 400, message: "Parameter 'repository' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/git-commit', {
        params: {
          username,
          repository,
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
