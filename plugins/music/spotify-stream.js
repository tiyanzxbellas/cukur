'use strict';

const axios = require('axios');

module.exports = {
  id:          'music-spotify-stream',
  name:        'Spotify Stream Proxy',
  category:    'Music',
  path:        '/api/music/spotify-stream',
  method:      'GET',
  description: 'Proxy audio stream dari Spotify via nexray (bypass CORS)',

  params: [
    {
      name: 'url',
      required: true,
      example: 'https://open.spotify.com/track/3qhlB30KknSejmIvZZLjOD',
      description: 'Spotify track URL',
    }
  ],

  handler: async (req, getInput, res) => {
    const url = getInput(req, 'url');
    if (!url) return { ok: false, status: 400, message: "Parameter 'url' wajib diisi." };

    try {
      // Step 1: fetch download url dari nexray
      const { data } = await axios.get('https://api.nexray.eu.cc/downloader/spotify', {
        params: { url },
        timeout: 25000,
        headers: { 'User-Agent': 'ElynnAPI/1.0' },
      });

      if (!data?.status || !data?.result?.url) {
        return { ok: false, status: 502, message: 'Gagal mendapatkan URL audio dari nexray.' };
      }

      const audioUrl = data.result.url;

      // Step 2: stream audio dari CDN ke client (bypass CORS)
      const audioRes = await axios.get(audioUrl, {
        responseType: 'stream',
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'audio/*,*/*',
          'Accept-Encoding': 'identity',
        },
        maxRedirects: 5,
      });

      const ct = audioRes.headers['content-type'] || 'audio/mpeg';
      const cl = audioRes.headers['content-length'];

      res.setHeader('Content-Type', ct);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'no-cache');
      if (cl) res.setHeader('Content-Length', cl);
      res.status(200);
      audioRes.data.pipe(res);

      // signal ke framework jangan handle response lagi
      return null;

    } catch (err) {
      return { ok: false, status: 500, message: err.message || 'Internal server error.' };
    }
  },
};
