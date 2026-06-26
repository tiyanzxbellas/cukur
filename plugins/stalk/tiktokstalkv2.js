'use strict';

const axios = require('axios');

module.exports = {
  id: 'tiktok-stalkv2',
  name: 'TikTok StalkV2',
  path: '/api/stalk/tiktokstalkv2',
  method: 'GET',
  category: 'Stalking',
  description: 'Mengambil informasi profil publik, metrik statistik, dan biodata pengguna TikTok berdasarkan username.',
  params: [
    { name: 'username', required: true, example: 'lonely_world01' }
  ],
  async handler(req, getInput, res) {
    const username = getInput(req, 'username');
    if (!username) {
      return {
        ok: false,
        status: 400,
        message: 'Parameter username diperlukan.'
      };
    }

    try {
      const targetUrl = `https://omegatech-api.dixonomega.tech/api/Stalk/Tiktok?action=stalk&username=${encodeURIComponent(username)}`;
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
          message: 'Username TikTok tidak ditemukan atau terjadi kesalahan pada upstream.'
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
