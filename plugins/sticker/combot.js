'use strict';

module.exports = {
  id:          'sticker-combot',
  name:        'Combot Sticker Search',
  category:    'Sticker',
  path:        '/api/sticker/combot',
  method:      'GET',
  description: 'Cari sticker pack Telegram via Combot. Return daftar pack beserta preview URL dan link add sticker.',

  params: [
    { name: 'q',    required: true,  example: 'jomok nye', description: 'Keyword pencarian sticker' },
    { name: 'page', required: false, example: '1',         description: 'Halaman hasil (default: 1)' },
  ],

  handler: async (req, getInput) => {
    const q    = getInput(req, 'q');
    const page = parseInt(getInput(req, 'page') || '1') || 1;

    if (!q) return { ok: false, status: 400, message: "Parameter 'q' wajib diisi." };

    try {
      const res  = await fetch(
        `https://api.siputzx.my.id/api/sticker/combot-search?q=${encodeURIComponent(q)}&page=${page}`,
        { signal: AbortSignal.timeout(15000) }
      );
      const json = await res.json();

      if (!json.status || !json.data) {
        return { ok: false, status: 502, message: 'Upstream API gagal merespons.' };
      }

      const results = json.data.results || [];
      if (!results.length) {
        return { ok: false, status: 404, message: 'Sticker pack tidak ditemukan.' };
      }

      return {
        ok:     true,
        result: {
          query:       q,
          page,
          totalPages:  json.data.totalPages || 0,
          total:       results.length,
          packs:       results.map(p => ({
            id:              p.id,
            title:           p.title,
            type:            p.sticker_type,
            total_stickers:  p.total_stickers,
            preview:         p.sticker_urls?.[0] || null,
            sticker_urls:    p.sticker_urls || [],
            add_url:         p.add_sticker_url,
            created_at:      p.created_date,
          })),
        },
      };
    } catch (err) {
      return { ok: false, status: 500, message: err.message || 'Terjadi kesalahan internal.' };
    }
  },
};
