'use strict';

module.exports = {
  id:          'games-tebaklagu',
  name: 'Tebak Lagu',
  category:    'Games',
  method: 'GET',
  path:        '/api/games/tebaklagu',
  description: 'Menampilkan cuplikan audio lagu beserta judul dan artis yang harus ditebak.',
  params: [],
  handler: async (requestParameter, getInputFunction, responseObject) => {
    try {
      const upstreamUrl = 'https://api.siputzx.my.id/api/games/tebaklagu';
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
      if (responseData.status !== true || !responseData.data) return { ok: false, status: 404, message: 'Data tebak lagu tidak ditemukan.' };
      const { lagu, judul, artis } = responseData.data;
      return { ok: true, status: 200, audio_url: lagu, title: judul, artist: artis, timestamp: responseData.timestamp || new Date().toISOString() };
    } catch (error) { return { ok: false, status: 500, message: 'Kesalahan internal: ' + error.message }; }
  }
};