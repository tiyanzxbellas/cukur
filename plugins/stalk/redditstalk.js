'use strict';

const axios = require('axios');

const generateRandomIP = () => {
  const octet1 = Math.floor(Math.random() * (255 - 11 + 1)) + 11;
  const octet2 = Math.floor(Math.random() * 255);
  const octet3 = Math.floor(Math.random() * 255);
  const octet4 = Math.floor(Math.random() * 255);
  return `${octet1}.${octet2}.${octet3}.${octet4}`;
};

const generateDynamicUserAgent = () => {
  const osVersions = ['10.0', '11.0', '12.0', '13.0.1', '14.2', '15.1', '16.4', '17.0'];
  const webkitVersions = ['605.1.15', '537.36', '604.1.34'];
  const appVersions = ['2023.40.0', '2024.12.1', '2024.15.0', '2024.20.1', '2024.25.0'];
  const buildIds = ['16A366', '19G82', '20B92', '21C62', '22A380'];
  const platforms = ['iPhone', 'iPad', 'Macintosh'];
  
  const selectedOS = osVersions[Math.floor(Math.random() * osVersions.length)];
  const selectedWebkit = webkitVersions[Math.floor(Math.random() * webkitVersions.length)];
  const selectedApp = appVersions[Math.floor(Math.random() * appVersions.length)];
  const selectedBuild = buildIds[Math.floor(Math.random() * buildIds.length)];
  const selectedPlatform = platforms[Math.floor(Math.random() * platforms.length)];

  if (selectedPlatform === 'Macintosh') {
    return `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/${selectedWebkit} (KHTML, like Gecko) Chrome/124.0.0.0 Safari/${selectedWebkit} Reddit/${selectedApp}`;
  }
  
  return `Reddit/${selectedApp} CFNetwork/1408.0.4 Darwin/22.4.0 (${selectedPlatform} CPU OS ${selectedOS.replace(/\./g, '_')} like Mac OS X) Build/${selectedBuild}`;
};

const extractRedditProfileData = async (targetUsername) => {
  const sanitizedUsername = String(targetUsername).replace(/[^a-zA-Z0-9_-]/g, '').trim();
  const endpointUrl = `https://www.reddit.com/user/${sanitizedUsername}/about.json`;
  
  const requestHeaders = {
    'User-Agent': generateDynamicUserAgent(),
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'X-Forwarded-For': generateRandomIP(),
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Connection': 'keep-alive',
    'Origin': 'https://www.reddit.com',
    'Referer': `https://www.reddit.com/user/${sanitizedUsername}`
  };

  const response = await axios.get(endpointUrl, {
    headers: requestHeaders,
    timeout: 20000,
    maxRedirects: 5,
    validateStatus: (status) => status >= 200 && status < 500
  });

  if (response.status === 404) {
    throw new Error('USER_NOT_FOUND');
  }

  if (response.status === 429) {
    throw new Error('RATE_LIMITED');
  }

  if (response.data && response.data.kind === 't2' && response.data.data) {
    const profileData = response.data.data;
    
    const formatAvatarUrl = (url) => {
      if (!url) return null;
      return url.replace(/&amp;/g, '&');
    };

    const creationDateRaw = profileData.created_utc ? profileData.created_utc * 1000 : null;
    const creationIsoString = creationDateRaw ? new Date(creationDateRaw).toISOString() : null;

    return {
      id: profileData.id,
      username: profileData.name,
      display_name: profileData.subreddit && profileData.subreddit.title ? profileData.subreddit.title : profileData.name,
      description: profileData.subreddit && profileData.subreddit.public_description ? profileData.subreddit.public_description : '',
      account_creation_date: creationIsoString,
      karma: {
        total: profileData.total_karma || 0,
        post: profileData.link_karma || 0,
        comment: profileData.comment_karma || 0,
        awardee: profileData.awardee_karma || 0,
        awarder: profileData.awarder_karma || 0
      },
      visuals: {
        icon_img: formatAvatarUrl(profileData.icon_img),
        snoovatar_img: formatAvatarUrl(profileData.snoovatar_img),
        banner_img: profileData.subreddit ? formatAvatarUrl(profileData.subreddit.banner_img) : null
      },
      flags: {
        is_employee: !!profileData.is_employee,
        is_mod: !!profileData.is_mod,
        is_gold: !!profileData.is_gold,
        has_verified_email: !!profileData.has_verified_email,
        is_suspended: !!profileData.is_suspended,
        accept_followers: !!profileData.accept_followers,
        over_18: profileData.subreddit ? !!profileData.subreddit.over_18 : false
      },
      metrics: {
        subscribers: profileData.subreddit ? profileData.subreddit.subscribers : 0
      },
      permalink: `https://www.reddit.com/user/${profileData.name}`
    };
  }

  throw new Error('INVALID_PAYLOAD_STRUCTURE');
};

module.exports = {
  id: 'reddit-stalk-manual',
  name: 'Reddit Stalk Manual Scraper',
  path: '/api/stalk/reddit',
  method: 'GET',
  category: 'Stalking',
  description: 'Melakukan penarikan data profil Reddit secara manual dengan mengeksploitasi public endpoint JSON Reddit, termasuk pembuatan User-Agent dinamis serta by-pass parameter untuk menghindari limitasi koneksi. Modul ini menjamin kelengkapan data secara terperinci.',
  params: [
    { name: 'username', required: true, example: 'spez' }
  ],
  async handler(req, getInput, res) {
    const rawUsername = getInput(req, 'username');

    if (rawUsername === undefined || rawUsername === null || String(rawUsername).trim() === '') {
      return {
        ok: false,
        status: 400,
        message: 'Parameter username mutlak dibutuhkan untuk menjembatani identifikasi data pengguna Reddit.'
      };
    }

    const sanitizedUsername = String(rawUsername).replace(/[^a-zA-Z0-9_-]/g, '').trim();

    if (sanitizedUsername.length < 3 || sanitizedUsername.length > 20) {
      return {
        ok: false,
        status: 400,
        message: 'Integritas parameter gagal diverifikasi. Username Reddit umumnya memiliki panjang antara 3 hingga 20 karakter alfanumerik.'
      };
    }

    const executionLogs = [];
    const timestampStart = Date.now();

    try {
      const extractedProfileData = await extractRedditProfileData(sanitizedUsername);
      const timestampEnd = Date.now();

      executionLogs.push({
        strategy: 'reddit_public_json_endpoint',
        status: 'success',
        latency_ms: timestampEnd - timestampStart
      });

      return {
        ok: true,
        status: 200,
        data: {
          ...extractedProfileData,
          scraping_metadata: {
            resolved_by: 'reddit_direct_scraper',
            execution_trace: executionLogs,
            timestamp: new Date().toISOString()
          }
        }
      };

    } catch (scrapingException) {
      const timestampEnd = Date.now();
      const errorMessage = scrapingException.message;

      executionLogs.push({
        strategy: 'reddit_public_json_endpoint',
        status: 'failed',
        latency_ms: timestampEnd - timestampStart,
        trace: errorMessage
      });

      if (errorMessage === 'USER_NOT_FOUND') {
        return {
          ok: false,
          status: 404,
          message: `Pengguna dengan username '${sanitizedUsername}' tidak dapat ditemukan di dalam basis data Reddit.`,
          diagnostic_logs: executionLogs
        };
      }

      if (errorMessage === 'RATE_LIMITED') {
        return {
          ok: false,
          status: 429,
          message: 'IP host scraping sedang dibatasi oleh sistem proteksi Reddit (Rate Limit Exceeded). Silakan coba beberapa saat lagi.',
          diagnostic_logs: executionLogs
        };
      }

      if (errorMessage === 'INVALID_PAYLOAD_STRUCTURE') {
        return {
          ok: false,
          status: 502,
          message: 'Struktur balasan dari server Reddit tidak sesuai dengan spesifikasi format profil standar, kemungkinan akun sedang ditangguhkan.',
          diagnostic_logs: executionLogs
        };
      }

      return {
        ok: false,
        status: 500,
        message: 'Koneksi menuju server upstream Reddit terputus atau mengalami kegagalan transmisi paket data secara internal.',
        diagnostic_logs: executionLogs,
        error_details: errorMessage
      };
    }
  }
};
