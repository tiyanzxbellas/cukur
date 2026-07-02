'use strict';

const axios = require('axios');

const NEOXR_BASE = 'https://api.neoxr.eu/api';
const NEOXR_KEY  = process.env.NEOXR_APIKEY || 'LqHiHy';

module.exports = {
  id:          'random-tempmail-read',
  name:        'Temp Mail Read',
  category:    'Random',
  path:        '/api/random/tempmail-read',
  method:      'GET',
  description: 'Baca inbox dari email temporary.',

  params: [
    { name: 'email', required: true, example: 'xupaxu2244@guysmail.com', description: 'Alamat email temporary' },
  ],

  handler: async (req, getInput) => {
    const email = getInput(req, 'email');
    if (!email) return { ok: false, status: 400, message: "Parameter 'email' wajib diisi." };

    try {
      // Perbaikan: Gunakan endpoint yang benar /tempmailRead
      const { data } = await axios.get(`${NEOXR_BASE}/tempmailRead`, {
        params:  { 
          email: email, 
          apikey: NEOXR_KEY 
        },
        timeout: 20000,
        headers: { 
          'Accept': 'application/json', 
          'User-Agent': 'ElynnAPI/1.0' 
        },
      });

      // Cek response dari API
      if (!data) {
        return { ok: false, status: 502, message: 'No response from upstream API.' };
      }

      // Handle response sesuai format yang diberikan
      // Jika data langsung berisi result
      if (data.data) {
        return { ok: true, result: data.data };
      }
      
      // Jika data langsung berisi array inbox
      if (Array.isArray(data)) {
        return { ok: true, result: data };
      }

      // Jika ada status field
      if (data.status === true) {
        return { ok: true, result: data.data || data.result || data };
      }

      // Fallback: return apa adanya
      return { ok: true, result: data };

    } catch (err) {
      console.error('TempMail Read Error:', err.message);
      
      // Handle error dari axios
      if (err.response) {
        return { 
          ok: false, 
          status: err.response.status, 
          message: err.response.data?.message || 'Upstream API error.' 
        };
      }
      
      return { 
        ok: false, 
        status: 500, 
        message: err.message || 'Terjadi kesalahan internal.' 
      };
    }
  },
};
