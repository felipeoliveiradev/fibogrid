# FiboGrid site

Next.js (App Router) marketing + docs site for [fibogrid](https://www.npmjs.com/package/fibogrid).

Replaces the old Vite GitHub Pages demo as the public face of the package.

## Develop

```bash
cd site
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Docs are synced from `../docs` into `content/docs` on `predev` / `prebuild` (`npm run docs:sync`).

## Build

```bash
npm run build
npm start
```

## Deploy (Vercel)

1. Import the `fibogrid` GitHub repo in Vercel.
2. Set **Root Directory** to `site`.
3. Set env `NEXT_PUBLIC_SITE_URL` to your production origin (e.g. `https://fibogrid.dev`).
4. Deploy. Turn off GitHub Pages in the repo settings when the custom domain points here.

## Stack

- Next.js 16 + React 19
- Tailwind CSS 4
- `react-markdown` + `remark-gfm` for docs
