-- Gifts and photos become what the host wrote, not what they picked from a list.
--
-- Both were a dropdown of preset wordings plus, for gifts, an optional note tacked on the end.
-- The presets were a guess at what hosts want to say, and a host who wants to say something
-- close but not identical had no way to. A short free line says exactly the thing.
--
-- Nothing is dropped. gift_stance and photo_sharing stay as columns so no event loses anything,
-- and the backfill below turns whatever each host had picked into the words it was printing, so
-- an invite that said "Gifts are entirely optional" yesterday still says it today. A host who
-- had picked the silent option gets nothing, which is what silence was.
alter table public.events add column if not exists photos_note text;

update public.events set gift_note = case gift_stance
    when 'none' then 'No gifts please, your company is the present.'
    when 'optional' then 'Gifts are entirely optional.'
    when 'books' then 'Books only please, we''re building a little library.'
    else gift_note
  end
 where gift_note is null and gift_stance in ('none', 'optional', 'books');

-- The wish list already lived in the note, as the link, so its preset prefix is put in front of
-- what the host typed rather than replacing it.
update public.events set gift_note = 'There''s a wish list if you''d like one: ' || gift_note
 where gift_stance = 'wishlist' and gift_note is not null
   and gift_note not like 'There''s a wish list%';

update public.events set photos_note = case photo_sharing
    when 'kids_off_social' then 'We''d love you to take photos, just please keep photos of the kids off social media. Thank you!'
    when 'ask' then 'Snap away, and please check with people before posting them online.'
    when 'share' then 'Take all the photos you like and share them with us after.'
    else null
  end
 where photos_note is null;
