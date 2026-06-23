-- Trigger function that auto-creates a user_profiles row whenever a new
-- auth.users row is inserted. Runs as postgres (security definer) so it
-- bypasses RLS. Profile data is passed via auth.signUp options.data and
-- lands in raw_user_meta_data.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (
    auth_id,
    username,
    name,
    preferred_name,
    email,
    phone_number,
    timezone
  ) values (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'name',
    coalesce(new.raw_user_meta_data->>'preferred_name', split_part(new.raw_user_meta_data->>'name', ' ', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'phone_number', ''),
    coalesce(new.raw_user_meta_data->>'timezone', 'UTC')
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
