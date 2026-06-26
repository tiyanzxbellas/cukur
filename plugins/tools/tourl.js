'use strict';

const path = require('path');
const axios = require('axios');
const config = require('../../config');

const SUPA_URL = (config.supabase && config.supabase.url ? String(config.supabase.url) : '').replace(/\/$/, '');
const SUPA_KEY = config.supabase && config.supabase.serviceKey ? String(config.supabase.serviceKey) : '';
const SUPA_BUCKET = config.supabase && config.supabase.bucket ? String(config.supabase.bucket) : 'elynn-media';

const MIME_TO_EXT = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
  'image/bmp': '.bmp',
  'image/avif': '.avif',
  'image/tiff': '.tiff',
  'image/ico': '.ico',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/quicktime': '.mov',
  'video/x-matroska': '.mkv',
  'video/x-msvideo': '.avi',
  'video/3gpp': '.3gp',
  'video/x-flv': '.flv',
  'video/x-ms-wmv': '.wmv',
  'video/mp2t': '.ts',
  'audio/mpeg': '.mp3',
  'audio/mp4': '.m4a',
  'audio/ogg': '.ogg',
  'audio/wav': '.wav',
  'audio/aac': '.aac',
  'audio/flac': '.flac',
  'audio/opus': '.opus',
  'audio/x-ms-wma': '.wma',
  'application/pdf': '.pdf',
  'application/zip': '.zip',
  'application/x-rar-compressed': '.rar',
  'application/x-7z-compressed': '.7z',
  'application/vnd.android.package-archive': '.apk',
  'text/plain': '.txt',
  'text/csv': '.csv',
  'application/json': '.json',
  'application/xml': '.xml',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-powerpoint': '.ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
  'image/heic': '.heic', 'image/heif': '.heif', 'image/jxl': '.jxl',
  'image/ico': '.ico', 'image/x-icon': '.ico', 'image/tiff': '.tiff',
  'video/3gpp': '.3gp', 'video/3gpp2': '.3g2', 'video/mp2t': '.ts',
  'video/ogg': '.ogv', 'audio/mp3': '.mp3', 'audio/x-wav': '.wav',
  'audio/x-ms-wma': '.wma', 'audio/amr': '.amr', 'audio/webm': '.weba',
  'application/x-apk': '.apk', 'application/vnd.rar': '.rar',
  'text/xml': '.xml'
};

const VALID_EXTS = new Set(Object.values(MIME_TO_EXT));

function generateFilename(ext) {
  const randomNumber = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return `elynn${randomNumber}${ext}`;
}

function guessExt(contentType, urlStr, buffer) {
  // 1. Cek Content-Type header (paling akurat)
  const contentHeader = (contentType || '').split(';')[0].trim().toLowerCase();
  if (MIME_TO_EXT[contentHeader]) {
    return MIME_TO_EXT[contentHeader];
  }
  // 2. Cek extension dari URL
  try {
    const parsedUrl = new URL(urlStr);
    const extension = path.extname(parsedUrl.pathname).toLowerCase();
    if (VALID_EXTS.has(extension)) {
      return extension;
    }
  } catch (error) {}
  // 3. Deteksi dari magic bytes buffer
  if (buffer && buffer.length >= 4) {
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return '.jpg';
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return '.png';
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) return '.gif';
    if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 && buffer[8] === 0x57) return '.webp';
    if (buffer[0] === 0x42 && buffer[1] === 0x4D) return '.bmp';
    if (buffer.length >= 8 && buffer[4] === 0x66 && buffer[5] === 0x74 && buffer[6] === 0x79 && buffer[7] === 0x70) return '.mp4';
    if (buffer[0] === 0x1A && buffer[1] === 0x45 && buffer[2] === 0xDF && buffer[3] === 0xA3) return '.mkv';
    if (buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33) return '.mp3';
    if (buffer[0] === 0xFF && (buffer[1] & 0xE0) === 0xE0) return '.mp3';
    if (buffer[0] === 0x4F && buffer[1] === 0x67 && buffer[2] === 0x67 && buffer[3] === 0x53) return '.ogg';
    if (buffer[0] === 0x66 && buffer[1] === 0x4C && buffer[2] === 0x61 && buffer[3] === 0x43) return '.flac';
    if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) return '.pdf';
    if (buffer[0] === 0x50 && buffer[1] === 0x4B && buffer[2] === 0x03 && buffer[3] === 0x04) return '.zip';
    if (buffer[0] === 0x52 && buffer[1] === 0x61 && buffer[2] === 0x72 && buffer[3] === 0x21) return '.rar';
    if (buffer[0] === 0x37 && buffer[1] === 0x7A && buffer[2] === 0xBC && buffer[3] === 0xAF) return '.7z';
    if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 && buffer.length >= 9 && buffer[8] === 0x41) return '.wav';
  }
  // Fallback tetap .bin (untuk unknown binary)
  return '.bin';
}

function guessMime(ext) {
  const entries = Object.entries(MIME_TO_EXT);
  for (let index = 0; index < entries.length; index++) {
    const currentMime = entries[index][0];
    const currentExt = entries[index][1];
    if (currentExt === ext) {
      return currentMime;
    }
  }
  return 'application/octet-stream';
}

async function downloadBuffer(url) {
  const response = await axios.get(url, {
    responseType: 'arraybuffer',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': '*/*'
    },
    timeout: 30000,
    maxRedirects: 10,
    validateStatus: function (status) {
      return status >= 200 && status < 400;
    }
  });
  return {
    buffer: Buffer.from(response.data),
    contentType: response.headers['content-type'] || ''
  };
}

async function uploadSupabase(buffer, filename, mime) {
  const uploadUrl = `${SUPA_URL}/storage/v1/object/${SUPA_BUCKET}/${filename}`;
  const response = await axios.post(uploadUrl, buffer, {
    headers: {
      'Authorization': `Bearer ${SUPA_KEY}`,
      'Content-Type': mime,
      'x-upsert': 'true'
    },
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    validateStatus: function (status) {
      return status >= 200 && status < 500;
    }
  });
  if (response.status >= 400) {
    let errorMessage = 'Unknown error';
    if (response.data) {
      if (Buffer.isBuffer(response.data)) {
        errorMessage = response.data.toString('utf-8');
      } else if (typeof response.data === 'object') {
        errorMessage = JSON.stringify(response.data);
      } else {
        errorMessage = String(response.data);
      }
    }
    throw new Error(`Supabase upload failed with HTTP ${response.status}: ${errorMessage}`);
  }
}

function getBaseUrl(req) {
  const hostHeader = (req && req.headers && req.headers['x-forwarded-host']) ? req.headers['x-forwarded-host'] : (req && req.headers && req.headers.host ? req.headers.host : 'api.elynn.my.id');
  const protoHeader = (req && req.headers && req.headers['x-forwarded-proto'] ? req.headers['x-forwarded-proto'] : 'https').split(',')[0].trim();
  return `${protoHeader}://${hostHeader}`;
}

module.exports = {
  id:          'tools-tourl',
  name: 'To URL (Local)',
  category:    'Tools',
  path:        '/api/tools/tourl',
  method: 'GET',
  description: 'Download media dari URL eksternal lalu simpan ke Supabase, return link lokal api.elynn.my.id/elynn(angka).ext. Support semua format: image, video, audio, zip, apk, dokumen, dll.',
  params: [
    {
      name: 'url',
      required: true,
      example: 'https://example.com/video.mp4',
      isMedia: true
    }
  ],
  handler: async (req, res) => {
    const url = (req && req.query && req.query.url) ? req.query.url : (req && req.body && req.body.url ? req.body.url : null);
    if (!url || !/^https?:\/\//i.test(url)) {
      return {
        ok: false,
        status: 400,
        message: 'Parameter url wajib dan harus berupa URL valid (http/https).'
      };
    }
    if (!SUPA_URL || !SUPA_KEY) {
      return {
        ok: false,
        status: 503,
        message: 'Supabase belum dikonfigurasi. Isi config.js terlebih dahulu.'
      };
    }
    let buffer;
    let contentType;
    try {
      const downloadResult = await downloadBuffer(url);
      buffer = downloadResult.buffer;
      contentType = downloadResult.contentType;
    } catch (error) {
      return {
        ok: false,
        status: 502,
        message: `Gagal download dari URL: ${error.message}`
      };
    }
    const fileExtension = guessExt(contentType, url, buffer);
    const mimeType = guessMime(fileExtension);
    const generatedFilename = generateFilename(fileExtension);
    try {
      await uploadSupabase(buffer, generatedFilename, mimeType);
    } catch (error) {
      return {
        ok: false,
        status: 500,
        message: error.message
      };
    }
    const localUrl = `${getBaseUrl(req)}/${generatedFilename}`;
    return {
      ok: true,
      result: {
        url: localUrl,
        filename: generatedFilename,
        size_bytes: buffer.length,
        mime_type: mimeType,
        original_url: url
      }
    };
  }
};
