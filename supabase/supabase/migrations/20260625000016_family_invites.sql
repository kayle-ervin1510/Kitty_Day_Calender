-- Add linked_user_id to family_members so accepted invites tie a real account to a member row
alter table family_members
  add column if not exists linked_user_id uuid references user_profiles(id) on delete set null;

-- Linked members can read their own row (needed for join page and shared event fetch)
create policy "Linked members can read their own row"
  on family_members for select
  using (
    linked_user_id = (select id from user_profiles where auth_id = auth.uid())
  );

-- Linked family members can see family-visible events from the account owner
create policy "Family members see shared events"
  on user_events for select
  using (
    family_visible = true
    and deleted_at is null
    and user_id in (
      select fa.owner_id
      from family_accounts fa
      join family_members fm on fm.family_account_id = fa.id
      where fm.linked_user_id = (select id from user_profiles where auth_id = auth.uid())
        and fm.linked_user_id is not null
    )
  );

-- Invite tokens: one row per pending invite
create table if not exists family_invites (
  id                uuid primary key default gen_random_uuid(),
  family_account_id uuid references family_accounts(id) on delete cascade not null,
  family_member_id  uuid references family_members(id)  on delete cascade not null,
  invited_email     text not null,
  token             uuid unique not null default gen_random_uuid(),
  accepted_at       timestamptz,
  created_at        timestamptz default now()
);

alter table family_invites enable row level security;

-- Owners can create and read their own invites
create policy "Owners manage family invites"
  on family_invites for all
  using (
    family_account_id in (
      select id from family_accounts
      where owner_id = (select id from user_profiles where auth_id = auth.uid())
    )
  )
  with check (
    family_account_id in (
      select id from family_accounts
      where owner_id = (select id from user_profiles where auth_id = auth.uid())
    )
  );

-- Any authenticated user can read an invite by its token (token is an unguessable UUID)
create policy "Authenticated users can read invite by token"
  on family_invites for select
  to authenticated
  using (true);

-- Returns invite details for the join page (security definer so it can join across tables)
create or replace function get_invite_details(p_token uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite  family_invites%rowtype;
  v_owner   text;
  v_member  text;
begin
  select * into v_invite from family_invites where token = p_token;
  if not found then
    return json_build_object('found', false);
  end if;

  select coalesce(up.preferred_name, up.name) into v_owner
  from family_accounts fa
  join user_profiles up on up.id = fa.owner_id
  where fa.id = v_invite.family_account_id;

  select name into v_member
  from family_members where id = v_invite.family_member_id;

  return json_build_object(
    'found',        true,
    'accepted',     v_invite.accepted_at is not null,
    'ownerName',    v_owner,
    'memberName',   v_member,
    'invitedEmail', v_invite.invited_email
  );
end;
$$;

grant execute on function get_invite_details(uuid) to authenticated;

-- Atomically links the caller's account to the family member row and marks the invite accepted.
-- Security definer needed because the invitee does not own the family_members row.
create or replace function accept_family_invite(p_token uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite   family_invites%rowtype;
  v_user_id  uuid;
begin
  select id into v_user_id
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

  update family_members set linked_user_id = v_user_id where id = v_invite.family_member_id;
  update family_invites set accepted_at = now()          where id = v_invite.id;

  return json_build_object('success', true);
end;
$$;

grant execute on function accept_family_invite(uuid) to authenticated;
