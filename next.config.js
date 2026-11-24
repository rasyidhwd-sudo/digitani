/** @type {import('next').NextConfig} */
module.exports = {
  // data/*.json dibaca lewat path dinamis (lib/db.js), jadi harus disertakan manual ke bundel serverless (Vercel).
  experimental: { outputFileTracingIncludes: { '/**/*': ['./data/**/*'] } },
};
