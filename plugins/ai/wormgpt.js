'use strict';

const axios = require('axios');

module.exports = {
  id: 'wormgpt-ai',
  name: 'WormGPT AI',
  path: '/api/ai/wormgpt',
  method: 'GET',
  category: 'AI',
  description: 'Berinteraksi dengan model WormGPT AI untuk menghasilkan respons teks alternatif berbasis gaya percakapan santai, kasual, bebas, dan tanpa restriksi struktural.',
  params: [
    { name: 'question', required: true, example: 'perkenalkan dirimu?' }
  ],
  async handler(req, getInput, res) {
    const question = getInput(req, 'question');

    if (question === undefined || question === null || String(question).trim() === '') {
      return {
        ok: false,
        status: 400,
        message: 'Parameter question mutlak dibutuhkan untuk mendapatkan respons balasan dari instruksi WormGPT AI.'
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
      const targetUrl = `https://api.cuki.biz.id/api/ai/wormgpt?apikey=cuki-x&question=${encodeURIComponent(question)}`;
      
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
          message: 'Permintaan ditolak. Batasan Rate Limit dari server upstream telah melampaui ambang batas maksimum.'
        };
      }

      if (response.data && response.data.status && response.data.data && response.data.data.response) {
        return {
          ok: true,
          status: 200,
          data: {
            question: question,
            response: response.data.data.response,
            chat_metadata: {
              chat_count: response.data.data.chat_count || 1,
              max_chat: response.data.data.max_chat || 20,
              source_creator: response.data.creator || 'cuki digital',
              timestamp: response.data.timestamp || new Date().toISOString()
            }
          }
        };
      } else {
        return {
          ok: false,
          status: response.status || 502,
          message: 'Struktur balasan dari server upstream tidak mengembalikan objek data atau teks respons WormGPT secara valid.'
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
