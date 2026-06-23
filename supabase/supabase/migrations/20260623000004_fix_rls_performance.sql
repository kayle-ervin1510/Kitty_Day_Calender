-- Fix RLS performance: wrap auth.uid() in a subquery so it is evaluated
-- once per query instead of once per row.

drop policy if exists "Users manage own profile" on user_profiles;

create policy "Users manage own profile"
  on user_profiles for all
  using  ((select auth.uid()) = auth_id)
  with check ((select auth.uid()) = auth_id);
