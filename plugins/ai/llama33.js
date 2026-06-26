'use strict';

module.exports = {
  id:          'ai-llama33',
  name:        'Llama-3.3 AI',
  category:    'Ai',
  path:        '/api/ai/llama33',
  method:      'GET',
  description: `Model Meta Llama 3.3. Open-source LLM terkuat dari Meta untuk berbagai tugas bahasa.`,

  params: [
    {
      name: 'prompt',
      required: true,
      example: 'Ceritakan tentang Indonesia.',
      description: 'Pertanyaan / pesan ke AI',
    },
    {
      name: 'system',
      required: false,
      example: 'You are a helpful assistant.',
      description: 'System prompt (opsional)',
    },
    {
      name: 'temperature',
      required: false,
      example: '0.7',
      description: 'Temperatur respons 0.0–1.0 (default: 0.7)',
    }
  ],

  handler: async (req, getInput) => {
    const prompt = getInput(req, 'prompt');
    const system = getInput(req, 'system') || 'You are a helpful assistant.';
    const temperature = getInput(req, 'temperature') || '0.7';

    if (!prompt) return { ok: false, status: 400, message: 'Parameter \'prompt\' wajib diisi.' };

    try {
      const res = await fetch('https://api.siputzx.my.id/api/ai/llama33?prompt=' + encodeURIComponent(prompt) + '&system=' + encodeURIComponent(system) + '&temperature=' + encodeURIComponent(temperature) , {
        signal: AbortSignal.timeout(25000),
      });
      const json = await res.json();

      if (!json.status) {
        return { ok: false, status: 502, message: 'Upstream API gagal merespons.' };
      }

      const reply = json.data.response;
      if (!reply) return { ok: false, status: 502, message: 'Respons AI kosong.' };

      return { ok: true, result: { response: reply } };

    } catch (err) {
      return { ok: false, status: 500, message: err.message || 'Terjadi kesalahan internal.' };
    }
  },
};
