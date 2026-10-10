# LocalCanon

A living cultural archive connecting places, people, practices and their sources, with a visitor guide and a future local business layer. The regional pages cover **Melbourne, Australia**, **Bandung, Indonesia** and **Kanazawa, Japan**. Melbourne / Victoria is the starting point for the commercial validation pilot.

This repository translates the available `LocalCanon_discussion` excerpt and its saved moodboard into a runnable local foundation. The product direction below also consolidates Richard's messages in **LocalCanon Discussion 10 Oct 26**. It is an initial prototype, not a complete archive or booking service.

## Product direction — consolidated 11 October 2026

These are intended product rules and proposals, not a list of shipped features. The regional demonstrations remain useful for editorial development; Melbourne / Victoria is the starting point for testing commercial usefulness.

### Cultural connections and participation

- Everyone should be able to contribute local knowledge. Whether a contribution or source is officially recognised must be explicit; community participation, editorial acceptance and official recognition are different things.
- A public visual graph should show sourced connections and mentions across regions. A mention or shared practice does not establish its birthplace, exclusive ownership or authenticity. Contested origins can remain unresolved while readers explore the evidence.
- Public contributions should retain attribution, sources and correction history. The intended contributor record shows mistakes, whether they were fixed, and the wider contribution history, so readers can judge patterns and responsiveness in context.
- The archive should preserve cultural knowledge even as practices or businesses fall out of favour. New local variants and cultural events can sit alongside older traditions with clear attribution and context.

A richer archive is intended to encourage discovery, visits and regional cultural activity. That relationship is a product hypothesis to test; it is not evidence of increased tourism or income.

### Contribution, promotion and credibility

Users should be able to share photographs and support businesses, with **contribution** and **promotion** visibly distinguished. Commercial relationships and offers need clear disclosure. Business deals are the business's responsibility, subject to applicable rules; the platform should not encourage contributions made to obtain freebies.

The proposed recognition system separates activity from credibility:

- Points are non-exchangeable trust signals, not currency or rewards redeemable for benefits.
- An XP badge can indicate activity. A recognition badge can indicate a sustained record of accepted corrections; each accepted correction earns a point rather than a new badge.
- Thumbs up and thumbs down can affect a contribution point. Richard proposed removing that point at a **3:1 thumbs-down-to-thumbs-up ratio**. Losing a point records disagreement, not a finding of malicious behaviour.
- Badge thresholds, eligible voters, minimum vote counts, zero-upvote handling, manipulation controls and review or appeal rules still need definition. Popularity must not replace source review or resolve disputed cultural claims.

Public correction records also need visibility and privacy rules before implementation. The current app retains private profiles unless users opt into public visibility, and private editorial feedback remains private.

### Proposed paid research and curation tools

The intended paid layer helps practitioners, businesses and regional curators understand how their terms and offerings relate to the wider archive. The public graph and contributions remain visible; payment should not buy credibility or official recognition.

| Proposed tier | Illustrative tools |
| --- | --- |
| Entry | Keyword mentions by place, search counts for a selected day/week/month/year, and a credibility indicator |
| Middle | Entry tools plus search trends shown as graphs and related terms |
| Advanced | Middle tools plus terms to test, seasonal comparisons, comparable businesses or offerings, and measures of distinctiveness |

The discussion's Rendang counts and credibility scale were examples, not collected data. Tier names, prices, scoring methods, comparison coverage and analytics are not implemented or validated. A count of mentions measures coverage in the dataset; it cannot establish cultural origin, ownership or worldwide uniqueness.

### First commercial validation pilot

Richard selected **Melbourne / Victoria** as the first commercial validation location. The next work is to choose one specific customer segment, define the smallest credible demonstration and prepare an initial outreach plan.

Those details are still open in the accessible source messages. Validate a concrete customer's research or curation need before expanding the dashboard or treating the tier proposals as a commercial offer. Bandung and Kanazawa remain the current archive demonstrations; the manually researched Melbourne records are now implemented (see below); no customer results are claimed.

**Source boundary:** all five user messages in the named discussion were available to review. Its assistant replies were returned only as content-reference markers, so recommendations contained in those replies could not be verified. Earlier brief and roadmap sections retain historical scope; this dated section records the later product direction.

## Melbourne manual collection — 11 October 2026

Open `#melbourne/visitor/all` or choose Melbourne from the region selector. The first collection contains **22 sourced entries: eight festivals, six artists or performance groups, and eight cultural places**. Browse by collection and theme, inspect each entry’s geographic context and sources, and follow organiser, artist or venue links.

Festival editions carry exact dates, Melbourne-time date labels and a reminder to recheck stale future dates. Past editions remain visible as archive records. The listening room begins with Djirri Djirri’s living Wurundjeri song and dance, followed by Alice Skye’s linked artist profile. A credited Melbourne city photograph is stored locally.

See [Melbourne collection and onboarding pilot](docs/MELBOURNE_PILOT.md) for maintenance guidance, options drawn from the supplied Gemini discussion, a proposed small contributor cohort and separate commercial-validation steps. For existing community databases, apply `supabase/migrations/202610110001_melbourne.sql` before enabling the new region and art/places themes.

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
- Seven local Unsplash photos at up to 2400px wide, visible photographer credits, and a filename-to-credit text file in `assets/photos/credits.txt`.
- A three-photo feature carousel for Bandung and Kanazawa, with previous/next controls and a subtle CSS film treatment that preserves the downloaded files.
- Melbourne/Bandung/Kanazawa switching, shareable hash routes and browser back/forward navigation.
- Visitor theme browsing: people, food, music, dance, language, fashion, beliefs, craft, events, art and cultural places.
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
| `src/melbourne.js` | Melbourne seed records, sources, dated festivals and regional context |
| `src/archive-view.js` | Sourced entry rendering, festival dates and Melbourne collection navigation |
| `src/data.js` | Regions, cultural entries, source records and filters |
| `src/photos.js` | Photo captions, geographic scope, credits and regional collections |
| `assets/photos/` | Seven local JPEGs and `credits.txt` |
| `src/styles.css` | Responsive editorial visual system |
| `src/community.js` / `src/community-api.js` | Account, profile, contribution and editorial review interfaces |
| `src/community-model.js` / `src/contribution-flow.js` | Profile validation and contribution workflow rules |
| `scripts/server.mjs` | Dependency-free local HTTP server |
| `tests/content.test.mjs` | Content integrity, filters and server checks |
| `docs/PROJECT_BRIEF.md` | Discussion-derived scope and product principles |
| `docs/CONTENT_MODEL.md` | Initial entities and evidence rules |
| `docs/ROADMAP.md` | Next implementation and research steps |
| `docs/MELBOURNE_PILOT.md` | Manual-population maintenance and proposed onboarding options |
| `docs/COMMUNITY_SETUP.md` | Supabase setup, publication rules and access validation |
| `docs/references/` | Original design reference and provenance |

## Content and limitations

The small seed collection contains source-backed introductions, not verified local listings. UNESCO’s angklung record supports an Indonesian cultural description; it does not establish a particular Bandung artist or venue. No fabricated performers, tracks, businesses, events, pricing or opening hours are included.

The seven photographs provide a first editorial image collection. Themes without a suitable photograph use typography tiles until accurately attributed imagery is available. The original moodboard and three subsequent layout references are preserved separately. Accounts, profiles and reviewed text contributions are implemented with Supabase. The public cultural graph, public correction-history summaries, contribution/promotion classification, points, voting, badges and paid analytics are planned. Audio, media uploads, payment, booking and business verification remain future work. See the dated product direction above and the roadmap before expanding those features.

Published app: https://localcanon.vercel.app/

Legacy Pages address: https://richfish85.github.io/localcanon/ (redirects to the app after the migration workflow completes).

Source: https://github.com/richfish85/localcanon

A project by [Richard Fisher](https://richardfisher.dev). Composite design references are preserved in the local workspace and excluded from the public repository because their image rights have not been verified. The seven site photographs retain their individual Unsplash credits. A software licence has not been chosen; public visibility does not grant a general reuse licence.

The Melbourne introduction also includes an **Acknowledgement of Country**, using the City of Melbourne's published Traditional Owner names. Website acknowledgements are supported by Reconciliation Australia's guidance; this is respectful practice, not a claim of a general statutory website requirement. See `docs/MELBOURNE_PILOT.md` for sources and scope.
