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
