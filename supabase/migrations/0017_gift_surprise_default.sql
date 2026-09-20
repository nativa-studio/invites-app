-- A surprise is a choice, not a default.
--
-- group_gift.surprise was created defaulting to true, from an early reading where a group gift
-- was assumed to be for the person whose party it is. That is often true and never automatic: a
-- gift for the birthday child is not a surprise from the parents organising it, and the switch
-- exists precisely so somebody decides.
--
-- The cost of getting this wrong is not cosmetic. Surprise withholds the contributions from the
-- hosts, so a host who switched a group gift on was told their own gift was being kept from them,
-- about a decision they had not made.
alter table public.group_gift alter column surprise set default false;

-- Rows that already carry the default rather than a decision. A gift with nobody organising it
-- has never had anybody open the page where the switch lives, so true on one of these can only
-- have come from the default above. A gift that does have an organiser is left exactly as it is:
-- that one might be a real choice, and quietly reversing somebody's surprise is worse than
-- leaving a switch in a state they can see and change.
update public.group_gift
   set surprise = false
 where surprise
   and organiser_guest_id is null
   and organiser_profile_id is null;
