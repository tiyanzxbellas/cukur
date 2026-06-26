'use strict';

module.exports = {
  id:          'random',
  name: 'Blue Archive Random Image',
  category:    'Random',
  path:        '/api/random/blue-archive',
  method: 'GET',
  description: 'Mengambil gambar acak Blue Archive dan me-rehostnya ke Supabase.',
  params: [], 
  handler: async (req, getInput, res) => {
    try {
      const targetUrl = 'https://api.siputzx.my.id/api/r/blue-archive';
      const formattedData = {
        title: 'Blue Archive Random',
        source: 'elynn api',
        image_url: targetUrl 
      };

      return {
        ok: true,
        data: formattedData
      };

    } catch (error) {
      return { ok: false, status: 500, message: `Terjadi kesalahan: ${error.message}` };
    }
  }
};