'use strict';

module.exports = {
  id:          'games-ccsd',
  name: 'Cerdas Cermat',
  category:    'Games',
  method: 'GET',
  path:        '/api/games/cc-sd',
  description: 'Menampilkan kumpulan soal cerdas cermat berdasarkan mata pelajaran dan jumlah soal.',
  params: [
    { name: 'matapelajaran', required: false, example: 'matematika' },
    { name: 'jumlahsoal', required: false, example: '5' }
  ],
  handler: async (requestParameter, getInputFunction, responseObject) => {
    try {
      const matapelajaran = getInputFunction(requestParameter, 'matapelajaran', '');
      const jumlahsoal = getInputFunction(requestParameter, 'jumlahsoal', '');
      let upstreamUrl = 'https://api.siputzx.my.id/api/games/cc-sd';
      const q = [];
      if (matapelajaran) q.push(`matapelajaran=${encodeURIComponent(matapelajaran)}`);
      if (jumlahsoal) q.push(`jumlahsoal=${encodeURIComponent(jumlahsoal)}`);
      if (q.length) upstreamUrl += '?' + q.join('&');
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
      if (responseData.status !== true || !responseData.data) return { ok: false, status: 404, message: 'Data cerdas cermat tidak ditemukan.' };
      const { matapelajaran: mp, jumlah_soal, soal } = responseData.data;
      return { ok: true, status: 200, subject: mp, total_questions: jumlah_soal, questions: soal, timestamp: responseData.timestamp || new Date().toISOString() };
    } catch (error) { return { ok: false, status: 500, message: 'Kesalahan internal: ' + error.message }; }
  }
};