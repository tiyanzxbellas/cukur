'use strict';

const axios = require('axios');

module.exports = {
  id: 'freefire-stalk-v2',
  name: 'Free Fire Stalk V2',
  path: '/api/stalker/freefire-v2',
  method: 'GET',
  category: 'Stalking',
  description: 'Mendapatkan data profil dan statistik akun Free Fire secara lengkap berdasarkan UID.',
  params: [
    { name: 'uid', required: true, example: '688851083' }
  ],
  async handler(req, getInput, res) {
    const uid = getInput(req, 'uid');

    if (uid === undefined || uid === null || String(uid).trim() === '') {
      return {
        ok: false,
        status: 400,
        message: 'Parameter uid mutlak dibutuhkan untuk memproses pengecekan akun Free Fire V2.'
      };
    }

    const browserUserAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Linux; Android 13; Infinix X6831) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0'
    ];

    const generateRandomIP = () => {
      const octet1 = Math.floor(Math.random() * (255 - 11 + 1)) + 11;
      const octet2 = Math.floor(Math.random() * 255);
      const octet3 = Math.floor(Math.random() * 255);
      const octet4 = Math.floor(Math.random() * 255);
      return `${octet1}.${octet2}.${octet3}.${octet4}`;
    };

    const requestHeaders = {
      'User-Agent': browserUserAgents[Math.floor(Math.random() * browserUserAgents.length)],
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      'X-Forwarded-For': generateRandomIP(),
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Connection': 'keep-alive'
    };

    try {
      const targetUrl = `https://api.cuki.biz.id/api/stalker/freefire-v2?apikey=cuki-x&uid=${encodeURIComponent(uid)}`;
      
      const response = await axios.get(targetUrl, {
        headers: requestHeaders,
        timeout: 25000,
        maxRedirects: 5,
        validateStatus: (status) => status >= 200 && status < 500
      });

      if (response.status === 429) {
        return {
          ok: false,
          status: 429,
          message: 'Permintaan dibatasi. Batasan Rate Limit dari server upstream telah melampaui ambang batas maksimum.'
        };
      }

      if (response.data && response.data.status && response.data.data) {
        return {
          ok: true,
          status: 200,
          data: {
            uid: response.data.data.uid || uid,
            nickname: response.data.data.nickname,
            region: response.data.data.region,
            level: response.data.data.level,
            exp: response.data.data.exp,
            likes: response.data.data.likes,
            badgeCount: response.data.data.badgeCount,
            weaponSkinShow: response.data.data.weaponSkinShow,
            clothes: response.data.data.clothes || [],
            rank: {
              br: {
                rank: response.data.data.rank?.br?.rank,
                rankName: response.data.data.rank?.br?.rankName,
                points: response.data.data.rank?.br?.points
              },
              cs: {
                rank: response.data.data.rank?.cs?.rank,
                points: response.data.data.rank?.cs?.points
              },
              maxRank: response.data.data.rank?.maxRank
            },
            pet: {
              name: response.data.data.pet?.name,
              level: response.data.data.pet?.level,
              exp: response.data.data.pet?.exp,
              skillId: response.data.data.pet?.skillId
            },
            social: {
              signature: response.data.data.social?.signature,
              gender: response.data.data.social?.gender,
              language: response.data.data.social?.language
            },
            accountCreated: response.data.data.accountCreated,
            lastLogin: response.data.data.lastLogin,
            veteranExpire: response.data.data.veteranExpire,
            cached: response.data.data.cached || false,
            stalk_metadata: {
              provider: response.data.creator || 'cuki digital',
              timestamp: response.data.timestamp || new Date().toISOString()
            }
          }
        };
      } else {
        return {
          ok: false,
          status: response.status || 502,
          message: 'Struktur balasan dari server upstream tidak mengembalikan objek data secara valid.'
        };
      }
    } catch (error) {
      return {
        ok: false,
        status: error.response?.status || 500,
        message: error.response?.data?.message || error.message || 'Koneksi menuju server upstream terputus atau mengalami kegagalan transmisi paket data.'
      };
    }
  }
};
