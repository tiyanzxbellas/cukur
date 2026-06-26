'use strict';

module.exports = {
  id:          'stalk-twitter',
  name:        'Twitter / X Stalk',
  category:    'Stalk',
  path:        '/api/stalk/twitter',
  method:      'GET',
  description: 'Ambil info publik profil Twitter/X: nama, bio, lokasi, stats (tweets, followers, following, likes), dan foto profil.',

  params: [
    { name: 'user', required: true, example: 'siputzx', description: 'Username Twitter/X (tanpa @)' },
  ],

  handler: async (req, getInput) => {
    const user = getInput(req, 'user');
    if (!user) return { ok: false, status: 400, message: "Parameter 'user' wajib diisi." };

    try {
      const res  = await fetch(
        `https://api.siputzx.my.id/api/stalk/twitter?user=${encodeURIComponent(user)}`,
        { signal: AbortSignal.timeout(15000) }
      );
      const json = await res.json();

      if (!json.status || !json.data) {
        return { ok: false, status: 404, message: 'Profil Twitter/X tidak ditemukan.' };
      }

      const d = json.data;
      return {
        ok:     true,
        result: {
          id:           d.id,
          username:     d.username,
          name:         d.name,
          verified:     d.verified || false,
          verified_type:d.verified_type || null,
          description:  d.description || null,
          location:     d.location || null,
          created_at:   d.created_at,
          stats:        d.stats,
          profile:      d.profile,
        },
      };
    } catch (err) {
      return { ok: false, status: 500, message: err.message || 'Terjadi kesalahan internal.' };
    }
  },
};
