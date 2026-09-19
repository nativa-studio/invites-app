# Design brief, version 3: the build-state update

**For Claude Design. Read `docs/design-brief.html` (version 2) first.** Everything in it about the
market, the competitors, the design principles, the deliverables list and the wording pass still
stands. This document is the part version 2 could not contain, because it was written pre-build:
what actually exists now, what was decided while building it, where the build has gone against the
brief, and the specific things that are wrong and need a designer rather than a patch.

`docs/journeys.html` remains the source of truth for behaviour. Marcia is the source of truth for
everything.

---

## 1. Settled since version 2

**The name is Bunting.** Round one's working name won. The domain is `bunting.day`, chosen from
about ninety endings and recorded with its reasoning in `SETUP.md`. The name brainstorm deliverable
in version 2 is closed. No wordmark exists yet, and that is now the first identity deliverable
rather than one of several.

**The host app has no colour of its own.** Version 2's own correction held: white, greys, near
black type, the system typeface, and the only colour a host ever sees is the invite they are
making. It has survived a whole build and it is right. Do not undo it.

**The guest page has three faces and a per-event palette.** Lilita One for display, Patrick Hand SC
for the handwritten labels, Nunito for body. Two palettes exist in code, a poster one and a quiet
cream one. This is the part that most needs you.

**Editing happens by pointing.** A host taps the part of the invite they want to change and its
wording opens in a sheet. There is no settings form any more. This turned out to be the strongest
idea in the host app and it should shape how you design the rest of it.

**Sheets, not pages.** Everything secondary is a bottom sheet: the guest actions, the groups, the
invite sections, the numbers, the event's own status and delete. Version 2 asked for this and the
build went further than asked.

---

## 2. What exists

**Host, five tabs under one event header.** The header carries the title, the date and a status
badge that is also a button: tap it for draft or live, and for deleting the event.

| Tab | What is on it |
| --- | --- |
| **Invite** | The invite in a phone frame, with a two-way switch: *Change it* (tap any part to edit its wording) and *Preview* (the guest's invite, working, nothing counted). Invite sections opens a sheet to reorder the parts and switch them off. |
| **Guests** | A row of group chips that filters the whole screen, the head count, the food line, add one or paste a list, the groups sheet, then the guest list with a sent, opened, replied trail and per-guest actions. |
| **Message** | The message as it lands: the link preview card a chat app draws, the invite text and the reminder text. Tap any piece to change its wording. |
| **Potluck** | Whether you are asking, how much, what the invite says, and the list of dishes with who has claimed what. |
| **Design** | Kind of party, then the look, as squares you tap to open at phone size with a button that plays the envelope opening. |

**Guest, one link.** A sealed envelope with their name on it. Tap, it opens, the cards come out:
cover, the details with a clock and a pin, the order of the afternoon, good to know, the reply,
the questions block, the sign off. Yes or no in place, the optional questions, then a thank you
with calendar buttons. A bring a plate board appears under the thank you for anyone who said yes.
There is a group link for a chat, and a link per group.

**Two layouts are built:** *Stationery suite* (the envelope, cards tumbling out) and *The lineup*
(one page, artwork along the bottom). Version 2 asked for one skeleton in six illustration sets.
What exists is two skeletons and one bundled set.

---

## 3. Where the build has gone against version 2, and the rulings we need

### 3.1 There is an envelope, and it is the best thing in the product

Version 2 said the opening reveal should be anything **but** an envelope, because the envelope is
Paperless Post's signature. The build has one anyway: a red or cream envelope with the guest's
name on it, which opens on a tap, swings its flap back and lets the card slide out. It is the most
liked thing in the whole build and it is also the thing the animation work went into.

**We need you to rule on it.** Either it stays and you make it ours rather than theirs, or it goes
and you give us the reveal version 2 asked for. Sitting between the two is the worst outcome.

### 3.2 The illustration sets do not exist

One bundled set of characters is in there as a placeholder, and every event gets it whether it
suits them or not. The six monoline sets in five inks are still the largest unbuilt deliverable,
and nothing else in the product will feel finished until they land. The inks are named in code
(charcoal, olive, terracotta, cobalt, burgundy) and nothing drives them yet.

### 3.3 Uploads are not built

"Bring your own invite" is the first thing on version 2's list of what sets the product apart, and
it is not in the build. Design it anyway, and design it for a tall A5 and a square, because it is
the next thing after the sets.

### 3.4 There are five tabs

Version 2 did not anticipate a tabbed event. The number went six, then three, then five as
features landed. Five fit across a 390 px screen with 30 px to spare, which is not a margin. Tell
us whether five tabs is the right shape or whether something else should carry Potluck and Message.

---

## 4. The design debt, measured

These are real faults found while building, patched to be correct rather than designed. Each one
wants a proper answer in the token system.

**The palette has no ink role, and it broke contrast.** `--sky` is used as the page ground *and*
as the colour of small text: card labels, the clock and pin captions, the venue line, the guest's
own name in "Can Mia make it?". On the poster palette that is a blue on cream and reads fine. On
the quiet palette the ground **is** the sky, so every one of those words was cream on cream,
measured at **1.07 to 1**. It is patched by computing a readable ink at runtime, which is a
workaround, not a design. What we want from you is semantic roles: ground, paper, ink, quiet ink,
accent, ink-on-accent, with contrast guaranteed on every palette and every extracted upload hue.

**The same fault, twice.** "Tap to open" on the envelope was also cream on cream at 1.00 to 1. Two
instances of one missing idea.

**Two type systems meet at the preview.** The host app is system font and the invite is three
Google faces, and they sit inside each other on the Invite tab, in a phone frame. It currently
works because the frame is an obvious boundary. Confirm that, or give us the join.

**The event tile is a real miniature of the invite**, card in front of its open envelope, drawn
from the same components rather than a picture of them. It is on the events list and it is the only
place a host sees many invites at once. It has never been designed.

**The app icon reads as teeth.** Marcia's own words, from her home screen, and she is right. The
current icon is four identical triangles, evenly spaced, in a row across the middle of a pale
cream tile, with a heavy dark line above them that curves **up** at both ends. Every one of those
is a mouth cue: the even row is teeth, the line is a gum line, the upward curve is a smile, and
the cream is skin. The two that do the most damage are the even spacing and the upward curve.

Five attempts at a fix are in `docs/icon-candidates/`, rendered at 512 and at 60 px in
`sheet.png`, because the complaint is about how it reads from across a room. What they establish:
sagging the string instead of smiling it removes the mouth, breaking the even row removes the
teeth, and coming off the horizontal midline stops the tile having an empty half for an eye to
read a face into. The diagonal one survives 60 px best. None of them is a finished icon and they
are offered as a diagnosis rather than as a shortlist.

**Empty states are thin.** Version 2 asked for empty states that teach. What exists is a sentence.

**The yes moment exists and is ours to keep or change.** Saying yes throws fourteen bunting flags
up past the card and bounces the heading, about a second and a half, off entirely under reduced
motion. It also buzzes an Android phone. Version 2 asked for "one signature moment on the yes
tap"; this is a first attempt at it, not a considered one.

---

## 5. What we need, in order

1. **The wordmark and the identity direction.** One of version 2's three directions, decided,
   with the palette expressed as the semantic roles in section 4, the type pairing, and the
   button, chip and sheet system as it is actually used.
2. **The ruling on the envelope**, and the opening moment either way.
3. **The six illustration sets**, monoline, five inks. The single largest thing outstanding.
4. **The guest page in the new identity**, both looks, including the uploaded invite that does
   not exist yet.
5. **The host app**: the event header, the five tabs, the card and sheet system, the guest row
   with its trail, the event tile, and empty states that teach.
6. **The wording pass** over `lib/copy.ts`, which is the single file every default string lives
   in. It is a two column job: current and proposed.

---

## 6. Constraints that have hardened

Everything in version 2's constraints still holds. These have tightened in the build:

- **390 px is the canvas, and it is tight.** Five tabs, two buttons on a row, a long group name
  and a count. Several things in the build had to be restacked because two controls side by side
  left 150 px for the words. Design at 390 and check the long cases.
- **Australian English, and never an em dash.** Marcia reads them as AI written. Comma, full stop,
  colon or brackets.
- **Every string lives in `lib/copy.ts`.** Nothing is written inline in a component. Propose
  wording as a table against that file.
- **Reduced motion is honoured everywhere**, including turning off the phone buzz, because
  somebody who does not want the screen to move does not want the phone to shake either.
- **Information is placed by the moment it is needed**, not by topic. Deciding, replying, coming,
  on the day, after. This is the rule the build checks itself against before anything ships, and
  it is why the plate board only appears after a guest has said yes.

---

## 7. What has not changed

The product, who it is for, the competitors, the gap, the anti-trends, the design principles and
the example content in version 2 are all still current. So is the deliverables list, minus the
name shortlist, which is closed.
