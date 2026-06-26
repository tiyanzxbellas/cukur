'use strict';

const axios = require('axios');

module.exports = {
  id: 'youtube-stalk',
  name: 'YouTube Stalk',
  path: '/api/stalk/youtube',
  method: 'GET',
  category: 'Stalking',
  description: 'Mengambil metadata saluran YouTube, deskripsi, serta jumlah subscriber berdasarkan ID atau handle channel.',
  params: [
    { name: 'channel', required: true, example: 'Omegatech' }
  ],
  async handler(req, getInput, res) {
    const channel = getInput(req, 'channel');
    if (!channel) {
      return {
        ok: false,
        status: 400,
        message: 'Parameter channel diperlukan.'
      };
    }

    try {
      const targetUrl = `https://omegatech-api.dixonomega.tech/api/Stalk/Youtube?action=stalk&channel=${encodeURIComponent(channel)}`;
      const response = await axios.get(targetUrl, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Infinix X6831) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36'
        }
      });

      if (response.data && response.data.success && response.data.data) {
        return {
          ok: true,
          status: 200,
          data: response.data.data
        };
      } else {
        return {
          ok: false,
          status: response.status || 404,
          message: 'Channel YouTube tidak ditemukan atau terjadi kesalahan pada upstream.'
        };
      }
    } catch (error) {
      return {
        ok: false,
        status: error.response?.status || 500,
        message: error.response?.data?.message || error.message
      };
    }
  }
};
