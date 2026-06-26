# Elynn API — Plugin System

Plugin dimuat otomatis secara rekursif dari folder `plugins/`. Setiap plugin harus berada di dalam **subfolder kategori** — file `.js` di root `plugins/` diabaikan oleh loader.

---

## Struktur Folder

```
plugins/
├── film/
│   └── film.js
├── tools/
│   └── tourl.js
├── games/
│   ├── family100.js
│   ├── games-asahotak.js
│   ├── games-caklontong.js
│   ├── games-ccsd.js
│   ├── games-maths.js
│   ├── games-siapakahaku.js
│   ├── games-susunkata.js
│   ├── games-tebakbendera.js
│   ├── games-tebakjkt.js
│   ├── games-tebakkalimat.js
│   ├── games-tebakkartun.js
│   ├── games-tebakkata.js
│   ├── games-tebakkimia.js
│   ├── games-tebaklagu.js
│   ├── games-tebaklirik.js
│   ├── games-tebaklogo.js
│   ├── games-tebaktebakan.js
│   ├── games-tebakwarna.js
│   ├── games-tekateki.js
│   ├── lengkapikalimat.js
│   ├── tebakgambar.js
│   └── tebakgame.js
├── [kategori]/
│   └── [nama-plugin].js
└── README.md
```

> Nama folder = kategori plugin. Tapi field `category` di dalam file plugin yang menentukan tampilan di `/api/docs`.

---

## Cara Kerja Loader

- Scan rekursif semua subfolder di `plugins/`
- File `.js` langsung di root `plugins/` **tidak dimuat**
- Plugin valid harus punya: `id`, `path`, `handler`
- Plugin otomatis muncul di `/api/docs` sesuai `category`-nya

---

## Struktur Plugin

```js
'use strict';

module.exports = {
  id: 'kategori-nama',           // unik, huruf kecil, pakai dash
  name: 'Nama Plugin',           // nama tampil di docs
  category: 'Kategori',         // grup di docs (bebas, tapi konsisten)
  path: '/api/kategori/nama',   // endpoint, wajib diawali /api/, harus unik
  method: 'GET',                 // GET atau POST
  description: 'Deskripsi singkat endpoint ini.',

  params: [
    {
      name: 'q',
      required: true,
      example: 'keyword pencarian',

      // flag tipe media (opsional, untuk keperluan docs & UI)
      isImage: false,   // input berupa URL gambar
      isVideo: false,   // input berupa URL video
      isAudio: false,   // input berupa URL audio
      isDoc:   false,   // input berupa URL dokumen
      isMedia: false,   // input berupa URL media apapun (generic)
    }
  ],

  handler: async (req, res) => {
    const { q } = req.query;

    if (!q) return { ok: false, status: 400, message: 'Parameter q wajib.' };

    // logic di sini...
    const result = { data: 'contoh' };

    return {
      ok: true,
      result,
    };
  },
};
```

---

## Response Format

Handler cukup `return` object — jangan `res.json()` manual kecuali perlu handle stream/binary.

```js
// Sukses
return { ok: true, result: { ... } }

// Error
return { ok: false, status: 400, message: 'Pesan error.' }

// Kalau sudah handle res sendiri (stream, dll)
return { __handled: true }
```

---

## Config (`config.js`)

```js
module.exports = {
  server: {
    port: process.env.PORT || 4002,
    host: '0.0.0.0',
  },
  supabase: {
    url: 'https://your-project.supabase.co',   // ← isi manual
    serviceKey: 'your-service-role-key',        // ← isi manual (service_role)
    bucket: 'elynn-media',                      // ← nama bucket Supabase
  },
};
```

---

## Fitur To URL (`/api/tools/tourl`)

Download media dari URL eksternal → upload ke Supabase Storage → return link lokal.

**Request:**
```
GET /api/tools/tourl?url=https://example.com/video.mp4&apikey=xxx
```

**Response:**
```json
{
  "ok": true,
  "creator": "elynn",
  "result": {
    "url": "https://api.elynn.my.id/elynn12345678.mp4",
    "filename": "elynn12345678.mp4",
    "size_bytes": 4820123,
    "mime_type": "video/mp4",
    "original_url": "https://example.com/video.mp4"
  }
}
```

**Format yang didukung:**

| Tipe | Ekstensi |
|------|----------|
| Image | `.jpg` `.png` `.gif` `.webp` `.svg` `.bmp` `.avif` `.tiff` |
| Video | `.mp4` `.mkv` `.mov` `.webm` `.avi` `.flv` `.wmv` `.3gp` `.ts` |
| Audio | `.mp3` `.m4a` `.ogg` `.wav` `.aac` `.flac` `.opus` `.wma` |
| Dokumen | `.pdf` `.doc` `.docx` `.xls` `.xlsx` `.txt` `.csv` `.json` |
| Archive | `.zip` `.rar` `.7z` |
| Lainnya | `.apk` `.bin` |

---

## Plugin Aktif

| ID | Path | Kategori |
|----|------|----------|
| `film` | `/api/film` | Film |
| `tools-tourl` | `/api/tools/tourl` | Tools |
| `games-asahotak` | `/api/games/asahotak` | Games |
| `games-caklontong` | `/api/games/caklontong` | Games |
| `games-cc-sd` | `/api/games/cc-sd` | Games |
| `games-family100` | `/api/games/family100` | Games |
| `games-lengkapikalimat` | `/api/games/lengkapikalimat` | Games |
| `games-maths` | `/api/games/maths` | Games |
| `games-siapakahaku` | `/api/games/siapakahaku` | Games |
| `games-susunkata` | `/api/games/susunkata` | Games |
| `games-tebakbendera` | `/api/games/tebakbendera` | Games |
| `games-tebakgambar` | `/api/games/tebakgambar` | Games |
| `games-tebakgame` | `/api/games/tebakgame` | Games |
| `games-tebakjkt` | `/api/games/tebakjkt` | Games |
| `games-tebakkalimat` | `/api/games/tebakkalimat` | Games |
| `games-tebakkartun` | `/api/games/tebakkartun` | Games |
| `games-tebakkata` | `/api/games/tebakkata` | Games |
| `games-tebakkimia` | `/api/games/tebakkimia` | Games |
| `games-tebaklagu` | `/api/games/tebaklagu` | Games |
| `games-tebaklirik` | `/api/games/tebaklirik` | Games |
| `games-tebaklogo` | `/api/games/tebaklogo` | Games |
| `games-tebaktebakan` | `/api/games/tebaktebakan` | Games |
| `games-tebakwarna` | `/api/games/tebakwarna` | Games |
| `games-tekateki` | `/api/games/tekateki` | Games |
