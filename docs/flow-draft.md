# Setting up an event: a draft flow

Status: a draft for Marcia to mark up. Nothing here is built. Started 14 October 2026, revised the
same day after her notes on step one.

This is the open source version of Bunting: anybody arrives, signs in, and sets up their own
event.

**What it is for, in one line.** Recording who is coming, how many of them, whether they are kids
or adults, and what they cannot eat, plus the two things a party organises together, a potluck and
a group gift.

**Who it is for.** Somebody who has already made their invitation somewhere else, or who is not
making one at all and just wants to text people a link. The decoration is not the product. The
reply is. So the app has to be usable with no picture in it, and good with one.

## What is actually wrong today

The page count is not the problem. There are eleven routes under an event but six of them are
eleven-line redirects left behind when tabs were folded together, so a host only ever sees five
tabs: Overview, Invite, Guests, Plan, Settings.

The problem is that the same setting is editable from more than one of them.

| Setting | Invite tab | Plan tab | Settings | Overview |
| --- | --- | --- | --- | --- |
| Potluck on or off | the plate card's drawer | its own card | its own block | a chip, read only |
| How much to bring, the note | the plate card's drawer | its own card | the plate block's pencil | |
| Group gift on or off | the gifts drawer | the gift panel | its own block | a chip, read only |
| What the present is, the target | the gifts drawer | the gift panel | | |
| Who is organising it | the gifts drawer | the gift panel | | |
| Kids and adults separately | | | its own block | a chip, read only |

Three editors for the potluck. Three for the group gift. Each one written separately, so a change
to one is a change somebody has to remember to make three times. That is the inconsistency, and it
is also why a feature can look as though it has been removed when it has only moved.

## The principle

**One setting, one editor, as many windows as are useful.**

Not "one place". Editing the invite by tapping the thing you want to change is the best idea in
this app and it should stay. What must never happen again is a *second implementation* of the same
setting. A window onto one editor cannot drift; a copy of it always does.

So:

1. Every setting an event has is declared once, in one list, with one editor component.
2. A screen that offers a setting renders that component. It never writes its own.
3. No screen offers a setting that is not its business (see the split below).

## The second principle, which came out of step one

**A preset sets dials you can still see.**

Every step in the flow offers a couple of named starting points, and underneath them the actual
settings those starting points moved. Tap "Plain" and you can see that the picture is off, the
doodles are off and the envelope is off. Nothing is decided behind your back.

This is what was wrong with "What kind of event". It reads as a question about the feel of the
party, and it quietly sets fifteen switches a host never sees: how people are counted, whether
names are asked, dietary, allergies, accessibility, siblings, the gift stance, the potluck, the
reply button wording, and the look. Useful work, invisibly done, under a label that does not say
so.

## The six panels

These are the whole of what an event is. They are the spine of both the setup flow and the
Settings board, which is what makes the two the same thing rather than two things to keep in step.

| Panel | What it holds |
| --- | --- |
| **The event** | Title, date, start, end, where, address |
| **The reply** | How the numbers are counted, names, dietary, allergies, accessibility, a question of your own |
| **Bring a plate** | On or off, how much you are asking for, the note |
| **Group gift** | On or off, and everything else about it (see the list at the foot) |
| **The invite** | The look, and the words |
| **Who can run it** | Co-hosts |

## The look is three dials, not a gallery

The gallery goes. In its place, three settings:

| Dial | Answers |
| --- | --- |
| **Picture** | None, or your own |
| **Colour** | One ink from five, and the line doodles on or off |
| **Envelope** | Opens, or does not |

And two named starting points, which are the ones Marcia asked for:

- **Plain.** No picture, no doodles, no envelope. One ink, charcoal, on paper. The details, the
  reply, done. This works for a memorial, a work thing, a school thing and a fourth birthday, and
  it is the one that makes sense if all somebody wants is to text a link.
- **A bit of colour.** One ink of your choosing, the line doodles on, the envelope opens. This is
  the Illustrated strip exactly as it stands today.

Plus, whenever a host has one: **your own invitation**, uploaded, as the cover, with the envelope
opening onto it.

**Why that is one design and not three.** The Illustrated strip already carries one ink chosen
from five and a set of doodles chosen by theme. Plain is the strip with the doodles and the
envelope turned off. So this is one design with three dials, not a row of designs to keep in step,
which is the same rule as everything else in this document.

**What is not built.** The upload is not built. `look_mode` sits in the database with a default of
`artwork` and the only app code that mentions it is one line of migration JSON; there is no file
input anywhere in the app. The envelope has no switch either: every design opens one. So of the
three dials, colour exists, and picture and envelope are new.

## Setting up: five steps and a finish

Each step is one panel, with its presets on top and its dials underneath. Nothing is saved until
the end except the title, which is all that is needed to make the event exist.

1. **How it should look** Plain, or a bit of colour, or your own picture. First, because it is the
   part people enjoy, and because it is the only step where somebody is choosing rather than
   typing.
2. **When and where** Title, date, time, place.
3. **What you need to know from people** The reply panel. This is the product, so it is a step
   rather than a setting somebody has to go looking for: how the numbers are counted, dietary,
   allergies, accessibility, one question of your own. The old event-type question lives here now,
   as the preset row: Kids' party, Grown ups, Memorial, or Just the reply. Each one fills in the
   switches below, where they can be seen and changed.
4. **Anything you are sharing** Potluck on or off. Group gift on or off. Both one tap to skip.
5. **Your invite** The words: the line under the title, who it is from, the info booth, the
   sign-off.

**Then the finish screen**, which is not a step but the first screen of running the event: "Your
invite is ready. Add the people you are inviting." with the button on it.

Guests and sending are deliberately not steps. You make the invitation, then you address the
envelopes.

## Afterwards: the same six panels, unwalked

**Settings** is the board of blocks that already exists, one block per panel, each with its symbol,
its switch where it has one, and a pencil that opens the same editor the setup step used.

So setting up and changing your mind are the same six editors, met in two ways: walked in order
the first time, laid out on a board after that.

## Who edits what, so nothing is in two places

- **Settings** owns every switch and every fact about the event. Potluck on or off lives here and
  nowhere else.
- **The invite tab** owns the words. Tapping a card changes what that card says: its heading, its
  wording, its order. It shows the part's on-or-off switch too, because the same component is
  rendered there, not a second one.
- **The Plan tab** owns running the thing, and stops offering to set it up. The dishes people have
  claimed, what is still needed, the money in, who has chipped in, who to nudge. Its potluck
  settings card and the setup half of its gift panel are removed: those are Settings' and the
  invite's.
- **The Overview** stays read only. It is a dashboard.

That takes the potluck from three editors to two windows on one, and the group gift from three to
two.

## What goes, in the open source version

- **The gallery.** Photo cards, Fur bands, Staff file and the lineup are all somebody else's
  artwork and cannot ship. They are hidden, not deleted: a hidden design still draws for an event
  already saved on it, so gabriel-4 keeps its look and its guests see no change, but it could not
  be chosen again.
- **The group link.** Marcia's call, 14 October: we do not need it. One link per guest is the
  model. That removes `/e/[slug]`, the "Who's this from?" flow, the group-link switch and the
  per-group links.
- **"What kind of event" as a question of its own.** It survives as the preset row inside step 3,
  which is where its work actually lands.

## Marcia's list, noted 14 October, not built yet

1. **The group gift drawer holds everything.** Tapping the group gift card and then the pencil
   should open one window with every bit of organising a group gift in it. Nothing about the gift
   offered anywhere else.

2. **The group gift becomes display only, and someone else can run it.** Marcia, 17 October: she
   wants to be able to hand the gift to somebody else, and that person should not have to manage
   anything in the app. So the app stops being a ledger and becomes a notice:

   - what the present is, and the ideas
   - **Being organised by**, a line she types herself, in her own words. Her example: "his
     godmother. Please text her if you'd like to participate."
   - a number
   - a button that opens the guest's messages app with a line already in it, so chipping in is
     one tap and then a conversation between two people

   What that removes: the organiser's own page at `/i/[token]/organiser`, which exists so an
   organiser can sign in, fill in bank details and see who has paid, and is exactly the managing
   she does not want anybody to have to do. The host fills those fields in instead, in the one
   drawer, which is where the rest of the event is set up anyway.

   **How to chip in stays.** Marcia's word, 17 October: keep the PayID box and its copy button.
   So the drawer holds both routes and the invite draws whichever has been filled in. A PayID and
   no number gets the box. A number and an organiser line gets the text button. Both gets both.
   There is nothing to choose and no mode to be in: a host fills in what is true for their party.

   That is also why the copy button matters more than ever here. A PayID read off one screen and
   typed into a banking app is where a digit gets dropped, and a dropped digit is somebody else's
   money.

   The chip-in tick stays as it is unless Marcia says otherwise. It no longer has an organiser's
   page to be read on, but the host can see it, and it costs a guest one tap they do not have to
   take.

   One thing that needs a new column: the organiser is a guest row or a profile row today, and
   the invite shows their first name. "His godmother" is neither a name nor necessarily on the
   guest list, so this is a line of text she types, not a person she picks.
3. **Remove the group link.** See above.
4. **"Kids and adults" becomes "RSVP count"**, with a question rather than a label: how do you
   want to count the numbers? Four answers, where there are two today:
   - children and adults separately
   - just kids
   - just adults
   - everyone in one number

   The two new ones are a data change: `ask_party_mode` is `single` or `split` today, and this
   makes it four.

## Open questions

1. **Three tiles or two at step one?** Written above as three: Plain, A bit of colour, Your own
   picture. Marcia described two, Plain and custom, with the picture inside custom. Three shows
   the upload rather than burying it; two is a shorter screen.
2. **Does the invite tab keep the on-or-off switch?** The same component either way, so it cannot
   drift. Keeping it means tapping a card can turn that part off without leaving the invite.
3. **Should the Plan tab lose the setup fields entirely**, or keep them as windows the way the
   invite does?
4. **Is Settings still a separate tab**, or does the board move onto the Overview, which already
   shows three of the same settings as chips?
