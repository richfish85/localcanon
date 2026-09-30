# LocalCanon

A living cultural archive with a visitor guide and a future local business layer. The first pilot regions are **Bandung, Indonesia** and **Kanazawa, Japan**.

This repository translates the available `LocalCanon_discussion` excerpt and its saved moodboard into a runnable local foundation. It is an initial prototype, not a complete archive or booking service.

## Run locally

Requires Node.js 22 or later. There are no third-party runtime dependencies and no installation step.

```powershell
npm run dev
```

Open http://127.0.0.1:4173. If npm is unavailable, use `node scripts/server.mjs`.

```powershell
npm run check
npm test
```

To use a different port in PowerShell: `$env:PORT = '4180'`, then run the server. It listens on the local computer only.

## Included

- Responsive editorial layout using white surfaces, soft off-black body text, navy headings, orange/yellow accents and red featured highlights.
- A full-width photographic hero, compact theme tiles, and an editorial spread pairing a large photo/story panel with a navy neighbourhood sidebar.
- Six local Unsplash photos at up to 2400px wide, visible photographer credits, and a filename-to-credit text file in `assets/photos/credits.txt`.
- A three-photo feature carousel for each city, with previous/next controls and a subtle CSS film treatment that preserves the downloaded files.
- Bandung/Kanazawa switching, shareable hash routes and browser back/forward navigation.
- Visitor theme browsing: people, food, music, dance, language, fashion, beliefs, craft and events.
- A listening-room structure placing traditional music before contemporary artists and a featured song.
- Sorting by title, year, artist or genre. Artist/year values remain empty until research is available; absent values sort last.
- A business view introducing proposed directory categories. It does not accept submissions yet.
- Sourced cultural introductions with expandable context and research placeholders kept visibly distinct.
- Source integrity, navigation and local-server checks.

## Project map

| Path | Purpose |
| --- | --- |
| `index.html` | Accessible page shell |
| `src/app.js` | Rendering, routing and interface interactions |
| `src/data.js` | Regions, cultural entries, source records and filters |
| `src/photos.js` | Photo captions, geographic scope, credits and regional collections |
| `assets/photos/` | Six local JPEGs and `credits.txt` |
| `src/styles.css` | Responsive editorial visual system |
| `scripts/server.mjs` | Dependency-free local HTTP server |
| `tests/content.test.mjs` | Content integrity, filters and server checks |
| `docs/PROJECT_BRIEF.md` | Discussion-derived scope and product principles |
| `docs/CONTENT_MODEL.md` | Initial entities and evidence rules |
| `docs/ROADMAP.md` | Next implementation and research steps |
| `docs/references/` | Original design reference and provenance |

## Content and limitations

The small seed collection contains source-backed introductions, not verified local listings. UNESCO’s angklung record supports an Indonesian cultural description; it does not establish a particular Bandung artist or venue. No fabricated performers, tracks, businesses, events, pricing or opening hours are included.

The six photographs provide a first editorial image collection. Themes without a suitable photograph use typography tiles until accurately attributed imagery is available. The original moodboard and three subsequent layout references are preserved separately. Audio, login, database, payment, booking, business verification and contribution moderation remain future work. See the roadmap before expanding those features.

Published prototype: https://richfish85.github.io/localcanon/

Source: https://github.com/richfish85/localcanon

A project by [Richard Fisher](https://richardfisher.dev). Composite design references are preserved in the local workspace and excluded from the public repository because their image rights have not been verified. The six site photographs retain their individual Unsplash credits. A software licence has not been chosen; public visibility does not grant a general reuse licence.
