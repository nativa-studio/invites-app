# Event artwork

Pictures a host supplies for their own event, not artwork the product ships.

`gabriel-lineup.png` is Marcia's own image for Gabriel's party, cropped to the band the
lineup layout uses. It sits here as a stand-in while uploads are wired to Supabase Storage.
Once a host can upload, `events.invite_image_path` points at their file in Storage and
nothing needs to live in the repo.

Nothing in this folder belongs in the gallery of artwork sets the app offers to every host.
Those must be original drawings.

## gabriel-peek/

The seven characters cut out of Marcia's second wallpaper file, one PNG each, for the peek
layout. Same rule as above: this is Gabriel's event artwork, never gallery artwork the app
offers other hosts. The cast is bound to the artwork it came from in lib/peek-cast.ts, and any
other artwork gets the layout with no characters at all, which it is built to survive.

## gabriel-cover.jpg

Marcia's poster for Gabriel's party, kept whole. The cover card frames it two by three and
centres it, which lands on the mountain, the lake band, the ear, the eye and the cheek. It
replaced a version of this drawn from scratch in SVG, which was not good enough and, worse, meant
her own picture was nowhere on the invite. Same rule as the rest of this folder: event artwork,
never gallery artwork offered to another host.
