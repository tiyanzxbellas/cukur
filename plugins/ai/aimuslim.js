'use strict';

const axios = require('axios');

module.exports = {
  id: 'ai-muslim',
  name: 'AI Muslim Assistant',
  path: '/api/ai/aimuslim',
  method: 'GET',
  category: 'AI',
  description: 'Mendapatkan informasi, penjelasan, dan jawaban komprehensif mengenai ajaran, hukum, ibadah, dan konsep dalam agama Islam menggunakan integrasi kecerdasan buatan.',
  params: [
    { name: 'query', required: true, example: 'apa itu sholat' }
  ],
  async handler(req, getInput, res) {
    const query = getInput(req, 'query');

    if (query === undefined || query === null || String(query).trim() === '') {
      return {
        ok: false,
        status: 400,
        message: 'Parameter query mutlak dibutuhkan untuk memproses pencarian asisten AI Muslim.'
      };
    }

    const browserUserAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Linux; Android 13; Infinix X6831) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0'
    ];

    const generateRandomIP = () => {
      const octet1 = Math.floor(Math.random() * (255 - 11 + 1)) + 11;
      const octet2 = Math.floor(Math.random() * 255);
      const octet3 = Math.floor(Math.random() * 255);
      const octet4 = Math.floor(Math.random() * 255);
      return `${octet1}.${octet2}.${octet3}.${octet4}`;
    };

    const requestHeaders = {
      'User-Agent': browserUserAgents[Math.floor(Math.random() * browserUserAgents.length)],
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      'X-Forwarded-For': generateRandomIP(),
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Connection': 'keep-alive'
    };

    try {
      const targetUrl = `https://api.cuki.biz.id/api/ai/aimuslim?apikey=cuki-x&query=${encodeURIComponent(query)}`;
      
      const response = await axios.get(targetUrl, {
        headers: requestHeaders,
        timeout: 20000,
        maxRedirects: 5,
        validateStatus: (status) => status >= 200 && status < 500
      });

      if (response.status === 429) {
        return {
          ok: false,
          status: 429,
          message: 'IP host pembaca sedang dibatasi oleh sistem proteksi upstream karena limitasi kuota penayangan.'
        };
      }

      if (response.data && response.data.results) {
        return {
          ok: true,
          status: 200,
          data: {
            query: query,
            answer: response.data.results,
            upstream_metadata: {
              source_creator: response.data.creator || 'cuki digital',
              response_code: response.data.statusCode || response.status,
              execution_time: response.data.timestamp || new Date().toISOString()
            }
          }
        };
      } else {
        return {
          ok: false,
          status: response.status || 502,
          message: 'Struktur balasan dari server upstream tidak mengembalikan objek data atau teks hasil kompilasi AI secara valid.'
        };
      }
    } catch (error) {
      return {
        ok: false,
        status: error.response?.status || 500,
        message: error.response?.data?.message || error.message || 'Koneksi menuju server upstream terputus atau mengalami kegagalan transmisi paket data.'
      };
    }
  }
};
