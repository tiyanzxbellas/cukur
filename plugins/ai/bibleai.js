'use strict';

module.exports = {
  id:          'ai-bibleai',
  name:        'Bible AI',
  category:    'Ai',
  path:        '/api/ai/bible',
  method:      'GET',
  description: `AI berbasis Alkitab (Bible). Jawab pertanyaan teologi & iman dengan referensi ayat. Dukung multi-terjemahan (ESV, NIV, KJV, dll).`,

  params: [
    {
      name: 'question',
      required: true,
      example: 'What is faith?',
      description: 'Pertanyaan teologi / Alkitab',
    },
    {
      name: 'translation',
      required: false,
      example: 'ESV',
      description: 'Kode terjemahan: ESV | NIV | KJV | NLT | NASB (default: ESV)',
    }
  ],

  handler: async (req, getInput) => {
    const question    = getInput(req, 'question');
    const translation = getInput(req, 'translation') || 'ESV';

    if (!question) return { ok: false, status: 400, message: "Parameter 'question' wajib diisi." };

    const validTranslations = ['ESV', 'NIV', 'KJV', 'NLT', 'NASB', 'CSB', 'NKJV', 'MSG'];
    const trans = validTranslations.includes(translation.toUpperCase())
      ? translation.toUpperCase()
      : 'ESV';

    try {
      const res = await fetch(
        'https://api.siputzx.my.id/api/ai/bibleai?question=' + encodeURIComponent(question) + '&translation=' + trans,
        { signal: AbortSignal.timeout(25000) }
      );
      const json = await res.json();

      if (!json.status || !json.data) {
        return { ok: false, status: 502, message: 'Upstream Bible AI gagal merespons.' };
      }

      const d = json.data;
      return {
        ok: true,
        result: {
          question:    d.question,
          translation: d.translation,
          answer:      d.answer,
          sources:     (d.sources || [])
            .filter(s => s.type === 'verse')
            .map(s => s.text),
        },
      };

    } catch (err) {
      return { ok: false, status: 500, message: err.message || 'Terjadi kesalahan internal.' };
    }
  },
};
