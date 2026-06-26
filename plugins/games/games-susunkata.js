'use strict';

module.exports = {
  id:          'games-susunkata',
  name: 'Susun Kata',
  category:    'Games',
  method: 'GET',
  path:        '/api/games/susunkata',
  description: 'Menampilkan soal menyusun huruf acak menjadi kata yang benar, disertai tipe benda.',
  params: [],
  handler: async (requestParameter, getInputFunction, responseObject) => {
    try {
      const upstreamUrl = 'https://api.siputzx.my.id/api/games/susunkata';
      const upstreamResponse = await fetch(upstreamUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Infinix X6831) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'id-ID,id;q=0.9'
        }
      });
      if (!upstreamResponse.ok) return { ok: false, status: upstreamResponse.status, message: `Gagal mengambil data: HTTP ${upstreamResponse.status}` };
      const responseData = await upstreamResponse.json();
      if (responseData.status !== true || !responseData.data) return { ok: false, status: 404, message: 'Data susun kata tidak ditemukan.' };
      const { index, soal, tipe, jawaban } = responseData.data;
      return { ok: true, status: 200, index, scrambled_word: soal, type: tipe, answer: jawaban, timestamp: responseData.timestamp || new Date().toISOString() };
    } catch (error) { return { ok: false, status: 500, message: 'Kesalahan internal: ' + error.message }; }
  }
};