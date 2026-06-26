'use strict';

module.exports = {
  id:          'ai-gita',
  name:        'Bhagavad Gita AI',
  category:    'Ai',
  path:        '/api/ai/gita',
  method:      'GET',
  description: `AI berbasis Bhagavad Gita. Jawab pertanyaan filosofis dan spiritual dari sudut pandang kitab Hindu kuno.`,

  params: [
    {
      name: 'q',
      required: true,
      example: 'What is karma?',
      description: 'Pertanyaan / topik',
    }
  ],

  handler: async (req, getInput) => {
    const q = getInput(req, 'q');

    if (!q) return { ok: false, status: 400, message: 'Parameter \'q\' wajib diisi.' };

    try {
      const res = await fetch('https://api.siputzx.my.id/api/ai/gita?q=' + encodeURIComponent(q) , {
        signal: AbortSignal.timeout(20000),
      });
      const json = await res.json();

      if (!json.status) {
        return { ok: false, status: 502, message: 'Upstream API gagal merespons.' };
      }

      const reply = json.data;
      if (!reply) return { ok: false, status: 502, message: 'Respons AI kosong.' };

      return { ok: true, result: { response: reply } };

    } catch (err) {
      return { ok: false, status: 500, message: err.message || 'Terjadi kesalahan internal.' };
    }
  },
};
