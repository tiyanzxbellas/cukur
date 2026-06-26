'use strict';

module.exports = {
  id:          'games-maths',
  name: 'Maths',
  category:    'Games',
  method: 'GET',
  path:        '/api/games/maths',
  description: 'Menampilkan soal matematika dasar (operasi bilangan) dengan level kesulitan tertentu.',
  params: [
    { name: 'level', required: false, example: 'easy' }
  ],
  handler: async (requestParameter, getInputFunction, responseObject) => {
    try {
      const level = getInputFunction(requestParameter, 'level', '');
      let upstreamUrl = 'https://api.siputzx.my.id/api/games/maths';
      if (level) upstreamUrl += `?level=${encodeURIComponent(level)}`;
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
      if (responseData.status !== true || !responseData.data) return { ok: false, status: 404, message: 'Data maths tidak ditemukan.' };
      const { str, mode, time, bonus, result } = responseData.data;
      return { ok: true, status: 200, question: str, level_mode: mode, time_limit_ms: time, bonus_points: bonus, answer: result, timestamp: responseData.timestamp || new Date().toISOString() };
    } catch (error) { return { ok: false, status: 500, message: 'Kesalahan internal: ' + error.message }; }
  }
};