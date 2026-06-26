'use strict';

const axios = require('axios');

const TMDB_KEY  = process.env.TMDB_API_KEY || '38848580ecf951f1f6022cdea13257e0';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const IMG_BASE  = 'https://image.tmdb.org/t/p';

const POSTER_SIZE   = 'w500';
const BACKDROP_SIZE = 'w1280';
const THUMB_SIZE    = 'w185';

function buildEmbeds(tmdbId, type = 'movie', season = null, episode = null) {
  const isTV = type === 'tv';
  const embeds = {};

  if (isTV && season && episode) {
    embeds['VidSrc TO']      = `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`;
    embeds['Embed SU']       = `https://embed.su/embed/tv/${tmdbId}/${season}/${episode}`;
    embeds['VidLink Pro']    = `https://vidlink.pro/embed/tv/${tmdbId}/${season}/${episode}`;
    embeds['VidSrc CC']      = `https://vidsrc.cc/v2/embed/tv/${tmdbId}/${season}/${episode}`;
    embeds['AutoEmbed']      = `https://player.autoembed.cc/embed/tv/${tmdbId}/${season}/${episode}`;
    embeds['MultiEmbed']     = `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`;
    embeds['SmashyStream']   = `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}&season=${season}&episode=${episode}`;
  } else {
    embeds['VidSrc TO']      = `https://vidsrc.to/embed/movie/${tmdbId}`;
    embeds['Embed SU']       = `https://embed.su/embed/movie/${tmdbId}`;
    embeds['VidLink Pro']    = `https://vidlink.pro/embed/movie/${tmdbId}`;
    embeds['VidSrc CC']      = `https://vidsrc.cc/v2/embed/movie/${tmdbId}`;
    embeds['AutoEmbed']      = `https://player.autoembed.cc/embed/movie/${tmdbId}`;
    embeds['MultiEmbed']     = `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`;
    embeds['SmashyStream']   = `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}`;
  }

  return embeds;
}

function img(path, size = POSTER_SIZE) {
  if (!path) return null;
  return `${IMG_BASE}/${size}${path}`;
}

function formatMovie(m) {
  return {
    id:          m.id,
    title:       m.title || m.name,
    original:    m.original_title || m.original_name,
    type:        m.media_type || (m.first_air_date ? 'tv' : 'movie'),
    overview:    m.overview || null,
    rating:      m.vote_average ? parseFloat(m.vote_average.toFixed(1)) : null,
    votes:       m.vote_count   || 0,
    popularity:  m.popularity   ? parseFloat(m.popularity.toFixed(2)) : null,
    release:     m.release_date || m.first_air_date || null,
    language:    m.original_language || null,
    adult:       m.adult || false,
    poster:      img(m.poster_path, POSTER_SIZE),
    poster_thumb:img(m.poster_path, THUMB_SIZE),
    backdrop:    img(m.backdrop_path, BACKDROP_SIZE),
    genre_ids:   m.genre_ids || [],
  };
}

function formatDetailed(m, type = 'movie') {
  const base = {
    id:           m.id,
    title:        m.title || m.name,
    original:     m.original_title || m.original_name,
    type,
    tagline:      m.tagline || null,
    overview:     m.overview || null,
    status:       m.status || null,
    rating:       m.vote_average ? parseFloat(m.vote_average.toFixed(1)) : null,
    votes:        m.vote_count   || 0,
    popularity:   m.popularity   ? parseFloat(m.popularity.toFixed(2)) : null,
    release:      m.release_date || m.first_air_date || null,
    language:     m.original_language || null,
    languages:    m.spoken_languages?.map(l => l.english_name) || [],
    adult:        m.adult || false,
    homepage:     m.homepage || null,
    imdb_id:      m.imdb_id || m.external_ids?.imdb_id || null,
    poster:       img(m.poster_path, POSTER_SIZE),
    poster_thumb: img(m.poster_path, THUMB_SIZE),
    backdrop:     img(m.backdrop_path, BACKDROP_SIZE),
    genres:       m.genres?.map(g => g.name) || [],
    production:   m.production_companies?.map(c => ({ name: c.name, country: c.origin_country, logo: img(c.logo_path, 'w185') })) || [],
    countries:    m.production_countries?.map(c => c.name) || [],
  };

  if (type === 'movie') {
    base.runtime    = m.runtime || null;
    base.budget     = m.budget  || null;
    base.revenue    = m.revenue || null;
    base.collection = m.belongs_to_collection ? {
      id:       m.belongs_to_collection.id,
      name:     m.belongs_to_collection.name,
      poster:   img(m.belongs_to_collection.poster_path),
      backdrop: img(m.belongs_to_collection.backdrop_path, BACKDROP_SIZE),
    } : null;
  }

  if (type === 'tv') {
    base.first_air      = m.first_air_date || null;
    base.last_air       = m.last_air_date  || null;
    base.seasons        = m.number_of_seasons  || null;
    base.episodes       = m.number_of_episodes || null;
    base.episode_runtime= m.episode_run_time?.[0] || null;
    base.in_production  = m.in_production || false;
    base.networks       = m.networks?.map(n => ({ name: n.name, logo: img(n.logo_path, 'w185') })) || [];
    base.created_by     = m.created_by?.map(c => ({ name: c.name, profile: img(c.profile_path, 'w185') })) || [];
    base.season_list    = m.seasons?.map(s => ({
      id:           s.id,
      name:         s.name,
      season_number:s.season_number,
      episodes:     s.episode_count,
      air_date:     s.air_date,
      overview:     s.overview,
      poster:       img(s.poster_path),
    })) || [];
  }

  return base;
}

async function tmdb(endpoint, params = {}) {
  const url = `${TMDB_BASE}${endpoint}`;
  const res  = await axios.get(url, {
    params: { api_key: TMDB_KEY, language: 'id-ID', ...params },
    timeout: 12000,
  });
  return res.data;
}

async function actionSearch(q, type = 'multi', page = 1) {
  const ep = type === 'movie' ? '/search/movie'
           : type === 'tv'    ? '/search/tv'
           : '/search/multi';

  const data = await tmdb(ep, { query: q, page, include_adult: false });

  const results = (data.results || [])
    .filter(r => ['movie', 'tv'].includes(r.media_type || type))
    .map(r => {
      const m = formatMovie(r);
      if (r.media_type) m.type = r.media_type;
      else m.type = type;
      return m;
    });

  return {
    ok: true,
    action: 'search',
    query: q,
    type,
    page,
    total_results: data.total_results,
    total_pages:   data.total_pages,
    results,
  };
}

async function actionDetail(id, type = 'movie') {
  const [detail, credits, videos, externalIds] = await Promise.all([
    tmdb(`/${type}/${id}`, { append_to_response: 'keywords' }),
    tmdb(`/${type}/${id}/credits`),
    tmdb(`/${type}/${id}/videos`),
    tmdb(`/${type}/${id}/external_ids`),
  ]);

  detail.external_ids = externalIds;

  const cast = (credits.cast || []).slice(0, 20).map(c => ({
    id:         c.id,
    name:       c.name,
    character:  c.character,
    order:      c.order,
    profile:    img(c.profile_path, THUMB_SIZE),
    popularity: c.popularity ? parseFloat(c.popularity.toFixed(2)) : null,
  }));

  const crew = (credits.crew || [])
    .filter(c => ['Director', 'Producer', 'Screenplay', 'Writer', 'Executive Producer'].includes(c.job))
    .map(c => ({
      id:      c.id,
      name:    c.name,
      job:     c.job,
      profile: img(c.profile_path, THUMB_SIZE),
    }));

  const trailers = (videos.results || [])
    .filter(v => v.site === 'YouTube' && ['Trailer', 'Teaser', 'Clip'].includes(v.type))
    .map(v => ({
      name:     v.name,
      type:     v.type,
      language: v.iso_639_1,
      key:      v.key,
      url:      `https://www.youtube.com/watch?v=${v.key}`,
      embed:    `https://www.youtube.com/embed/${v.key}`,
      thumb:    `https://img.youtube.com/vi/${v.key}/hqdefault.jpg`,
    }));

  const formatted = formatDetailed(detail, type);

  return {
    ok: true,
    action: 'detail',
    type,
    ...formatted,
    cast,
    crew,
    trailers,
    embed_players: buildEmbeds(id, type),
    keywords: detail.keywords?.keywords?.map(k => k.name) || detail.keywords?.results?.map(k => k.name) || [],
  };
}

async function actionTrending(type = 'all', window = 'week', page = 1) {
  const validType   = ['all', 'movie', 'tv'].includes(type) ? type : 'all';
  const validWindow = ['day', 'week'].includes(window) ? window : 'week';

  const data = await tmdb(`/trending/${validType}/${validWindow}`, { page });

  return {
    ok: true,
    action: 'trending',
    type: validType,
    window: validWindow,
    page,
    total_results: data.total_results,
    total_pages:   data.total_pages,
    results: (data.results || []).map(r => {
      const m = formatMovie(r);
      m.type = r.media_type || validType;
      return m;
    }),
  };
}

async function actionPopular(type = 'movie', page = 1) {
  const validType = type === 'tv' ? 'tv' : 'movie';
  const data = await tmdb(`/${validType}/popular`, { page });

  return {
    ok: true,
    action: 'popular',
    type: validType,
    page,
    total_results: data.total_results,
    total_pages:   data.total_pages,
    results: (data.results || []).map(r => ({ ...formatMovie(r), type: validType })),
  };
}

async function actionTopRated(type = 'movie', page = 1) {
  const validType = type === 'tv' ? 'tv' : 'movie';
  const data = await tmdb(`/${validType}/top_rated`, { page });

  return {
    ok: true,
    action: 'top_rated',
    type: validType,
    page,
    total_results: data.total_results,
    total_pages:   data.total_pages,
    results: (data.results || []).map(r => ({ ...formatMovie(r), type: validType })),
  };
}

async function actionNowPlaying(type = 'movie', page = 1) {
  const validType = type === 'tv' ? 'tv' : 'movie';
  const endpoint  = validType === 'tv' ? '/tv/on_the_air' : '/movie/now_playing';

  const data = await tmdb(endpoint, { page });

  return {
    ok: true,
    action: type === 'tv' ? 'on_the_air' : 'now_playing',
    type: validType,
    page,
    total_results: data.total_results,
    total_pages:   data.total_pages,
    dates:         data.dates || null,
    results: (data.results || []).map(r => ({ ...formatMovie(r), type: validType })),
  };
}

async function actionUpcoming(page = 1) {
  const data = await tmdb('/movie/upcoming', { page });

  return {
    ok: true,
    action: 'upcoming',
    type: 'movie',
    page,
    total_results: data.total_results,
    total_pages:   data.total_pages,
    dates:         data.dates || null,
    results: (data.results || []).map(r => ({ ...formatMovie(r), type: 'movie' })),
  };
}

async function actionDiscover(type = 'movie', params = {}) {
  const validType = type === 'tv' ? 'tv' : 'movie';

  const allowedParams = ['page', 'sort_by', 'with_genres', 'year', 'primary_release_year',
    'vote_average.gte', 'vote_average.lte', 'with_original_language', 'region',
    'first_air_date_year', 'with_networks', 'with_keywords'];

  const filtered = {};
  for (const k of allowedParams) {
    if (params[k] !== undefined && params[k] !== '') {
      filtered[k] = params[k];
    }
  }

  const data = await tmdb(`/discover/${validType}`, filtered);

  return {
    ok: true,
    action: 'discover',
    type: validType,
    filters: filtered,
    page:          filtered.page || 1,
    total_results: data.total_results,
    total_pages:   data.total_pages,
    results: (data.results || []).map(r => ({ ...formatMovie(r), type: validType })),
  };
}

async function actionRecommendations(id, type = 'movie', page = 1) {
  const validType = type === 'tv' ? 'tv' : 'movie';
  const data = await tmdb(`/${validType}/${id}/recommendations`, { page });

  return {
    ok: true,
    action: 'recommendations',
    id: parseInt(id),
    type: validType,
    page,
    total_results: data.total_results,
    total_pages:   data.total_pages,
    results: (data.results || []).map(r => ({ ...formatMovie(r), type: validType })),
  };
}

async function actionSimilar(id, type = 'movie', page = 1) {
  const validType = type === 'tv' ? 'tv' : 'movie';
  const data = await tmdb(`/${validType}/${id}/similar`, { page });

  return {
    ok: true,
    action: 'similar',
    id: parseInt(id),
    type: validType,
    page,
    total_results: data.total_results,
    total_pages:   data.total_pages,
    results: (data.results || []).map(r => ({ ...formatMovie(r), type: validType })),
  };
}

async function actionGenres(type = 'movie') {
  const validType = type === 'tv' ? 'tv' : 'movie';
  const data = await tmdb(`/genre/${validType}/list`);

  return {
    ok: true,
    action: 'genres',
    type: validType,
    genres: data.genres || [],
  };
}

async function actionPerson(id) {
  const [person, credits, images] = await Promise.all([
    tmdb(`/person/${id}`),
    tmdb(`/person/${id}/combined_credits`),
    tmdb(`/person/${id}/images`),
  ]);

  const knownFor = (credits.cast || [])
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, 15)
    .map(r => ({ ...formatMovie(r), type: r.media_type || 'movie' }));

  const photos = (images.profiles || []).slice(0, 10).map(p => img(p.file_path, 'w342'));

  return {
    ok: true,
    action: 'person',
    id: person.id,
    name:         person.name,
    biography:    person.biography || null,
    birthday:     person.birthday  || null,
    deathday:     person.deathday  || null,
    gender:       person.gender === 1 ? 'female' : person.gender === 2 ? 'male' : 'unknown',
    place_of_birth: person.place_of_birth || null,
    popularity:   person.popularity ? parseFloat(person.popularity.toFixed(2)) : null,
    profile:      img(person.profile_path, 'w342'),
    imdb_id:      person.imdb_id || null,
    homepage:     person.homepage || null,
    known_for_department: person.known_for_department || null,
    also_known_as: person.also_known_as || [],
    photos,
    known_for: knownFor,
  };
}

async function actionEmbed(id, type = 'movie', season = null, episode = null) {
  return {
    ok: true,
    action: 'embed',
    id: parseInt(id),
    type,
    season:  season  ? parseInt(season)  : null,
    episode: episode ? parseInt(episode) : null,
    embeds:  buildEmbeds(id, type, season, episode),
    note: 'Gunakan salah satu embed URL di atas sebagai src iframe untuk menonton.',
    iframe_example: `<iframe src="${Object.values(buildEmbeds(id, type, season, episode))[0]}" width="100%" height="500" frameborder="0" allowfullscreen></iframe>`,
  };
}

async function actionSeason(tvId, seasonNumber) {
  const data = await tmdb(`/tv/${tvId}/season/${seasonNumber}`);

  return {
    ok: true,
    action: 'season',
    tv_id:         parseInt(tvId),
    season_number: data.season_number,
    name:          data.name,
    overview:      data.overview || null,
    air_date:      data.air_date || null,
    poster:        img(data.poster_path),
    episodes: (data.episodes || []).map(ep => ({
      id:             ep.id,
      episode_number: ep.episode_number,
      name:           ep.name,
      overview:       ep.overview || null,
      air_date:       ep.air_date || null,
      runtime:        ep.runtime  || null,
      rating:         ep.vote_average ? parseFloat(ep.vote_average.toFixed(1)) : null,
      still:          img(ep.still_path, 'w300'),
      embed_players:  buildEmbeds(tvId, 'tv', seasonNumber, ep.episode_number),
    })),
  };
}

module.exports = {
  id:          'film-hub',
  category:    'Film',
  name: 'Film & TV Show Hub',
  method: 'GET|POST',
  path:        '/api/film',
  description: `Film & TV Show Hub lengkap berbasis TMDB API. Support pencarian, detail, trending, popular, top rated, rekomendasi, cast, trailer YouTube, dan embed player (vidsrc.to, vidlink.pro, autoembed.cc, 2embed.cc, dll). Bisa untuk movie maupun TV series.`,
  params: [
    { name: 'action',   required: true,  example: 'search',  description: 'Aksi: search | trending | popular | top_rated | now_playing | upcoming | detail | embed | season | discover | recommendations | similar | genres | person' },
    { name: 'q',        required: false, example: 'Avengers', description: 'Query pencarian (untuk action=search)' },
    { name: 'id',       required: false, example: '27205',   description: 'TMDB ID film/series/person' },
    { name: 'type',     required: false, example: 'movie',   description: 'Tipe media: movie | tv | all (default: movie)' },
    { name: 'page',     required: false, example: '1',       description: 'Halaman hasil (default: 1)' },
    { name: 'window',   required: false, example: 'week',    description: 'Window trending: day | week (default: week)' },
    { name: 'season',   required: false, example: '1',       description: 'Season number (untuk action=season atau embed TV)' },
    { name: 'episode',  required: false, example: '1',       description: 'Episode number (untuk embed TV)' },
    { name: 'sort_by',  required: false, example: 'popularity.desc', description: 'Sort untuk discover (popularity.desc, vote_average.desc, release_date.desc, dll)' },
    { name: 'with_genres', required: false, example: '28',  description: 'Filter genre by ID untuk discover (pisah koma untuk multi)' },
    { name: 'year',     required: false, example: '2024',    description: 'Filter tahun untuk discover' },
  ],

  async handler(req, getInput) {
    const action  = (getInput(req, 'action') || '').toLowerCase().trim();
    const q       = getInput(req, 'q');
    const id      = getInput(req, 'id');
    const type    = (getInput(req, 'type') || 'movie').toLowerCase();
    const page    = parseInt(getInput(req, 'page') || '1') || 1;
    const window_ = (getInput(req, 'window') || 'week').toLowerCase();
    const season  = getInput(req, 'season');
    const episode = getInput(req, 'episode');
    const sort_by = getInput(req, 'sort_by');
    const with_genres = getInput(req, 'with_genres');
    const year    = getInput(req, 'year');

    if (!action) {
      return {
        ok: false,
        status: 400,
        message: "Parameter 'action' wajib diisi.",
        available_actions: [
          'search', 'trending', 'popular', 'top_rated', 'now_playing',
          'upcoming', 'detail', 'embed', 'season', 'discover',
          'recommendations', 'similar', 'genres', 'person'
        ],
        example_usage: {
          search:          '/api/film?action=search&q=Avengers&type=movie',
          trending:        '/api/film?action=trending&type=all&window=week',
          popular:         '/api/film?action=popular&type=movie',
          top_rated:       '/api/film?action=top_rated&type=tv',
          now_playing:     '/api/film?action=now_playing&type=movie',
          upcoming:        '/api/film?action=upcoming',
          detail:          '/api/film?action=detail&id=27205&type=movie',
          embed:           '/api/film?action=embed&id=27205&type=movie',
          embed_tv:        '/api/film?action=embed&id=1396&type=tv&season=1&episode=1',
          season:          '/api/film?action=season&id=1396&season=1',
          discover:        '/api/film?action=discover&type=movie&with_genres=28&sort_by=popularity.desc',
          recommendations: '/api/film?action=recommendations&id=27205&type=movie',
          similar:         '/api/film?action=similar&id=27205',
          genres:          '/api/film?action=genres&type=movie',
          person:          '/api/film?action=person&id=500',
        },
      };
    }

    if (TMDB_KEY === 'YOUR_TMDB_API_KEY_HERE') {
      return {
        ok: false,
        status: 503,
        message: 'TMDB API key belum dikonfigurasi. Daftar gratis di https://www.themoviedb.org/settings/api lalu set env variable TMDB_API_KEY atau ganti TMDB_KEY di plugins/film.js.',
      };
    }

    try {
      switch (action) {
        case 'search': {
          if (!q) return { ok: false, status: 400, message: "Parameter 'q' wajib diisi untuk pencarian." };
          return await actionSearch(q, type, page);
        }

        case 'trending': {
          return await actionTrending(type, window_, page);
        }

        case 'popular': {
          return await actionPopular(type, page);
        }

        case 'top_rated': {
          return await actionTopRated(type, page);
        }

        case 'now_playing':
        case 'on_the_air': {
          return await actionNowPlaying(type, page);
        }

        case 'upcoming': {
          return await actionUpcoming(page);
        }

        case 'detail': {
          if (!id) return { ok: false, status: 400, message: "Parameter 'id' (TMDB ID) wajib diisi." };
          return await actionDetail(id, type === 'tv' ? 'tv' : 'movie');
        }

        case 'embed': {
          if (!id) return { ok: false, status: 400, message: "Parameter 'id' (TMDB ID) wajib diisi." };
          return await actionEmbed(id, type === 'tv' ? 'tv' : 'movie', season, episode);
        }

        case 'season': {
          if (!id)     return { ok: false, status: 400, message: "Parameter 'id' (TMDB TV ID) wajib diisi." };
          if (!season) return { ok: false, status: 400, message: "Parameter 'season' (nomor season) wajib diisi." };
          return await actionSeason(id, season);
        }

        case 'discover': {
          const discoverParams = { page };
          if (sort_by)      discoverParams['sort_by']      = sort_by;
          if (with_genres)  discoverParams['with_genres']  = with_genres;
          if (year) {
            if (type === 'tv') discoverParams['first_air_date_year'] = year;
            else               discoverParams['primary_release_year'] = year;
          }
          for (const [k, v] of Object.entries(req.query || req.body || {})) {
            const extra = ['vote_average.gte', 'vote_average.lte', 'with_original_language', 'region', 'with_keywords'];
            if (extra.includes(k) && v) discoverParams[k] = v;
          }
          return await actionDiscover(type, discoverParams);
        }

        case 'recommendations': {
          if (!id) return { ok: false, status: 400, message: "Parameter 'id' wajib diisi." };
          return await actionRecommendations(id, type === 'tv' ? 'tv' : 'movie', page);
        }

        case 'similar': {
          if (!id) return { ok: false, status: 400, message: "Parameter 'id' wajib diisi." };
          return await actionSimilar(id, type === 'tv' ? 'tv' : 'movie', page);
        }

        case 'genres': {
          return await actionGenres(type);
        }

        case 'person': {
          if (!id) return { ok: false, status: 400, message: "Parameter 'id' (TMDB Person ID) wajib diisi." };
          return await actionPerson(id);
        }

        default: {
          return {
            ok: false,
            status: 400,
            message: `Aksi '${action}' tidak dikenal.`,
            available_actions: [
              'search', 'trending', 'popular', 'top_rated', 'now_playing',
              'upcoming', 'detail', 'embed', 'season', 'discover',
              'recommendations', 'similar', 'genres', 'person'
            ],
          };
        }
      }
    } catch (err) {
      if (err.response) {
        const status = err.response.status;
        const msg    = err.response.data?.status_message || err.message;

        if (status === 401) {
          return { ok: false, status: 401, message: 'TMDB API key tidak valid atau belum diaktifkan. Cek di https://www.themoviedb.org/settings/api' };
        }
        if (status === 404) {
          return { ok: false, status: 404, message: `Data tidak ditemukan di TMDB. ${msg}` };
        }
        if (status === 429) {
          return { ok: false, status: 429, message: 'Rate limit TMDB tercapai. Coba lagi sebentar.' };
        }
        return { ok: false, status, message: msg };
      }

      return { ok: false, status: 502, message: `Gagal menghubungi TMDB: ${err.message}` };
    }
  },
};
