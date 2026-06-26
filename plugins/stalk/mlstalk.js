'use strict';

const axios = require('axios');
const crypto = require('crypto');

const generateRandomIP = () => {
  const octet1 = Math.floor(Math.random() * (255 - 11 + 1)) + 11;
  const octet2 = Math.floor(Math.random() * 255);
  const octet3 = Math.floor(Math.random() * 255);
  const octet4 = Math.floor(Math.random() * 255);
  return `${octet1}.${octet2}.${octet3}.${octet4}`;
};

const generateDynamicUserAgent = () => {
  const chromeVersions = ['116.0.0.0', '117.0.0.0', '118.0.0.0', '119.0.0.0', '120.0.0.0', '121.0.0.0', '122.0.0.0', '123.0.0.0'];
  const androidVersions = ['10', '11', '12', '13', '14'];
  const deviceModels = ['SM-G998B', 'SM-S918B', 'Pixel 7 Pro', 'Pixel 8', 'CPH2381', 'V2227A', 'POCO F5', '23049PCD8G'];
  const selectedVersion = chromeVersions[Math.floor(Math.random() * chromeVersions.length)];
  const selectedAndroid = androidVersions[Math.floor(Math.random() * androidVersions.length)];
  const selectedModel = deviceModels[Math.floor(Math.random() * deviceModels.length)];
  return `Mozilla/5.0 (Linux; Android ${selectedAndroid}; ${selectedModel}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${selectedVersion} Mobile Safari/537.36`;
};

const generateCorrelationId = () => {
  return crypto.randomBytes(16).toString('hex');
};

const scrapeDuniaGamesDirect = async (userId, zoneId) => {
  const targetUrl = 'https://api.duniagames.co.id/api/transaction/v1/top-up/inquiry/store';
  const requestPayload = {
    productId: 1,
    itemId: 2,
    catalogId: 121,
    paymentId: 3500,
    voucherPricePointId: 4150,
    customItemPayload: {
      user_id: String(userId),
      zone_id: String(zoneId)
    }
  };
  const requestHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/plain, */*',
    'User-Agent': generateDynamicUserAgent(),
    'X-Forwarded-For': generateRandomIP(),
    'X-Correlation-Id': generateCorrelationId(),
    'Origin': 'https://duniagames.co.id',
    'Referer': 'https://duniagames.co.id/'
  };
  const response = await axios.post(targetUrl, requestPayload, {
    headers: requestHeaders,
    timeout: 15000,
    maxRedirects: 5,
    validateStatus: (status) => status >= 200 && status < 500
  });
  if (response.data && response.data.data && response.data.data.gameDetail && response.data.data.gameDetail.userName) {
    return response.data.data.gameDetail.userName;
  }
  throw new Error('DuniaGames payload structure mismatch or identity not found');
};

const scrapeLapakGamingDirect = async (userId, zoneId) => {
  const targetUrl = `https://www.lapakgaming.com/api/checkout/v1/get-account-info?code=mobile-legends&user_id=${encodeURIComponent(userId)}&zone_id=${encodeURIComponent(zoneId)}`;
  const requestHeaders = {
    'Accept': 'application/json, text/plain, */*',
    'User-Agent': generateDynamicUserAgent(),
    'X-Forwarded-For': generateRandomIP(),
    'Origin': 'https://www.lapakgaming.com',
    'Referer': 'https://www.lapakgaming.com/id-id/mobile-legends'
  };
  const response = await axios.get(targetUrl, {
    headers: requestHeaders,
    timeout: 15000,
    maxRedirects: 5,
    validateStatus: (status) => status >= 200 && status < 500
  });
  if (response.data && response.data.data && response.data.data.name) {
    return response.data.data.name;
  }
  throw new Error('LapakGaming payload structure mismatch or identity not found');
};

const scrapeSmileOneDirect = async (userId, zoneId) => {
  const initUrl = 'https://www.smile.one/merchant/mobilelegends';
  const dynamicAgent = generateDynamicUserAgent();
  const initHeaders = {
    'User-Agent': dynamicAgent,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'X-Forwarded-For': generateRandomIP()
  };
  const initResponse = await axios.get(initUrl, {
    headers: initHeaders,
    timeout: 15000,
    maxRedirects: 5,
    validateStatus: (status) => status >= 200 && status < 500
  });
  const htmlContent = initResponse.data;
  const csrfRegexPatterns = [
    /<meta\s+name="csrf-token"\s+content="([^"]+)"/i,
    /csrf_token\s*:\s*'([^']+)'/i,
    /name="_token"\s+value="([^"]+)"/i
  ];
  let extractedToken = null;
  for (const pattern of csrfRegexPatterns) {
    const match = htmlContent.match(pattern);
    if (match && match[1]) {
      extractedToken = match[1];
      break;
    }
  }
  if (!extractedToken) {
    throw new Error('CSRF Token extraction failed on SmileOne initialization phase');
  }
  let sessionCookies = '';
  if (initResponse.headers['set-cookie']) {
    sessionCookies = initResponse.headers['set-cookie'].map(cookie => cookie.split(';')[0]).join('; ');
  }
  const checkRoleUrl = 'https://www.smile.one/merchant/mobilelegends/checkrole/';
  const urlEncodedPayload = new URLSearchParams();
  urlEncodedPayload.append('user_id', String(userId));
  urlEncodedPayload.append('zone_id', String(zoneId));
  urlEncodedPayload.append('pid', '26');
  urlEncodedPayload.append('check_userid', '1');
  const checkRoleHeaders = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'User-Agent': dynamicAgent,
    'X-Requested-With': 'XMLHttpRequest',
    'X-CSRF-Token': extractedToken,
    'Cookie': sessionCookies,
    'Origin': 'https://www.smile.one',
    'Referer': 'https://www.smile.one/merchant/mobilelegends',
    'X-Forwarded-For': generateRandomIP()
  };
  const checkResponse = await axios.post(checkRoleUrl, urlEncodedPayload.toString(), {
    headers: checkRoleHeaders,
    timeout: 15000,
    maxRedirects: 5,
    validateStatus: (status) => status >= 200 && status < 500
  });
  if (checkResponse.data && checkResponse.data.username) {
    if (checkResponse.data.username.includes('Error') || checkResponse.data.username.includes('Failed')) {
      throw new Error('SmileOne returned an embedded error inside the username field');
    }
    return checkResponse.data.username;
  }
  throw new Error('SmileOne role checking process failed to return valid JSON mapping');
};

module.exports = {
  id: 'mobile-legends-stalk-manual',
  name: 'Mobile Legends Stalk Manual Scraper',
  path: '/api/stalk/ml',
  method: 'GET',
  category: 'Stalking',
  description: 'Melakukan validasi dan pengambilan nickname akun Mobile Legends secara mutlak manual dengan melakukan simulasi permintaan web langsung kepada server utama distributor (DuniaGames, LapakGaming, dan SmileOne) tanpa mengandalkan satupun third-party API publik.',
  params: [
    { name: 'id', required: true, example: '12345678' },
    { name: 'zone', required: true, example: '1234' }
  ],
  async handler(req, getInput, res) {
    const rawUserId = getInput(req, 'id');
    const rawZoneId = getInput(req, 'zone');

    if (rawUserId === undefined || rawUserId === null || rawZoneId === undefined || rawZoneId === null) {
      return {
        ok: false,
        status: 400,
        message: 'Parameter id dan zone mutlak dibutuhkan untuk menjembatani identifikasi data Mobile Legends.'
      };
    }

    const sanitizedUserId = String(rawUserId).replace(/[^0-9]/g, '');
    const sanitizedZoneId = String(rawZoneId).replace(/[^0-9]/g, '');

    if (sanitizedUserId.length < 5 || sanitizedZoneId.length < 3) {
      return {
        ok: false,
        status: 400,
        message: 'Integritas parameter gagal diverifikasi. String masukan harus berupa deretan angka unik yang memenuhi standar pemformatan identitas akun Moonton.'
      };
    }

    const manualScrapingStrategies = [
      {
        identifier: 'duniagames_direct_api',
        executor: () => scrapeDuniaGamesDirect(sanitizedUserId, sanitizedZoneId)
      },
      {
        identifier: 'lapakgaming_direct_api',
        executor: () => scrapeLapakGamingDirect(sanitizedUserId, sanitizedZoneId)
      },
      {
        identifier: 'smileone_csrf_simulation',
        executor: () => scrapeSmileOneDirect(sanitizedUserId, sanitizedZoneId)
      }
    ];

    let extractedNickname = null;
    let successfulStrategy = null;
    const executionLogs = [];

    for (let i = 0; i < manualScrapingStrategies.length; i++) {
      const strategy = manualScrapingStrategies[i];
      try {
        const timestampStart = Date.now();
        const result = await strategy.executor();
        const timestampEnd = Date.now();
        if (result && typeof result === 'string' && result.trim().length > 0) {
          extractedNickname = result.trim();
          successfulStrategy = strategy.identifier;
          executionLogs.push({
            strategy: strategy.identifier,
            status: 'success',
            latency_ms: timestampEnd - timestampStart
          });
          break;
        }
      } catch (scrapingException) {
        executionLogs.push({
          strategy: strategy.identifier,
          status: 'failed',
          trace: scrapingException.message || 'Unknown stream interruption'
        });
      }
    }

    if (extractedNickname !== null) {
      return {
        ok: true,
        status: 200,
        data: {
          nickname: extractedNickname,
          user_id: sanitizedUserId,
          zone_id: sanitizedZoneId,
          scraping_metadata: {
            resolved_by: successfulStrategy,
            execution_trace: executionLogs,
            timestamp: new Date().toISOString()
          }
        }
      };
    } else {
      return {
        ok: false,
        status: 404,
        message: 'Seluruh metode komprehensif manual scraping telah kehabisan rute. Kredensial Mobile Legends tidak ditemukan atau Moonton merespons dengan anomali.',
        diagnostic_logs: executionLogs
      };
    }
  }
};
