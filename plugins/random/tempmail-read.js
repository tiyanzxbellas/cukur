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
      // OPSI 1: Coba dengan header yang berbeda
      const { data } = await axios.get(`${NEOXR_BASE}/tempmailRead`, {
        params: { 
          email: email, 
          apikey: NEOXR_KEY 
        },
        timeout: 20000,
        headers: { 
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
      });

      // Cek apakah response HTML
      if (typeof data === 'string' && data.includes('<!DOCTYPE html>')) {
        // OPSI 2: Coba endpoint berbeda
        const altResponse = await axios.get(`${NEOXR_BASE}/tempmail`, {
          params: { 
            email: email, 
            apikey: NEOXR_KEY 
          },
          timeout: 20000,
          headers: { 'Accept': 'application/json' }
        });

        if (altResponse.data && !altResponse.data.includes('<!DOCTYPE html>')) {
          return { ok: true, result: altResponse.data };
        }

        // OPSI 3: Coba dengan POST
        const postResponse = await axios.post(`${NEOXR_BASE}/tempmailRead`, {
          email: email,
          apikey: NEOXR_KEY
        }, {
          timeout: 20000,
          headers: { 
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (postResponse.data && !postResponse.data.includes('<!DOCTYPE html>')) {
          return { ok: true, result: postResponse.data };
        }

        return { 
          ok: false, 
          status: 502, 
          message: 'API mengembalikan HTML, mungkin endpoint atau API key tidak valid. Coba gunakan API key yang benar atau endpoint /tempmail' 
        };
      }

      // Jika response JSON
      if (data?.status === true) {
        return { ok: true, result: data.data || data.result };
      }

      if (data?.data) {
        return { ok: true, result: data.data };
      }

      return { ok: true, result: data };

    } catch (err) {
      console.error('TempMail Read Error:', err.message);
      
      if (err.response?.data) {
        // Cek apakah error response HTML
        if (typeof err.response.data === 'string' && err.response.data.includes('<!DOCTYPE html>')) {
          return { 
            ok: false, 
            status: 502, 
            message: 'API endpoint tidak valid atau memerlukan autentikasi. Pastikan API key benar.' 
          };
        }
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
