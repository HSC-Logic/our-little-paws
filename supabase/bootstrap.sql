-- Run as project administrator in the Supabase SQL editor, AFTER applying the migration.
-- Copy your UUID from Authentication > Users into first_user below.
-- Optionally replace NULL with your partner's quoted Auth UUID.
-- Keep first_user the same when rerunning later to add your partner.
-- Reuses the selected users' existing home and preserves existing data.
begin;
do $$
declare
  first_user uuid := 'FIRST_AUTH_USER_UUID';
  second_user uuid := NULL; -- Example: 'SECOND_AUTH_USER_UUID'
  first_name text := 'You';
  second_name text := 'Your person';
  home_id uuid;
  second_home uuid;
begin
  perform pg_advisory_xact_lock(hashtext('our-little-paws-bootstrap'));
  if first_user is null or not exists(select 1 from auth.users where id=first_user) then
    raise exception 'first_user must be the UUID of an existing invited Auth user';
  end if;
  if second_user is not null and (second_user=first_user or not exists(select 1 from auth.users where id=second_user)) then
    raise exception 'second_user must be a different invited Auth user, or NULL';
  end if;

  select household_id into home_id from public.household_members where user_id=first_user;
  if second_user is not null then
    select household_id into second_home from public.household_members where user_id=second_user;
  end if;
  if home_id is not null and second_home is not null and home_id<>second_home then
    raise exception 'These users already belong to different homes. No memberships were changed.';
  end if;
  home_id := coalesce(home_id,second_home);
  if home_id is null then
    insert into public.households(name) values('Our little home') returning id into home_id;
  end if;

  insert into public.profiles(id,display_name) values(first_user,first_name)
    on conflict(id) do nothing;
  insert into public.household_members(household_id,user_id)
    select home_id,first_user where not exists(select 1 from public.household_members where user_id=first_user)
    on conflict(user_id) do nothing;
  if second_user is not null then
    insert into public.profiles(id,display_name) values(second_user,second_name)
      on conflict(id) do nothing;
    insert into public.household_members(household_id,user_id)
    select home_id,second_user where not exists(select 1 from public.household_members where user_id=second_user)
      on conflict(user_id) do nothing;
  end if;

  insert into public.songs(household_id,track_key,title,position)
    select home_id,t.key,t.title,t.position from (values
      ('morning','A soft little morning',0),
      ('rain','Rain on our rooftop',1),
      ('moon','Under the same moon',2)
    ) as t(key,title,position)
    on conflict(household_id,track_key) do nothing;
  raise notice 'Household ready. Return to the app and choose Try again.';
end $$;
commit;
