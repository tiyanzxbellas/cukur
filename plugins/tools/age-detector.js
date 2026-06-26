module.exports = {
  id:          'tools-age-detector',
  name: 'Age & Gender Detector',
  category:    'Tools',
  path:        '/api/tools/age',
  method: 'GET',
  description: 'Mendeteksi perkiraan umur dan jenis kelamin berdasarkan foto wajah yang diberikan.',

  params: [
    {
      name: 'image',
      required: true,
      example: 'https://telegra.ph/file/7cc74d27d652ae29ce2ca.jpg',
      isImage: true,
      isVideo: false,
      isAudio: false,
      isDoc:   false,
      isMedia: false,
    }
  ],

  handler: async (req, getInput, res) => {
    const targetImage = getInput(req, 'image');

    if (!targetImage) {
      return { 
        ok: false, 
        status: 400, 
        message: 'Parameter image wajib diisi menggunakan URL gambar yang valid.' 
      };
    }

    try {
      const response = await fetch(`https://api.neoxr.eu/api/age?image=${encodeURIComponent(targetImage)}&apikey=yMb35i`, {
        signal: AbortSignal.timeout(15000)
      });
      
      const json = await response.json();

      if (!json.status || !json.data) {
        return { 
          ok: false, 
          status: 404, 
          message: 'Gagal mendeteksi umur dan gender dari gambar yang diunggah.' 
        };
      }

      return {
        ok: true,
        data: {
          age: json.data.age,
          gender: json.data.gender
        }
      };

    } catch (error) {
      return { 
        ok: false, 
        status: 500, 
        message: error.message || 'Terjadi kesalahan saat memproses gambar.' 
      };
    }
  },
};
