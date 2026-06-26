'use strict';

module.exports = {
  id:          'games-tebakkimia',
  name: 'Tebak Kimia',
  category:    'Games',
  method: 'GET',
  path:        '/api/games/tebakkimia',
  description: 'Menampilkan soal tebak lambang unsur kimia berdasarkan nama unsurnya.',
  params: [],
  handler: async (requestParameter, getInputFunction, responseObject) => {
    try {
      const upstreamUrl = 'https://api.siputzx.my.id/api/games/tebakkimia';
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
      if (responseData.status !== true || !responseData.data) return { ok: false, status: 404, message: 'Data tebak kimia tidak ditemukan.' };
      const { unsur, lambang } = responseData.data;
      return { ok: true, status: 200, element_name: unsur, symbol: lambang, timestamp: responseData.timestamp || new Date().toISOString() };
    } catch (error) { return { ok: false, status: 500, message: 'Kesalahan internal: ' + error.message }; }
  }
};