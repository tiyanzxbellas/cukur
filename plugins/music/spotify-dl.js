'use strict';

const axios = require('axios');

module.exports = {
  id:          'music-spotify-dl',
  name:        'Spotify Downloader',
  category:    'Music',
  path:        '/api/music/spotify-dl',
  method:      'GET',
  description: 'Get audio URL dari Spotify track',

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
      const { data } = await axios.get('https://api.nexray.eu.cc/downloader/spotify', {
        params: { url },
        timeout: 25000,
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });

      if (!data?.status || !data?.result?.url) {
        return { ok: false, status: 502, message: 'Gagal mendapatkan URL audio.' };
      }

      return {
        ok: true,
        title: data.result.title,
        artist: data.result.artist,
        audio_url: data.result.url,
      };

    } catch (err) {
      return { ok: false, status: 500, message: err.message || 'Internal server error.' };
    }
  },
};
