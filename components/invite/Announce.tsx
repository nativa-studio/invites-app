// Nothing is announced before the reply any more.
//
// AnnouncePlate lived here: a card above the RSVP saying a potluck was happening, switched on by
// plate_block. It is gone, and it went for the same reason AnnounceGift went before it, reported
// the same number of times. Marcia, four times across one morning, the last in capitals: "bring a
// plate is currently showing twice before and after RSVP", "when I say yes it shows in both
// locations", "I still can see bring a plate in the invite before RSVP", "BRING A PLATE IS STILL
// SHOWING BEFORE RSVP IN THE LIVE INVITE".
//
// A switch was the wrong answer to that. It was on, so the card was doing its job, but a host who
// has asked four times for something not to be on their invitation does not want a setting for
// it: the plate belongs to the moment after somebody says yes, which is the moment they can
// actually do something about it, and that is the only place it is drawn now.
//
// AnnounceGift's note, kept because the reasoning is the same one: the gifts block announces the
// group gift, names the present and says how to chip in comes with the reply, so the card was the
// same news a screen earlier and a host looking for the block kept finding it instead.
//
// What a guest gets after saying yes is untouched in both cases: the plate board and GiftCard, on
// the answered page. A different moment and a different job.
//
// plate_block and gift_block are still columns, still sent to guests, and read by nothing. Left
// rather than dropped: a migration that removes a column cannot be undone by a revert, and these
// two cost nothing where they are.
export {};
