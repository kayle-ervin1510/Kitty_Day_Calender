-- Allow unauthenticated (anon) callers to invoke the username lookup RPC.
-- Without this the anon role gets a permission-denied error before the
-- function body even executes.
grant execute on function public.get_email_by_username(text) to anon;
