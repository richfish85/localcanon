# Product brief

## Basis

Based on the available excerpt of **LocalCanon_discussion**, dated 6 September 2026, plus its original saved Bandung moodboard. The full conversation is not present as a source file in this workspace. This document distinguishes decisions visible in that excerpt from implementation choices made for the starter.

## Decisions from the discussion

- A complete, travel-guide-adjacent regional page with the feel of a high-end magazine.
- Culture organised around a region, rather than a generic catalogue detached from place.
- Secondary views can resemble the landing page with a less prominent hero.
- Music can be sorted by year, artist and genre, with a featured song and a featured local artist.
- Include a representative traditional or classical sample before contemporary/pop artists. Do not assume every local tradition is best classified as Western classical music.
- Separate visitor and business layers, each able to develop its own subcategories.
- Begin with Bandung and Kanazawa.

## Moodboard observations

The saved design shows a documentary-style Bandung hero, dark green navigation, photographic theme tiles, a large craft story, community voices and a regional landscape. Themes shown are people, food, music, dance, language, fashion, beliefs, craft and events. Handwritten annotations suggest image fades, headline changes and theme carousels; these are visual ideas, not requirements implemented in the starter.

The moodboard includes a **Pekalongan batik** story. Pekalongan should retain its own geographic attribution, even if it is presented as a related-region story on a Bandung page. The starter does not relabel it as Bandung craft.

## Product position

LocalCanon is a cultural archive that can help a visitor understand and explore a place. Local businesses and cultural practitioners can eventually participate through a separate layer. Cultural stories should remain useful and credible independently of commercial listings.

## Starter implementation choices

- Plain JavaScript and CSS, with a small Node development server; no framework or package installation required.
- Hash routes make region, audience and theme navigation work without a backend.
- A small in-code content collection establishes evidence and geographic scope.
- Six local Unsplash photographs now support the hero, photo tiles and editorial spread, with explicit captions and credits. Artist selection, audio links and local listings remain research tasks.
- Business categories are proposed scaffolding; profile ownership and submission flows need product decisions before implementation.

## Initial audiences

| Audience | Goal | First useful surface |
| --- | --- | --- |
| Visitor / learner | Understand regional culture and follow personal interests | Regional overview, themes, stories and music |
| Local maker / business | Explain their practice and connect with interested visitors | Business categories and, later, attributable profiles |
| Contributor / editor | Add local knowledge and correct misrepresentation | Future contribution and review workflow |

No claim is made that this first prototype supports booking, transactions, real-time tourism information or a complete local directory.

### 11 October 2026: Melbourne manual collection

Melbourne is now the third regional view, with a manually sourced collection of eight festivals, six artists and performers, and eight cultural places. Festival records retain edition dates, Melbourne time zone, source checks and past-edition labels. Country acknowledgement is visible on both Melbourne audience views. Contributor permissions remain unchanged; the accompanying database migration permits Melbourne and the art/places themes. Assisted onboarding options are in docs/MELBOURNE_PILOT.md; they are proposals, not validated demand.

## 11 October 2026 — Find Melbourne Conversation

Richard describes LocalCanon as a preservation and retrieval framework centred on local cultural identity, helping people connect with local history. People can develop its uses within the framework without destructive participation. Preserve attributed disagreement and corrections rather than promise final rulings on cultural origins.

Community-rating filters and approval-order navigation are proposed ways to compare claims; neither popularity nor editorial approval establishes truth or current availability. Future business tags should lead readers to a relevant page and direct contact route so they can check information themselves. Begin with durable tourist-centre and government information; build towards near-real-time interaction gradually. Business tagging, public discussion sorting and real-time services are not implemented. See README for the full consolidated direction and source boundary.
