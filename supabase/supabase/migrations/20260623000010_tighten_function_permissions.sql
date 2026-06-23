-- handle_new_user is only ever invoked by its DB trigger — not via RPC.
-- Revoke direct-call permissions so it can't be reached through the API.
revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;

-- get_email_by_username is only needed by unauthenticated users (username
-- login before a session exists). Authenticated users already have a session
-- and don't need to call this.
revoke execute on function public.get_email_by_username(text) from authenticated;
