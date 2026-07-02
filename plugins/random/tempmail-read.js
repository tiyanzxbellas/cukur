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

    // Fungsi helper untuk cek apakah response HTML
    const isHtml = (data) => {
      if (typeof data === 'string') {
        return data.includes('<!DOCTYPE html>') || data.includes('<html');
      }
      return false;
    };

    try {
      // OPSI 1: Coba endpoint standar
      const { data } = await axios.get(`${NEOXR_BASE}/tempmailRead`, {
        params: { 
          email: email, 
          apikey: NEOXR_KEY 
        },
        timeout: 20000,
        headers: { 
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
      });

      // Jika response HTML, coba alternatif
      if (isHtml(data)) {
        // OPSI 2: Coba endpoint /tempmail
        try {
          const altResponse = await axios.get(`${NEOXR_BASE}/tempmail`, {
            params: { 
              email: email, 
              apikey: NEOXR_KEY 
            },
            timeout: 20000,
            headers: { 'Accept': 'application/json' }
          });

          // Cek apakah response valid (bukan HTML)
          if (!isHtml(altResponse.data)) {
            // Cek berbagai format response
            if (altResponse.data?.status === true) {
              return { ok: true, result: altResponse.data.data || altResponse.data.result };
            }
            if (altResponse.data?.data) {
              return { ok: true, result: altResponse.data.data };
            }
            return { ok: true, result: altResponse.data };
          }
        } catch (altErr) {
          // Abaikan error alternatif
        }

        // OPSI 3: Coba POST
        try {
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

          if (!isHtml(postResponse.data)) {
            if (postResponse.data?.status === true) {
              return { ok: true, result: postResponse.data.data || postResponse.data.result };
            }
            if (postResponse.data?.data) {
              return { ok: true, result: postResponse.data.data };
            }
            return { ok: true, result: postResponse.data };
          }
        } catch (postErr) {
          // Abaikan error POST
        }

        return { 
          ok: false, 
          status: 502, 
          message: 'API mengembalikan HTML. Pastikan API key valid atau coba endpoint /tempmail' 
        };
      }

      // Jika response JSON
      if (data?.status === true) {
        return { ok: true, result: data.data || data.result };
      }

      if (data?.data) {
        return { ok: true, result: data.data };
      }

      // Jika response langsung array/object
      if (data && typeof data === 'object') {
        return { ok: true, result: data };
      }

      return { ok: true, result: data };

    } catch (err) {
      console.error('TempMail Read Error:', err.message);
      
      if (err.response?.data) {
        // Cek apakah error response HTML
        if (isHtml(err.response.data)) {
          return { 
            ok: false, 
            status: 502, 
            message: 'API endpoint tidak valid. Coba gunakan endpoint /tempmail atau periksa API key.' 
          };
        }
        return { 
          ok: false, 
          status: err.response.status, 
          message: err.response.data?.message || err.response.data?.error || 'Upstream API error.' 
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
