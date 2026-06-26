'use strict';

module.exports = {
  id:          'random',
  name: 'Cecan Korea Random',
  category:    'Random',
  path:        '/api/random/cecan-korea',
  method: 'GET',
  description: 'Mengambil gambar acak Cecan Korea.',
  params: [],
  handler: async (req, getInput, res) => {
    try {
      // Trik pancingan: Tambahkan query ?.jpg di akhir URL.
      // Sistem rehost otomatis di index.js akan membaca ini sebagai JPG, 
      // mengunduhnya, dan mengganti linknya menjadi https://api.elynn.my.id/xxx.jpg
      const targetUrl = 'https://api.siputzx.my.id/api/r/cecan/korea?.jpg';
      
      const formattedData = {
        title: 'Cecan Korea Random',
        image_url: targetUrl
      };

      return {
        ok: true,
        data: formattedData
      };

    } catch (error) {
      return { ok: false, status: 500, message: error.message };
    }
  }
};