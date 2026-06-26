'use strict';

module.exports = {
  id:          'tools-countryinfo',
  name:        'Country Info',
  category:    'Tools',
  path:        '/api/tools/countryinfo',
  method:      'GET',
  description: 'Info lengkap suatu negara: ibukota, bendera, kode telepon, mata uang, bahasa, tetangga, koordinat, dan lainnya.',

  params: [
    { name: 'name', required: true, example: 'Indonesia', description: 'Nama negara (bahasa Inggris)' },
  ],

  handler: async (req, getInput) => {
    const name = getInput(req, 'name');
    if (!name) return { ok: false, status: 400, message: "Parameter 'name' wajib diisi." };

    try {
      const res  = await fetch(
        `https://api.siputzx.my.id/api/tools/countryInfo?name=${encodeURIComponent(name)}`,
        { signal: AbortSignal.timeout(15000) }
      );
      const json = await res.json();

      if (!json.status || !json.data) {
        return { ok: false, status: 404, message: 'Negara tidak ditemukan.' };
      }

      return { ok: true, result: json.data };
    } catch (err) {
      return { ok: false, status: 500, message: err.message || 'Terjadi kesalahan internal.' };
    }
  },
};
