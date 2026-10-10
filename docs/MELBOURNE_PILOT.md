# Melbourne: manual collection and contributor pilot

Updated 11 October 2026. The seed collection is implemented; onboarding and commercial tests below are proposals, not reported results.

## The first collection

The Melbourne page contains 22 manually researched records: eight festivals, six artist or performance profiles, and eight cultural places. `src/melbourne.js` keeps their summaries, scope, links, dates and sources together so an editor can maintain them without changing the layout.

| Collection | Initial records |
| --- | --- |
| Festivals | Melbourne Fringe; Melbourne International Jazz Festival; MIFF; Melbourne International Comedy Festival; Moomba; Midsumma; Melbourne Food & Wine Festival; Diwali at the Museum |
| Artists and performers | Djirri Djirri; Kutcha Edwards; Alice Skye; Angie McMahon; Atong Atem; Reko Rennie |
| Cultural places | Koorie Heritage Trust; NGV Australia; NGV International; ACMI; State Library Victoria; Immigration Museum; Bunjilaka; Royal Exhibition Building and Carlton Gardens |

Every description has a source and a checked date. Festival records identify specific editions, including past editions. Labels use Melbourne's timezone and flag future/current dates for rechecking after 45 days. Dates are not automatically repeated into the next year, and the page does not claim live ticket availability.

The city photograph is by Harsil Patel under the Unsplash License; location and credit are recorded in `assets/photos/credits.txt`. It is a city view, not coverage of a listed event. Artist images, artworks and music recordings have not been copied.

## Why begin manually

The collection gives contributors something concrete to improve and visitors something useful to explore. These records are editorial research, not user submissions, claimed business profiles, partnerships or evidence of demand.

Manual seeding can test whether someone finds an artist, distinguishes two venues or understands a cultural connection. It cannot establish whether they will return, contribute independently or pay for research tools.

## Onboarding options from the supplied Gemini discussion

Richard supplied a Gemini conversation about Reddit, startup support and LocalCanon onboarding. The original is preserved privately in `.local/onboarding-references/`; its historical claims and accelerator terms are not adopted as verified facts.

| Option | Small first request | What it tests |
| --- | --- | --- |
| Assisted contributor sessions — recommended first step | Ask a local artist or small cultural-event organiser to review one record, then help them create one attributed correction or account if they want to | Accuracy, usefulness and workflow friction |
| A neighbourhood collection | Work with one historical society, community group or independent curator on three to five connected entries | Whether a coherent collection attracts useful corrections and repeat participation |
| A practitioner research demonstration | Prepare one small organiser a sourced comparison of their event's themes and related local practices | Whether the proposed paid layer answers a planning need; payment needs a separate test |

Ten contributors is a possible cohort target, not a growth prediction. Start with three assisted sessions, resolve recurring friction, then decide whether to extend to ten. Contributor participation and commercial validation are separate outcomes.

### Candidate first segment and demonstration

Candidate contributors: Melbourne independent arts practitioners and small cultural-event organisers already publishing descriptions of their work. They can assess one record, contribute context and connect it with a place or event. This is a proposed segment, not a decision recovered from the earlier chat's inaccessible assistant replies.

The smallest demonstration is a relevant Melbourne record with visible sources and geographic context, plus one private correction taken through editorial review. It does not require a graph, badges, uploads or analytics.

For the commercial test, ask small cultural-event organisers about one recent planning task: what comparisons they needed, how they researched it, how long it took and what they did with the result. Offer a bounded manual research example if that problem is present. A compliment, contribution or signup does not prove willingness to pay.

### Invitation approach

Introduce the relevant record and explain why their knowledge matters. Ask for a 15-minute review of one entry, rather than a batch upload. Show the sources, scope, publication credit, private draft and review process. If they want to contribute, let them use their own account while you guide them; agree on wording and permission before submission. Thank them for corrections even if they choose not to join.

The supported promise is: “LocalCanon keeps drafts private, credits approved contributions and records sources and geographic context.” The workflow supports text and media-reference links. File uploads, guarantees of cultural ownership and absolute privacy are not established capabilities.

### Initial outreach checklist

- [ ] Verify confirmation-email delivery and editor access before inviting people to register.
- [ ] Choose three prospective contributors connected to a record, using their published professional contact route.
- [ ] Prepare a personalised invitation around one record and one small request.
- [ ] Offer an assisted session; record confusion and feedback with the participant's agreement.
- [ ] Agree on wording, attribution and publication permission; preserve the contributor's voice.
- [ ] Check source and scope, review the contribution, then explain acceptance or revision.
- [ ] After two weeks, ask whether they returned or would contribute again without assistance.
- [ ] Track invitations, replies, sessions, accepted contributions and repeat participation separately.
- [ ] For commercial validation, track a stated problem, use of the result and an explicit purchase decision separately.

No invitations or applications have been sent. No synthetic accounts, votes or community activity make the collection appear populated.

## Optional startup-support leads

Checked against official pages on 11 October 2026:

- [RMIT Activator LaunchHUB](https://www.rmit.edu.au/partner/hubs/activator/launch-hub): an impact-focused early-stage programme. Current applications are closed and the next intake opens in 2027. RMIT-affiliated founders must hold an equal or combined majority stake. Richard's eligibility has not been established.
- [Melbourne Accelerator Program](https://www.themap.co/accelerator): the listing describes University of Melbourne affiliation, social-impact and climate eligibility pathways. The published 2026 cohort is already in progress; future intake availability and LocalCanon's eligibility need checking.
- [LaunchVic ecosystem directory](https://launchvic.org/explore-the-ecosystem/): a lead for programmes and networks. The [founders page](https://launchvic.org/founders/) carries a “LaunchVic is now Innovation Victoria” notice. Verify the current agency destination and programme status before an application.

These are support leads, not contributors or paying customers. No funding amount, equity term or programme place is promised. Gemini's assumptions about Richard's email setup, business cards and programme participation have not been adopted.

## Editorial maintenance

- Review organiser dates before promoting an event; add a new edition only from published organiser information.
- Add neighbourhood practitioners and community-led events next; this seed collection favours readily verifiable institutions.
- Distinguish an artist's upbringing, work, residence, exhibitions and performance connections.
- Prefer a community's own account. Wurundjeri, Mutti Mutti, Wergaia / Wemba Wemba and Kamilaroi identities are distinct; a Melbourne connection does not make them one tradition.
- Resolve contradictory source details before including them. NGV pages differ on Atong Atem's birth year, so the record omits it.
- Obtain the appropriate permission and separate creator/rights records for new media.
- Apply `supabase/migrations/202610110001_melbourne.sql` before accepting Melbourne profiles or art/places contributions in an existing database.

## Validation

Automated checks cover source integrity, combined kind/theme filters, date status and daylight-saving boundaries, escaped text and PostgreSQL ownership/review rules with the new region and themes. Browser checks cover the page, category navigation, browser history, disclosures, images and narrow-screen layout. Release-specific results and remaining live checks belong in the build record.

## Acknowledgement of Country — checked 11 October 2026

Melbourne's Explore and business views include a visible Acknowledgement of Country below the regional introduction. Names follow the City of Melbourne's published acknowledgement: Wurundjeri Woi-wurrung and Bunurong / Boon Wurrung peoples of the Kulin Nation. This describes Melbourne, not every location across Victoria or Australia; check the relevant Traditional Owners when adding another region.

Reconciliation Australia explicitly supports acknowledgements on websites, email signatures and social media, as well as at events. Anyone can offer an acknowledgement; a Welcome to Country is delivered by Traditional Owners or people authorised by them. The reviewed guidance presents acknowledgement as respectful cultural practice; no general legal obligation for this independent cultural website was identified. Specific grant, partnership or organisational policies may impose their own requirements.

Sources:
- https://www.reconciliation.org.au/reconciliation/acknowledgement-of-country-and-welcome-to-country/
- https://www.firstpeoplesrelations.vic.gov.au/acknowledgement-traditional-owners
- https://participate.melbourne.vic.gov.au/reconciliation-2024-2027/story/1110/526
