-- Tighten accept_family_invite:
--   1. Block the owner from accepting their own invite.
--   2. If invited_email is set, require the accepting user's email to match.
create or replace function accept_family_invite(p_token uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite      family_invites%rowtype;
  v_user_id     uuid;
  v_user_email  text;
  v_owner_id    uuid;
begin
  select id, email into v_user_id, v_user_email
  from user_profiles where auth_id = auth.uid();

  if v_user_id is null then
    return json_build_object('success', false, 'error', 'Not authenticated.');
  end if;

  select * into v_invite from family_invites where token = p_token;
  if not found then
    return json_build_object('success', false, 'error', 'Invite not found.');
  end if;

  if v_invite.accepted_at is not null then
    return json_build_object('success', false, 'error', 'This invite has already been accepted.');
  end if;

  -- Block the family account owner from accepting their own invite
  select owner_id into v_owner_id
  from family_accounts where id = v_invite.family_account_id;

  if v_owner_id = v_user_id then
    return json_build_object('success', false, 'error', 'You cannot accept your own invite.');
  end if;

  -- If the invite was created with a specific email, enforce it
  if v_invite.invited_email is not null and lower(v_invite.invited_email) <> lower(v_user_email) then
    return json_build_object('success', false, 'error',
      'This invite was sent to a different email address. Please log in with the correct account.');
  end if;

  update family_members set linked_user_id = v_user_id where id = v_invite.family_member_id;
  update family_invites set accepted_at = now()          where id = v_invite.id;

  return json_build_object('success', true);
end;
$$;

grant execute on function accept_family_invite(uuid) to authenticated;

-- Also exclude the caller's own events from get_shared_events_for_user so that
-- a user who accidentally linked themselves doesn't see their events doubled.
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
    and ue.user_id <> (select id from user_profiles where auth_id = auth.uid())
    and ue.family_visible = true
    and ue.deleted_at is null
  order by ue.id, ue.date;
$$;

grant execute on function get_shared_events_for_user() to authenticated;
