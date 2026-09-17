-- What the host expects, kept apart from what the guest actually replied.
-- A host often knows "the Nairs, two adults and two kids" when adding them. Those numbers
-- pre-fill the guest's steppers so a reply is one tap, and the dashboard can show the
-- difference between what was expected and what came back.
alter table public.guests
  add column if not exists expected_children int,
  add column if not exists expected_adults int;

-- Re-create the guest view so the invite can read the expected numbers.
create or replace function public.guest_public_json(g public.guests) returns jsonb language sql stable as $$
  select jsonb_build_object(
    'name', g.name, 'contact_name', g.contact_name, 'status', g.status, 'party_size', g.party_size, 'children', g.children, 'adults', g.adults,
    'expected_children', g.expected_children, 'expected_adults', g.expected_adults,
    'party_names', g.party_names, 'dietary', g.dietary, 'dietary_note', g.dietary_note, 'accessibility_note', g.accessibility_note,
    'custom_answer', g.custom_answer, 'note', g.note, 'emergency_name', g.emergency_name, 'emergency_phone', g.emergency_phone,
    'replied_at', g.replied_at, 'dropped_out_at', g.dropped_out_at, 'see_you_soon_sent_at', g.see_you_soon_sent_at,
    'thanks_sent_at', g.thanks_sent_at, 'thanks_photo_path', g.thanks_photo_path, 'source', g.source
  );
$$;
