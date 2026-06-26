'use strict';

module.exports = {
  id:          'games-family100',
  name: 'Family 100 / Survey',
  category:    'Games',
  method: 'GET',
  path:        '/api/games/family100',
  description: 'Menampilkan soal dan kumpulan jawaban populer dari permainan Family 100 (survei).',
  params: [],
  handler: async (requestParameter, getInputFunction, responseObject) => {
    try {
      const upstreamUrl = 'https://api.siputzx.my.id/api/games/family100';
      const upstreamResponse = await fetch(upstreamUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Infinix X6831) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'id-ID,id;q=0.9'
        }
      });

      if (!upstreamResponse.ok) {
        return {
          ok: false,
          status: upstreamResponse.status,
          message: `Gagal mengambil data dari server hulu: HTTP ${upstreamResponse.status}`
        };
      }

      const responseData = await upstreamResponse.json();

      if (responseData.status !== true || !responseData.data) {
        return {
          ok: false,
          status: 404,
          message: 'Data Family 100 tidak ditemukan atau struktur respons tidak valid.'
        };
      }

      const { soal, jawaban } = responseData.data;
      const timestamp = responseData.timestamp || new Date().toISOString();

      return {
        ok: true,
        status: 200,
        question: soal,
        answers: Array.isArray(jawaban) ? jawaban : [jawaban],
        timestamp: timestamp
      };

    } catch (error) {
      return {
        ok: false,
        status: 500,
        message: 'Kesalahan internal saat memproses plugin Family 100: ' + error.message
      };
    }
  }
};