-- The user_events RLS policy for shared events fails because its subquery on
-- family_accounts is also blocked by RLS for non-owners. A SECURITY DEFINER
-- function bypasses all intermediate RLS and directly returns the right rows.

create or replace function get_shared_events_for_user()
returns setof user_events
language sql
security definer
set search_path = public
as $$
  select distinct on (ue.id) ue.*
  from user_events ue
  join family_accounts fa on fa.owner_id = ue.user_id
  join family_members fm on fm.family_account_id = fa.id
  where fm.linked_user_id = (select id from user_profiles where auth_id = auth.uid())
    and fm.linked_user_id is not null
    and ue.family_visible = true
    and ue.deleted_at is null
  order by ue.id, ue.date;
$$;

grant execute on function get_shared_events_for_user() to authenticated;
