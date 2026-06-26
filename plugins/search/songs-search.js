'use strict';

const axios = require('axios');

module.exports = {
  id: 'search-that-song',
  name: 'Search That Song',
  path: '/api/search/searchthatsong',
  method: 'GET',
  category: 'Search',
  description: 'Mencari informasi detail lagu beserta lirik, preview audio, dan artwork berdasarkan kata kunci pencarian.',
  params: [
    { name: 'query', required: true, example: 'Alone' }
  ],
  async handler(req, getInput, res) {
    const query = getInput(req, 'query');
    if (!query) {
      return {
        ok: false,
        status: 400,
        message: 'Parameter query diperlukan.'
      };
    }

    try {
      const targetUrl = `https://omegatech-api.dixonomega.tech/api/Search/searchthatsong?action=search&query=${encodeURIComponent(query)}`;
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
          message: 'Lagu tidak ditemukan atau terjadi kesalahan pada upstream.'
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
