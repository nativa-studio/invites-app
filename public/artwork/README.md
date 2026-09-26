# Event artwork

Pictures a host supplies for their own event, not artwork the product ships.

`gabriel-lineup.png` is Marcia's own image for Gabriel's party, cropped to the band the
lineup layout uses. It sits here as a stand-in while uploads are wired to Supabase Storage.
Once a host can upload, `events.invite_image_path` points at their file in Storage and
nothing needs to live in the repo.

Nothing in this folder belongs in the gallery of artwork sets the app offers to every host.
Those must be original drawings.

**One exception, on purpose.** The Look panel now has a Characters picker offering the two
bundled sets, `gabriel-lineup.png` and `monsters-pair.png`. Marcia asked for it by name on
26 September 2026, while she was building the design library: a design has to be lookable at in
the pictures it was drawn around, and both of the Monsters designs were drawn around the second
set. The rule above still stands for anything the product ships. When a gallery of the product's
own drawings lands, `ARTWORK_SETS` in `lib/artwork.ts` is the list it replaces, and these two go
back to being one event's artwork.

## gabriel-peek/

The seven characters cut out of Marcia's second wallpaper file, one PNG each, for the peek
layout. Same rule as above: this is Gabriel's event artwork, never gallery artwork the app
offers other hosts. The cast is bound to the artwork it came from in lib/peek-cast.ts, and any
other artwork gets the layout with no characters at all, which it is built to survive.

## gabriel-cover.jpg

Marcia's poster for Gabriel's party, kept whole. 1012 by 1934.

She sends these from her phone, so what arrives is a screenshot: the picture with the phone's
grey chrome down both sides and across the foot. Those bars are measured off rather than guessed
at (find the columns and rows that are flat #808080, take the box inside them, then check the
border of the result has no grey pixels left in it at all) and the crop is saved back over this
file as a quality 90 JPEG with no chroma subsampling, which keeps the flat colour and the navy
line work clean at about 300 KB. Update the numbers in lib/artwork.ts when the size changes: they
are the intrinsic size Next needs, and a wrong pair makes the cover the wrong shape.

The cover card frames it two by three and centres it, which lands on the mountain, the lake band,
the ear, the eye and the cheek. It replaced a version of this drawn from scratch in SVG, which was
not good enough and, worse, meant her own picture was nowhere on the invite. Same rule as the rest of this folder: event artwork,
never gallery artwork offered to another host.
