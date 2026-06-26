'use strict';

module.exports = {
  id:          'stalk-github',
  name:        'GitHub Stalk',
  category:    'Stalk',
  path:        '/api/stalk/github',
  method:      'GET',
  description: 'Ambil info publik profil GitHub: nama, bio, avatar, perusahaan, lokasi, stats (repos, followers, following, gists).',

  params: [
    { name: 'user', required: true, example: 'octocat', description: 'Username GitHub' },
  ],

  handler: async (req, getInput) => {
    const user = getInput(req, 'user');
    if (!user) return { ok: false, status: 400, message: "Parameter 'user' wajib diisi." };

    try {
      const res  = await fetch(
        `https://api.siputzx.my.id/api/stalk/github?user=${encodeURIComponent(user)}`,
        { signal: AbortSignal.timeout(15000) }
      );
      const json = await res.json();

      if (!json.status || !json.data) {
        return { ok: false, status: 404, message: 'Profil GitHub tidak ditemukan.' };
      }

      return { ok: true, result: json.data };
    } catch (err) {
      return { ok: false, status: 500, message: err.message || 'Terjadi kesalahan internal.' };
    }
  },
};
