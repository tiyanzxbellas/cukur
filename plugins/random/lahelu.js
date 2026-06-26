'use strict';

module.exports = {
  id:          'random',
  name: 'Lahelu Random Post',
  category:    'Random',
  path:        '/api/random/lahelu',
  method: 'GET',
  description: 'Mengambil postingan meme atau video secara acak dari Lahelu.',
  params: [], // Tidak ada input dari user karena ini random feed
  handler: async (req, getInput, res) => {
    try {
      // 1. Fetch data dari API upstream
      const response = await fetch('https://api.siputzx.my.id/api/r/lahelu');
      const result = await response.json();

      // 2. Validasi apakah data tersedia
      if (!result.status || !result.data || result.data.length === 0) {
        return { ok: false, status: 404, message: 'Gagal mengambil data dari Lahelu.' };
      }

      // 3. Ambil 1 postingan secara acak dari array
      const randomIndex = Math.floor(Math.random() * result.data.length);
      const post = result.data[randomIndex];

      // 4. Mapping data
      // Perhatikan penggunaan nama key 'media_url' dan 'thumbnail'.
      // Ini akan dideteksi oleh hasMediaLikeKey/hasImageLikeKey di index.js kamu!
      const formattedData = {
        title: post.title || 'Tanpa Judul',
        author: post.userInfo?.username || 'Anonim',
        upvotes: post.totalUpvotes,
        media_url: post.media,
        thumbnail: post.mediaThumbnail
      };

      // 5. Kembalikan response, sistem inti akan me-rehost media_url & thumbnail ke Supabase
      return {
        ok: true,
        data: formattedData
      };

    } catch (error) {
      return { ok: false, status: 500, message: `Terjadi kesalahan: ${error.message}` };
    }
  }
};