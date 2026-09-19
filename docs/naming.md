# The name

Status: shortlist ready, decision with Marcia. Last worked 19 September 2026.

The design brief asks for ten more names, a shortlist of five, and how each reads in a text
message. This is that work, plus the clash research behind it. Bunting stays the working name
until Marcia says otherwise.

## What was measured, and what was not

Measured here: existing products using each name, by web search. Every clash below has a source.

**Not measured, and it cannot be from a build session:** domain availability. This environment
blocks RDAP, whois and every registrar, so nothing in this document claims a domain is free. The
domain and trade mark checks are Marcia's, and the list is at the bottom.

## Correction to the design brief

The brief's starter table says **Turnout** has "None found among invitation apps". That is wrong.
**Turnout RSVP** is a live RSVP app on Google Play (`com.turnout.rsvp`) doing close to what we are
doing: guest RSVP tracking, no signup for guests, shareable links and QR codes, push reminders.
That is a direct category clash, not a distant one. Turnout is out.

## The eight starters, re-checked

| Name | Verdict | What the check found |
| --- | --- | --- |
| Headcount | Weak | No invitation app, but the word is saturated in software: Planning Center Headcounts (event attendance), HeadCounter by beamian (venue counting), and headcount planning tools from ChartHop, Cube and Factorial. A plain descriptive word in a crowded field is also thin ground for a trade mark. |
| Turnout | Out | Turnout RSVP on Google Play. Direct clash. |
| Cooee | Risky | No invitation app, but busy in Australian tech: Cooee (global mobile numbers app), Cooe App (communications), Cooee Inc (outsourcing), Cooee Brands. Also worth Marcia's own judgement on using a word from Dharug in a commercial brand. |
| Pencil me in | Out | Too long for a text message, by the brief's own criteria. |
| Plus One | Out | Very common, several apps. |
| Count Me In | Out | Taken twice, per the brief. |
| Rollcall | Out | Existing invitation app, per the brief. |
| Yeah Nah | Out | Means no. |

## Ten more, as the brief asked

| Name | The story | Clash found |
| --- | --- | --- |
| Trestle | The trestle table. It is the design north star said out loud: the app is the good plate under the host's invite. Carries a wake, a fete and a 40th equally. | Several US software companies share it (identity APIs, construction, design QA, a 2012 acquisition). None in invitations. |
| Pennant | A single flag off the bunting string. Sharper and more ownable than Bunting, same warmth. | None found in invitations or events. |
| Wattle | Native, gentle, unmistakably Australian, and it holds both a birthday and a funeral. Ties to the Native garden illustration set. | Wattle EV (charger sharing), Wattle Software (Sydney, code editors), Wattle: Acacias of Australia. None in invitations. |
| Righto | The Australian yes, which is the thing the app collects. Warm, plain, works at a memorial. The brief's "one Australian expression". | None found. Needs a domain check. |
| Muster | To gather. Rural, plain, good for community events. | Muster, a US advocacy and campaign SaaS, listed on Australian software directories. |
| Tally | The count, said warmly. | Tally is major accounting software and the word is everywhere. |
| Sprig | A sprig of rosemary is remembrance, a sprig of wattle is home. Small and warm. | Sprig Technologies (formerly UserLeap), well funded, sprig.com. Occupied. |
| Verandah | Where Queenslanders actually gather. | Fails the brief's own test: three syllables, and nobody can spell verandah or veranda after hearing it once. |
| Knock | Arriving at someone's door. One syllable. | Common in US property tech. Needs a domain check. |
| Yonda | Made up, from "over yonder". The brief's "one made-up word". | None found, but a listener will write it "Yonder". That spelling ambiguity is fatal in a name whose whole job is to survive being read aloud. |

## The shortlist of five

Scored against the brief's own criteria: two syllables or fewer, spellable after one hearing, no
vite or invit, warm but not childish, must carry a 40th and a farewell, and must read naturally
in a text.

**1. Bunting** (the incumbent, recommended)
Strings of little flags, which is also exactly what the product is: one string, a flag for every
guest, each with their own link. Australian parents know bunting from every school fete.
Clean in the invitation category. Weakness: it is festive only, so it sits slightly off a
memorial, and it is a common noun, which makes the trade mark narrower.
Text: `bunting.app/i/abc`

**2. Trestle**
The set table. It says the design principle out loud and it carries every event type without
flinching, memorials included. Most distinctive of the five as a brand.
Weakness: "I've sent you a Trestle" does not land the way "I've sent you a Bunting" does, and
there are several unrelated Trestles in US software.
Text: `trestle.app/i/abc`

**3. Pennant**
Bunting's sharper sibling. Same flag imagery, more ownable, no clash found anywhere near this
category. Weakness: same festive-only limit as Bunting, and slightly more American (sports
pennants).
Text: `pennant.app/i/abc`

**4. Wattle**
The one on the list that is genuinely warm at a funeral and at a sixth birthday. Australian
without being a gag. Weakness: three existing Australian software uses, none in invitations, but
it makes the search result page crowded.
Text: `wattle.app/i/abc`

**5. Righto**
The reply itself, in Australian. Nobody else in this market speaks like this, which is one of the
six things the brief says sets the product apart. Weakness: the most likely of the five to read
as a joke by the third year, and unproven as a noun ("I've sent you a Righto" does not work,
though "reply on Righto" does).
Text: `righto.app/i/abc`

## Recommendation

**Keep Bunting**, and spend the effort on the trade mark and domain checks rather than on a
rename. It already passes every criterion in the brief except the memorial nuance, nothing in the
invitation category is using it, and the flag-per-guest metaphor is a better fit for the product
than any challenger produced. No name on this list clearly beats it, and the burden should be on a
challenger to beat the incumbent, not to tie with it.

**If the checks block it, go to Trestle.** It is the only candidate that carries every event type
and says something true about the design at the same time.

## Cost of a rename, measured

Small in code, not free in art.

- `lib/copy.ts:4`, the `brand` string. One line. It feeds all seven usages: the landing page, the
  host header on two screens, the page title, the PWA manifest name and short name, and the Apple
  web app title.
- `lib/calendar.ts:42`, the `PRODID` in the calendar file.
- Comments and docs: `app/manifest.ts:4`, `README.md:1`, `CLAUDE.md:1`, `docs/journeys.html:101`,
  `docs/design-brief.html:72`, and two files in `design/round1/`.
- The real cost: `public/icon-192.png`, `icon-512.png`, `icon-maskable-512.png` and
  `apple-touch-icon.png` are drawn as bunting flags. A new name means new icon art.

## What Marcia needs to check, on her phone

1. **Trade mark.** IP Australia's free TM Checker gives a plain answer in a minute:
   https://www.ipaustralia.gov.au/trade-marks/search-existing-trade-marks/tm-checker
   The full register is at https://search.ipaustralia.gov.au/trademarks
   Check classes 9 (software and mobile apps) and 42 (software as a service). Class 41 (organising
   events) is worth a look too.
2. **Domains.** Check `bunting.app`, `bunting.com.au` and `bunting.au` at any registrar, then the
   same three for Trestle. `.com.au` and `.au` both need Australian presence, which a Nativa Studio
   ABN satisfies.
3. **App stores.** Search the name in the App Store and Google Play. This is where Turnout was
   hiding and the web search nearly missed it.

Write the answers back into this file so the next session does not re-run the research.

## Sources

Turnout RSVP: https://play.google.com/store/apps/details?id=com.turnout.rsvp
Headcount uses: https://www.planningcenter.com/headcounts and https://www.charthop.com/modules/headcount-planning
Cooee uses: https://apps.apple.com/au/app/cooee-global-mobile-numbers/id6504507866
Wattle uses: https://au.linkedin.com/company/wattleev and https://tracxn.com/d/companies/wattle-software/__kkYEvwY2yx6nwEv42AgrvyAT9SNztN_TloEN7DuNe5E
Sprig: https://sprig.com/
Muster: https://www.getapp.com.au/software/128931/muster
Trestle uses: https://www.crunchbase.com/organization/trestle-54d3
Arvo, ruled out before the shortlist, already an events discovery app: https://apps.apple.com/gb/app/arvo/id6780616378

## The domain: where to buy, and which endings

Researched 19 September 2026. Prices are indicative, in AUD, and worth re-checking at the time.

### The rule that catches people

`.com.au` and `.net.au` are not open registrations. auDA's licensing rules require two things at
once:

1. **Australian presence.** A current ABN, ACN or ARBN, or an exact-match Australian trade mark.
   The Nativa Studio ABN covers this. Lose the ABN and the licence is suspended.
2. **A match or a synonym.** The domain must be identical to words in the registrant's legal name,
   business name or Australian trade mark, or a synonym for a good, service, event, activity or
   premises the registrant deals with.

"Bunting" is not part of "Nativa Studio", so the match does not come for free. The clean fix is to
register **Bunting as a business name with ASIC** under the Nativa Studio ABN before buying the
`.com.au`. That is a few minutes online and it also strengthens any later trade mark application.
A `.app` has none of these requirements.

### Which endings

| Ending | For | Against |
| --- | --- | --- |
| `.app` | HTTPS is mandatory across the whole TLD (Google Registry preloaded `.app` into the browser HSTS list, and it cannot be removed), so the link can never silently downgrade. Reads modern, short, no eligibility paperwork. Vercel issues the certificate automatically, so the requirement costs nothing. | Less familiar to a guest over 50 than `.com.au`. Needs testing that phones auto-link it in a text. |
| `.com.au` | The most trusted ending for an Australian audience, which matters when the link arrives from a number rather than from a brand. Signals an Australian business. | Needs the ABN and the match or synonym above. Longer. Around $20 to $25 a year at renewal. |
| `.au` | Shortest possible. | Same eligibility rules as `.com.au`, and still the least familiar of the three. Defensive hold only. |

### Where to buy

| Registrar | For | Against |
| --- | --- | --- |
| VentraIP | Australia's largest independent auDA accredited registrar. Bills in AUD, Melbourne support, and staff who actually know the auDA rules, which is the whole reason to use them for the `.au` endings. Renewal around $22.95, first year around $9.95. | Does not sell every generic ending. Australian endings are the reason to be here. |
| Cloudflare Registrar | Sells at cost with no markup and no renewal step-up, which over ten years is the cheapest path. Over 430 endings including `.app`. No upsell screens at all. | Requires the domain's DNS to sit on Cloudflare, which is one more system to learn. Australian endings do not appear on their supported list, so treat `.com.au` as unavailable there until checked. |
| Vercel | The site is already on Vercel, so buying the domain there makes the connection one step with no DNS records to copy across. Fewest moving parts. | A smaller list of endings, and no Australian endings. Also ties the domain to the host, which is worth avoiding for the name the business depends on. |
| Crazy Domains | Large, well known, cheap introductory pricing. | Aggressive upselling and a renewal step-up to around $24.50. More care needed at checkout than the others. |
| GoDaddy AU | auDA accredited, large, familiar. Renewal around $23.95. | Heavy upselling throughout checkout. |

### Registrars not to bother with

**Google Domains no longer exists.** Squarespace bought it in September 2023 and the migration
finished in mid-2024. Google Cloud Domains, the enterprise leftover, is deprecated and redirects
new registrations to Squarespace. Google does still operate the `.app` registry wholesale, which is
where the mandatory HTTPS rule comes from, but `.app` is bought from a retail registrar.

**Squarespace Domains** is the successor and it is skippable here: no Australian endings, pricier
than Cloudflare at renewal, and it pushes Squarespace hosting the app does not need.

### The plan

1. Register **Bunting** as a business name with ASIC under the Nativa Studio ABN, so the `.com.au`
   match is clean and unarguable.
2. Buy **bunting.com.au at VentraIP**. They know the rules and they bill in AUD.
3. Buy **bunting.app** at Cloudflare Registrar for at-cost renewals, or at Vercel if fewer moving
   parts matters more than price.
4. Point the product at one of them and 301 the other to it. Do not run the app on two domains:
   every link already sent keeps working only if the old domain redirects forever.
5. Skip `bunting.au` unless it is cheap enough to hold defensively.

### Before committing, a one-minute test

The link's whole job is to be tapped in a text message. Send yourself two texts, one with
`bunting.app/i/abc` and one with `bunting.com.au/i/abc`, on both an iPhone and an Android. Check
that each one auto-links and is tappable. Whichever ending the phones treat better is the one the
product should use, whatever this table says. Write the result here.

### Sources

.com.au eligibility: https://www.auda.org.au/au-domain-names/au-rules-and-policies/au-domain-administration-rules-licensing-2/
Rule change explained: https://www.minterellison.com/articles/the-new-au-domain-licensing-rules-what-has-changed
.app and HSTS: https://en.wikipedia.org/wiki/.app_(top-level_domain) and https://hstspreload.org/
VentraIP .com.au: https://ventraip.com.au/domain-names/extensions/com-au/
Registrar pricing comparison: https://comkeyconsulting.com.au/best-domain-name-registrar-australia/
Cloudflare supported endings: https://developers.cloudflare.com/registrar/top-level-domains/
