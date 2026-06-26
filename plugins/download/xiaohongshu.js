// File: plugins/download/xiaohongshu.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'download-xiaohongshu',
  name:        'Xiaohongshu',
  category:    'Download',
  path:        '/api/download/xiaohongshu',
  method:      'GET',
  description: 'Xiaohongshu post image',

  params: [
    {
      name: 'url',
      required: true,
      example: 'https://www.xiaohongshu.com/explore/69232ed3000000001e0399ce?xsec_token=ABJ_hgngDh8pupzwAZDlWG5p8aYeu-gDCSJsv5FIhKEng=&xsec_source=pc_feed',
      description: 'Input url',
    }
  ],

  handler: async (req, getInput, res) => {
    const url = getInput(req, 'url');
    if (!url) return { ok: false, status: 400, message: "Parameter 'url' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/xiaohongshu', {
        params: {
          url,
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
