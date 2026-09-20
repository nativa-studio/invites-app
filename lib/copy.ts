// Every default string a person reads, in one place. Mirrors the wording table on docs/journeys.html.
// Australian English. Never an em dash.
export const copy = {
  brand: "Bunting",
  landing: {
    title: "Event invites you text. RSVPs that sort themselves.",
    lede: "Make the invite, add your guests, and text each one a personal link from your own phone. They tap yes or no. You see who is coming.",
    google: "Continue with Google",
    signinError: "That sign-in did not go through. Please try again.",
  },
  // Somebody signed in who is not on the list while this is being built.
  notYet: {
    title: "Bunting is still being built",
    // One line for why they are here, then the same three paragraphs the invite carries under
    // "Ma is building this app". Somebody who lands on this page has tried to sign in, which
    // means they are interested enough to want the rest of it, and sending them away with an
    // apology and nothing else wasted the one moment they were asking.
    //
    // The paragraphs are not copied. They are read from about below, so the two places cannot
    // drift into saying different things about the same product.
    body: "Thanks for having a look. It is not open yet, so there is nothing here for you to sign in to.",
    hint: "If you were expecting to get in, or you want to help test it, tell Marcia which email address you used and she will add it.",
    back: "Back to the start",
  },
  app: {
    yourEvents: "Your events",
    newEvent: "New event",
    noEvents: "No events yet. Your first one takes about ten minutes.",
    signOut: "Sign out",
  },
  // The name stays, because being greeted by name is the whole point of a personal link, and the
  // tail matches what the group link says, so the two are the same invitation worded once.
  greeting: (name: string) => `Hi ${name}, you're invited`,
  greetingGroup: "You're invited",
  envelope: {
    open: "Tap to open",
    // On the group link the envelope has no name to carry, so it is addressed to whoever opened it.
    eyebrowBirthday: "Trainer wanted",
  },
  rsvp: {
    heading: "RSVP",
    question: (name: string) => `Can ${name} make it?`,
    questionGroup: "Can you make it?",
    // Above the buttons, and the reply by date moved below them. The date used to be the only
    // thing said before a guest chose, which is the host's deadline put to somebody who is not
    // certain yet, and it reads as a demand for a commitment they cannot give. So they close the
    // page meaning to come back. This says the opposite first: an answer now is useful even if it
    // is not final, and it is theirs to change. The deadline still matters, so it sits under the
    // buttons, which is where somebody who has decided not to answer today will read it.
    nudge: "Your answer helps us plan. Come back here and update it if your plans change.",
    // The date and nothing else. "so we can get the numbers right" was the reason for asking, and
    // the line above the buttons now carries the reason ("helps us plan"), so saying it again
    // underneath was the same sentence twice with the deadline buried in the middle of it.
    replyBy: (date: string) => `Please reply by ${date}.`,
    yes: "Yes, we're coming",
    no: "Sorry, can't make it",
    yesQuiet: "I'll be there",
    noQuiet: "I can't be there, but I'm thinking of you",
    yourName: "Your name",
    yourMobile: "Your mobile (optional, so we can text you the details)",
    change: "Change my answer",
    keep: "Keep it",
  },
  questions: {
    howMany: "How many of you?",
    children: "children",
    adults: "adults",
    names: "Who's coming?",
    namesHint: "First names are plenty. Everyone counts, little ones too.",
    // Two questions, not one. An allergy is a safety fact and a dietary requirement is a
    // preference or a practice, and the box that used to hold both said "Allergies or anything
    // else", which asks somebody to put an epipen and a preference for oat milk in one sentence.
    allergies: "Any allergies?",
    allergiesNote: "e.g. peanuts, carries an epipen",
    allergiesHint: "Food or contact, and how serious. This goes to the hosts, never onto a list other guests can see.",
    dietary: "Anything else about food?",
    dietaryNote: "Anything else, in your words",
    access: "Any access needs?",
    accessHint: "Step-free entry, a quiet corner, anything that helps. Only if it helps us. Skip if not.",
    note: "A note for the host (optional)",
    emergencyName: "Emergency contact name",
    emergencyPhone: "Emergency contact mobile",
    send: "Send my reply",
    skip: "Skip the rest",
  },
  thanks: {
    yesTitle: "See you there!",
    // One line, the same whatever the number. It used to open by reading the party size back,
    // which is the app confirming its own bookkeeping at the moment a guest has just said yes:
    // true, useful, and not the first thing to say to somebody who has just accepted.
    yesBody: () => "We are so happy you can make it.",
    noTitle: "Sorry you can't make it",
    noBody: (host: string) => `${host} will miss you. Thanks for letting us know.`,
    addToCalendar: "Add to calendar",
    google: "Google Calendar",
    apple: "Apple or Outlook",
    changed: "Reply updated",
  },
  // Bring a plate, as a guest reads it. The board is only ever seen by somebody who has said
  // yes, so none of this has to talk them into coming.
  plate: {
    heading: "Bring a plate",
    everyone: "It's a bring a plate afternoon. Claim something below, or add your own.",
    free: "Bring something for the table if you like. Claim an item below or add your own, so we don't end up with five pavlovas.",
    empty: "Nothing on the list yet. Add what you're bringing and everyone else can see it.",
    // No group headings. The rows say which is which themselves: yours is the filled one with
    // the stamp, and the rest carry the words that claim them.
    afterYes: "The list opens up once you have replied.",
    onTable: "What's covered:",
    allCovered: "Everything on the list has somebody bringing it. Add your own if you like.",
    nobody: "Nobody yet",
    claim: "I'll bring it",
    mine: "Yours",
    unclaim: "Put it back",
    // Taken, not who by. A guest deciding what to carry needs to know what is already covered;
    // a register of which neighbour brought what is the host's business and nobody else's.
    taken: "Someone's bringing this",
    addHeading: "Bringing something else?",
    addLabel: "What is it?",
    addPlaceholder: "Pavlova, garden salad, a bag of ice",
    addTags: "Is it free of anything? (optional)",
    add: "Add it to the list",
    // Counts, never names and never anybody's note. The same promise the host's screen makes.
    allergies: (parts: string) => `Please keep in mind: ${parts}.`,
    allergy: (n: number, chip: string) => `${n} ${n === 1 ? "guest needs" : "guests need"} ${chip}`,
    needsName: "Give it a name and it'll go on the list.",
    tooMany: "That's plenty from one household. Take something off the list first.",
    notComing: "Say yes on your invite first, and the list opens up.",
    wrongLink: "This link doesn't look right. Ask the host to send it again.",
    failed: "That didn't go through. Please try again.",
  },
  // The group gift, as guests and the organiser read it. No money moves through the app, so
  // every word here is about people paying each other, not about paying us.
  gift: {
    heading: "Group gift",
    // The organiser has not filled in their side yet, so there is nothing to ask anybody to do.
    afterYes: "How to chip in opens up once you have replied.",
    sorting: (who: string) => `${who} is sorting out the details. They'll be here soon.`,
    sortingNoName: "The details are being sorted. They'll be here soon.",
    running: (who: string, what: string) => `${who} is organising a group gift: ${what}.`,
    runningNoWhat: (who: string) => `${who} is organising a group gift.`,
    // Before the host has picked somebody to run it. Saying "Group gift" here put the heading
    // twice in a row, once as the label and once as the only sentence on the card.
    noOrganiser: (what: string) => `Everyone is going in together on a group gift: ${what}.`,
    noOrganiserNoWhat: "Everyone is going in together on a group gift.",
    suggested: (amount: string) => `${amount} is plenty, and less is fine.`,
    by: (date: string) => `Chip in by ${date}`,
    howTo: "How to chip in",
    reference: (ref: string, who: string) => `Put "${ref}" in the reference so ${who} knows it's you.`,
    referenceNoName: (ref: string) => `Put "${ref}" in the reference.`,
    update: "Latest",
    countNone: "Nobody has chipped in yet. Be the first.",
    count: (n: number) => (n === 1 ? "1 person has chipped in." : `${n} people have chipped in.`),
    tick: "I've chipped in",
    ticked: "You've chipped in. Thank you.",
    untick: "Actually, I haven't",
    amountLabel: "How much? (optional)",
    amountHint: "Only the organiser sees this, and you can leave it blank.",
    send: "Done",
    failed: "That didn't go through. Please try again.",
    wrongLink: "This link doesn't look right. Ask the host to send it again.",
    notAnswered: "Answer the invite first, and the gift details open up.",
  },
  // The organiser's own page. Their job is to be paid, to keep everyone posted, and to know who
  // still needs asking.
  organiser: {
    title: "The group gift",
    yours: (what: string) => `You're organising the group gift: ${what}.`,
    yoursNoWhat: "You're organising the group gift.",
    setup: "Your details",
    setupBlurb: "What guests need in order to send you money. Nothing here is shown until you fill in where it goes.",
    payLabel: "Where to send it",
    payHint: "PayID, bank details, or a link to a gift fund. Guests read this exactly as you type it.",
    refLabel: "What to put in the reference",
    refHint: "So you can tell who paid. A word is enough.",
    msgLabel: "A note for everyone",
    msgHint: "What you're buying, and anything else worth saying.",
    amountLabel: "Suggested amount",
    byLabel: "Chip in by",
    surprise: "Keep it a surprise from the hosts",
    surpriseHint: "On, the hosts cannot see who has chipped in or how much. Turn it off if the gift is not for them.",
    save: "Save",
    saved: "Saved.",
    updateHeading: "Tell everyone",
    updateLabel: "Latest update",
    updateHint: "One line, shown on everyone's invite. It replaces the last one.",
    post: "Post it",
    whoHeading: "Who has chipped in",
    total: (amount: string) => `${amount} so far`,
    totalOf: (amount: string, target: string) => `${amount} of ${target} so far`,
    noAmount: "didn't say",
    none: "Nobody yet.",
    waitingHeading: "Still to ask",
    allIn: "Everyone coming has chipped in.",
    nudge: "Text",
    nudgeWhatsapp: "WhatsApp",
    nudgeBody: (who: string, what: string, link: string) =>
      `Hi ${who}, we're putting in for ${what}. Everything you need is here: ${link}`,
    notYours: "This page belongs to whoever is organising the gift.",
  },
  // The one place Bunting speaks for itself. At the foot of every invite, shut, because a guest
  // opened this to read about a party and not about the app that drew it.
  about: {
    // Her friends are reading this, not customers. It said "About this app", which is what a
    // stranger's software says, and it hid the one fact that makes anybody curious: she made it.
    // So the line that shows while it is shut is the fact itself, in the voice the invite is
    // signed in, and the wording inside is first person for the same reason.
    summary: "Ma is building this app",
    // The second line of the shut summary. It was "Have a look", which says there is something
    // here without saying why anybody would want it. This says what she actually wants back.
    peek: "Feedback welcome",
    body: "Still a work in progress, and the hope is that it turns into something other families can use: anybody organising the everyday events and get-togethers.",
    what: "One place for the invite, the replies, the allergy information, the to do list, sharing the load with whoever else is organising, the potluck list and the group gift.",
    ask: "If you want to help me test it, put your hand up and I will be in touch before it launches.",
    up: "Sounds good",
    done: "Thanks. I will be in touch before it launches.",
    undo: "Actually, no thanks",
    failed: "That didn't go through. Please try again.",
    feedbackLabel: "Anything you would change?",
    feedbackPlaceholder: "What worked, what didn't, what you expected to happen",
    feedbackSend: "Send it to Ma",
    feedbackDone: "Thanks, that is really useful.",
    feedbackAgain: "Say something else",
  },

  sections: {
    details: "The details",
    day: "The day",
    afternoon: "The order of the afternoon",
    goodToKnow: "Info booth",
    plate: "Bring a plate",
    updates: "Updates",
    updatesBody: "Anything that changes shows here.",
    photos: "Photos",
    photosBody: "A photo for you after the party.",
    /* The parting reminder, beside Questions at the end. The long version of this lives in Good
       to know; this is the one a guest sees on their way out with a camera in their hand. */
    photosNoSocial: "Please no social media",
    photosAsk: "Please ask before posting",
    photosShare: "Share away",
    // The block at the end of the invite. It used to promise updates and photos, which is a
    // promise about later; a guest at the end of an invite wants to know who to ask.
    askHeading: "Questions",
    // Reads as part of the line now, not as a heading over it.
    askLabel: "Questions:",
    // The last thing on the invite. Plural because it is the hosts speaking, and "celebrating
    // with you" rather than "seeing you" because it is a party, not an appointment.
    signoffDefault: "We look forward to celebrating with you",
    askBody: (host: string) => `Text ${host}`,
    /* What a tap on the number starts the guest off with. They write the question; this says
       which party it is about, so a host running three at once knows before they read it. */
    askBodyNoName: "Text",
    askSmsBody: (title: string) => `Hi, about ${title}: `,
    openInMaps: "Open in Maps",
    when: "When",
    where: "Where",
    wear: "Wear",
    questions: (host: string) => `Questions? Text ${host}`,
  },
  lines: {
    siblingsNo: "We're keeping it to invited kids only. Sorry, siblings!",
    siblings: "Siblings welcome, just include them in your numbers.",
    giftsNone: "No gifts please, your company is the present.",
    giftsOptional: "Gifts are entirely optional.",
    giftsBooks: "Books only please, we're building a little library.",
    giftsWishlist: "There's a wish list if you'd like one:",
    // The group gift, said in Good to know, where a guest still deciding meets it.
    //
    // It is joined onto whatever the host wrote about gifts rather than added under it. Two
    // paragraphs, one saying no gifts and the next asking for money, read as the invite
    // contradicting itself.
    //
    // Where to look is passed in, because it depends on whether the gift has a block on the
    // invite at all. With no block the line is the whole of what a guest gets.
    // Four whole sentences rather than one with a swappable tail. The tail version produced
    // "there's a group gift, and ask the host and they'll let you know", which is two clauses
    // wearing one conjunction. Where a guest should look is a different sentence, not a phrase.
    groupGift: (block: boolean) => block
      ? "We're doing a group gift this year, and the details are with your reply."
      : "We're doing a group gift this year. Ask the host and they'll let you know how to join in.",
    photosKidsOff: "We'd love you to take photos, just please keep photos of the kids off social media. Thank you!",
    photosAsk: "Snap away, and please check with people before posting them online.",
    photosShare: "Take all the photos you like and share them with us after.",
    plateFree: "Bring something for the table if you feel inspired. No pressure at all.",
    plateEveryone: "It's a bring a plate afternoon, so please bring something for the table.",
  },
  host: {
    blockOff: "Not on the invite. Guests only see the line in the info booth. Tap to put the block back.",
    previewPlate: "Guests claim a dish here once they have said yes.",
    previewGift: "Guests read how to chip in here once they have answered. The bank details come from whoever is organising it.",
    previewReply: "Tap to change what this asks, including the reply by date. To answer it the way a guest does, switch to Preview.",
    modeLabel: "How to look at your invite",
    modeEdit: "Change it",
    modeGuest: "Preview",
    modeEditHint: "Tap any part of the invite to change it.",
    modeGuestHint: "Your guests' invite, working. Open the envelope, press yes, answer the questions, read the thank you. Nothing you do here is saved and nobody is counted.",
    modeAgain: "Start again",
    tryAsGuest: "Preview",
    backToEditing: "Change it",
    tryWho: "you",
    partyTypeHeading: "Kind of party",
    partyTypeBlurb: "It decides which designs are offered first, and it set the reply's questions when you started. Changing it now only changes what is offered: every setting you have touched stays as you left it.",
    designHeading: "Design",
    designChosen: "Chosen",
    designSaved: (name: string) => `Guests see ${name}.`,
    designUnsaved: (name: string) => `Guests still see ${name}. Save to change it.`,
    designShowRest: (n: number) => (n === 1 ? "Show the other design" : `Show the other ${n} designs`),
    designRestHint: "The ones below the line suit a different kind of party. Nothing stops you using one.",
    designPlay: "Play the opening",
    designPlayHint: "The envelope opens once when the preview loads. Play runs it again.",
    designUse: "Use this design",
    designAlready: "This is the one you have.",
    designInstead: (name: string) => `You have ${name} at the moment.`,
    designFrameTitle: (name: string) => `${name}, as a guest sees it`,
    newEventNext: "Your invite exists. Pick how it looks, then fill in the details and add your guests.",
    previewHint: "Exactly what a guest opens, on their phone. Nothing you tap here is counted.",
    openFull: "Open full size",
    // The illustrated strip's own two choices, shown only when it is the design in use.
    stripHeading: "Pictures and ink",
    stripHint: "The three drawings at the top of the invite, and the one colour everything is drawn in.",
    stripSetLabel: "Pictures",
    stripInkLabel: "Ink",
    // The shopping list. Called shopping, not "checklist" or "to do": a host opens this standing
    // in a supermarket, and the words on it should be the words they would use there.
    shopHeading: "Shopping list",
    shopBlurb: "What still has to be bought. Only you and your co-hosts can see this, never guests.",
    shopNone: "Nothing on the list yet. Add the first thing you need.",
    shopAdd: "Add",
    shopWhat: "What to buy",
    shopWhatPlaceholder: "Ice",
    shopHowMuch: "How much",
    shopHowMuchHint: "However you would write it on a scrap of paper: 2 kg, a dozen, enough for 30.",
    shopGot: (got: number, total: number) => `${got} of ${total} in the trolley`,
    shopAllGot: "Everything on the list is bought.",
    shopGotBy: (who: string) => `${who} got it`,
    shopClear: "Clear what is bought",
    shopClearHint: "Takes the ticked lines off the list. The rest stay.",
    shopEdit: "Change it",
    shopRemove: "Take it off",
    shopTick: "In the trolley",
    // Said on the Potluck tab, because the two lists are easy to confuse and the difference
    // matters: one is what you buy, the other is what guests carry.
    shopNotPotluck: "Guests never see this list. What they are bringing is on Potluck.",
    sectionsHeading: "What the invite shows",
    sectionsHint: "A section with nothing in it stays hidden anyway. These are for leaving one out on purpose.",
    savedTitle: "Saved.",
    savedBody: "Your guests' links show the change straight away.",
    savedWithout: (cols: string[]) => `${cols.length === 1 ? "One setting" : `${cols.length} settings`} did not save: the database does not have ${cols.length === 1 ? "a column" : "columns"} called ${cols.join(", ")} yet, so it needs the newest migration run against it. Everything else is saved.`,
    backToParty: "Back to the party",
    allergies: "Allergies:",
    // Tracking: the numbers, then the two things somebody has to read before they cook, then
    // everything that has happened.
    trackHeading: "Where it is up to",
    trackComing: "Coming",
    // The split, wherever a total is shown. Only worth printing when the event asked for it and
    // somebody answered: an event that asks for one number has no kids and no adults, only people,
    // and "0 kids, 26 adults" would be a fact the host never asked anybody for.
    split: (kids: number, adults: number) => [
      kids > 0 ? `${kids} ${kids === 1 ? "kid" : "kids"}` : null,
      adults > 0 ? `${adults} ${adults === 1 ? "adult" : "adults"}` : null,
    ].filter(Boolean).join(", "),
    trackWaiting: "Still to reply",
    trackNo: "Not coming",
    trackAsked: "Asked",
    trackSent: "Links sent",
    trackOpened: "Opened theirs",
    trackNobody: "Nobody has replied yet. The numbers fill in as they do.",
    trackAllergies: "Allergies",
    trackAllergiesBlurb: "In their words, from the people coming. Never shown to other guests.",
    trackNoAllergies: "Nobody coming has told you about an allergy.",
    trackDietary: "Food needs",
    trackDietaryBlurb: "What the kitchen is working around, from the people coming.",
    trackNoDietary: "Nobody coming has asked for anything.",
    trackActivity: "Activity",
    trackActivityOpen: "See what's happened",
    trackActivityBlurb: "Newest first. Replies keep their history, so somebody who changed their mind appears twice.",
    trackActivityNone: "Nothing yet. This fills up once the links go out.",
    // One line each, and the guest's name is put in by the caller.
    did: {
      yes: (who: string) => `${who} said yes`,
      no: (who: string) => `${who} can't come`,
      joined: (who: string) => `${who} came in via the group link`,
      calendar: (who: string) => `${who} tapped Add to calendar`,
      token: (who: string) => `${who} got a new link`,
      sent: (who: string) => `You sent ${who} their link`,
      opened: (who: string) => `${who} opened their invite`,
      reminded: (who: string) => `You reminded ${who}`,
    },
    food: (parts: string) => `Food: ${parts}.`,
    foodNotes: "Some notes too, see the guest list.",
    coming: "coming",
    noReply: "no reply",
    opened: "opened it",
    addGuest: "Add a guest",
    addOne: "One at a time",
    addMany: "Paste a list",
    pasteLabel: "One guest per line",
    pasteHint: "Name and mobile on the same line, in any order. Copy straight from a note or a spreadsheet. Add how many you expect with 2a 2k, or 2 adults 2 kids. Guests with no mobile still get a link you can share by hand.",
    pasteExample: "Priya Nair 0400 111 222 2a 2k\nThe Nguyens, 0400 222 333, 2 adults 3 kids\nSam from swimming 1a",
    addAll: "Add them all",
    pickContacts: "Pick from contacts",
    noContactsApi: "Your phone does not let a website read contacts. Paste a list instead, or type them in.",
    name: "Who the invite is for (the child, e.g. Oliver, or The Nairs)",
    contactName: "Whose phone you're texting (e.g. their mum, Priya)",
    group: "Group (optional)",
    groupHint: "How you know them: family, school, work. Guests can be filtered and texted a group at a time, and guests never see it.",
    phone: "Mobile",
    expected: "How many you expect (optional)",
    expectedHint: "Only a guess, so their reply is one tap. They can change it.",
    expectedChildren: "Children",
    expectedAdults: "Adults",
    // Adults first, kids second, and no sentence around them. A host scanning fifty rows is
    // reading two numbers, and "expecting 1 child and 2 adults" makes them read eight words to
    // find them. The dot is the separator every other pair on that row already uses.
    expecting: (children: number | null, adults: number | null) => {
      const parts = [
        adults ? `${adults} ${adults === 1 ? "adult" : "adults"}` : null,
        children ? `${children} ${children === 1 ? "kid" : "kids"}` : null,
      ].filter(Boolean);
      return parts.join(" \u00b7 ");
    },
    add: "Add",
    text: "Text",
    textPick: "Text, pick in Messages",
    whatsapp: "WhatsApp",
    share: "Share",
    copy: "Copy link",
    copied: "Copied",
    notSent: "Not sent",
    shareMore: "Other apps",
    shareClose: "Close",
    sendNext: "Send next",
    allSent: "Everyone has been sent their link.",
    groupLink: "Group link for chats",
    groupLinkSwitch: "Group link open, anyone with it can reply",
    groupLinkHint: "Anyone can open it and reply on the spot. They put their name in as they answer.",
    groupLinks: "A group that is not on your list yet",
    groupLinksHint: "Name the chat you're about to paste into and you'll get a link of its own. Everyone who replies through it lands in your list already marked, so you know where they're from without asking.",
    groupLinkName: "Which chat is this for? (optional)",
    groupLinkNameHint: "School, Family, The neighbours",
    groupLinkPlain: "Everyone, no group",
    groupsHeading: "Groups",
    groupsBlurb: "Who's in each one and who has replied. Guests never see any of this.",
    groupsOpen: "See them",
    groupsSummary: (groups: number, loose: number) => {
      const g = `${groups} ${groups === 1 ? "group" : "groups"}`;
      return loose ? `${g}, and ${loose} ${loose === 1 ? "guest" : "guests"} in none of them.` : `${g}. Everyone is in one.`;
    },
    groupsEmpty: "No groups yet. Add a guest with a group, or hand out a group link, and they show up here.",
    groupsNone: "No group",
    groupsNoneHint: ", added before you started using groups or through the plain link",
    change: "Change",
    knowOrderHeading: "The order they come in",
    knowOrderHint: "Drag a line by its handle, or focus one and use the arrow keys.",
    sendInvite: "The invite",
    copyMessage: "Copy message",
    answerHeading: "Where are they up to?",
    answerBlurb: "For when somebody tells you in person, or you want to start them again.",
    answerYes: "Coming",
    answerYesWhy: "Counts them in. The trail will say you marked it, not them.",
    answerNo: "Not coming",
    answerNoWhy: "Counts them out, and stops them being reminded.",
    answerSent: "I've sent it myself",
    answerSentWhy: "For a guest you texted from your own Messages, or told in person. Marks it as sent so they drop off the not sent list. Their answer is left exactly as it is.",
    answerPending: "Still waiting on them",
    answerPendingWhy: "Clears the answer. Keeps the record of what you sent.",
    answerUnsent: "Back to not sent",
    answerUnsentWhy: "Clears the answer and the whole trail, as if you had just added them. Their link keeps working.",
    sendReminder: "A reminder",
    messagesHeading: "Messages",
    messagesBlurb: "How your message lands, with a real name and a link that works in it. Tap any part to change the wording. The picture is made from your invite, so it is not editable.",
    basicsHeading: "The basics",
    basicsBlurb: "What it is called, who it is from, and when.",
    placeHeading: "The place",
    placeBlurb: "Where it is, how to get in, and how to reach you. Getting in is shown only to people who have said yes.",
    knowHeading: "Info booth",
    knowBlurb: "The things somebody needs once they have decided to come.",
    groupLinkBlurb: "Closing it stops the link working for anyone who has it. Personal links keep working either way.",
    groupLinkOpen: "Open, anyone with the link can reply",
    groupLinkClosed: "Closed, it shows the closed wording and a button to text you",
    rsvpByHeading: "Replies by",
    rsvpByBlurb: "The date the invite asks people to reply by. Leave it empty and the invite does not mention one.",
    asksHeading: "What the reply asks",
    asksBlurb: "Only what you will actually use. Every extra question is one more reason to close the page and come back to it later.",
    buttonsHeading: "The two buttons",
    buttonsBlurb: "What yes and no say on the invite. Handy for a send-off or a wake, where \u201cYes, count me in\u201d is the wrong note.",
    rsvpNobodyYet: "Nobody has replied yet. Set the questions up here before the links go out, because a guest who has already replied does not see new ones.",
    notSet: "Not set",
    notSavedYet: "Not saved yet",
    guestGroup: "Group",
    guestGroupNone: "No group",
    guestGroupNew: "New group...",
    guestGroupAsk: "What do you call this group?",
    guestGroupEg: "Family, School, The neighbours.",
    guestGroupNewTitle: "New group",
    guestGroupFor: (name: string) => `${name} goes in it, and you can put others in it after.`,
    guestGroupSave: "Save",
    headsHeading: "How many",
    headsOpen: "The numbers",
    headsBlurb: "Two counts that will not agree until everyone has replied. What you pencilled in when you added each household, and what your guests have actually said.",
    headsExpected: "From your guest list",
    headsExpectedShort: "Guest list",
    headsRepliedShort: "Replies",
    headsReplied: "From the replies",
    headsKids: "kids",
    headsAdults: "adults",
    headsAll: "people",
    headsExpectedHint: (from: number, all: number) =>
      all === 0
        ? "No guests yet."
        : from === 0
          ? `Nothing pencilled in yet. Open a guest and put their numbers in, and this is what you are catering for before anyone replies.`
          : `Pencilled in for ${from} of ${all} ${all === 1 ? "household" : "households"}.`,
    headsRepliedHint: (from: number, waiting: number) =>
      from === 0
        ? "Nobody has said yes yet."
        : `${from} ${from === 1 ? "household has" : "households have"} said yes${waiting ? `, ${waiting} still to reply` : ""}.`,
    headsNoSplit: "Kids and adults are not counted separately because the reply asks for one number. Change that under RSVP.",
    statusHeading: "This event",
    statusOpen: (name: string) => `${name}. Change it, or delete this event.`,
    partsOpen: "Invite sections",
    filterHeading: "Which group",
    filterEveryone: "Everyone",
    filterNoGroup: "No group",
    searchLabel: "Find a guest",
    searchPlaceholder: "Search by name",
    searchClear: "Clear",
    searchNone: (typed: string) => `Nobody here matches "${typed}".`,
    searchElsewhere: (n: number, where: string) =>
      `${n === 1 ? "1 match" : `${n} matches`} in ${where}.`,
    filterShowing: (name: string) => `Showing ${name}. The numbers, the food line and the list below are all for this group.`,
    giftHeading: "Group gift",
    giftBlurb: "One present from everyone, organised by one person. No money goes through this app: the organiser says where to send it and guests pay them directly.",
    giftOn: "Running a group gift",
    giftOff: "Not running one",
    giftSwitch: "Run a group gift",
    giftNoteFree: "Exactly what the invite says about gifts, in your words. Leave it empty to say nothing at all.",
    drinksNoteFree: "Whatever you want to say about drinks. Bring your own, what is provided, what there is for the children. Leave it empty and the invite says nothing about drinks at all.",
    photosNoteFree: "Exactly what the invite says about photos, in your words. Leave it empty to say nothing at all.",
    giftAlongside: "Turns the feature on. It does not change the wording above: what you write there is what the invite says. Leave that box empty and the invite mentions the group gift for you. The rest of running it is on the Gift tab.",
    giftWhat: "What is it?",
    giftWhatHint: "What guests read on their invite. A blue scooter, a voucher for the nursery, a night away.",
    giftTarget: "Worth aiming for (optional)",
    giftTargetHint: "Only the organiser sees this. It is a target, not a bill.",
    giftOrganiser: "Who is organising it",
    giftOrganiserHint: "A guest who has said yes. They get a page of their own for the bank details, the note and the updates.",
    giftOrganiserNone: "Nobody yet",
    giftOrganiserMe: "Me",
    giftOrganiserHintMe: "You are running it, so the bank details and the updates are below.",
    giftYours: "Your details",
    giftYoursBlurb: "What guests need in order to send you money. Nothing here shows on the invite until you fill in where it goes.",
    giftPay: "Where to send it",
    giftPayHint: "PayID, bank details, or a link to a gift fund. Guests read this exactly as you type it.",
    giftRef: "What to put in the reference",
    giftRefHint: "So you can tell who paid. A word is enough.",
    giftNote: "A note for everyone",
    giftNoteHint: "What you're buying, and anything else worth saying.",
    giftSuggested: "Suggested amount",
    giftBy: "Chip in by",
    giftSurprise: "Keep it a surprise from the other hosts",
    giftSurpriseHint: "On, your co-hosts cannot see who has chipped in or how much. Leave it off if the gift is not for one of them.",
    giftTellHeading: "Tell everyone",
    giftUpdate: "Latest update",
    giftUpdateHint: "One line, shown on everyone's invite. It replaces the last one.",
    giftPostIt: "Post it",
    giftWhoHeading: "Who has chipped in",
    giftNoAmount: "didn't say",
    giftStillToAsk: "Still to ask",
    giftAllIn: "Everyone coming has chipped in.",
    giftNudge: (who: string, what: string, link: string) =>
      `Hi ${who}, we're putting in for ${what}. Everything you need is here: ${link}`,
    giftPickFirst: "Pick somebody once a guest has said yes. Until then there is nobody to hand it to.",
    giftHandover: "Their link",
    giftHandoverHint: "Send them this. It opens their organiser page, and only their link opens it.",
    giftHandoverBody: (who: string, what: string, link: string) =>
      `Hi ${who}, would you organise the group gift for ${what}? Everything you need is here: ${link}`,
    giftText: "Text them",
    giftWhatsapp: "WhatsApp",
    giftCopy: "Copy the message",
    giftHow: "How it is going",
    giftSoFar: (amount: string, n: number) => `${amount} from ${n === 1 ? "1 person" : `${n} people`}.`,
    giftNobody: "Nobody has chipped in yet.",
    giftHidden: "Hidden from you, because whoever is organising it has set it as a surprise.",
    giftWaitingSetup: (who: string) => `${who} has not filled in their details yet, so the invite tells guests it is being sorted.`,
    giftSave: "Save",
    potluckHeading: "Potluck",
    potluckList: "The list",
    potluckBlurb: "Whether you're asking guests to bring something, and what the invite says about it. The list itself is below.",
    potluckOn: "Asking guests to bring something",
    potluckOff: "Not asking",
    potluckHowMuch: "How much",
    potluckSwitch: "Ask guests to bring something",
    potluckMode: "How much you're asking",
    potluckModeHint: "It sets the default wording, and it is what the list says at the top when a guest opens it.",
    potluckNote: "What the invite says",
    potluckNoteHint: "Empty uses the wording for the setting above. Guests read this while they are deciding, so keep it to what is being asked.",
    plateElsewhere: "On or off, how much you're asking and the wording are all on the Potluck tab, with the list. This row is here so you can move the line up and down the invite.",
    plateAsk: "Ask for something",
    plateAskBlurb: "It goes on the list with nobody against it, so a guest can claim it. Guests add their own the same way, already carrying it.",
    plateAddIt: "Put it on the list",
    plateBlurb: (mode: string, total: number, unclaimed: number) => {
      const who = mode === "everyone" ? "Everyone is asked to bring something." : "Bringing something is optional.";
      if (total === 0) return `${who} Nothing on the list yet.`;
      const left = unclaimed === 0 ? "everything has somebody" : `${unclaimed} still with nobody`;
      return `${who} ${total} ${total === 1 ? "thing" : "things"} on the list, ${left}.`;
    },
    plateNote: (note: string) => `Your guests read: ${note}`,
    plateEmpty: "Ask for the things you actually need and guests can claim them. They can add their own too.",
    plateNobody: "Nobody yet",
    plateAsked: "You asked for this, nobody yet",
    // The two groups the board splits into. Which dish somebody is bringing was on every row and
    // is gone: a host running a table needs to know what is still missing, and the names made
    // every item two lines tall for a fact they only want when something goes wrong.
    plateBlock: "Also give it a card in the invite",
    plateBlockHint: "On, guests get a card under their reply where they claim a dish. Off, the invite only mentions it at the info booth and you collect it yourself.",
    giftBlock: "Also give it a card in the invite",
    giftBlockHint: "A card in the invite saying a group gift is happening, for guests who are still deciding. Off, the info booth line is the only mention. Either way, everyone who answers gets how to chip in after their reply.",
    plateClaimed: "Being brought",
    plateNeeded: "Still to be claimed",
    plateAllClaimed: "Every item has somebody bringing it.",
    plateNoneClaimed: "Nobody has claimed anything yet.",
    plateTapHint: "Tap any of them to rename it, free it up or take it off.",
    plateWhoIs: (who: string) => `${who} is bringing this.`,
    plateWho: "Who's bringing it",
    plateWhoHint: "Half a potluck gets answered in the group chat. Put it against their name here and their invite says they have it.",
    plateWhoNobody: "Nobody yet",
    plateRename: "Rename it",
    plateRenameBlurb: "Changes what it is called on everyone's list. Whoever is bringing it keeps it.",
    plateRenameSave: "Save the name",
    plateRemove: "Remove",
    statusBlurb: "A draft is yours alone to look at. Live means the links work and guests can reply. Nothing is sent either way: you send the links yourself, from Guests.",
    statusNames: { draft: "A draft", live: "Live", thanks: "Saying thanks", archived: "Archived" } as Record<string, string>,
    partsHeading: "Invite sections",
    partsBlurb: "Tap a name to change its words. Move them into the order you want, or switch one off. The cover always comes first.",
    partSwitch: (name: string) => `${name}, on the invite`,
    partsRepaired: "A part was missing from the saved order and has been put back where it belongs.",
    messageReminder: "And if they haven't replied",
    sampleGuest: "Gael",
    deleteHeading: "Delete this event",
    deleteBlurb: (guests: number, replies: number) =>
      guests === 0
        ? "Nothing is stored for it yet, so this just removes the event."
        : `This removes the event and everything with it: ${guests} ${guests === 1 ? "guest" : "guests"}, ${replies} ${replies === 1 ? "reply" : "replies"}, every personal link, every note about food and access, and any photos. It cannot be undone.`,
    deleteStart: "Delete event",
    deleteConfirmLabel: (title: string) => `Type ${title} to confirm`,
    deleteConfirm: "Delete it",
    deleting: "Deleting",
    deleteCancel: "Keep it",
    remind: "Remind",
    newLink: "New link",
    newLinkAsk: "Make a new link? The one you have already sent stops working.",
    newLinkWhy: "Only if the link went to the wrong person. It kills the one you already sent.",
    remove: "Remove",
    edit: "Edit",
    editGuestBlurb: "Their name, who you text about them, and how many you are expecting.",
    secondContact: "Someone else to text",
    secondContactHint: "A second parent, say. You pick which one when you send.",
    trail: {
      added: "added",
      sent: "sent",
      opened: "opened",
      replied: "replied",
      // When the host answered for them. The trail has to say which it was.
      markedYes: "you marked them as coming",
      markedNo: "you marked them as not coming",
      reminded: "reminded",
      // Not "added to calendar", which claims more than is known: a phone that previews the file
      // and is tapped away from looks exactly the same from here. The tap is the part that was
      // actually observed, so the tap is what it says.
      calendar: "tapped Add to calendar",
    },
  },
  templates: {
    text: "Hi {name}! You're invited to {title}{date}. Everything is here, and you can reply with one tap: {link}",
    reminder: "Hi {name}, just checking you saw this one. {title}{date}. Can you make it? {link}",
    seeYouSoon: "See you tomorrow! {address}. Everything you need: {link}",
    /* Where {name} goes on a group link, which is addressed to a chat rather than to a person. */
    groupGreeting: "everyone",
  },
  // The line the scroll cue says, for the layouts with no envelope.
  more: {
    label: "There's more below",
  },
  closed: {
    title: "This link is closed",
    body: "The host has closed the group link. Text them and they'll send you your own.",
  },
  notFound: {
    title: "That link doesn't look right",
    body: "Check the message it came in, or ask the host to send it again.",
  },
} as const;
