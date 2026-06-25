-- 1. Add is_owner to get_invite_details so the frontend can warn the owner
--    not to accept their own invite.
create or replace function get_invite_details(p_token uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite   family_invites%rowtype;
  v_owner_id uuid;
  v_owner    text;
  v_member   text;
  v_caller   uuid;
begin
  select * into v_invite from family_invites where token = p_token;
  if not found then
    return json_build_object('found', false);
  end if;

  select fa.owner_id into v_owner_id
  from family_accounts fa
  where fa.id = v_invite.family_account_id;

  select coalesce(up.preferred_name, up.name) into v_owner
  from user_profiles up
  where up.id = v_owner_id;

  select name into v_member
  from family_members where id = v_invite.family_member_id;

  -- Detect if the caller is the owner (so the UI can warn them)
  select id into v_caller
  from user_profiles where auth_id = auth.uid();

  return json_build_object(
    'found',        true,
    'accepted',     v_invite.accepted_at is not null,
    'ownerName',    v_owner,
    'memberName',   v_member,
    'invitedEmail', v_invite.invited_email,
    'isOwner',      (v_caller = v_owner_id)
  );
end;
$$;

grant execute on function get_invite_details(uuid) to authenticated;

-- 2. Security-definer helper that removes a family member AND clears any
--    reverse link in the removed user's own family account (if one exists).
--    Caller must own the family account containing the member.
create or replace function remove_family_member_and_cleanup(p_member_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller_id     uuid;
  v_member        family_members%rowtype;
  v_fa            family_accounts%rowtype;
  v_linked_fa_id  uuid;
begin
  select id into v_caller_id
  from user_profiles where auth_id = auth.uid();

  -- Load the member row
  select * into v_member from family_members where id = p_member_id;
  if not found then
    return json_build_object('success', false, 'error', 'Member not found.');
  end if;

  -- Verify the caller owns the family account this member belongs to
  select * into v_fa from family_accounts where id = v_member.family_account_id;
  if v_fa.owner_id <> v_caller_id then
    return json_build_object('success', false, 'error', 'Not authorized.');
  end if;

  -- If this member was linked to a real account, clear the reverse link:
  -- find family_members rows in the linked user's own family account that
  -- point back to the current caller, and null out their linked_user_id.
  if v_member.linked_user_id is not null then
    select id into v_linked_fa_id
    from family_accounts where owner_id = v_member.linked_user_id;

    if v_linked_fa_id is not null then
      update family_members
      set linked_user_id = null
      where family_account_id = v_linked_fa_id
        and linked_user_id = v_caller_id;
    end if;
  end if;

  -- Delete the member row
  delete from family_members where id = p_member_id;

  return json_build_object('success', true);
end;
$$;

grant execute on function remove_family_member_and_cleanup(uuid) to authenticated;
