'use strict';

const axios = require('axios');

module.exports = {
  id: 'freefire-stalk',
  name: 'Free Fire Stalk',
  path: '/api/stalk/freefire',
  method: 'GET',
  category: 'Stalking',
  description: 'Mendapatkan data informasi akun Free Fire meliputi nickname, ID, level, status rank, regional, dan tanggal pembuatan akun berdasarkan UID.',
  params: [
    { name: 'uid', required: true, example: '246737885' }
  ],
  async handler(req, getInput, res) {
    const uid = getInput(req, 'uid');
    if (!uid) {
      return {
        ok: false,
        status: 400,
        message: 'Parameter uid diperlukan.'
      };
    }

    try {
      const targetUrl = `https://omegatech-api.dixonomega.tech/api/Stalk/Freefire?action=stalk&uid=${encodeURIComponent(uid)}`;
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
          message: 'UID Free Fire tidak ditemukan atau terjadi kesalahan pada upstream.'
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
