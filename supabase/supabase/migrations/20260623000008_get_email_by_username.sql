-- Public RPC: resolves a username to its email so the login page can call
-- signInWithPassword(email, password). Runs as postgres (security definer)
-- so it can read user_profiles without a session.
create or replace function public.get_email_by_username(p_username text)
returns text
language sql
security definer
set search_path = public
as $$
  select email from public.user_profiles where username = p_username limit 1;
$$;
