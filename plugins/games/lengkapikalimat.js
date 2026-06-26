'use strict';

module.exports = {
  id:          'games-lengkapikalimat',
  name: 'Lengkapi Kalimat',
  category:    'Games',
  method: 'GET',
  path:        '/api/games/lengkapikalimat',
  description: 'Menampilkan soal melengkapi kalimat peribahasa atau ungkapan beserta jawabannya.',
  params: [],
  handler: async (requestParameter, getInputFunction, responseObject) => {
    try {
      const upstreamUrl = 'https://api.siputzx.my.id/api/games/lengkapikalimat';
      const upstreamResponse = await fetch(upstreamUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Infinix X6831) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'id-ID,id;q=0.9'
        }
      });

      if (!upstreamResponse.ok) {
        return { ok: false, status: upstreamResponse.status, message: `Gagal mengambil data: HTTP ${upstreamResponse.status}` };
      }

      const responseData = await upstreamResponse.json();
      if (responseData.status !== true || !responseData.data) {
        return { ok: false, status: 404, message: 'Data lengkapi kalimat tidak ditemukan.' };
      }

      const { pertanyaan, jawaban } = responseData.data;
      const timestamp = responseData.timestamp || new Date().toISOString();

      return {
        ok: true,
        status: 200,
        question: pertanyaan,
        answer: jawaban,
        timestamp: timestamp
      };
    } catch (error) {
      return { ok: false, status: 500, message: 'Kesalahan internal: ' + error.message };
    }
  }
};