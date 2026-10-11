# Initial content model

The current model lives in `src/data.js`. Keep the content separate from rendering so it can move to JSON, a database or a content system later.

| Entity | Initial fields | Rule |
| --- | --- | --- |
| Region | ID, display name, local name, country, area, introduction, official guide | Do not treat city, province and country as interchangeable |
| Cultural entry | ID, region ID, theme, title, description, geographic scope, status, source IDs | State the scope actually supported by the evidence |
| Source | ID, title, publisher, URL, access date | Source the specific claim; an access date is not a publication date |
| Music metadata | Artist, year, genre, media | Unknown values remain null rather than fabricated |
| Business category | Category name | A proposed category is not a verified listing |

`sourced` means the displayed introductory description has evidence. It does not mean a venue, artist, geographic association or future business listing has been verified. `research` means an editorial proposal awaiting research. Both are explicit in the prototype.

## Next entities

- **Person / organisation:** local and preferred names, roles, regional relationships, authoritative links, consent and attribution.
- **Music work:** title, performer/composer relationships, date and date precision, language, genre, traditional/contemporary context and official listening link.
- **Media asset:** creator, original URL, licence or written permission, credit text, alternate text, associated entry and geographic accuracy.
- **Community story:** contributor, place, interview or original account, consent, editorial review and corrections.
- **Business profile:** category, regional location, contact, profile ownership, verification state and commercial disclosure.
- **Event / experience:** organiser, venue, date/time/timezone, authoritative source, last checked date and cancellation state.

## Publication discipline

An entry should explain whether it is about a city, a broader cultural region, a country or an explicitly related location. Connect people and organisations to regions with sourced relationships. Do not collapse a craft tradition, individual maker and paid experience into one record.

Use official music links before considering embedded media. Do not copy copyrighted audio or assume that an image search result grants reuse permission. Record sponsorship separately and never let payment act as cultural verification.

## 1 October 2026 — Persisted community records

`profiles` stores display name, bio, preferred region, regional connection, website and optional public visibility. Email and passwords remain in Supabase Auth.

`contributions` stores owner, contribution type, region/theme, title, text, geographic scope, evidence type, source URLs, optional media reference/creator/rights, consent, submission state and private review feedback. Writes go through ownership-checked functions.

`published_contributions` contains only approved publication snapshots with contributor credit. Corrections remain separate attributed notes. Withdrawal removes that snapshot. `private.editors` and `private.review_events` retain operator-assigned editorial membership and an audit trail outside the exposed API schema.

## 11 October 2026 — Melbourne editorial seed

`src/melbourne.js` supplies region metadata, source records and 22 entries merged by `src/data.js`. Entries add `kind` (festival, artist, place), location, official website, checked date and optional event `{start,end,edition,timezone}`. Dates are inclusive Melbourne local dates. Display labels distinguish past editions, dates within the published range, future published dates and sources needing recheck after 45 days; these are not live availability or cancellation checks. Artist relationships retain geographic caveats. Collection kind and cultural theme are independent filters.

Melbourne's acknowledgement describes the City of Melbourne's published Traditional Owner context. It is not a boundary map or a template naming the same peoples for all Victoria. Match future Australian region acknowledgements to local authoritative guidance. Community contributions continue to use the existing moderated records; kind filtering currently describes the editorial seed collection only.

## 11 October 2026 — Planned retrieval and business relationships

Find Melbourne Conversation proposes navigation by community rating and the order of editorial approval. Model these separately from evidence, official recognition, checked dates and publication state. Approval chronology needs an explicit timestamp and sort definition; it is not source freshness. Public discussion and ratings are not currently implemented.

A future business tag should link a contribution to a specific business entity, with identity, place, public contact route and claim/verification status. Preserve the distinction between a contributor's mention, a business's own response and supporting evidence. External links in current seed records do not create claimed business profiles. Near-real-time status should be a later capability with its own freshness rules; relatively durable sources also retain checked dates.
