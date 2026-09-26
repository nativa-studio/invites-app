# Event artwork

Pictures a host supplies for their own event, not artwork the product ships.

`gabriel-lineup.png` is Marcia's own image for Gabriel's party, cropped to the band the
lineup layout uses. It sits here as a stand-in while uploads are wired to Supabase Storage.
Once a host can upload, `events.invite_image_path` points at their file in Storage and
nothing needs to live in the repo.

Nothing in this folder belongs in the gallery of artwork sets the app offers to every host.
Those must be original drawings.

There is no picker, and there must not be one. A design is drawn around its characters rather
than decorated with them, so the set belongs to the design and is read from `artworkFor` in
`lib/layouts.ts`. Marcia, on 26 September 2026, after a picker had existed for an afternoon: "I
do not want an option where the pikachu can be pulled in the monsters design. They are fixed
images per design, they should never change."

So nothing an event stores decides which characters it draws, and `events.invite_image_path` is
no longer read by anything. Leave it that way: an option here is not a feature, it is a Monsters
invite with a Pokemon poster on it.

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
