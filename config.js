module.exports = {
  server: {
    port: process.env.PORT || 4002,
    host: process.env.HOST || '0.0.0.0',
  },
  supabase: {
    url: process.env.SUPABASE_URL || 'https://cwryyrxduuyxbqdnmxqe.supabase.co',
    serviceKey: process.env.SUPABASE_SERVICE_KEY || '',
    bucket: process.env.SUPABASE_BUCKET || 'elynn-media',
  },
  smtp: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
};
