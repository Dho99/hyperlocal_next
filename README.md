This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Importing open-licensed photos

Missing photos for destinations, UMKM, and accommodations can be matched against
Openverse search results. The importer only accepts CC0 or CC BY files and
saves the photographer, license, and source link in the image caption. It also
searches Wikimedia Commons directly for verified CC0/CC BY files, and can query
Flickr directly for CC0/CC BY 2.0 photos if `FLICKR_API_KEY` is configured.
Openverse already indexes some Flickr photos, so Flickr-hosted results may appear
even without a direct Flickr API key.

Create a Flickr API key from Flickr's API settings and add it to `.env` as
`FLICKR_API_KEY` to enable direct Flickr queries. Never commit the key.

Preview up to five missing records per entity type:

```bash
npm run photos:open:preview
```

Import matching photos into Cloudinary and the database:

```bash
npm run photos:open:apply
```

The importer only adds a photo to records that currently have no images. Google
Maps pages are not scraped, and Google Places photos are not copied into
Cloudinary; using Places photos requires compliant API display and attribution.

## Importing photos linked from OpenStreetMap

OpenStreetMap stores map data, not image files. This importer checks nearby
OpenStreetMap objects using the Nominatim search API for `wikimedia_commons`
tags, then uses the linked Commons file only when its license is public domain,
CC0, or CC BY and both object name and coordinates match the record.
Photographer, image license, Commons source, and OpenStreetMap object attribution
are saved with the image. OSM `image` URLs without a verifiable reusable license
are skipped.

Preview up to five coordinate-matched records per entity type:

```bash
npm run photos:osm:preview
```

Import matches for up to five records per entity type:

```bash
npm run photos:osm:apply
```

Only records with coordinates and no existing image are considered; requests
are made sequentially with a delay to respect Nominatim's public usage policy.
For a later batch, pass `--offset=5` (or another offset) to the script. The
per-run limit is capped at 25 records per entity type.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
