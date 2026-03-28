# The English Qur’an website

A GitHub-ready Next.js website prepared from the manuscript of **The English Qur’an**.

## What is included

- Translator name prominently shown on the home page
- Full English manuscript text for all 114 surahs
- Surah reader pages with **Arabic first, then English**
- Front matter and back matter pages from the manuscript
- Searchable surah list
- Static export support for GitHub Pages or any static host

## Important note on Arabic

The uploaded manuscript states that it is an **English rendering of the meanings**, while the Qur’an itself remains in the original Arabic. The manuscript file used for this build contains the English translation, not the Arabic verse text.

For that reason, the reader currently loads Arabic text in the browser from the public Qur’an endpoint at:

- `https://api.alquran.cloud/v1/surah/{surahNumber}/quran-uthmani`

If you want a fully self-contained static site, replace that runtime fetch with a local JSON file and commit it into `data/`.

## Install

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Because `output: 'export'` is enabled, the site can be deployed as static files.

## Main folders

- `app/` – pages and routes
- `components/` – reusable UI blocks
- `data/english-quran.json` – extracted English manuscript data
- `data/appendices.json` – extracted front matter and back matter
- `lib/data.ts` – shared data helpers