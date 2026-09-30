# Colour system

The shared direction is defined in [SHARED_DESIGN_GUIDELINES.md](SHARED_DESIGN_GUIDELINES.md). The prototype now uses spacing, alignment and content structure in place of decorative one-sided accent borders.

Updated at Richard's request on 30 September 2026. Keep the majority of the page white. Use navy as the primary brand colour, orange and yellow for lively accents, and red for featured content.

| Role | Colour | Use |
| --- | --- | --- |
| Main surface | `#FFFFFF` | Page, header, region introduction and archive |
| Body text | `#282B32` | Soft off-black prose |
| Primary navy | `#142F61` | Brand, headings, active navigation and footer |
| Orange | `#FF8A24` | Navigation selection, focus outlines and link accents |
| Yellow | `#FFD34E` | Pilot badge and active-theme marker |
| Featured red | `#C9343F` | Featured-song label |
| Secondary text | `#596273` | Captions and supporting text |
| Pale blue | `#F2F5FB` | Empty-state surface and sourced badges |
| Pale yellow | `#FFF8DE` | Research badges and control hover treatment |
| Pale red | `#FFF3F2` | Reserved for a future meaningful featured surface |

Bright orange and yellow work as accents and selected backgrounds. Use navy or dark text on those colours, rather than bright accent colours for small text on white. Keep feature highlights red; research status retains its own warm, neutral treatment.

The original moodboard stays unchanged as a historical design reference. This palette supersedes its dark green treatment in the working prototype.

## Photographic editorial layout

The updated page follows Richard's visual references: a full-width photographic hero, a compact horizontal theme strip, then a split spread with a large image, an adjacent story panel and a navy neighbourhood sidebar. Sans-serif feature headlines match the central moodboard; serif typography remains in the listening room and archive.

Photographs receive a subtle, non-destructive CSS presentation (`saturate(.86) contrast(.96) sepia(.07)`). Downloaded JPEGs remain unchanged. A dark hero gradient supports readable white text; the context panel stays translucent white. The theme strip scrolls on small screens, and the feature/story/sidebar spread stacks vertically.

Each region has a manual three-photo feature carousel. Photos are used only for themes they plausibly depict. Geographic caveats and photographer credits remain accessible alongside the images. The photographs do not represent commissioned interviews or verified contributor profiles.

## Content structure

Business categories use a semantic list under one heading, paired with a plain directory update. These columns stack below 540px. The listening room uses two open text columns, traditional first, with typography and spacing providing the hierarchy. The photographic spread and navy community sidebar retain their distinct surfaces. Thin neutral archive separators, navigation selection and keyboard focus indicators retain their functional roles.
