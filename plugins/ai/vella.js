'use strict';

const axios = require('axios');

module.exports = {
  id: 'vella-ai',
  name: 'Vella AI Persona Assistant',
  path: '/api/ai/vella',
  method: 'GET',
  category: 'AI',
  description: 'Mengirimkan instruksi interaktif ke model Vella AI untuk menghasilkan kompilasi teks dengan gaya bahasa gaul, sarkastik, kasual, dan ekspresif.',
  params: [
    { name: 'question', required: true, example: 'halo, kamu siapa?' }
  ],
  async handler(req, getInput, res) {
    const question = getInput(req, 'question');

    if (question === undefined || question === null || String(question).trim() === '') {
      return {
        ok: false,
        status: 400,
        message: 'Parameter question mutlak dibutuhkan untuk memicu pemrosesan data oleh Vella AI.'
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
      const targetUrl = `https://api.cuki.biz.id/api/ai/vella?apikey=cuki-x&question=${encodeURIComponent(question)}`;
      
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
          message: 'Upstream server menolak koneksi karena batas kuota penayangan request (Rate Limit Exceeded).'
        };
      }

      if (response.data && response.data.status && response.data.data && response.data.data.response) {
        return {
          ok: true,
          status: 200,
          data: {
            user_question: question,
            ai_response: response.data.data.response,
            session: {
              current_chat: response.data.data.chat_count || 2,
              allocation_limit: response.data.data.max_chat || 20,
              provider: response.data.creator || 'cuki digital',
              sync_time: response.data.timestamp || new Date().toISOString()
            }
          }
        };
      } else {
        return {
          ok: false,
          status: response.status || 502,
          message: 'Gagal mengekstrak konten data. Struktur respons dari sistem penyedia Vella AI tidak kompatibel atau kosong.'
        };
      }
    } catch (error) {
      return {
        ok: false,
        status: error.response?.status || 500,
        message: error.response?.data?.message || error.message || 'Transmisi paket data gagal akibat pemutusan koneksi sepihak oleh jaringan lokal atau remote host.'
      };
    }
  }
};
