'use strict';

module.exports = {
  id:          'stalk-pinterest',
  name:        'Pinterest Stalk',
  category:    'Stalk',
  path:        '/api/stalk/pinterest',
  method:      'GET',
  description: 'Ambil info publik profil Pinterest: nama, bio, foto, stats (pins, followers, boards, following).',

  params: [
    { name: 'q', required: true, example: 'dims', description: 'Username Pinterest' },
  ],

  handler: async (req, getInput) => {
    const q = getInput(req, 'q');
    if (!q) return { ok: false, status: 400, message: "Parameter 'q' wajib diisi." };

    try {
      const res  = await fetch(
        `https://api.siputzx.my.id/api/stalk/pinterest?q=${encodeURIComponent(q)}`,
        { signal: AbortSignal.timeout(15000) }
      );
      const json = await res.json();

      if (!json.status || !json.data) {
        return { ok: false, status: 404, message: 'Profil Pinterest tidak ditemukan.' };
      }

      const d = json.data;
      return {
        ok:     true,
        result: {
          id:          d.id,
          username:    d.username,
          full_name:   d.full_name,
          bio:         d.bio || null,
          profile_url: d.profile_url,
          image:       d.image,
          stats:       d.stats,
          website:     d.website || null,
          location:    d.location || null,
          country:     d.country || null,
          created_at:  d.created_at,
          is_verified: d.is_verified || false,
        },
      };
    } catch (err) {
      return { ok: false, status: 500, message: err.message || 'Terjadi kesalahan internal.' };
    }
  },
};
