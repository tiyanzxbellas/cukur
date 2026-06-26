'use strict';

const axios = require('axios');

module.exports = {
  id: 'magic-image-generator',
  name: 'Magic Image',
  path: '/api/ai/image/magic',
  method: 'GET',
  category: 'AI',
  description: 'Membuat gambar kreatif secara otomatis dari instruksi teks yang Anda masukkan.',
  params: [
    { name: 'prompt', required: true, example: 'buatkan foto cewe' }
  ],
  async handler(req, getInput, res) {
    const prompt = getInput(req, 'prompt');

    if (prompt === undefined || prompt === null || String(prompt).trim() === '') {
      return {
        ok: false,
        status: 400,
        message: 'Parameter prompt mutlak dibutuhkan untuk memicu generator pembuatan gambar AI Magic.'
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
      'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      'X-Forwarded-For': generateRandomIP(),
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Connection': 'keep-alive'
    };

    try {
      const targetUrl = `https://api.cuki.biz.id/api/ai/image/magic?apikey=cuki-x&prompt=${encodeURIComponent(prompt)}`;
      
      const response = await axios.get(targetUrl, {
        headers: requestHeaders,
        responseType: 'arraybuffer',
        timeout: 35000,
        maxRedirects: 5,
        validateStatus: (status) => status >= 200 && status < 500
      });

      if (response.status === 429) {
        return {
          ok: false,
          status: 429,
          message: 'Permintaan pembuatan gambar ditolak karena batas limitasi sistem upstream telah terlampaui.'
        };
      }

      const contentType = response.headers['content-type'] || '';
      
      if (response.status === 200 && contentType.startsWith('image/')) {
        const imageBuffer = Buffer.from(response.data);
        const base64Image = imageBuffer.toString('base64');
        const dataUrl = `data:${contentType};base64,${base64Image}`;

        return {
          ok: true,
          status: 200,
          data: {
            prompt: prompt,
            mime_type: contentType,
            size_bytes: imageBuffer.length,
            image_render: dataUrl,
            generation_metadata: {
              engine: 'Magic AI Generator',
              provider: 'Elynn',
              resolved_at: new Date().toISOString()
            }
          }
        };
      } else {
        let errorBodyString = 'Unknown stream exception';
        try {
          errorBodyString = Buffer.from(response.data).toString('utf-8');
        } catch (e) {}

        return {
          ok: false,
          status: response.status || 502,
          message: 'Upstream server gagal memproses gambar atau mengembalikan format non-image payload.',
          error_details: errorBodyString.slice(0, 200)
        };
      }
    } catch (error) {
      return {
        ok: false,
        status: error.response?.status || 500,
        message: error.response?.data?.message || error.message || 'Kegagalan transmisi paket data saat mengunduh buffer gambar mentah dari remote server.'
      };
    }
  }
};
