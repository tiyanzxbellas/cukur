'use strict';

const axios = require('axios');

module.exports = {
  id: 'sora-video-generator',
  name: 'Sora 2 Video Generator',
  path: '/api/ai/sora',
  method: 'GET',
  category: 'AI',
  description: 'Membuat video menggunakan AI Sora atau melakukan pengecekan status job video menggunakan jobId dan token.',
  params: [
    { name: 'action', required: true, example: 'generate' },
    { name: 'prompt', required: false, example: 'A cow in city' },
    { name: 'jobId', required: false, example: '6a2aad8d4e8d0cfa0dd77d3e' },
    { name: 'token', required: false, example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
  ],
  async handler(req, getInput, res) {
    const action = (getInput(req, 'action') || '').trim().toLowerCase();
    
    if (!action) {
      return {
        ok: false,
        status: 400,
        message: 'Parameter action diperlukan. Pilih antara "generate" atau "check".'
      };
    }

    if (action === 'generate') {
      const prompt = getInput(req, 'prompt');
      if (!prompt) {
        return {
          ok: false,
          status: 400,
          message: 'Parameter prompt diperlukan untuk action generate.'
        };
      }

      try {
        const targetUrl = `https://omegatech-api.dixonomega.tech/api/ai/Sora?action=generate&prompt=${encodeURIComponent(prompt)}&jobId=6a2aad224e8d0cfa0dd77d39&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YTJhYWQyMTRlOGQwY2ZhMGRkNzdkMzYiLCJpYXQiOjE3ODExODE3MjksImV4cCI6MTc4MTc4NjUyOX0.9a4cQDUU_BjgbC9-1TACVHUakRP8vcE0Ecj_wlEliwQ&wait=false`;
        
        const response = await axios.get(targetUrl, {
          timeout: 15000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Infinix X6831) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36'
          }
        });

        if (response.data && response.data.success) {
          return {
            ok: true,
            status: 200,
            action: response.data.action || 'generate',
            prompt: response.data.prompt || prompt,
            jobId: response.data.jobId,
            status_video: response.data.status || 'processing',
            progress: response.data.progress ?? 0,
            coinsCost: response.data.coinsCost,
            token: response.data.token,
            note: 'Gunakan action=check dengan jobId dan FULL token ini untuk melakukan polling URL video. Jangan memotong isi token.',
            createdAt: response.data.createdAt,
            timestamp: response.data.timestamp
          };
        } else {
          return {
            ok: false,
            status: response.status || 400,
            message: response.data?.message || 'Gagal memicu pembuatan video dari upstream.'
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

    if (action === 'check') {
      const jobId = getInput(req, 'jobId');
      const token = getInput(req, 'token');

      if (!jobId || !token) {
        return {
          ok: false,
          status: 400,
          message: 'Parameter jobId dan token wajib disertakan untuk melakukan check status.'
        };
      }

      try {
        const targetUrl = `https://omegatech-api.dixonomega.tech/api/ai/Sora?action=check&jobId=${encodeURIComponent(jobId)}&token=${encodeURIComponent(token)}`;
        
        const response = await axios.get(targetUrl, {
          timeout: 15000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Infinix X6831) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36'
          }
        });

        if (response.data) {
          return {
            ok: true,
            status: 200,
            ...response.data
          };
        } else {
          return {
            ok: false,
            status: response.status || 400,
            message: 'Gagal mengambil data check status dari upstream.'
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

    return {
      ok: false,
      status: 400,
      message: 'Action tidak dikenal. Gunakan "generate" atau "check".'
    };
  }
};
