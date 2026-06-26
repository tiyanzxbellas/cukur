'use strict';

module.exports = {
  id:          'tools-kodepos',
  name:        'Kode Pos Indonesia',
  category:    'Tools',
  path:        '/api/tools/kodepos',
  method:      'GET',
  description: 'Cari kode pos Indonesia berdasarkan nama desa/kelurahan. Return kodepos, kecamatan, kota/kabupaten, dan provinsi.',

  params: [
    { name: 'q', required: true, example: 'pasiran jaya', description: 'Nama desa / kelurahan' },
  ],

  handler: async (req, getInput) => {
    const q = getInput(req, 'q');
    if (!q) return { ok: false, status: 400, message: "Parameter 'q' wajib diisi." };

    try {
      const res  = await fetch(
        `https://api.siputzx.my.id/api/tools/kodepos?form=${encodeURIComponent(q)}`,
        { signal: AbortSignal.timeout(15000) }
      );
      const json = await res.json();

      if (!json.status || !json.data?.length) {
        return { ok: false, status: 404, message: 'Kode pos tidak ditemukan untuk pencarian tersebut.' };
      }

      return { ok: true, result: { query: q, total: json.data.length, data: json.data } };
    } catch (err) {
      return { ok: false, status: 500, message: err.message || 'Terjadi kesalahan internal.' };
    }
  },
};
