# Setting up an event: a draft flow

Status: a draft for Marcia to mark up. Nothing here is built. Written 14 October 2026.

This is the open source version of Bunting: anybody arrives, signs in, and sets up their own
event. What the product is for, in one line: **recording who is coming, how many of them, whether
they are kids or adults, and what they cannot eat, plus the two things a party organises
together, a potluck and a group gift.**

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

## The six panels

These are the whole of what an event is. They are the spine of both the setup flow and the
Settings board, which is what makes the two the same thing rather than two things to keep in step.

| Panel | What it holds |
| --- | --- |
| **The event** | Kind of event, title, date, start, end, where, address |
| **The reply** | One number of people or kids and adults apart, names, dietary, allergies, accessibility, a question of your own |
| **Bring a plate** | On or off, how much you are asking for, the note |
| **Group gift** | On or off, what the present is, who is organising it, a target |
| **The invite** | The words: the line under the title, who it is from, the info booth, questions, the sign-off |
| **Who can see and run it** | The group link, co-hosts |

## Setting up: five steps and a finish

Each step is one panel. Nothing is saved until the end except the title, which is all that is
needed to make the event exist.

1. **What kind of event** Kids' party, birthday, get together, baby shower, memorial. It sets
   sensible answers for every step below, so a host who taps through gets a working event.
2. **When and where** Title, date, time, place.
3. **What you need to know from people** The reply panel. This is the product, so it is a step
   rather than a setting somebody has to go looking for: kids and adults apart or one number,
   dietary needs, allergies, accessibility, one question of your own.
4. **Anything you are sharing** Potluck on or off. Group gift on or off, and who is running it.
   Both default from step 1 and both are one tap to skip.
5. **Your invite** The words. The look is no longer a step: the open source version ships one
   template (see below), so there is nothing to choose.

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

## The open source version: one template

Only the illustrated strip, which is drawn by hand here: one ink on a tint of it, five inks, six
sets of doodles. Everything else in the gallery is somebody else's artwork and cannot ship.

What that costs: Marcia's own event is on Photo cards. A hidden design still draws for an event
already on it, so gabriel-4 keeps its look and its guests see no change, but it could not be
chosen again. The two Monsters designs and the lineup go the same way.

The upload route is untouched: a host who has their own artwork can still put a photo or a
finished invite on the cover. That is their artwork, not ours to ship, and it is the honest answer
to "can I have a picture on it".

## Open questions for Marcia

1. **Does the invite tab keep the on-or-off switch?** The same component either way, so it cannot
   drift. Keeping it means tapping a card can turn that part off without leaving the invite.
   Removing it means one place for switches and a line on the card pointing at Settings.
2. **Is the five-step flow the right length?** It can be four by folding "what you are sharing"
   into the reply step, or six by adding guests at the end.
3. **Should the Plan tab lose the setup fields entirely**, or keep them as windows the way the
   invite does?
4. **Is Settings still a separate tab**, or does the board move onto the Overview, which already
   shows three of the same settings as chips?
