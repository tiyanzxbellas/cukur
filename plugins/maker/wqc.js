// File: plugins/maker/wqc.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'maker-wqc',
  name:        'Wqc',
  category:    'Maker',
  path:        '/api/maker/wqc',
  method:      'GET',
  description: 'Chat-style image generator',

  params: [
    {
      name: 'name',
      required: true,
      example: 'Mark Zuckerberg',
      description: 'Input name',
    },
    {
      name: 'number',
      required: true,
      example: ' 62 851-1111-1111',
      description: 'Input number',
    },
    {
      name: 'avatar',
      required: true,
      example: 'https://i.pinimg.com/736x/81/57/49/815749f7111a7c5bb91cb64758ae5f42.jpg',
      description: 'Input avatar',
      isImage: true,
      isMedia: true,
    },
    {
      name: 'verified',
      required: true,
      example: 'true',
      description: 'Input verified',
    },
    {
      name: 'message',
      required: true,
      example: 'To be honest, it’s not funny {tag}@neoxr{/tag} 😡😡, it’s a *complete violation of my privacy* and a total _disregard_ for my consent.',
      description: 'Input message',
    },
    {
      name: 'time',
      required: true,
      example: '14.25',
      description: 'Input time',
    },
    {
      name: 'quoted',
      required: true,
      example: '{"name":"neoxr","verified":false,"number":" 62 898-7654-3210","message":"Fuck you ✨","imageUrl":null}',
      description: 'Input quoted',
    },
    {
      name: 'reaction',
      required: true,
      example: '{"emoji":["😐","🤪","😰","💀"],"count":"29225"}',
      description: 'Input reaction',
    },
    {
      name: 'mode',
      required: true,
      example: 'dark',
      description: 'Input mode',
    }
  ],

  handler: async (req, getInput, res) => {
    const name = getInput(req, 'name');
    const number = getInput(req, 'number');
    const avatar = getInput(req, 'avatar');
    const verified = getInput(req, 'verified');
    const message = getInput(req, 'message');
    const time = getInput(req, 'time');
    const quoted = getInput(req, 'quoted');
    const reaction = getInput(req, 'reaction');
    const mode = getInput(req, 'mode');
    if (!name) return { ok: false, status: 400, message: "Parameter 'name' wajib diisi." };
    if (!number) return { ok: false, status: 400, message: "Parameter 'number' wajib diisi." };
    if (!avatar) return { ok: false, status: 400, message: "Parameter 'avatar' wajib diisi." };
    if (!verified) return { ok: false, status: 400, message: "Parameter 'verified' wajib diisi." };
    if (!message) return { ok: false, status: 400, message: "Parameter 'message' wajib diisi." };
    if (!time) return { ok: false, status: 400, message: "Parameter 'time' wajib diisi." };
    if (!quoted) return { ok: false, status: 400, message: "Parameter 'quoted' wajib diisi." };
    if (!reaction) return { ok: false, status: 400, message: "Parameter 'reaction' wajib diisi." };
    if (!mode) return { ok: false, status: 400, message: "Parameter 'mode' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/wqc', {
        params: {
          name,
          number,
          avatar,
          verified,
          message,
          time,
          quoted,
          reaction,
          mode,
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
