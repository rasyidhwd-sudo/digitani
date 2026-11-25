/** @type {import('next').NextConfig} */
module.exports = {
  experimental: {
    // data/*.json (basis pengetahuan dan data awal) dibaca lewat path dinamis (lib/db.js), jadi harus disertakan manual ke bundel serverless (Vercel).
    outputFileTracingIncludes: { '/**/*': ['./data/**/*'] },
    serverComponentsExternalPackages: ['mongodb'],
  },
};
