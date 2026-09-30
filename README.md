# LocalCanon

A living cultural archive with a visitor guide and a future local business layer. The first pilot regions are **Bandung, Indonesia** and **Kanazawa, Japan**.

This repository translates the available `LocalCanon_discussion` excerpt and its saved moodboard into a runnable local foundation. It is an initial prototype, not a complete archive or booking service.

## Run locally

Requires Node.js 22. Install dependencies with `npm ci`. Copy `.env.example` to `.env.local` and fill in the Supabase project URL and publishable key for account features. Without these values, the archive works and the account page reports that registration is not connected.

```powershell
npm run dev
```

Open http://127.0.0.1:4173. Vite bundles the browser application; `npm run build` produces `dist` and `npm start` previews that build. The original standalone HTTP server is retained for path-safety regression tests.

```powershell
npm run check
npm test
```

The development server listens on the local computer only. Run `npx vite --port 4180` for another port.

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
- Email-confirmed registration, sign-in/out, confirmation resend and password recovery through Supabase Auth.
- Private contributor profiles with optional public visibility.
- Stories, corrections and suggestions saved as drafts and submitted to an editorial review queue.
- Source links, geographic scope, first-hand/documented evidence, media references and publication consent.
- Editor feedback, revision/resubmission, approval and withdrawal. Database rules protect ownership and publication.

See [Contributor setup and validation](docs/COMMUNITY_SETUP.md) for the deployment walkthrough, assumptions and access tests. Public email registration requires a configured SMTP provider; the current launch is labelled as a limited pilot until that is ready.

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

The six photographs provide a first editorial image collection. Themes without a suitable photograph use typography tiles until accurately attributed imagery is available. The original moodboard and three subsequent layout references are preserved separately. Accounts, profiles and reviewed text contributions are implemented with Supabase. Audio, media uploads, payment, booking and business verification remain future work. See the roadmap before expanding those features.

Published app: https://localcanon.vercel.app/

Legacy Pages address: https://richfish85.github.io/localcanon/ (redirects to the app after the migration workflow completes).

Source: https://github.com/richfish85/localcanon

A project by [Richard Fisher](https://richardfisher.dev). Composite design references are preserved in the local workspace and excluded from the public repository because their image rights have not been verified. The six site photographs retain their individual Unsplash credits. A software licence has not been chosen; public visibility does not grant a general reuse licence.
